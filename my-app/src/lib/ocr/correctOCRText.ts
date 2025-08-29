"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { textSchema } from "../textSchema";

export async function correctOCRText(rawText: string) {
  try {
// File: /src/lib/ocr/correctOCRText.ts

const prompt = `
You are an expert AI assistant for correcting OCR output from SEE (Class 10) exam papers in Nepal.

OCR Output:
"${rawText}"

### 📌 INSTRUCTIONS:
1. **Preserve original line breaks exactly** — do NOT merge lines or add extra spacing.
2. **Fix common OCR errors**:
   - Replace "L" or "Z" → "<span style='font-size:1.2em;'>∠</span>" (angle symbol)
   - Replace "x" → "×" (multiplication)
   - Replace "div" → "÷"
   - Replace "pi" → "π"
   
   - Fix misread Nepali: "तल" → "तल", "बाट" → "बाट", "नलन" → "नल", "दलललनल" → "दल"
   - Fix math: "2 2 4" → "2 + 2 = 4", "x2" → "x²"
   ### 🧮 Geometry & Shape Correction Rules:
- If you see a sequence like "AEBC", "DEBC", or "ABCD" in a geometry context (e.g., "area of AEBC"), and:
   - It starts with a point not part of the main figure
   - Or it's likely a triangle/quadrilateral
   Then correct it using proper shape notation:
   - "AEBC" → "ΔEBC"  (triangle EBC)
   - "ABCD" → "▱ABCD" or "quadrilateral ABCD"
   - "AOB" with angle → "∠AOB"
- Use standard math symbols:
   - Triangle: Δ
   - Angle: ∠
   - Parallel: //
   - Perpendicular: ⊥
- Example:
   Input: "area of AEBC and ▱BCDA"
   Output: "area of ΔEBC and ▱BCDA"
3. **Detect and apply correct bold formatting**:
   - **Do NOT bold** "A." or "B." sections
   - **Bold the entire line** only for:
     - "C. Answer the following questions..."
     - "5. Write a paragraph..."
     - "6. Write a news story..."
     - Wrap full sentence in <strong>
   - Example: <strong>C. Answer the following questions. (5×1=5)</strong>
   - **Never bold** sub-questions like (a), (b), (i), (ii)
4. **Match-the-following (A.)**:
   - Keep as plain text
   - No tables, no lists, no bullets
   - Align using spaces (e.g., tab-like spacing)
   - Example:
     (a) anguish           (i) lucky
     (b) displayed         (ii) finally
5. **True/False (B.)**:
   - Do NOT bold "B."
   - List each (a), (b), etc. on new line
6. **Clues**:
   - Write "Clues:" on a new line
   - Do NOT box, do NOT bold
   - Keep as plain text
7. **Return ONLY the corrected HTML-formatted text** — no explanations, no comments.
8. **Do NOT invent new content** — only format what exists.

### 🧩 EXAMPLES:

Input:
A. Match the words in column 'A' with the words having similar meanings in column B. (5×1=5)
Column A       Column B
(a) anguish     (i) lucky
(b) displayed   (ii) finally

Output:
A. Match the words in column 'A' with the words having similar meanings in column B. (5×1=5)<br>
(a) anguish           (i) lucky<br>
(b) displayed         (ii) finally<br>
(c) fortunate         (iii) showed<br>
(d) eventually        (iv) mental and physical pain<br>
(e) brilliant         (v) cheerful<br>
                                          (vi) exceptionally talented<br><br>

Input:
B. Write "TRUE" for the true statement and "FALSE" for the false statement. (5×1=5)
(a) Marie was the daughter of a professor.
(b) She got her doctorate in physics from Poland.

Output:
B. Write "TRUE" for the true statement and "FALSE" for the false statement. (5×1=5)<br>
(a) Marie was the daughter of a professor.<br>
(b) She got her doctorate in physics from Poland.<br>
(c) Pierre Curie was a great scientist of his day.<br>
(d) Marie brought up her two young daughters after her husband's death.<br>
(e) Marie got the Nobel Prize in Physics in 1911.<br><br>

Input:
C. Answer the following questions. (5×1=5)
(a) When was Marie born?
(b) Why did Marie leave Poland?

Output:
<strong>C. Answer the following questions. (5×1=5)</strong><br>
(a) When was Marie born?<br>
(b) Why did Marie leave Poland?<br>
(c) How was Marie's husband killed?<br>
(d) What are two different reasons greatly distressed her according to the text?<br>
(e) How does this lesson motivate you?<br><br>

Input:
5. Write a paragraph stating the advantages of walking as a physical exercise in about 100 words. You can use the given clues.
Clues: walking - physical activity - minimizes heart diseases...

Output:
<strong>5. Write a paragraph stating the advantages of walking as a physical exercise in about 100 words. You can use the given clues.</strong><br>
Clues: walking - physical activity - minimizes heart diseases - connects one with people and places - mental health - sound mind in sound body - controls obesity<br><br>

Input:
6. Write a news story with the help of the given clues in about 100 words.
Clues: Mr. ABC Rai ............. a six (6) years child of XYZ school ...

Output:
<strong>6. Write a news story with the help of the given clues in about 100 words.</strong><br>
Clues: Mr. ABC Rai ............. a six (6) years child of XYZ school ............ way to his school through the jungle ........ lost in the jungle ........... after 3 days rescued by a group of woodcutter ............ parents heartily thanked the woodcutters.
`;

    const {
      object: { correctedText },
    } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      schema: textSchema,
      prompt,
      system: "You are a professional OCR text corrector specialized in SEE exam papers.",
    });

    return correctedText;
  } catch (error) {
    console.log(error);
    return rawText; // fallback
  }
}
