// // utils/ocrClient.ts
// import Tesseract from "tesseract.js";

// export async function runOCR(image: string, setProgress: (val: number) => void) {
//   const { data } = await Tesseract.recognize(image, "eng+nep", {
//     logger: (m) => {
//       if (m.status === "recognizing text") {
//         setProgress(Math.round(m.progress * 100));
//       }
//     },
//     tessedit_char_whitelist:
//       "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789०१२३४५६७८९.,()[]{}+-=<>∠∑π×÷",
//     preserve_interword_spaces: "1",
//   } as any);

//   if (!data.blocks || data.blocks.length === 0) {
//     // fallback: return plain text if no blocks detected
//     return data.text || "";
//   }

//   const lines: string[] = [];

//   data.blocks.forEach((block: any) => {
//     if (!block.paragraphs) return;
//     block.paragraphs.forEach((para: any) => {
//       if (!para.lines) return;
//       para.lines.forEach((line: any) => {
//         if (!line.words) return;

//         // Reconstruct the line
//         const textLine = line.words.map((w: any) => w.text).join(" ");

//         // Heuristic for bold/heading: if line height is large
//         const lineHeight = line.bbox.y2 - line.bbox.y1;
//         if (lineHeight > 50) {
//           // wrap in <strong> for bold
//           lines.push(`<strong>${textLine}</strong>`);
//         } else {
//           lines.push(textLine);
//         }
//       });
//       lines.push(""); // paragraph break
//     });
//   });

//   return lines.join("<br>"); // return HTML-friendly line breaks for TinyMCE
// }


// utils/ocrClient.ts
import Tesseract from "tesseract.js";

export async function runOCR(image: string, setProgress: (val: number) => void) {
  const { data } = await Tesseract.recognize(image, "eng+nep", {
    logger: (m) => {
      if (m.status === "recognizing text") {
        setProgress(Math.round(m.progress * 100));
      }
    },
    // Better PSM mode for structured documents
    psm: 6, // Assume a single column of text
    tessedit_char_whitelist:
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789०१२३४५६७८९.,()[]{}+-=<>∠∑π×÷",
      
    preserve_interword_spaces: "1",
    // Enable table detection (if needed)
    config: "--tessdata-dir ./tessdata --psm 6",
  });

  if (!data.blocks || data.blocks.length === 0) {
    return data.text || "";
  }

  const lines: string[] = [];

  data.blocks.forEach((block: any) => {
    block.paragraphs.forEach((para: any) => {
      para.lines.forEach((line: any) => {
        const words = line.words.map((w: any) => w.text).join(" ");
        const lineHeight = line.bbox.y2 - line.bbox.y1;

        // Heuristic: bold headings (large font size)
        if (lineHeight > 50 && words.match(/^\d+\./)) {
          lines.push(`<strong>${words}</strong>`);
        } else {
          lines.push(words);
        }
      });
      lines.push("<br>");
    });
  });

  return lines.join("\n");
}