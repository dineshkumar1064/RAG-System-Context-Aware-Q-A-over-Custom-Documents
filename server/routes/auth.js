import express from "express";
import crypto from "crypto";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Single hardcoded operator account. Override via .env — never hardcode
// credentials directly in source for anything beyond a single-user demo.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@test.com").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password123";

// Constant-time string comparison to avoid leaking info via response timing.
function safeEqual(a = "", b = "") {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // keep timing consistent, then fail
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// POST /api/auth/login  { email, password }
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailOk = safeEqual(String(email).trim().toLowerCase(), ADMIN_EMAIL);
  const passwordOk = safeEqual(password, ADMIN_PASSWORD);

  if (!emailOk || !passwordOk) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken({ email: ADMIN_EMAIL });
  res.json({ token, user: { email: ADMIN_EMAIL } });
});

// GET /api/auth/me — used on page load to restore/validate a session
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { email: req.user.email } });
});

export default router;
