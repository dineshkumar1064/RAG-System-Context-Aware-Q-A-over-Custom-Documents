import Chunk from "../models/Chunk.js";
import { embedQuery } from "./embeddings.js";
import { bm25Scores } from "../utils/bm25.js";

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function normalize(scores) {
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  if (max === min) return scores.map(() => 0);
  return scores.map((s) => (s - min) / (max - min));
}

/**
 * Hybrid (vector + keyword) search over all chunks of a single document.
 * @param {string} documentId
 * @param {string} query
 * @param {number} topK
 * @param {number} alpha weight given to vector similarity (1-alpha goes to BM25)
 */
export async function hybridSearch(documentId, query, topK = 5, alpha = 0.6) {
  const chunks = await Chunk.find({ documentId }).lean();
  if (chunks.length === 0) return [];

  const queryVector = await embedQuery(query);

  const vectorScores = chunks.map((c) => cosineSimilarity(queryVector, c.embedding));
  const keywordScores = bm25Scores(query, chunks.map((c) => c.text));

  const normVector = normalize(vectorScores);
  const normKeyword = normalize(keywordScores);

  const combined = chunks.map((chunk, idx) => ({
    text: chunk.text,
    chunkIndex: chunk.chunkIndex,
    score: alpha * normVector[idx] + (1 - alpha) * normKeyword[idx],
    vectorScore: vectorScores[idx],
    keywordScore: keywordScores[idx],
  }));

  combined.sort((a, b) => b.score - a.score);
  return combined.slice(0, topK);
}
