import React, { useRef, useState } from "react";

function UploadCloudIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 16V6" />
      <path d="M8.5 9.5 12 6l3.5 3.5" />
      <path d="M6.5 17.5A4 4 0 0 1 7 9.6 5.5 5.5 0 0 1 17.9 8 4.5 4.5 0 0 1 17 17.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function Landing({ onUpload, uploading, error, user, onLogout }) {
  const [dragActive, setDragActive] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [nudge, setNudge] = useState(false);
  const inputRef = useRef(null);

  function openBrowser() {
    inputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  }

  function handleDrag(e, active) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  }

  function handlePromptSubmit() {
    if (!prompt.trim() || uploading) return;
    setNudge(true);
    setTimeout(() => setNudge(false), 500);
    openBrowser();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePromptSubmit();
    }
  }

  return (
    <div className="landing">
      <div className="landing-brand">
        <span className="brand-dot" />
        DocChat
        {user && (
          <button className="landing-logout" onClick={onLogout} title="Sign out">
            <LogoutIcon /> {user.email}
          </button>
        )}
      </div>

      <div className="landing-center">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div
          className={`dropzone ${dragActive ? "drag-active" : ""} ${uploading ? "uploading" : ""}`}
          onClick={openBrowser}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openBrowser();
          }}
        >
          <div className="dropzone-icon">
            {uploading ? <span className="spinner" /> : <UploadCloudIcon />}
          </div>
          <h1 className="dropzone-title">
            {uploading ? "Processing your document…" : "Upload a document"}
          </h1>
          <p className="dropzone-subtitle">
            {uploading ? (
              "Extracting text, chunking, and embedding — this only takes a moment."
            ) : (
              <>
                Drag &amp; drop your file here, or{" "}
                <span
                  className="dropzone-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    openBrowser();
                  }}
                >
                  click to browse
                </span>
              </>
            )}
          </p>
          <p className="dropzone-caption">Supports PDF, DOCX, TXT · Max 20MB</p>
        </div>

        {error && <div className="landing-error">{error}</div>}

        <div className="landing-divider">
          <span />
          or
          <span />
        </div>

        <div className={`composer landing-composer ${nudge ? "nudge" : ""}`}>
          <span className="composer-search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Ask anything about your document…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="send-btn"
            onClick={handlePromptSubmit}
            disabled={!prompt.trim() || uploading}
            title="Upload a document to start chatting"
          >
            <SendIcon />
          </button>
        </div>
        {nudge && <div className="landing-hint">Upload a document first, then I can answer that.</div>}
      </div>
    </div>
  );
}
