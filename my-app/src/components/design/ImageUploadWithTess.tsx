"use client";
import React, { useState } from "react";
import { createWorker, PSM } from "tesseract.js";

const TESSDATA_URL =
  "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main";

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export default function ImageUploadWithTess({
  onInsert,
  onCropPreview,
}: {
  onInsert: (html: string, plain?: string) => void;
  onCropPreview?: (url: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    onCropPreview?.(null);
    setLoading(true);
    setProgress(0);

    const worker = await createWorker({
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });

    try {
      await worker.load();
      await worker.loadLanguage("nep+eng", TESSDATA_URL);
      await worker.initialize("nep+eng");
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });

      const buffer = await file.arrayBuffer();
      const { data } = await worker.recognize(new Uint8Array(buffer));

      const plain = data.text || "";
      const html = `<pre>${escapeHtml(plain)}</pre>`;
      onInsert(html, plain);
    } catch (err) {
      console.error("Tesseract error", err);
      onInsert(`<pre>Error: ${String(err)}</pre>`, String(err));
    } finally {
      setLoading(false);
      await worker.terminate();
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-medium mb-2">Upload Image (Nepali + English)</h3>
      <input type="file" accept="image/*" onChange={handleFile} />
      {imageUrl && (
        <img
          src={imageUrl}
          alt="preview"
          className="mt-3 max-h-64 object-contain rounded"
        />
      )}
      {loading && <div className="mt-2 text-sm">Extracting... {progress}%</div>}
      <p className="text-xs mt-2 opacity-70">
        Tip: After upload, draw a rectangle on the image in the <b>Math Selector</b> area to crop
        math parts for separate processing.
      </p>
    </div>
  );
}
