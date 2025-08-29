// Map paper code + question → diagram position
export const diagramPositions:any = {
  "RE-109P'1": {
    "3a": { x: 300, y: 400, width: 250, height: 180 },  // Parallelogram
    "3b": { x: 400, y: 600, width: 200, height: 150 },  // Circle
  },
  "RE-109P'2": {
    "3a": { x: 320, y: 410, width: 240, height: 170 },
    "3b": { x: 410, y: 610, width: 190, height: 140 },
  },
};

// Extract paper code from text
export function extractPaperCode(text: string): string {
  const match = text.match(/RE-\d{3}[A-Z]'?\d?/);
  return match ? match[0] : "";
}

// Detect if question mentions diagram
export function findDiagramQuestions(text: string): string[] {
  const questions: string[] = [];
  const lines = text.split("\n");

  lines.forEach((line) => {
    if (
      (line.includes("चित्रमा") ||
        line.includes("In the figure") ||
        line.includes("given below")) &&
      line.match(/\d+\.\s*\([a-z]\)/)
    ) {
      const qMatch = line.match(/\d+\.\s*\(([a-z])\)/);
      if (qMatch) {
        questions.push(qMatch[0].replace(".", "").replace(" ", "")); // e.g., "3(a)"
      }
    }
  });

  return questions;
}