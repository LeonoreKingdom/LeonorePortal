import { NextRequest, NextResponse } from "next/server";
import { WikiService } from "@/lib/services/wiki.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categoryId = searchParams.get("categoryId") || undefined;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: [] });
    }

    const results = await WikiService.searchArticles(q, categoryId, limit);
    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        query: q,
        total: results.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melakukan pencarian artikel" },
      { status: 500 }
    );
  }
}