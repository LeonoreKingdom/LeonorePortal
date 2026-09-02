"use client";

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content || !content.trim()) {
    return <div className="text-slate-500 italic text-xs">Tidak ada konten Markdown.</div>;
  }

  // Parse markdown lines into structured elements
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = "";

  const renderInline = (text: string): React.ReactNode => {
    // 1. Parse Wiki Links [[Target]] or [[Target|Label]]
    const wikiRegex = /\[\[([^\]]+)\]\]/g;
    const splitByWiki: React.ReactNode[] = [];
    let wLast = 0;
    let wMatch;

    while ((wMatch = wikiRegex.exec(text)) !== null) {
      if (wMatch.index > wLast) {
        splitByWiki.push(text.substring(wLast, wMatch.index));
      }
      const rawTarget = wMatch[1];
      let targetSlug = rawTarget;
      let label = rawTarget;

      if (rawTarget.includes("|")) {
        const parts = rawTarget.split("|");
        targetSlug = parts[0].trim();
        label = parts[1].trim();
      }

      const slug = slugify(targetSlug);

      splitByWiki.push(
        <Link
          key={`wiki-${wMatch.index}`}
          href={`/knowledge-base/${slug}`}
          className="inline-flex items-center gap-1 rounded bg-sky-500/10 px-1.5 py-0.5 font-semibold text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          <span>{label}</span>
        </Link>
      );
      wLast = wMatch.index + wMatch[0].length;
    }

    if (wLast < text.length) {
      splitByWiki.push(text.substring(wLast));
    }

    return splitByWiki.map((chunk, cIdx) => {
      if (typeof chunk !== "string") return chunk;

      // 2. Inline code `code`
      const codeRegex = /`([^`]+)`/g;
      const splitByCode: React.ReactNode[] = [];
      let lastIdx = 0;
      let match;

      while ((match = codeRegex.exec(chunk)) !== null) {
        if (match.index > lastIdx) {
          splitByCode.push(chunk.substring(lastIdx, match.index));
        }
        splitByCode.push(
          <code key={`c-${cIdx}-${match.index}`} className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-indigo-300 border border-slate-700">
            {match[1]}
          </code>
        );
        lastIdx = match.index + match[0].length;
      }
      if (lastIdx < chunk.length) {
        splitByCode.push(chunk.substring(lastIdx));
      }

      return splitByCode.map((segment, idx) => {
        if (typeof segment !== "string") return segment;

        // 3. Handle Bold **text**
        const boldParts = segment.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith("**") && bPart.endsWith("**")) {
            return <strong key={`b-${cIdx}-${idx}-${bIdx}`} className="font-bold text-white">{bPart.slice(2, -2)}</strong>;
          }
          // 4. Handle Italic *text*
          const italicParts = bPart.split(/(\*[^*]+\*)/g);
          return italicParts.map((iPart, iIdx) => {
            if (iPart.startsWith("*") && iPart.endsWith("*") && iPart.length > 2) {
              return <em key={`i-${cIdx}-${idx}-${bIdx}-${iIdx}`} className="italic text-slate-300">{iPart.slice(1, -1)}</em>;
            }
            // 5. Links [text](url)
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const linkParts: React.ReactNode[] = [];
            let lLast = 0;
            let lMatch;
            while ((lMatch = linkRegex.exec(iPart)) !== null) {
              if (lMatch.index > lLast) linkParts.push(iPart.substring(lLast, lMatch.index));
              linkParts.push(
                <a
                  key={`a-${cIdx}-${lMatch.index}`}
                  href={lMatch[2]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  {lMatch[1]}
                </a>
              );
              lLast = lMatch.index + lMatch[0].length;
            }
            if (lLast < iPart.length) linkParts.push(iPart.substring(lLast));
            return linkParts.length > 0 ? linkParts : iPart;
          });
        });
      });
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks ```
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        renderedElements.push(
          <div key={`cb-${i}`} className="my-3 overflow-x-auto rounded-xl bg-slate-950 p-3.5 border border-slate-800 font-mono text-xs text-slate-200">
            {codeLanguage && <div className="text-[10px] text-slate-500 uppercase tracking-widest pb-1 mb-2 border-b border-slate-800/80">{codeLanguage}</div>}
            <pre className="m-0 leading-relaxed">{codeBlockContent.join("\n")}</pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeLanguage = "";
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h1 key={i} className="mt-4 mb-2 text-lg sm:text-xl font-bold text-white border-b border-slate-800 pb-1">
          {renderInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      renderedElements.push(
        <h2 key={i} className="mt-3.5 mb-1.5 text-base font-bold text-slate-100">
          {renderInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      renderedElements.push(
        <h3 key={i} className="mt-3 mb-1 text-sm font-semibold text-indigo-300">
          {renderInline(line.slice(4))}
        </h3>
      );
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      renderedElements.push(
        <blockquote key={i} className="my-2 border-l-2 border-indigo-500 pl-3 italic text-slate-400 text-xs sm:text-sm">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    }
    // Checklist: - [ ] or - [x]
    else if (/^-\s*\[([ xX])\]\s+(.*)/.test(line)) {
      const match = line.match(/^-\s*\[([ xX])\]\s+(.*)/);
      const isChecked = match ? match[1].toLowerCase() === "x" : false;
      const taskText = match ? match[2] : "";
      renderedElements.push(
        <div key={i} className="flex items-center gap-2 my-1 text-xs sm:text-sm text-slate-300">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 cursor-default"
          />
          <span className={isChecked ? "line-through text-slate-500" : ""}>
            {renderInline(taskText)}
          </span>
        </div>
      );
    }
    // Bullet list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      renderedElements.push(
        <li key={i} className="ml-4 list-disc text-xs sm:text-sm text-slate-300 my-0.5">
          {renderInline(line.slice(2))}
        </li>
      );
    }
    // Numbered list
    else if (/^\d+\.\s+(.*)/.test(line)) {
      const match = line.match(/^\d+\.\s+(.*)/);
      renderedElements.push(
        <li key={i} className="ml-4 list-decimal text-xs sm:text-sm text-slate-300 my-0.5">
          {renderInline(match ? match[1] : line)}
        </li>
      );
    }
    // Empty line
    else if (!line.trim()) {
      renderedElements.push(<div key={i} className="h-2" />);
    }
    // Regular paragraph
    else {
      renderedElements.push(
        <p key={i} className="my-1 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  return <div className={cn("prose prose-invert max-w-none", className)}>{renderedElements}</div>;
}