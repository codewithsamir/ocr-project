"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { textSchema } from "../textSchema";

export async function correctOCRText(rawText: string) {
try {
    const prompt = `
  You are an AI assistant for correcting OCR output from exam papers in Nepali and English.

  OCR text:
  "${rawText}"

  Please:
  - Fix misrecognized Nepali characters
  - Correct math symbols (e.g., L -> ∠, Z -> ∠ in math)
  - Preserve line breaks and lists
  - Keep English intact
  Return only corrected text with <br> for line breaks.
  `;

  const {
    object: { correctedText },
  } = await generateObject({
    model: google("gemini-2.0-flash-001"),
    schema: textSchema,
    prompt,
    system: "You are a professional OCR text corrector.",
  });

  return correctedText;
} catch (error) {
  console.log(error)
}
}
