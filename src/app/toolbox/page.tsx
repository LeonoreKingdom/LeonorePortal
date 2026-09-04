"use client";

import { useState, useMemo } from "react";
import { 
  Wrench, 
  Search, 
  Sparkles, 
  Zap, 
  Layers, 
  X,
  ArrowRight
} from "lucide-react";
import { TOOLBOX_ITEMS, TOOLBOX_CATEGORIES, ToolItem } from "@/data/mock-toolbox";
import { ToolCard } from "@/components/tool-card";

export default function ToolboxPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredTools = useMemo(() => {
    return TOOLBOX_ITEMS.filter((tool) => {
      const matchCategory = activeCategory === "all" || tool.category === activeCategory;
      const matchSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="relative isolate min-h-screen pb-20">
      {/* Dynamic Background Glows */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 via-pink-500 to-amber-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Page Hero Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              Toolbox
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Super Tools for Productivity.
            </p>
          </div>

          {/* Search bar inside toolbox */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alat (misal: JSON, PDF, QR)..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-9 text-xs sm:text-sm text-slate-200 placeholder-slate-500 backdrop-blur-md focus:border-indigo-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeCategory === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            Semua Kategori ({TOOLBOX_ITEMS.length})
          </button>

          {TOOLBOX_CATEGORIES.map((cat) => {
            const count = TOOLBOX_ITEMS.filter((t) => t.category === cat.id).length;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? "text-white shadow-md"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
                style={{
                  backgroundColor: isActive ? cat.color : undefined,
                  borderColor: isActive ? cat.color : undefined,
                }}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isActive ? "bg-black/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="mt-8">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center">
              <Wrench className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">
                Tidak ada alat yang cocok
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Coba gunakan kata kunci pencarian yang lain atau pilih kategori Semua.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}