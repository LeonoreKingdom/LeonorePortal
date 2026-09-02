"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Sparkles, 
  Layers, 
  Compass, 
  X, 
  ArrowUpDown,
  RefreshCw
} from "lucide-react";
import { MOCK_APPS, AppItem } from "@/data/mock-apps";
import { AppCard } from "@/components/app-card";
import { SearchBar } from "@/components/search-bar";

const CATEGORIES = [
  "Semua",
  "Productivity",
  "Utilities",
  "Media",
  "Development",
  "Design",
];

const SUGGESTED_SEARCHES = ["Kanban", "Obsidian", "Markdown", "Converter", "Tools", "Diff"];

type SortOption = "default" | "name-asc" | "name-desc" | "category" | "status";

export default function AppPortalPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [apps, setApps] = useState<AppItem[]>(MOCK_APPS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch real-time apps from database (Turso / SQLite)
  const fetchApps = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/apps");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setApps(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal mengambil data aplikasi dari database:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // Filter & Deterministically Sort apps
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

      const matchesTag = !selectedTag || app.tags.includes(selectedTag);

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
            a.id.localeCompare(b.id)
          );
        case "status": {
          const statusScore = { active: 1, beta: 2, maintenance: 3 };
          const diff = (statusScore[a.status] || 99) - (statusScore[b.status] || 99);
          if (diff !== 0) return diff;
          return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
        }
        case "default":
        default:
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "id") || a.id.localeCompare(b.id);
      }
    });
  }, [apps, searchQuery, selectedCategory, selectedTag, sortBy]);

  const pinnedApps = useMemo(() => {
    return filteredAndSortedApps.filter((app) => app.isPinned);
  }, [filteredAndSortedApps]);

  const otherApps = useMemo(() => {
    return filteredAndSortedApps.filter((app) => !app.isPinned);
  }, [filteredAndSortedApps]);

  const handleSelectTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  return (
    <div className="relative isolate min-h-screen pb-20">
      {/* Decorative Glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-sky-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 mb-2 sm:mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              LeonorePortal Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Portal Aplikasi
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
              Akses cepat dan terpusat ke semua aplikasi, modul utilitas lokal, catatan Markdown, dan integrasi Obsidian.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2">
              <div>
                <div className="text-[11px] sm:text-xs text-slate-400">Total Aplikasi</div>
                <div className="text-lg sm:text-xl font-bold text-white">{apps.length}</div>
              </div>
              <button 
                onClick={fetchApps} 
                title="Segarkan data dari database"
                className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 sm:px-4 py-2 sm:py-2.5">
              <div className="text-[11px] sm:text-xs text-slate-400">Kategori</div>
              <div className="text-lg sm:text-xl font-bold text-indigo-400">{CATEGORIES.length - 1}</div>
            </div>
          </div>
        </div>

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

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none self-start w-full lg:w-auto">
            {CATEGORIES.map((cat) => (
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

        {/* Apps Listing */}
        {filteredAndSortedApps.length === 0 ? (
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
          <div className="mt-6 sm:mt-8 space-y-8 sm:space-y-10">
            {/* Pinned Section */}
            {pinnedApps.length > 0 && selectedCategory === "Semua" && !searchQuery && !selectedTag && sortBy === "default" && (
              <div>
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Aplikasi Utama & Favorit
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {pinnedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      highlightQuery={searchQuery}
                      onSelectTag={handleSelectTag}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Listing Section */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
                    {selectedCategory === "Semua" && !searchQuery && !selectedTag && sortBy === "default"
                      ? "Semua Aplikasi"
                      : `Hasil (${filteredAndSortedApps.length})`}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {(selectedCategory === "Semua" && !searchQuery && !selectedTag && sortBy === "default"
                  ? otherApps
                  : filteredAndSortedApps
                ).map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    highlightQuery={searchQuery}
                    onSelectTag={handleSelectTag}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}