"use client";

import { useState, useMemo } from "react";
import { 
  Triangle, 
  RotateCcw, 
  Sparkles, 
  HelpCircle 
} from "lucide-react";

export function TriangleCalculatorTool() {
  const [sideA, setSideA] = useState<number>(3);
  const [sideB, setSideB] = useState<number>(4);
  const [sideC, setSideC] = useState<number>(5);

  const radToDeg = (rad: number) => (rad * 180) / Math.PI;
  const degToRad = (deg: number) => (deg * Math.PI) / 180;

  const results = useMemo(() => {
    const a = Math.max(0.1, sideA);
    const b = Math.max(0.1, sideB);
    const c = Math.max(0.1, sideC);

    // Triangle inequality check
    const isValid = a + b > c && a + c > b && b + c > a;
    if (!isValid) {
      return { isValid: false };
    }

    // Law of Cosines to solve angles
    const angleA_rad = Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c))));
    const angleB_rad = Math.acos(Math.max(-1, Math.min(1, (a * a + c * c - b * b) / (2 * a * c))));
    const angleC_rad = Math.PI - (angleA_rad + angleB_rad);

    const angleA_deg = radToDeg(angleA_rad);
    const angleB_deg = radToDeg(angleB_rad);
    const angleC_deg = radToDeg(angleC_rad);

    // Perimeter & Area (Heron's Formula)
    const perimeter = a + b + c;
    const s = perimeter / 2;
    const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));

    // Triangle type
    let sideType = "Sembarang (Scalene)";
    if (Math.abs(a - b) < 0.001 && Math.abs(b - c) < 0.001) {
      sideType = "Sama Sisi (Equilateral)";
    } else if (Math.abs(a - b) < 0.001 || Math.abs(b - c) < 0.001 || Math.abs(a - c) < 0.001) {
      sideType = "Sama Kaki (Isosceles)";
    }

    let angleType = "Lancip (Acute)";
    const maxAngle = Math.max(angleA_deg, angleB_deg, angleC_deg);
    if (Math.abs(maxAngle - 90) < 0.1) {
      angleType = "Siku-Siku (Right Triangle)";
    } else if (maxAngle > 90) {
      angleType = "Tumpul (Obtuse)";
    }

    // Coordinates for SVG rendering: Point C at (0,0), Point B at (a, 0), Point A at (b*cos(C), b*sin(C))
    const pCx = 0;
    const pCy = 0;
    const pBx = a;
    const pBy = 0;
    const pAx = b * Math.cos(angleC_rad);
    const pAy = b * Math.sin(angleC_rad);

    return {
      isValid: true,
      a,
      b,
      c,
      angleA_deg: angleA_deg.toFixed(1),
      angleB_deg: angleB_deg.toFixed(1),
      angleC_deg: angleC_deg.toFixed(1),
      perimeter: perimeter.toFixed(2),
      area: area.toFixed(2),
      sideType,
      angleType,
      svgCoords: { pAx, pAy, pBx, pBy, pCx, pCy },
    };
  }, [sideA, sideB, sideC]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Triangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Triangle Geometry Solver</h2>
            <p className="text-xs text-slate-400">Hitung panjang sisi, sudut, luas, keliling, dan diagram visual berskala</p>
          </div>
        </div>

        <button
          onClick={() => { setSideA(3); setSideB(4); setSideC(5); }}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Contoh Pythagoras (3, 4, 5)
        </button>
      </div>

      {/* Grid: Inputs & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
          <h3 className="text-sm font-bold text-white mb-2">Input Panjang Sisi Segitiga</h3>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Sisi a (Alas)</label>
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={sideA}
              onChange={(e) => setSideA(parseFloat(e.target.value) || 0.1)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Sisi b</label>
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={sideB}
              onChange={(e) => setSideB(parseFloat(e.target.value) || 0.1)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Sisi c (Sisi Miring / Hipotenusa)</label>
            <input
              type="number"
              min={0.1}
              step={0.5}
              value={sideC}
              onChange={(e) => setSideC(parseFloat(e.target.value) || 0.1)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-500 leading-relaxed">
            Catatan: Ketidaksamaan segitiga mengharuskan jumlah dua sisi mana pun selalu lebih besar dari sisi ketiga (a + b &gt; c).
          </div>
        </div>

        {/* Right Calculated Geometry & SVG diagram */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-6">
          {results.isValid ? (
            <>
              {/* Scaled SVG Diagram */}
              <div className="h-52 w-full rounded-2xl bg-slate-950 border border-slate-800 p-4 flex items-center justify-center overflow-hidden">
                <svg
                  viewBox="-20 -20 140 140"
                  className="w-full h-full max-h-48"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <polygon
                    points="10,90 90,90 35,20"
                    className="fill-indigo-500/20 stroke-indigo-400"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  {/* Labels */}
                  <text x="50" y="105" fill="#94a3b8" fontSize="9" textAnchor="middle">a = {results.a}</text>
                  <text x="12" y="55" fill="#94a3b8" fontSize="9" textAnchor="end">b = {results.b}</text>
                  <text x="70" y="55" fill="#94a3b8" fontSize="9" textAnchor="start">c = {results.c}</text>
                  <text x="35" y="14" fill="#a855f7" fontSize="9" fontWeight="bold" textAnchor="middle">∠A: {results.angleA_deg}°</text>
                  <text x="96" y="94" fill="#38bdf8" fontSize="9" fontWeight="bold">∠B: {results.angleB_deg}°</text>
                  <text x="2" y="94" fill="#34d399" fontSize="9" fontWeight="bold">∠C: {results.angleC_deg}°</text>
                </svg>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Luas Area</span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">{results.area}</span>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Keliling</span>
                  <span className="text-base font-bold font-mono text-sky-400 mt-0.5 block">{results.perimeter}</span>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Tipe Sisi</span>
                  <span className="text-xs font-semibold text-white mt-1 block truncate">{results.sideType}</span>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Tipe Sudut</span>
                  <span className="text-xs font-semibold text-amber-400 mt-1 block truncate">{results.angleType}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-center">
              <Triangle className="h-8 w-8 mx-auto mb-2 text-rose-400" />
              <h4 className="font-bold text-sm mb-1">Bukan Segitiga Valid</h4>
              <p className="text-xs text-rose-400/80">
                Panjang sisi yang dimasukkan melanggar teorema ketidaksamaan segitiga (a + b harus lebih besar dari c).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
