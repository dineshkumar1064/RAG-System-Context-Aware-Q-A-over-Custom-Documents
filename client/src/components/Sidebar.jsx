import React, { useRef } from "react";

function FileIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
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

const THEMES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "retro", label: "Retro" },
];

export default function Sidebar({ documents, activeDocId, onSelect, onDelete, onUpload, uploading, theme, onThemeChange, open, onClose, user, onLogout }) {
  const inputRef = useRef(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  }

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <span className="brand-dot" />
        DocChat
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <CloseIcon />
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button className="upload-btn" onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? "Processing…" : "＋ Upload document"}
      </button>

      <div className="doc-list">
        <div className="doc-list-label">Documents</div>
        {documents.length === 0 && (
          <div className="empty-docs">No documents yet. Upload a PDF, DOCX, or TXT file to start chatting with it.</div>
        )}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`doc-item ${doc.id === activeDocId ? "active" : ""}`}
            onClick={() => onSelect(doc.id)}
            title={doc.filename}
          >
            <span className="doc-icon"><FileIcon /></span>
            <span className="doc-name">{doc.filename}</span>
            <button
              className="doc-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(doc.id);
              }}
              title="Delete document"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      <div className="theme-toggle">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={theme === t.id ? "active" : ""}
            onClick={() => onThemeChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="sidebar-meta">
        <span className="brand-dot" style={{ background: "#4ade80", boxShadow: "none" }} />
        Groq · Hybrid Search · Free Embeddings
      </div>

      {user && (
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{user.email.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-email" title={user.email}>{user.email}</div>
            <div className="sidebar-user-role">Workspace admin</div>
          </div>
          <button className="sidebar-logout" onClick={onLogout} title="Sign out" aria-label="Sign out">
            <LogoutIcon />
          </button>
        </div>
      )}
    </aside>
  );
}
