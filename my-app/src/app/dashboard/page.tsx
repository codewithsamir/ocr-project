"use client";
import React, { useState, useRef, useEffect } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { createWorker, PSM } from "tesseract.js";
import { Editor } from "@tinymce/tinymce-react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const TESSDATA_URL = "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main";

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function ExportButtons({ text, html }: { text: string; html: string }) {
  const downloadTxt = () => {
    const blob = new Blob([text || html || ""], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "ocr-result.txt");
  };

  const downloadDocx = async () => {
    try {
      const lines = (text || html || "").split(/\n/);
      const doc = new Document({
        sections: [{ properties: {}, children: lines.map(l => new Paragraph({ children: [new TextRun(l)] })) }],
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "ocr-result.docx");
    } catch (error) {
      console.error("Error creating DOCX:", error);
      alert("Failed to create DOCX document");
    }
  };

  const downloadPdf = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const margin = 50;
      const maxWidth = width - margin * 2;
      
      // Clean text by removing HTML tags if present
      const cleanText = text || html.replace(/<[^>]*>/g, "") || "";
      const words = cleanText.split(/\s+/);
      
      let lines: string[] = [];
      let line = "";
      for (const w of words) {
        const test = line ? line + " " + w : w;
        const textWidth = font.widthOfTextAtSize(test, fontSize);
        if (textWidth > maxWidth && line) {
          lines.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);

      let y = height - margin;
      let currentPage = page;
      
      for (const l of lines) {
        if (y < margin) {
          y = height - margin;
          currentPage = pdfDoc.addPage();
        }
        currentPage.drawText(l, { x: margin, y, size: fontSize, font });
        y -= fontSize * 1.4;
      }
      
      const bytes = await pdfDoc.save();
      saveAs(new Blob([bytes], { type: "application/pdf" }), "ocr-result.pdf");
    } catch (error) {
      console.error("Error creating PDF:", error);
      alert("Failed to create PDF document");
    }
  };

  return (
    <div className="flex space-x-2 mb-4">
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onClick={downloadTxt}>
        Download TXT
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onClick={downloadDocx}>
        Download DOCX
      </button>
      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" onClick={downloadPdf}>
        Download PDF
      </button>
    </div>
  );
}

function ImageUploadWithTess({
  onInsert,
  onCropPreview,
}: {
  onInsert: (html: string, plain?: string) => void;
  onCropPreview?: (url: string | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Clean up object URLs on unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clean up previous image URL if exists
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

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
    <div className="p-4 border rounded-lg bg-white mb-4">
      <h3 className="font-medium mb-2 text-lg">Upload Image (Nepali + English)</h3>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFile} 
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {imageUrl && (
        <img
          src={imageUrl}
          alt="preview"
          className="mt-3 max-h-64 object-contain rounded mx-auto"
        />
      )}
      {loading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-center">Extracting... {progress}%</div>
        </div>
      )}
      <p className="text-sm mt-3 text-gray-600">
        Tip: After upload, draw a rectangle on the image in the <b>Math Selector</b> area to crop
        math parts for separate processing.
      </p>
    </div>
  );
}

