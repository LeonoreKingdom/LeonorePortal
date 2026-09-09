"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Upload, 
  Download, 
  Sparkles, 
  Wand2, 
  RefreshCw, 
  Trash2, 
  ShieldCheck, 
  Check, 
  Copy, 
  Pipette, 
  Layers, 
  AlertCircle
} from "lucide-react";

type RemovalMode = "ai" | "wand";
type BackgroundType = "transparent" | "color" | "blur";

const SAMPLE_IMAGES = [
  {
    name: "Portrait",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    label: "Foto Wajah"
  },
  {
    name: "Product",
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    label: "Foto Produk"
  },
  {
    name: "Pet",
    url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    label: "Foto Hewan"
  }
];

const PRESET_COLORS = [
  { name: "Putih", hex: "#ffffff" },
  { name: "Hitam", hex: "#0f172a" },
  { name: "Pasfoto Merah", hex: "#dc2626" },
  { name: "Pasfoto Biru", hex: "#2563eb" },
  { name: "Studio Grey", hex: "#64748b" },
  { name: "Pastel Teal", hex: "#0d9488" },
  { name: "Pastel Rose", hex: "#e11d48" },
];

export function BgRemoverTool() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [, setOriginalFile] = useState<File | null>(null);
  const [, setMaskBlob] = useState<Blob | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);

  // Engines & Settings
  const [mode, setMode] = useState<RemovalMode>("ai");
  const [bgType, setBgType] = useState<BackgroundType>("transparent");
  const [customColor, setCustomColor] = useState<string>("#ffffff");
  const [blurAmount, setBlurAmount] = useState<number>(16);

  // Wand mode settings
  const [wandTolerance, setWandTolerance] = useState<number>(30);
  const [wandSampleColor, setWandSampleColor] = useState<{ r: number; g: number; b: number } | null>(null);
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Preview dimensions
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Handle image upload
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap pilih berkas gambar yang valid (PNG, JPG, WebP).");
      return;
    }

    setErrorMsg(null);
    setCutoutUrl(null);
    setMaskBlob(null);
    setOriginalFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setOriginalImage(url);

      // Measure dimensions
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
    };
    reader.readAsDataURL(file);
  };

  const loadSample = async (url: string) => {
    try {
      setIsProcessing(true);
      setProgressStage("Memuat contoh gambar...");
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], "sample.jpg", { type: "image/jpeg" });
      handleFileChange(file);
    } catch {
      setErrorMsg("Gagal memuat contoh gambar dari internet.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Process AI removal
  const runAiRemoval = async () => {
    if (!originalImage) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setProgressStage("Menginisialisasi model AI browser (WASM/WebGPU)...");
      setProgressPercent(10);

      // Dynamically import @imgly/background-removal to keep initial bundle lean
      const { removeBackground } = await import("@imgly/background-removal");

      setProgressStage("Memproses segmentasi objek...");
      setProgressPercent(35);

      const blob = await removeBackground(originalImage, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.round((current / total) * 100);
            setProgressPercent(pct);
            if (key.includes("fetch")) {
              setProgressStage(`Mengunduh model AI (${pct}%)...`);
            } else {
              setProgressStage(`Memproses piksel gambar (${pct}%)...`);
            }
          }
        },
        model: "isnet_fp16",
        output: {
          format: "image/png",
          quality: 1.0,
        }
      });

      setMaskBlob(blob);
      const url = URL.createObjectURL(blob);
      setCutoutUrl(url);
      setProgressPercent(100);
      setProgressStage("Selesai!");
    } catch (err: unknown) {
      console.error("AI removal error:", err);
      const msg = err instanceof Error ? err.message : "";
      setErrorMsg(
        msg.includes("fetch") 
          ? "Gagal mengunduh model AI dari CDN. Pastikan koneksi internet stabil atau gunakan mode 'Chroma-Key / Magic Wand'."
          : "Terjadi kesalahan saat memproses gambar dengan AI. Silakan coba mode 'Chroma-Key'."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Canvas Chroma-Key Removal (Instant algorithm)
  const runWandRemoval = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    try {
      setIsProcessing(true);
      setProgressStage("Memproses Chroma-Key di Canvas...");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = originalImage;

      img.onload = () => {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        // Default to top-left pixel color if not sampled yet
        const targetR = wandSampleColor ? wandSampleColor.r : data[0];
        const targetG = wandSampleColor ? wandSampleColor.g : data[1];
        const targetB = wandSampleColor ? wandSampleColor.b : data[2];

        const tol = wandTolerance * 2.55;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const dist = Math.sqrt(
            Math.pow(r - targetR, 2) +
            Math.pow(g - targetG, 2) +
            Math.pow(b - targetB, 2)
          );

          if (dist < tol) {
            const alphaFactor = dist / tol;
            data[i + 3] = Math.round(data[i + 3] * Math.pow(alphaFactor, 2));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setMaskBlob(blob);
            setCutoutUrl(URL.createObjectURL(blob));
          }
          setIsProcessing(false);
        }, "image/png");
      };
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setErrorMsg("Gagal memproses gambar dengan Chroma-Key.");
    }
  }, [originalImage, wandSampleColor, wandTolerance]);

  // Click on image to sample color for Wand mode
  const handleSampleColor = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEyedropperActive || !originalImage) return;

    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight);

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setWandSampleColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setIsEyedropperActive(false);
  };

  // Re-render final output with selected background (Transparent, Solid Color, or Blur)
  const renderFinalCanvas = useCallback(() => {
    if (!cutoutUrl || !originalImage || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cutoutImg = new Image();
    cutoutImg.src = cutoutUrl;

    cutoutImg.onload = () => {
      canvas.width = cutoutImg.width;
      canvas.height = cutoutImg.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bgType === "color") {
        ctx.fillStyle = customColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(cutoutImg, 0, 0);
      } else if (bgType === "blur") {
        const origImg = new Image();
        origImg.src = originalImage;
        origImg.onload = () => {
          ctx.save();
          ctx.filter = `blur(${blurAmount}px)`;
          ctx.drawImage(origImg, -20, -20, canvas.width + 40, canvas.height + 40);
          ctx.restore();
          ctx.drawImage(cutoutImg, 0, 0);
        };
      } else {
        ctx.drawImage(cutoutImg, 0, 0);
      }
    };
  }, [cutoutUrl, originalImage, bgType, customColor, blurAmount]);

  useEffect(() => {
    if (cutoutUrl) {
      renderFinalCanvas();
    }
  }, [cutoutUrl, renderFinalCanvas]);

  // Trigger processing based on mode
  const handleProcess = () => {
    if (mode === "ai") {
      runAiRemoval();
    } else {
      runWandRemoval();
    }
  };

  // Download final result
  const handleDownload = () => {
    if (!previewCanvasRef.current) return;

    const link = document.createElement("a");
    link.download = `cutout-${Date.now()}.png`;
    link.href = previewCanvasRef.current.toDataURL("image/png");
    link.click();
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!previewCanvasRef.current) return;

    try {
      previewCanvasRef.current.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }, "image/png");
    } catch (err) {
      console.error("Gagal menyalin gambar:", err);
    }
  };

  // Reset
  const handleReset = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setCutoutUrl(null);
    setMaskBlob(null);
    setImageDimensions(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-8">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-8 backdrop-blur-xl shadow-2xl">
        {/* Header Title & Privacy Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Wand2 className="h-5 w-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                AI Background Remover
              </h2>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Hapus atau ganti latar belakang foto secara otomatis langsung di memori browser.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20 shrink-0">
            <ShieldCheck className="h-4 w-4" />
            <span>100% Client-Side Private</span>
          </div>
        </div>

        {/* Upload Zone (If no image selected) */}
        {!originalImage ? (
          <div className="mt-8 space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/40 p-10 sm:p-14 text-center cursor-pointer transition-all hover:border-indigo-500 hover:bg-slate-900/60"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div className="rounded-2xl bg-indigo-600/10 p-4 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-600/10">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">
                Pilih atau seret gambar ke sini
              </h3>
              <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
                Mendukung PNG, JPG, JPEG, atau WebP hingga resolusi penuh tanpa kompresi server.
              </p>
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-2">
              <div className="text-xs font-medium text-slate-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>Atau coba dengan gambar sampel:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => loadSample(sample.url)}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-indigo-500/50 text-left transition-all group"
                  >
                    <img
                      src={sample.url}
                      alt={sample.label}
                      className="h-11 w-11 rounded-lg object-cover border border-slate-700 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                        {sample.label}
                      </div>
                      <div className="text-[11px] text-slate-500">Klik untuk tes instan</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Processing & Result Workspace */
          <div className="mt-8 space-y-6">
            {/* Toolbar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                {/* Engine Switcher */}
                <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode("ai")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      mode === "ai"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>AI Auto Cutout</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("wand")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      mode === "wand"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Wand2 className="h-3.5 w-3.5" />
                    <span>Chroma-Key (Wand)</span>
                  </button>
                </div>

                {/* Dimensions info */}
                {imageDimensions && (
                  <span className="hidden sm:inline-flex text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    {imageDimensions.width} × {imageDimensions.height} px
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-all"
                  title="Ganti gambar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ganti Foto</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProcess}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>{cutoutUrl ? "Proses Ulang" : "Hapus Latar Sekarang"}</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Processing Progress Bar */}
            {isProcessing && (
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center space-y-2.5 animate-pulse">
                <div className="flex items-center justify-between text-xs text-indigo-300">
                  <span className="font-medium">{progressStage}</span>
                  <span className="font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Model AI dieksekusi secara lokal menggunakan WebAssembly di memori browser Anda.
                </p>
              </div>
            )}

            {/* Wand Mode Controls (Tolerance & Color Picker) */}
            {mode === "wand" && !isProcessing && (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">Warna Latar yang Dihapus:</span>
                    {wandSampleColor ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-600 shrink-0"
                          style={{
                            backgroundColor: `rgb(${wandSampleColor.r}, ${wandSampleColor.g}, ${wandSampleColor.b})`
                          }}
                        />
                        <span className="text-[11px] font-mono text-slate-400">
                          rgb({wandSampleColor.r}, {wandSampleColor.g}, {wandSampleColor.b})
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Otomatis (sudut kiri atas)</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      isEyedropperActive
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                        : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <Pipette className="h-3.5 w-3.5" />
                    <span>{isEyedropperActive ? "Klik pada foto untuk ambil warna..." : "Ambil Warna Manual"}</span>
                  </button>
                </div>

                {/* Tolerance slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Toleransi Warna (Threshold):</span>
                    <span className="font-semibold text-indigo-400">{wandTolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={wandTolerance}
                    onChange={(e) => setWandTolerance(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Image Preview & Comparison Canvas */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[560px]">
              {/* Checkerboard Pattern for Transparency */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#64748b 1px, transparent 1px)`,
                  backgroundSize: "16px 16px"
                }}
              />

              {cutoutUrl ? (
                /* Result Preview with Custom Background Canvas */
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  {/* Canvas for final composited output */}
                  <canvas
                    ref={previewCanvasRef}
                    className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all"
                  />

                  {/* Eyedropper sampling overlay if active */}
                  {isEyedropperActive && (
                    <img
                      src={originalImage}
                      alt="Sample"
                      onClick={handleSampleColor}
                      className="absolute inset-0 w-full h-full object-contain cursor-crosshair opacity-80 z-20"
                    />
                  )}
                </div>
              ) : (
                /* Original Image Display Before Processing */
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={originalImage}
                    alt="Original"
                    onClick={isEyedropperActive ? handleSampleColor : undefined}
                    className={`max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-xl ${
                      isEyedropperActive ? "cursor-crosshair" : ""
                    }`}
                  />
                  {!isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 p-4">
                      <div className="p-3.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                        <Wand2 className="h-6 w-6" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium text-center">
                        Foto siap diproses. Klik tombol di bawah untuk mulai memotong latar belakang.
                      </p>
                      <button
                        type="button"
                        onClick={handleProcess}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                      >
                        Hapus Latar Sekarang
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Post-Cutout Background Customizer */}
            {cutoutUrl && (
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs sm:text-sm font-bold text-white">
                      Ganti Latar Belakang Baru:
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setBgType("transparent")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        bgType === "transparent"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Transparan
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgType("color")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        bgType === "color"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Warna Solid
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgType("blur")}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        bgType === "blur"
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Blur Bokeh
                    </button>
                  </div>
                </div>

                {/* Solid Color Palette Options */}
                {bgType === "color" && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setCustomColor(col.hex)}
                        className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                          customColor === col.hex
                            ? "border-indigo-500 ring-2 ring-indigo-500/30 text-white bg-slate-900"
                            : "border-slate-800 text-slate-300 bg-slate-950 hover:bg-slate-900"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-slate-600"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span>{col.name}</span>
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 border border-slate-800 rounded-lg px-2 py-1 bg-slate-950">
                      <span className="text-[11px] text-slate-400">Custom:</span>
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="h-5 w-6 rounded cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>
                )}

                {/* Blur Bokeh Slider */}
                {bgType === "blur" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Tingkat Blur:</span>
                      <span className="font-semibold text-indigo-400">{blurAmount}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="32"
                      value={blurAmount}
                      onChange={(e) => setBlurAmount(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Download and Copy Actions */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Salin Gambar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Gambar PNG</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature Explanations & FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">AI Semantic Cutout</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mendeteksi objek orang, produk, dan hewan secara otomatis bahkan pada latar belakang rumit dan gradasi warna yang padat.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Wand2 className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Chroma-Key Wand</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mode ultra-cepat untuk logo, stempel, tanda tangan, atau foto produk berlatar belakang putih/polos tanpa jeda pemrosesan.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Zero-Server Upload</h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Foto Anda tidak pernah dikirim ke internet atau server kami. Seluruh proses pengolahan piksel berjalan 100% di memori browser lokal.
          </p>
        </div>
      </div>
    </div>
  );
}
