import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble.jsx";
import { sendChatMessage } from "../api.js";

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}

export default function ChatWindow({ activeDoc, onUpload, uploading, onOpenSidebar }) {
  const [messagesByDoc, setMessagesByDoc] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const docId = activeDoc?.id;
  const messages = (docId && messagesByDoc[docId]) || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function appendMessage(id, msg) {
    setMessagesByDoc((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), msg],
    }));
  }

  async function handleSend() {
    const question = input.trim();
    if (!question || !docId || loading) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    appendMessage(docId, { role: "user", content: question });
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const data = await sendChatMessage(docId, question, history);
      appendMessage(docId, { role: "assistant", content: data.answer, sources: data.sources });
    } catch (err) {
      appendMessage(docId, { role: "assistant", content: err.message || "Something went wrong.", isError: true });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput(e) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file);
    e.target.value = "";
  }

  const isEmpty = messages.length === 0;

  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf,.docx,.txt,.md"
      style={{ display: "none" }}
      onChange={handleFileChange}
    />
  );

  if (!activeDoc) {
    return (
      <div className="main">
        <div className="topbar">
          <button className="menu-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
            <MenuIcon />
          </button>
          <div className="model-pill">
            <span className="dot" /> llama-3.3-70b via Groq
          </div>
        </div>
        <div className="empty-state">
          <h2>No document selected</h2>
          <p>Upload a PDF, DOCX, or TXT file from the sidebar, then select it to start asking questions grounded in its content.</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="main">
        <div className="topbar">
          <button className="menu-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
            <MenuIcon />
          </button>
          <div className="model-pill">
            <span className="dot" /> llama-3.3-70b via Groq
          </div>
          <span style={{ color: "var(--text-faint)" }}>·</span>
          <span>{activeDoc.filename}</span>
        </div>

        <div className="hero-stage">
          <h2 className="hero-title">Ask anything about "{activeDoc.filename}"</h2>
          <p className="hero-subtitle">Answers are grounded in this document using hybrid vector + keyword search over its content.</p>

          <div className="hero-composer-block">
            {hiddenFileInput}
            <button
              className="hero-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <PlusIcon /> {uploading ? "Processing…" : "Upload"}
            </button>

            <div className="composer">
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Ask a question about this document…"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
              />
              <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
                <SendIcon />
              </button>
            </div>
            <div className="hint">Enter to send · Shift+Enter for a new line</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="topbar">
        <button className="menu-btn" onClick={onOpenSidebar} aria-label="Open sidebar">
          <MenuIcon />
        </button>
        <div className="model-pill">
          <span className="dot" /> llama-3.3-70b via Groq
        </div>
        <span style={{ color: "var(--text-faint)" }}>·</span>
        <span className="topbar-filename">{activeDoc.filename}</span>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-inner">
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} sources={m.sources} isError={m.isError} />
          ))}

          {loading && (
            <div className="msg-row assistant">
              <div className="avatar assistant">AI</div>
              <div className="bubble assistant">
                <div className="typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="composer-wrap">
        <div style={{ width: "100%", maxWidth: 760 }}>
          {hiddenFileInput}
          <div className="composer">
            <button className="composer-plus" onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Upload document">
              <PlusIcon />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask a question about this document…"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
            />
            <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>
              <SendIcon />
            </button>
          </div>
          <div className="hint">Enter to send · Shift+Enter for a new line</div>
        </div>
      </div>
    </div>
  );
}
