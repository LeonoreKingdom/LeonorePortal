export interface ToolboxCategory {
  id: "essential" | "media" | "utilities";
  name: string;
  description: string;
  color: string;
}

export interface ToolItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "essential" | "media" | "utilities";
  icon: string;
  tags: string[];
  isPopular?: boolean;
}

export const TOOLBOX_CATEGORIES: ToolboxCategory[] = [
  {
    id: "essential",
    name: "Essential Tools",
    description: "Alat perhitungan harian, konversi satuan, waktu presisi, dan epoch timestamp.",
    color: "#6366f1",
  },
  {
    id: "media",
    name: "Media Tools",
    description: "Pengolahan gambar, kompresor, video, audio, GIF, palet warna, dan dokumen PDF.",
    color: "#ec4899",
  },
  {
    id: "utilities",
    name: "Utilities & Dev",
    description: "Format teks & JSON, spreadsheet, regex tester, JWT inspector, HTML live, diff, dan QR.",
    color: "#10b981",
  },
];

export const TOOLBOX_ITEMS: ToolItem[] = [
  // ESSENTIAL TOOLS
  {
    id: "calculator",
    slug: "calculator",
    name: "Kalkulator Cepat",
    description: "Kalkulator ilmiah & standar dengan riwayat perhitungan otomatis di memori browser.",
    category: "essential",
    icon: "Calculator",
    tags: ["Matematika", "Hitung", "Essential"],
    isPopular: true,
  },
  {
    id: "unit-converter",
    slug: "unit-converter",
    name: "Konverter Satuan",
    description: "Konversi cepat antara panjang, berat, suhu, volume, dan ukuran data digital.",
    category: "essential",
    icon: "Scale",
    tags: ["Konversi", "Satuan", "Panjang", "Berat"],
  },
  {
    id: "timer-stopwatch",
    slug: "timer-stopwatch",
    name: "Timer & Stopwatch",
    description: "Pengatur waktu hitung mundur dan stopwatch dengan pencatat lap presisi milidetik.",
    category: "essential",
    icon: "Clock",
    tags: ["Waktu", "Timer", "Stopwatch", "Lap"],
    isPopular: true,
  },
  {
    id: "unix-timestamp",
    slug: "unix-timestamp",
    name: "Unix Timestamp Converter",
    description: "Konversi waktu epoch detik/milidetik ke format tanggal manusia multi-zona waktu (WIB/UTC) dan sebaliknya.",
    category: "essential",
    icon: "CalendarClock",
    tags: ["Timestamp", "Epoch", "Unix", "WIB", "UTC", "Waktu"],
    isPopular: true,
  },

  // MEDIA TOOLS
  {
    id: "image-compressor",
    slug: "image-compressor",
    name: "Image Compressor",
    description: "Kompres ukuran berkas gambar PNG/JPEG/WebP dengan pengatur kualitas, target size, dan pratinjau hemat ukuran.",
    category: "media",
    icon: "FileDown",
    tags: ["Kompres", "Gambar", "Optimasi", "WebP", "JPEG"],
    isPopular: true,
  },
  {
    id: "image-converter",
    slug: "image-converter",
    name: "Image Converter",
    description: "Konversi format gambar PNG, JPG, WebP, dan BMP langsung di canvas browser.",
    category: "media",
    icon: "Image",
    tags: ["Gambar", "PNG", "JPG", "WebP"],
    isPopular: true,
  },
  {
    id: "image-resizer",
    slug: "image-resizer",
    name: "Image Resizer",
    description: "Ubah resolusi, rasio aspek, dan skala dimensi gambar secara instan.",
    category: "media",
    icon: "Maximize2",
    tags: ["Resize", "Gambar", "Resolusi", "Dimensi"],
  },
  {
    id: "video-gif-converter",
    slug: "video-gif-converter",
    name: "Video to GIF",
    description: "Ubah klip video menjadi animasi GIF bergerak atau konversi animasi GIF menjadi file video MP4/WebM.",
    category: "media",
    icon: "Film",
    tags: ["Video", "GIF", "Animasi", "MP4", "WebM"],
    isPopular: true,
  },
  {
    id: "video-converter",
    slug: "video-converter",
    name: "Video Converter",
    description: "Konversi dan transcode format video MP4, WebM, MKV, AVI dengan pengaturan resolusi, frame rate, dan kualitas.",
    category: "media",
    icon: "Video",
    tags: ["Video", "Converter", "MP4", "WebM", "Transcode"],
  },
  {
    id: "audio-converter",
    slug: "audio-converter",
    name: "Audio Converter",
    description: "Konversi format file audio MP3, WAV, AAC, OGG, FLAC dengan penyesuaian bitrate, sample rate, dan normalisasi.",
    category: "media",
    icon: "Headphones",
    tags: ["Audio", "MP3", "WAV", "AAC", "OGG", "Bitrate"],
    isPopular: true,
  },
  {
    id: "video-to-audio",
    slug: "video-to-audio",
    name: "Video to Audio",
    description: "Ekstrak trek suara audio (WAV / MP3) dari file video lokal menggunakan Web Audio API.",
    category: "media",
    icon: "Music",
    tags: ["Video", "Audio", "Ekstraksi", "WAV"],
  },
  {
    id: "pdf-toolkit",
    slug: "pdf-toolkit",
    name: "PDF Toolkit",
    description: "Konversi PDF ke DOCX/Teks dan sebaliknya, gabungkan (merge) beberapa PDF, serta ekstrak halaman dokumen.",
    category: "media",
    icon: "FileStack",
    tags: ["PDF", "DOCX", "Word", "Merge", "Split", "Dokumen"],
    isPopular: true,
  },
  {
    id: "pdf-to-image",
    slug: "pdf-to-image",
    name: "PDF to Image",
    description: "Ekstrak halaman PDF menjadi gambar resolusi tinggi (PNG/JPG) per halaman dengan pilihan DPI.",
    category: "media",
    icon: "FileSpreadsheet",
    tags: ["PDF", "Gambar", "PNG", "JPEG", "Ekstrak"],
  },
  {
    id: "image-to-pdf",
    slug: "image-to-pdf",
    name: "Image to PDF",
    description: "Gabungkan satu atau banyak foto menjadi dokumen PDF siap cetak dalam satu klik.",
    category: "media",
    icon: "FileText",
    tags: ["PDF", "Dokumen", "Foto", "Cetak"],
  },
  {
    id: "color-picker",
    slug: "color-picker",
    name: "Color Picker & Palette",
    description: "Pemilih warna HEX, RGB, HSL dengan generator palet harmoni warna dan salin cepat.",
    category: "media",
    icon: "Palette",
    tags: ["Warna", "HEX", "RGB", "Palet", "Design"],
  },

  // UTILITIES & DEV
  {
    id: "spreadsheet-converter",
    slug: "spreadsheet-converter",
    name: "Spreadsheet Converter",
    description: "Konversi file tabel XLS / XLSX ke format CSV (dan sebaliknya), pratinjau grid tabel interaktif, dan ekspor JSON.",
    category: "utilities",
    icon: "TableProperties",
    tags: ["Spreadsheet", "Excel", "CSV", "XLSX", "Tabel", "JSON"],
    isPopular: true,
  },
  {
    id: "regex-tester",
    slug: "regex-tester",
    name: "Regex Tester & Builder",
    description: "Uji ekspresi reguler (Regex) secara live dengan highlight visual, ekstraksi grup capture, dan library pola umum.",
    category: "utilities",
    icon: "Regex",
    tags: ["Regex", "Pattern", "Tester", "Matcher", "Dev"],
    isPopular: true,
  },
  {
    id: "jwt-inspector",
    slug: "jwt-inspector",
    name: "JWT Inspector & Decoder",
    description: "Dekode token JSON Web Token (Header, Payload, Signature), cek masa kedaluwarsa, dan verifikasi claims.",
    category: "utilities",
    icon: "ShieldAlert",
    tags: ["JWT", "Auth", "Token", "Decoder", "Security", "Dev"],
    isPopular: true,
  },
  {
    id: "text-json-formatter",
    slug: "text-json-formatter",
    name: "Text & JSON Formatter",
    description: "Format, rapikan (prettify), validasi, atau perkecil (minify) data JSON & teks.",
    category: "utilities",
    icon: "Braces",
    tags: ["JSON", "Format", "Prettify", "Minify"],
  },
  {
    id: "html-live-editor",
    slug: "html-live-editor",
    name: "HTML Live Editor",
    description: "Editor kode HTML, CSS, dan JavaScript dengan pratinjau live real-time di browser.",
    category: "utilities",
    icon: "Code2",
    tags: ["HTML", "CSS", "JS", "Live Preview"],
  },
  {
    id: "diff-checker",
    slug: "diff-checker",
    name: "Diff Checker",
    description: "Bandingkan dua versi teks berdampingan untuk melihat perbedaan kata dan baris.",
    category: "utilities",
    icon: "GitCompare",
    tags: ["Diff", "Perbandingan", "Teks", "Versi"],
  },
  {
    id: "qr-generator",
    slug: "qr-generator",
    name: "QR Code Generator",
    description: "Buat QR code dari tautan URL, teks, atau WiFi dengan kustomisasi warna dan unduh PNG/SVG.",
    category: "utilities",
    icon: "QrCode",
    tags: ["QR", "Barcode", "URL", "WiFi"],
  },
  {
    id: "password-generator",
    slug: "password-generator",
    name: "Password Generator",
    description: "Buat kata sandi acak yang kuat dengan kontrol panjang, simbol, angka, dan indikator keamanan.",
    category: "utilities",
    icon: "KeyRound",
    tags: ["Keamanan", "Password", "Acak", "Kripto"],
  },
];