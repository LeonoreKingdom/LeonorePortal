import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    let hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
    let customHook: string | undefined;

    try {
      const body = await req.json();
      if (body?.hookUrl) {
        customHook = body.hookUrl.trim();
      }
    } catch {
      // Body is optional
    }

    const targetUrl = customHook || hookUrl;

    if (!targetUrl) {
      return NextResponse.json({
        success: false,
        error: "Vercel Deploy Hook URL belum dikonfigurasi. Silakan masukkan Deploy Hook URL di input atau simpan ke environment variable VERCEL_DEPLOY_HOOK_URL.",
      }, { status: 400 });
    }

    // Trigger Vercel webhook
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({ status: "triggered" }));
      return NextResponse.json({
        success: true,
        message: "Build dan deploy Vercel berhasil dipicu!",
        data,
        timestamp: new Date().toISOString(),
      });
    } else {
      const errText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Vercel merespon dengan status ${response.status}: ${errText}`,
      }, { status: 502 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Gagal memicu deployment Vercel",
    }, { status: 500 });
  }
}

export async function GET() {
  const configured = Boolean(process.env.VERCEL_DEPLOY_HOOK_URL);
  return NextResponse.json({
    success: true,
    hasEnvHook: configured,
    vercelProjectUrl: "https://vercel.com/leonorekingdom/leonoreportal",
    liveUrls: [
      "https://portal.leonorekingdom.xyz",
      "https://leonoreportal.vercel.app",
    ],
  });
}