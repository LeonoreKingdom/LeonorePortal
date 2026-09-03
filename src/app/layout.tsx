import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/components/auth-provider";

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
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/50 py-8 text-xs text-slate-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© 2026 LeonoreKingdom. All Rights Reserved</p>
              <div className="flex items-center gap-2 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-semibold tracking-wide">Online</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}