import React, { useState } from "react";

export default function MessageBubble({ role, content, sources, isError }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = role === "user";

  return (
    <div className={`msg-row ${isUser ? "user" : "assistant"}`}>
      <div className={`avatar ${isUser ? "user" : "assistant"}`}>{isUser ? "You" : "AI"}</div>
      <div style={{ maxWidth: "78%" }}>
        <div className={`bubble ${isUser ? "user" : "assistant"} ${isError ? "error" : ""}`}>{content}</div>

        {sources && sources.length > 0 && (
          <div className="sources">
            <button className="sources-toggle" onClick={() => setShowSources((s) => !s)}>
              {showSources ? "▾" : "▸"} {sources.length} source excerpt{sources.length > 1 ? "s" : ""}
            </button>
            {showSources &&
              sources.map((s, i) => (
                <div className="source-item" key={i}>
                  <b>#{s.chunkIndex} · score {s.score}</b>
                  <br />
                  {s.text.length > 320 ? s.text.slice(0, 320) + "…" : s.text}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
