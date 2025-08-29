// "use client";
// import { useState, useRef } from "react";
// import TinyEditor, { TinyEditorRef } from "@/components/design/TinyEditor";
// import { runOCR } from "@/lib/ocr/runOCR";
// import { correctOCRText } from "@/lib/ocr/correctOCRText";
// import { Loader2, Upload, Wand2 } from "lucide-react";

// export default function OCRWithAIEditor() {
//   const [image, setImage] = useState<string | null>(null);
//   const [progress, setProgress] = useState<number>(0);
//   const [loading, setLoading] = useState(false);
//   const editorRef = useRef<TinyEditorRef>(null);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       const reader = new FileReader();
//       reader.onload = () => setImage(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleOCR = async () => {
//     if (!image) return;
//     setProgress(0);
//     setLoading(true);

//     try {
//       const rawText = await runOCR(image, setProgress);
//       console.log(rawText);
//       const correctedText = await correctOCRText(rawText);
//       console.log(correctedText);
//       editorRef.current?.setContent(correctedText);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6">
//       <h2 className="text-3xl font-bold">📄 OCR + AI + TinyMCE</h2>

//       <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
//         {/* Left: Upload + Controls */}
//         <div className="bg-white rounded-2xl shadow p-6 flex flex-col space-y-4">
//           <h3 className="text-xl font-semibold">Upload Image</h3>

//           {/* Upload Box */}
//         {/* Upload Box */}
// <label
//   className={`flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition
//     ${image ? "h-24" : "h-56"}`} // shrink if image exists
// >
//   <div className="flex flex-col items-center">
//     <Upload className={`text-gray-500 mb-2 ${image ? "w-6 h-6" : "w-12 h-12"}`} />
//     <p className={`text-gray-600 text-base font-medium ${image ? "text-sm" : "text-base"}`}>
//       {image ? "Change Image" : "Click or Drag to Upload"}
//     </p>
//   </div>
//   <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
// </label>


//           {/* Preview */}
//           {image && (
//             <div className="mt-4 flex justify-center">
//               <img
//                 src={image}
//                 alt="preview"
//                 className="max-w-full max-h-[500px] object-contain rounded-lg border shadow-sm"
//               />
//             </div>
//           )}

//           {/* Progress Bar */}
//           {progress > 0 && progress < 100 && (
//             <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
//               <div
//                 className="bg-blue-600 h-4 rounded-full transition-all"
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           )}

//           {/* Action Button */}
//           <button
//             onClick={handleOCR}
//             disabled={!image || loading}
//             className="mt-4 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-5 h-5 animate-spin" /> Processing...
//               </>
//             ) : (
//               <>
//                 <Wand2 className="w-5 h-5" /> Run OCR & Correct with AI
//               </>
//             )}
//           </button>
//         </div>

//         {/* Right: Editor */}
//         <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
//           <h3 className="text-xl font-semibold mb-2">Corrected Text</h3>
//           <div className="flex-1">
//             <TinyEditor ref={editorRef} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";
import { useState, useRef } from "react";
import TinyEditor, { TinyEditorRef } from "@/components/design/TinyEditor";
import { runOCR } from "@/lib/ocr/runOCR";
import { correctOCRText } from "@/lib/ocr/correctOCRText";
import { cropImageRegion } from "@/lib/ocr/copyDiagram";
import { extractPaperCode, findDiagramQuestions, diagramPositions } from "@/lib/ocr/diagramPosition";
import { Loader2, Upload, Wand2 } from "lucide-react";

export default function OCRWithAIEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      // Step 1: Run OCR
      const rawText = await runOCR(image, setProgress);
      const correctedText = await correctOCRText(rawText);

      // Step 2: Find diagram questions
      const diagramQs = findDiagramQuestions(correctedText);
      const paperCode = extractPaperCode(correctedText);

      let finalHtml = correctedText;

      // Step 3: For each diagram question, insert cropped image
      for (const q of diagramQs) {
        const key = q.replace("(", "").replace(")", ""); // "3a"
        if (paperCode && diagramPositions[paperCode]?.[key]) {
          const pos = diagramPositions[paperCode][key];
          try {
            const croppedImg = await cropImageRegion(image, pos.x, pos.y, pos.width, pos.height);
            finalHtml = finalHtml.replace(
              `<diagram id="${key}"/>`,
              `<p style="text-align: center; margin: 10px 0;"><img src="${croppedImg}" alt="Diagram ${q}" style="max-width:100%; border:1px solid #ddd;" /></p>`
            );
          } catch (err) {
            console.warn(`Failed to crop diagram for ${q}`);
          }
        }
      }

      // Step 4: Set content
      editorRef.current?.setContent(finalHtml);
    } catch (error) {
      console.error(error);
      editorRef.current?.setContent(rawText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">📄 OCR + AI + TinyMCE</h2>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        {/* Left: Upload */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col space-y-4">
          <h3 className="text-xl font-semibold">Upload Image</h3>

          <label
            className={`flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition ${image ? "h-24" : "h-56"}`}
          >
            <div className="flex flex-col items-center">
              <Upload className={`text-gray-500 mb-2 ${image ? "w-6 h-6" : "w-12 h-12"}`} />
              <p className={`text-gray-600 ${image ? "text-sm" : "text-base"}`}>
                {image ? "Change Image" : "Click or Drag to Upload"}
              </p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          {image && (
            <div className="mt-4 flex justify-center">
              <img src={image} alt="preview" className="max-w-full max-h-[500px] object-contain rounded-lg border" />
            </div>
          )}

          {progress > 0 && progress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-blue-600 h-4 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          )}

          <button
            onClick={handleOCR}
            disabled={!image || loading}
            className="mt-4 flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" /> Run OCR & Correct
              </>
            )}
          </button>
        </div>

        {/* Right: Editor */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
          <h3 className="text-xl font-semibold mb-2">Corrected Text</h3>
          <div className="flex-1">
            <TinyEditor ref={editorRef} />
          </div>
        </div>
      </div>
    </div>
  );
}