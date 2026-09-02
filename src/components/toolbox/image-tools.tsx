"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Maximize2, 
  Lock, 
  Unlock, 
  Sparkles, 
  Check, 
  Trash2, 
  RefreshCw 
} from "lucide-react";

interface ImageToolsProps {
  mode: "convert" | "resize";
}

export function ImageTools({ mode }: ImageToolsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  // Convert settings
  const [targetFormat, setTargetFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/webp");
  const [quality, setQuality] = useState<number>(90);

  // Resize settings
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Processed Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setImagePreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setTargetWidth(img.width);
      setTargetHeight(img.height);
    };
    img.src = url;
    setProcessedUrl(null);
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const ratio = originalHeight / originalWidth;
      setTargetHeight(Math.round(w * ratio));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && originalWidth > 0 && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setTargetWidth(Math.round(h * ratio));
    }
  };

  const handleScalePreset = (percent: number) => {
    if (originalWidth === 0) return;
    const w = Math.round((originalWidth * percent) / 100);
    const h = Math.round((originalHeight * percent) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const processImage = () => {
    if (!imagePreviewUrl) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = mode === "resize" ? targetWidth : img.width;
      const h = mode === "resize" ? targetHeight : img.height;

      canvas.width = w;
      canvas.height = h;

      // Draw and smooth
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      const mime = mode === "convert" ? targetFormat : "image/jpeg";
      const q = quality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const outUrl = URL.createObjectURL(blob);
            setProcessedUrl(outUrl);
            setProcessedSize(blob.size);
          }
          setIsProcessing(false);
        },
        mime,
        q
      );
    };
    img.src = imagePreviewUrl;
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement("a");
    a.href = processedUrl;
    const originalName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : "image";
    const ext = mode === "convert" ? targetFormat.split("/")[1] : "jpg";
    a.download = `${originalName}-${mode === "resize" ? `${targetWidth}x${targetHeight}` : "converted"}.${ext}`;
    a.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Box */}
      {!imagePreviewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/60 p-12 text-center hover:border-pink-500/50 hover:bg-slate-900/90 transition-all shadow-xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mx-auto mb-4 border border-pink-500/30">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Klik atau Tarik File Gambar ke Sini
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Mendukung file PNG, JPG, JPEG, WebP, GIF, BMP, SVG. Diproses 100% lokal di browser.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Settings Panel */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
                  {mode === "convert" ? <ImageIcon className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </div>
                <h3 className="text-sm font-bold text-white">
                  {mode === "convert" ? "Pengaturan Konversi" : "Pengaturan Ukuran (Resize)"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setImagePreviewUrl(null);
                  setProcessedUrl(null);
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Ganti Gambar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* File Info */}
            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <div className="font-semibold text-slate-200 truncate max-w-xs">{selectedFile?.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {originalWidth} × {originalHeight} px • {selectedFile && formatBytes(selectedFile.size)}
                </div>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 uppercase">
                {selectedFile?.type.split("/")[1]}
              </span>
            </div>

            {mode === "convert" ? (
              /* CONVERT OPTIONS */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Format Tujuan:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "WebP (Ringan)", value: "image/webp" },
                      { label: "PNG (Lossless)", value: "image/png" },
                      { label: "JPG (Standar)", value: "image/jpeg" },
                    ].map((fmt) => (
                      <button
                        key={fmt.value}
                        type="button"
                        onClick={() => setTargetFormat(fmt.value as any)}
                        className={`rounded-xl p-3 text-xs font-semibold text-center border transition-all ${
                          targetFormat === fmt.value
                            ? "border-pink-500 bg-pink-950/30 text-white ring-1 ring-pink-500"
                            : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                {targetFormat !== "image/png" && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
                      <span>Kualitas Kompresi:</span>
                      <span className="font-mono text-pink-400 font-bold">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                  </div>
                )}
              </div>
            ) : (
              /* RESIZE OPTIONS */
              <div className="space-y-4">
                {/* Scale Presets */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Skala Cepat:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[25, 50, 75, 100, 150, 200].map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => handleScalePreset(scale)}
                        className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-mono font-semibold text-slate-300 border border-slate-800 hover:border-pink-500 hover:text-white transition-all"
                      >
                        {scale}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Width x Height Inputs */}
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Lebar (px)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Tinggi (px)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-mono text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-pink-400 transition-colors"
                  >
                    {lockAspectRatio ? <Lock className="h-3.5 w-3.5 text-pink-400" /> : <Unlock className="h-3.5 w-3.5" />}
                    <span>Kunci Rasio Aspek ({lockAspectRatio ? "Aktif" : "Bebas"})</span>
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={processImage}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-pink-600 p-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-600/30 hover:bg-pink-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
              <span>{isProcessing ? "Memproses..." : mode === "convert" ? "Konversi Sekarang" : "Ubah Ukuran Sekarang"}</span>
            </button>
          </div>

          {/* Preview & Output Panel */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Pratinjau Hasil
            </h3>

            <div className="flex items-center justify-center rounded-2xl bg-slate-950 p-4 border border-slate-800 min-h-[260px] overflow-hidden">
              <img
                src={processedUrl || imagePreviewUrl}
                alt="Preview"
                className="max-h-64 object-contain rounded-lg shadow-md"
              />
            </div>

            {processedUrl && (
              <div className="rounded-2xl bg-pink-950/20 border border-pink-500/30 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Ukuran Hasil:</span>
                  <span className="font-bold text-pink-300">{formatBytes(processedSize)}</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-pink-600/30 hover:bg-pink-500 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Gambar ({formatBytes(processedSize)})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}