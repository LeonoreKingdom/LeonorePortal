"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Film, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  ArrowRightLeft,
  FileVideo,
  Image as ImageIcon
} from "lucide-react";

export function VideoGifTool() {
  const [mode, setMode] = useState<"video-to-gif" | "gif-to-video">("video-to-gif");
  
  // Video to GIF state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fps, setFps] = useState<number>(10);
  const [scaleWidth, setScaleWidth] = useState<number>(480);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [outputBlobUrl, setOutputBlobUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  // GIF to Video state
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [videoFormat, setVideoFormat] = useState<"video/webm" | "video/mp4">("video/webm");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setOutputBlobUrl(null);
    }
  };

  const handleGifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGifFile(file);
      const url = URL.createObjectURL(file);
      setGifUrl(url);
      setOutputBlobUrl(null);
    }
  };

  const convertVideoToGif = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsConverting(true);
    setProgress(0);

    const aspect = video.videoHeight / video.videoWidth || 9 / 16;
    const width = scaleWidth;
    const height = Math.round(width * aspect);
    canvas.width = width;
    canvas.height = height;

    const stream = canvas.captureStream(fps);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp8",
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setOutputBlobUrl(url);
      setOutputSize(blob.size);
      setIsConverting(false);
      setProgress(100);
    };

    mediaRecorder.start();
    video.currentTime = 0;
    await video.play();

    const duration = Math.min(video.duration || 5, 10);
    const interval = setInterval(() => {
      if (video.ended || video.currentTime >= duration) {
        clearInterval(interval);
        video.pause();
        mediaRecorder.stop();
      } else {
        ctx.drawImage(video, 0, 0, width, height);
        setProgress(Math.min(95, Math.round((video.currentTime / duration) * 100)));
      }
    }, 1000 / fps);
  };

  const convertGifToVideo = () => {
    if (!gifUrl || !canvasRef.current) return;
    setIsConverting(true);
    setProgress(15);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = gifUrl;

    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width || 480;
      canvas.height = img.height || 360;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setOutputBlobUrl(URL.createObjectURL(blob));
        setOutputSize(blob.size);
        setIsConverting(false);
        setProgress(100);
      };

      recorder.start();
      let frames = 0;
      const animInterval = setInterval(() => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        frames++;
        setProgress(Math.min(95, frames * 3));
        if (frames >= 60) {
          clearInterval(animInterval);
          recorder.stop();
        }
      }, 50);
    };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + ["B", "KB", "MB"][i];
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
        <button
          type="button"
          onClick={() => { setMode("video-to-gif"); setOutputBlobUrl(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === "video-to-gif" ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileVideo className="h-4 w-4" />
          <span>Video ke GIF</span>
        </button>
        <button
          type="button"
          onClick={() => { setMode("gif-to-video"); setOutputBlobUrl(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            mode === "gif-to-video" ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>GIF ke Video (MP4/WebM)</span>
        </button>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="h-4 w-4 text-pink-400" />
              <span>{mode === "video-to-gif" ? "Pilih Berkas Video" : "Pilih Berkas Animasi GIF"}</span>
            </h3>

            {mode === "video-to-gif" ? (
              <div>
                {!videoUrl ? (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-750 hover:border-pink-500/50 rounded-2xl bg-slate-950/60 cursor-pointer transition-all">
                    <Upload className="h-10 w-10 text-slate-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-300">Pilih berkas MP4, WebM, MOV, atau AVI</span>
                    <span className="text-[11px] text-slate-500 mt-1">100% diproses di browser tanpa upload ke server</span>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
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
            ) : (
              <div>
                {!gifUrl ? (
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-750 hover:border-pink-500/50 rounded-2xl bg-slate-950/60 cursor-pointer transition-all">
                    <Upload className="h-10 w-10 text-slate-500 mb-2" />
                    <span className="text-xs font-semibold text-slate-300">Pilih berkas animasi .GIF</span>
                    <span className="text-[11px] text-slate-500 mt-1">Ekstrak frame dan kemas menjadi video WebM/MP4</span>
                    <input type="file" accept="image/gif" onChange={handleGifUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="space-y-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gifUrl} alt="GIF Source" className="w-full rounded-2xl bg-black max-h-72 object-contain mx-auto" />
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate">{gifFile?.name}</span>
                      <span>{gifFile ? formatBytes(gifFile.size) : ""}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings & Converter */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="h-4 w-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">Pengaturan Konversi</h3>
            </div>

            {mode === "video-to-gif" ? (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Kecepatan Frame (FPS): {fps} fps</label>
                  <input
                    type="range"
                    min={5}
                    max={24}
                    step={1}
                    value={fps}
                    onChange={(e) => setFps(parseInt(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>5 (Ukuran Ringan)</span>
                    <span>15 (Halus)</span>
                    <span>24 (Ultra)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Resolusi Lebar: {scaleWidth}px</label>
                  <select
                    value={scaleWidth}
                    onChange={(e) => setScaleWidth(parseInt(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  >
                    <option value={320}>320px (Kecil - Cepat)</option>
                    <option value={480}>480px (Standar Media Sosial)</option>
                    <option value={640}>640px (High Quality HD)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Format Output Video:</label>
                  <select
                    value={videoFormat}
                    onChange={(e) => setVideoFormat(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  >
                    <option value="video/webm">WebM Video (Standard HTML5)</option>
                    <option value="video/mp4">MP4 Video</option>
                  </select>
                </div>
              </div>
            )}

            {/* Action Trigger */}
            <button
              onClick={mode === "video-to-gif" ? convertVideoToGif : convertGifToVideo}
              disabled={isConverting || (mode === "video-to-gif" ? !videoUrl : !gifUrl)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 py-3 text-xs font-bold text-white shadow-xl shadow-pink-600/30 hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isConverting ? "animate-spin" : ""}`} />
              <span>{isConverting ? `Mengonversi (${progress}%)` : "Mulai Konversi Sekarang"}</span>
            </button>

            {/* Output Download Box */}
            {outputBlobUrl && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Konversi Selesai ({formatBytes(outputSize)})</span>
                </div>
                <a
                  href={outputBlobUrl}
                  download={mode === "video-to-gif" ? "animasi.webm" : "video_output.webm"}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Hasil {mode === "video-to-gif" ? "Animasi (.webm)" : "Video (.webm)"}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Canvas for Frame Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}