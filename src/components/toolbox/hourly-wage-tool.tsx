"use client";

import { useState, useMemo } from "react";
import { 
  BadgeDollarSign, 
  Briefcase, 
  Clock, 
  Receipt, 
  Calendar, 
  Sparkles,
  PieChart
} from "lucide-react";

export function HourlyWageTool() {
  const [targetMonthlyNet, setTargetMonthlyNet] = useState<number>(15000000); // 15 jt bersih
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(2000000); // 2 jt biaya operasional
  const [taxRate, setTaxRate] = useState<number>(10); // 10% estimasi pajak
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState<number>(25); // 25 jam kerja riil/minggu
  const [vacationWeeks, setVacationWeeks] = useState<number>(4); // 4 minggu libur/tahun

  const calculation = useMemo(() => {
    // 1. Annual Net Target
    const annualNet = targetMonthlyNet * 12;
    // 2. Annual Expenses
    const annualExpenses = monthlyExpenses * 12;
    // 3. Pre-tax target: (Net + Expenses) / (1 - TaxRate)
    const effectiveTaxMultiplier = 1 - (taxRate / 100);
    const annualGrossTarget = (annualNet / (effectiveTaxMultiplier || 1)) + annualExpenses;
    const annualTaxes = annualGrossTarget - annualNet - annualExpenses;

    // 4. Working weeks & billable hours
    const workingWeeks = Math.max(1, 52 - vacationWeeks);
    const totalAnnualBillableHours = workingWeeks * billableHoursPerWeek;

    // 5. Hourly rate
    const requiredHourlyRate = totalAnnualBillableHours > 0 
      ? Math.round(annualGrossTarget / totalAnnualBillableHours) 
      : 0;

    const dailyRate = requiredHourlyRate * 8;
    const weeklyRate = requiredHourlyRate * billableHoursPerWeek;
    const monthlyGross = Math.round(annualGrossTarget / 12);

    return {
      requiredHourlyRate,
      dailyRate,
      weeklyRate,
      monthlyGross,
      annualGrossTarget,
      annualTaxes,
      annualExpenses,
      annualNet,
      workingWeeks,
      totalAnnualBillableHours,
    };
  }, [targetMonthlyNet, monthlyExpenses, taxRate, billableHoursPerWeek, vacationWeeks]);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BadgeDollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Hourly Wage & Rate Calculator</h2>
            <p className="text-xs text-slate-400">Hitung tarif per jam riil freelancer & profesional setelah pajak dan biaya operasional</p>
          </div>
        </div>
      </div>

      {/* Grid Inputs & Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <h3 className="text-sm font-bold text-white mb-2">Target & Estimasi Biaya</h3>

          {/* Target Monthly Net */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Target Gaji Bersih / Bulan (Take-Home)</span>
              <span className="font-mono font-bold text-white">{formatIDR(targetMonthlyNet)}</span>
            </div>
            <input
              type="range"
              min={3000000}
              max={50000000}
              step={500000}
              value={targetMonthlyNet}
              onChange={(e) => setTargetMonthlyNet(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Operational Expenses */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Biaya Operasional / Bulan (Internet, Software, Hardware)</span>
              <span className="font-mono font-bold text-white">{formatIDR(monthlyExpenses)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={15000000}
              step={250000}
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Tax Rate */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Estimasi Pajak Penghasilan (%)</span>
              <span className="font-mono font-bold text-emerald-400">{taxRate}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={35}
              step={0.5}
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-4">
            {/* Billable hours / week */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Jam Tertagih / Minggu</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={billableHoursPerWeek}
                  onChange={(e) => setBillableHoursPerWeek(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-500">Jam</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Umumnya 20-30 jam</span>
            </div>

            {/* Vacation weeks */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Cuti / Libur per Tahun</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={vacationWeeks}
                  onChange={(e) => setVacationWeeks(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-500">Minggu</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{calculation.workingWeeks} mgg kerja efektif</span>
            </div>
          </div>
        </div>

        {/* Right Recommended Rates */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-950 border border-emerald-500/20">
              <span className="text-xs text-emerald-400 uppercase font-semibold tracking-wider block mb-1">
                Rekomendasi Tarif Per Jam Minimum
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {formatIDR(calculation.requiredHourlyRate)} <span className="text-sm font-normal text-slate-400">/ jam</span>
              </div>
              <div className="mt-2 text-xs text-slate-300">
                Total jam kerja tertagih: <strong>{calculation.totalAnnualBillableHours} jam/tahun</strong>
              </div>
            </div>

            {/* Sub-rates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <span className="text-xs text-slate-400 block mb-0.5">Tarif Harian (Day Rate - 8 Jam)</span>
                <span className="text-base font-bold text-slate-200 font-mono">{formatIDR(calculation.dailyRate)}</span>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
                <span className="text-xs text-slate-400 block mb-0.5">Target Tagihan Kotor Bulanan</span>
                <span className="text-base font-bold text-emerald-400 font-mono">{formatIDR(calculation.monthlyGross)}</span>
              </div>
            </div>

            {/* Income Distribution Stack */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300 block">Distribusi Tagihan Tahunan ({formatIDR(calculation.annualGrossTarget)})</span>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${(calculation.annualNet / calculation.annualGrossTarget) * 100}%` }}
                  title="Gaji Bersih"
                />
                <div
                  className="bg-sky-500 h-full"
                  style={{ width: `${(calculation.annualExpenses / calculation.annualGrossTarget) * 100}%` }}
                  title="Biaya Operasional"
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${(calculation.annualTaxes / calculation.annualGrossTarget) * 100}%` }}
                  title="Pajak"
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Bersih: {formatIDR(calculation.annualNet)}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-500" /> Biaya: {formatIDR(calculation.annualExpenses)}</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Pajak: {formatIDR(calculation.annualTaxes)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
