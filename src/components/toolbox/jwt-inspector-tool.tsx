"use client";

import { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  KeyRound, 
  AlertTriangle, 
  Calendar,
  Sparkles,
  Info
} from "lucide-react";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMzQ1IiwibmFtZSI6Ikxlb25vcmUgS2luZ2RvbSIsImVtYWlsIjoiYWRtaW5AbGVvbm9yZWtpbmdkb20ueHl6Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzg4MzUzMzM3LCJleHAiOjE4Nzk3ODMzMzd9.27f-XW4_uL3mQ7mYg4K_x1e9X8w1rX5zQ0p9L6vK8mI";

export function JwtInspectorTool() {
  const [jwtToken, setJwtToken] = useState<string>(SAMPLE_JWT);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const parsed = useMemo(() => {
    const raw = jwtToken.trim();
    if (!raw) return { valid: false, error: "Token JWT kosong" };

    const parts = raw.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Format JWT tidak valid. JWT harus terdiri dari 3 bagian yang dipisahkan titik (Header.Payload.Signature)." };
    }

    try {
      const headerJson = JSON.parse(atob(parts[0].replace(/-/g, "+").replace(/_/g, "/")));
      const payloadJson = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      const signature = parts[2];

      const now = Math.floor(Date.now() / 1000);
      const isExpired = payloadJson.exp ? payloadJson.exp < now : false;

      return {
        valid: true,
        header: headerJson,
        payload: payloadJson,
        signature,
        isExpired,
        expDate: payloadJson.exp ? new Date(payloadJson.exp * 1000).toLocaleString("id-ID") : null,
        iatDate: payloadJson.iat ? new Date(payloadJson.iat * 1000).toLocaleString("id-ID") : null,
        nbfDate: payloadJson.nbf ? new Date(payloadJson.nbf * 1000).toLocaleString("id-ID") : null,
        rawHeader: parts[0],
        rawPayload: parts[1],
        rawSignature: parts[2],
      };
    } catch (err: any) {
      return { valid: false, error: `Gagal mendekode base64: ${err.message}` };
    }
  }, [jwtToken]);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* JWT Input Box */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">JSON Web Token (JWT) Inspector</h3>
              <p className="text-xs text-slate-400">Dekode dan periksa claims token otentikasi secara privat di browser</p>
            </div>
          </div>

          <button
            onClick={() => setJwtToken(SAMPLE_JWT)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Muat Contoh Token</span>
          </button>
        </div>

        {/* Textarea Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">Tempel Token JWT (Encoded):</label>
          <textarea
            rows={4}
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value)}
            placeholder="eyJhbGciOi..."
            className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 break-all"
          />
        </div>

        {/* Color Coded Visual String */}
        {parsed.valid && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs break-all leading-relaxed">
            <span className="text-rose-400 font-bold">{parsed.rawHeader}</span>
            <span className="text-slate-500 font-bold">.</span>
            <span className="text-indigo-400 font-bold">{parsed.rawPayload}</span>
            <span className="text-slate-500 font-bold">.</span>
            <span className="text-emerald-400 font-bold">{parsed.rawSignature}</span>
          </div>
        )}
      </div>

      {/* Decoded Content */}
      {parsed.valid ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Decoded JSON Panels (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Box */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Header: Algoritma & Jenis Token
                  </h4>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(parsed.header, null, 2), "header")}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  {copiedSection === "header" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSection === "header" ? "Tersalin" : "Salin JSON"}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
                {JSON.stringify(parsed.header, null, 2)}
              </pre>
            </div>

            {/* Payload Box */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Payload: Data & Claims
                  </h4>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(parsed.payload, null, 2), "payload")}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  {copiedSection === "payload" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSection === "payload" ? "Tersalin" : "Salin JSON"}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                {JSON.stringify(parsed.payload, null, 2)}
              </pre>
            </div>
          </div>

          {/* Claims & Status Summary (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                Status Validitas & Waktu
              </h4>

              {/* Status Badge */}
              <div
                className={`p-4 rounded-2xl border flex items-center gap-3 ${
                  parsed.isExpired
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {parsed.isExpired ? (
                  <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold">
                    {parsed.isExpired ? "Token Telah Kedaluwarsa (Expired)" : "Token Aktif & Valid"}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {parsed.isExpired
                      ? "Claim `exp` telah melewati waktu saat ini"
                      : "Masa berlaku token masih valid untuk digunakan"}
                  </div>
                </div>
              </div>

              {/* Claims Breakdown */}
              <div className="space-y-3 text-xs">
                {parsed.expDate && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-500 font-mono flex items-center justify-between">
                      <span>exp (Expired Time)</span>
                      <span>{parsed.payload.exp}</span>
                    </div>
                    <div className="text-slate-200 font-bold">{parsed.expDate} WIB</div>
                  </div>
                )}

                {parsed.iatDate && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-500 font-mono flex items-center justify-between">
                      <span>iat (Issued At)</span>
                      <span>{parsed.payload.iat}</span>
                    </div>
                    <div className="text-slate-200 font-bold">{parsed.iatDate} WIB</div>
                  </div>
                )}

                {parsed.payload.sub && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-500 font-mono">sub (Subject ID)</div>
                    <div className="text-slate-200 font-mono font-bold">{parsed.payload.sub}</div>
                  </div>
                )}

                {parsed.payload.iss && (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="text-slate-500 font-mono">iss (Issuer)</div>
                    <div className="text-slate-200 font-mono font-bold">{parsed.payload.iss}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-6 text-center text-xs text-rose-400">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-rose-400" />
          <div className="font-bold">{parsed.error}</div>
        </div>
      )}
    </div>
  );
}