export interface TaskItem {
  id: string;
  projectId: string;
  title: string;
  status: "todo" | "doing" | "done";
  sortOrder: number;
  notesMarkdown?: string;
  priority?: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  notesMarkdown: string;
  category: string;
  color: string;
  status: "active" | "completed" | "on-hold";
  priority?: "low" | "medium" | "high" | "critical";
  tasks: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export const MOCK_PROJECTS: ProjectItem[] = [
  {
    "id": "proj-squad",
    "title": "Digital Platform Squad",
    "description": "Hub portal profil dan showcase divisi platform digital dengan integrasi layanan ekosistem Leonore.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://squad.leonorekingdom.xyz\n- Stack: Next.js 15 App Router, TypeScript, Tailwind CSS, Turso LibSQL\n- Tujuan: Menampilkan direktori anggota divisi, proyek teknologi unggulan, dan metrik dampak ekosistem digital.",
    "category": "Portal",
    "color": "#70db86",
    "status": "active",
    "priority": "high",
    "tasks": [
      {
        "id": "task-proj-squad-1",
        "projectId": "proj-squad",
        "title": "Setup Next.js 15 dan routing subdomain squad.leonorekingdom.xyz",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi Digital Platform Squad (https://squad.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-squad-2",
        "projectId": "proj-squad",
        "title": "Integrasi showcase proyek squad dan statistik performa tim",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi Digital Platform Squad (https://squad.leonorekingdom.xyz)",
        "priority": "high",
        "dueDate": "2026-09-15",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-squad-3",
        "projectId": "proj-squad",
        "title": "Pembaruan struktur profil keahlian dan dokumentasi kompetensi",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi Digital Platform Squad (https://squad.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-22",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-leonorekingdom",
    "title": "LeonoreKingdom Community",
    "description": "Platform web utama komunitas LeonoreKingdom: informasi server Discord, aturan kerajaan, event, dan portal anggota.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://leonorekingdom.xyz\n- Stack: Next.js 15, Tailwind CSS, Turso SQLite\n- Tujuan: Menjadi gerbang utama komunitas dengan integrasi status Discord, panduan aturan kerajaan, dan kalender kegiatan bersama.",
    "category": "Community",
    "color": "#ffbc05",
    "status": "active",
    "priority": "critical",
    "tasks": [
      {
        "id": "task-proj-leonorekingdom-1",
        "projectId": "proj-leonorekingdom",
        "title": "Peluncuran landing page resmi leonorekingdom.xyz",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreKingdom Community (https://leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leonorekingdom-2",
        "projectId": "proj-leonorekingdom",
        "title": "Integrasi widget status server Discord dan aktivitas komunitas",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreKingdom Community (https://leonorekingdom.xyz)",
        "priority": "high",
        "dueDate": "2026-09-12",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leonorekingdom-3",
        "projectId": "proj-leonorekingdom",
        "title": "Halaman pendaftaran event komunitas dan direktori anggota",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreKingdom Community (https://leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-25",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-leone",
    "title": "Leone Bot Dashboard",
    "description": "Dashboard kendali operasional, visualisasi log perintah, dan manajemen modul untuk bot pendamping Leone Discord.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://bots.leonorekingdom.xyz\n- Stack: React, TypeScript, Tailwind CSS, Discord.js API\n- Tujuan: Memberikan antarmuka visual bagi admin untuk mengatur respon bot, memantau log audit, dan melihat analitik percakapan.",
    "category": "Bots",
    "color": "#808080",
    "status": "active",
    "priority": "high",
    "tasks": [
      {
        "id": "task-proj-leone-1",
        "projectId": "proj-leone",
        "title": "Konfigurasi antarmuka dashboard bot dan status runtime",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi Leone Bot Dashboard (https://bots.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leone-2",
        "projectId": "proj-leone",
        "title": "Implementasi visualisasi log perintah dan metrik penggunaan bot",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi Leone Bot Dashboard (https://bots.leonorekingdom.xyz)",
        "priority": "high",
        "dueDate": "2026-09-18",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leone-3",
        "projectId": "proj-leone",
        "title": "Pengaturan izin role bot dan modul otomasi server Discord",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi Leone Bot Dashboard (https://bots.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-30",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-leonore-studio",
    "title": "LeonoreStudio Agency",
    "description": "Platform agensi kreatif untuk layanan rekayasa web, desain antarmuka modern, dan solusi transformasi digital.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://studio.leonorekingdom.xyz\n- Stack: Next.js 15, Tailwind CSS, Turso LibSQL\n- Tujuan: Menampilkan paket layanan pembuatan web modern, portofolio karya komersial, dan formulir konsultasi calon klien.",
    "category": "Agency",
    "color": "#e70d2e",
    "status": "active",
    "priority": "high",
    "tasks": [
      {
        "id": "task-proj-leonore-studio-1",
        "projectId": "proj-leonore-studio",
        "title": "Desain branding, portofolio showcase, dan landing page agensi",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreStudio Agency (https://studio.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leonore-studio-2",
        "projectId": "proj-leonore-studio",
        "title": "Form konsultasi proyek dan kalkulator estimasi biaya layanan",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreStudio Agency (https://studio.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-16",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leonore-studio-3",
        "projectId": "proj-leonore-studio",
        "title": "Integrasi studi kasus klien dan galeri testimoni interaktif",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreStudio Agency (https://studio.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-28",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-me",
    "title": "Portofolio Pribadi",
    "description": "Website personal branding, narasi perjalanan karir, esai pemikiran, dan galeri karya cipta personal.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://me.leonorekingdom.xyz\n- Stack: React, Tailwind CSS, Turso SQLite\n- Tujuan: Representasi identitas pribadi dengan pendekatan storytelling yang elegan, hangat, dan autentik.",
    "category": "Portfolio",
    "color": "#ec4899",
    "status": "active",
    "priority": "medium",
    "tasks": [
      {
        "id": "task-proj-me-1",
        "projectId": "proj-me",
        "title": "Rilis desain minimalis responsif dengan tema gelap elegan",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi Portofolio Pribadi (https://me.leonorekingdom.xyz)",
        "priority": "medium",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-me-2",
        "projectId": "proj-me",
        "title": "Kurasi artikel blog pribadi dan dokumentasi perjalanan belajar",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi Portofolio Pribadi (https://me.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-20",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-me-3",
        "projectId": "proj-me",
        "title": "Penambahan linimasa pengalaman dan pencapaian interaktif",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi Portofolio Pribadi (https://me.leonorekingdom.xyz)",
        "priority": "low",
        "dueDate": "2026-10-05",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-pro",
    "title": "Portfolio Profesional",
    "description": "Showcase rekayasa perangkat lunak profesional, arsitektur sistem enterprise, dan studi kasus teknis.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://pro.leonorekingdom.xyz\n- Stack: Next.js 15 App Router, TypeScript, Tailwind CSS, Turso DB\n- Tujuan: Menampilkan kapabilitas rekayasa software tingkat lanjut untuk peluang karir dan kemitraan strategis.",
    "category": "Portfolio",
    "color": "#ec4899",
    "status": "active",
    "priority": "high",
    "tasks": [
      {
        "id": "task-proj-pro-1",
        "projectId": "proj-pro",
        "title": "Arsitektur proyek berbasis Next.js 15, TypeScript, dan Tailwind CSS",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi Portfolio Profesional (https://pro.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-pro-2",
        "projectId": "proj-pro",
        "title": "Dokumentasi mendalam arsitektur microservices dan demo interaktif",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi Portfolio Profesional (https://pro.leonorekingdom.xyz)",
        "priority": "high",
        "dueDate": "2026-09-14",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-pro-3",
        "projectId": "proj-pro",
        "title": "Integrasi resume PDF dinamis dan formulir kontak profesional",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi Portfolio Profesional (https://pro.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-24",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-leonorevault",
    "title": "LeonoreVault",
    "description": "Modul penyimpanan terenkripsi client-side dan utilitas manajemen kredensial/rahasia dengan keamanan tinggi.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://vault.leonorekingdom.xyz\n- Stack: Next.js 15, Web Crypto API, TypeScript\n- Keamanan: Zero-knowledge architecture, enkripsi AES-GCM di sisi browser tanpa menyimpan kunci di server.",
    "category": "Utilities",
    "color": "#f59e0b",
    "status": "active",
    "priority": "high",
    "tasks": [
      {
        "id": "task-proj-leonorevault-1",
        "projectId": "proj-leonorevault",
        "title": "Implementasi modul enkripsi client-side Web Crypto API",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreVault (https://vault.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leonorevault-2",
        "projectId": "proj-leonorevault",
        "title": "Peningkatan manajemen kategori kredensial dan generator password",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreVault (https://vault.leonorekingdom.xyz)",
        "priority": "high",
        "dueDate": "2026-09-15",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-leonorevault-3",
        "projectId": "proj-leonorevault",
        "title": "Fitur ekspor/impor vault terenkripsi berbasis file JSON aman",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi LeonoreVault (https://vault.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-26",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-mykisah",
    "title": "MyKisah",
    "description": "Aplikasi jurnal digital kenangan, linimasa momen berharga, galeri foto, dan cerita romansa personal.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://mykisah.leonorekingdom.xyz\n- Stack: Next.js 15, Tailwind CSS, Turso LibSQL\n- Tujuan: Mengabadikan perjalanan kisah kasih dalam bentuk linimasa interaktif yang intim dan penuh makna.",
    "category": "Romansa",
    "color": "#f264e1",
    "status": "active",
    "priority": "medium",
    "tasks": [
      {
        "id": "task-proj-mykisah-1",
        "projectId": "proj-mykisah",
        "title": "Setup skema database kenangan dan desain visual romantis elegan",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi MyKisah (https://mykisah.leonorekingdom.xyz)",
        "priority": "medium",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-mykisah-2",
        "projectId": "proj-mykisah",
        "title": "Fitur linimasa interaktif dan pengelompokan momen per bab cerita",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi MyKisah (https://mykisah.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-17",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-mykisah-3",
        "projectId": "proj-mykisah",
        "title": "Proteksi privasi dengan PIN sandi dan album kenangan khusus",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi MyKisah (https://mykisah.leonorekingdom.xyz)",
        "priority": "low",
        "dueDate": "2026-10-01",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-pasarlore",
    "title": "PasarLore E-Commerce",
    "description": "Platform marketplace e-commerce untuk produk digital dan fisik komunitas LeonoreKingdom.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://pasarlore.leonorekingdom.xyz\n- Stack: Next.js 15, TypeScript, Tailwind CSS, Turso DB\n- Fitur: Katalog multi-kategori, sistem keranjang, checkout instan, dan integrasi pembayaran.",
    "category": "Store",
    "color": "#edb007",
    "status": "active",
    "priority": "critical",
    "tasks": [
      {
        "id": "task-proj-pasarlore-1",
        "projectId": "proj-pasarlore",
        "title": "Desain katalog produk modern, keranjang belanja, dan pencarian instan",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi PasarLore E-Commerce (https://pasarlore.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-pasarlore-2",
        "projectId": "proj-pasarlore",
        "title": "Integrasi gateway pembayaran Midtrans dan notifikasi transaksi",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi PasarLore E-Commerce (https://pasarlore.leonorekingdom.xyz)",
        "priority": "critical",
        "dueDate": "2026-09-11",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-pasarlore-3",
        "projectId": "proj-pasarlore",
        "title": "Halaman kelola pesanan dan dashboard merchant komunitas",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi PasarLore E-Commerce (https://pasarlore.leonorekingdom.xyz)",
        "priority": "high",
        "dueDate": "2026-09-22",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-lecafe",
    "title": "LeCafe Hub",
    "description": "Sistem katalog menu kafe digital, pemesanan meja daring, dan program loyalitas pelanggan.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://lecafe.leonorekingdom.xyz\n- Stack: Next.js 15, Tailwind CSS, Turso SQLite\n- Tujuan: Memberikan pengalaman pemesanan menu yang mulus dan cepat baik untuk takeaway maupun dine-in.",
    "category": "Store",
    "color": "#edb007",
    "status": "active",
    "priority": "high",
    "tasks": [
      {
        "id": "task-proj-lecafe-1",
        "projectId": "proj-lecafe",
        "title": "Desain visual menu interaktif dengan filter kategori kopi dan makanan",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi LeCafe Hub (https://lecafe.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-lecafe-2",
        "projectId": "proj-lecafe",
        "title": "Alur pemesanan meja dan kalkulator pesanan instan",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi LeCafe Hub (https://lecafe.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-16",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-lecafe-3",
        "projectId": "proj-lecafe",
        "title": "Fitur voucher diskon dan sistem poin loyalitas pelanggan",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi LeCafe Hub (https://lecafe.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-27",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-simple-todolist",
    "title": "Simple ToDo List",
    "description": "Aplikasi pelacak tugas minimalis, cepat, dan ringan untuk manajemen produktivitas harian bebas distraksi.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://todo.leonorekingdom.xyz\n- Stack: Next.js 15, React, Tailwind CSS\n- Keunggulan: Kecepatan buka instan, penyimpanan lokal tanpa login, dan UI yang sangat intuitif.",
    "category": "Productivity",
    "color": "#6366f1",
    "status": "active",
    "priority": "medium",
    "tasks": [
      {
        "id": "task-proj-simple-todolist-1",
        "projectId": "proj-simple-todolist",
        "title": "Implementasi CRUD tugas harian, checklist cepat, dan filter prioritas",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi Simple ToDo List (https://todo.leonorekingdom.xyz)",
        "priority": "medium",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-simple-todolist-2",
        "projectId": "proj-simple-todolist",
        "title": "Penyimpanan offline lokal dan sinkronisasi status tugas",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi Simple ToDo List (https://todo.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-14",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-simple-todolist-3",
        "projectId": "proj-simple-todolist",
        "title": "Kustomisasi tema warna dan mode fokus tanpa distraksi",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi Simple ToDo List (https://todo.leonorekingdom.xyz)",
        "priority": "low",
        "dueDate": "2026-09-23",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  },
  {
    "id": "proj-simple-todolist-gemini",
    "title": "Simple ToDo List Gemini AI",
    "description": "Aplikasi to-do list pintar bertenaga Google Gemini AI untuk memecah tugas kompleks menjadi sub-langkah actionable.",
    "notesMarkdown": "## Arsitektur & Lingkup\n- Domain: https://todogem.leonorekingdom.xyz\n- Stack: Next.js 15, Google Generative AI SDK, Tailwind CSS\n- Fitur AI: Smart task breakdown, estimasi durasi cerdas, dan rekomendasi fokus harian.",
    "category": "Productivity",
    "color": "#6366f1",
    "status": "active",
    "priority": "high",
    "tasks": [
      {
        "id": "task-proj-simple-todolist-gemini-1",
        "projectId": "proj-simple-todolist-gemini",
        "title": "Integrasi Google Gemini AI SDK untuk analisis dan saran produktivitas",
        "status": "done",
        "sortOrder": 1,
        "notesMarkdown": "Tugas untuk aplikasi Simple ToDo List Gemini AI (https://todogem.leonorekingdom.xyz)",
        "priority": "high",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-simple-todolist-gemini-2",
        "projectId": "proj-simple-todolist-gemini",
        "title": "Fitur otomatis Breakdown Task menjadi sub-tugas terstruktur",
        "status": "doing",
        "sortOrder": 2,
        "notesMarkdown": "Tugas untuk aplikasi Simple ToDo List Gemini AI (https://todogem.leonorekingdom.xyz)",
        "priority": "high",
        "dueDate": "2026-09-13",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      },
      {
        "id": "task-proj-simple-todolist-gemini-3",
        "projectId": "proj-simple-todolist-gemini",
        "title": "Rekomendasi estimasi waktu dan prioritisasi cerdas berbasis AI",
        "status": "todo",
        "sortOrder": 3,
        "notesMarkdown": "Tugas untuk aplikasi Simple ToDo List Gemini AI (https://todogem.leonorekingdom.xyz)",
        "priority": "medium",
        "dueDate": "2026-09-21",
        "createdAt": "2026-09-03T21:09:57.475Z",
        "updatedAt": "2026-09-03T21:09:57.475Z"
      }
    ],
    "createdAt": "2026-09-03T21:09:57.475Z",
    "updatedAt": "2026-09-03T21:09:57.475Z"
  }
];
