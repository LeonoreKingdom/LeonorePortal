"use client";

import { useMemo, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Wrench, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { TOOLBOX_ITEMS, TOOLBOX_CATEGORIES, ToolItem } from "@/data/mock-toolbox";
import { CalculatorTool } from "@/components/toolbox/calculator-tool";
import { UnitConverterTool } from "@/components/toolbox/unit-converter-tool";
import { TimerStopwatchTool } from "@/components/toolbox/timer-stopwatch-tool";
import { ImageTools } from "@/components/toolbox/image-tools";
import { ColorPickerTool } from "@/components/toolbox/color-picker-tool";
import { VideoAudioTool } from "@/components/toolbox/video-audio-tool";
import { ImageToPdfTool } from "@/components/toolbox/image-to-pdf-tool";
import { TextJsonTool } from "@/components/toolbox/text-json-tool";
import { HtmlEditorTool } from "@/components/toolbox/html-editor-tool";
import { DiffCheckerTool } from "@/components/toolbox/diff-checker-tool";
import { QrGeneratorTool } from "@/components/toolbox/qr-generator-tool";
import { PasswordGeneratorTool } from "@/components/toolbox/password-generator-tool";
import { ToolCard } from "@/components/tool-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ToolboxDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const tool = useMemo(() => {
    return (
      TOOLBOX_ITEMS.find((t) => t.slug === slug) || {
        id: slug,
        slug,
        name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        description: "Alat utilitas client-side privat.",
        category: "essential" as const,
        icon: "Wrench",
        tags: ["Toolbox", "Client-Side"],
      }
    );
  }, [slug]);

  const category = useMemo(() => {
    return TOOLBOX_CATEGORIES.find((c) => c.id === tool.category) || TOOLBOX_CATEGORIES[0];
  }, [tool.category]);

  const relatedTools = useMemo(() => {
    return TOOLBOX_ITEMS.filter((t) => t.slug !== slug && t.category === tool.category).slice(0, 3);
  }, [slug, tool.category]);

  const renderToolComponent = () => {
    switch (slug) {
      case "calculator":
        return <CalculatorTool />;
      case "unit-converter":
        return <UnitConverterTool />;
      case "timer-stopwatch":
        return <TimerStopwatchTool />;
      case "image-converter":
        return <ImageTools mode="convert" />;
      case "image-resizer":
        return <ImageTools mode="resize" />;
      case "color-picker":
        return <ColorPickerTool />;
      case "video-to-audio":
        return <VideoAudioTool />;
      case "image-to-pdf":
        return <ImageToPdfTool />;
      case "text-json-formatter":
        return <TextJsonTool />;
      case "html-live-editor":
        return <HtmlEditorTool />;
      case "diff-checker":
        return <DiffCheckerTool />;
      case "qr-generator":
        return <QrGeneratorTool />;
      case "password-generator":
        return <PasswordGeneratorTool />;
      default:
        return (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center max-w-xl mx-auto">
            <Wrench className="h-12 w-12 text-indigo-400 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
            <p className="text-sm text-slate-400 mb-6">{tool.description}</p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Siap diimplementasikan di client browser
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative isolate min-h-screen pb-20">
      {/* Background Glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-pink-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link
            href="/toolbox"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Toolbox
          </Link>
          <span>/</span>
          <span className="text-slate-500">{category.name}</span>
          <span>/</span>
          <span className="text-slate-200 font-medium truncate max-w-xs">{tool.name}</span>
        </div>

        {/* Tool Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="rounded-md px-2.5 py-0.5 text-xs font-semibold border"
                style={{
                  backgroundColor: `${category.color}15`,
                  borderColor: `${category.color}40`,
                  color: category.color,
                }}
              >
                {category.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-3 w-3" />
                100% Client-Side
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {tool.name}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Rendered Tool Component */}
        <div>{renderToolComponent()}</div>

        {/* Related Tools Footer Section */}
        {relatedTools.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Alat Lainnya dalam Kategori {category.name}
              </h3>
              <Link
                href="/toolbox"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedTools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}