"use client"
import { useState, useRef } from "react";
import TinyEditor, { TinyEditorRef } from "@/components/design/TinyEditor";
import { runOCR } from "@/lib/ocr/runOCR";
import { correctOCRText } from "@/lib/ocr/correctOCRText";

export default function OCRWithAIEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const editorRef = useRef<TinyEditorRef>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async () => {
    if (!image) return;
    setProgress(0);

    // Step 1: Client OCR
    const rawText = await runOCR(image, setProgress);

    // Step 2: Server AI correction
    const correctedText = await correctOCRText(rawText);

    // Step 3: Push into editor
    editorRef.current?.setContent(correctedText);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold">📄 OCR + AI + TinyMCE</h2>

      <div className="flex">
        <div>
          <input type="file" accept="image/*" onChange={handleFileChange} />

          {image && (
            <div>
              <img src={image} alt="preview" className="max-w-xs border rounded" />
            </div>
          )}

          <button
            onClick={handleOCR}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Run OCR & Correct with AI
          </button>

          {progress > 0 && progress < 100 && <p>Progress: {progress}%</p>}
        </div>

        <TinyEditor ref={editorRef} />
      </div>
    </div>
  );
}
