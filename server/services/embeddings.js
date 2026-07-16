const HF_URL = (model) => `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`;

/**
 * Mean-pools token-level embeddings into a single sentence vector if needed.
 */
function normalizeVector(raw) {
  // raw can be: number[] (already pooled) or number[][] (token-level, needs pooling)
  if (Array.isArray(raw[0])) {
    const tokens = raw.length;
    const dim = raw[0].length;
    const pooled = new Array(dim).fill(0);
    for (const tokenVec of raw) {
      for (let i = 0; i < dim; i++) pooled[i] += tokenVec[i];
    }
    return pooled.map((v) => v / tokens);
  }
  return raw;
}

async function callHF(inputs, attempt = 1) {
  const model = process.env.HF_EMBEDDING_MODEL || "sentence-transformers/all-MiniLM-L6-v2";
  const res = await fetch(HF_URL(model), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs, options: { wait_for_model: true } }),
  });

  if (res.status === 503 && attempt <= 3) {
    // Model is warming up on HF's side — wait and retry.
    await new Promise((r) => setTimeout(r, 3000));
    return callHF(inputs, attempt + 1);
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HuggingFace embedding request failed (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Embeds an array of text strings. Returns array of number[] vectors, same order.
 * Batches requests to avoid overly large single calls.
 */
export async function embedTexts(texts) {
  const BATCH_SIZE = 16;
  const results = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    let batch = texts.slice(i, i + BATCH_SIZE);
    // HF's response shape for a single input is ambiguous (pooled vs token-level
    // both look like a 2D array). Padding to 2+ inputs guarantees a per-input array.
    const padded = batch.length === 1;
    if (padded) batch = [batch[0], batch[0]];

    const raw = await callHF(batch);
    const vectors = raw.map(normalizeVector);

    results.push(...(padded ? [vectors[0]] : vectors));
  }

  return results;
}

/** Embeds a single query string. */
export async function embedQuery(text) {
  const [vec] = await embedTexts([text]);
  return vec;
}
