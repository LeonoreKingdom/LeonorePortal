"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Tag, 
  Copy, 
  Check, 
  Edit3, 
  ListTree, 
  ArrowRight,
  FileText,
  Save,
  Eye,
  CheckCircle2
} from "lucide-react";
import { MOCK_CATEGORIES, MOCK_WIKI_PAGES, WikiPageItem } from "@/data/mock-wiki";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { MarkdownEditor } from "@/components/markdown-editor";
import { WikiModal } from "@/components/wiki-modal";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function WikiDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  const initialPage = useMemo(() => {
    return (
      MOCK_WIKI_PAGES.find((p) => p.slug === slug) || {
        id: `wiki-${slug}`,
        categoryId: "cat-1",
        title: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        slug,
        tags: ["Wiki", "Dokumentasi"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contentMarkdown: `# ${slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}\n\nDokumen wiki baru. Tulis konten detail di sini.`,
      }
    );
  }, [slug]);

  const [page, setPage] = useState<WikiPageItem>(initialPage);
  const [draftContent, setDraftContent] = useState(page.contentMarkdown);
  const [draftTitle, setDraftTitle] = useState(page.title);

  const category = useMemo(() => {
    return MOCK_CATEGORIES.find((c) => c.id === page.categoryId) || MOCK_CATEGORIES[0];
  }, [page.categoryId]);

  const relatedPages = useMemo(() => {
    return MOCK_WIKI_PAGES.filter(
      (p) => p.categoryId === page.categoryId && p.slug !== page.slug
    );
  }, [page.categoryId, page.slug]);

  const tocItems = useMemo(() => {
    const lines = (isInlineEditing ? draftContent : page.contentMarkdown).split("\n");
    const items: { text: string; level: number }[] = [];
    lines.forEach((line) => {
      if (line.startsWith("# ")) {
        items.push({ text: line.slice(2).trim(), level: 1 });
      } else if (line.startsWith("## ")) {
        items.push({ text: line.slice(3).trim(), level: 2 });
      } else if (line.startsWith("### ")) {
        items.push({ text: line.slice(4).trim(), level: 3 });
      }
    });
    return items;
  }, [page.contentMarkdown, draftContent, isInlineEditing]);

  const formattedDate = new Date(page.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveInline = () => {
    setPage((prev) => ({
      ...prev,
      title: draftTitle.trim() || prev.title,
      contentMarkdown: draftContent,
      updatedAt: new Date().toISOString(),
    }));
    setIsInlineEditing(false);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const handleCancelInline = () => {
    setDraftTitle(page.title);
    setDraftContent(page.contentMarkdown);
    setIsInlineEditing(false);
  };

  const handleSaveEdit = (pageData: Partial<WikiPageItem>) => {
    setPage((prev) => ({
      ...prev,
      ...pageData,
      updatedAt: new Date().toISOString(),
    }));
    setDraftTitle(pageData.title || page.title);
    setDraftContent(pageData.contentMarkdown || page.contentMarkdown);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
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
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link
            href="/knowledge-base"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Knowledge Base
          </Link>
          <span>/</span>
          <span className="text-slate-500">{category.name}</span>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs">{page.title}</span>
        </div>

        {/* Save Notification Toast */}
        {savedAlert && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Perubahan dokumen wiki berhasil disimpan!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Main Article Container */}
          <article className="lg:col-span-3 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
            {/* Metadata Header */}
            <div className="pb-6 border-b border-slate-800/80">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-md px-2.5 py-1 text-xs font-semibold border"
                    style={{
                      backgroundColor: `${category.color}15`,
                      borderColor: `${category.color}40`,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Diperbarui {formattedDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    title="Salin tautan halaman"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? "Tersalin" : "Salin Tautan"}</span>
                  </button>

                  {!isInlineEditing ? (
                    <button
                      onClick={() => {
                        setDraftContent(page.contentMarkdown);
                        setDraftTitle(page.title);
                        setIsInlineEditing(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600/20 px-2.5 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-600 hover:text-white border border-sky-500/30 transition-all"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Isi</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelInline}
                        className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveInline}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-500 shadow-md shadow-sky-600/20"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Simpan Isi</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {isInlineEditing ? (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Judul Dokumen
                  </label>
                  <input
                    type="text"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xl font-bold text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {page.title}
                </h1>
              )}

              {/* Tags */}
              {page.tags && page.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {page.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-400 border border-slate-800"
                    >
                      <Tag className="h-3 w-3 opacity-60" />
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rendered or Edited Markdown Body */}
            <div className="mt-8">
              {isInlineEditing ? (
                <div className="space-y-4">
                  <MarkdownEditor
                    value={draftContent}
                    onChange={setDraftContent}
                    placeholder="Tulis atau perbarui isi dokumen wiki..."
                    minHeight="min-h-[360px]"
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={handleCancelInline}
                      className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveInline}
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-500 shadow-md shadow-sky-600/25"
                    >
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              ) : (
                <MarkdownRenderer content={page.contentMarkdown} />
              )}
            </div>
          </article>

          {/* Right Sidebar: Table of Contents & Related Wiki Pages */}
          <aside className="space-y-6">
            {/* Table of Contents */}
            {tocItems.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <ListTree className="h-4 w-4 text-sky-400" />
                  <span>Daftar Isi</span>
                </div>
                <nav className="mt-3 space-y-1.5 text-xs">
                  {tocItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "text-slate-400 hover:text-sky-300 transition-colors",
                        item.level === 1 && "font-semibold text-slate-200",
                        item.level === 2 && "pl-3",
                        item.level === 3 && "pl-6 text-[11px] text-slate-500"
                      )}
                    >
                      {item.text}
                    </div>
                  ))}
                </nav>
              </div>
            )}

            {/* Related Pages */}
            {relatedPages.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  <span>Dokumen Terkait</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {relatedPages.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/knowledge-base/${rp.slug}`}
                      className="group block rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 hover:border-sky-500/40 transition-all"
                    >
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                        {rp.title}
                      </h4>
                      <p className="mt-1 text-[11px] font-mono text-slate-500">
                        /{rp.slug}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Edit Wiki Page Modal */}
      <WikiModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        existingPages={MOCK_WIKI_PAGES}
        categories={MOCK_CATEGORIES}
        pageToEdit={page}
      />
    </div>
  );
}