// lib/ocr/runOCR.ts
import Tesseract from "tesseract.js";

export async function runOCR(image: string, setProgress: (val: number) => void) {
  try {
    const { data } = await Tesseract.recognize(image, "eng+nep", {
      langPath: "/tessdata", // host traineddata in public/tessdata
      logger: (m) => {
        if (m.status === "recognizing text" && m.progress) {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });

    return data.text;
  } catch (error) {
    console.error("OCR failed:", error);
    throw error;
  }
}
