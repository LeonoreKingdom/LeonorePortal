import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { notesMarkdown } = body;

    const updated = await ProjectService.updateProject(id, { notesMarkdown });
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Catatan proyek berhasil disimpan",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan catatan proyek" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const project = await ProjectService.getProjectById(id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { notesMarkdown: project.notesMarkdown } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil catatan proyek" },
      { status: 500 }
    );
  }
}