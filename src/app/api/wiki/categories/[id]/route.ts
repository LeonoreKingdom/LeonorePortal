import { NextRequest, NextResponse } from "next/server";
import { WikiService } from "@/lib/services/wiki.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await WikiService.updateCategory(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Kategori tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal memperbarui kategori" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await WikiService.deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Kategori tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Gagal menghapus kategori" }, { status: 500 });
  }
}