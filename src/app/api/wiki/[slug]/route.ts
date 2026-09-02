import { NextRequest, NextResponse } from "next/server";
import { WikiService } from "@/lib/services/wiki.service";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const article = await WikiService.getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: article });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil detail artikel" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const updated = await WikiService.updateArticle(slug, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan untuk diperbarui" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui artikel" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const deleted = await WikiService.deleteArticle(slug);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Artikel berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus artikel" },
      { status: 500 }
    );
  }
}