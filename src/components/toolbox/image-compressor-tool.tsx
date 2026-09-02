"use client";

import { useState } from "react";
import { 
  FileDown, 
  Upload, 
  Download, 
  Sliders, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Zap,
  Image as ImageIcon
} from "lucide-react";

interface CompressedItem {
  id: string;
  name: string;
  originalSize: number;
  compressedSize: number;
  originalUrl: string;
  compressedUrl: string;
  savingsPercent: number;
  width: number;
  height: number;
}

export function ImageCompressorTool() {
  const [items, setItems] = useState<CompressedItem[]>([]);
  const [quality, setQuality] = useState<number>(75);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp" | "image/png">("image/webp");
  const [maxDimension, setMaxDimension] = useState<number>(1920);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const processImage = (file: File): Promise<CompressedItem> => {
    return new Promise((resolve) => {
      const originalUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = originalUrl;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedUrl = URL.createObjectURL(blob);
              const savings = Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100));
              resolve({
                id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: file.name.replace(/\.[^/.]+$/, "") + (format === "image/webp" ? ".webp" : format === "image/jpeg" ? ".jpg" : ".png"),
                originalSize: file.size,
                compressedSize: blob.size,
                originalUrl,
                compressedUrl,
                savingsPercent: savings,
                width,
                height,
              });
            }
          },
          format,
          quality / 100
        );
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    const newItems: CompressedItem[] = [];

    for (const f of files) {
      const item = await processImage(f);
      newItems.push(item);
    }

    setItems((prev) => [...newItems, ...prev]);
    setIsProcessing(false);
  };

  const recompressAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    const updated: CompressedItem[] = [];

    for (const item of items) {
      const img = new Image();
      img.src = item.originalUrl;
      await new Promise((res) => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedUrl = URL.createObjectURL(blob);
              const savings = Math.max(0, Math.round(((item.originalSize - blob.size) / item.originalSize) * 100));
              updated.push({
                ...item,
                compressedSize: blob.size,
                compressedUrl,
                savingsPercent: savings,
                width,
                height,
              });
            }
            res(null);
          }, format, quality / 100);
        };
      });
    }

    setItems(updated);
    setIsProcessing(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + ["B", "KB", "MB"][i];
  };

  const totalOriginal = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressed = items.reduce((acc, curr) => acc + curr.compressedSize, 0);
  const totalSavings = totalOriginal > 0 ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Settings Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Parameter Kompresi Gambar</h3>
          </div>
          {items.length > 0 && (
            <button
              onClick={recompressAll}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold transition-all"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Terapkan Ulang ({quality}%)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Kualitas: {quality}%</label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Maksimum Kompres (10%)</span>
              <span>Rekomendasi (75%)</span>
              <span>Tinggi (95%)</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Format Output:</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as any)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
            >
              <option value="image/webp">WebP (Ukuran Paling Ringkas)</option>
              <option value="image/jpeg">JPEG (Universal)</option>
              <option value="image/png">PNG</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Batas Maksimal Dimensi:</label>
            <select
              value={maxDimension}
              onChange={(e) => setMaxDimension(parseInt(e.target.value))}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
            >
              <option value={3840}>4K Ultra (3840px)</option>
              <option value={1920}>Full HD (1920px - Standar)</option>
              <option value={1280}>HD Ready (1280px)</option>
              <option value={800}>Web Banner (800px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-750 hover:border-emerald-500/50 rounded-3xl bg-slate-900/60 cursor-pointer transition-all">
        <Upload className="h-10 w-10 text-emerald-400 mb-2" />
        <span className="text-xs font-bold text-white">Klik atau Tarik Foto / Gambar ke Sini (Bisa Banyak Sekaligus)</span>
        <span className="text-[11px] text-slate-400 mt-1">Mendukung PNG, JPG, JPEG, WebP, GIF, BMP</span>
        <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
      </label>

      {/* Overview Stats */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-xs text-slate-400">Total Ukuran Awal</div>
            <div className="text-lg font-bold text-slate-200">{formatBytes(totalOriginal)}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-xs text-slate-400">Total Setelah Kompresi</div>
            <div className="text-lg font-bold text-emerald-400">{formatBytes(totalCompressed)}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="text-xs text-emerald-300">Total Penghematan Ukuran</div>
            <div className="text-lg font-extrabold text-emerald-400">Hemat {totalSavings}%</div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex gap-4 items-center shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.compressedUrl} alt={item.name} className="h-20 w-20 rounded-xl object-cover bg-slate-950 shrink-0" />
            
            <div className="flex-1 min-w-0 space-y-1">
              <div className="text-xs font-bold text-white truncate">{item.name}</div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="line-through text-slate-500">{formatBytes(item.originalSize)}</span>
                <span className="text-emerald-400 font-bold">{formatBytes(item.compressedSize)}</span>
                <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 font-bold">
                  -{item.savingsPercent}%
                </span>
              </div>
              <div className="text-[10px] text-slate-500">{item.width} × {item.height} px</div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <a
                href={item.compressedUrl}
                download={item.name}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                title="Unduh Gambar Ini"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}