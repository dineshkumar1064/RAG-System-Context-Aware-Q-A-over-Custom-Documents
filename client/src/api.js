import { getToken, clearToken } from "./auth.js";

const BASE = "/api";

function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// Centralizes 401 handling — clears the stale token and tells App.jsx to
// drop back to the login screen instead of surfacing a raw fetch error.
async function guardResponse(res) {
  if (res.status === 401) {
    clearToken();
    window.dispatchEvent(new Event("auth:unauthorized"));
    throw new Error("Your session has expired. Please sign in again.");
  }
}

export async function fetchDocuments() {
  const res = await fetch(`${BASE}/documents`, { headers: authHeaders() });
  await guardResponse(res);
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/documents/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  await guardResponse(res);

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export async function deleteDocument(id) {
  const res = await fetch(`${BASE}/documents/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await guardResponse(res);
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}

export async function sendChatMessage(documentId, question, history) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ documentId, question, history }),
  });
  await guardResponse(res);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat request failed");
  return data;
}
