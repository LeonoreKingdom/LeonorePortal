export interface SyncedFileItem {
  id: string;
  sourceType: "project" | "wiki" | "task";
  sourceId: string;
  title: string;
  vaultRelativePath: string;
  fileSize: number; // bytes
  lastSyncedAt: string;
  syncStatus: "synced" | "modified" | "conflict" | "pending";
  direction: "bidirectional" | "export_only" | "import_only";
}

export interface SyncLogItem {
  id: string;
  timestamp: string;
  action: "push_to_vault" | "pull_from_vault" | "conflict_resolved" | "full_sync";
  summary: string;
  filesAffected: number;
  status: "success" | "warning" | "error";
}

export interface ObsidianVaultConfig {
  vaultPath: string;
  autoSync: boolean;
  syncIntervalMinutes: number;
  conflictResolution: "prefer_portal" | "prefer_obsidian" | "manual";
  syncProjects: boolean;
  syncWiki: boolean;
  includeFrontmatter: boolean;
  lastSuccessfulSync: string;
}

export const INITIAL_VAULT_CONFIG: ObsidianVaultConfig = {
  vaultPath: "D:\\LeonoreKingdom\\Obsidian\\LeonorePortalZettelkasten",
  autoSync: true,
  syncIntervalMinutes: 5,
  conflictResolution: "prefer_portal",
  syncProjects: true,
  syncWiki: true,
  includeFrontmatter: true,
  lastSuccessfulSync: "2026-09-04T03:58:00Z",
};

