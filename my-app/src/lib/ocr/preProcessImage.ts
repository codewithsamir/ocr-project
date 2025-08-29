// utils/imagePreprocessor.ts
// import { CanvasRenderingContext2D } from "canvas";

// utils/preprocessImage.ts
export function preprocessImage(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.filter = "contrast(120%) brightness(100%)";
      ctx.drawImage(img, 0, 0);

      // Convert to grayscale (helps Tesseract)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);

      resolve(canvas.toDataURL("image/jpeg"));
    };
    img.src = imageDataUrl;
  });
}