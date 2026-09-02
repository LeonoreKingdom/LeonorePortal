"use client";

import Link from "next/link";
import { 
  Calculator, 
  Scale, 
  Clock, 
  Image as ImageIcon, 
  Maximize2, 
  Palette, 
  Music, 
  FileText, 
  Braces, 
  Code2, 
  GitCompare, 
  QrCode, 
  KeyRound, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CalendarClock,
  FileDown,
  Film,
  Video,
  Headphones,
  FileStack,
  FileSpreadsheet,
  TableProperties,
  Regex as RegexIcon,
  ShieldAlert
} from "lucide-react";
import { ToolItem, ToolboxCategory } from "@/data/mock-toolbox";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Calculator,
  Scale,
  Clock,
  Image: ImageIcon,
  Maximize2,
  Palette,
  Music,
  FileText,
  Braces,
  Code2,
  GitCompare,
  QrCode,
  KeyRound,
  CalendarClock,
  FileDown,
  Film,
  Video,
  Headphones,
  FileStack,
  FileSpreadsheet,
  TableProperties,
  Regex: RegexIcon,
  ShieldAlert,
};

interface ToolCardProps {
  tool: ToolItem;
  category?: ToolboxCategory;
  searchQuery?: string;
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
          <mark key={i} className="rounded bg-indigo-500/25 px-0.5 text-indigo-200 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export function ToolCard({ tool, category, searchQuery }: ToolCardProps) {
  const IconComponent = ICON_MAP[tool.icon] || Sparkles;

  const categoryColor = category?.color || "#6366f1";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10">
      <div>
        {/* Top bar: Icon, Client badge & Popular */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm group-hover:scale-105 transition-transform"
            style={{
              backgroundColor: `${categoryColor}15`,
              borderColor: `${categoryColor}30`,
              color: categoryColor,
            }}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.isPopular && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                <Sparkles className="h-2.5 w-2.5" />
                Populer
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-2.5 w-2.5" />
              Client-Side
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="mt-4">
          <Link href={`/toolbox/${tool.slug}`}>
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              <HighlightText text={tool.name} query={searchQuery} />
            </h3>
          </Link>
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            <HighlightText text={tool.description} query={searchQuery} />
          </p>
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-500">
          /{tool.slug}
        </span>

        <Link
          href={`/toolbox/${tool.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"
        >
          <span>Buka Alat</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}