"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { 
  Palette, 
  Upload, 
  Copy, 
  Check, 
  Sparkles, 
  Code,
  Image as ImageIcon
} from "lucide-react";

interface ColorItem {
  hex: string;
  rgb: string;
  hsl: string;
  pct: number;
}

export function ColorExtractorTool() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load a demo gradient canvas on mount
  useEffect(() => {
    loadDemoImage();
  }, []);

  const loadDemoImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, "#4f46e5");
    grad.addColorStop(0.3, "#06b6d4");
    grad.addColorStop(0.7, "#10b981");
    grad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    const dataUrl = canvas.toDataURL("image/png");
    setImageSrc(dataUrl);
    extractColorsFromUrl(dataUrl);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setImageSrc(url);
      extractColorsFromUrl(url);
    };
    reader.readAsDataURL(file);
  };

  const extractColorsFromUrl = (url: string) => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setLoading(false);
        return;
      }

      // Resize for fast sampling
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      const imageData = ctx.getImageData(0, 0, 100, 100).data;
      const bucket: Record<string, { count: number; r: number; g: number; b: number }> = {};

      // Quantize to 16-color step
      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a < 128) continue; // skip transparent pixels

        // Quantize
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;

        if (!bucket[key]) {
          bucket[key] = { count: 0, r, g, b };
        }
        bucket[key].count++;
      }

      const totalPixels = Object.values(bucket).reduce((acc, b) => acc + b.count, 0) || 1;
      const sorted = Object.values(bucket)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const extracted: ColorItem[] = sorted.map((item) => {
        const hex = rgbToHex(item.r, item.g, item.b);
        const rgb = `rgb(${item.r}, ${item.g}, ${item.b})`;
        const hsl = rgbToHsl(item.r, item.g, item.b);
        const pct = Math.round((item.count / totalPixels) * 100);
        return { hex, rgb, hsl, pct };
      });

      setColors(extracted);
      setLoading(false);
    };
    img.src = url;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
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
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const cssGradientString = colors.length > 1
    ? `background: linear-gradient(135deg, ${colors.map((c) => c.hex).join(", ")});`
    : "";

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Image Color Palette Extractor</h2>
              <p className="text-xs text-slate-400">Ekstrak palet warna dominan, kode HEX/RGB, dan gradient CSS dari foto Anda</p>
            </div>
          </div>

          <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md self-start sm:self-auto">
            <Upload className="h-4 w-4" />
            <span>Unggah Gambar</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Image Preview & Dominant Swatches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Image Display */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col items-center justify-center min-h-[280px]">
          {imageSrc ? (
            <div className="space-y-3 w-full">
              <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <img src={imageSrc} alt="Preview" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="text-center">
                <button
                  onClick={loadDemoImage}
                  className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Muat Gambar Contoh
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Belum ada gambar yang diunggah</p>
            </div>
          )}
        </div>

        {/* Color Swatches Grid */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="h-4 w-4 text-pink-400" />
            Palet Warna Dominan ({colors.length} Warna)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {colors.map((c, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 flex items-center gap-3.5 hover:border-slate-700 transition-colors"
              >
                <div
                  className="h-12 w-12 rounded-xl border border-white/20 shadow-md shrink-0"
                  style={{ backgroundColor: c.hex }}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white uppercase">{c.hex}</span>
                    <button
                      onClick={() => copyToClipboard(`hex-${i}`, c.hex)}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Salin HEX"
                    >
                      {copiedKey === `hex-${i}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">{c.rgb}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Proporsi: ~{c.pct}%</div>
                </div>
              </div>
            ))}
          </div>

          {/* CSS Gradient Code snippet */}
          {cssGradientString && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Code className="h-3.5 w-3.5 text-indigo-400" /> CSS Gradient
                </span>
                <button
                  onClick={() => copyToClipboard("gradient", cssGradientString)}
                  className="px-2 py-1 rounded bg-slate-800 text-[11px] text-slate-300 hover:text-white flex items-center gap-1"
                >
                  {copiedKey === "gradient" ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  Salin CSS
                </button>
              </div>
              <div
                className="h-7 w-full rounded-lg border border-slate-800"
                style={{ background: `linear-gradient(135deg, ${colors.map((c) => c.hex).join(", ")})` }}
              />
              <pre className="text-[11px] font-mono text-indigo-300 select-all overflow-x-auto">
                {cssGradientString}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
