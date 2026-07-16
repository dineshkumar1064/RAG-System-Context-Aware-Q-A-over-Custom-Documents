import React, { useState } from "react";
import { login } from "../auth.js";

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ off }) {
  return off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6 0 9.5 6 9.5 6a17.6 17.6 0 0 1-3.2 3.9M6.6 6.6C3.7 8.4 2.5 11 2.5 11s3.5 6 9.5 6c1.2 0 2.3-.2 3.3-.6" />
      <path d="M9.9 10.1a3 3 0 0 0 4.1 4.1" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 11S6 5 12 5s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="11" r="3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const FEATURES = [
  "Ask questions grounded in your own documents",
  "Hybrid vector + keyword retrieval for precise answers",
  "Private workspace — only you have access",
];

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      onSuccess(user);
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand-panel">
          <div className="login-brand-mark">
            <span className="login-logo">
              <LogoMark />
            </span>
            DocChat
          </div>

          <div className="login-brand-copy">
            <h1>Document intelligence, on demand.</h1>
            <p>Sign in to upload documents and get grounded, source-backed answers in seconds.</p>

            <ul className="login-feature-list">
              {FEATURES.map((f) => (
                <li key={f}>
                  <span className="login-feature-check">
                    <CheckIcon />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="login-brand-footer">Hybrid Search · Groq · Private by default</div>
        </div>

        <div className="login-form-panel">
          <form className="login-card" onSubmit={handleSubmit}>
            <div className="login-card-header">
              <h2>Welcome back</h2>
              <p>Sign in to your workspace to continue.</p>
            </div>

            <label className="login-field">
              <span className="login-field-label">Email</span>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </label>

            <label className="login-field">
              <span className="login-field-label">Password</span>
              <div className="login-input-wrap">
                <span className="login-input-icon">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-input-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
            </label>

            {error && <div className="login-error">{error}</div>}

            <button className="login-submit" type="submit" disabled={submitting || !email.trim() || !password}>
              {submitting ? <span className="spinner spinner-on-accent" /> : "Sign in"}
            </button>

            <p className="login-footnote">Access is restricted to authorized workspace members.</p>
            <p className="login-founder">
              Founder :{" "}
              <a href="https://www.linkedin.com/in/dinesh-kumar04/" target="_blank" rel="noopener noreferrer">
                Dinesh Kumar
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
