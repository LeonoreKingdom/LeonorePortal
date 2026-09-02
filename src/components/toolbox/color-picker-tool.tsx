"use client";

import { useState, useMemo } from "react";
import { 
  Palette, 
  Copy, 
  Check, 
  Pipette, 
  Sparkles, 
  Sliders, 
  Layers 
} from "lucide-react";

// Convert HEX to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert RGB to CMYK
function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rPrime = r / 255;
  const gPrime = g / 255;
  const bPrime = b / 255;
  const k = 1 - Math.max(rPrime, gPrime, bPrime);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - rPrime - k) / (1 - k);
  const m = (1 - gPrime - k) / (1 - k);
  const y = (1 - bPrime - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

const PRESET_PALETTES = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Sky", hex: "#0ea5e9" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Orange", hex: "#f97316" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Slate", hex: "#64748b" },
];

export function ColorPickerTool() {
  const [currentColor, setCurrentColor] = useState<string>("#6366f1");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const rgb = useMemo(() => hexToRgb(currentColor) || { r: 99, g: 102, b: 241 }, [currentColor]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);

  const colorCodes = useMemo(() => {
    return [
      { label: "HEX", value: currentColor.toUpperCase() },
      { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
      { label: "CSS Variable", value: `--color-primary: ${currentColor};` },
    ];
  }, [currentColor, rgb, hsl, cmyk]);

  // Harmonies
  const complementary = useMemo(() => hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), [hsl]);
  const analogous = useMemo(() => [
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
  ], [hsl]);
  const triadic = useMemo(() => [
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ], [hsl]);
  const shades = useMemo(() => [
    hslToHex(hsl.h, hsl.s, 90),
    hslToHex(hsl.h, hsl.s, 75),
    hslToHex(hsl.h, hsl.s, 60),
    hslToHex(hsl.h, hsl.s, 45),
    hslToHex(hsl.h, hsl.s, 30),
    hslToHex(hsl.h, hsl.s, 15),
  ], [hsl]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleEyedropper = async () => {
    if ("EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setCurrentColor(result.sRGBHex);
        }
      } catch {
        // User cancelled
      }
    } else {
      alert("Browser Anda tidak mendukung EyeDropper API.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Color Display & Interactive Picker */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-6">
          {/* Main Color Swatch */}
          <div
            className="relative h-44 w-full rounded-2xl shadow-xl border border-white/10 flex flex-col justify-between p-4 transition-all duration-300"
            style={{ backgroundColor: currentColor }}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-slate-950/70 backdrop-blur-sm px-2.5 py-1 text-xs font-mono font-bold text-white shadow">
                {currentColor.toUpperCase()}
              </span>

              {"EyeDropper" in (typeof window !== "undefined" ? window : {}) && (
                <button
                  type="button"
                  onClick={handleEyedropper}
                  title="Ambil warna dari layar"
                  className="rounded-xl bg-slate-950/70 p-2 text-white hover:bg-slate-950 transition-colors shadow"
                >
                  <Pipette className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="text-right">
              <span className="rounded-md bg-slate-950/70 backdrop-blur-sm px-2 py-0.5 text-[11px] font-mono text-slate-300">
                RGB ({rgb.r}, {rgb.g}, {rgb.b})
              </span>
            </div>
          </div>

          {/* Native Picker & Input */}
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Pilih Warna (Spectrum):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="h-12 w-16 cursor-pointer rounded-xl border border-slate-800 bg-slate-950 p-1"
              />
              <input
                type="text"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-mono font-bold text-white uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Presets Grid */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Preset Warna Cepat:
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_PALETTES.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setCurrentColor(p.hex)}
                  title={p.name}
                  className={`h-8 rounded-xl border transition-all ${
                    currentColor.toLowerCase() === p.hex.toLowerCase()
                      ? "ring-2 ring-white scale-105"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                  style={{ backgroundColor: p.hex, borderColor: "rgba(255,255,255,0.15)" }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Formats and Harmonies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Format Copy Rows */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
              Salin Kode Warna
            </h3>

            <div className="space-y-2.5">
              {colorCodes.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-xs font-mono"
                >
                  <div>
                    <span className="text-slate-500 mr-2 text-[10px] uppercase">{item.label}</span>
                    <span className="font-semibold text-slate-200">{item.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(item.value, item.label)}
                    className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                  >
                    {copiedFormat === item.label ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Color Harmonies & Shades */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white">
              Harmoni & Gradasi Warna
            </h3>

            {/* Shades */}
            <div>
              <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Gradasi Kecerahan (Shades):</div>
              <div className="grid grid-cols-6 gap-2">
                {shades.map((hex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentColor(hex)}
                    className="h-9 rounded-xl border border-white/10 hover:scale-105 transition-transform"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>

            {/* Complementary & Triadic */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Komplementer:</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentColor(complementary)}
                    className="h-10 flex-1 rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow hover:scale-105 transition-transform"
                    style={{ backgroundColor: complementary }}
                  >
                    {complementary.toUpperCase()}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Triadic:</div>
                <div className="flex gap-2">
                  {triadic.map((hex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentColor(hex)}
                      className="h-10 flex-1 rounded-xl border border-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow hover:scale-105 transition-transform"
                      style={{ backgroundColor: hex }}
                    >
                      {hex.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}