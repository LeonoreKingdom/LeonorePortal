"use client";

import { useState } from "react";
import { 
  TableProperties, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Search, 
  Copy, 
  Check, 
  ArrowUpDown,
  FileCode,
  FileText
} from "lucide-react";

export function SpreadsheetConverterTool() {
  const [headers, setHeaders] = useState<string[]>(["ID", "Nama Produk", "Kategori", "Harga", "Stok"]);
  const [rows, setRows] = useState<string[][]>([
    ["1", "Laptop Pro 16", "Elektronik", "18500000", "12"],
    ["2", "Mechanical Keyboard", "Aksesoris", "1250000", "45"],
    ["3", "Wireless Mouse", "Aksesoris", "450000", "80"],
    ["4", "Monitor 4K IPS", "Elektronik", "5400000", "8"],
    ["5", "USB-C Hub 7-in-1", "Aksesoris", "350000", "30"],
  ]);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [delimiter, setDelimiter] = useState<"," | ";" | "\t" | "|">(",");
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    parseDelimitedText(text);
  };

  const parseDelimitedText = (content: string) => {
    const lines = content.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return;

    // Detect delimiter if comma or semicolon
    let activeDelim = delimiter;
    if (lines[0].includes(";") && !lines[0].includes(",")) activeDelim = ";";
    else if (lines[0].includes("\t")) activeDelim = "\t";

    const parsedHeaders = lines[0].split(activeDelim).map((h) => h.replace(/^["']|["']$/g, "").trim());
    const parsedRows = lines.slice(1).map((line) =>
      line.split(activeDelim).map((c) => c.replace(/^["']|["']$/g, "").trim())
    );

    setHeaders(parsedHeaders);
    setRows(parsedRows);
  };

  const exportAsCsv = () => {
    const csvContent = [
      headers.join(delimiter),
      ...rows.map((r) => r.join(delimiter)),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_tabel.csv";
    a.click();
  };

  const exportAsXls = () => {
    // Generate standard Excel XML spreadsheet
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head><body>
      <table border="1">
        <tr>${headers.map((h) => `<th style="background:#6366f1;color:#fff;font-weight:bold;">${h}</th>`).join("")}</tr>
        ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
      </table>
      </body></html>
    `;
    const blob = new Blob([tableHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_tabel.xls";
    a.click();
  };

  const exportAsJson = () => {
    const jsonArr = rows.map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] || "";
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(jsonArr, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data_tabel.json";
    a.click();
  };

  const copyAsMarkdown = () => {
    const md = [
      `| ${headers.join(" | ")} |`,
      `| ${headers.map(() => "---").join(" | ")} |`,
      ...rows.map((r) => `| ${r.join(" | ")} |`),
    ].join("\n");

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRows = rows.filter((r) =>
    searchFilter ? r.some((c) => c.toLowerCase().includes(searchFilter.toLowerCase())) : true
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Spreadsheet & Table Converter</h3>
              <p className="text-xs text-slate-400">Unggah berkas CSV/Excel, tinjau, dan ekspor ke format pilihan</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Impor Berkas (CSV/XLS)</span>
              <input type="file" accept=".csv, .tsv, .txt, .xls, .xlsx" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={exportAsXls}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Ekspor Excel (.xls)</span>
            </button>

            <button
              onClick={exportAsCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={exportAsJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-all"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Ekspor JSON</span>
            </button>

            <button
              onClick={copyAsMarkdown}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Tersalin!" : "Salin Markdown"}</span>
            </button>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari data dalam tabel..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-8 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Total Baris: <b className="text-white">{rows.length}</b></span>
            <span>•</span>
            <span>Kolom: <b className="text-white">{headers.length}</b></span>
          </div>
        </div>
      </div>

      {/* Interactive Table View */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-950/95 backdrop-blur border-b border-slate-800 z-10">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-400 w-12 text-center">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="py-3 px-4 font-bold text-indigo-300">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 text-center text-slate-500">{rIdx + 1}</td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-4 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}