function MathSelector({ imageSrc, onInsertLatex }: { imageSrc: string | null; onInsertLatex: (latex: string) => void; }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cropUrl, setCropUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageSrc) {
      setRect(null);
      setCropUrl(null);
      return;
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current!;
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, [imageSrc]);

  useEffect(() => {
    // Clean up crop URL on unmount
    return () => {
      if (cropUrl) {
        URL.revokeObjectURL(cropUrl);
      }
    };
  }, [cropUrl]);

  function startDraw(e: React.PointerEvent) {
    if (!imgRef.current) return;
    const rectCanvas = canvasRef.current!.getBoundingClientRect();
    const scale = canvasRef.current!.width / rectCanvas.width;
    const x = (e.clientX - rectCanvas.left) * scale;
    const y = (e.clientY - rectCanvas.top) * scale;
    setRect({ x, y, w: 0, h: 0 });
    setIsDrawing(true);
  }

  function onMove(e: React.PointerEvent) {
    if (!isDrawing || !rect) return;
    const rectCanvas = canvasRef.current!.getBoundingClientRect();
    const scale = canvasRef.current!.width / rectCanvas.width;
    const x2 = (e.clientX - rectCanvas.left) * scale;
    const y2 = (e.clientY - rectCanvas.top) * scale;
    setRect({ x: rect.x, y: rect.y, w: x2 - rect.x, h: y2 - rect.y });
    drawOverlay(rect.x, rect.y, x2 - rect.x, y2 - rect.y);
  }

  function endDraw() {
    setIsDrawing(false);
    if (!rect || !imgRef.current || Math.abs(rect.w) < 5 || Math.abs(rect.h) < 5) {
      setRect(null);
      return;
    }
    cropImage(rect);
  }

  function drawOverlay(x: number, y: number, w: number, h: number) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current!, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  function cropImage(r: { x: number; y: number; w: number; h: number }) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.abs(r.w);
    canvas.height = Math.abs(r.h);
    const ctx = canvas.getContext("2d")!;
    
    // Adjust for negative width/height
    const sx = r.w < 0 ? r.x + r.w : r.x;
    const sy = r.h < 0 ? r.y + r.h : r.y;
    
    ctx.drawImage(
      imgRef.current!, 
      sx, sy, Math.abs(r.w), Math.abs(r.h), 
      0, 0, Math.abs(r.w), Math.abs(r.h)
    );
    
    const url = canvas.toDataURL("image/png");
    setCropUrl(url);
  }

  return (
    <div className="p-4 border rounded-lg bg-white mb-4">
      <h3 className="font-medium mb-2 text-lg">Math Selector (draw rectangle on image)</h3>
      {!imageSrc && <p className="text-sm text-gray-600">Upload an image first to select math regions.</p>}
      {imageSrc && (
        <>
          <div className="overflow-auto border rounded mb-3 max-h-96">
            <canvas
              ref={canvasRef}
              onPointerDown={startDraw}
              onPointerMove={onMove}
              onPointerUp={endDraw}
              className="cursor-crosshair block mx-auto"
            />
          </div>

          {cropUrl && (
            <div className="space-y-3 p-3 bg-gray-50 rounded">
              <div className="text-sm font-medium">Cropped selection preview:</div>
              <img src={cropUrl} alt="crop" className="max-h-40 rounded border mx-auto" />
              <div className="flex gap-2 justify-center">
                <button 
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  onClick={() => {
                    const latex = prompt("Paste LaTeX for this crop (or type):") || "";
                    if (latex) onInsertLatex(latex);
                  }}
                >
                  Insert LaTeX manually
                </button>
                <a 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" 
                  href={cropUrl} 
                  download="crop.png"
                >
                  Download Crop
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PdfReader({ onTextExtracted }: { onTextExtracted: (text: string) => void }) {
  const [text, setText] = useState("");

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        
        // Extract text from all pages
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n\n";
        }
        
        setText(fullText);
        onTextExtracted(fullText);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading PDF:", error);
      alert("Failed to read PDF file");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white mb-4">
      <h3 className="font-medium mb-2 text-lg">PDF Text Extractor</h3>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFile} 
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <div className="mt-4 p-3 border rounded bg-gray-50 max-h-60 overflow-auto">
        <pre className="whitespace-pre-wrap text-sm">
          {text || "Upload a PDF to extract text. The text will appear here and be added to the editor."}
        </pre>
      </div>
    </div>
  );
}

function TinyEditor({ initialValue, onChange }: { initialValue?: string; onChange?: (v: string) => void; }) {
  const editorRef = useRef<any>(null);

  return (
    <div className="border rounded-lg bg-white p-3 mb-4">
      <h3 className="font-medium mb-2 text-lg">Text Editor</h3>
      <Editor
        apiKey='7l5u7vu1d6cpm83z30bycztaoq6qvm78atezb79o4w5x476h'
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={initialValue}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount"
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | code",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
        onEditorChange={(content) => onChange?.(content)}
      />
    </div>
  );
}

export default function OCRApp() {
  const [editorContent, setEditorContent] = useState("");
  const [plainText, setPlainText] = useState("");
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("image");

  const handleInsertText = (html: string, plain?: string) => {
    setEditorContent(prev => prev + html);
    if (plain) {
      setPlainText(prev => prev + plain);
    }
  };

  const handleInsertLatex = (latex: string) => {
    const latexHtml = `<span class="math-latex">$${latex}$</span>`;
    setEditorContent(prev => prev + latexHtml);
  };

  const handlePdfTextExtracted = (text: string) => {
    const html = `<pre>${escapeHtml(text)}</pre>`;
    setEditorContent(prev => prev + html);
    setPlainText(prev => prev + text);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">OCR & Document Processing Tool</h1>
        <p className="text-gray-600">Extract text from images and PDFs, edit content, and export to various formats</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("image")}
                  className={`ml-2 py-2 px-4 font-medium text-sm rounded-t-md ${activeTab === "image" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  Image OCR
                </button>
                <button
                  onClick={() => setActiveTab("pdf")}
                  className={`ml-2 py-2 px-4 font-medium text-sm rounded-t-md ${activeTab === "pdf" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  PDF Text Extraction
                </button>
              </nav>
            </div>
            
            <div className="mt-4">
              {activeTab === "image" && (
                <>
                  <ImageUploadWithTess onInsert={handleInsertText} onCropPreview={setCropImageUrl} />
                  {cropImageUrl && <MathSelector imageSrc={cropImageUrl} onInsertLatex={handleInsertLatex} />}
                </>
              )}
              {activeTab === "pdf" && (
                <PdfReader onTextExtracted={handlePdfTextExtracted} />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <TinyEditor initialValue={editorContent} onChange={setEditorContent} />
          <ExportButtons text={plainText} html={editorContent} />
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>OCR & Document Processing Tool - Built with React, Tesseract.js, and TinyMCE</p>
      </footer>
    </div>
  );
}