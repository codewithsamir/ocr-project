"use client";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts } from "pdf-lib";

export default function ExportButtons({ text, html }: { text: string; html: string; }) {
  const downloadTxt = () => {
    const blob = new Blob([text || html || ""], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "ocr-result.txt");
  };

  const downloadDocx = async () => {
    const lines = (text || html || "").split(/\n/);
    const doc = new Document({
      sections: [{ properties: {}, children: lines.map(l => new Paragraph({ children: [new TextRun(l)] })) }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "ocr-result.docx");
  };

  const downloadPdf = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 50;
    const maxWidth = width - margin * 2;
    const words = (text || html || "").split(/\s+/);
    let lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      const textWidth = font.widthOfTextAtSize(test, fontSize);
      if (textWidth > maxWidth && line) {
        lines.push(line);
        line = w;
      } else line = test;
    }
    if (line) lines.push(line);

    let y = height - margin;
    for (const l of lines) {
      if (y < margin) { y = height - margin; pdfDoc.addPage(); }
      page.drawText(l, { x: margin, y, size: fontSize, font });
      y -= fontSize * 1.4;
    }
    const bytes = await pdfDoc.save();
    saveAs(new Blob([bytes], { type: "application/pdf" }), "ocr-result.pdf");
  };

  return (
    <div className="space-x-2">
      <button className="px-3 py-1 rounded border" onClick={downloadTxt}>Download TXT</button>
      <button className="px-3 py-1 rounded border" onClick={downloadDocx}>Download DOCX</button>
      <button className="px-3 py-1 rounded border" onClick={downloadPdf}>Download PDF</button>
    </div>
  );
}
