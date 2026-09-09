"use client";

import { useState, useMemo } from "react";
import { 
  Type, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles,
  ArrowRightLeft,
  FileText
} from "lucide-react";

export function CaseConverterTool() {
  const [inputText, setInputText] = useState("Hello world! This is a smart case converter tool.");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lineByLine, setLineByLine] = useState(false);

  // Helper to split text into words intelligently
  const extractWords = (text: string): string[] => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      .replace(/[\W_]+/g, " ") // replace non-word chars & underscores with spaces
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };

  const transformString = (str: string, casing: string): string => {
    if (!str.trim()) return "";
    const words = extractWords(str);

    switch (casing) {
      case "lower":
        return str.toLowerCase();
      case "upper":
        return str.toUpperCase();
      case "sentence":
        return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
      case "title":
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
      case "camel":
        return words
          .map((w, idx) =>
            idx === 0
              ? w.toLowerCase()
              : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
          )
          .join("");
      case "pascal":
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");
      case "snake":
        return words.map((w) => w.toLowerCase()).join("_");
      case "constant":
        return words.map((w) => w.toUpperCase()).join("_");
      case "kebab":
        return words.map((w) => w.toLowerCase()).join("-");
      case "dot":
        return words.map((w) => w.toLowerCase()).join(".");
      case "path":
        return words.map((w) => w.toLowerCase()).join("/");
      case "sponge":
        return str
          .split("")
          .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
          .join("");
      default:
        return str;
    }
  };

  const convert = (casing: string): string => {
    if (lineByLine) {
      return inputText
        .split("\n")
        .map((line) => transformString(line, casing))
        .join("\n");
    }
    return transformString(inputText, casing);
  };

  const cases = useMemo(() => [
    { id: "camel", label: "camelCase", desc: "Variabel JavaScript / TypeScript", value: convert("camel") },
    { id: "pascal", label: "PascalCase", desc: "Nama Komponen & Class", value: convert("pascal") },
    { id: "snake", label: "snake_case", desc: "Nama Kolom Database & Python", value: convert("snake") },
    { id: "constant", label: "CONSTANT_CASE", desc: "Environment Variable & Konstanta", value: convert("constant") },
    { id: "kebab", label: "kebab-case", desc: "URL Slug & Kelas CSS", value: convert("kebab") },
    { id: "title", label: "Title Case", desc: "Judul Artikel & Headline", value: convert("title") },
    { id: "sentence", label: "Sentence case", desc: "Kalimat standar alami", value: convert("sentence") },
    { id: "upper", label: "UPPERCASE", desc: "Huruf kapital seluruhnya", value: convert("upper") },
    { id: "lower", label: "lowercase", desc: "Huruf kecil seluruhnya", value: convert("lower") },
    { id: "dot", label: "dot.case", desc: "Konfigurasi properti paket", value: convert("dot") },
    { id: "path", label: "path/case", desc: "Struktur direktori & rute", value: convert("path") },
    { id: "sponge", label: "aLtErNaTiNg", desc: "Gaya teks selang-seling", value: convert("sponge") },
  ], [inputText, lineByLine]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Smart Case Converter</h2>
              <p className="text-xs text-slate-400">Ubah gaya penulisan teks dan variabel kode secara instan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLineByLine(!lineByLine)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                lineByLine
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              {lineByLine ? "Mode Baris-per-Baris: ON" : "Mode Seluruh Teks"}
            </button>
            <button
              onClick={() => setInputText("")}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition-colors"
              title="Reset Input"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik atau tempel teks di sini..."
            rows={4}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y font-mono"
          />
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
            <span>{inputText.length} karakter &bull; {inputText.trim() ? inputText.trim().split(/\s+/).length : 0} kata</span>
            <button
              onClick={() => setInputText("user_profile_data_response_v2")}
              className="text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" /> Contoh Koding
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 hover:border-slate-700 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-indigo-300">{c.label}</span>
                <span className="text-[10px] text-slate-500">{c.desc}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 break-all max-h-24 overflow-y-auto select-all">
                {c.value || <span className="text-slate-600 italic">kosong</span>}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => handleCopy(c.id, c.value)}
                disabled={!c.value}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1.5 disabled:opacity-40"
              >
                {copiedKey === c.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
