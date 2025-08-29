// utils/ocrClient.ts
import Tesseract from "tesseract.js";

export async function runOCR(image: string, setProgress: (val: number) => void) {
  const { data } = await Tesseract.recognize(image, "eng+nep", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        setProgress(Math.round(m.progress * 100));
      }
    },
  } as any);

  return data.text || "";
}
