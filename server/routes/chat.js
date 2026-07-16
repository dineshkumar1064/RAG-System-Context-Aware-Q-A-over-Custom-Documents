import express from "express";
import mongoose from "mongoose";
import { hybridSearch } from "../services/hybridSearch.js";
import { answerQuestion } from "../services/groqClient.js";

const router = express.Router();

// POST /api/chat  { documentId, question, history }
router.post("/", async (req, res) => {
  try {
    const { documentId, question, history = [] } = req.body;

    if (!documentId || !mongoose.isValidObjectId(documentId)) {
      return res.status(400).json({ error: "A valid documentId is required" });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "question is required" });
    }

    const sources = await hybridSearch(documentId, question, 5, 0.6);
    if (sources.length === 0) {
      return res.status(404).json({ error: "No content found for this document. Try re-uploading it." });
    }

    const answer = await answerQuestion(question, sources, history);

    res.json({
      answer,
      sources: sources.map((s) => ({
        chunkIndex: s.chunkIndex,
        text: s.text,
        score: Number(s.score.toFixed(4)),
      })),
    });
  } catch (err) {
    console.error("[chat]", err);
    res.status(500).json({ error: err.message || "Chat failed" });
  }
});

export default router;
