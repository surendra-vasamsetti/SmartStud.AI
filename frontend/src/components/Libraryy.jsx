import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { Upload, X, Trash2 } from "lucide-react";
import { getUserDoc } from "../utils/firebaseUsers";

const BACKEND_URL = "http://localhost:5000";

export default function Library() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { username, email } = useCurrentUser();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const userId = sessionStorage.getItem("uid");

  /* ---------------- RESPONSIVE ---------------- */
  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------------- FETCH ALL LIBRARY FILES ---------------- */
  const fetchLibrary = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/library`);
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch failed", err);
      setFiles([]);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  /* ---------------- UPLOAD FILE ---------------- */
  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);
    formData.append("uploaderName", username);

    setUploading(true);

    try {
      await fetch(`${BACKEND_URL}/api/library/upload`, {
        method: "POST",
        body: formData,
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      fetchLibrary();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- DELETE FILE (OWNER ONLY) ---------------- */
  const handleDelete = async (fileId) => {
    const confirmDelete = window.confirm("Delete this file?");
    if (!confirmDelete) return;

    try {
      await fetch(`${BACKEND_URL}/api/library/${fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      fetchLibrary();
    } catch {
      alert("Delete failed");
    }
  };

  /* ---------------- DRAG & DROP ---------------- */
  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50">
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen(!isOpen)}
        isMobile={isMobile}
      />

      <div className="flex-1 md:ml-64">
        <Navbar toggleSidebar={() => setIsOpen(!isOpen)} username={username} email={email} />

        <div className="px-6 pt-24 pb-10 max-w-7xl mx-auto">
          {/* HERO */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Community Library</h1>
              <p className="text-sm opacity-90">
                Shared study materials from all users
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
            >
              <Upload size={18} /> Upload
            </button>
          </div>

          {/* FILE GRID */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {files.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-xl shadow hover:scale-105 transition"
              >
                <div className="h-28 bg-indigo-100 rounded flex items-center justify-center text-3xl">
                  📄
                </div>

                <h4 className="mt-2 text-sm font-semibold truncate">
                  {item.name}
                </h4>

                <p className="text-xs text-gray-500 mt-1">
                  Uploaded by{" "}
                  <span className="font-medium">{item.uploaderName}</span>
                </p>

                <div className="flex justify-between items-center mt-2">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600"
                  >
                    View
                  </a>

                  {/* ✅ Delete button only for uploader */}
                  {item.userId === userId && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete file"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= UPLOAD MODAL ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Add new subscribers
            </h2>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-indigo-400 rounded-lg p-8 text-center cursor-pointer hover:bg-indigo-50"
              onClick={() =>
                document.getElementById("fileInput").click()
              }
            >
              <Upload className="mx-auto mb-3 text-indigo-500" />
              <p className="text-sm">
                Drag & Drop or{" "}
                <span className="text-indigo-600">Choose file</span>
              </p>

              {selectedFile && (
                <p className="mt-2 text-sm text-indigo-600">
                  {selectedFile.name}
                </p>
              )}

              <input
                id="fileInput"
                type="file"
                hidden
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </div>

            <button
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
              className="mt-5 w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload file"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
