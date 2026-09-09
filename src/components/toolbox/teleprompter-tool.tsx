"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Tv, 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  FlipHorizontal, 
  Type, 
  Gauge, 
  Sparkles 
} from "lucide-react";

const SAMPLE_SCRIPT = `Halo rekan-rekan semuanya! Selamat datang di presentasi Leonore Kingdom.

Hari ini saya akan membagikan kemajuan proyek digital dan inovasi arsitektur terbaru kita.

Pertama, kita telah berhasil mengoptimalkan sistem privasi client-side di mana seluruh pemrosesan data, berkas dokumen, dan grafis berjalan 100% di browser pengguna tanpa melewati server pihak ketiga.

Kedua, integrasi antarmuka yang cepat dan responsif memberikan kemudahan navigasi bagi setiap anggota tim.

Terima kasih atas perhatian Anda, mari kita mulai sesi tanya jawab!`;

export function TeleprompterTool() {
  const [script, setScript] = useState(SAMPLE_SCRIPT);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1 - 10
  const [fontSize, setFontSize] = useState(32); // 18 - 64 px
  const [isMirrored, setIsMirrored] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isPlaying) {
      scrollIntervalRef.current = setInterval(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop += speed * 0.8;
        }
      }, 25);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isPlaying, speed]);

  // Spacebar toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleReset = () => {
    setIsPlaying(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-black p-6 flex flex-col" : ""}`}>
      {/* Control Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Tv className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">In-Browser Teleprompter</h2>
            <p className="text-xs text-slate-400">Tekan Spasi untuk Mulai/Jeda &bull; Mendukung mode cermin untuk kaca prompter</p>
          </div>
        </div>

        {/* Play / Pause / Reset Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
              isPlaying
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{isPlaying ? "Jeda (Pause)" : "Mulai Gulir"}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Kembali ke Awal"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isMirrored
                ? "bg-indigo-600 text-white border-indigo-500"
                : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
            }`}
            title="Mirror Cermin Horizontal"
          >
            <FlipHorizontal className="h-4 w-4" />
            <span>Mirror</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Sliders: Speed & Font Size */}
        <div className="w-full pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Gauge className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Kecepatan ({speed}x):</span>
            <input
              type="range"
              min={1}
              max={10}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-28 accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3">
            <Type className="h-4 w-4 text-pink-400 shrink-0" />
            <span className="text-slate-400">Ukuran Teks ({fontSize}px):</span>
            <input
              type="range"
              min={18}
              max={64}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-28 accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Display Frame */}
      <div
        ref={containerRef}
        className={`relative rounded-3xl border border-slate-800 bg-black p-8 overflow-y-auto scroll-smooth select-none ${
          isFullscreen ? "flex-1 min-h-0" : "h-[480px]"
        }`}
        style={{
          transform: isMirrored ? "scaleX(-1)" : "none",
        }}
      >
        {/* Cue Focus Bar */}
        <div className="sticky top-1/3 w-full border-b border-indigo-500/30 pointer-events-none -mt-3 mb-3 z-10 flex items-center justify-between">
          <span className="text-[10px] text-indigo-400/60 uppercase tracking-wider">Garis Fokus Baca</span>
          <span className="text-[10px] text-indigo-400/60 uppercase tracking-wider">▲</span>
        </div>

        {/* Script Content */}
        <div
          className="font-sans text-slate-100 font-semibold leading-relaxed tracking-wide max-w-4xl mx-auto py-32 whitespace-pre-line text-center"
          style={{ fontSize: `${fontSize}px` }}
        >
          {script}
        </div>
      </div>

      {/* Textarea for Script Editing */}
      {!isFullscreen && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Edit Naskah / Teks Pidato</span>
            <button
              onClick={() => setScript(SAMPLE_SCRIPT)}
              className="text-indigo-400 hover:underline flex items-center gap-1 font-normal"
            >
              <Sparkles className="h-3 w-3" /> Muat Naskah Contoh
            </button>
          </div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none resize-y"
            placeholder="Ketik atau tempel teks naskah Anda di sini..."
          />
        </div>
      )}
    </div>
  );
}
