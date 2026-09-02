"use client";

import { useState, useRef } from "react";
import { 
  Headphones, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  Sliders, 
  CheckCircle2, 
  Music,
  RefreshCw
} from "lucide-react";

export function AudioConverterTool() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<"wav" | "webm">("wav");
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [channels, setChannels] = useState<number>(2);
  const [volumeGain, setVolumeGain] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputBlobUrl, setOutputBlobUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
      setOutputBlobUrl(null);
    }
  };

  const convertAudio = async () => {
    if (!audioFile) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: sampleRate,
      });

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const numChannels = Math.min(channels, audioBuffer.numberOfChannels);
      const length = audioBuffer.length;
      const gain = volumeGain / 100;

      // Encode to 16-bit PCM WAV
      const wavBuffer = encodeWAV(audioBuffer, numChannels, sampleRate, gain);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      setOutputBlobUrl(url);
      setOutputSize(blob.size);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const encodeWAV = (audioBuffer: AudioBuffer, numChannels: number, sampleRate: number, gain: number) => {
    const length = audioBuffer.length * numChannels * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + audioBuffer.length * numChannels * 2, true);
    writeString(view, 8, "WAVE");

    // fmt sub-chunk
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * numChannels * 2, true); // ByteRate
    view.setUint16(32, numChannels * 2, true); // BlockAlign
    view.setUint16(34, 16, true); // BitsPerSample (16 bit)

    // data sub-chunk
    writeString(view, 36, "data");
    view.setUint32(40, audioBuffer.length * numChannels * 2, true);

    // Write audio samples
    let offset = 44;
    const channelData: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
      channelData.push(audioBuffer.getChannelData(c));
    }

    for (let i = 0; i < audioBuffer.length; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channelData[c][i] * gain;
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
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
        {/* Left Column: Audio Uploader & Player */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Music className="h-4 w-4 text-pink-400" />
              <span>Berkas Audio Sumber</span>
            </h3>

            {!audioUrl ? (
              <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-750 hover:border-pink-500/50 rounded-2xl bg-slate-950/60 cursor-pointer transition-all">
                <Upload className="h-10 w-10 text-slate-500 mb-2" />
                <span className="text-xs font-semibold text-slate-300">Pilih berkas audio (MP3, WAV, AAC, OGG, FLAC, M4A)</span>
                <span className="text-[11px] text-slate-500 mt-1">Web Audio API PCM decoding berkecepatan tinggi</span>
                <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-4">
                <audio ref={audioRef} src={audioUrl} controls className="w-full rounded-xl bg-slate-950 p-2" />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{audioFile?.name}</span>
                  <span>{audioFile ? formatBytes(audioFile.size) : ""}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audio Settings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Sliders className="h-4 w-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">Format & Kualitas Suara</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Format Output:</label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                >
                  <option value="wav">WAV Lossless PCM (Kualitas Studio)</option>
                  <option value="webm">WebM Audio</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Sample Rate (Frekuensi):</label>
                <select
                  value={sampleRate}
                  onChange={(e) => setSampleRate(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                >
                  <option value={44100}>44.1 kHz (Standar CD Audio)</option>
                  <option value={48000}>48.0 kHz (Standar Video & Film)</option>
                  <option value={96000}>96.0 kHz (High-Resolution Master)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Kanal Suara (Channels):</label>
                <div className="flex gap-2">
                  {[2, 1].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setChannels(c)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        channels === c
                          ? "bg-pink-600 border-pink-500 text-white shadow-md shadow-pink-600/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {c === 2 ? "Stereo (2 Ch)" : "Mono (1 Ch)"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium flex items-center justify-between">
                  <span>Volume Boost: {volumeGain}%</span>
                  <Volume2 className="h-3.5 w-3.5 text-pink-400" />
                </label>
                <input
                  type="range"
                  min={50}
                  max={200}
                  step={10}
                  value={volumeGain}
                  onChange={(e) => setVolumeGain(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>

            <button
              onClick={convertAudio}
              disabled={isProcessing || !audioFile}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 py-3 text-xs font-bold text-white shadow-xl shadow-pink-600/30 hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isProcessing ? "animate-spin" : ""}`} />
              <span>{isProcessing ? "Memproses Audio..." : "Konversi & Proses Audio"}</span>
            </button>

            {outputBlobUrl && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Konversi Selesai ({formatBytes(outputSize)})</span>
                </div>
                <a
                  href={outputBlobUrl}
                  download={`audio_converted.${targetFormat}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Audio Hasil Konversi (.{targetFormat})</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}