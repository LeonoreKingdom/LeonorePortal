"use client";

import { useState, useMemo } from "react";
import { 
  Receipt, 
  Printer, 
  Plus, 
  Trash2, 
  Sparkles, 
  Building2, 
  User, 
  DollarSign
} from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export function InvoiceGeneratorTool() {
  const [invoiceNumber, setInvoiceNumber] = useState("INV-2026-001");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [currency, setCurrency] = useState<"IDR" | "USD" | "EUR">("IDR");

  // Sender details
  const [fromName, setFromName] = useState("Leonore Studio");
  const [fromEmail, setFromEmail] = useState("billing@leonore.id");
  const [fromAddress, setFromAddress] = useState("Jakarta Selatan, Indonesia");
  const [bankInfo, setBankInfo] = useState("BCA: 123-456-7890 a/n Leonore Studio");

  // Client details
  const [toName, setToName] = useState("PT Klien Nusantara");
  const [toEmail, setToEmail] = useState("finance@kliennusantara.co.id");
  const [toAddress, setToAddress] = useState("Sudirman Central Business District, Jakarta");

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "Pengembangan Frontend Web Portal Next.js", quantity: 1, rate: 12000000 },
    { id: "2", description: "Desain UI/UX & Prototipe Interaktif Figma", quantity: 1, rate: 4500000 },
    { id: "3", description: "Setup Cloud Infrastructure & Domain SSL", quantity: 1, rate: 1500000 },
  ]);

  const [taxRate, setTaxRate] = useState<number>(11); // PPN 11%
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState("Terima kasih atas kerja sama Anda. Pembayaran jatuh tempo dalam 14 hari.");

  const formatCurrency = (amount: number) => {
    if (currency === "IDR") {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
    }
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  const subtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.quantity * it.rate), 0);
  }, [items]);

  const taxAmount = (subtotal * taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - discount);

  const addItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), description: "Item Baru", quantity: 1, rate: 1000000 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((it) => it.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: val } : it)));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Invoice Generator & PDF</h2>
            <p className="text-xs text-slate-400">Buat faktur profesional dengan rincian pajak, diskon, dan cetak/unduh PDF</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 focus:outline-none"
          >
            <option value="IDR">Mata Uang: IDR (Rp)</option>
            <option value="USD">Mata Uang: USD ($)</option>
            <option value="EUR">Mata Uang: EUR (€)</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors flex items-center gap-2 shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Paper Frame */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-10 shadow-2xl backdrop-blur-md print:border-0 print:bg-white print:p-0 print:text-black print:shadow-none max-w-4xl mx-auto">
        {/* Top bar: Title & Invoice Meta */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-800 pb-8 print:border-slate-300">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white print:text-black tracking-tight uppercase">FAKTUR / INVOICE</h1>
            <p className="text-xs text-emerald-400 print:text-emerald-700 font-semibold mt-1">LUNAS PADA SAAT JATUH TEMPO</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs w-full sm:w-auto">
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Nomor Faktur</span>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="bg-transparent text-white print:text-black font-semibold border-b border-slate-700 focus:border-emerald-500 focus:outline-none w-28"
              />
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Tanggal Terbit</span>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="bg-transparent text-white print:text-black font-semibold border-b border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">Jatuh Tempo</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-rose-400 print:text-rose-700 font-semibold border-b border-slate-700 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sender & Receiver Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 text-xs">
          {/* From */}
          <div className="space-y-1.5 rounded-2xl bg-slate-950/60 print:bg-slate-50 p-4 border border-slate-800 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-500 font-bold uppercase text-[10px] block">Diterbitkan Oleh (Pengirim)</span>
            <input
              type="text"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-white print:text-black focus:outline-none"
              placeholder="Nama Perusahaan / Freelancer"
            />
            <input
              type="text"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              className="w-full bg-transparent text-slate-300 print:text-slate-700 focus:outline-none"
              placeholder="Email pengirim"
            />
            <input
              type="text"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              className="w-full bg-transparent text-slate-400 print:text-slate-600 focus:outline-none"
              placeholder="Alamat kota/negara"
            />
          </div>

          {/* To */}
          <div className="space-y-1.5 rounded-2xl bg-slate-950/60 print:bg-slate-50 p-4 border border-slate-800 print:border-slate-200">
            <span className="text-slate-400 print:text-slate-500 font-bold uppercase text-[10px] block">Ditagihkan Kepada (Klien)</span>
            <input
              type="text"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              className="w-full bg-transparent font-bold text-sm text-white print:text-black focus:outline-none"
              placeholder="Nama Klien / Perusahaan"
            />
            <input
              type="text"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              className="w-full bg-transparent text-slate-300 print:text-slate-700 focus:outline-none"
              placeholder="Email klien"
            />
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full bg-transparent text-slate-400 print:text-slate-600 focus:outline-none"
              placeholder="Alamat kantor klien"
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 uppercase text-[10px]">
                <th className="py-2.5 px-2">Deskripsi Layanan / Item</th>
                <th className="py-2.5 px-2 w-20 text-center">Jumlah</th>
                <th className="py-2.5 px-2 w-32 text-right">Harga Satuan</th>
                <th className="py-2.5 px-2 w-32 text-right">Total</th>
                <th className="py-2.5 px-1 w-10 text-center print:hidden"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="group">
                  <td className="py-3 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="w-full bg-transparent text-slate-200 print:text-black font-medium focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center bg-transparent text-slate-200 print:text-black focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      min={0}
                      value={item.rate}
                      onChange={(e) => updateItem(item.id, "rate", Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-28 text-right bg-transparent text-slate-200 print:text-black font-mono focus:outline-none"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-white print:text-black">
                    {formatCurrency(item.quantity * item.rate)}
                  </td>
                  <td className="py-3 px-1 text-center print:hidden">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Hapus baris"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 print:hidden">
            <button
              onClick={addItem}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-400 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Tambah Baris Layanan
            </button>
          </div>
        </div>

        {/* Totals & Bank Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-800 print:border-slate-300">
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold mb-1">Instruksi Pembayaran & Rekening</span>
              <textarea
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                rows={2}
                className="w-full bg-slate-950/60 print:bg-slate-50 p-2.5 rounded-xl border border-slate-800 print:border-slate-200 text-slate-300 print:text-black font-mono focus:outline-none resize-none"
              />
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold mb-1">Catatan Tambahan</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950/60 print:bg-slate-50 p-2.5 rounded-xl border border-slate-800 print:border-slate-200 text-slate-400 print:text-slate-600 focus:outline-none resize-none text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400 print:text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold text-slate-200 print:text-black">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 print:text-slate-600">
              <span className="flex items-center gap-1">
                Pajak (PPN %):
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-12 bg-transparent border-b border-slate-700 text-center text-slate-200 print:text-black focus:outline-none"
                />
              </span>
              <span className="font-mono">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 print:text-slate-600">
              <span className="flex items-center gap-1">
                Potongan / Diskon:
                <input
                  type="number"
                  min={0}
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-transparent border-b border-slate-700 text-right text-slate-200 print:text-black focus:outline-none font-mono"
                />
              </span>
              <span className="font-mono text-rose-400">-{formatCurrency(discount)}</span>
            </div>
            <div className="pt-3 border-t border-slate-800 print:border-slate-300 flex justify-between items-center text-base">
              <span className="font-black text-white print:text-black uppercase">Total Tagihan:</span>
              <span className="font-black text-emerald-400 print:text-emerald-700 font-mono text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
