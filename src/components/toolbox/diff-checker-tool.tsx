"use client";

import { useState, useMemo, useRef } from "react";
import { 
  GitCompare, 
  Upload, 
  ArrowRightLeft, 
  Columns, 
  Rows, 
  Trash2, 
  PlusCircle, 
  MinusCircle, 
  Check, 
  FileText 
} from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  oldLineNum?: number;
  newLineNum?: number;
  content: string;
}

// Compute simple line-by-line diff using Longest Common Subsequence (LCS)
function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText ? oldText.split("\n") : [];
  const newLines = newText ? newText.split("\n") : [];

  const m = oldLines.length;
  const n = newLines.length;

  // DP table for LCS
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find diff
  const result: DiffLine[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({
        type: "unchanged",
        oldLineNum: i,
        newLineNum: j,
        content: oldLines[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: "added",
        newLineNum: j,
        content: newLines[j - 1],
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.unshift({
        type: "removed",
        oldLineNum: i,
        content: oldLines[i - 1],
      });
      i--;
    }
  }

  return result;
}

const SAMPLE_OLD = `// Konfigurasi Lama
const PORT = 3000;
const DB_HOST = "localhost";
const ENABLE_DEBUG = true;

function connect() {
  console.log("Menghubungkan ke database...");
  return true;
}`;

const SAMPLE_NEW = `// Konfigurasi Baru v2
const PORT = 8080;
const DB_HOST = "127.0.0.1";
const DB_USER = "admin";
const ENABLE_DEBUG = false;

async function connect() {
  console.log("Menghubungkan ke database PostgreSQL...");
  return await initializeConnection();
}`;

export function DiffCheckerTool() {
  const [oldText, setOldText] = useState<string>(SAMPLE_OLD);
  const [newText, setNewText] = useState<string>(SAMPLE_NEW);
  const [viewMode, setViewMode] = useState<"side" | "unified">("side");

  const oldFileRef = useRef<HTMLInputElement>(null);
  const newFileRef = useRef<HTMLInputElement>(null);

  const diffResult = useMemo(() => {
    return computeDiff(oldText, newText);
  }, [oldText, newText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    diffResult.forEach((line) => {
      if (line.type === "added") added++;
      if (line.type === "removed") removed++;
    });
    return { added, removed, total: added + removed };
  }, [diffResult]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "old" | "new") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (target === "old") setOldText(content || "");
      else setNewText(content || "");
    };
    reader.readAsText(file);
  };

  const handleSwap = () => {
    const temp = oldText;
    setOldText(newText);
    setNewText(temp);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controls & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-900 border border-slate-800 p-4">
        {/* Diff Stats */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <PlusCircle className="h-3.5 w-3.5" />
            +{stats.added} Baris Ditambah
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
            <MinusCircle className="h-3.5 w-3.5" />
            -{stats.removed} Baris Dihapus
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSwap}
            title="Tukar Posisi Teks"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Tukar Teks</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("side")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                viewMode === "side" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Berdampingan</span>
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                viewMode === "unified" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Rows className="h-3.5 w-3.5" />
              <span>Unified</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Old Text Input */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span>Teks Asli (Versi Lama)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => oldFileRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                <Upload className="h-3 w-3" />
                Unggah File
              </button>
              <input
                ref={oldFileRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "old")}
              />
              <button
                onClick={() => setOldText("")}
                className="text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            rows={8}
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
            placeholder="Tempel teks atau kode asli di sini..."
            className="w-full bg-slate-950 p-3.5 rounded-2xl font-mono text-xs text-slate-200 focus:outline-none border border-slate-800/80 resize-y leading-relaxed"
          />
        </div>

        {/* New Text Input */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Teks Perubahan (Versi Baru)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => newFileRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
              >
                <Upload className="h-3 w-3" />
                Unggah File
              </button>
              <input
                ref={newFileRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "new")}
              />
              <button
                onClick={() => setNewText("")}
                className="text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            rows={8}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Tempel teks atau kode baru di sini..."
            className="w-full bg-slate-950 p-3.5 rounded-2xl font-mono text-xs text-slate-200 focus:outline-none border border-slate-800/80 resize-y leading-relaxed"
          />
        </div>
      </div>

      {/* Diff Result Viewer */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-5 py-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <GitCompare className="h-4 w-4 text-indigo-400" />
            <span>Hasil Analisis Perbandingan Per Baris</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {diffResult.length} baris diperiksa
          </span>
        </div>

        <div className="overflow-x-auto p-4 bg-slate-950 font-mono text-xs leading-relaxed">
          {diffResult.map((line, idx) => {
            const isAdded = line.type === "added";
            const isRemoved = line.type === "removed";
            return (
              <div
                key={idx}
                className={`flex items-start py-0.5 px-2 rounded ${
                  isAdded
                    ? "bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500"
                    : isRemoved
                    ? "bg-rose-950/40 text-rose-300 border-l-2 border-rose-500"
                    : "text-slate-400"
                }`}
              >
                <span className="w-10 text-slate-600 select-none text-[11px] text-right pr-2">
                  {line.oldLineNum || (isRemoved ? line.oldLineNum : "") || ""}
                </span>
                <span className="w-10 text-slate-600 select-none text-[11px] text-right pr-3">
                  {line.newLineNum || (isAdded ? line.newLineNum : "") || ""}
                </span>
                <span className="w-5 font-bold select-none text-center">
                  {isAdded ? "+" : isRemoved ? "-" : " "}
                </span>
                <span className="flex-1 whitespace-pre-wrap break-words">
                  {line.content || "\u00A0"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}