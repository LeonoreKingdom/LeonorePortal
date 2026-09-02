import { NextRequest, NextResponse } from "next/server";
import { TaskService } from "@/lib/services/task.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Parameter projectId wajib disertakan" },
        { status: 400 }
      );
    }

    const tasks = await TaskService.getTasksByProjectId(projectId);
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil daftar tugas" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, ...taskData } = body;

    if (!projectId || !taskData.title) {
      return NextResponse.json(
        { success: false, error: "projectId dan judul tugas wajib diisi" },
        { status: 400 }
      );
    }

    const created = await TaskService.createTask(projectId, taskData);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membuat tugas" },
      { status: 500 }
    );
  }
}