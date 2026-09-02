"use client";

import { useState, useRef } from "react";
import { 
  Music, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  CheckCircle2, 
  Trash2, 
  RefreshCw,
  Film,
  Volume2
} from "lucide-react";

// Encode AudioBuffer to WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: "audio/wav" });

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

export function VideoAudioTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractedAudioUrl, setExtractedAudioUrl] = useState<string | null>(null);
  const [audioSize, setAudioSize] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Harap pilih file video.");
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setExtractedAudioUrl(null);
  };

  const extractAudio = async () => {
    if (!videoFile) return;
    setIsExtracting(true);
    setProgressText("Membaca data file video...");

    try {
      const arrayBuffer = await videoFile.arrayBuffer();
      setProgressText("Mendekode trek audio di browser...");

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      setProgressText("Menyusun file audio WAV murni...");
      const wavBlob = audioBufferToWav(decodedBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);

      setExtractedAudioUrl(audioUrl);
      setAudioSize(wavBlob.size);
      setProgressText("");
    } catch (err) {
      alert("Gagal mengekstrak audio: format video mungkin tidak memiliki audio track yang didukung.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = () => {
    if (!extractedAudioUrl || !videoFile) return;
    const a = document.createElement("a");
    a.href = extractedAudioUrl;
    const baseName = videoFile.name.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}-audio.wav`;
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
      {!videoUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleVideoSelect(e.dataTransfer.files[0]);
          }}
          className="cursor-pointer rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/60 p-12 text-center hover:border-pink-500/50 hover:bg-slate-900/90 transition-all shadow-xl"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-400 mx-auto mb-4 border border-pink-500/30">
            <Film className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Pilih atau Tarik File Video (MP4, WebM, MOV, MKV)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Ekstrak trek audio secara instan dan unduh sebagai file WAV lossless tanpa batasan ukuran.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Video Preview */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white">Video Sumber</h3>
              </div>
              <button
                onClick={() => {
                  setVideoFile(null);
                  setVideoUrl(null);
                  setExtractedAudioUrl(null);
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Ganti Video"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-950 overflow-hidden border border-slate-800">
              <video
                src={videoUrl}
                controls
                className="w-full max-h-56 object-contain"
              />
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span className="truncate max-w-xs font-semibold text-slate-200">{videoFile?.name}</span>
              <span>{videoFile && formatBytes(videoFile.size)}</span>
            </div>

            <button
              onClick={extractAudio}
              disabled={isExtracting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-pink-600 p-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-pink-600/30 hover:bg-pink-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isExtracting ? "animate-spin" : ""}`} />
              <span>{isExtracting ? progressText || "Mengekstrak..." : "Ekstrak Audio (WAV)"}</span>
            </button>
          </div>

          {/* Extracted Audio Result */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Music className="h-4 w-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">Hasil Ekstraksi Audio</h3>
            </div>

            {extractedAudioUrl ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="rounded-2xl bg-slate-950 p-5 border border-slate-800 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto">
                    <Volume2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Audio Siap Diputar & Diunduh</h4>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      Format: WAV Lossless • Ukuran: {formatBytes(audioSize)}
                    </p>
                  </div>
                  <audio src={extractedAudioUrl} controls className="w-full mt-2" />
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh File Audio WAV ({formatBytes(audioSize)})</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 py-16 text-center text-xs text-slate-500">
                <Music className="h-8 w-8 text-slate-700 mb-2" />
                <span>Klik &ldquo;Ekstrak Audio&rdquo; untuk memulai konversi</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}