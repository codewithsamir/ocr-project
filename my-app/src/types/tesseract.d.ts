// types/tesseract.d.ts
import { Worker } from "tesseract.js";

declare module "tesseract.js" {
  interface Worker {
    loadLanguage(langs: string): Promise<void>;
    initialize(langs: string): Promise<void>;
    setParameters(params: Record<string, any>): Promise<void>;
    recognize(image: string): Promise<{ data: { text: string } }>;
    terminate(): Promise<void>;
  }
}