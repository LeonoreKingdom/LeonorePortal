"use client";

import Link from "next/link";
import { 
  FileText, 
  Calendar, 
  Tag, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import { WikiPageItem, WikiCategory } from "@/data/mock-wiki";
import { cn } from "@/lib/utils";

interface WikiPageCardProps {
  page: WikiPageItem;
  category?: WikiCategory;
  searchQuery?: string;
  onSelectTag?: (tag: string) => void;
}

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) {
    return <span>{text}</span>;
  }
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded bg-sky-500/25 px-0.5 text-sky-200 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function WikiPageCard({ page, category, searchQuery, onSelectTag }: WikiPageCardProps) {
  const formattedDate = new Date(page.updatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const plainContent = page.contentMarkdown.replace(/[#*`_>\[\]]/g, "").slice(0, 140);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) {
      return;
    }
    window.location.href = `/knowledge-base/${page.slug}`;
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-sky-500/10 cursor-pointer select-none"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 group-hover:scale-105 transition-transform">
              <BookOpen className="h-4 w-4" />
            </div>
            {category && (
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700/60">
                {category.name}
              </span>
            )}
          </div>

          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </span>
        </div>

        {/* Title & Preview */}
        <div className="mt-3.5">
          <Link href={`/knowledge-base/${page.slug}`}>
            <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
              <HighlightText text={page.title} query={searchQuery} />
            </h3>
          </Link>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
            <HighlightText text={`${plainContent}...`} query={searchQuery} />
          </p>
        </div>

        {/* Tags */}
        {page.tags && page.tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {page.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200 transition-colors"
              >
                <Tag className="h-2.5 w-2.5 opacity-60" />
                <HighlightText text={tag} query={searchQuery} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Read Link */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500">
          /<HighlightText text={page.slug} query={searchQuery} />
        </span>

        <Link
          href={`/knowledge-base/${page.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>Baca Dokumen</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}