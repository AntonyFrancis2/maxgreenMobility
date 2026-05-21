"use client";

import { useRef, useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type FormatAction =
  | { type: "exec"; command: string; value?: string }
  | { type: "wrap"; tag: string; attrs?: Record<string, string> };

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(value);
  const isMounted = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtml.current = html;
      onChange(html);
    }
  }, [onChange]);

  // Sync value from parent if it has changed externally
  useEffect(() => {
    if (editorRef.current) {
      if (!isMounted.current || value !== lastHtml.current) {
        editorRef.current.innerHTML = value;
        lastHtml.current = value;
        isMounted.current = true;
      }
    }
  }, [value]);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  const handleFormat = useCallback((action: FormatAction) => {
    if (action.type === "exec") {
      exec(action.command, action.value);
    } else if (action.type === "wrap") {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const el = document.createElement(action.tag);
      if (action.attrs) {
        Object.entries(action.attrs).forEach(([k, v]) => el.setAttribute(k, v));
      }
      range.surroundContents(el);
      handleInput();
    }
  }, [exec, handleInput]);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      exec("createLink", url);
    }
  }, [exec]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "blog");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        alert("Upload failed: " + (await res.text()));
        return;
      }
      const data = (await res.json()) as { path: string };
      exec("insertImage", data.path);
    } catch {
      alert("Image upload failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [exec]);

  const insertImage = useCallback(() => {
    const choice = confirm("Press OK to upload an image from your computer, or Cancel to enter a web URL/path.");
    if (choice) {
      fileInputRef.current?.click();
    } else {
      const url = prompt("Enter image URL or path (e.g., /media/blog/image.png):");
      if (url) {
        exec("insertImage", url);
      }
    }
  }, [exec]);

  const toolbarGroups: { label: string; items: { label: string; title: string; action: () => void }[] }[] = [
    {
      label: "Text",
      items: [
        { label: "B", title: "Bold", action: () => exec("bold") },
        { label: "I", title: "Italic", action: () => exec("italic") },
        { label: "U", title: "Underline", action: () => exec("underline") },
        { label: "S", title: "Strikethrough", action: () => exec("strikeThrough") },
      ],
    },
    {
      label: "Heading",
      items: [
        { label: "H2", title: "Heading 2", action: () => exec("formatBlock", "h2") },
        { label: "H3", title: "Heading 3", action: () => exec("formatBlock", "h3") },
        { label: "H4", title: "Heading 4", action: () => exec("formatBlock", "h4") },
        { label: "¶", title: "Paragraph", action: () => exec("formatBlock", "p") },
      ],
    },
    {
      label: "List",
      items: [
        { label: "• List", title: "Bullet list", action: () => exec("insertUnorderedList") },
        { label: "1. List", title: "Numbered list", action: () => exec("insertOrderedList") },
      ],
    },
    {
      label: "Insert",
      items: [
        { label: "🔗", title: "Insert link", action: insertLink },
        { label: "🖼️", title: "Insert image", action: insertImage },
        { label: "❝", title: "Blockquote", action: () => exec("formatBlock", "blockquote") },
        { label: "—", title: "Horizontal rule", action: () => exec("insertHorizontalRule") },
      ],
    },
    {
      label: "Clear",
      items: [
        { label: "⌫", title: "Remove formatting", action: () => exec("removeFormat") },
      ],
    },
  ];

  return (
    <div className="space-y-0 rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-border bg-white/50 px-2 py-1.5">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="mx-1 h-5 w-px bg-border" />}
            {group.items.map((item, ii) => (
              <button
                key={ii}
                type="button"
                title={item.title}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent focus loss from editor
                  item.action();
                }}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-foreground/70 hover:bg-brand/10 hover:text-brand transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[300px] px-4 py-3 text-sm text-foreground focus:outline-none prose-editor"
        style={{ lineHeight: "1.7" }}
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder || "Start writing your blog post..."}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Styles for the editor */}
      <style>{`
        .prose-editor:empty::before {
          content: attr(data-placeholder);
          color: var(--muted);
          pointer-events: none;
        }
        .prose-editor h2 {
          font-size: 1.375rem;
          font-weight: 800;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        .prose-editor h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.375rem;
          color: var(--foreground);
        }
        .prose-editor h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.25rem;
          color: var(--foreground);
        }
        .prose-editor p {
          margin-bottom: 0.75rem;
        }
        .prose-editor ul, .prose-editor ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose-editor ul { list-style-type: disc; }
        .prose-editor ol { list-style-type: decimal; }
        .prose-editor li {
          margin-bottom: 0.25rem;
        }
        .prose-editor blockquote {
          border-left: 3px solid var(--brand);
          padding-left: 1rem;
          margin: 1rem 0;
          color: var(--muted);
          font-style: italic;
        }
        .prose-editor a {
          color: var(--brand);
          text-decoration: underline;
        }
        .prose-editor img {
          max-width: 100%;
          border-radius: 12px;
          margin: 1rem 0;
        }
        .prose-editor hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 1.5rem 0;
        }
        .prose-editor strong {
          font-weight: 700;
        }
        .prose-editor em {
          font-style: italic;
        }
        .prose-editor code {
          background: rgba(0,0,0,0.05);
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
          font-size: 0.85em;
          font-family: ui-monospace, monospace;
        }
      `}</style>
    </div>
  );
}
