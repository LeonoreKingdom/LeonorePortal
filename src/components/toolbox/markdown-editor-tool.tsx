"use client";

import { useState, useMemo } from "react";
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Table as TableIcon, 
  Eye, 
  Edit3, 
  SplitSquareVertical, 
  FileText,
  RotateCcw
} from "lucide-react";

const DEFAULT_MARKDOWN = `# Panduan Penggunaan Markdown Editor

Selamat datang di **Markdown Live Editor**! Tulis catatan, dokumentasi, atau artikel blog Anda di sini dengan pratinjau instan.

## Fitur Utama:
- **100% Client-Side**: Tulisan Anda tidak pernah diunggah ke server mana pun.
- **Live Preview**: Pratinjau rendered HTML secara *real-time*.
- **Statistik Penulisan**: Hitungan kata, karakter, dan estimasi waktu membaca.
- **Ekspor Cepat**: Unduh file \`.md\` atau salin kode HTML jadi.

---

### Contoh Tabel:
| Fitur | Keterangan | Status |
| :--- | :--- | :--- |
| Kecepatan | Instan di browser | ✅ Aktif |
| Privasi | Tanpa database server | ✅ Aman |
| Ekspor | Markdown & HTML | ✅ Siap |

### Blok Kode:
\`\`\`javascript
// Contoh kode JavaScript
function sapa(nama) {
  return \`Halo, \${nama}! Selamat berkarya.\`;
}
console.log(sapa("Leonore"));
\`\`\`

> "Dokumentasi yang baik adalah investasi terbaik bagi pengembang masa depan."
`;

export function MarkdownEditorTool() {
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [copiedMd, setCopiedMd] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

  // Statistics
  const stats = useMemo(() => {
    const text = markdown.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, charsNoSpaces, readingTimeMinutes };
  }, [markdown]);

  // Lightweight Client-Side Markdown Parser
  const htmlOutput = useMemo(() => {
    let html = markdown
      // Escape basic HTML entities to avoid XSS
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Code blocks
      .replace(/```([a-z]*)\n([\s\S]*?)```/gm, '<pre class="bg-slate-950 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono text-indigo-300 border border-slate-800"><code>$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs">$1</code>')
      // Headings
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-8 mb-3 pb-1 border-b border-slate-800">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-4 mb-4 pb-2 border-b border-slate-800">$1</h1>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1.5 my-3 text-slate-300 italic bg-indigo-500/5 rounded-r">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr class="my-6 border-slate-800" />')
      // Bold & Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>')
      .replace(/~~(.*?)~~/g, '<del class="text-slate-500">$1</del>')
      // Images & Links
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" class="rounded-xl max-w-full my-4 border border-slate-800" />')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 underline hover:text-indigo-300">$1</a>')
      // Unordered lists
      .replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 my-1">$1</li>')
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-slate-300 my-1">$1</li>')
      // Tables (basic rows)
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split("|").filter((c, i, a) => i > 0 && i < a.length - 1);
        if (cells.every((c) => /^\s*:?-+:?\s*$/.test(c))) {
          return ""; // Skip separator row
        }
        const renderedCells = cells.map((c) => `<td class="border border-slate-800 px-3 py-2 text-xs text-slate-300">${c.trim()}</td>`).join("");
        return `<tr class="hover:bg-slate-800/40">${renderedCells}</tr>`;
      })
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-3 text-slate-300 leading-relaxed">');

    return `<div class="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed"><p class="my-2">${html}</p></div>`;
  }, [markdown]);

  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("md-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const replacement = `${before}${selected || "teks"}${after}`;

    const updated = markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 0);
  };

  const handleCopyMd = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlOutput);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dokumen-${Date.now()}.md`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <FileCode2 className="h-5 w-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Markdown Editor & Live Preview
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Editor markdown interaktif dengan rendered HTML real-time, statistik teks, dan ekspor.
          </p>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="text-sky-400">{stats.words}</strong> kata
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <strong className="text-indigo-400">{stats.chars}</strong> karakter
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            ~<strong className="text-emerald-400">{stats.readingTimeMinutes}</strong> mnt baca
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => insertText("**", "**")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Tebal (Bold)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText("*", "*")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Miring (Italic)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText("## ")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Heading 2"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText("### ")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Heading 3"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => insertText("- ")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Daftar Poin"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText("1. ")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Daftar Angka"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText("> ")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Kutipan (Quote)"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText("```\n", "\n```")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Blok Kode"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertText("| Judul 1 | Judul 2 |\n| :--- | :--- |\n| Data 1 | Data 2 |\n")}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Sisipkan Tabel"
          >
            <TableIcon className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View selector */}
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`p-1.5 rounded-lg ${viewMode === "edit" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
              title="Hanya Editor"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`p-1.5 rounded-lg ${viewMode === "split" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
              title="Split View"
            >
              <SplitSquareVertical className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`p-1.5 rounded-lg ${viewMode === "preview" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
              title="Hanya Pratinjau"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMarkdown("")}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-all text-xs"
            title="Bersihkan teks"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopyMd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-200"
          >
            {copiedMd ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Salin MD</span>
          </button>

          <button
            type="button"
            onClick={handleCopyHtml}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs text-slate-200"
          >
            {copiedHtml ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <FileText className="h-3.5 w-3.5" />}
            <span>Salin HTML</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadMd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-md shadow-sky-600/20"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Unduh .md</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className={`grid gap-4 ${viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        {/* Editor Pane */}
        {(viewMode === "split" || viewMode === "edit") && (
          <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Markdown Source</span>
              <span className="text-[11px] font-mono text-slate-500">UTF-8</span>
            </div>
            <textarea
              id="md-textarea"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Ketik kode markdown Anda di sini..."
              className="w-full h-[520px] p-5 bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none placeholder-slate-600"
              spellCheck={false}
            />
          </div>
        )}

        {/* Live Rendered Preview Pane */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
            <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Pratinjau Hasil Render</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live HTML
              </span>
            </div>
            <div
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
              className="w-full h-[520px] p-6 overflow-y-auto bg-slate-950/30"
            />
          </div>
        )}
      </div>
    </div>
  );
}
