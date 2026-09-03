import { NextRequest, NextResponse } from "next/server";
import { PortalCategoryService } from "@/lib/services/portal-category.service";

export async function GET() {
  try {
    const categories = await PortalCategoryService.getAllCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil kategori portal." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    const created = await PortalCategoryService.createCategory({
      name: body.name.trim(),
      color: body.color || "#6366f1",
      sortOrder: Number(body.sortOrder || 0),
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat kategori baru." },
      { status: 400 }
    );
  }
}