export const MOCK_SYNCED_FILES: SyncedFileItem[] = [
  {
    id: "sync-proj-proj-squad",
    sourceType: "project",
    sourceId: "proj-squad",
    title: "Digital Platform Squad",
    vaultRelativePath: "1_Projects/Digital Platform Squad.md",
    fileSize: 2450,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-leonorekingdom",
    sourceType: "project",
    sourceId: "proj-leonorekingdom",
    title: "LeonoreKingdom Community",
    vaultRelativePath: "1_Projects/LeonoreKingdom Community.md",
    fileSize: 2800,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-leone",
    sourceType: "project",
    sourceId: "proj-leone",
    title: "Leone Bot Dashboard",
    vaultRelativePath: "1_Projects/Leone Bot Dashboard.md",
    fileSize: 2600,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-leonore-studio",
    sourceType: "project",
    sourceId: "proj-leonore-studio",
    title: "LeonoreStudio Agency",
    vaultRelativePath: "1_Projects/LeonoreStudio Agency.md",
    fileSize: 2750,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-me",
    sourceType: "project",
    sourceId: "proj-me",
    title: "Portofolio Pribadi",
    vaultRelativePath: "1_Projects/Portofolio Pribadi.md",
    fileSize: 2100,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-pro",
    sourceType: "project",
    sourceId: "proj-pro",
    title: "Portfolio Profesional",
    vaultRelativePath: "1_Projects/Portfolio Profesional.md",
    fileSize: 2900,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-leonorevault",
    sourceType: "project",
    sourceId: "proj-leonorevault",
    title: "LeonoreVault",
    vaultRelativePath: "1_Projects/LeonoreVault.md",
    fileSize: 2300,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-mykisah",
    sourceType: "project",
    sourceId: "proj-mykisah",
    title: "MyKisah",
    vaultRelativePath: "1_Projects/MyKisah.md",
    fileSize: 2150,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-pasarlore",
    sourceType: "project",
    sourceId: "proj-pasarlore",
    title: "PasarLore E-Commerce",
    vaultRelativePath: "1_Projects/PasarLore E-Commerce.md",
    fileSize: 3100,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-lecafe",
    sourceType: "project",
    sourceId: "proj-lecafe",
    title: "LeCafe Hub",
    vaultRelativePath: "1_Projects/LeCafe Hub.md",
    fileSize: 2400,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-simple-todolist",
    sourceType: "project",
    sourceId: "proj-simple-todolist",
    title: "Simple ToDo List",
    vaultRelativePath: "1_Projects/Simple ToDo List.md",
    fileSize: 1950,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-proj-proj-simple-todolist-gemini",
    sourceType: "project",
    sourceId: "proj-simple-todolist-gemini",
    title: "Simple ToDo List Gemini AI",
    vaultRelativePath: "1_Projects/Simple ToDo List Gemini AI.md",
    fileSize: 2850,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-arsitektur-multi-app-dns-ecosystem-leonorekingdom-xyz",
    sourceType: "wiki",
    sourceId: "art-arsitektur-multi-app-dns-ecosystem-leonorekingdom-xyz",
    title: "Arsitektur Multi-App & DNS Ecosystem leonorekingdom.xyz",
    vaultRelativePath: "3_Resources/Architecture/Arsitektur Multi-App & DNS Ecosystem leonorekingdom.xyz.md",
    fileSize: 3200,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-next-js-15-app-router-server-actions-standard",
    sourceType: "wiki",
    sourceId: "art-next-js-15-app-router-server-actions-standard",
    title: "Next.js 15 App Router & Server Actions Standard",
    vaultRelativePath: "3_Resources/Development/Next.js 15 App Router & Server Actions Standard.md",
    fileSize: 2700,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-integrasi-google-gemini-ai-di-aplikasi-web",
    sourceType: "wiki",
    sourceId: "art-integrasi-google-gemini-ai-di-aplikasi-web",
    title: "Integrasi Google Gemini AI di Aplikasi Web",
    vaultRelativePath: "3_Resources/Development/Integrasi Google Gemini AI di Aplikasi Web.md",
    fileSize: 2400,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-turso-libsql-cloud-database-management",
    sourceType: "wiki",
    sourceId: "art-turso-libsql-cloud-database-management",
    title: "Turso LibSQL Cloud & Database Management",
    vaultRelativePath: "3_Resources/Databases/Turso LibSQL Cloud & Database Management.md",
    fileSize: 2500,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-design-system-dark-glassmorphism-tailwind-css",
    sourceType: "wiki",
    sourceId: "art-design-system-dark-glassmorphism-tailwind-css",
    title: "Design System Dark Glassmorphism & Tailwind CSS",
    vaultRelativePath: "3_Resources/Design/Design System Dark Glassmorphism & Tailwind CSS.md",
    fileSize: 2600,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-alur-transaksi-e-commerce-pasarlore-lecafe",
    sourceType: "wiki",
    sourceId: "art-alur-transaksi-e-commerce-pasarlore-lecafe",
    title: "Alur Transaksi & E-Commerce PasarLore & LeCafe",
    vaultRelativePath: "3_Resources/Guides/Alur Transaksi & E-Commerce PasarLore & LeCafe.md",
    fileSize: 2300,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-discord-bot-architecture-leone-dashboard",
    sourceType: "wiki",
    sourceId: "art-discord-bot-architecture-leone-dashboard",
    title: "Discord Bot Architecture & Leone Dashboard",
    vaultRelativePath: "3_Resources/Guides/Discord Bot Architecture & Leone Dashboard.md",
    fileSize: 2200,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
  {
    id: "sync-wiki-art-keamanan-enkripsi-client-side-leonorevault",
    sourceType: "wiki",
    sourceId: "art-keamanan-enkripsi-client-side-leonorevault",
    title: "Keamanan Enkripsi Client-Side LeonoreVault",
    vaultRelativePath: "3_Resources/Guides/Keamanan Enkripsi Client-Side LeonoreVault.md",
    fileSize: 2450,
    lastSyncedAt: "2026-09-04T09:30:00Z",
    syncStatus: "synced",
    direction: "bidirectional",
  },
];

export const MOCK_SYNC_LOGS: SyncLogItem[] = [
  {
    id: "log-1",
    timestamp: "2026-09-02T16:45:00Z",
    action: "full_sync",
    summary: "Sinkronisasi dua arah berhasil selesai untuk 5 berkas Markdown.",
    filesAffected: 5,
    status: "success",
  },
  {
    id: "log-2",
    timestamp: "2026-09-02T12:30:00Z",
    action: "push_to_vault",
    summary: "Memperbarui catatan proyek 'Pengembangan LeonorePortal Suite' ke Vault.",
    filesAffected: 1,
    status: "success",
  },
  {
    id: "log-3",
    timestamp: "2026-09-01T18:15:00Z",
    action: "pull_from_vault",
    summary: "Mengimpor perubahan artikel 'Pedoman Desain Antarmuka' dari Obsidian.",
    filesAffected: 1,
    status: "success",
  },
];