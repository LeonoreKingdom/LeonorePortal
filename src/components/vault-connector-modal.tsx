"use client";

import { useState } from "react";
import { 
  FolderSync, 
  X, 
  Folder, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HardDrive, 
  ShieldCheck, 
  Sliders,
  Check
} from "lucide-react";
import { ObsidianVaultConfig } from "@/data/mock-obsidian";

interface VaultConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ObsidianVaultConfig;
  onSaveConfig: (newConfig: ObsidianVaultConfig) => void;
}

export function VaultConnectorModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: VaultConnectorModalProps) {
  const [vaultPath, setVaultPath] = useState(config.vaultPath);
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [syncIntervalMinutes, setSyncIntervalMinutes] = useState(config.syncIntervalMinutes);
  const [conflictResolution, setConflictResolution] = useState(config.conflictResolution);
  const [includeFrontmatter, setIncludeFrontmatter] = useState(config.includeFrontmatter);

  // Testing connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: { fileCount: number; hasObsidianDir: boolean };
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setIsTesting(false);
      if (vaultPath.trim().length > 3) {
        setTestResult({
          success: true,
          message: "Koneksi ke direktori Vault berhasil divalidasi!",
          details: {
            fileCount: 24,
            hasObsidianDir: true,
          },
        });
      } else {
        setTestResult({
          success: false,
          message: "Path direktori tidak valid atau tidak dapat diakses.",
        });
      }
    }, 1000);
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      vaultPath,
      autoSync,
      syncIntervalMinutes,
      conflictResolution,
      includeFrontmatter,
    });
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 cursor-default"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderSync className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hubungkan Vault Obsidian</h2>
              <p className="text-xs text-slate-400">Pilih direktori lokal penyimpanan berkas Markdown Anda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Vault Path Input */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Lokasi Direktori Vault:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Folder className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={vaultPath}
                  onChange={(e) => setVaultPath(e.target.value)}
                  placeholder="D:\LeonoreKingdom\ObsidianVault"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-3 font-mono text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? "animate-spin" : ""}`} />
                <span>Uji Akses</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Paths */}
          <div>
            <span className="text-[11px] text-slate-400 font-medium">Preset Cepat:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {[
                "D:\\LeonoreKingdom\\ObsidianVault",
                "C:\\Users\\Leonore\\Documents\\ObsidianVault",
                "D:\\Knowledge\\Vault",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setVaultPath(preset)}
                  className="rounded-lg bg-slate-950 border border-slate-800 px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:border-purple-500 transition-colors truncate max-w-[260px]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Connection Test Status Banner */}
          {testResult && (
            <div
              className={`rounded-2xl p-3.5 border text-xs ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{testResult.message}</span>
              </div>
              {testResult.details && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-2 border-t border-emerald-500/20">
                  <div>• Folder .obsidian terdeteksi: <strong>Ya</strong></div>
                  <div>• Total berkas markdown: <strong>{testResult.details.fileCount} file</strong></div>
                </div>
              )}
            </div>
          )}

          {/* Settings Checklist */}
          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-3 pt-3">
            <div className="text-xs font-bold text-slate-200">Pengaturan Sinkronisasi</div>

            <div className="space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                />
                <span className="text-slate-300">Sinkronisasi otomatis di latar belakang</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFrontmatter}
                  onChange={(e) => setIncludeFrontmatter(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-0"
                />
                <span className="text-slate-300">Tulis metadata YAML frontmatter di awal setiap .md</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-400 mb-1">Interval Sinkron:</label>
                <select
                  value={syncIntervalMinutes}
                  onChange={(e) => setSyncIntervalMinutes(parseInt(e.target.value))}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value={1}>Tiap 1 Menit</option>
                  <option value={5}>Tiap 5 Menit (Disarankan)</option>
                  <option value={15}>Tiap 15 Menit</option>
                  <option value={30}>Tiap 30 Menit</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Strategi Konflik:</label>
                <select
                  value={conflictResolution}
                  onChange={(e) => setConflictResolution(e.target.value as any)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="prefer_portal">Prioritas LeonorePortal</option>
                  <option value="prefer_obsidian">Prioritas Obsidian Vault</option>
                  <option value="manual">Tanyakan Manual</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-2xl bg-purple-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Simpan Pengaturan Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
}