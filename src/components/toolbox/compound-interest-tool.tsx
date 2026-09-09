"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  Calendar, 
  Percent, 
  Sparkles,
  ArrowUpRight
} from "lucide-react";

interface YearBreakdown {
  year: number;
  totalInvested: number;
  interestEarnedYear: number;
  totalBalance: number;
}

export function CompoundInterestTool() {
  const [initialDeposit, setInitialDeposit] = useState<number>(10000000); // 10 jt
  const [monthlyAddition, setMonthlyAddition] = useState<number>(1500000); // 1.5 jt / bln
  const [annualRate, setAnnualRate] = useState<number>(10); // 10% per tahun
  const [years, setYears] = useState<number>(10); // 10 tahun

  const results = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12;
    const totalMonths = years * 12;
    let balance = initialDeposit;
    let totalInvested = initialDeposit;

    const yearlyData: YearBreakdown[] = [];

    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + monthlyRate) + monthlyAddition;
      totalInvested += monthlyAddition;

      if (m % 12 === 0) {
        const year = m / 12;
        const prevYearBalance = year === 1 ? initialDeposit : yearlyData[year - 2].totalBalance;
        const interestEarnedYear = Math.round(balance - prevYearBalance - (monthlyAddition * 12));
        yearlyData.push({
          year,
          totalInvested,
          interestEarnedYear,
          totalBalance: Math.round(balance),
        });
      }
    }

    const totalInterest = Math.max(0, Math.round(balance - totalInvested));
    const multiple = totalInvested > 0 ? (balance / totalInvested).toFixed(2) : "1.0";

    return {
      finalBalance: Math.round(balance),
      totalInvested,
      totalInterest,
      multiple,
      yearlyData,
    };
  }, [initialDeposit, monthlyAddition, annualRate, years]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Compound Interest Calculator</h2>
            <p className="text-xs text-slate-400">Simulasikan pertumbuhan investasi masa depan dengan kekuatan bunga majemuk</p>
          </div>
        </div>
      </div>

      {/* Input Sliders & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inputs */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <h3 className="text-sm font-bold text-white mb-2">Parameter Investasi</h3>

          {/* Initial Deposit */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Setoran Modal Awal</span>
              <span className="font-mono font-bold text-white">{formatIDR(initialDeposit)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={100000000}
              step={1000000}
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Monthly Addition */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Setoran Rutin Bulanan</span>
              <span className="font-mono font-bold text-white">{formatIDR(monthlyAddition)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={20000000}
              step={250000}
              value={monthlyAddition}
              onChange={(e) => setMonthlyAddition(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Annual Return Rate */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Estimasi Imbal Hasil Tahunan (%)</span>
              <span className="font-mono font-bold text-emerald-400">{annualRate}% / thn</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={0.5}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Duration in Years */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Jangka Waktu Investasi</span>
              <span className="font-mono font-bold text-white">{years} Tahun</span>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Quick preset buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Preset Cepat:</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setInitialDeposit(5000000); setMonthlyAddition(1000000); setAnnualRate(8); setYears(5); }}
                className="text-emerald-400 hover:underline"
              >
                Konservatif
              </button>
              &bull;
              <button
                onClick={() => { setInitialDeposit(20000000); setMonthlyAddition(3000000); setAnnualRate(12); setYears(15); }}
                className="text-emerald-400 hover:underline"
              >
                Agresif
              </button>
            </div>
          </div>
        </div>

        {/* Results Overview */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/20">
              <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider block mb-1">
                Estimasi Total Portofolio Masa Depan
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {formatIDR(results.finalBalance)}
              </div>
              <div className="mt-2 text-xs text-emerald-400/80 flex items-center gap-1 font-medium">
                <ArrowUpRight className="h-4 w-4" />
                Pertumbuhan {results.multiple}x lipat dari total modal yang disetor
              </div>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <span className="text-xs text-slate-400 block mb-1">Total Modal Disetor</span>
                <span className="text-lg font-bold text-slate-200 font-mono">{formatIDR(results.totalInvested)}</span>
                <div className="text-[11px] text-slate-500 mt-1">
                  {Math.round((results.totalInvested / results.finalBalance) * 100)}% dari portofolio
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <span className="text-xs text-emerald-400 block mb-1">Total Akumulasi Bunga (Gain)</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{formatIDR(results.totalInterest)}</span>
                <div className="text-[11px] text-emerald-500/80 mt-1">
                  +{Math.round((results.totalInterest / results.totalInvested) * 100)}% keuntungan murni
                </div>
              </div>
            </div>

            {/* Progress Bar comparison */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-500 h-full"
                  style={{ width: `${(results.totalInvested / results.finalBalance) * 100}%` }}
                  title="Modal Pokok"
                />
                <div
                  className="bg-emerald-400 h-full"
                  style={{ width: `${(results.totalInterest / results.finalBalance) * 100}%` }}
                  title="Keuntungan Bunga Majemuk"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" /> Modal Pokok</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Keuntungan Majemuk</span>
              </div>
            </div>
          </div>

          {/* Yearly Amortization / Progression Table */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Jadwal Pertumbuhan Tiap Tahun</span>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 text-[10px] text-slate-400 bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Tahun</th>
                    <th className="py-2 px-3">Total Modal</th>
                    <th className="py-2 px-3">Gain Tahunan</th>
                    <th className="py-2 px-3 text-right">Saldo Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {results.yearlyData.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-900/40">
                      <td className="py-1.5 px-3 font-semibold text-white">Th {row.year}</td>
                      <td className="py-1.5 px-3 text-slate-400">{formatIDR(row.totalInvested)}</td>
                      <td className="py-1.5 px-3 text-emerald-400">+{formatIDR(row.interestEarnedYear)}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-white">{formatIDR(row.totalBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
