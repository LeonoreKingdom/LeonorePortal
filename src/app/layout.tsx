import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "LeonorePortal — Pusat Kendali Aplikasi & Proyek",
  description: "User portal untuk App Portal, Toolbox, Proyek Kanban, dan Knowledge Base terintegrasi Obsidian.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950/50 py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 LeonorePortal. Dikelola untuk produktivitas mandiri.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-indigo-500"></span>
              Sistem Terhubung Lokal
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}