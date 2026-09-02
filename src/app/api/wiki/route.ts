import { NextRequest, NextResponse } from "next/server";
import { WikiService } from "@/lib/services/wiki.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const search = searchParams.get("search") || undefined;

    const articles = await WikiService.getAllArticles(categoryId, search);
    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar artikel wiki" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Judul artikel wajib diisi" },
        { status: 400 }
      );
    }

    const created = await WikiService.createArticle(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat artikel wiki" },
      { status: 500 }
    );
  }
}