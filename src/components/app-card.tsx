"use client";

import { useState } from "react";
import { 
  Wrench, 
  KanbanSquare, 
  BookOpen, 
  Image as ImageIcon, 
  FileCode2, 
  RefreshCw, 
  QrCode, 
  Palette, 
  ExternalLink, 
  Pin, 
  Globe, 
  Copy, 
  Check, 
  Tag,
  Pencil,
  Trash2
} from "lucide-react";
import { AppItem } from "@/data/mock-apps";
import { cn } from "@/lib/utils";
import { TechBadge } from "@/data/tech-stack";

const ICON_MAP: Record<string, any> = {
  Wrench,
  KanbanSquare,
  BookOpen,
  Image: ImageIcon,
  FileCode2,
  RefreshCw,
  QrCode,
  Palette,
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; glow: string; btn: string }> = {
  Productivity: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    glow: "group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10",
    btn: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20",
  },
  Utilities: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10",
    btn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20",
  },
  Media: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/30",
    glow: "group-hover:border-sky-500/50 group-hover:shadow-sky-500/10",
    btn: "bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20",
  },
  Development: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    glow: "group-hover:border-amber-500/50 group-hover:shadow-amber-500/10",
    btn: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20",
  },
  Design: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
    glow: "group-hover:border-purple-500/50 group-hover:shadow-purple-500/10",
    btn: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20",
  },
};

interface AppCardProps {
  app: AppItem;
  highlightQuery?: string;
  onSelectTag?: (tag: string) => void;
  isAdmin?: boolean;
  onEdit?: (app: AppItem) => void;
  onDelete?: (app: AppItem) => void;
}

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const trimmed = query.trim();
  const parts = text.split(new RegExp(`(${trimmed.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="rounded bg-indigo-500/30 px-0.5 font-semibold text-indigo-200"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export function AppCard({ app, highlightQuery, onSelectTag, isAdmin, onEdit, onDelete }: AppCardProps) {
  const [copied, setCopied] = useState(false);
  const IconComponent = ICON_MAP[app.icon] || Globe;
  const isInternal = app.url.startsWith("/");
  const catStyle = CATEGORY_STYLES[app.category] || CATEGORY_STYLES.Productivity;

  const targetHref = isInternal ? app.url : app.url;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = isInternal ? `${window.location.origin}${app.url}` : app.url;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked any interactive element (buttons, tags, copy, edit, delete), let it handle its own event
    if ((e.target as HTMLElement).closest("button, a")) {
      return;
    }
    if (isInternal) {
      window.location.href = targetHref;
    } else {
      window.open(targetHref, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/90 hover:shadow-xl hover:border-indigo-500/40 hover:shadow-indigo-500/10 cursor-pointer",
        catStyle.glow
      )}
    >
      <div>
        {/* Top bar: Icon & Category & Pin & Quick Actions */}
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-110 shadow-sm shrink-0",
              catStyle.bg,
              catStyle.text,
              catStyle.border
            )}
          >
            <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {app.isPinned && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-amber-400 border border-amber-500/30">
                <Pin className="h-3 w-3 fill-amber-400/20" />
                Utama
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-medium border",
                catStyle.bg,
                catStyle.text,
                catStyle.border
              )}
            >
              {app.category}
            </span>
          </div>
        </div>

        {/* Content: Title & Description */}
        <div className="mt-3.5 sm:mt-4">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors break-words">
            <HighlightText text={app.name} query={highlightQuery} />
          </h3>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed break-words">
            <HighlightText text={app.description} query={highlightQuery} />
          </p>
        </div>

        {/* Tech Stack Tags */}
        {app.tags && app.tags.length > 0 && (
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5">
            {app.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="hover:scale-105 transition-transform"
                title={`Filter berdasarkan ${tag}`}
              >
                <TechBadge name={tag} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Status & Open in New Tab Action */}
      <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] sm:text-xs text-slate-400 font-mono flex items-center gap-1.5">
            <span
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                app.status === "active"
                  ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                  : app.status === "beta"
                  ? "bg-amber-400 shadow-sm shadow-amber-400/50"
                  : "bg-rose-400"
              )}
            />
            {app.status === "active" ? "Aktif" : app.status === "beta" ? "Beta" : "Maintenance"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit?.(app);
                }}
                title="Sunting aplikasi"
                aria-label={`Sunting ${app.name}`}
                className="rounded-lg p-1.5 sm:p-2 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors border border-transparent hover:border-indigo-500/30"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete?.(app);
                }}
                title="Hapus aplikasi"
                aria-label={`Hapus ${app.name}`}
                className="rounded-lg p-1.5 sm:p-2 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            title="Salin tautan aplikasi"
            aria-label={`Salin tautan ${app.name}`}
            className="rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors border border-transparent hover:border-slate-700"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>

          <a
            href={targetHref}
            target="_blank"
            rel="noopener noreferrer"
            title={`Buka ${app.name} di tab baru`}
            aria-label={`Buka ${app.name} di tab baru`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold shadow-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
              catStyle.btn
            )}
          >
            <span>Buka</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}