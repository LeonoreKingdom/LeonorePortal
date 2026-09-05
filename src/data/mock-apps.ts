export interface AppItem {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  category: string;
  status: "active" | "beta" | "maintenance";
  sortOrder: number;
  tags: string[];
  isPinned?: boolean;
}

export const MOCK_APPS: AppItem[] = [
  {
    id: "app-1",
    name: "Toolbox Client-Side",
    description: "Kumpulan alat utilitas browser: kalkulator, konversi unit, timer, color picker, text diff, dan generator.",
    url: "/toolbox",
    icon: "Wrench",
    category: "Utilities",
    status: "active",
    sortOrder: 1,
    tags: ["Tools", "Offline", "Converter"],
    isPinned: true,
  },
  {
    id: "app-2",
    name: "Papan Proyek Kanban",
    description: "Manajemen tugas berbasis Kanban dengan catatan Markdown interaktif untuk melacak progres proyek pribadi.",
    url: "/projects",
    icon: "KanbanSquare",
    category: "Productivity",
    status: "active",
    sortOrder: 2,
    tags: ["Kanban", "Markdown", "Tasks"],
    isPinned: true,
  },
  {
    id: "app-3",
    name: "Knowledge Base Wiki",
    description: "Pusat dokumentasi dan catatan pengetahuan berstruktur kategori dengan tautan internal serta dukungan Markdown.",
    url: "/knowledge-base",
    icon: "BookOpen",
    category: "Productivity",
    status: "active",
    sortOrder: 3,
    tags: ["Wiki", "Docs", "Notes"],
    isPinned: true,
  },
  {
    id: "app-4",
    name: "Media & Image Studio",
    description: "Alat pengolah gambar di browser: Image Converter, Resizer, Image to PDF, dan Video to Audio tanpa upload server.",
    url: "/toolbox/media",
    icon: "Image",
    category: "Media",
    status: "active",
    sortOrder: 4,
    tags: ["Media", "PDF", "Converter"],
    isPinned: false,
  },
  {
    id: "app-5",
    name: "Code & Text Diff Studio",
    description: "Editor teks, validator JSON, Live HTML Preview, dan pembanding file teks instan.",
    url: "/toolbox/code",
    icon: "FileCode2",
    category: "Development",
    status: "active",
    sortOrder: 5,
    tags: ["JSON", "Diff", "HTML"],
    isPinned: false,
  },
  {
    id: "app-6",
    name: "Obsidian Sync Hub",
    description: "Jembatan sinkronisasi otomatis dua arah antara LeonorePortal dan Vault Obsidian lokal.",
    url: "/obsidian-sync",
    icon: "RefreshCw",
    category: "Productivity",
    status: "beta",
    sortOrder: 6,
    tags: ["Obsidian", "Sync", "Local Vault"],
    isPinned: true,
  },
  {
    id: "app-7",
    name: "Security & QR Generator",
    description: "Pembuat kata sandi acak dengan tingkat keamanan tinggi dan pembuat barcode / QR Code kustom.",
    url: "/toolbox/security",
    icon: "QrCode",
    category: "Utilities",
    status: "active",
    sortOrder: 7,
    tags: ["QR", "Password", "Security"],
    isPinned: false,
  },
  {
    id: "app-8",
    name: "Quick Color Picker & Palette",
    description: "Ekstraktor warna dari gambar, generator palet warna CSS/HEX, dan pemeriksa kontras warna UI.",
    url: "/toolbox/colors",
    icon: "Palette",
    category: "Design",
    status: "active",
    sortOrder: 8,
    tags: ["Palette", "CSS", "UI"],
    isPinned: false,
  },
];