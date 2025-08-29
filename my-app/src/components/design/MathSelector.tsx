"use client";
import React, { useRef, useState, useEffect } from "react";

export default function MathSelector({
  imageSrc,
  onInsertLatex,
}: {
  imageSrc: string | null;
  onInsertLatex: (latex: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  }, [imageSrc]);

  const startDraw = (e: React.PointerEvent) => {
    if (!imgRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRect({ x, y, w: 0, h: 0 });
    setIsDrawing(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!isDrawing || !rect || !canvasRef.current) return;
    const rectCanvas = canvasRef.current.getBoundingClientRect();
    const x2 = e.clientX - rectCanvas.left;
    const y2 = e.clientY - rectCanvas.top;
    const w = x2 - rect.x;
    const h = y2 - rect.y;
    setRect({ ...rect, w, h });
    drawOverlay(rect.x, rect.y, w, h);
  };

  const endDraw = () => {
    setIsDrawing(false);
    if (!rect || !imgRef.current) return;
    cropImage(rect);
  };

  const drawOverlay = (x: number, y: number, w: number, h: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  };

  const cropImage = (r: { x: number; y: number; w: number; h: number }) => {
    const canvas = document.createElement("canvas");
    const width = Math.abs(r.w);
    const height = Math.abs(r.h);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imgRef.current) return;

    const sx = r.w < 0 ? r.x + r.w : r.x;
    const sy = r.h < 0 ? r.y + r.h : r.y;

    ctx.drawImage(imgRef.current, sx, sy, width, height, 0, 0, width, height);
    const url = canvas.toDataURL("image/png");
    setCropUrl(url);
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-medium mb-2">Math Selector (draw rectangle on image)</h3>
      {!imageSrc && (
        <p className="text-sm opacity-70">Upload an image or PDF page first to select math regions.</p>
      )}
      {imageSrc && (
        <>
          <div className="overflow-auto border rounded mb-2">
            <canvas
              ref={canvasRef}
              onPointerDown={startDraw}
              onPointerMove={onMove}
              onPointerUp={endDraw}
              className="max-w-full cursor-crosshair"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {cropUrl && (
            <div className="space-y-2">
              <div className="text-sm">Cropped selection preview:</div>
              <img src={cropUrl} alt="crop" className="max-h-40 rounded border" />
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                  onClick={() => {
                    const latex = prompt("Paste LaTeX for this crop:", "") || "";
                    if (latex) onInsertLatex(latex);
                  }}
                >
                  Insert LaTeX manually
                </button>
                <a
                  className="px-3 py-1 border rounded text-sm hover:bg-gray-50"
                  href={cropUrl}
                  download="math-crop.png"
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