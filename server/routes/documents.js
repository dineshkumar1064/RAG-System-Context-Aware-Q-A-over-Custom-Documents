import express from "express";
import multer from "multer";
import Document from "../models/Document.js";
import Chunk from "../models/Chunk.js";
import { extractText } from "../services/documentLoader.js";
import { splitText } from "../services/textSplitter.js";
import { embedTexts } from "../services/embeddings.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// POST /api/documents/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { buffer, originalname, mimetype } = req.file;
    const text = await extractText(buffer, originalname, mimetype);

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Could not extract readable text from this file" });
    }

    const chunks = await splitText(text);
    if (chunks.length === 0) {
      return res.status(400).json({ error: "Document produced no usable chunks" });
    }

    const doc = await Document.create({ filename: originalname, mimetype, chunkCount: chunks.length });

    const vectors = await embedTexts(chunks);
    const chunkDocs = chunks.map((text, idx) => ({
      documentId: doc._id,
      chunkIndex: idx,
      text,
      embedding: vectors[idx],
    }));
    await Chunk.insertMany(chunkDocs);

    res.status(201).json({
      id: doc._id,
      filename: doc.filename,
      chunkCount: doc.chunkCount,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error("[upload]", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// GET /api/documents
router.get("/", async (req, res) => {
  const docs = await Document.find().sort({ createdAt: -1 }).lean();
  res.json(docs.map((d) => ({ id: d._id, filename: d.filename, chunkCount: d.chunkCount, createdAt: d.createdAt })));
});

// DELETE /api/documents/:id
router.delete("/:id", async (req, res) => {
  try {
    await Chunk.deleteMany({ documentId: req.params.id });
    await Document.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
