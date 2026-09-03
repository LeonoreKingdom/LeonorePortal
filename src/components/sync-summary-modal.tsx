"use client";

import { 
  CheckCircle2, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  FolderSync, 
  FileText, 
  HardDrive,
  Sparkles,
  Check
} from "lucide-react";
import { SyncedFileItem } from "@/data/mock-obsidian";

export interface SyncExecutionSummary {
  pushedCount: number;
  pulledCount: number;
  unchangedCount: number;
  durationMs: number;
  syncedFiles: SyncedFileItem[];
  timestamp: string;
}

interface SyncSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SyncExecutionSummary | null;
}

export function SyncSummaryModal({
  isOpen,
  onClose,
  summary,
}: SyncSummaryModalProps) {
  if (!isOpen || !summary) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Ringkasan Hasil Sinkronisasi</h2>
              <p className="text-xs text-slate-400">Vault Obsidian telah berhasil diperbarui</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-indigo-400 mb-1 font-semibold">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Ekspor</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">+{summary.pushedCount}</div>
            <span className="text-[10px] text-slate-500">Ke Vault</span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-purple-400 mb-1 font-semibold">
              <ArrowDownLeft className="h-3.5 w-3.5" />
              <span>Impor</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">+{summary.pulledCount}</div>
            <span className="text-[10px] text-slate-500">Dari Vault</span>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-1 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span>Durasi</span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">{summary.durationMs}ms</div>
            <span className="text-[10px] text-slate-500">Waktu Proses</span>
          </div>
        </div>

        {/* Processed Files List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Berkas yang Diproses ({summary.syncedFiles.length})</span>
            <span className="text-[11px] font-mono text-emerald-400">100% Sukses</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {summary.syncedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800/80 text-xs"
              >
                <div className="truncate max-w-[280px]">
                  <div className="font-semibold text-slate-200 truncate">{file.title}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                    {file.vaultRelativePath}
                  </div>
                </div>

                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20 shrink-0">
                  Tersinkron
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all"
        >
          <Check className="h-4 w-4" />
          <span>Tutup Ringkasan</span>
        </button>
      </div>
    </div>
  );
}