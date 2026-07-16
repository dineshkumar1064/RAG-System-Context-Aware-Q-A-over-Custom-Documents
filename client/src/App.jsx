import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import Landing from "./components/Landing.jsx";
import Login from "./components/Login.jsx";
import { fetchDocuments, uploadDocument, deleteDocument } from "./api.js";
import { fetchCurrentUser, logout as clearSession } from "./auth.js";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Validate any stored session token once on load.
  useEffect(() => {
    fetchCurrentUser().then((u) => {
      setUser(u);
      setAuthChecked(true);
    });
  }, []);

  // If any API call comes back 401 (expired/invalid token), drop back to login.
  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      setLoaded(false);
      setDocuments([]);
      setActiveDocId(null);
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  useEffect(() => {
    if (user) loadDocuments();
  }, [user]);

  function handleLogout() {
    clearSession();
    setUser(null);
    setLoaded(false);
    setDocuments([]);
    setActiveDocId(null);
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(t);
  }, [error]);

  async function loadDocuments() {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
      if (!activeDocId && docs.length > 0) setActiveDocId(docs[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoaded(true);
    }
  }

  async function handleUpload(file) {
    setUploading(true);
    setError(null);
    try {
      const doc = await uploadDocument(file);
      setDocuments((prev) => [{ id: doc.id, filename: doc.filename, chunkCount: doc.chunkCount, createdAt: doc.createdAt }, ...prev]);
      setActiveDocId(doc.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (activeDocId === id) setActiveDocId(null);
    } catch (err) {
      setError(err.message);
    }
  }

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  // Avoid flashing the wrong layout while the session is being verified.
  if (!authChecked) {
    return <div className="app app-landing" />;
  }

  if (!user) {
    return <Login onSuccess={setUser} />;
  }

  // Avoid flashing the wrong layout while the initial document list is loading.
  if (!loaded) {
    return <div className="app app-landing" />;
  }

  // Before anything has been uploaded, show the full-screen landing view.
  if (documents.length === 0) {
    return (
      <div className="app app-landing">
        <Landing onUpload={handleUpload} uploading={uploading} error={error} user={user} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="app">
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelect={(id) => {
          setActiveDocId(id);
          setSidebarOpen(false);
        }}
        onDelete={handleDelete}
        onUpload={handleUpload}
        uploading={uploading}
        theme={theme}
        onThemeChange={setTheme}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
      <ChatWindow
        activeDoc={activeDoc}
        onUpload={handleUpload}
        uploading={uploading}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      {error && <div className="toast">{error}</div>}
    </div>
  );
}
