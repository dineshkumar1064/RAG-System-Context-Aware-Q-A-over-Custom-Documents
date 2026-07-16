import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import documentsRouter from "./routes/documents.js";
import chatRouter from "./routes/chat.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Public — issues/validates the session token
app.use("/api/auth", authRouter);

// Everything below requires a valid Bearer token
app.use("/api/documents", requireAuth, documentsRouter);
app.use("/api/chat", requireAuth, chatRouter);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("[server] failed to start:", err.message);
    process.exit(1);
  });
