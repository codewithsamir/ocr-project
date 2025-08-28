"use client";
import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

export default function TinyEditor({ initialValue, onChange }: { initialValue?: string; onChange?: (v: string) => void; }) {
  const editorRef = useRef<any>(null);

  return (
    <div className="border rounded-lg bg-white p-2">
      <Editor
        apiKey='7l5u7vu1d6cpm83z30bycztaoq6qvm78atezb79o4w5x476h'
        onInit={(evt, editor) => (editorRef.current = editor)}
      value={initialValue}
        init={{
        
          height: 360,
          menubar: true,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table paste code help wordcount"
          ],
          toolbar:
            "undo redo | formatselect | bold italic backcolor | " +
            "alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | removeformat | code",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
        onEditorChange={(content) => onChange?.(content)}
      />
    </div>
  );
}
