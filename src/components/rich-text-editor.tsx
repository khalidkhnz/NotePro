"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Label } from "~/components/ui/label";

// Dynamically import ReactQuill with no SSR to avoid hydration issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface RichTextEditorProps {
  id?: string;
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minHeight?: number;
  className?: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "image",
  "blockquote",
  "code-block",
  "color",
  "background",
];

export function RichTextEditor({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "Write something...",
  required = false,
  minHeight = 300,
  className = "",
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState(value);

  // Handle initial client-side rendering
  useEffect(() => {
    setMounted(true);

    // Import Quill CSS
    if (typeof window !== "undefined") {
      // Only run in browser
      require("react-quill-new/dist/quill.snow.css");
    }
  }, []);

  // Update local state when parent value changes
  useEffect(() => {
    setHtmlContent(value);
  }, [value]);

  // Handle editor content change
  const handleChange = (content: string) => {
    setHtmlContent(content);
    onChange(content);
  };

  // Set custom styles for the editor
  const editorStyle = {
    minHeight: `${minHeight}px`,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id || name} className={required ? "required" : ""}>
          {label}
        </Label>
      )}
      <div
        ref={editorRef}
        className="border-input bg-background rounded-md border"
      >
        {mounted && (
          <ReactQuill
            id={id || name}
            theme="snow"
            value={htmlContent}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            style={editorStyle}
          />
        )}
      </div>
      <input type="hidden" name={name} value={htmlContent} />
    </div>
  );
}
