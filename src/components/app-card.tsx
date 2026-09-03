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
  Trash2,
  User,
  Users,
  Sparkles,
  ShoppingBag,
  Coffee,
  Cpu,
  CheckCircle2,
  KeyRound,
  Compass,
  Star,
  GripVertical,
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
  Globe,
  User,
  Users,
  Sparkles,
  ShoppingBag,
  Coffee,
  Cpu,
  CheckCircle2,
  KeyRound,
  Compass,
};

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; glow: string; btn: string }> = {
  Portfolio: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/30",
    glow: "group-hover:border-pink-500/50 group-hover:shadow-pink-500/10",
    btn: "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/20",
  },
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
  onToggleFavorite?: (app: AppItem) => void;
  isDraggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
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

export function AppCard({
  app,
  highlightQuery,
  onSelectTag,
  isAdmin,
  onEdit,
  onDelete,
  onToggleFavorite,
  isDraggable,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
}: AppCardProps) {
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
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/90 hover:shadow-xl hover:border-indigo-500/40 hover:shadow-indigo-500/10 cursor-pointer select-none",
        catStyle.glow,
        isDragging && "opacity-40 scale-95 border-dashed border-indigo-400 bg-indigo-950/30 shadow-2xl",
        isDragOver && "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 border-indigo-400 scale-[1.02] bg-slate-850"
      )}
    >
      <div>
        {/* Top bar: Icon, Drag Handle, Category & Favorite Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isDraggable && (
              <div
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-500 hover:text-indigo-400 opacity-60 hover:opacity-100 transition-all rounded"
                title="Tahan & geser kartu untuk mengubah urutan"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4" />
              </div>
            )}
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
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {/* Interactive Star Favorite Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite?.(app);
              }}
              title={app.isPinned ? "Klik untuk menghapus dari Favorit" : "Klik untuk menandai sebagai Favorit"}
              aria-label={app.isPinned ? "Hapus dari Favorit" : "Tandai sebagai Favorit"}
              className={cn(
                "group/star flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] sm:text-[11px] font-medium transition-all duration-200 border cursor-pointer",
                app.isPinned
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 shadow-sm shadow-amber-500/20"
                  : "bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-amber-300 hover:border-amber-500/40 hover:bg-slate-800"
              )}
            >
              <Star
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200 group-hover/star:scale-125",
                  app.isPinned ? "fill-amber-400 text-amber-400" : "text-slate-400 group-hover/star:text-amber-400"
                )}
              />
              <span className="font-semibold">
                {app.isPinned ? "Favorit" : "Pin"}
              </span>
            </button>

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