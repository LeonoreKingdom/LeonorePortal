"use client";

import { useState, useMemo } from "react";
import { 
  Binary, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles,
  Layers,
  Cpu
} from "lucide-react";

export function BaseConverterTool() {
  const [decVal, setDecVal] = useState<string>("255");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parse decimal safely as BigInt for large numbers
  const parseNum = (val: string, radix: number) => {
    try {
      if (!val.trim()) {
        setDecVal("");
        return;
      }
      const parsed = BigInt(radix === 10 ? val : `0x${val}`); // helper logic
    } catch {}
  };

  // Convert current dec value to various bases
  const conversions = useMemo(() => {
    if (!decVal.trim()) {
      return { bin: "", oct: "", dec: "", hex: "", ascii: "", bits: [] };
    }

    try {
      const n = BigInt(decVal);
      const bin = n.toString(2);
      const oct = n.toString(8);
      const dec = n.toString(10);
      const hex = n.toString(16).toUpperCase();

      let ascii = "";
      if (n >= BigInt(32) && n <= BigInt(126)) {
        ascii = String.fromCharCode(Number(n));
      } else if (n === BigInt(10)) {
        ascii = "\\n (Newline)";
      } else {
        ascii = "(Non-printable ASCII)";
      }

      // 8 or 16 bit representation
      const paddedBin = bin.padStart(Math.ceil(bin.length / 8) * 8 || 8, "0");
      const bits = paddedBin.match(/.{1,4}/g) || [];

      return { bin, oct, dec, hex, ascii, bits, valid: true };
    } catch {
      return { bin: "Invalid", oct: "Invalid", dec: decVal, hex: "Invalid", ascii: "-", bits: [], valid: false };
    }
  }, [decVal]);

  const handleUpdate = (val: string, radix: number) => {
    try {
      const clean = val.trim();
      if (!clean) {
        setDecVal("");
        return;
      }

      let parsed: bigint;
      if (radix === 2) {
        if (!/^[01]+$/.test(clean)) return;
        parsed = BigInt("0b" + clean);
      } else if (radix === 8) {
        if (!/^[0-7]+$/.test(clean)) return;
        parsed = BigInt("0o" + clean);
      } else if (radix === 10) {
        if (!/^-?[0-9]+$/.test(clean)) return;
        parsed = BigInt(clean);
      } else {
        if (!/^[0-9a-fA-F]+$/.test(clean)) return;
        parsed = BigInt("0x" + clean);
      }

      setDecVal(parsed.toString(10));
    } catch {}
  };

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Base & Radix Converter</h2>
            <p className="text-xs text-slate-400">Konversi bilangan real-time antara Biner (2), Oktal (8), Desimal (10), dan Heksadesimal (16)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDecVal("1024")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Contoh 1024
          </button>
          <button
            onClick={() => setDecVal("")}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-colors"
            title="Bersihkan"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Reactive Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decimal */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-sky-400 uppercase tracking-wider">Desimal (Base 10)</span>
            <button
              onClick={() => handleCopy("dec", conversions.dec)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              {copiedKey === "dec" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={conversions.dec}
            onChange={(e) => handleUpdate(e.target.value, 10)}
            placeholder="0-9"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Hexadecimal */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider">Heksadesimal (Base 16)</span>
            <button
              onClick={() => handleCopy("hex", conversions.hex)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              {copiedKey === "hex" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={conversions.hex}
            onChange={(e) => handleUpdate(e.target.value, 16)}
            placeholder="0-9, A-F"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Binary */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-400 uppercase tracking-wider">Biner (Base 2)</span>
            <button
              onClick={() => handleCopy("bin", conversions.bin)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              {copiedKey === "bin" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={conversions.bin}
            onChange={(e) => handleUpdate(e.target.value, 2)}
            placeholder="0 dan 1"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Octal */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-400 uppercase tracking-wider">Oktal (Base 8)</span>
            <button
              onClick={() => handleCopy("oct", conversions.oct)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              {copiedKey === "oct" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={conversions.oct}
            onChange={(e) => handleUpdate(e.target.value, 8)}
            placeholder="0-7"
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Bit Visualizer & Extra Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nibble / Bit Blocks */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            Visualisasi Blok Bit (Nibbles)
          </div>
          <div className="flex flex-wrap gap-2">
            {conversions.bits.length > 0 ? (
              conversions.bits.map((b, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 font-bold"
                >
                  {b}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">Ketik angka untuk melihat bit</span>
            )}
          </div>
        </div>

        {/* ASCII Character */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            Representasi Karakter ASCII
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {conversions.ascii || "-"}
          </div>
          <div className="text-[11px] text-slate-500">
            Karakter ASCII 7-bit standar untuk nilai byte ini.
          </div>
        </div>
      </div>
    </div>
  );
}
