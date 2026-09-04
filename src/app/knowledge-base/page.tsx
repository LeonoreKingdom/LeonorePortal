"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Search, 
  Plus, 
  Tag, 
  X,
  Compass,
  Command
} from "lucide-react";
import { MOCK_CATEGORIES, MOCK_WIKI_PAGES, WikiPageItem, WikiCategory } from "@/data/mock-wiki";
import { WikiPageCard } from "@/components/wiki-page-card";
import { WikiModal } from "@/components/wiki-modal";

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [categories, setCategories] = useState<WikiCategory[]>(MOCK_CATEGORIES);
  const [pages, setPages] = useState<WikiPageItem[]>(MOCK_WIKI_PAGES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageToEdit, setPageToEdit] = useState<WikiPageItem | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for `/` and `Ctrl+K`
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.ctrlKey && e.key === "k") || (e.metaKey && e.key === "k")) &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    fetch("/api/wiki")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPages(data.data);
        }
      })
      .catch((err) => console.error("Gagal memuat artikel wiki dari API:", err));

    fetch("/api/wiki/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch((err) => console.error("Gagal memuat kategori wiki dari API:", err));
  }, []);

  // Filtered pages
  const filteredPages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return pages.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.contentMarkdown.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "Semua" || p.categoryId === selectedCategory;

      const matchesTag = !selectedTag || p.tags.includes(selectedTag);

      return matchesSearch && matchesCat && matchesTag;
    });
  }, [pages, searchQuery, selectedCategory, selectedTag]);

  // Group pages by category for structured overview
  const groupedPages = useMemo(() => {
    return categories
      .map((cat) => {
        const catPages = filteredPages.filter((p) => p.categoryId === cat.id);
        return {
          category: cat,
          pages: catPages,
        };
      })
      .filter((g) => g.pages.length > 0);
  }, [categories, filteredPages]);

  const handleSelectTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  const handleCreatePage = () => {
    setPageToEdit(null);
    setIsModalOpen(true);
  };

  const handleSavePage = (pageData: Partial<WikiPageItem>) => {
    if (pageToEdit) {
      setPages((prev) =>
        prev.map((p) =>
          p.id === pageToEdit.id
            ? {
                ...p,
                ...pageData,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
    } else {
      const newPage: WikiPageItem = {
        id: pageData.id || `wiki-${Date.now()}`,
        title: pageData.title || "Halaman Baru",
        slug: pageData.slug || "halaman-baru",
        categoryId: pageData.categoryId || categories[0]?.id || "cat-1",
        tags: pageData.tags || [],
        contentMarkdown: pageData.contentMarkdown || "# Halaman Baru",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPages((prev) => [newPage, ...prev]);
    }
  };

  const handleAddCategory = (newCat: WikiCategory) => {
    setCategories((prev) => [...prev, newCat]);
  };

  return (
    <div className="relative isolate min-h-screen pb-20">
      {/* Background Glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-sky-600 to-indigo-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Knowledge Base
            </h1>
            <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
              Second Brain &amp; Wiki
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-center">
                <div className="text-[10px] sm:text-[11px] text-slate-400">Total Halaman</div>
                <div className="text-base sm:text-lg font-bold text-white">{pages.length}</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-center">
                <div className="text-[10px] sm:text-[11px] text-sky-400">Kategori</div>
                <div className="text-base sm:text-lg font-bold text-sky-300">{categories.length}</div>
              </div>
            </div>

            <button
              onClick={handleCreatePage}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-sky-500 shadow-md shadow-sky-600/25 transition-all"
            >
              <Plus className="h-4 w-4" />
              Buat Halaman
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari artikel, topik, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-20 py-2.5 text-sm text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-1 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-700">
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </div>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("Semua")}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                selectedCategory === "Semua"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/25"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-sky-600 text-white shadow-md shadow-sky-500/25"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Tag Filter Feedback Status */}
        {(searchQuery || selectedTag) && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span>
                Menampilkan <strong className="text-white">{filteredPages.length}</strong> halaman
                {searchQuery && <> untuk kata kunci &ldquo;<span className="text-sky-300">{searchQuery}</span>&rdquo;</>}
              </span>

              {selectedTag && (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/20 px-2.5 py-0.5 text-xs font-mono text-sky-300 border border-sky-500/40">
                  <Tag className="h-3 w-3" />
                  #{selectedTag}
                  <button onClick={() => setSelectedTag(null)} className="hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Semua");
                setSelectedTag(null);
              }}
              className="text-xs text-sky-400 hover:text-sky-300 hover:underline"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

        {/* Grouped Wiki Listing */}
        {filteredPages.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-12 text-center">
            <Compass className="h-10 w-10 text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-slate-300">Tidak ada halaman ditemukan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Coba sesuaikan kata kunci pencarian atau buat halaman baru.
            </p>
            <button
              onClick={handleCreatePage}
              className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Buat Halaman Baru
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {groupedPages.map(({ category, pages: catPages }) => (
              <div key={category.id} className="space-y-4">
                {/* Category Section Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {category.name}
                    </h2>
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-400 font-semibold">
                      {catPages.length}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-xs text-slate-400">
                    {category.description}
                  </span>
                </div>

                {/* Cards in Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catPages.map((page) => (
                    <WikiPageCard
                      key={page.id}
                      page={page}
                      category={category}
                      searchQuery={searchQuery}
                      onSelectTag={handleSelectTag}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wiki Create/Edit Modal */}
      <WikiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePage}
        existingPages={pages}
        categories={categories}
        pageToEdit={pageToEdit}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}