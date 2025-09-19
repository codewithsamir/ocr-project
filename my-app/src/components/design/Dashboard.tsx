"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import TinyEditor, { TinyEditorRef } from "@/components/design/TinyEditor";
import {
  Loader2,
  Upload,
  Wand2,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { runOCR } from "@/lib/ocr/runOCR";
import { correctOCRText } from "@/lib/ocr/correctOCRText";

// Type for stored image
type StoredImage = {
  id: string;
  name: string;
  dataUrl: string;
  uploadedAt: Date;
  ocrResult: string | null;
  isProcessing: boolean;
  structured?: string;
};

export default function OCRWithAIEditor() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<TinyEditorRef>(null);

  // Demo server function
  const saveToServer = useCallback(async (image: StoredImage) => {
    try {
      console.log("📤 Demo: sending to server", image);
    } catch (err) {
      console.error("❌ Failed to send to server:", err);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement> | any) => {
      if (!e.target.files) return;

      Array.from(e.target.files).forEach((file: File) => {
        if (!file.type.startsWith("image/")) return;

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
          if (!selectedImageId) setSelectedImageId(newImage.id);
          saveToServer(newImage);
        };
        reader.readAsDataURL(file);
      });
    },
    [selectedImageId, saveToServer]
  );

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleFileChange({ target: { files: [file] } } as any);
            return;
          }
        }
      }

      const text = e.clipboardData?.getData("text");
      if (text && text.startsWith("http")) {
        fetch(text)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "pasted-image.png", { type: blob.type });
            handleFileChange({ target: { files: [file] } } as any);
          })
          .catch((err) => console.error("Failed to fetch pasted image:", err));
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFileChange]);

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
      const result = await runOCR(selectedImage.dataUrl, setProgress);
      const finalData = await correctOCRText(result);

      const updatedImage = {
        ...selectedImage,
        isProcessing: false,
        ocrResult: finalData,
      };

      setImages((prev) =>
        prev.map((img) => (img.id === selectedImageId ? updatedImage : img))
      );

      editorRef.current?.setContent(finalData);
      saveToServer(updatedImage);
    } catch (error) {
      console.error("OCR Error:", error);

      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImageId ? { ...img, isProcessing: false } : img
        )
      );

      editorRef.current?.setContent(
        `❌ OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
    const image = images.find((img) => img.id === id);
    editorRef.current?.setContent(image?.ocrResult ?? "");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 flex flex-wrap items-center gap-1">
        📄 OCR + AI + TinyMCE | developed by{" "}
        <a
          href="https://samirrain.com.np"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-semibold transition-colors duration-200"
        >
          samirrain
        </a>
      </h2>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left: Image History & Upload */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col space-y-6">
          <h3 className="text-xl font-semibold text-gray-700">Images & History</h3>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileChange({ target: { files: e.dataTransfer.files } } as any);
              }
            }}
            className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition h-32"
          >
            <div className="flex flex-col items-center">
              <Upload className="text-gray-500 mb-2 w-12 h-12" />
              <p className="text-gray-600 text-base font-medium">
                Click, Drag, or Paste to Upload
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
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{img.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(img.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex gap-1">
                    {img.isProcessing && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {img.ocrResult && <FileText className="w-4 h-4 text-green-500" />}
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
