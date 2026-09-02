import { NextRequest, NextResponse } from "next/server";
import { ProjectService } from "@/lib/services/project.service";

export async function GET() {
  try {
    const projects = await ProjectService.getAllProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar proyek" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: "Judul proyek wajib diisi" },
        { status: 400 }
      );
    }
    const created = await ProjectService.createProject(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat proyek" },
      { status: 500 }
    );
  }
}