"use client";

import { useState, useMemo } from "react";
import { 
  Percent, 
  Users, 
  Receipt, 
  Copy, 
  Check, 
  Sparkles,
  Share2
} from "lucide-react";

export function TipCalculatorTool() {
  const [billAmount, setBillAmount] = useState<number>(350000);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [numPeople, setNumPeople] = useState<number>(4);
  const [includeTax, setIncludeTax] = useState(false);
  const [taxPercent, setTaxPercent] = useState<number>(11);
  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const taxAmount = includeTax ? (billAmount * taxPercent) / 100 : 0;
    const baseWithTax = billAmount + taxAmount;
    const tipAmount = (baseWithTax * tipPercent) / 100;
    const grandTotal = baseWithTax + tipAmount;
    const perPerson = grandTotal / Math.max(1, numPeople);
    const tipPerPerson = tipAmount / Math.max(1, numPeople);

    return {
      taxAmount,
      tipAmount,
      grandTotal,
      perPerson,
      tipPerPerson,
    };
  }, [billAmount, tipPercent, numPeople, includeTax, taxPercent]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const shareSummary = () => {
    const text = `🧾 *Rincian Split Bill & Tip*
Tagihan Awal: ${formatIDR(billAmount)}
${includeTax ? `Pajak/Service (${taxPercent}%): ${formatIDR(results.taxAmount)}\n` : ""}Tip (${tipPercent}%): ${formatIDR(results.tipAmount)}
*Total Tagihan: ${formatIDR(results.grandTotal)}*
------------------------
👥 Dibagi untuk ${numPeople} orang
👉 *Bayar per orang: ${formatIDR(results.perPerson)}*`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Tip & Bill Splitter</h2>
            <p className="text-xs text-slate-400">Hitung tip restoran dan bagi tagihan (split bill) secara merata per orang</p>
          </div>
        </div>
      </div>

      {/* Inputs & Output */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="md:col-span-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          {/* Bill Amount */}
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-semibold">Total Tagihan (Rp)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={billAmount}
              onChange={(e) => setBillAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tip Percent Presets */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-semibold">Persentase Tip</span>
              <span className="font-mono font-bold text-emerald-400">{tipPercent}% ({formatIDR(results.tipAmount)})</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[0, 5, 10, 15, 20].map((tp) => (
                <button
                  key={tp}
                  onClick={() => setTipPercent(tp)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                    tipPercent === tp
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {tp}%
                </button>
              ))}
            </div>
          </div>

          {/* Number of People */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-semibold">Bagi Berapa Orang (Split Bill)</span>
              <span className="font-mono font-bold text-white">{numPeople} Orang</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg border border-slate-700"
              >
                -
              </button>
              <input
                type="range"
                min={1}
                max={30}
                value={numPeople}
                onChange={(e) => setNumPeople(Number(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <button
                onClick={() => setNumPeople(numPeople + 1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg border border-slate-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Tax / Service toggle */}
          <div className="pt-3 border-t border-slate-800">
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeTax}
                  onChange={(e) => setIncludeTax(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-0"
                />
                Tambahkan Pajak Restoran / Service Charge
              </span>
              {includeTax && (
                <span className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    className="w-12 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center text-xs font-mono text-white"
                  />
                  %
                </span>
              )}
            </label>
          </div>
        </div>

        {/* Results Card */}
        <div className="md:col-span-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/20 text-center">
              <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider block mb-1">
                Jumlah Bayar Per Orang
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {formatIDR(results.perPerson)}
              </div>
              <div className="text-xs text-slate-400 mt-2">
                (Termasuk tip {formatIDR(results.tipPerPerson)} per orang)
              </div>
            </div>

            {/* Total breakdown */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Tagihan Pokok</span>
                <span className="font-mono text-slate-200">{formatIDR(billAmount)}</span>
              </div>
              {includeTax && (
                <div className="flex justify-between text-slate-400">
                  <span>Pajak Restoran ({taxPercent}%)</span>
                  <span className="font-mono text-slate-200">{formatIDR(results.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Total Tip ({tipPercent}%)</span>
                <span className="font-mono text-emerald-400">+{formatIDR(results.tipAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                <span>Total Keseluruhan</span>
                <span className="font-mono text-emerald-400">{formatIDR(results.grandTotal)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={shareSummary}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? "Rincian Berhasil Disalin!" : "Salin Rincian untuk Dibagikan ke Grup"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
