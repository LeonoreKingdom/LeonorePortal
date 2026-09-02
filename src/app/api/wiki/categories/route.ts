import { NextRequest, NextResponse } from "next/server";
import { WikiService } from "@/lib/services/wiki.service";

export async function GET() {
  try {
    const categories = await WikiService.getAllCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar kategori" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const created = await WikiService.createCategory(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat kategori" },
      { status: 500 }
    );
  }
}