"use client";
import React, { useRef, useState, useEffect } from "react";

export default function MathSelector({ imageSrc, onInsertLatex }: { imageSrc: string | null; onInsertLatex: (latex: string) => void; }) {
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
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [imageSrc]);

  function startDraw(e: React.PointerEvent) {
    if (!imgRef.current) return;
    const rectCanvas = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rectCanvas.left;
    const y = e.clientY - rectCanvas.top;
    setRect({ x, y, w: 0, h: 0 });
    setIsDrawing(true);
  }

  function onMove(e: React.PointerEvent) {
    if (!isDrawing || !rect) return;
    const rectCanvas = canvasRef.current!.getBoundingClientRect();
    const x2 = e.clientX - rectCanvas.left;
    const y2 = e.clientY - rectCanvas.top;
    setRect({ x: rect.x, y: rect.y, w: x2 - rect.x, h: y2 - rect.y });
    drawOverlay(rect.x, rect.y, x2 - rect.x, y2 - rect.y);
  }

  function endDraw() {
    setIsDrawing(false);
    if (!rect || !imgRef.current) return;
    cropImage(rect);
  }

  function drawOverlay(x: number, y: number, w: number, h: number) {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current!, 0, 0);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  function cropImage(r: { x: number; y: number; w: number; h: number }) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.abs(r.w);
    canvas.height = Math.abs(r.h);
    const ctx = canvas.getContext("2d")!;
    // adjust for negative width/height
    const sx = r.w < 0 ? r.x + r.w : r.x;
    const sy = r.h < 0 ? r.y + r.h : r.y;
    ctx.drawImage(imgRef.current!, sx, sy, Math.abs(r.w), Math.abs(r.h), 0, 0, Math.abs(r.w), Math.abs(r.h));
    const url = canvas.toDataURL("image/png");
    setCropUrl(url);
  }

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-medium mb-2">Math Selector (draw rectangle on image)</h3>
      {!imageSrc && <p className="text-sm opacity-70">Upload an image or PDF page first to select math regions.</p>}
      {imageSrc && (
        <>
          <div className="overflow-auto border rounded mb-2">
            <canvas
              ref={canvasRef}
              onPointerDown={startDraw}
              onPointerMove={onMove}
              onPointerUp={endDraw}
              className="max-w-full"
            />
          </div>

          {cropUrl && (
            <div className="space-y-2">
              <div className="text-sm">Cropped selection preview:</div>
              <img src={cropUrl} alt="crop" className="max-h-40 rounded border" />
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded" onClick={() => {
                  // Placeholder: in future call math OCR server; for now we allow manual paste
                  const latex = prompt("Paste LaTeX for this crop (or type):") || "";
                  if (latex) onInsertLatex(latex);
                }}>Insert LaTeX manually</button>
                <a className="px-3 py-1 border rounded" href={cropUrl} download="crop.png">Download Crop</a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
