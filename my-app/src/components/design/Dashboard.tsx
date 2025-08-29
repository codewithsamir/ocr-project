"use client";
import { useState, useRef } from "react";
import TinyEditor, { TinyEditorRef } from "@/components/design/TinyEditor";
import { runOCR } from "@/lib/ocr/runOCR";
import { correctOCRText } from "@/lib/ocr/correctOCRText";
import { cropImageRegion } from "@/lib/ocr/copyDiagram";
import { extractPaperCode, findDiagramQuestions, diagramPositions } from "@/lib/ocr/diagramPosition";
import { Loader2, Upload, Wand2, X, Image as ImageIcon, FileText } from "lucide-react";

// Type for stored image
type StoredImage = {
  id: string;
  name: string;
  dataUrl: string;
  uploadedAt: Date;
  ocrResult: string | null;
  isProcessing: boolean;
};

export default function OCRWithAIEditor() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const editorRef = useRef<TinyEditorRef>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        if (!file.type.match("image/")) return;

        const reader = new FileReader();
        reader.onload = () => {
          const newImage: StoredImage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name,
            dataUrl: reader.result as string,
            uploadedAt: new Date(),
            ocrResult: null,
            isProcessing: false,
          };

          setImages((prev) => [...prev, newImage]);
          if (!selectedImageId) {
            setSelectedImageId(newImage.id);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const selectedImage = images.find((img) => img.id === selectedImageId) || null;

  const handleOCR = async () => {
    if (!selectedImage) return;

    setImages((prev) =>
      prev.map((img) =>
        img.id === selectedImageId ? { ...img, isProcessing: true } : img
      )
    );
    setProgress(0);
    setLoading(true);

    try {
      const rawText = await runOCR(selectedImage.dataUrl, (p) => setProgress(p));
      const correctedText = await correctOCRText(rawText);

      // Insert diagrams
      const diagramQs = findDiagramQuestions(correctedText);
      const paperCode = extractPaperCode(correctedText);
      let finalHtml = correctedText;

      for (const q of diagramQs) {
        const key = q.replace("(", "").replace(")", "");
        if (paperCode && diagramPositions[paperCode]?.[key]) {
          const pos = diagramPositions[paperCode][key];
          try {
            const croppedImg = await cropImageRegion(
              selectedImage.dataUrl,
              pos.x,
              pos.y,
              pos.width,
              pos.height
            );
            finalHtml = finalHtml.replace(
              `<diagram id="${key}"/>`,
              `<p style="text-align: center; margin: 10px 0;"><img src="${croppedImg}" alt="Diagram ${q}" style="max-width:100%; border:1px solid #ddd;" /></p>`
            );
          } catch (err) {
            console.warn(`Failed to crop diagram for ${q}`);
          }
        }
      }

      // Save result
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImageId
            ? { ...img, ocrResult: finalHtml, isProcessing: false }
            : img
        )
      );

      // Show in editor
      editorRef.current?.setContent(finalHtml);
    } catch (error) {
      console.error(error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImageId ? { ...img, isProcessing: false } : img
        )
      );
      editorRef.current?.setContent("OCR failed.");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(newImages.length > 0 ? newImages[0].id : null);
      }
      return newImages;
    });
  };

  const selectImage = (id: string) => {
    setSelectedImageId(id);
    if (images.find((img) => img.id === id)?.ocrResult) {
      editorRef.current?.setContent(images.find((img) => img.id === id)!.ocrResult!);
    } else {
      editorRef.current?.setContent("");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800">📄 OCR + AI + TinyMCE</h2>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left: Image History & Upload */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col space-y-6">
          <h3 className="text-xl font-semibold text-gray-700">Images & History</h3>

          {/* Upload Multiple */}
          <label
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition h-32"
          >
            <div className="flex flex-col items-center">
              <Upload className="text-gray-500 mb-2 w-12 h-12" />
              <p className="text-gray-600 text-base font-medium">
                Click or Drag to Upload
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
          </label>

          {/* Image List (History) */}
          <div className="flex-1 overflow-y-auto max-h-96 space-y-3">
            {images.length === 0 ? (
              <p className="text-center text-gray-500 text-sm">No images uploaded</p>
            ) : (
              images.map((img) => (
                <div
                  key={img.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                    selectedImageId === img.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => selectImage(img.id)}
                >
                  <div className="flex-shrink-0">
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {img.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(img.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex gap-1">
                    {img.isProcessing && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {img.ocrResult && (
                      <FileText className="w-4 h-4 text-green-500" title="Processed" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="flex justify-center">
                <img
                  src={selectedImage.dataUrl}
                  alt="selected preview"
                  className="max-w-full max-h-[300px] object-contain border rounded-lg"
                />
              </div>
            </div>
          )}

          {/* OCR Button */}
          {selectedImage && (
            <button
              onClick={handleOCR}
              disabled={selectedImage.isProcessing}
              className="mt-4 flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 disabled:opacity-70 font-semibold w-full"
            >
              {selectedImage.isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" /> Run OCR
                </>
              )}
            </button>
          )}

          {/* Progress Bar */}
          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Right: Editor */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-2 text-gray-700">Corrected Text</h3>
          <div className="flex-1 border rounded-lg overflow-hidden bg-white">
            <TinyEditor ref={editorRef} />
          </div>
        </div>
      </div>
    </div>
  );
}