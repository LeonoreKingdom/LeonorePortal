import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { vaultPath } = body;

    if (!vaultPath || typeof vaultPath !== "string") {
      return NextResponse.json(
        { success: false, error: "Path direktori vault wajib disertakan" },
        { status: 400 }
      );
    }

    const normalizedPath = path.normalize(vaultPath);

    // Check directory existence
    if (!fs.existsSync(normalizedPath)) {
      return NextResponse.json({
        success: false,
        error: "Direktori tidak ditemukan di sistem lokal",
        data: { exists: false },
      });
    }

    const stat = fs.statSync(normalizedPath);
    if (!stat.isDirectory()) {
      return NextResponse.json({
        success: false,
        error: "Path yang dipilih bukan merupakan direktori folder",
        data: { isDirectory: false },
      });
    }

    // Check .obsidian folder & count markdown files
    const entries = fs.readdirSync(normalizedPath);
    const hasObsidianFolder = entries.includes(".obsidian");
    const mdFiles = entries.filter((e) => e.endsWith(".md")).length;

    return NextResponse.json({
      success: true,
      message: "Koneksi ke direktori Vault Obsidian valid",
      data: {
        vaultPath: normalizedPath,
        exists: true,
        hasObsidianFolder,
        directMarkdownFiles: mdFiles,
        totalEntries: entries.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menguji direktori vault" },
      { status: 500 }
    );
  }
}