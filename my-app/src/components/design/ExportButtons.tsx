"use client";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

export default function ExportButtons({
  text,
  html,
}: {
  text: string;
  html: string;
}) {
  const downloadTxt = () => {
    const content = text || html || "";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "ocr-result.txt");
  };

  const downloadDocx = async () => {
    const content = text || html || "";
    const lines = content.split(/\r\n|\n|\r/);
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: lines.map(
            (line) =>
              new Paragraph({
                children: [new TextRun(line)],
              })
          ),
        },
      ],
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "ocr-result.docx");
    } catch (err) {
      console.error("Failed to generate DOCX:", err);
      alert("Failed to generate document.");
    }
  };

  return (
    <div className="space-x-2 mt-4">
      <button
        className="px-3 py-1 rounded border text-sm hover:bg-gray-50"
        onClick={downloadTxt}
      >
        Download TXT
      </button>
      <button
        className="px-3 py-1 rounded border text-sm hover:bg-gray-50"
        onClick={downloadDocx}
      >
        Download DOCX
      </button>
    </div>
  );
}