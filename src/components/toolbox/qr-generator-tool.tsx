"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Link as LinkIcon, 
  Wifi, 
  Mail, 
  Phone, 
  Type, 
  Sparkles,
  RefreshCw 
} from "lucide-react";

type QrType = "url" | "text" | "wifi" | "email";

export function QrGeneratorTool() {
  const [qrType, setQrType] = useState<QrType>("url");
  const [urlInput, setUrlInput] = useState<string>("https://leonoreportal.internal");
  const [textInput, setTextInput] = useState<string>("Halo dari LeonorePortal!");
  
  // WiFi fields
  const [wifiSsid, setWifiSsid] = useState<string>("Leonore_WiFi");
  const [wifiPass, setWifiPass] = useState<string>("password123");
  const [wifiType, setWifiType] = useState<"WPA" | "WEP" | "nopass">("WPA");

  // Email fields
  const [emailTo, setEmailTo] = useState<string>("admin@leonore.com");
  const [emailSubject, setEmailSubject] = useState<string>("Halo!");
  const [emailBody, setEmailBody] = useState<string>("Pesan Anda di sini...");

  // Styling settings
  const [fgColor, setFgColor] = useState<string>("#ffffff");
  const [bgColor, setBgColor] = useState<string>("#090d16");
  const [qrSize, setQrSize] = useState<number>(300);
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute payload text
  const qrPayload = () => {
    switch (qrType) {
      case "url":
        return urlInput.trim();
      case "text":
        return textInput.trim();
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};;`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      default:
        return urlInput;
    }
  };

  useEffect(() => {
    const payload = qrPayload();
    if (!payload) return;

    QRCode.toDataURL(payload, {
      width: qrSize,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [qrType, urlInput, textInput, wifiSsid, wifiPass, wifiType, emailTo, emailSubject, emailBody, fgColor, bgColor, qrSize, errorCorrection]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qrcode-${qrType}-${Date.now()}.png`;
    a.click();
  };

  const handleCopyImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard.writeText(qrPayload());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Settings & Input */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-5">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "url", label: "Link / URL", icon: LinkIcon },
              { id: "text", label: "Teks Bebas", icon: Type },
              { id: "wifi", label: "WiFi", icon: Wifi },
              { id: "email", label: "Email", icon: Mail },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = qrType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQrType(t.id as any)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 border transition-all text-xs font-semibold ${
                    isActive
                      ? "border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Type-specific Fields */}
          <div className="space-y-3">
            {qrType === "url" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Tautan / Website URL:
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {qrType === "text" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Isi Teks / Pesan:
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ketik teks pesan..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>
            )}

            {qrType === "wifi" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Jaringan (SSID):
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Kata Sandi WiFi:
                  </label>
                  <input
                    type="password"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {qrType === "email" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Alamat Email:
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Subjek Email:
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color & Styling Customization */}
          <div className="pt-2 border-t border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Kustomisasi Tampilan
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Warna Kode (Depan)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-slate-800 bg-slate-950 p-1"
                  />
                  <span className="text-xs font-mono text-slate-200">{fgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Warna Latar (Background)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-12 cursor-pointer rounded-lg border border-slate-800 bg-slate-950 p-1"
                  />
                  <span className="text-xs font-mono text-slate-200">{bgColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Preview & Download */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-5 text-center">
          <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
            Pratinjau QR Code
          </h3>

          <div className="flex items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="rounded-xl shadow-lg max-h-56 object-contain"
              />
            ) : (
              <div className="h-48 w-48 flex items-center justify-center text-xs text-slate-500">
                Membuat QR Code...
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleDownloadPng}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 p-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Unduh Gambar QR (PNG)</span>
            </button>

            <button
              onClick={handleCopyImage}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 p-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Tersalin!" : "Salin QR / Data"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}