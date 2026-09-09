"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { 
  Code2, 
  Upload, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  RotateCcw,
  Zap,
  Eye
} from "lucide-react";

const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" width="100" height="100" data-name="Layer 1">
  <!-- Generator: Adobe Illustrator 28.0, SVG Export Plug-In -->
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about="" />
    </rdf:RDF>
  </metadata>
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <g id="Background">
    <circle cx="50.0000" cy="50.0000" r="40.0000" fill="url(#grad1)" />
  </g>
  <g id="Icon">
    <polygon points="40,30 70,50 40,70" fill="#ffffff" />
  </g>
</svg>`;

export function SvgOptimizerTool() {
  const [svgInput, setSvgInput] = useState(SAMPLE_SVG);
  const [copied, setCopied] = useState(false);
  const [removeComments, setRemoveComments] = useState(true);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [removeEditorAttrs, setRemoveEditorAttrs] = useState(true);

  // SVG Optimization logic
  const optimizedSvg = useMemo(() => {
    let svg = svgInput.trim();
    if (!svg) return "";

    // 1. Remove XML declaration & DocType
    svg = svg.replace(/<\?xml[\s\S]*?\?>/gi, "");
    svg = svg.replace(/<!DOCTYPE[\s\S]*?>/gi, "");

    // 2. Remove comments
    if (removeComments) {
      svg = svg.replace(/<!--[\s\S]*?-->/g, "");
    }

    // 3. Remove metadata, title, desc
    if (removeMetadata) {
      svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
      svg = svg.replace(/<desc[\s\S]*?<\/desc>/gi, "");
      svg = svg.replace(/<rdf:RDF[\s\S]*?<\/rdf:RDF>/gi, "");
    }

    // 4. Remove editor attributes & namespaces
    if (removeEditorAttrs) {
      svg = svg.replace(/\s(xmlns:inkscape|xmlns:sodipodi|xmlns:sketch|xmlns:adobe|xmlns:i|xmlns:graph)="[^"]*"/gi, "");
      svg = svg.replace(/\s(inkscape:[a-z-]+|sodipodi:[a-z-]+|sketch:[a-z-]+)="[^"]*"/gi, "");
      svg = svg.replace(/\s(data-name|id="Layer_[0-9]+")="[^"]*"/gi, "");
    }

    // 5. Clean empty groups & collapse redundant whitespace
    svg = svg.replace(/<g>\s*<\/g>/gi, "");
    svg = svg.replace(/\s{2,}/g, " ");
    svg = svg.replace(/>\s+</g, "><");

    return svg.trim();
  }, [svgInput, removeComments, removeMetadata, removeEditorAttrs]);

  const originalSize = new Blob([svgInput]).size;
  const optimizedSize = new Blob([optimizedSvg]).size;
  const savingsPct = originalSize > 0 ? Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100)) : 0;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setSvgInput(text);
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized_${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SVG Optimizer & Minifier</h2>
              <p className="text-xs text-slate-400">Hapus metadata editor berlebih, komentar, dan perkecil ukuran file gambar SVG</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md">
              <Upload className="h-3.5 w-3.5" />
              <span>Unggah SVG</span>
              <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              onClick={() => setSvgInput("")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
              title="Bersihkan"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Toggles & Stats */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={removeComments}
                onChange={(e) => setRemoveComments(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              Hapus Komentar
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={removeMetadata}
                onChange={(e) => setRemoveMetadata(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              Hapus Metadata & RDF
            </label>
            <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={removeEditorAttrs}
                onChange={(e) => setRemoveEditorAttrs(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
              />
              Hapus Tag Adobe/Inkscape
            </label>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-400">{originalSize} B &rarr; <strong className="text-white">{optimizedSize} B</strong></span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
              <Zap className="h-3 w-3" /> Hemat {savingsPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual Preview Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-sky-400" /> Pratinjau Visual Vektor
          </span>
          <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-4 overflow-hidden">
            {optimizedSvg ? (
              <div
                className="max-h-full max-w-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: optimizedSvg }}
              />
            ) : (
              <span className="text-xs text-slate-600">Tidak ada SVG valid</span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Hasil Optimasi Siap Digunakan</h3>
            <p className="text-xs text-slate-400">
              Kode SVG yang bersih dapat langsung di-inline ke komponen React/Next.js atau disimpan sebagai aset file web yang sangat ringan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Tersalin!" : "Salin Kode SVG"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <Download className="h-4 w-4" /> Unduh .svg
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Kode SVG Asal</span>
            <button onClick={() => setSvgInput(SAMPLE_SVG)} className="text-indigo-400 hover:underline flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Contoh
            </button>
          </div>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            rows={10}
            className="w-full rounded-xl bg-slate-950/80 p-3 text-xs font-mono text-slate-300 border border-slate-800 focus:outline-none resize-y"
          />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="text-xs text-slate-400">Kode SVG Teroptimasi</div>
          <textarea
            readOnly
            value={optimizedSvg}
            rows={10}
            className="w-full rounded-xl bg-slate-950/80 p-3 text-xs font-mono text-emerald-400 border border-slate-800 focus:outline-none resize-y select-all"
          />
        </div>
      </div>
    </div>
  );
}
