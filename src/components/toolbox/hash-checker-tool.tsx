"use client";

import { useState, ChangeEvent } from "react";
import { 
  Hash, 
  Upload, 
  Copy, 
  Check, 
  ShieldCheck, 
  ShieldAlert, 
  FileText, 
  Sparkles,
  RotateCcw
} from "lucide-react";

// Lightweight MD5 implementation in pure JS
function md5(string: string | ArrayBuffer): string {
  function md5cycle(x: any, k: any) {
    var a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }
  function cmn(q: any, a: any, b: any, x: any, s: any, t: any) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: any, b: any, c: any, d: any, x: any, s: any, t: any) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: any, b: any) {
    return (a + b) & 0xffffffff;
  }
  function md51(s: any) {
    var txt = "";
    var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878],
      i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }
  function md5blk(s: any) {
    var md5blks = [],
      i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  var hex_chr = "0123456789abcdef".split("");
  function rhex(n: any) {
    var s = "",
      j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
    return s;
  }
  function hex(x: any) {
    for (var i = 0; i < x.length; i++) x[i] = rhex(x[i]);
    return x.join("");
  }
  const str = typeof string === "string" ? string : new TextDecoder().decode(string);
  return hex(md51(str));
}

export function HashCheckerTool() {
  const [inputText, setInputText] = useState("LeonorePortal - Zero-trust offline web tool");
  const [fileName, setFileName] = useState("");
  const [hashes, setHashes] = useState<{ sha256: string; sha512: string; sha1: string; md5: string }>({
    sha256: "",
    sha512: "",
    sha1: "",
    md5: "",
  });
  const [verifyTarget, setVerifyTarget] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const calculateHashes = async (buffer: ArrayBuffer) => {
    const toHex = (buf: ArrayBuffer) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    const [sha256Buf, sha512Buf, sha1Buf] = await Promise.all([
      crypto.subtle.digest("SHA-256", buffer),
      crypto.subtle.digest("SHA-512", buffer),
      crypto.subtle.digest("SHA-1", buffer),
    ]);

    const md5Hash = md5(buffer);

    setHashes({
      sha256: toHex(sha256Buf),
      sha512: toHex(sha512Buf),
      sha1: toHex(sha1Buf),
      md5: md5Hash,
    });
  };

  const handleTextChange = async (text: string) => {
    setInputText(text);
    setFileName("");
    if (!text) {
      setHashes({ sha256: "", sha512: "", sha1: "", md5: "" });
      return;
    }
    const encoder = new TextEncoder();
    await calculateHashes(encoder.encode(text).buffer as ArrayBuffer);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    setInputText("");
    const buffer = await file.arrayBuffer();
    await calculateHashes(buffer);
  };

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Compare verify target
  const cleanTarget = verifyTarget.trim().toLowerCase();
  const matchAlgorithm = Object.entries(hashes).find(
    ([algo, val]) => val && val.toLowerCase() === cleanTarget
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">File & Text Hash Checker</h2>
            <p className="text-xs text-slate-400">Hitung checksum SHA-256, SHA-512, SHA-1, dan MD5 untuk verifikasi integritas berkas</p>
          </div>
        </div>

        <label className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-md self-start sm:self-auto">
          <Upload className="h-4 w-4" />
          <span>Periksa Berkas Lokal</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Input Text or File notice */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>{fileName ? `Berkas Aktif: ${fileName}` : "Input Teks Langsung"}</span>
          {fileName && (
            <button
              onClick={() => handleTextChange("LeonorePortal")}
              className="text-indigo-400 hover:underline text-xs"
            >
              Kembali ke Mode Teks
            </button>
          )}
        </div>

        {!fileName && (
          <textarea
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Ketik atau tempel teks di sini untuk dihitung hash checksum-nya..."
            rows={3}
            className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none resize-none"
          />
        )}
      </div>

      {/* Verify / Compare Checksum Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
        <label className="text-xs font-semibold text-slate-300 block">
          Verifikasi Nilai Checksum (Tempel Hash dari situs penyedia untuk mencocokkan)
        </label>
        <div className="relative">
          <input
            type="text"
            value={verifyTarget}
            onChange={(e) => setVerifyTarget(e.target.value)}
            placeholder="Tempel hash checksum yang diharapkan di sini..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-2.5 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
          {cleanTarget && (
            <div className="mt-2">
              {matchAlgorithm ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <ShieldCheck className="h-4 w-4" />
                  <span>COCOK & TERVERIFIKASI! Nilai hash cocok sempurna dengan {matchAlgorithm[0].toUpperCase()}.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-rose-400 font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Hash tidak cocok dengan algoritma apa pun. Berkas mungkin telah dimodifikasi atau rusak.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hashes List */}
      <div className="grid grid-cols-1 gap-4">
        {[
          { key: "sha256", label: "SHA-256 (Standar Keamanan Tinggi)", val: hashes.sha256 },
          { key: "sha512", label: "SHA-512", val: hashes.sha512 },
          { key: "sha1", label: "SHA-1 (Legacy)", val: hashes.sha1 },
          { key: "md5", label: "MD5 (Integritas Cepat)", val: hashes.md5 },
        ].map((h) => (
          <div
            key={h.key}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 hover:border-slate-700 transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-300">{h.label}</span>
              <button
                onClick={() => handleCopy(h.key, h.val)}
                disabled={!h.val}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors disabled:opacity-30"
              >
                {copiedKey === h.key ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 break-all select-all border border-slate-800">
              {h.val || <span className="text-slate-600 italic">menghitung...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
