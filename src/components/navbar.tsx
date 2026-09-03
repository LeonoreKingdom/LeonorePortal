"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  LayoutGrid, 
  Wrench, 
  KanbanSquare, 
  BookOpen, 
  FolderSync, 
  Menu, 
  X,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "App Portal", href: "/", icon: LayoutGrid },
  { label: "Papan Proyek", href: "/projects", icon: KanbanSquare },
  { label: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { label: "Toolbox", href: "/toolbox", icon: Wrench },
  { label: "Obsidian Sync", href: "/obsidian-sync", icon: FolderSync },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              LeonorePortal
            </span>
            <span className="hidden sm:block text-[10px] font-mono text-indigo-400">
              Workspace Hub v1.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Status Indicator & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            title="Portal Admin & Backoffice"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Admin</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sistem Aktif</span>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-xl bg-slate-900 p-2 text-slate-400 hover:text-white border border-slate-800"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur-xl">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-800/80 mt-1">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-indigo-300 hover:bg-indigo-950/40 border border-indigo-500/20 transition-all"
              >
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span>Portal Admin (CMS)</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}