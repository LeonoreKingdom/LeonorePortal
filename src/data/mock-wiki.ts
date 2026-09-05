export interface WikiCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description?: string;
}

export interface WikiPageItem {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  contentMarkdown: string;
  tags: string[];
  readTime?: string;
  lastEditedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_CATEGORIES: WikiCategory[] = [
  {
    "id": "cat-arch",
    "name": "Architecture",
    "color": "#6366f1",
    "icon": "BookOpen",
    "description": "Dokumentasi dan panduan seputar Architecture"
  },
  {
    "id": "cat-dev",
    "name": "Development",
    "color": "#0ea5e9",
    "icon": "BookOpen",
    "description": "Dokumentasi dan panduan seputar Development"
  },
  {
    "id": "cat-db",
    "name": "Databases",
    "color": "#f59e0b",
    "icon": "BookOpen",
    "description": "Dokumentasi dan panduan seputar Databases"
  },
  {
    "id": "cat-design",
    "name": "Design",
    "color": "#a855f7",
    "icon": "BookOpen",
    "description": "Dokumentasi dan panduan seputar Design"
  },
  {
    "id": "cat-guides",
    "name": "Guides",
    "color": "#10b981",
    "icon": "BookOpen",
    "description": "Dokumentasi dan panduan seputar Guides"
  },
  {
    "id": "cat-ideas",
    "name": "Ideas",
    "color": "#ec4899",
    "icon": "BookOpen",
    "description": "Ide kreatif, eksplorasi konsep, dan gagasan masa depan"
  },
  {
    "id": "cat-notes",
    "name": "Notes",
    "color": "#8b5cf6",
    "icon": "BookOpen",
    "description": "Catatan harian, rangkuman referensi, dan memo ringkas"
  },
  {
    "id": "cat-plans",
    "name": "Plans",
    "color": "#14b8a6",
    "icon": "BookOpen",
    "description": "Rencana strategis, roadmap rilis, dan perencanaan proyek"
  }
];

export const MOCK_WIKI_PAGES: WikiPageItem[] = [
  {
    "id": "art-arsitektur-multi-app-dns-ecosystem",
    "title": "Arsitektur Multi-App & DNS Ecosystem leonorekingdom.xyz",
    "slug": "arsitektur-multi-app-dns-ecosystem",
    "categoryId": "cat-arch",
    "contentMarkdown": "# Arsitektur Multi-App & DNS Ecosystem\n\nDokumentasi arsitektur multi-subdomain yang menghubungkan seluruh ekosistem web LeonoreKingdom ke satu domain induk: **leonorekingdom.xyz**.\n\n## 1. Pemetaan Subdomain Live:\n| Subdomain | Aplikasi Web | Portofolio / Fungsi |\n| :--- | :--- | :--- |\n| `leonorekingdom.xyz` | **LeonoreKingdom** | Landing Page & Komunitas Utama |\n| `portal.leonorekingdom.xyz` | **LeonorePortal** | Pusat Kendali Ekosistem & Workspace |\n| `squad.leonorekingdom.xyz` | **Digital Platform Squad** | Showcase Tim & Profil Divisi |\n| `pro.leonorekingdom.xyz` | **Portfolio Profesional** | Rekayasa Software & Studi Kasus |\n| `me.leonorekingdom.xyz` | **Portofolio Pribadi** | Identitas Personal & Esai |\n| `studio.leonorekingdom.xyz` | **LeonoreStudio** | Creative Agency & Web Solutions |\n| `pasarlore.leonorekingdom.xyz` | **PasarLore** | E-Commerce Marketplace Komunitas |\n| `lecafe.leonorekingdom.xyz` | **LeCafe** | Digital Menu & Ordering System |\n| `vault.leonorekingdom.xyz` | **LeonoreVault** | Penyimpanan Terenkripsi Client-Side |\n| `bots.leonorekingdom.xyz` | **Leone Bot Dashboard** | Panel Kontrol Asisten Discord |\n| `todo.leonorekingdom.xyz` | **Simple ToDo List** | Pelacak Tugas Minimalis Cepat |\n| `todogem.leonorekingdom.xyz` | **Simple ToDo List Gemini**| To-Do List Cerdas dengan Gemini AI |\n| `mykisah.leonorekingdom.xyz` | **MyKisah** | Jurnal Romansa & Linimasa Kenangan |\n\n## 2. Infrastruktur & Routing:\n- **DNS Zone Management**: Dikelola melalui Cloudflare DNS dengan keamanan SSL/TLS otomatis.\n- **Hosting Engine**: Vercel Serverless Platform dengan integrasi CI/CD otomatis dari GitHub.\n- **Database Layer**: Turso LibSQL Cloud yang didistribusikan secara global dengan latensi rendah.\n",
    "tags": [
      "Architecture",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-next-js-15-app-router-server-actions",
    "title": "Next.js 15 App Router & Server Actions Standard",
    "slug": "next-js-15-app-router-server-actions",
    "categoryId": "cat-dev",
    "contentMarkdown": "# Next.js 15 App Router & Server Actions Standard\n\nStandar pengembangan frontend dan backend yang diterapkan secara konsisten di seluruh aplikasi ekosistem LeonoreKingdom.\n\n## 1. Prinsip Utama:\n- **App Router (`/src/app`)**: Memanfaatkan Server Components secara default untuk mereduksi ukuran bundle JavaScript client.\n- **Server Actions**: Menggantikan sebagian besar API route tradisional untuk operasi mutasi data (CREATE, UPDATE, DELETE).\n- **Static Generation with Dynamic API**: Halaman statis di-generate secara instan dengan rendering data dinamis saat request tiba.\n\n## 2. Praktik Terbaik TypeScript:\n- Definisi tipe data ketat pada model entitas dan parameter props komponen.\n- Menghindari penggunaan tipe `any` pada data bisnis inti.\n",
    "tags": [
      "Development",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-integrasi-google-gemini-ai-di-web-app",
    "title": "Integrasi Google Gemini AI di Aplikasi Web",
    "slug": "integrasi-google-gemini-ai-di-web-app",
    "categoryId": "cat-dev",
    "contentMarkdown": "# Integrasi Google Gemini AI di Aplikasi Web\n\nPanduan implementasi model kecerdasan buatan Google Gemini di aplikasi produktivitas (seperti **Simple ToDo List Gemini AI**).\n\n## 1. Alur Kerja Fitur AI:\n1. Pengguna memasukkan judul tugas kompleks (misal: \"Luncurkan platform e-commerce\").\n2. Aplikasi mengirimkan prompt terstruktur ke Google Gemini API via Server Actions.\n3. Model memecah tugas tersebut menjadi 3–5 sub-langkah konkret yang actionable.\n4. Aplikasi menyisipkan sub-tugas tersebut secara otomatis ke daftar to-do pengguna.\n\n## 2. Optimasi & Biaya:\n- Menggunakan model `gemini-1.5-flash` untuk latensi ultra-cepat dan biaya efisien.\n- Menjaga instruksi sistem (*system prompt*) tetap ringkas dan berorientasi hasil.\n",
    "tags": [
      "Development",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-turso-libsql-cloud-database-management",
    "title": "Turso LibSQL Cloud & Database Management",
    "slug": "turso-libsql-cloud-database-management",
    "categoryId": "cat-db",
    "contentMarkdown": "# Turso LibSQL Cloud & Database Management\n\nPanduan pengelolaan database cloud berbasis SQLite terdistribusi menggunakan **Turso LibSQL**.\n\n## 1. Keunggulan Turso untuk Ekosistem:\n- **Zero Configuration**: Sangat ringan dan kompatibel penuh dengan SQLite.\n- **Edge Deployment**: Basis data direplikasi mendekati lokasi server Vercel.\n- **Biaya Efisien**: Free tier murah hati yang mampu menopang puluhan aplikasi komunitas.\n\n## 2. Manajemen Koneksi di Next.js:\n- Gunakan pola singleton client (`createClient`) untuk menghindari kebocoran koneksi serverless.\n- Selalu gunakan parameterized queries (`sql: \"...\", args: [...]`) untuk mencegah ancaman SQL Injection.\n",
    "tags": [
      "Databases",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-design-system-dark-glassmorphism-tailwind",
    "title": "Design System Dark Glassmorphism & Tailwind CSS",
    "slug": "design-system-dark-glassmorphism-tailwind",
    "categoryId": "cat-design",
    "contentMarkdown": "# Design System Dark Glassmorphism & Tailwind CSS\n\nPedoman visual estetika antarmuka gelap modern yang diterapkan pada portal dan aplikasi LeonoreKingdom.\n\n## 1. Palet Warna & Latar:\n- **Latar Belakang Dasar**: `bg-slate-950` (#020617)\n- **Kartu Kontainer**: `bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl`\n- **Warna Aksen Utama**: Royal Indigo (`#6366f1`), Purple (`#a855f7`), Pink (`#ec4899`)\n\n## 2. Interaktivitas & Micro-interactions:\n- **Hover Transitions**: `transition-all duration-300 hover:-translate-y-1`\n- **Glow Accent**: Bayangan lembut (*soft ambient glow*) yang senada dengan warna kategori aplikasi.\n- **Keterbacaan Tipografi**: Font sans-serif bersih dengan penekanan hierarki yang tegas.\n",
    "tags": [
      "Design",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-alur-transaksi-e-commerce-pasarlore-lecafe",
    "title": "Alur Transaksi & E-Commerce PasarLore & LeCafe",
    "slug": "alur-transaksi-e-commerce-pasarlore-lecafe",
    "categoryId": "cat-guides",
    "contentMarkdown": "# Alur Transaksi & E-Commerce PasarLore & LeCafe\n\nDokumentasi alur pembayaran, katalog produk, dan proses transaksi pada platform store komunitas.\n\n## 1. Alur Transaksi:\n1. **Pilih Produk**: Pelanggan memilih produk digital/fisik dan memasukkannya ke keranjang.\n2. **Checkout**: Pelanggan mengisi data pemesanan dan memilih metode pembayaran.\n3. **Payment Gateway**: Sistem membuat Snap Token Midtrans dan membuka modal pembayaran aman.\n4. **Verifikasi Webhook**: Server menerima notifikasi status pembayaran dari Midtrans dan memperbarui status pesanan.\n",
    "tags": [
      "Guides",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-discord-bot-architecture-leone-dashboard",
    "title": "Discord Bot Architecture & Leone Dashboard",
    "slug": "discord-bot-architecture-leone-dashboard",
    "categoryId": "cat-guides",
    "contentMarkdown": "# Discord Bot Architecture & Leone Dashboard\n\nDokumentasi arsitektur interaksi antara Leone Discord Bot dan panel kendali web di **bots.leonorekingdom.xyz**.\n\n## 1. Prinsip Operasional Leone:\n- **Bilingual**: Mampu merespon dalam Bahasa Indonesia dan Bahasa Inggris yang ramah.\n- **Deterministik**: Konten panduan server dan aturan diambil dari berkas pengetahuan terkurasi, bukan halusinasi AI tak terkontrol.\n- **Least Privilege**: Hak akses bot dibatasi hanya pada channel dan tugas yang diizinkan pemilik server.\n",
    "tags": [
      "Guides",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-keamanan-enkripsi-client-side-leonorevault",
    "title": "Keamanan Enkripsi Client-Side LeonoreVault",
    "slug": "keamanan-enkripsi-client-side-leonorevault",
    "categoryId": "cat-guides",
    "contentMarkdown": "# Keamanan Enkripsi Client-Side LeonoreVault\n\nSpesifikasi teknis keamanan dan enkripsi tanpa server (*zero-knowledge client-side encryption*) pada **LeonoreVault**.\n\n## 1. Algoritma Enkripsi:\n- **AES-GCM 256-bit**: Mengamankan isi teks dan kredensial sensitif.\n- **PBKDF2 dengan SHA-256**: Melakukan derivasi kunci enkripsi dari master password pengguna dengan 100.000 iterasi.\n- **Zero Server Knowledge**: Kunci enkripsi dan plaintext tidak pernah dikirimkan ke jaringan atau server mana pun.\n",
    "tags": [
      "Guides",
      "Ecosystem",
      "Leonore"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "art-inspirasi-catatan-ide-ekosistem",
    "title": "Inspirasi & Ide Pengembangan Fitur Ekosistem",
    "slug": "inspirasi-catatan-ide-pengembangan-fitur-ekosistem",
    "categoryId": "cat-ideas",
    "contentMarkdown": "# Inspirasi & Ide Pengembangan Fitur Ekosistem\n\nKumpulan ide kreatif, eksplorasi teknologi, dan catatan konsep masa depan untuk ekosistem LeonoreKingdom & LeonorePortal.\n\n## 1. Ide Fitur & Konsep Baru:\n- **Unified Activity Feed**: Menampilkan linimasa aktivitas lintas proyek dan aplikasi dalam satu stream terintegrasi.\n- **AI-Powered Daily Standup**: Ringkasan otomatis progres harian berbasis commit GitHub dan status tugas kanban.\n- **Quick Capture Widget**: Floating widget cepat untuk menangkap ide spontan tanpa mengganggu fokus kerja utama.\n- **Semantic Codebase Search**: Integrasi pencarian semantik cerdas untuk dokumentasi wiki dan repo kode.\n\n## 2. Catatan Eksplorasi Arsitektur:\n- Evaluasi penggunaan WebSockets / SSE untuk pembaruan papan Kanban waktu-nyata (*real-time collaborative updates*).\n- Pertimbangan caching edge berbasis Cloudflare Workers untuk konten wiki publik.\n- Sinkronisasi otomatis dua arah yang lebih mendalam dengan Obsidian vault menggunakan Git submodule atau webhook.\n\n## 3. Backlog Gagasan Desain:\n- Eksplorasi tema retro-cyberpunk dan mode kontras tinggi untuk dashboard pengguna.\n- Kartu analitik produktivitas mingguan dengan visualisasi interaktif.\n",
    "tags": [
      "Ideas",
      "Brainstorming",
      "Ecosystem",
      "Innovation"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-05T19:40:40.639Z",
    "updatedAt": "2026-09-05T19:40:40.639Z"
  },
  {
    "id": "art-catatan-referensi-best-practices",
    "title": "Catatan Referensi & Best Practices Pengelolaan Portal",
    "slug": "catatan-referensi-best-practices-pengelolaan-portal",
    "categoryId": "cat-notes",
    "contentMarkdown": "# Catatan Referensi & Best Practices Pengelolaan Portal\n\nCatatan harian, rangkuman konvensi teknis, dan memo pedoman praktis dalam mengelola LeonorePortal dan subsistem terkait.\n\n## 1. Konvensi Penamaan & Standar Kode:\n- **Komponen**: PascalCase (misal: `DatePicker.tsx`, `KanbanBoard.tsx`).\n- **Endpoint API**: RESTful dengan kata benda jamak (misal: `/api/projects`, `/api/wiki/categories`).\n- **Status Proyek**: Nilai kanonis `active` (Aktif), `completed` (Selesai), `on_hold` (Ditunda).\n- **Status Tugas**: Tiga tahap baku `To Do`, `In Progress`, dan `Done`.\n\n## 2. Praktik Sinkronisasi Obsidian:\n- File markdown diorganisasikan ke folder PARA: `1_Projects/` untuk catatan Kanban dan `3_Resources/` untuk artikel Knowledge Base.\n- Setiap artikel menyertakan frontmatter YAML standar (`type`, `category`, `created`, `tags`).\n\n## 3. Memo Pengelolaan Database:\n- Semua mutasi tabel yang melibatkan penghitungan progres proyek wajib memanggil helper sinkronisasi otomatis agar status proyek selalu akurat.\n- Gunakan parameterized queries untuk memastikan keamanan basis data Turso LibSQL.\n",
    "tags": [
      "Notes",
      "Reference",
      "BestPractices",
      "Ecosystem"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-05T19:49:12.822Z",
    "updatedAt": "2026-09-05T19:49:12.822Z"
  },
  {
    "id": "art-roadmap-rencana-strategis-leonore",
    "title": "Roadmap & Rencana Strategis Ekosistem Leonore 2026–2027",
    "slug": "roadmap-rencana-strategis-ekosistem-leonore-2026-2027",
    "categoryId": "cat-plans",
    "contentMarkdown": "# Roadmap & Rencana Strategis Ekosistem Leonore 2026–2027\n\nDokumen perencanaan strategis, milestone rilis produk, dan rencana ekspansi infrastruktur untuk seluruh ekosistem LeonoreKingdom.\n\n## 1. Fase 1: Konsolidasi & Stabilitas Ekosistem (Q3 2026)\n- **Otentikasi Terpusat (SSO)**: Menghubungkan sesi login antara LeonorePortal dan aplikasi sub-domain lainnya.\n- **Sinkronisasi Dua Arah Real-time**: Integrasi mendalam antara Obsidian Vault lokal dan repositori GitHub.\n- **Peningkatan Performa & Lazy Load**: Penerapan skeleton loaders dan optimasi query Turso DB untuk latensi di bawah 100ms.\n\n## 2. Fase 2: Otomasi & Fitur AI Lanjutan (Q4 2026)\n- **Agentic Task Assistant**: Asisten otomatis untuk memecah proyek besar menjadi task-task kanban yang actionable.\n- **Knowledge Graph Visualization**: Visualisasi relasi antar dokumen wiki dan catatan Zettelkasten dalam bentuk graf interaktif.\n- **Automated Health Monitoring**: Sistem pengecekan status serverless dan deteksi downtime otomatis lintas subdomain.\n\n## 3. Fase 3: Skalabilitas & Komunitas (2027)\n- **Ekspansi Multi-Region Database**: Replikasi read-replica Turso ke wilayah Asia Tenggara (Singapura/Jakarta) untuk latensi minimal.\n- **Workspace Kolaboratif**: Dukungan multi-role member, kontributor eksternal, dan audit log perubahan dokumen.\n- **Mobile-Responsive Progressive Web App (PWA)**: Akses offline dan instalasi langsung di perangkat mobile.\n",
    "tags": [
      "Plans",
      "Roadmap",
      "Strategy",
      "Milestones"
    ],
    "readTime": "3 min baca",
    "createdAt": "2026-09-05T19:46:00.670Z",
    "updatedAt": "2026-09-05T19:46:00.670Z"
  }
];
