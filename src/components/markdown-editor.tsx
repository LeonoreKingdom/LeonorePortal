"use client";

import { useState, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Quote, 
  Link as LinkIcon, 
  Eye, 
  Edit3, 
  Columns,
  BookOpen
} from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Tulis konten dalam format Markdown...",
  minHeight = "min-h-[220px]",
  className,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = (prefix: string, suffix: string = "", placeholderText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholderText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  return (
    <div className={cn("rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner", className)}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-slate-900/80 px-3 py-2">
        {/* Formatting Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting("**", "**", "teks tebal")}
            title="Tebal (Ctrl+B)"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("*", "*", "teks miring")}
            title="Miring (Ctrl+I)"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting("# ", "", "Judul Utama")}
            title="Heading 1"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("## ", "", "Sub Judul")}
            title="Heading 2"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting("- ", "", "Item daftar")}
            title="Daftar Poin"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <List className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("1. ", "", "Item berurutan")}
            title="Daftar Nomor"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("- [ ] ", "", "Tugas baru")}
            title="Checklist Tugas"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={() => insertFormatting("`", "`", "kode")}
            title="Kode Inline"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Code className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("> ", "", "Kutipan")}
            title="Blockquote"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("[", "](https://example.com)", "Teks Tautan")}
            title="Tautan Web"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting("[[", "]]", "Judul Halaman Wiki")}
            title="Tautan Internal Wiki / Obsidian [[...]]"
            className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            <span>[[Wiki]]</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              viewMode === "edit"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Edit3 className="h-3 w-3" />
            <span>Tulis</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              viewMode === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Eye className="h-3 w-3" />
            <span>Pratinjau</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={cn(
              "hidden sm:flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              viewMode === "split"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Columns className="h-3 w-3" />
            <span>Split</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={cn("grid", viewMode === "split" ? "grid-cols-2 divide-x divide-slate-800" : "grid-cols-1")}>
        {/* Editor Area */}
        {(viewMode === "edit" || viewMode === "split") && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent p-4 font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-y",
              minHeight
            )}
          />
        )}

        {/* Preview Area */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={cn("overflow-y-auto p-4 bg-slate-900/30", minHeight)}>
            <MarkdownRenderer content={value} />
          </div>
        )}
      </div>
    </div>
  );
}