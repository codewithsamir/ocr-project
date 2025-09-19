"use client";
import { Editor } from "@tinymce/tinymce-react";
import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";

export type TinyEditorRef = {
   getContent: () => string;
  setContent: (value: string) => void;
};

const STORAGE_KEY = "tinyeditor-content"; // LocalStorage key

// components/design/TinyEditor.tsx
const TinyEditor = forwardRef<
  TinyEditorRef,
  {
    initialValue?: string;
    onChange?: (value: string) => void;
  }
>(({ initialValue = "", onChange }, ref) => {
  const editorRef = useRef<any>(null);

  // Expose setContent() to parent
  useImperativeHandle(ref, () => ({
        getContent: () => {
      return editorRef.current?.getContent() || "";
    },
    setContent: (value: string) => {
      if (editorRef.current) {
        editorRef.current.setContent(value);
        localStorage.setItem(STORAGE_KEY, value); // also sync to storage
      }
    },
  }));

  const apikey = process.env.NEXT_PUBLIC_TIMYMCE_API_KEY as string;

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && editorRef.current) {
      editorRef.current.setContent(saved);
    }
  }, []);

  return (
    <div className="border rounded-lg bg-white p-2">
      <Editor
        apiKey={apikey}
        
        onInit={(evt, editor) => {
          editorRef.current = editor;

          // After init, check storage
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            editor.setContent(saved);
          } else if (initialValue) {
            editor.setContent(initialValue);
          }
        }}
        id="getdata"
        initialValue={initialValue}
        init={{
           branding: false,
          height: 700,
          menubar: true,
          // plugins: [
          //   "advlist autolink lists link image charmap preview anchor",
          //   "searchreplace visualblocks code fullscreen",
          //   "insertdatetime media table paste code help wordcount",
          //   "emoticons",
          // ],
          plugins: [
  "advlist",
  "autolink",
  "lists",
  "link",
  "image",
  "charmap",
  "preview",
  "anchor",
  "searchreplace",
  "visualblocks",
  "code",
  "fullscreen",
  "insertdatetime",
  "media",
  "table",
  "paste",
  
  "wordcount",
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
        onEditorChange={(content) => {
          onChange?.(content);
          localStorage.setItem(STORAGE_KEY, content); // save automatically
        }}
      />
    </div>
  );
});

export default TinyEditor;
