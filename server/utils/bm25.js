function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Computes BM25 relevance scores for a query against a list of documents.
 * @param {string} query
 * @param {string[]} documents raw text of each chunk
 * @returns {number[]} score per document, same order/length as `documents`
 */
export function bm25Scores(query, documents, { k1 = 1.5, b = 0.75 } = {}) {
  const queryTerms = [...new Set(tokenize(query))];
  const docTokens = documents.map(tokenize);
  const docLengths = docTokens.map((t) => t.length);
  const avgDocLen = docLengths.reduce((a, b2) => a + b2, 0) / (docLengths.length || 1);
  const N = documents.length;

  // document frequency per term
  const df = {};
  for (const term of queryTerms) {
    df[term] = docTokens.filter((tokens) => tokens.includes(term)).length;
  }

  return docTokens.map((tokens, idx) => {
    const termFreq = {};
    for (const t of tokens) termFreq[t] = (termFreq[t] || 0) + 1;

    let score = 0;
    for (const term of queryTerms) {
      const f = termFreq[term] || 0;
      if (f === 0) continue;
      const idf = Math.log(1 + (N - df[term] + 0.5) / (df[term] + 0.5));
      const numerator = f * (k1 + 1);
      const denominator = f + k1 * (1 - b + (b * docLengths[idx]) / avgDocLen);
      score += idf * (numerator / denominator);
    }
    return score;
  });
}
