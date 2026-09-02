import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project.service";

interface RouteContext {
  params: Promise<{ id: string }>;
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
    return NextResponse.json({ success: true, data: project });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil detail proyek" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await ProjectService.updateProject(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Proyek tidak ditemukan untuk diperbarui" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui proyek" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await ProjectService.deleteProject(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Proyek berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus proyek" },
      { status: 500 }
    );
  }
}