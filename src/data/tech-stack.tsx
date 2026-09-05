import React from "react";

export interface TechStackItem {
  id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "cloud" | "ai" | "other";
  color: string;
  bg: string;
  border: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

export const TECH_STACK_LIST: TechStackItem[] = [
  {
    id: "nextjs",
    name: "Next.js",
    category: "frontend",
    color: "#ffffff",
    bg: "bg-white/10",
    border: "border-white/20",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 180 180" fill="none" className={className}>
        <mask id="mask0_next" maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180" style={{ maskType: "alpha" }}>
          <circle cx="90" cy="90" r="90" fill="black" />
        </mask>
        <g mask="url(#mask0_next)">
          <circle cx="90" cy="90" r="90" fill="black" />
          <path d="M149.508 157.438L69.1478 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.137 149.508 157.438Z" fill="white" />
          <rect x="115" y="54" width="12" height="72" fill="white" />
        </g>
      </svg>
    ),
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "database",
    color: "#3ecf8e",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L.367 13.914a.792.792 0 0 0 .616 1.282H12v8.958a.396.396 0 0 0 .716.233l10.917-13.75a.792.792 0 0 0-.616-1.282z" fill="#3ecf8e" />
      </svg>
    ),
  },
  {
    id: "astro",
    name: "Astro",
    category: "frontend",
    color: "#ff5d01",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M8.5 18.5a4.5 4.5 0 0 1-3.5-1.5c-1-1.3-1-3.5 0-5.5L8.5 4l3.5 7.5c1 2 1 4.2 0 5.5a4.5 4.5 0 0 1-3.5 1.5z" fill="#ff5d01" />
        <path d="M15.5 18.5a4.5 4.5 0 0 0 3.5-1.5c1-1.3 1-3.5 0-5.5L15.5 4 12 11.5c-1 2-1 4.2 0 5.5a4.5 4.5 0 0 0 3.5 1.5z" fill="#bc52ee" />
        <circle cx="12" cy="17" r="1.5" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: "react",
    name: "React",
    category: "frontend",
    color: "#61dafb",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" className={className}>
        <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </svg>
    ),
  },
  {
    id: "typescript",
    name: "TypeScript",
    category: "frontend",
    color: "#3178c6",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 128 128" fill="none" className={className}>
        <rect width="128" height="128" rx="16" fill="#3178c6" />
        <path d="M57.6 98.4c-4.8 0-9.2-1-13.2-3.1-4-2.1-7.2-5.1-9.5-9.1l8.5-5.2c3 4.8 7.8 7.3 14.3 7.3 3.9 0 7-.9 9.1-2.6 2.1-1.7 3.2-3.9 3.2-6.5 0-2.4-.9-4.3-2.6-5.8-1.7-1.5-4.5-2.8-8.4-4-5.3-1.6-9.6-3.4-12.8-5.4-3.2-2-5.7-4.5-7.3-7.5-1.6-3-2.4-6.6-2.4-10.8 0-4.6 1.2-8.7 3.7-12.3 2.5-3.6 5.9-6.4 10.4-8.4s9.6-3 15.4-3c5.3 0 10 1.1 14.2 3.4 4.1 2.3 7.3 5.4 9.4 9.5l-8.7 5.2c-3.1-4.7-7.8-7-14.3-7-3.6 0-6.4.8-8.4 2.3-2 1.5-3 3.5-3 6 0 2.2.8 4 2.4 5.4s4.4 2.6 8.3 3.8c5.4 1.7 9.8 3.5 13.1 5.6s5.8 4.6 7.4 7.6c1.6 3 2.5 6.7 2.5 11 0 4.8-1.3 9-3.9 12.7-2.6 3.7-6.2 6.6-10.9 8.7s-10.1 3.2-16.2 3.2zM98.4 97.2V44.4H83.8V35h44.4v9.4h-14.6v52.8z" fill="white" />
      </svg>
    ),
  },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    category: "frontend",
    color: "#38bdf8",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" fill="#38bdf8" />
      </svg>
    ),
  },
  {
    id: "vue",
    name: "Vue.js",
    category: "frontend",
    color: "#42b883",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M24 1.61H19.5L12 14.61 4.5 1.61H0L12 22.39 24 1.61z" fill="#42b883"/>
        <path d="M19.5 1.61H15L12 6.8 9 1.61H4.5L12 14.61 19.5 1.61z" fill="#35495e"/>
      </svg>
    ),
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "backend",
    color: "#68a063",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2l10 5.8v11.6L12 22 2 16.6V4.8L12 2z" stroke="#68a063" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M12 6v12M7 9l5 3 5-3" stroke="#68a063" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "python",
    name: "Python",
    category: "backend",
    color: "#3776ab",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M11.91 2c-3.1 0-5.1.7-5.1 3.5v2.6h5.3v.8H4.6C2 8.9 2 11.2 2 13.9c0 2.8 1.9 4.3 4.5 4.3h1.7v-2.4c0-2.4 2-4.4 4.5-4.4h5.2c.7 0 1.2-.5 1.2-1.2V5.5C19.1 2.7 15.1 2 11.91 2zM9.5 4.2a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" fill="#3776ab"/>
        <path d="M12.09 22c3.1 0 5.1-.7 5.1-3.5v-2.6h-5.3v-.8h7.5c2.6 0 2.6-2.3 2.6-5 0-2.8-1.9-4.3-4.5-4.3h-1.7v2.4c0 2.4-2 4.4-4.5 4.4H6.1c-.7 0-1.2.5-1.2 1.2v4.7c0 2.8 4 3.5 7.19 3.5zm2.41-2.2a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z" fill="#ffd43b"/>
      </svg>
    ),
  },
  {
    id: "docker",
    name: "Docker",
    category: "devops",
    color: "#2496ed",
    bg: "bg-sky-500/10",
    border: "border-sky-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M2.5 12.5C2.5 17 6 20.5 12 20.5c7.5 0 9.8-5.3 9.8-8.2 0-.2-.1-.3-.2-.3-.6-.3-2.1-.3-3.2.6-.3-1.6-1.5-2.6-3.1-2.6h-5.8c-.2 0-.4.2-.4.4v2.1H2.5z" fill="#2496ed"/>
        <rect x="5.5" y="8.5" width="2" height="2" rx=".3" fill="#2496ed"/>
        <rect x="8.5" y="8.5" width="2" height="2" rx=".3" fill="#2496ed"/>
        <rect x="8.5" y="5.5" width="2" height="2" rx=".3" fill="#2496ed"/>
        <rect x="11.5" y="8.5" width="2" height="2" rx=".3" fill="#2496ed"/>
        <rect x="11.5" y="5.5" width="2" height="2" rx=".3" fill="#2496ed"/>
        <rect x="14.5" y="8.5" width="2" height="2" rx=".3" fill="#2496ed"/>
      </svg>
    ),
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "database",
    color: "#336791",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2C7 2 4 4.5 4 8c0 2.2 1.3 4 3 5.3V18c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.7c1.7-1.3 3-3.1 3-5.3 0-3.5-3-6-8-6z" fill="#336791"/>
      </svg>
    ),
  },
  {
    id: "turso",
    name: "Turso / SQLite",
    category: "database",
    color: "#4ff8d2",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <ellipse cx="12" cy="6" rx="9" ry="3" stroke="#4ff8d2" strokeWidth="2" fill="none"/>
        <path d="M3 6v6c0 1.66 4.03 3 9 3s9-1.34 9-3V6" stroke="#4ff8d2" strokeWidth="2" fill="none"/>
        <path d="M3 12v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" stroke="#4ff8d2" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    category: "cloud",
    color: "#f38020",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M18.8 10.2c-.3-2.6-2.6-4.7-5.3-4.7-2.3 0-4.2 1.4-5 3.4-.6-.4-1.3-.6-2-.6-2.1 0-3.8 1.7-3.8 3.8 0 .4.1.8.2 1.1C1.2 13.8 0 15.3 0 17.2 0 19.3 1.7 21 3.8 21h15c2.9 0 5.2-2.3 5.2-5.2 0-2.8-2.2-5.1-5.2-5.6z" fill="#f38020"/>
      </svg>
    ),
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "cloud",
    color: "#ffffff",
    bg: "bg-white/10",
    border: "border-white/20",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2L24 22H0L12 2Z" />
      </svg>
    ),
  },
  {
    id: "openai",
    name: "OpenAI / AI",
    category: "ai",
    color: "#10a37f",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.259 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7466-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464z" />
      </svg>
    ),
  },
  {
    id: "redis",
    name: "Redis",
    category: "database",
    color: "#dc382d",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 3L2 8l10 5 10-5-10-5z" fill="#dc382d"/>
        <path d="M2 12l10 5 10-5" stroke="#dc382d" strokeWidth="2"/>
        <path d="M2 16l10 5 10-5" stroke="#dc382d" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: "graphql",
    name: "GraphQL",
    category: "backend",
    color: "#e535ab",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" stroke="#e535ab" strokeWidth="2" fill="none"/>
        <circle cx="12" cy="12" r="3" fill="#e535ab"/>
      </svg>
    ),
  },
  {
    id: "prisma",
    name: "Prisma",
    category: "database",
    color: "#2d3748",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M3.75 19.5L12 3l8.25 16.5H3.75z" stroke="#00c853" strokeWidth="2" fill="none"/>
      </svg>
    ),
  },
  {
    id: "golang",
    name: "Golang",
    category: "backend",
    color: "#00add8",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="9" cy="12" r="5" stroke="#00add8" strokeWidth="2"/>
        <circle cx="15" cy="12" r="5" stroke="#00add8" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: "laravel",
    name: "Laravel",
    category: "backend",
    color: "#ff2d20",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    icon: ({ className = "h-3.5 w-3.5" }) => (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" stroke="#ff2d20" strokeWidth="2" fill="none"/>
      </svg>
    ),
  }
];

export function findTechStack(name: string): TechStackItem | undefined {
  const normalized = name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  return TECH_STACK_LIST.find((item) => {
    const itemNorm = item.name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
    return itemNorm === normalized || item.id === normalized;
  });
}

export function TechBadge({ name }: { name: string }) {
  const match = findTechStack(name);

  if (!match) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-950 px-2 py-0.5 text-[10px] sm:text-[11px] font-mono text-slate-400 border border-slate-800">
        <span className="text-slate-500">#</span>
        <span>{name}</span>
      </span>
    );
  }

  const Icon = match.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border ${match.bg} ${match.border}`}
      style={{ color: match.color }}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{match.name}</span>
    </span>
  );
}