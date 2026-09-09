"use client";

import { useState, useMemo } from "react";
import { 
  Home, 
  DollarSign, 
  Calendar, 
  Percent, 
  Building, 
  Table, 
  Sparkles 
} from "lucide-react";

interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export function MortgageCalculatorTool() {
  const [propertyPrice, setPropertyPrice] = useState<number>(850000000); // 850 jt
  const [dpPercent, setDpPercent] = useState<number>(20); // 20%
  const [interestRate, setInterestRate] = useState<number>(6.5); // 6.5%
  const [tenorYears, setTenorYears] = useState<number>(15); // 15 tahun

  const results = useMemo(() => {
    const dpAmount = (propertyPrice * dpPercent) / 100;
    const loanAmount = Math.max(0, propertyPrice - dpAmount);
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = tenorYears * 12;

    // Monthly installment formula (Anuitas): M = P * (r * (1+r)^n) / ((1+r)^n - 1)
    let monthlyPayment = 0;
    if (loanAmount > 0 && monthlyRate > 0) {
      monthlyPayment = Math.round(
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
      );
    } else if (loanAmount > 0) {
      monthlyPayment = Math.round(loanAmount / totalMonths);
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = Math.max(0, totalPayment - loanAmount);

    // Amortization Schedule
    const schedule: AmortizationYear[] = [];
    let balance = loanAmount;

    for (let y = 1; y <= tenorYears; y++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;

      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestM = balance * monthlyRate;
        const principalM = monthlyPayment - interestM;
        yearlyInterest += interestM;
        yearlyPrincipal += principalM;
        balance = Math.max(0, balance - principalM);
      }

      schedule.push({
        year: y,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        remainingBalance: Math.round(balance),
      });
    }

    return {
      dpAmount,
      loanAmount,
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    };
  }, [propertyPrice, dpPercent, interestRate, tenorYears]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Mortgage & Loan Calculator</h2>
            <p className="text-xs text-slate-400">Estimasi cicilan bulanan KPR/KPA dan jadwal tabel amortisasi pokok serta bunga</p>
          </div>
        </div>
      </div>

      {/* Grid Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <h3 className="text-sm font-bold text-white mb-2">Simulasi Pinjaman Properti</h3>

          {/* Property Price */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Harga Properti Rumah / Apartemen</span>
              <span className="font-mono font-bold text-white">{formatIDR(propertyPrice)}</span>
            </div>
            <input
              type="range"
              min={100000000}
              max={3000000000}
              step={25000000}
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Down Payment % */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Uang Muka / DP ({dpPercent}%)</span>
              <span className="font-mono font-bold text-emerald-400">{formatIDR(results.dpAmount)}</span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={dpPercent}
              onChange={(e) => setDpPercent(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Suku Bunga % */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Suku Bunga KPR Tahunan (%)</span>
              <span className="font-mono font-bold text-white">{interestRate}% / thn</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={15.0}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Tenor Tahun */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Tenor Pinjaman</span>
              <span className="font-mono font-bold text-white">{tenorYears} Tahun ({tenorYears * 12} Bulan)</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={tenorYears}
              onChange={(e) => setTenorYears(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Installment Result & Amortization */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/20">
              <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider block mb-1">
                Estimasi Cicilan Bulanan KPR
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {formatIDR(results.monthlyPayment)} <span className="text-sm font-normal text-slate-400">/ bulan</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Pokok Pinjaman KPR: <strong className="text-white">{formatIDR(results.loanAmount)}</strong>
              </div>
            </div>

            {/* Total Interest & Cost Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <span className="text-xs text-slate-400 block mb-0.5">Total Bunga Pinjaman</span>
                <span className="text-base font-bold text-amber-400 font-mono">{formatIDR(results.totalInterest)}</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <span className="text-xs text-slate-400 block mb-0.5">Total Pengembalian (Pokok + Bunga)</span>
                <span className="text-base font-bold text-white font-mono">{formatIDR(results.totalPayment)}</span>
              </div>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">Tabel Jadwal Amortisasi Tahunan</span>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 text-[10px] text-slate-400 bg-slate-900/50 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Tahun</th>
                    <th className="py-2 px-3">Pokok Terbayar</th>
                    <th className="py-2 px-3">Bunga Terbayar</th>
                    <th className="py-2 px-3 text-right">Sisa Hutang Pokok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-300">
                  {results.schedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-900/40">
                      <td className="py-1.5 px-3 font-semibold text-white">Th {row.year}</td>
                      <td className="py-1.5 px-3 text-indigo-400">{formatIDR(row.principalPaid)}</td>
                      <td className="py-1.5 px-3 text-amber-400">{formatIDR(row.interestPaid)}</td>
                      <td className="py-1.5 px-3 text-right font-medium text-slate-200">{formatIDR(row.remainingBalance)}</td>
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
