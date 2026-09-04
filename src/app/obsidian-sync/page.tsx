"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  RefreshCw, 
  FolderSync, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Settings, 
  Folder, 
  Download, 
  Upload, 
  ArrowRightLeft, 
  Sparkles, 
  HardDrive, 
  Check, 
  Search, 
  BookOpen, 
  KanbanSquare,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Archive
} from "lucide-react";
import { 
  INITIAL_VAULT_CONFIG, 
  MOCK_SYNCED_FILES, 
  MOCK_SYNC_LOGS, 
  SyncedFileItem, 
  SyncLogItem,
  ObsidianVaultConfig 
} from "@/data/mock-obsidian";
import { VaultConnectorModal } from "@/components/vault-connector-modal";
import { SyncSummaryModal, SyncExecutionSummary } from "@/components/sync-summary-modal";

export default function ObsidianSyncPage() {
  const [config, setConfig] = useState<ObsidianVaultConfig>(INITIAL_VAULT_CONFIG);
  const [syncedFiles, setSyncedFiles] = useState<SyncedFileItem[]>(MOCK_SYNCED_FILES);
  const [logs, setLogs] = useState<SyncLogItem[]>(MOCK_SYNC_LOGS);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [syncSummary, setSyncSummary] = useState<SyncExecutionSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);

  // Selected file items
  const [selectedIds, setSelectedIds] = useState<string[]>(
    MOCK_SYNCED_FILES.map((f) => f.id)
  );

  const fetchSyncData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/obsidian/sync");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.config) setConfig(json.data.config);
        if (Array.isArray(json.data.items) && json.data.items.length > 0) {
          setSyncedFiles(json.data.items);
          setSelectedIds(json.data.items.map((i: any) => i.id));
        }
        if (Array.isArray(json.data.logs)) setLogs(json.data.logs);
      }
    } catch (err) {
      console.error("Gagal mengambil data sinkronisasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncData();
  }, []);

  // Filters
  const [fileFilter, setFileFilter] = useState<"all" | "project" | "wiki">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredFiles = useMemo(() => {
    return syncedFiles.filter((item) => {
      const matchType = fileFilter === "all" || item.sourceType === fileFilter;
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vaultRelativePath.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [syncedFiles, fileFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFiles.map((f) => f.id));
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDirection = async (id: string) => {
    const item = syncedFiles.find((f) => f.id === id);
    if (!item) return;

    const nextDir: SyncedFileItem["direction"] =
      item.direction === "bidirectional"
        ? "export_only"
        : item.direction === "export_only"
        ? "import_only"
        : "bidirectional";

    setSyncedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, direction: nextDir } : f))
    );

    try {
      await fetch("/api/obsidian/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction: nextDir }),
      });
    } catch (err) {
      console.error("Gagal menyimpan arah sinkronisasi:", err);
    }
  };

  const handleTriggerSync = async () => {
    if (selectedIds.length === 0) {
      alert("Pilih setidaknya satu berkas untuk disinkronkan.");
      return;
    }

    const startTime = Date.now();
    setIsSyncing(true);

    try {
      const targetedFiles = syncedFiles.filter((f) => selectedIds.includes(f.id));
      const projectIds = targetedFiles
        .filter((f) => f.sourceType === "project")
        .map((f) => f.sourceId);
      const wikiSlugs = targetedFiles
        .filter((f) => f.sourceType === "wiki")
        .map((f) => f.sourceId);

      const res = await fetch("/api/obsidian/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds, wikiSlugs }),
      });

      const json = await res.json();
      const durationMs = Date.now() - startTime;
      const now = new Date().toISOString();

      // Refresh data dari database
      await fetchSyncData();

      const summaryData: SyncExecutionSummary = {
        pushedCount: json.data?.pushedCount ?? targetedFiles.length,
        pulledCount: json.data?.pulledCount ?? 0,
        unchangedCount: json.data?.unchangedCount ?? 0,
        durationMs: json.data?.durationMs ?? durationMs,
        syncedFiles: targetedFiles,
        timestamp: now,
      };

      setSyncSummary(summaryData);
      setIsSummaryModalOpen(true);
      setSyncSuccessToast(json.message || `${selectedIds.length} berkas markdown berhasil diselaraskan ke Vault!`);
      setTimeout(() => setSyncSuccessToast(null), 4000);
    } catch (err: any) {
      alert(`Sinkronisasi gagal: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = async (newConfig: ObsidianVaultConfig) => {
    setConfig(newConfig);
    try {
      await fetch("/api/obsidian/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      setSyncSuccessToast("Konfigurasi Vault berhasil disimpan!");
      setTimeout(() => setSyncSuccessToast(null), 3000);
    } catch (err) {
      console.error("Gagal menyimpan konfigurasi:", err);
    }
  };

  const handleExportArchive = () => {
    const selectedFiles = syncedFiles.filter((f) => selectedIds.includes(f.id));
    alert(`Menyiapkan ${selectedFiles.length} berkas Markdown untuk diunduh sebagai arsip.`);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + ["B", "KB", "MB"][i];
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + ", " + d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="relative isolate min-h-screen pb-20">
      {/* Background Glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-purple-600 to-indigo-500 opacity-25 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Obsidian Sync
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Sinkronisasi dengan Obsidian
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-750 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-all shadow-md"
            >
              <Settings className="h-4 w-4 text-purple-400" />
              <span>Ganti / Konfigurasi Vault</span>
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing || selectedIds.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menyelaraskan..." : `Sinkronkan (${selectedIds.length})`}</span>
            </button>
          </div>
        </div>

        {/* Sync Success Toast Alert */}
        {syncSuccessToast && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{syncSuccessToast}</span>
            </div>
            {syncSummary && (
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="text-xs text-emerald-300 hover:text-white underline font-bold"
              >
                Lihat Rincian
              </button>
            )}
          </div>
        )}

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Status Vault</span>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-bold text-white font-mono">Terhubung</div>
            <p className="text-[11px] text-slate-400 truncate" title={config.vaultPath}>
              {config.vaultPath}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Terakhir Disinkronkan</span>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">
              {formatDate(config.lastSuccessfulSync)}
            </div>
            <p className="text-[11px] text-emerald-400">Otomatis tiap {config.syncIntervalMinutes} mnt</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Berkas Dipilih</span>
              <FileText className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">{selectedIds.length} dari {syncedFiles.length} File</div>
            <p className="text-[11px] text-slate-400">Siap diselaraskan</p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Resolusi Konflik</span>
              <ArrowRightLeft className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-white font-mono">Prioritas Portal</div>
            <p className="text-[11px] text-slate-400">Dua arah dengan safe backup</p>
          </div>
        </div>

        {/* Main 2-Column: Synced Files vs Vault Settings & Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Synced Markdown Files */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Daftar Berkas Markdown Tersinkron</h3>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setFileFilter("all")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    fileFilter === "all" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Semua ({syncedFiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFileFilter("project")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    fileFilter === "project" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Proyek
                </button>
                <button
                  type="button"
                  onClick={() => setFileFilter("wiki")}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    fileFilter === "wiki" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Wiki
                </button>
              </div>
            </div>

            {/* Selection Toolbar and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama berkas atau lokasi folder di vault..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  {selectedIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
                    <>
                      <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
                      <span>Batal Semua</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-3.5 w-3.5 text-slate-500" />
                      <span>Pilih Semua</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportArchive}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  title="Unduh file terpilih sebagai ZIP"
                >
                  <Archive className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Unduh ZIP</span>
                </button>
              </div>
            </div>

            {/* Files List with interactive Checkboxes and Direction Toggles */}
            <div className="space-y-2.5">
              {filteredFiles.map((file) => {
                const isProject = file.sourceType === "project";
                const isSelected = selectedIds.includes(file.id);

                return (
                  <div
                    key={file.id}
                    className={`flex items-center justify-between rounded-2xl p-3.5 border transition-all gap-3 ${
                      isSelected
                        ? "bg-slate-950/90 border-purple-500/40 shadow-sm"
                        : "bg-slate-950/40 border-slate-800/80 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Selection Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleItemSelection(file.id)}
                        className="text-slate-400 hover:text-purple-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-purple-400" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-600" />
                        )}
                      </button>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isProject ? "bg-indigo-500/10 text-indigo-400" : "bg-purple-500/10 text-purple-400"
                        }`}
                      >
                        {isProject ? <KanbanSquare className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                      </div>

                      <div className="truncate max-w-xs sm:max-w-md">
                        <div className="text-xs font-bold text-slate-100 truncate">{file.title}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                          📁 {file.vaultRelativePath}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Direction Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleDirection(file.id)}
                        title="Klik untuk mengubah mode sinkronisasi"
                        className="rounded-lg bg-slate-900 border border-slate-800 px-2 py-1 text-[10px] font-mono text-slate-300 hover:border-purple-500 transition-colors"
                      >
                        {file.direction === "bidirectional"
                          ? "🔄 Dua Arah"
                          : file.direction === "export_only"
                          ? "⬆️ Export Saja"
                          : "⬇️ Import Saja"}
                      </button>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
                          <Check className="h-3 w-3" />
                          Sinkron
                        </span>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {formatBytes(file.fileSize)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Vault Configuration & Sync History */}
          <div className="lg:col-span-4 space-y-6">
            {/* Vault Settings Summary */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">Status Direktori Vault</h3>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Ubah
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 text-[11px] mb-1">Path Folder Vault:</div>
                  <div className="rounded-xl bg-slate-950 p-2.5 font-mono text-xs text-slate-200 border border-slate-800 truncate" title={config.vaultPath}>
                    {config.vaultPath}
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Auto Sync:</span>
                    <span className="font-semibold text-emerald-400">{config.autoSync ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>YAML Frontmatter:</span>
                    <span className="font-semibold text-purple-400">{config.includeFrontmatter ? "Sertakan" : "Hanya Teks"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Interval Cek:</span>
                    <span className="font-semibold text-slate-200">Tiap {config.syncIntervalMinutes} Menit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Clock className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Riwayat Aktivitas Sinkron</h3>
              </div>

              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">SUKSES</span>
                      <span className="text-slate-500">{formatDate(log.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">{log.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vault Connector Modal */}
      <VaultConnectorModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* Sync Summary Modal */}
      <SyncSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={syncSummary}
      />
    </div>
  );
}