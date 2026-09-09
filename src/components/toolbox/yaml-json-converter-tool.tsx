"use client";

import { useState, useEffect } from "react";
import { 
  FileJson, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Download, 
  AlertCircle, 
  Sparkles,
  RotateCcw
} from "lucide-react";

// Lightweight YAML <-> JSON parser/formatter for browser
function jsonToYaml(obj: any, indent = 0): string {
  const spaces = " ".repeat(indent);
  if (obj === null) return "null\n";
  if (typeof obj === "undefined") return "\n";
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#") || obj.startsWith("- ")) {
      return `"${obj.replace(/"/g, '\\"')}"\n`;
    }
    return `${obj}\n`;
  }
  if (typeof obj === "number" || typeof obj === "boolean") {
    return `${obj}\n`;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]\n";
    let out = "\n";
    for (const item of obj) {
      if (typeof item === "object" && item !== null) {
        const nested = jsonToYaml(item, indent + 2).trimStart();
        out += `${spaces}- ${nested}`;
      } else {
        out += `${spaces}- ${jsonToYaml(item, indent).trimStart()}`;
      }
    }
    return out;
  }
  if (typeof obj === "object") {
    const keys = Object.keys(obj);
    if (keys.length === 0) return "{}\n";
    let out = indent === 0 ? "" : "\n";
    for (const key of keys) {
      const val = obj[key];
      if (typeof val === "object" && val !== null) {
        out += `${spaces}${key}:${jsonToYaml(val, indent + 2)}`;
      } else {
        out += `${spaces}${key}: ${jsonToYaml(val, indent).trimStart()}`;
      }
    }
    return out;
  }
  return String(obj) + "\n";
}

// Simple YAML reader for common configs (objects, arrays, primitives)
function yamlToJson(yamlStr: string): any {
  const lines = yamlStr.split("\n").filter((l) => !l.trim().startsWith("#") && l.trim().length > 0);
  
  // Try standard JSON parse first in case user pastes JSON
  try {
    return JSON.parse(yamlStr);
  } catch {}

  const root: any = {};
  const stack: { indent: number; obj: any; key?: string }[] = [{ indent: -1, obj: root }];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const indent = line.search(/\S/);
    if (indent === -1) continue;

    const trimmed = line.trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const current = stack[stack.length - 1].obj;

    if (trimmed.startsWith("- ")) {
      // List item
      const valStr = trimmed.slice(2).trim();
      let parsedVal: any = parseYamlScalar(valStr);
      if (Array.isArray(current)) {
        current.push(parsedVal);
      }
    } else if (trimmed.includes(":")) {
      const colonIdx = trimmed.indexOf(":");
      const key = trimmed.slice(0, colonIdx).trim().replace(/^["']|["']$/g, "");
      const valStr = trimmed.slice(colonIdx + 1).trim();

      if (valStr === "" || valStr === "[]" || valStr === "{}") {
        const nextLine = lines[i + 1];
        const nextIndent = nextLine ? nextLine.search(/\S/) : -1;
        const isNextArray = nextLine && nextLine.trim().startsWith("- ");

        const newContainer = isNextArray ? [] : {};
        if (Array.isArray(current)) {
          current.push({ [key]: newContainer });
          stack.push({ indent, obj: newContainer, key });
        } else {
          current[key] = newContainer;
          stack.push({ indent, obj: newContainer, key });
        }
      } else {
        const parsedVal = parseYamlScalar(valStr);
        if (Array.isArray(current)) {
          current.push({ [key]: parsedVal });
        } else {
          current[key] = parsedVal;
        }
      }
    }
  }

  return root;
}

function parseYamlScalar(val: string): any {
  if (val === "true") return true;
  if (val === "false") return false;
  if (val === "null" || val === "~") return null;
  if (!isNaN(Number(val)) && val.trim() !== "") return Number(val);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

const SAMPLE_YAML = `version: "1.0"
service:
  name: leonore-portal
  port: 3000
  ssl: true
database:
  host: localhost
  credentials:
    user: admin
tags:
  - web
  - tools
  - nextjs`;

export function YamlJsonConverterTool() {
  const [direction, setDirection] = useState<"yaml-to-json" | "json-to-yaml">("yaml-to-json");
  const [input, setInput] = useState(SAMPLE_YAML);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (direction === "yaml-to-json") {
        const parsed = yamlToJson(input);
        setOutput(JSON.stringify(parsed, null, 2));
        setError(null);
      } else {
        const parsed = JSON.parse(input);
        setOutput(jsonToYaml(parsed).trim());
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memproses konversi sintaks.");
    }
  }, [input, direction]);

  const handleSwap = () => {
    const nextDir = direction === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json";
    setDirection(nextDir);
    if (output) {
      setInput(output);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = direction === "yaml-to-json" ? "json" : "yaml";
    const mime = ext === "json" ? "application/json" : "text/yaml";
    const blob = new Blob([output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `converted_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">YAML & JSON Converter</h2>
              <p className="text-xs text-slate-400">Konversi struktur konfigurasi YAML dan JSON dua arah secara instan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwap}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors flex items-center gap-1.5 shadow-md"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Tukar: {direction === "yaml-to-json" ? "YAML → JSON" : "JSON → YAML"}
            </button>
            <button
              onClick={() => setInput("")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
              title="Bersihkan Input"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Pane */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Input ({direction === "yaml-to-json" ? "YAML" : "JSON"})</span>
            <button
              onClick={() => {
                if (direction === "yaml-to-json") {
                  setInput(SAMPLE_YAML);
                } else {
                  setInput(JSON.stringify({ project: "Leonore", version: "1.0", active: true, tags: ["web", "tools"] }, null, 2));
                }
              }}
              className="text-indigo-400 hover:underline flex items-center gap-1 font-normal"
            >
              <Sparkles className="h-3 w-3" /> Muat Contoh
            </button>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Tempel data ${direction === "yaml-to-json" ? "YAML" : "JSON"} di sini...`}
            rows={16}
            className="w-full flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
          />
        </div>

        {/* Output Pane */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Output ({direction === "yaml-to-json" ? "JSON" : "YAML"})</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 flex items-center gap-1.5 disabled:opacity-40 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Tersalin" : "Salin"}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!output}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white flex items-center gap-1.5 disabled:opacity-40 transition-colors"
              >
                <Download className="h-3 w-3" /> Unduh
              </button>
            </div>
          </div>

          {error ? (
            <div className="flex-1 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Kesalahan Sintaks:</p>
                <p className="font-mono mt-1 text-[11px]">{error}</p>
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              placeholder="Hasil konversi akan muncul di sini..."
              rows={16}
              className="w-full flex-1 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-emerald-400 placeholder-slate-600 focus:outline-none resize-none leading-relaxed select-all"
            />
          )}
        </div>
      </div>
    </div>
  );
}
