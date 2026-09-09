"use client";

import { useState, useMemo } from "react";
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  FileSpreadsheet, 
  FileJson,
  Sliders
} from "lucide-react";

type SchemaType = "users" | "products" | "transactions";
type OutputFormat = "json" | "csv";

const FIRST_NAMES = ["Budi", "Siti", "Ahmad", "Dewi", "Rian", "Anisa", "Eko", "Maya", "Fajar", "Lestari", "Reza", "Putri"];
const LAST_NAMES = ["Santoso", "Wijaya", "Kusuma", "Pratama", "Hidayat", "Saputra", "Utami", "Nugroho", "Wulandari", "Siregar"];
const CITIES = ["Jakarta", "Surabaya", "Bandung", "Medan", "Yogyakarta", "Semarang", "Denpasar", "Makassar"];
const DOMAINS = ["gmail.com", "leonore.id", "outlook.com", "yahoo.com", "perusahaan.co.id"];
const ROLES = ["Admin", "Editor", "Viewer", "Billing Manager", "Developer"];
const STATUSES = ["active", "pending", "suspended", "inactive"];

const PRODUCT_NAMES = ["Mechanical Keyboard RGB", "Ergonomic Mesh Chair", "UltraWide 34 Monitor", "Wireless Gaming Mouse", "Noise-Cancelling Headphones", "USB-C GaN 65W Charger", "Aluminium Laptop Stand", "Webcam 4K HDR Pro"];
const CATEGORIES = ["Electronics", "Furniture", "Accessories", "Audio", "Hardware"];

export function MockDataGeneratorTool() {
  const [schema, setSchema] = useState<SchemaType>("users");
  const [count, setCount] = useState<number>(10);
  const [format, setFormat] = useState<OutputFormat>("json");
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(1);

  const generateData = useMemo(() => {
    const records = [];
    for (let i = 1; i <= count; i++) {
      if (schema === "users") {
        const fn = FIRST_NAMES[(i * 3 + seed) % FIRST_NAMES.length];
        const ln = LAST_NAMES[(i * 7 + seed) % LAST_NAMES.length];
        const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@${DOMAINS[(i + seed) % DOMAINS.length]}`;
        records.push({
          id: i,
          uuid: `usr_${Math.random().toString(36).substring(2, 9)}`,
          name: `${fn} ${ln}`,
          email,
          role: ROLES[(i + seed) % ROLES.length],
          city: CITIES[(i * 2 + seed) % CITIES.length],
          status: STATUSES[(i + seed) % STATUSES.length],
          createdAt: new Date(Date.now() - (i * 86400000 * 2)).toISOString().split("T")[0],
        });
      } else if (schema === "products") {
        const title = PRODUCT_NAMES[(i + seed) % PRODUCT_NAMES.length];
        const category = CATEGORIES[(i + seed) % CATEGORIES.length];
        const price = Math.round((50000 + ((i * 123456 + seed * 999) % 3500000)) / 1000) * 1000;
        records.push({
          id: i,
          sku: `SKU-${1000 + i}`,
          title,
          category,
          price,
          currency: "IDR",
          stock: (i * 13 + seed) % 150 + 5,
          rating: Number((3.8 + ((i * 17) % 13) / 10).toFixed(1)),
          inStock: ((i + seed) % 5 !== 0),
        });
      } else {
        const types = ["credit", "debit", "transfer", "refund"];
        const txStatus = ["completed", "completed", "completed", "failed", "pending"];
        records.push({
          id: i,
          txHash: `tx_${Math.random().toString(36).substring(2, 12)}`,
          amount: Math.round((25000 + ((i * 77777 + seed * 500) % 5000000)) / 500) * 500,
          currency: "IDR",
          type: types[(i + seed) % types.length],
          status: txStatus[(i + seed) % txStatus.length],
          paymentMethod: ["QRIS", "BCA Virtual Account", "Mandiri Transfer", "Credit Card"][(i + seed) % 4],
          timestamp: new Date(Date.now() - (i * 3600000 * 4)).toISOString(),
        });
      }
    }
    return records;
  }, [schema, count, seed]);

  const outputString = useMemo(() => {
    if (format === "json") {
      return JSON.stringify(generateData, null, 2);
    }
    if (generateData.length === 0) return "";
    const headers = Object.keys(generateData[0]);
    const csvRows = [headers.join(",")];
    for (const row of generateData) {
      const values = headers.map((header) => {
        const val = (row as any)[header];
        const escaped = ("" + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  }, [generateData, format]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const mime = format === "json" ? "application/json" : "text/csv";
    const blob = new Blob([outputString], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock_${schema}_${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mock Data Generator</h2>
              <p className="text-xs text-slate-400">Hasilkan data dummy realistis untuk testing database & prototipe aplikasi</p>
            </div>
          </div>

          <button
            onClick={() => setSeed((s) => s + 1)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Acak Ulang Data
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Preset Schema */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Kategori Skema Data</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["users", "products", "transactions"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSchema(s)}
                  className={`py-2 px-1 text-xs rounded-xl font-medium border transition-colors capitalize text-center ${
                    schema === s
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {s === "users" ? "Pengguna" : s === "products" ? "Produk" : "Transaksi"}
                </button>
              ))}
            </div>
          </div>

          {/* Record Count */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Jumlah Baris: {count}</label>
            <div className="flex items-center gap-2">
              {[5, 10, 25, 50, 100].map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`flex-1 py-2 text-xs rounded-xl font-medium border transition-colors ${
                    count === c
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Export Format */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Format Berkas</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat("json")}
                className={`py-2 px-3 text-xs rounded-xl font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                  format === "json"
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <FileJson className="h-3.5 w-3.5" /> JSON
              </button>
              <button
                onClick={() => setFormat("csv")}
                className={`py-2 px-3 text-xs rounded-xl font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                  format === "csv"
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Output / Preview */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Pratinjau ({count} baris &bull; ~{Math.round(outputString.length / 1024 * 10) / 10} KB)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin {format.toUpperCase()}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Unduh .{format}
            </button>
          </div>
        </div>

        <pre className="w-full max-h-[420px] overflow-auto rounded-2xl bg-slate-950/90 p-4 border border-slate-800/80 text-xs font-mono text-slate-300 leading-relaxed select-all">
          {outputString}
        </pre>
      </div>
    </div>
  );
}
