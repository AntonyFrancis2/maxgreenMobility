"use client";

import { useRef, useCallback, useEffect, useState } from "react";

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

  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtml.current = html;
      onChange(html);
    }
    // Clear image selection on change to prevent desync
    setSelectedImage(null);
    setMenuPosition(null);
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

  // Listen for document clicks to dismiss popover when clicking outside the editor/image
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isImg = target.tagName === "IMG" && editorRef.current?.contains(target);
      const isPopover = target.closest(".image-popover-container");
      
      if (!isImg && !isPopover) {
        setSelectedImage(null);
        setMenuPosition(null);
      }
    };
    
    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setSelectedImage(img);
      
      const container = editorRef.current?.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        const topOffset = imgRect.bottom - containerRect.top;
        const leftOffset = imgRect.left - containerRect.left + (imgRect.width / 2);
        
        setMenuPosition({ top: topOffset, left: leftOffset });
      }
    } else {
      setSelectedImage(null);
      setMenuPosition(null);
    }
  }, []);

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
    <div className="relative space-y-0 rounded-xl border border-border">
      {/* Toolbar */}
      <div className="sticky top-16 z-30 flex flex-wrap gap-1 border-b border-border bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-t-xl">
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
        className="min-h-[300px] px-4 py-3 text-sm text-foreground focus:outline-none prose-editor rounded-b-xl"
        style={{ lineHeight: "1.7" }}
        onInput={handleInput}
        onBlur={handleInput}
        onClick={handleEditorClick}
        data-placeholder={placeholder || "Start writing your blog post..."}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Selected Image Popover */}
      {selectedImage && menuPosition && (
        <div
          className="image-popover-container absolute z-40 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white/95 backdrop-blur-md px-3 py-2 shadow-xl"
          style={{
            top: `${menuPosition.top + 8}px`,
            left: `${menuPosition.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Sizing presets */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider mr-1">Size:</span>
            {(["25%", "50%", "75%", "100%"] as const).map((size) => {
              const isActive = selectedImage.style.width === size;
              return (
                <button
                  key={size}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectedImage.style.width = size;
                    selectedImage.removeAttribute("width");
                    selectedImage.removeAttribute("height");
                    handleInput();
                  }}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                    isActive
                      ? "bg-brand text-white shadow-sm"
                      : "hover:bg-brand/10 text-foreground/80 hover:text-brand"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Alignment options */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider mr-1">Align:</span>
            {([
              { key: "left", label: "Left", display: "inline", float: "left", margin: "0.5rem 1.5rem 0.5rem 0", clear: "none" },
              { key: "center", label: "Center", display: "block", float: "none", margin: "1.5rem auto", clear: "both" },
              { key: "right", label: "Right", display: "inline", float: "right", margin: "0.5rem 0 0.5rem 1.5rem", clear: "none" },
            ] as const).map((align) => {
              const isCurrent =
                align.key === "center"
                  ? selectedImage.style.display === "block" && selectedImage.style.float === "none"
                  : selectedImage.style.float === align.float;

              return (
                <button
                  key={align.key}
                  type="button"
                  title={`${align.label} Align`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectedImage.style.display = align.display;
                    selectedImage.style.float = align.float;
                    selectedImage.style.margin = align.margin;
                    selectedImage.style.clear = align.clear;
                    handleInput();
                  }}
                  className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                    isCurrent
                      ? "bg-brand text-white shadow-sm"
                      : "hover:bg-brand/10 text-foreground/80 hover:text-brand"
                  }`}
                >
                  {align.label}
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Custom dimension input */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Custom:</span>
            <input
              type="text"
              placeholder="e.g. 400px"
              defaultValue={selectedImage.style.width || selectedImage.width || ""}
              onMouseDown={(e) => e.stopPropagation()} // Let input work natively without document clicks triggering dismiss
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    selectedImage.style.width = val;
                    selectedImage.removeAttribute("width");
                    selectedImage.removeAttribute("height");
                    handleInput();
                  }
                }
              }}
              className="w-16 rounded-lg border border-border bg-white px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand font-semibold shadow-inner"
            />
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Delete Button */}
          <button
            type="button"
            title="Delete Image"
            onMouseDown={(e) => {
              e.preventDefault();
              selectedImage.remove();
              setSelectedImage(null);
              setMenuPosition(null);
              handleInput();
            }}
            className="rounded-lg bg-red-50 hover:bg-red-100 p-1.5 text-xs text-red-600 transition-colors"
          >
            🗑️
          </button>
        </div>
      )}

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
          transition: outline 0.15s ease-in-out;
        }
        .prose-editor img:hover {
          outline: 2px solid var(--brand);
          cursor: pointer;
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, 4px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .image-popover-container {
          animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
