import { NextResponse } from "next/server";
import { ensureDbInitialized } from "@/lib/db";

export async function GET() {
  try {
    const startTime = Date.now();
    const db = await ensureDbInitialized();

    const [appsRes, projRes, taskRes, wikiRes, catRes] = await Promise.all([
      db.execute("SELECT count(*) as count FROM portal_apps"),
      db.execute("SELECT count(*) as count FROM projects"),
      db.execute("SELECT count(*) as count FROM tasks"),
      db.execute("SELECT count(*) as count FROM wiki_articles"),
      db.execute("SELECT count(*) as count FROM wiki_categories"),
    ]);

    const latencyMs = Date.now() - startTime;
    const dbUrl = process.env.TURSO_DATABASE_URL || "file:data/leonore.db";
    const isTurso = dbUrl.startsWith("libsql://");

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          apps: Number(appsRes.rows[0]?.count || 0),
          projects: Number(projRes.rows[0]?.count || 0),
          tasks: Number(taskRes.rows[0]?.count || 0),
          wikiArticles: Number(wikiRes.rows[0]?.count || 0),
          wikiCategories: Number(catRes.rows[0]?.count || 0),
        },
        database: {
          type: isTurso ? "Turso LibSQL (Cloud Edge)" : "Local SQLite",
          connected: true,
          latencyMs,
          urlHost: isTurso ? dbUrl.replace("libsql://", "").split("/")[0] : "local",
        },
        environment: process.env.NODE_ENV || "production",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal mengambil statistik sistem",
        database: { connected: false },
      },
      { status: 500 }
    );
  }
}