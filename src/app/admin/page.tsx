"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  LayoutGrid,
  FolderKanban,
  BookOpen,
  Rocket,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Sliders,
  Database,
  Globe,
  Sparkles,
  ArrowRight,
  LogOut,
  Tag,
  Star,
  Layers,
  Save,
  X
} from "lucide-react";
import { AppItem } from "@/data/mock-apps";
import { ProjectItem, TaskItem } from "@/data/mock-projects";
import { WikiCategory, WikiPageItem } from "@/data/mock-wiki";

type AdminTab = "dashboard" | "apps" | "projects" | "wiki";

export default function AdminBackofficePage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");

  // System Stats & Deploy State
  const [stats, setStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);
  const [deployHookUrl, setDeployHookUrl] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployMessage, setDeployMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // App Portal Management State
  const [apps, setApps] = useState<AppItem[]>([]);
  const [isAppsLoading, setIsAppsLoading] = useState<boolean>(false);
  const [appSearch, setAppSearch] = useState<string>("");
  const [editingApp, setEditingApp] = useState<Partial<AppItem> | null>(null);
  const [isAppModalOpen, setIsAppModalOpen] = useState<boolean>(false);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);

  // Projects Management State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");

  // Wiki Management State
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [articles, setArticles] = useState<WikiPageItem[]>([]);
  const [isWikiLoading, setIsWikiLoading] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<Partial<WikiPageItem> | null>(null);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>("");
  const [newCatDesc, setNewCatDesc] = useState<string>("");
  const [newCatColor, setNewCatColor] = useState<string>("#6366f1");

  // Check saved session on mount
  useEffect(() => {
    const savedAuth = sessionStorage.getItem("leonore_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    const savedHook = localStorage.getItem("leonore_deploy_hook");
    if (savedHook) setDeployHookUrl(savedHook);
  }, []);

  // Fetch data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
      loadApps();
      loadProjects();
      loadWiki();
    }
  }, [isAuthenticated]);

  // Auth Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === "leonore2026" || pinInput === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("leonore_admin_auth", "true");
      setPinError("");
    } else {
      setPinError("PIN / Sandi salah. Gunakan default: leonore2026");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("leonore_admin_auth");
  };

  // Data Fetchers
  const loadStats = async () => {
    try {
      setIsStatsLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setStats(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const loadApps = async () => {
    try {
      setIsAppsLoading(true);
      const res = await fetch("/api/apps");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setApps(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAppsLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      setIsProjectsLoading(true);
      const res = await fetch("/api/projects");
      if (res.ok) {
        const json = await res.json();
        if (json.success) setProjects(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const loadWiki = async () => {
    try {
      setIsWikiLoading(true);
      const [catRes, artRes] = await Promise.all([
        fetch("/api/wiki/categories"),
        fetch("/api/wiki"),
      ]);
      if (catRes.ok) {
        const catJson = await catRes.json();
        if (catJson.success) setCategories(catJson.data);
      }
      if (artRes.ok) {
        const artJson = await artRes.json();
        if (artJson.success) setArticles(artJson.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWikiLoading(false);
    }
  };

  // Deploy Trigger
  const triggerDeploy = async () => {
    setIsDeploying(true);
    setDeployMessage(null);

    try {
      if (deployHookUrl) {
        localStorage.setItem("leonore_deploy_hook", deployHookUrl);
      }

      const res = await fetch("/api/admin/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hookUrl: deployHookUrl || undefined }),
      });

      const json = await res.json();
      if (json.success) {
        setDeployMessage({
          type: "success",
          text: "Build Vercel berhasil dipicu! Serverless deployment sedang berlangsung (~20-40 detik).",
        });
      } else {
        setDeployMessage({
          type: "error",
          text: json.error || "Gagal memicu deployment.",
        });
      }
    } catch (err: any) {
      setDeployMessage({
        type: "error",
        text: err.message || "Terjadi kesalahan jaringan.",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // App Actions
  const saveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      const isNew = !editingApp.id;
      const url = isNew ? "/api/apps" : `/api/apps/${editingApp.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingApp),
      });

      if (res.ok) {
        setIsAppModalOpen(false);
        setEditingApp(null);
        await loadApps();
        await loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteApp = async (id: string) => {
    try {
      const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteAppId(null);
        await loadApps();
        await loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Project Actions
  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    try {
      const isNew = !editingProject.id;
      const url = isNew ? "/api/projects" : `/api/projects/${editingProject.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingProject),
      });

      if (res.ok) {
        setIsProjectModalOpen(false);
        setEditingProject(null);
        await loadProjects();
        await loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async (projectId: string) => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: newTaskTitle.trim(),
          status: "todo",
        }),
      });
      if (res.ok) {
        setNewTaskTitle("");
        await loadProjects();
        await loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId: string, status: "todo" | "doing" | "done") => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await loadProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Wiki Actions
  const saveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;

    try {
      const isNew = !editingArticle.id;
      const url = isNew ? "/api/wiki" : `/api/wiki/${editingArticle.slug}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingArticle),
      });

      if (res.ok) {
        setIsArticleModalOpen(false);
        setEditingArticle(null);
        await loadWiki();
        await loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch("/api/wiki/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          color: newCatColor,
        }),
      });

      if (res.ok) {
        setNewCatName("");
        setNewCatDesc("");
        await loadWiki();
        await loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered Apps
  const filteredApps = useMemo(() => {
    if (!appSearch.trim()) return apps;
    const q = appSearch.toLowerCase();
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }, [apps, appSearch]);

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative isolate">
        <div className="absolute inset-0 -z-10 bg-slate-950">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-pink-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex justify-center mb-5">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
          </div>

          <h2 className="text-center text-xl font-extrabold text-white">
            LeonorePortal Backoffice
          </h2>
          <p className="text-center text-xs text-slate-400 mt-1 mb-6">
            Masukkan PIN Keamanan untuk mengelola konten dan deployment
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN Admin..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-center text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {pinError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-xs font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="h-4 w-4" />
              <span>Buka Backoffice</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            Default PIN: <code className="text-indigo-400 font-mono">leonore2026</code>
          </div>
        </div>
      </div>
    );
  }

  // MAIN ADMIN BACKOFFICE
  return (
    <div className="min-h-screen pb-20 bg-slate-950">
      {/* Top Admin Navigation Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-lg sticky top-14 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white flex items-center gap-2">
                <span>LeonorePortal CMS Backoffice</span>
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] text-indigo-300 font-mono">
                  Admin
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Turso LibSQL Cloud • Vercel Production
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            {[
              { id: "dashboard", label: "Dashboard & Deploy", icon: Rocket },
              { id: "apps", label: `App Portal (${apps.length})`, icon: LayoutGrid },
              { id: "projects", label: `Proyek & Tugas (${projects.length})`, icon: FolderKanban },
              { id: "wiki", label: `Knowledge Base (${articles.length})`, icon: BookOpen },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as AdminTab)}
                  className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                    activeTab === t.id
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Exit */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <span>Lihat Web Live</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: DASHBOARD & DEPLOY */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in">
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-1">
                <div className="text-xs text-slate-400">Total Aplikasi Portal</div>
                <div className="text-2xl font-extrabold text-white">
                  {stats?.counts?.apps ?? apps.length}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">Tabel portal_apps</div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-1">
                <div className="text-xs text-slate-400">Proyek Aktif</div>
                <div className="text-2xl font-extrabold text-indigo-400">
                  {stats?.counts?.projects ?? projects.length}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {stats?.counts?.tasks ?? 0} total tugas
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-1">
                <div className="text-xs text-slate-400">Artikel Knowledge Base</div>
                <div className="text-2xl font-extrabold text-sky-400">
                  {stats?.counts?.wikiArticles ?? articles.length}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {stats?.counts?.wikiCategories ?? categories.length} kategori
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 space-y-1">
                <div className="text-xs text-slate-400">Status Database</div>
                <div className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Terhubung</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate">
                  Latency: {stats?.database?.latencyMs ?? 25}ms
                </div>
              </div>
            </div>

            {/* Deploy Hub Panel */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-pink-600/20">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Vercel Deployment Hub</h3>
                    <p className="text-xs text-slate-400">
                      Picu proses build & deployment produksi Vercel langsung dari panel admin
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://vercel.com/leonorekingdom/leonoreportal"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-bold text-slate-200 transition-colors"
                  >
                    <span>Vercel Dashboard</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Deploy Trigger Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Vercel Deploy Hook URL (Opsional / Custom):
                  </label>
                  <input
                    type="url"
                    placeholder="https://api.vercel.com/v1/integrations/deploy/prj_.../..."
                    value={deployHookUrl}
                    onChange={(e) => setDeployHookUrl(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Deploy Hook dapat dibuat di Vercel: <i>Project Settings &gt; Git &gt; Deploy Hooks</i>. URL akan tersimpan otomatis di browser ini.
                  </span>
                </div>

                <button
                  onClick={triggerDeploy}
                  disabled={isDeploying}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 px-6 py-3 text-xs font-extrabold text-white shadow-xl shadow-pink-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isDeploying ? "animate-spin" : ""}`} />
                  <span>{isDeploying ? "Memproses Deployment ke Vercel..." : "Picu Build & Deploy Produksi"}</span>
                </button>

                {deployMessage && (
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 text-xs animate-in fade-in ${
                      deployMessage.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {deployMessage.type === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold">{deployMessage.text}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Domain Status */}
              <div className="rounded-2xl bg-slate-950 border border-slate-800/80 p-4 space-y-2">
                <div className="text-xs font-bold text-slate-400">Domain Produksi Terhubung:</div>
                <div className="flex flex-wrap gap-3 text-xs">
                  <a
                    href="https://portal.leonorekingdom.xyz"
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-300 hover:text-white"
                  >
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                    <span>portal.leonorekingdom.xyz</span>
                  </a>
                  <a
                    href="https://leonoreportal.vercel.app"
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                  >
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span>leonoreportal.vercel.app</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APP PORTAL MANAGER */}
        {activeTab === "apps" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Kelola Aplikasi Portal</h3>
                <p className="text-xs text-slate-400">
                  Tambah, sunting, ubah urutan, atau tandai favorit aplikasi di halaman beranda
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari aplikasi..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => {
                    setEditingApp({
                      name: "",
                      description: "",
                      url: "/",
                      category: "Utilities",
                      icon: "Globe",
                      status: "active",
                      isPinned: false,
                      sortOrder: apps.length + 1,
                      tags: ["Tool"],
                    });
                    setIsAppModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 whitespace-nowrap transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Tambah Aplikasi</span>
                </button>
              </div>
            </div>

            {/* App Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{app.name}</span>
                        {app.isPinned && (
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                      <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 font-medium">
                        {app.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{app.description}</p>
                    <div className="text-[11px] font-mono text-indigo-400 truncate">{app.url}</div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {app.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-slate-950 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Urutan: #{app.sortOrder}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingApp(app);
                          setIsAppModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 transition-colors"
                        title="Sunting"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteAppId(app.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/30 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROJECTS & TASKS MANAGER */}
        {activeTab === "projects" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Kelola Proyek & Kanban</h3>
                <p className="text-xs text-slate-400">
                  Tambah proyek baru, kelola kartu tugas, dan catatan roadmap Markdown
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingProject({
                    title: "",
                    description: "",
                    category: "Development",
                    status: "active",
                    notesMarkdown: "# Roadmap Proyek\n\nTulis rencana detail di sini...",
                  });
                  setIsProjectModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Buat Proyek Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Projects List (5 Cols) */}
              <div className="lg:col-span-5 space-y-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`rounded-2xl border p-4 cursor-pointer transition-all ${
                      selectedProjectId === p.id
                        ? "border-indigo-500 bg-slate-900/90 shadow-lg"
                        : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-white">{p.title}</div>
                      <span className="rounded px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-300">
                        {p.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{p.tasks?.length || 0} Tugas terdaftar</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(p);
                          setIsProjectModalOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Edit Proyek
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tasks within Selected Project (7 Cols) */}
              <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
                {selectedProjectId ? (
                  (() => {
                    const currentProj = projects.find((p) => p.id === selectedProjectId);
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <h4 className="text-sm font-bold text-white">{currentProj?.title}</h4>
                            <p className="text-xs text-slate-400">Kelola daftar tugas Kanban</p>
                          </div>
                          <Link
                            href={`/projects/${currentProj?.id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            <span>Buka di Kanban</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>

                        {/* Add Task Input */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Tulis judul tugas baru..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => addTask(selectedProjectId)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white"
                          >
                            Tambah Tugas
                          </button>
                        </div>

                        {/* Task List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {currentProj?.tasks?.map((t) => (
                            <div
                              key={t.id}
                              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex items-center justify-between text-xs"
                            >
                              <span className="text-slate-200 font-medium">{t.title}</span>
                              <div className="flex items-center gap-1.5">
                                {(["todo", "doing", "done"] as const).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => updateTaskStatus(t.id, st)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                                      t.status === st
                                        ? st === "done"
                                          ? "bg-emerald-500 text-white"
                                          : st === "doing"
                                          ? "bg-amber-500 text-white"
                                          : "bg-indigo-600 text-white"
                                        : "text-slate-500 hover:text-white"
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Pilih salah satu proyek di sebelah kiri untuk melihat dan mengelola tugas
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KNOWLEDGE BASE WIKI MANAGER */}
        {activeTab === "wiki" && (
          <div className="space-y-8 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Kelola Knowledge Base Wiki</h3>
                <p className="text-xs text-slate-400">
                  Tulis artikel dokumentasi, kelola kategori pengetahuan, dan perbarui Markdown
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingArticle({
                    title: "",
                    slug: "",
                    contentMarkdown: "# Judul Artikel\n\nTulis isi konten dokumentasi di sini...",
                    categoryId: categories[0]?.id || "cat-1",
                    tags: ["Wiki"],
                  });
                  setIsArticleModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Tulis Artikel Baru</span>
              </button>
            </div>

            {/* Articles List */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 font-bold text-xs text-white">
                Daftar Seluruh Artikel Wiki ({articles.length})
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {articles.map((art) => {
                  const cat = categories.find((c) => c.id === art.categoryId);
                  return (
                    <div key={art.id} className="p-4 flex items-center justify-between hover:bg-slate-850 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{art.title}</span>
                          <span
                            className="rounded px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: `${cat?.color || "#6366f1"}15`,
                              color: cat?.color || "#6366f1",
                            }}
                          >
                            {cat?.name || "Kategori"}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          /knowledge-base/{art.slug}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/knowledge-base/${art.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Lihat"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setEditingArticle(art);
                            setIsArticleModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300"
                          title="Sunting"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create Category Section */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 max-w-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="h-4 w-4 text-indigo-400" />
                <span>Tambah Kategori Wiki Baru</span>
              </h4>

              <form onSubmit={createCategory} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Nama Kategori:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Arsitektur Cloud"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Deskripsi Singkat:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Panduan infrastruktur dan deployment server"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Aksen Warna HEX:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="h-8 w-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-slate-300">{newCatColor}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all shadow-md shadow-indigo-600/30"
                >
                  Simpan Kategori Baru
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: APP CREATE / EDIT */}
      {isAppModalOpen && editingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingApp.id ? "Sunting Aplikasi Portal" : "Tambah Aplikasi Portal Baru"}
              </h3>
              <button onClick={() => setIsAppModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveApp} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nama Aplikasi:</label>
                <input
                  type="text"
                  required
                  value={editingApp.name || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  value={editingApp.description || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tautan / URL:</label>
                  <input
                    type="text"
                    required
                    value={editingApp.url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, url: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Kategori:</label>
                  <select
                    value={editingApp.category || "Utilities"}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Media">Media</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Urutan (Sort Order):</label>
                  <input
                    type="number"
                    value={editingApp.sortOrder || 1}
                    onChange={(e) => setEditingApp({ ...editingApp, sortOrder: parseInt(e.target.value) })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status:</label>
                  <select
                    value={editingApp.status || "active"}
                    onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="beta">Beta</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={editingApp.isPinned || false}
                  onChange={(e) => setEditingApp({ ...editingApp, isPinned: e.target.checked })}
                  className="rounded accent-indigo-600"
                />
                <label htmlFor="isPinned" className="text-slate-300 font-medium">
                  Tandai sebagai Aplikasi Utama / Favorit (Pinned)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  Simpan Aplikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PROJECT CREATE / EDIT */}
      {isProjectModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingProject.id ? "Sunting Proyek" : "Buat Proyek Baru"}
              </h3>
              <button onClick={() => setIsProjectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Judul Proyek:</label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deskripsi Ringkas:</label>
                <textarea
                  rows={2}
                  value={editingProject.description || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Kategori:</label>
                  <input
                    type="text"
                    value={editingProject.category || "Development"}
                    onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Status Proyek:</label>
                  <select
                    value={editingProject.status || "active"}
                    onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value as any })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Catatan Markdown Roadmap:</label>
                <textarea
                  rows={6}
                  value={editingProject.notesMarkdown || ""}
                  onChange={(e) => setEditingProject({ ...editingProject, notesMarkdown: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-xs text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WIKI ARTICLE CREATE / EDIT */}
      {isArticleModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingArticle.id ? "Sunting Artikel Wiki" : "Tulis Artikel Wiki Baru"}
              </h3>
              <button onClick={() => setIsArticleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveArticle} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Judul Artikel:</label>
                  <input
                    type="text"
                    required
                    value={editingArticle.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                      setEditingArticle({ ...editingArticle, title, slug: editingArticle.slug || slug });
                    }}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Kategori:</label>
                  <select
                    value={editingArticle.categoryId || categories[0]?.id}
                    onChange={(e) => setEditingArticle({ ...editingArticle, categoryId: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Slug URL:</label>
                <input
                  type="text"
                  required
                  value={editingArticle.slug || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Konten Markdown Artikel:</label>
                <textarea
                  rows={12}
                  value={editingArticle.contentMarkdown || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, contentMarkdown: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white shadow-lg shadow-indigo-600/30"
                >
                  Simpan Artikel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Konfirmasi Hapus Aplikasi</h3>
            <p className="text-xs text-slate-400">
              Apakah Anda yakin ingin menghapus aplikasi ini dari portal? Tindakan ini permanen di database Turso.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteAppId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-750"
              >
                Batal
              </button>
              <button
                onClick={() => deleteApp(deleteAppId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
