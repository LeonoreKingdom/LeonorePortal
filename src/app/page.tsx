"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Compass, 
  X, 
  ArrowUpDown,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Pencil,
  Check
} from "lucide-react";
import { AppItem } from "@/data/mock-apps";
import { AppCard } from "@/components/app-card";
import { SearchBar } from "@/components/search-bar";
import { useAuth } from "@/components/auth-provider";
import { TECH_STACK_LIST, TechBadge } from "@/data/tech-stack";

interface PortalCategory {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

const DEFAULT_CATEGORIES: PortalCategory[] = [
  { id: "cat-portfolio", name: "Portfolio", color: "#ec4899", sortOrder: 1 },
  { id: "cat-dev", name: "Development", color: "#6366f1", sortOrder: 2 },
  { id: "cat-prod", name: "Productivity", color: "#10b981", sortOrder: 3 },
  { id: "cat-media", name: "Media", color: "#0ea5e9", sortOrder: 4 },
  { id: "cat-util", name: "Utilities", color: "#f59e0b", sortOrder: 5 },
  { id: "cat-design", name: "Design", color: "#a855f7", sortOrder: 6 },
];

const SUGGESTED_SEARCHES = ["Portfolio", "Next.js", "Supabase", "Astro", "React", "Development"];

type SortOption = "default" | "name-asc" | "name-desc" | "category" | "status";

export default function AppPortalPage() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Real-time Database Data
  const [apps, setApps] = useState<AppItem[]>([]);
  const [categories, setCategories] = useState<PortalCategory[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Admin App Editing States
  const [editingApp, setEditingApp] = useState<Partial<AppItem> | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState<boolean>(false);
  const [deleteTargetApp, setDeleteTargetApp] = useState<AppItem | null>(null);
  const [customTagInput, setCustomTagInput] = useState<string>("");

  // Category Management States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatColor, setNewCatColor] = useState<string>("#6366f1");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch real-time apps from database (Turso / SQLite)
  const fetchApps = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/apps");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setApps(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data aplikasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch categories from database
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/portal-categories");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil kategori:", err);
    }
  };

  useEffect(() => {
    fetchApps();
    fetchCategories();
  }, []);

  // Save / Update App
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      setIsSubmitting(true);
      const isNew = !editingApp.id;
      const url = isNew ? "/api/apps" : `/api/apps/${editingApp.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingApp),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({
          type: "success",
          text: `Aplikasi '${editingApp.name}' berhasil ${isNew ? "ditambahkan" : "diperbarui"}.`,
        });
        setIsAppModalOpen(false);
        setEditingApp(null);
        await fetchApps();
      } else {
        setFeedback({
          type: "error",
          text: json.error || "Gagal menyimpan data aplikasi.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete App
  const handleDeleteApp = async () => {
    if (!deleteTargetApp) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/apps/${deleteTargetApp.id}`, { method: "DELETE" });
      const json = await res.json();

      if (res.ok && json.success) {
        setFeedback({
          type: "success",
          text: `Aplikasi '${deleteTargetApp.name}' berhasil dihapus.`,
        });
        setDeleteTargetApp(null);
        await fetchApps();
      } else {
        setFeedback({
          type: "error",
          text: json.error || "Gagal menghapus aplikasi.",
        });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Category Actions
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingCatId) {
        const res = await fetch(`/api/portal-categories/${editingCatId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCatName.trim(), color: newCatColor }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setFeedback({ type: "success", text: `Kategori '${newCatName}' berhasil diperbarui.` });
          setEditingCatId(null);
          setNewCatName("");
          await fetchCategories();
        } else {
          setFeedback({ type: "error", text: json.error || "Gagal memperbarui kategori." });
        }
      } else {
        const res = await fetch("/api/portal-categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newCatName.trim(), color: newCatColor, sortOrder: categories.length + 1 }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setFeedback({ type: "success", text: `Kategori '${newCatName}' berhasil ditambahkan.` });
          setNewCatName("");
          await fetchCategories();
        } else {
          setFeedback({ type: "error", text: json.error || "Gagal menambahkan kategori." });
        }
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: PortalCategory) => {
    if (!confirm(`Hapus kategori '${cat.name}'?`)) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/portal-categories/${cat.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setFeedback({ type: "success", text: `Kategori '${cat.name}' berhasil dihapus.` });
        if (selectedCategory === cat.name) setSelectedCategory("Semua");
        await fetchCategories();
      } else {
        setFeedback({ type: "error", text: json.error || "Gagal menghapus kategori." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Terjadi kesalahan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Tech Stack Tag in App Modal
  const toggleTechTag = (tagName: string) => {
    if (!editingApp) return;
    const currentTags = editingApp.tags || [];
    const exists = currentTags.some((t) => t.toLowerCase() === tagName.toLowerCase());

    const updatedTags = exists
      ? currentTags.filter((t) => t.toLowerCase() !== tagName.toLowerCase())
      : [...currentTags, tagName];

    setEditingApp({ ...editingApp, tags: updatedTags });
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim() || !editingApp) return;
    const tagToAdd = customTagInput.trim();
    const currentTags = editingApp.tags || [];
    if (!currentTags.includes(tagToAdd)) {
      setEditingApp({ ...editingApp, tags: [...currentTags, tagToAdd] });
    }
    setCustomTagInput("");
  };

  // Filter & Deterministically Sort apps
  const pinnedApps = useMemo(() => {
    return apps.filter((a) => a.isPinned);
  }, [apps]);

  const filteredAndSortedApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = apps.filter((app) => {
      const matchesSearch =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q) ||
        app.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "Semua" || app.category === selectedCategory;

      const matchesTag = !selectedTag || app.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      return matchesSearch && matchesCategory && matchesTag;
    });

    return filtered.sort((a, b) => {
      if (q) {
        const aTitleStarts = a.name.toLowerCase().startsWith(q);
        const bTitleStarts = b.name.toLowerCase().startsWith(q);
        if (aTitleStarts && !bTitleStarts) return -1;
        if (!aTitleStarts && bTitleStarts) return 1;

        const aTitleContains = a.name.toLowerCase().includes(q);
        const bTitleContains = b.name.toLowerCase().includes(q);
        if (aTitleContains && !bTitleContains) return -1;
        if (!aTitleContains && bTitleContains) return 1;
      }

      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name, "id") || a.id.localeCompare(b.id);
        case "name-desc":
          return b.name.localeCompare(a.name, "id") || a.id.localeCompare(b.id);
        case "category":
          return (
            a.category.localeCompare(b.category, "id") ||
            a.sortOrder - b.sortOrder ||
            a.name.localeCompare(b.name, "id")
          );
        case "status":
          return a.status.localeCompare(b.status) || a.name.localeCompare(b.name, "id");
        case "default":
        default:
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "id");
      }
    });
  }, [apps, searchQuery, selectedCategory, selectedTag, sortBy]);

  const handleSelectTag = (tag: string) => {
    if (selectedTag?.toLowerCase() === tag.toLowerCase()) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setSelectedCategory("Semua");
    }
  };

  const categoryTabList = useMemo(() => {
    return ["Semua", ...categories.map((c) => c.name)];
  }, [categories]);

  return (
    <div className="relative isolate min-h-screen pb-20">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-30 sm:w-[72.1875rem]" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-2 sm:mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              LeonorePortal Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Portal Aplikasi & Portofolio
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
              Akses cepat dan terpusat ke semua aplikasi, portofolio proyek web, modul utilitas lokal, dan integrasi workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    setEditingApp({
                      name: "",
                      description: "",
                      url: "https://",
                      category: categories[0]?.name || "Portfolio",
                      icon: "Globe",
                      status: "active",
                      isPinned: false,
                      sortOrder: apps.length + 1,
                      tags: ["Next.js", "Tailwind CSS"],
                    });
                    setIsAppModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Aplikasi</span>
                </button>

                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-all"
                  title="Kelola Kategori App Portal"
                >
                  <Settings className="h-4 w-4 text-indigo-400" />
                  <span>Kelola Kategori</span>
                </button>
              </>
            )}

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
              <div>
                <div className="text-[11px] sm:text-xs text-slate-400">Total Aplikasi</div>
                <div className="text-lg sm:text-xl font-bold text-white">{apps.length}</div>
              </div>
              <button 
                onClick={fetchApps} 
                title="Segarkan data aplikasi"
                className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="mt-8 sm:mt-10 flex flex-col lg:flex-row items-stretch lg:items-start justify-between gap-3.5 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 flex-1">
            {/* Search Input */}
            <div className="flex-1 w-full lg:max-w-lg">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                totalResults={filteredAndSortedApps.length}
                totalItems={apps.length}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start w-full sm:w-auto">
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-300 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="text-slate-500">Urutan:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-slate-900 text-slate-200">Default (Utama)</option>
                  <option value="name-asc" className="bg-slate-900 text-slate-200">Nama (A - Z)</option>
                  <option value="name-desc" className="bg-slate-900 text-slate-200">Nama (Z - A)</option>
                  <option value="category" className="bg-slate-900 text-slate-200">Kategori</option>
                  <option value="status" className="bg-slate-900 text-slate-200">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none self-start w-full lg:w-auto">
            {categoryTabList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Quick Searches */}
        {!searchQuery && !selectedTag && selectedCategory === "Semua" && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span>Saran pencarian:</span>
            {SUGGESTED_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className="rounded-md bg-slate-900/60 px-2 py-0.5 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-indigo-300 border border-slate-800/60 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Active Filters Summary */}
        {(selectedTag || sortBy !== "default" || searchQuery || selectedCategory !== "Semua") && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Filter aktif:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-indigo-300 border border-indigo-500/30">
                Pencarian: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory !== "Semua" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-0.5 text-slate-300">
                Kategori: {selectedCategory}
                <button onClick={() => setSelectedCategory("Semua")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedTag && (
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-indigo-300 border border-indigo-500/30">
                Tag: #{selectedTag}
                <button onClick={() => setSelectedTag(null)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {sortBy !== "default" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-0.5 text-slate-300">
                Urutan: {sortBy}
                <button onClick={() => setSortBy("default")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua");
                setSelectedTag(null);
                setSortBy("default");
              }}
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ml-1"
            >
              Reset semua
            </button>
          </div>
        )}

        {/* SKELETON LOADER STATE */}
        {isLoading ? (
          <div className="mt-6 sm:mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Memuat Aplikasi Portal...
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-6 space-y-4 animate-pulse relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-800" />
                    <div className="h-5 w-16 rounded-full bg-slate-800/80" />
                  </div>
                  <div className="space-y-2 pt-1">
                    <div className="h-5 w-3/4 rounded-md bg-slate-800" />
                    <div className="h-3.5 w-full rounded bg-slate-800/60" />
                    <div className="h-3.5 w-4/5 rounded bg-slate-800/60" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-4 w-16 rounded-md bg-slate-800/80" />
                    <div className="h-4 w-20 rounded-md bg-slate-800/80" />
                    <div className="h-4 w-14 rounded-md bg-slate-800/80" />
                  </div>
                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="h-4 w-20 rounded bg-slate-800/60" />
                    <div className="h-4 w-16 rounded bg-slate-800/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredAndSortedApps.length === 0 ? (
          <div className="mt-12 sm:mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-8 sm:p-12 text-center">
            <Compass className="h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Tidak ada aplikasi ditemukan</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Tidak ada hasil yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau filter yang dipilih.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua");
                setSelectedTag(null);
                setSortBy("default");
              }}
              className="mt-4 rounded-lg bg-indigo-600/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-600/30"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 space-y-10">
            {/* 1. PINNED APPS SECTION (Shown on default view) */}
            {selectedCategory === "Semua" && !searchQuery && !selectedTag && sortBy === "default" && pinnedApps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80"></span>
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>Aplikasi Utama & Favorit</span>
                    <span className="text-slate-500 font-mono text-[11px]">({pinnedApps.length})</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {pinnedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      highlightQuery={searchQuery}
                      onSelectTag={handleSelectTag}
                      isAdmin={isAdmin}
                      onEdit={(a) => {
                        setEditingApp(a);
                        setIsAppModalOpen(true);
                      }}
                      onDelete={(a) => setDeleteTargetApp(a)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. ALL APPS / FILTERED SECTION */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>
                      {selectedCategory === "Semua" && !searchQuery && !selectedTag && sortBy === "default"
                        ? "Semua Aplikasi"
                        : "Hasil Pencarian"}
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">({filteredAndSortedApps.length})</span>
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredAndSortedApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    highlightQuery={searchQuery}
                    onSelectTag={handleSelectTag}
                    isAdmin={isAdmin}
                    onEdit={(a) => {
                      setEditingApp(a);
                      setIsAppModalOpen(true);
                    }}
                    onDelete={(a) => setDeleteTargetApp(a)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: SUNTING / TAMBAH APLIKASI (ADMIN) */}
      {isAppModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                <span>{editingApp.id ? "Sunting Aplikasi Portal" : "Tambah Aplikasi Portal Baru"}</span>
              </h3>
              <button onClick={() => setIsAppModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApp} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Aplikasi / Portofolio:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tokoku E-Commerce Platform"
                  value={editingApp.name || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat fungsi atau fitur aplikasi..."
                  value={editingApp.description || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tautan / URL Produksi:</label>
                  <input
                    type="url"
                    required
                    placeholder="https://... (cth: https://my-app.vercel.app)"
                    value={editingApp.url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, url: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori:</label>
                  <select
                    value={editingApp.category || categories[0]?.name || "Portfolio"}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* TECH STACK MULTI-SELECT WITH REAL LOGOS */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">
                    Tech Stack & Tags (Pilih Satu atau Lebih):
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {editingApp.tags?.length || 0} dipilih
                  </span>
                </div>

                {/* Selected Tags Display */}
                {editingApp.tags && editingApp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    {editingApp.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 pl-1.5 pr-1 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-[11px]"
                      >
                        <TechBadge name={tag} />
                        <button
                          type="button"
                          onClick={() => toggleTechTag(tag)}
                          className="text-slate-400 hover:text-rose-400 p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tech Stack Catalog Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                  {TECH_STACK_LIST.map((tech) => {
                    const isSelected = editingApp.tags?.some((t) => t.toLowerCase() === tech.name.toLowerCase());
                    const Icon = tech.icon;
                    return (
                      <button
                        key={tech.id}
                        type="button"
                        onClick={() => toggleTechTag(tech.name)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow-sm shadow-indigo-500/20"
                            : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate text-[11px]">{tech.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-indigo-400 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Tech Tag Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Tambah tech tag kustom..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                  >
                    Tambah Tag
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urutan Tampilan:</label>
                  <input
                    type="number"
                    value={editingApp.sortOrder || 1}
                    onChange={(e) => setEditingApp({ ...editingApp, sortOrder: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status:</label>
                  <select
                    value={editingApp.status || "active"}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active (Aktif)</option>
                    <option value="beta">Beta</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={editingApp.isPinned || false}
                  onChange={(e) => setEditingApp({ ...editingApp, isPinned: e.target.checked })}
                  className="rounded accent-indigo-600 h-4 w-4"
                />
                <label htmlFor="isPinned" className="text-slate-300 font-medium cursor-pointer">
                  Tandai sebagai Aplikasi Utama / Favorit (Ditampilkan teratas dengan pin)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-750"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Aplikasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KELOLA KATEGORI (ADMIN) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-indigo-400" />
                <span>Kelola Kategori App Portal</span>
              </h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Add/Edit Category */}
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nama kategori (cth: AI Tools)..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-800 p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  title="Warna Lencana"
                  className="h-9 w-9 rounded-xl bg-slate-950 border border-slate-800 p-0.5 cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shrink-0 disabled:opacity-50"
                >
                  {editingCatId ? "Update" : "Tambah"}
                </button>
              </div>
              {editingCatId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCatId(null);
                    setNewCatName("");
                  }}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  Batal Sunting
                </button>
              )}
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 pt-2 border-t border-slate-800 max-h-60 overflow-y-auto">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Daftar Kategori ({categories.length})
              </div>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="font-medium text-slate-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setNewCatName(cat.name);
                          setNewCatColor(cat.color);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-300"
                        title="Sunting"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HAPUS APLIKASI (ADMIN) */}
      {deleteTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Konfirmasi Hapus Aplikasi</h3>
            <p className="text-xs text-slate-400">
              Apakah Anda yakin ingin menghapus <strong>{deleteTargetApp.name}</strong> dari portal?
            </p>
            <div className="flex gap-2 pt-2 text-xs">
              <button
                onClick={() => setDeleteTargetApp(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 font-bold text-slate-300 hover:bg-slate-750"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteApp}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white shadow-lg shadow-rose-600/30"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
