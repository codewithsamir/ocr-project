"use client";
import React, { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setText("");

    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setText(data.text || "No text found.");
    } catch (err) {
      console.error(err);
      setText("Error while extracting text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>OCR (Eng + Nepali + Math)</h2>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
      {loading && <p>Processing image...</p>}
      {text && (
        <div style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>
          <strong>Extracted Text:</strong>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}
