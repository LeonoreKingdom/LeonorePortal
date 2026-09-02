"use client";

import { useState, useMemo } from "react";
import { 
  Scale, 
  Ruler, 
  Thermometer, 
  HardDrive, 
  Box, 
  ArrowRightLeft, 
  Copy, 
  Check 
} from "lucide-react";

type UnitType = "length" | "weight" | "temperature" | "digital" | "volume";

interface UnitOption {
  id: string;
  name: string;
  symbol: string;
  toBase?: (val: number) => number;
  fromBase?: (val: number) => number;
  rate?: number; // relative to base
}

const UNIT_CATEGORIES: Record<UnitType, { name: string; icon: React.ComponentType<{ className?: string }>; base: string; units: UnitOption[] }> = {
  length: {
    name: "Panjang",
    icon: Ruler,
    base: "m",
    units: [
      { id: "km", name: "Kilometer", symbol: "km", rate: 1000 },
      { id: "m", name: "Meter", symbol: "m", rate: 1 },
      { id: "cm", name: "Centimeter", symbol: "cm", rate: 0.01 },
      { id: "mm", name: "Millimeter", symbol: "mm", rate: 0.001 },
      { id: "mi", name: "Mil (Mile)", symbol: "mi", rate: 1609.344 },
      { id: "yd", name: "Yard", symbol: "yd", rate: 0.9144 },
      { id: "ft", name: "Kaki (Feet)", symbol: "ft", rate: 0.3048 },
      { id: "in", name: "Inci (Inch)", symbol: "in", rate: 0.0254 },
    ],
  },
  weight: {
    name: "Berat",
    icon: Scale,
    base: "kg",
    units: [
      { id: "ton", name: "Metrik Ton", symbol: "t", rate: 1000 },
      { id: "kg", name: "Kilogram", symbol: "kg", rate: 1 },
      { id: "g", name: "Gram", symbol: "g", rate: 0.001 },
      { id: "mg", name: "Milligram", symbol: "mg", rate: 0.000001 },
      { id: "lb", name: "Pound (lbs)", symbol: "lb", rate: 0.45359237 },
      { id: "oz", name: "Ounce", symbol: "oz", rate: 0.02834952 },
    ],
  },
  temperature: {
    name: "Suhu",
    icon: Thermometer,
    base: "c",
    units: [
      {
        id: "c",
        name: "Celsius",
        symbol: "°C",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: "f",
        name: "Fahrenheit",
        symbol: "°F",
        toBase: (v) => (v - 32) * (5 / 9),
        fromBase: (v) => v * (9 / 5) + 32,
      },
      {
        id: "k",
        name: "Kelvin",
        symbol: "K",
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
      {
        id: "r",
        name: "Reamur",
        symbol: "°R",
        toBase: (v) => v * 1.25,
        fromBase: (v) => v * 0.8,
      },
    ],
  },
  digital: {
    name: "Penyimpanan Digital",
    icon: HardDrive,
    base: "mb",
    units: [
      { id: "b", name: "Byte", symbol: "B", rate: 0.000001 },
      { id: "kb", name: "Kilobyte", symbol: "KB", rate: 0.001 },
      { id: "mb", name: "Megabyte", symbol: "MB", rate: 1 },
      { id: "gb", name: "Gigabyte", symbol: "GB", rate: 1000 },
      { id: "tb", name: "Terabyte", symbol: "TB", rate: 1000000 },
    ],
  },
  volume: {
    name: "Volume",
    icon: Box,
    base: "l",
    units: [
      { id: "m3", name: "Meter Kubik", symbol: "m³", rate: 1000 },
      { id: "l", name: "Liter", symbol: "L", rate: 1 },
      { id: "ml", name: "Milliliter", symbol: "mL", rate: 0.001 },
      { id: "gal", name: "Gallon (US)", symbol: "gal", rate: 3.78541 },
    ],
  },
};

export function UnitConverterTool() {
  const [activeCategory, setActiveCategory] = useState<UnitType>("length");
  const [inputValue, setInputValue] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("cm");
  const [copied, setCopied] = useState(false);

  const categoryConfig = UNIT_CATEGORIES[activeCategory];

  // Handle category change
  const handleSelectCategory = (cat: UnitType) => {
    setActiveCategory(cat);
    const units = UNIT_CATEGORIES[cat].units;
    setFromUnit(units[0].id);
    setToUnit(units[1]?.id || units[0].id);
  };

  // Convert calculation
  const convertValue = (val: number, fromId: string, toId: string): number => {
    if (isNaN(val)) return 0;
    const from = categoryConfig.units.find((u) => u.id === fromId);
    const to = categoryConfig.units.find((u) => u.id === toId);
    if (!from || !to) return 0;

    // Temperature custom formulas
    if (activeCategory === "temperature") {
      const base = from.toBase ? from.toBase(val) : val;
      return to.fromBase ? to.fromBase(base) : base;
    }

    // Rate based conversion
    const baseValue = val * (from.rate || 1);
    return baseValue / (to.rate || 1);
  };

  const parsedInput = parseFloat(inputValue) || 0;
  const convertedResult = useMemo(() => {
    const res = convertValue(parsedInput, fromUnit, toUnit);
    return Number(res.toFixed(8));
  }, [parsedInput, fromUnit, toUnit, activeCategory]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(String(convertedResult));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Comparison across all units in active category
  const allComparisons = useMemo(() => {
    return categoryConfig.units.map((u) => ({
      ...u,
      value: Number(convertValue(parsedInput, fromUnit, u.id).toFixed(6)),
    }));
  }, [parsedInput, fromUnit, activeCategory]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        {(Object.keys(UNIT_CATEGORIES) as UnitType[]).map((catKey) => {
          const cat = UNIT_CATEGORIES[catKey];
          const Icon = cat.icon;
          const isActive = activeCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => handleSelectCategory(catKey)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Conversion Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* FROM UNIT INPUT */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-medium text-slate-400">Dari:</label>
            <div className="space-y-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-lg font-bold font-mono text-white focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {categoryConfig.units.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center md:col-span-1 py-2 md:py-0">
            <button
              onClick={handleSwap}
              title="Tukar Satuan"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 shadow-md transition-all active:scale-95"
            >
              <ArrowRightLeft className="h-5 w-5" />
            </button>
          </div>

          {/* TO UNIT RESULT */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-medium text-slate-400">Ke:</label>
            <div className="space-y-2">
              <div className="relative flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                <span className="text-lg font-bold font-mono text-indigo-300 truncate">
                  {convertedResult}
                </span>
                <button
                  onClick={handleCopy}
                  title="Salin hasil"
                  className="rounded p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-semibold text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                {categoryConfig.units.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* All Units Comparison Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-4">
          Tabel Konversi Semua Satuan {categoryConfig.name}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {allComparisons.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-3 border transition-all ${
                item.id === toUnit
                  ? "border-indigo-500/50 bg-indigo-950/20"
                  : "border-slate-800/80 bg-slate-950/80"
              }`}
            >
              <div className="text-[11px] text-slate-400 truncate">{item.name}</div>
              <div className="mt-1 text-sm font-bold font-mono text-slate-100 truncate">
                {item.value} <span className="text-xs font-normal text-slate-500">{item.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}