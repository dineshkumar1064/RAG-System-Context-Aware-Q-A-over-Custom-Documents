import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

/**
 * Splits raw text into overlapping chunks suitable for embedding.
 * @param {string} text
 * @returns {Promise<string[]>}
 */
export async function splitText(text) {
  const cleaned = text.replace(/\s+\n/g, "\n").replace(/[ \t]+/g, " ").trim();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
    separators: ["\n\n", "\n", ". ", " ", ""],
  });

  const chunks = await splitter.splitText(cleaned);
  return chunks.filter((c) => c.trim().length > 20);
}
