"use client";

import { useState, useRef } from "react";
import { 
  Video, 
  Upload, 
  Download, 
  RefreshCw, 
  Sliders, 
  CheckCircle2, 
  FileVideo, 
  Sparkles,
  Play,
  Pause
} from "lucide-react";

export function VideoConverterTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<"video/webm;codecs=vp8" | "video/webm;codecs=vp9" | "video/mp4">("video/webm;codecs=vp8");
  const [resolution, setResolution] = useState<string>("1280x720");
  const [bitrate, setBitrate] = useState<number>(2500000); // 2.5 Mbps
  const [fps, setFps] = useState<number>(30);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [outputBlobUrl, setOutputBlobUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setOutputBlobUrl(null);
    }
  };

  const startTranscode = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsConverting(true);
    setProgress(0);

    const [targetW, targetH] = resolution.split("x").map(Number);
    canvas.width = targetW;
    canvas.height = targetH;

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: outputFormat,
      videoBitsPerSecond: bitrate,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: outputFormat.split(";")[0] });
      setOutputBlobUrl(URL.createObjectURL(blob));
      setOutputSize(blob.size);
      setIsConverting(false);
      setProgress(100);
    };

    mediaRecorder.start();
    video.currentTime = 0;
    await video.play();

    const duration = video.duration || 10;
    const renderInterval = setInterval(() => {
      if (video.ended || video.currentTime >= duration) {
        clearInterval(renderInterval);
        video.pause();
        mediaRecorder.stop();
      } else {
        ctx.drawImage(video, 0, 0, targetW, targetH);
        setProgress(Math.min(98, Math.round((video.currentTime / duration) * 100)));
      }
    }, 1000 / fps);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + ["B", "KB", "MB"][i];
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player & Video Upload */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileVideo className="h-4 w-4 text-pink-400" />
              <span>Pratinjau Video Sumber</span>
            </h3>

            {!videoUrl ? (
              <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-750 hover:border-pink-500/50 rounded-2xl bg-slate-950/60 cursor-pointer transition-all">
                <Upload className="h-10 w-10 text-slate-500 mb-2" />
                <span className="text-xs font-semibold text-slate-300">Pilih berkas video (MP4, WebM, MOV, MKV, AVI)</span>
                <span className="text-[11px] text-slate-500 mt-1">Transcode berjalan di client tanpa kuota upload</span>
                <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-3">
                <video ref={videoRef} src={videoUrl} controls className="w-full rounded-2xl bg-black max-h-72 object-contain" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{videoFile?.name}</span>
                  <span>{videoFile ? formatBytes(videoFile.size) : ""}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Converter Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="h-4 w-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">Format & Kualitas Output</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Format Transcode:</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                >
                  <option value="video/webm;codecs=vp8">WebM (VP8 Standard)</option>
                  <option value="video/webm;codecs=vp9">WebM (VP9 High Compression)</option>
                  <option value="video/mp4">MP4 Video Stream</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Resolusi:</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                >
                  <option value="1920x1080">1080p Full HD (1920×1080)</option>
                  <option value="1280x720">720p HD (1280×720)</option>
                  <option value="854x480">480p SD (854×480)</option>
                  <option value="640x360">360p Ringan (640×360)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Bitrate: {(bitrate / 1000000).toFixed(1)} Mbps</label>
                <input
                  type="range"
                  min={500000}
                  max={8000000}
                  step={500000}
                  value={bitrate}
                  onChange={(e) => setBitrate(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Frame Rate (FPS):</label>
                <div className="flex gap-2">
                  {[24, 30, 60].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFps(f)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        fps === f
                          ? "bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-600/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {f} FPS
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={startTranscode}
              disabled={isConverting || !videoUrl}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 py-3 text-xs font-bold text-white shadow-xl shadow-pink-600/30 hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isConverting ? "animate-spin" : ""}`} />
              <span>{isConverting ? `Mengonversi (${progress}%)` : "Transcode & Konversi Video"}</span>
            </button>

            {outputBlobUrl && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Transcode Selesai ({formatBytes(outputSize)})</span>
                </div>
                <a
                  href={outputBlobUrl}
                  download="video_converted.webm"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Video Hasil Konversi</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}