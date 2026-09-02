"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Sparkles,
  Sliders
} from "lucide-react";

export function PasswordGeneratorTool() {
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(false);

  const [password, setPassword] = useState<string>("");
  const [batchList, setBatchList] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedBatchIdx, setCopiedBatchIdx] = useState<number | null>(null);

  const generateSinglePassword = () => {
    let charset = "";
    if (includeUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (excludeAmbiguous) {
      charset = charset.replace(/[0O1lI]/g, "");
    }

    if (!charset) return "";

    let result = "";
    const cryptoObj = window.crypto || (window as any).msCrypto;
    if (cryptoObj) {
      const values = new Uint32Array(length);
      cryptoObj.getRandomValues(values);
      for (let i = 0; i < length; i++) {
        result += charset[values[i] % charset.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
    }
    return result;
  };

  const handleGenerate = () => {
    const mainPass = generateSinglePassword();
    setPassword(mainPass);

    const batch: string[] = [];
    for (let i = 0; i < 4; i++) {
      batch.push(generateSinglePassword());
    }
    setBatchList(batch);
  };

  useEffect(() => {
    handleGenerate();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  // Password strength calculation
  const strengthInfo = useMemo(() => {
    let score = 0;
    if (length >= 12) score += 25;
    if (length >= 16) score += 20;
    if (includeUpper && includeLower) score += 20;
    if (includeNumbers) score += 15;
    if (includeSymbols) score += 20;

    if (score < 40) {
      return { label: "Lemah", color: "text-rose-400", bg: "bg-rose-500", percent: score };
    }
    if (score < 70) {
      return { label: "Cukup / Sedang", color: "text-amber-400", bg: "bg-amber-500", percent: score };
    }
    if (score < 90) {
      return { label: "Kuat", color: "text-emerald-400", bg: "bg-emerald-500", percent: score };
    }
    return { label: "Sangat Aman (Enterprise)", color: "text-indigo-300", bg: "bg-indigo-500", percent: 100 };
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  const handleCopyMain = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyBatch = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBatchIdx(idx);
    setTimeout(() => setCopiedBatchIdx(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Password Output Banner */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-400">Kata Sandi yang Dihasilkan:</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className={strengthInfo.color}>{strengthInfo.label}</span>
          </div>
        </div>

        {/* Main Password Box */}
        <div className="relative flex items-center justify-between rounded-2xl bg-slate-950 p-4 border border-slate-800 shadow-inner">
          <span className="text-lg sm:text-2xl font-extrabold font-mono text-white tracking-wider truncate pr-2">
            {password || "Pilih setidaknya 1 opsi karakter"}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGenerate}
              title="Buat Ulang"
              className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleCopyMain}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Tersalin!" : "Salin Sandi"}</span>
            </button>
          </div>
        </div>

        {/* Strength meter bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
          <div
            className={`h-full ${strengthInfo.bg} transition-all duration-300`}
            style={{ width: `${strengthInfo.percent}%` }}
          />
        </div>
      </div>

      {/* Settings Grid */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Length Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Panjang Kata Sandi:</span>
            <span className="font-mono text-base font-bold text-indigo-400">{length} Karakter</span>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Option Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3.5 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 h-4 w-4"
            />
            <span className="text-xs font-semibold text-slate-200">Huruf Besar (A-Z)</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3.5 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 h-4 w-4"
            />
            <span className="text-xs font-semibold text-slate-200">Huruf Kecil (a-z)</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3.5 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 h-4 w-4"
            />
            <span className="text-xs font-semibold text-slate-200">Angka (0-9)</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3.5 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 h-4 w-4"
            />
            <span className="text-xs font-semibold text-slate-200">Simbol Khusus (!@#$%^&*)</span>
          </label>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3.5 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={(e) => setExcludeAmbiguous(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 h-4 w-4"
          />
          <span className="text-xs text-slate-300">
            Hindari karakter ambigu yang mirip (misal: <strong>0</strong> & <strong>O</strong>, <strong>1</strong> & <strong>l</strong>)
          </span>
        </label>
      </div>

      {/* Alternative Batch List */}
      {batchList.length > 0 && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
            Pilihan Alternatif Lainnya
          </h3>
          <div className="space-y-2">
            {batchList.map((altPass, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800"
              >
                <span className="text-xs font-mono text-slate-300 truncate max-w-md">{altPass}</span>
                <button
                  type="button"
                  onClick={() => handleCopyBatch(altPass, idx)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  {copiedBatchIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedBatchIdx === idx ? "Tersalin" : "Salin"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}