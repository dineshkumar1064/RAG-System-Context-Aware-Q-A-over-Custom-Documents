import { ChatGroq } from "@langchain/groq";

let model;

function getModel() {
  if (!model) {
    model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.2,
    });
  }
  return model;
}

const SYSTEM_PROMPT = `You are a helpful assistant answering questions about a specific uploaded document.

Rules:
- If the user greets you, makes small talk, or asks something conversational (e.g. "hello", "thanks", "what can you do"), respond naturally and briefly — you don't need the document context for that.
- If the user asks a factual question about the document's content, answer strictly using the provided context below. Do not use outside knowledge.
- If a factual question can't be answered from the context, say "I couldn't find that in the document."
- Be concise and cite the relevant part of the context in your own words. Do not make up information that isn't in the context.`;
/**
 * Generates an answer grounded in the given context chunks.
 * @param {string} question
 * @param {{text: string}[]} contextChunks
 * @param {{role: 'user'|'assistant', content: string}[]} history
 */
export async function answerQuestion(question, contextChunks, history = []) {
  const context = contextChunks
    .map((c, i) => `[Excerpt ${i + 1}]\n${c.text}`)
    .join("\n\n");

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-6).map((h) => ({ role: h.role, content: h.content })),
    {
      role: "user",
      content: `Context from the document:\n\n${context}\n\nQuestion: ${question}`,
    },
  ];

  const llm = getModel();
  const response = await llm.invoke(messages);
  return response.content;
}
