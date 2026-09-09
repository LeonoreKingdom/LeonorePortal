"use client";

import { useState, useMemo } from "react";
import { 
  Link as LinkIcon, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  ArrowRightLeft, 
  TableProperties 
} from "lucide-react";

const SAMPLE_URL = "https://example.com/api/v1/search?query=teknologi%20informasi&category=web&tags=react&tags=nextjs&page=1#results";

export function UrlEncoderTool() {
  const [inputUrl, setInputUrl] = useState(SAMPLE_URL);
  const [mode, setMode] = useState<"encode" | "decode">("decode");
  const [copied, setCopied] = useState(false);

  // Parse URL components and Query parameters
  const parsedData = useMemo(() => {
    try {
      const url = new URL(inputUrl.trim());
      const queryParams: { key: string; val: string }[] = [];
      url.searchParams.forEach((val, key) => {
        queryParams.push({ key, val });
      });

      return {
        isValidUrl: true,
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname,
        hash: url.hash,
        queryParams,
      };
    } catch {
      return {
        isValidUrl: false,
        protocol: "-",
        host: "-",
        pathname: "-",
        hash: "-",
        queryParams: [],
      };
    }
  }, [inputUrl]);

  const outputResult = useMemo(() => {
    if (!inputUrl.trim()) return "";
    try {
      if (mode === "encode") {
        return encodeURIComponent(inputUrl.trim());
      } else {
        return decodeURIComponent(inputUrl.trim());
      }
    } catch (err: any) {
      return "Error: " + err.message;
    }
  }, [inputUrl, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <LinkIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">URL Encoder / Decoder</h2>
            <p className="text-xs text-slate-400">Enkripsi/dekripsi URI aman & inspeksi parameter query string terstruktur</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === "encode" ? "decode" : "encode")}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-md self-start sm:self-auto"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Mode: {mode === "encode" ? "Encode URL" : "Decode URL"}
          </button>
          <button
            onClick={() => setInputUrl("")}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
            title="Bersihkan"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Input / Output Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Input URL / String</span>
            <button
              onClick={() => setInputUrl(SAMPLE_URL)}
              className="text-indigo-400 hover:underline flex items-center gap-1 font-normal"
            >
              <Sparkles className="h-3 w-3" /> Contoh URL
            </button>
          </div>
          <textarea
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            rows={5}
            placeholder="Tempel tautan URL atau teks di sini..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-indigo-500 focus:outline-none resize-y"
          />
        </div>

        {/* Output */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Hasil ({mode === "encode" ? "Encoded" : "Decoded"})</span>
            <button
              onClick={handleCopy}
              disabled={!outputResult}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 disabled:opacity-40 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Tersalin" : "Salin"}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={outputResult}
            rows={5}
            placeholder="Hasil akan muncul di sini..."
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-amber-400 placeholder-slate-600 focus:outline-none resize-y select-all"
          />
        </div>
      </div>

      {/* Structured Query Param Inspector */}
      {parsedData.isValidUrl && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TableProperties className="h-4 w-4 text-indigo-400" />
            Inspeksi Komponen URL & Parameter Query
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Protokol</span>
              <span className="font-mono text-indigo-300 font-semibold">{parsedData.protocol}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Host / Domain</span>
              <span className="font-mono text-slate-200 font-semibold truncate block">{parsedData.host}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Rute Path</span>
              <span className="font-mono text-slate-200 font-semibold truncate block">{parsedData.pathname}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Hash Anchor</span>
              <span className="font-mono text-slate-400">{parsedData.hash || "(kosong)"}</span>
            </div>
          </div>

          {/* Query Params Table */}
          {parsedData.queryParams.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 bg-slate-900/50 text-[10px] text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4 w-1/3">Kunci (Parameter)</th>
                    <th className="py-2.5 px-4">Nilai (Decoded)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {parsedData.queryParams.map((param, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      <td className="py-2 px-4 font-semibold text-indigo-400">{param.key}</td>
                      <td className="py-2 px-4 text-slate-200">{param.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
