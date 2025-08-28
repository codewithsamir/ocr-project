"use client";

import React, { useState } from "react";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js";

// Tell pdf.js where the worker is
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfReader() {
  const [text, setText] = useState("");

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
      const page = await pdf.getPage(1); // first page
      const textContent = await page.getTextContent();
      const strings = textContent.items.map((item: any) => item.str).join(" ");
      setText(strings);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-5">
      <h1 className="font-bold mb-4">PDF Reader</h1>
      <input type="file" accept="application/pdf" onChange={handleFile} />
      <div className="mt-4 p-3 border rounded">
        {text || "Upload a PDF to extract text"}
      </div>
    </div>
  );
}
