import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, favicon, auth endpoints, and root "/"
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("leonore_session")?.value;

  if (!session) {
    // If it is an API request, return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "401 Unauthorized: Invalid Credentials" },
        { status: 401 }
      );
    }

    // For page requests, return 401 HTML error page
    const errorHtml = `<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>401 - Akses Ditolak | LeonorePortal</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased selection:bg-rose-500 selection:text-white">
  <div class="w-full max-w-lg rounded-3xl border border-rose-500/30 bg-slate-900/90 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6">
    <div class="flex justify-center">
      <div class="h-16 w-16 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    </div>

    <div class="space-y-2">
      <div class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 px-3.5 py-1 text-[11px] font-mono font-semibold text-rose-300">
        401 Unauthorized • Invalid Credentials
      </div>
      <h2 class="text-xl sm:text-2xl font-extrabold text-white">
        Akses Ditolak: Kredensial Tidak Valid
      </h2>
      <p class="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
        Anda belum terautentikasi atau sesi login tidak valid untuk mengakses halaman yang diminta:
      </p>
      <div class="inline-block rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-1.5 font-mono text-xs text-indigo-300">
        ${pathname}
      </div>
    </div>

    <p class="text-xs text-slate-500">
      Sistem mendeteksi upaya akses tanpa otentikasi yang sah. Silakan login terlebih dahulu melalui halaman utama.
    </p>

    <div class="pt-4 border-t border-slate-800/80 flex justify-center">
      <a
        href="/"
        class="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/30 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <span>Menuju Halaman Login</span>
      </a>
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(errorHtml, {
      status: 401,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};