"use client";
import { Editor } from "@tinymce/tinymce-react";
import { useRef, useImperativeHandle, forwardRef } from "react";

export type TinyEditorRef = {
  setContent: (value: string) => void;
};

// const TinyEditor = forwardRef<
//   TinyEditorRef,
//   {
//     initialValue?: string;
//     onChange?: (value: string) => void;
//   }
// >(({ initialValue = "", onChange }, ref) => {
//   const editorRef = useRef<any>(null);

//   // Expose methods to parent
//   useImperativeHandle(ref, () => ({
//     setContent: (value: string) => {
//       if (editorRef.current) {
//         editorRef.current.setContent(value); // ✅ now will update properly
//       }
//     },
//   }));

//   return (
//     <div className="border rounded-lg bg-white p-2">
//       <Editor
//         apiKey="7l5u7vu1d6cpm83z30bycztaoq6qvm78atezb79o4w5x476h"
//         onInit={(evt, editor) => {
//           editorRef.current = editor;
//         }}
//         id="getdata"
//         initialValue={initialValue} // ✅ keep only this
//         // ❌ remove value={initialValue}
//         init={{
//           height: 700,
//           menubar: true,
//           plugins: [
//             "advlist autolink lists link image charmap preview anchor",
//             "searchreplace visualblocks code fullscreen",
//             "insertdatetime media table paste code help wordcount",
//           ],
//           toolbar:
//             "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | " +
//             "bullist numlist outdent indent | removeformat | code | help",
//           content_style:
//             "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
//         }}
//         onEditorChange={(content) => onChange?.(content)}
//       />
//     </div>
//   );
// });

// TinyEditor.displayName = "TinyEditor";

// export default TinyEditor;


// components/design/TinyEditor.tsx
const TinyEditor = forwardRef<
  TinyEditorRef,
  {
    initialValue?: string;
    onChange?: (value: string) => void;
  }
>(({ initialValue = "", onChange }, ref) => {
  const editorRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    setContent: (value: string) => {
      if (editorRef.current) {
        editorRef.current.setContent(value);
      }
    },
  }));

  return (
    <div className="border rounded-lg bg-white p-2">
      <Editor
        apiKey="7l5u7vu1d6cpm83z30bycztaoq6qvm78atezb79o4w5x476h"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        id="getdata"
        initialValue={initialValue}
        init={{
          height: 700,
          menubar: true,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount",
            "emoticons",
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | table | removeformat | code | help",
         content_style:
  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } " +
  "table { border-collapse: collapse; width: 100%; margin: 10px 0; } " +
  "th, td { border: 1px solid #ccc; padding: 8px; } " +
  "th { background-color: #f2f2f2; } " +
  "span[style*='font-size:1.2em'] { font-size: 1.2em; } " +
  "div[style*='border'] { border: 1px solid #000; padding: 8px; margin: 10px 0; background: #f9f9f9; }",
        }}
        onEditorChange={(content) => onChange?.(content)}
      />
    </div>
  );
});

export default TinyEditor