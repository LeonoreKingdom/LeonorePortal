"use client";

import { useState, useMemo } from "react";
import { 
  Braces, 
  Type, 
  Copy, 
  Check, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles, 
  RefreshCw,
  FileCode
} from "lucide-react";

export function TextJsonTool() {
  const [activeTab, setActiveTab] = useState<"json" | "text">("json");

  // --- JSON STATE ---
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(
      {
        namaAplikasi: "LeonorePortal",
        versi: "1.0.0",
        fitur: ["Portal Aplikasi", "Papan Kanban", "Knowledge Base", "Toolbox"],
        pengaturan: {
          tema: "dark",
          obsidianSync: true,
        },
      },
      null,
      2
    )
  );
  const [jsonIndent, setJsonIndent] = useState<number>(2);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // JSON Validation
  const jsonValidation = useMemo(() => {
    if (!jsonInput.trim()) {
      return { isValid: true, error: null, formatted: "" };
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, jsonIndent);
      return { isValid: true, error: null, parsed, formatted };
    } catch (err: any) {
      return { isValid: false, error: err.message, formatted: "" };
    }
  }, [jsonInput, jsonIndent]);

  const handlePrettify = () => {
    if (jsonValidation.isValid && jsonValidation.formatted) {
      setJsonInput(jsonValidation.formatted);
    }
  };

  const handleMinify = () => {
    if (jsonValidation.isValid && jsonValidation.parsed) {
      setJsonInput(JSON.stringify(jsonValidation.parsed));
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonInput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `data-${Date.now()}.json`;
    a.click();
  };

  // --- TEXT STATE ---
  const [textInput, setTextInput] = useState<string>(
    "LeonorePortal adalah solusi mandiri untuk semua alur kerja digital Anda. Selamat datang di era produktivitas cepat!"
  );
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Text Stats
  const textStats = useMemo(() => {
    const chars = textInput.length;
    const charsNoSpaces = textInput.replace(/\s/g, "").length;
    const words = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;
    const lines = textInput ? textInput.split("\n").length : 0;
    const readingTime = Math.ceil(words / 200); // 200 wpm
    return { chars, charsNoSpaces, words, lines, readingTime };
  }, [textInput]);

  // Transformations
  const transformText = (type: string) => {
    switch (type) {
      case "upper":
        setTextInput((prev) => prev.toUpperCase());
        break;
      case "lower":
        setTextInput((prev) => prev.toLowerCase());
        break;
      case "title":
        setTextInput((prev) =>
          prev.replace(/\b\w/g, (char) => char.toUpperCase())
        );
        break;
      case "camel":
        setTextInput((prev) =>
          prev
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        );
        break;
      case "snake":
        setTextInput((prev) =>
          prev
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s-]+/g, "_")
        );
        break;
      case "kebab":
        setTextInput((prev) =>
          prev
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_]+/g, "-")
        );
        break;
      case "base64-encode":
        try {
          setTextInput((prev) => btoa(unescape(encodeURIComponent(prev))));
        } catch {
          alert("Gagal encode Base64");
        }
        break;
      case "base64-decode":
        try {
          setTextInput((prev) => decodeURIComponent(escape(atob(prev))));
        } catch {
          alert("Teks bukan format Base64 yang valid");
        }
        break;
      case "url-encode":
        setTextInput((prev) => encodeURIComponent(prev));
        break;
      case "url-decode":
        try {
          setTextInput((prev) => decodeURIComponent(prev));
        } catch {
          alert("Gagal decode URL");
        }
        break;
      case "dedup-lines":
        setTextInput((prev) => {
          const lines = prev.split("\n");
          return Array.from(new Set(lines)).join("\n");
        });
        break;
      case "sort-lines":
        setTextInput((prev) => prev.split("\n").sort().join("\n"));
        break;
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(textInput);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("json")}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${
              activeTab === "json"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Braces className="h-4 w-4" />
            <span>JSON Formatter & Validator</span>
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${
              activeTab === "text"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Type className="h-4 w-4" />
            <span>Text Utilities & Case Converter</span>
          </button>
        </div>
      </div>

      {activeTab === "json" ? (
        /* JSON TOOL */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              {jsonValidation.isValid ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  JSON Valid
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Format JSON Salah
                </span>
              )}

              <select
                value={jsonIndent}
                onChange={(e) => setJsonIndent(parseInt(e.target.value))}
                className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value={2}>Indentasi: 2 Spasi</option>
                <option value={4}>Indentasi: 4 Spasi</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handlePrettify}
                disabled={!jsonValidation.isValid}
                className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
              >
                Format / Prettify
              </button>
              <button
                onClick={handleMinify}
                disabled={!jsonValidation.isValid}
                className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
              >
                Minify (1 Baris)
              </button>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-slate-700"
              >
                {copiedJson ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedJson ? "Tersalin" : "Salin"}</span>
              </button>
              <button
                onClick={handleDownloadJson}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Unduh</span>
              </button>
              <button
                onClick={() => setJsonInput("")}
                className="rounded-xl p-1.5 text-slate-500 hover:text-rose-400"
                title="Bersihkan Editor"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {!jsonValidation.isValid && jsonValidation.error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 font-mono">
              <strong>Error Parse:</strong> {jsonValidation.error}
            </div>
          )}

          {/* Code Editor Area */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
            <textarea
              rows={16}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Tempel atau ketik objek/array JSON di sini..."
              className="w-full bg-transparent font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none resize-y leading-relaxed"
            />
          </div>
        </div>
      ) : (
        /* TEXT UTILITIES */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-5">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-slate-800">
            <div className="rounded-xl bg-slate-950 p-3 text-center border border-slate-800">
              <div className="text-[10px] text-slate-500">Jumlah Kata</div>
              <div className="text-base font-bold text-white font-mono">{textStats.words}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 text-center border border-slate-800">
              <div className="text-[10px] text-slate-500">Karakter</div>
              <div className="text-base font-bold text-white font-mono">{textStats.chars}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 text-center border border-slate-800">
              <div className="text-[10px] text-slate-500">Jumlah Baris</div>
              <div className="text-base font-bold text-white font-mono">{textStats.lines}</div>
            </div>
            <div className="rounded-xl bg-slate-950 p-3 text-center border border-slate-800">
              <div className="text-[10px] text-slate-500">Waktu Baca</div>
              <div className="text-base font-bold text-emerald-400 font-mono">~{textStats.readingTime} mnt</div>
            </div>
          </div>

          {/* Quick Transformation Buttons */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300">Transformasi Format:</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => transformText("upper")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                HURUF BESAR
              </button>
              <button
                onClick={() => transformText("lower")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                huruf kecil
              </button>
              <button
                onClick={() => transformText("title")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                Title Case
              </button>
              <button
                onClick={() => transformText("camel")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                camelCase
              </button>
              <button
                onClick={() => transformText("snake")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                snake_case
              </button>
              <button
                onClick={() => transformText("kebab")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                kebab-case
              </button>
              <button
                onClick={() => transformText("dedup-lines")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                Hapus Duplikat
              </button>
              <button
                onClick={() => transformText("sort-lines")}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-emerald-500 hover:text-white"
              >
                Urutkan A-Z
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => transformText("base64-encode")}
                className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white"
              >
                Base64 Encode
              </button>
              <button
                onClick={() => transformText("base64-decode")}
                className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white"
              >
                Base64 Decode
              </button>
              <button
                onClick={() => transformText("url-encode")}
                className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white"
              >
                URL Encode
              </button>
              <button
                onClick={() => transformText("url-decode")}
                className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white"
              >
                URL Decode
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-inner">
            <textarea
              rows={12}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ketik atau tempel teks di sini..."
              className="w-full bg-transparent font-sans text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Copy and Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setTextInput("")}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Bersihkan
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-500"
            >
              {copiedText ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedText ? "Tersalin!" : "Salin Teks"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}