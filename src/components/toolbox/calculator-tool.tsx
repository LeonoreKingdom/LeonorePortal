"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Calculator, 
  RotateCcw, 
  Delete, 
  History, 
  Copy, 
  Check, 
  Trash2,
  Equal
} from "lucide-react";

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: string;
}

export function CalculatorTool() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleNumber = useCallback((num: string) => {
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return num;
      return prev + num;
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (prev.includes(".")) return prev;
      return prev + ".";
    });
  }, []);

  const handleOperator = useCallback((op: string) => {
    if (display === "Error") return;
    setEquation(`${display} ${op} `);
    setDisplay("0");
  }, [display]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setEquation("");
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === "Error") return "0";
      return prev.slice(0, -1);
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    setDisplay((prev) => {
      if (prev === "0" || prev === "Error") return prev;
      return prev.startsWith("-") ? prev.slice(1) : `-${prev}`;
    });
  }, []);

  const handleCalculate = useCallback(() => {
    if (!equation || display === "Error") return;
    try {
      const fullExpression = `${equation}${display}`;
      // Clean and safe evaluate arithmetic
      const sanitized = fullExpression.replace(/×/g, "*").replace(/÷/g, "/");
      // Validate arithmetic tokens only
      if (!/^[\d\s+\-*/.%()]+$/.test(sanitized)) {
        throw new Error("Invalid input");
      }
      
      // Calculate
      const calculated = Function(`"use strict"; return (${sanitized})`)();
      const resultStr = String(Number(calculated.toFixed(8)));

      setHistory((prev) => [
        {
          expression: fullExpression,
          result: resultStr,
          timestamp: new Date().toLocaleTimeString("id-ID"),
        },
        ...prev.slice(0, 19),
      ]);

      setDisplay(resultStr);
      setEquation("");
    } catch {
      setDisplay("Error");
    }
  }, [equation, display]);

  // Scientific quick actions
  const handleScientific = useCallback((type: "sqrt" | "sqr" | "reciprocal" | "percent") => {
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    if (type === "sqrt") res = Math.sqrt(val);
    else if (type === "sqr") res = Math.pow(val, 2);
    else if (type === "reciprocal") res = 1 / val;
    else if (type === "percent") res = val / 100;

    const resStr = String(Number(res.toFixed(8)));
    setDisplay(resStr);
  }, [display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      if (/^[0-9]$/.test(e.key)) {
        handleNumber(e.key);
      } else if (e.key === ".") {
        handleDecimal();
      } else if (e.key === "+") {
        handleOperator("+");
      } else if (e.key === "-") {
        handleOperator("-");
      } else if (e.key === "*") {
        handleOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNumber, handleDecimal, handleOperator, handleCalculate, handleBackspace, handleClear]);

  const handleCopyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {/* Calculator Body */}
      <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
        {/* Screen Display */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-5 text-right shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span className="truncate">{equation || "\u00A0"}</span>
            <button
              onClick={handleCopyResult}
              title="Salin hasil"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight overflow-x-auto scrollbar-none">
            {display}
          </div>
        </div>

        {/* Keypad Grid */}
        <div className="mt-5 grid grid-cols-4 gap-2.5">
          {/* Scientific row */}
          <button
            onClick={() => handleScientific("percent")}
            className="rounded-xl bg-slate-800/80 p-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
          >
            %
          </button>
          <button
            onClick={() => handleScientific("sqrt")}
            className="rounded-xl bg-slate-800/80 p-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
          >
            √x
          </button>
          <button
            onClick={() => handleScientific("sqr")}
            className="rounded-xl bg-slate-800/80 p-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
          >
            x²
          </button>
          <button
            onClick={() => handleScientific("reciprocal")}
            className="rounded-xl bg-slate-800/80 p-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
          >
            1/x
          </button>

          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="rounded-xl bg-rose-500/20 p-3.5 text-sm font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 active:scale-95 transition-all"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="rounded-xl bg-slate-800 p-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleSign}
            className="rounded-xl bg-slate-800 p-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
          >
            ±
          </button>
          <button
            onClick={() => handleOperator("÷")}
            className="rounded-xl bg-indigo-600/30 p-3.5 text-base font-bold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleNumber("7")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            7
          </button>
          <button
            onClick={() => handleNumber("8")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            8
          </button>
          <button
            onClick={() => handleNumber("9")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            9
          </button>
          <button
            onClick={() => handleOperator("×")}
            className="rounded-xl bg-indigo-600/30 p-3.5 text-base font-bold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleNumber("4")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            4
          </button>
          <button
            onClick={() => handleNumber("5")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            5
          </button>
          <button
            onClick={() => handleNumber("6")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            6
          </button>
          <button
            onClick={() => handleOperator("-")}
            className="rounded-xl bg-indigo-600/30 p-3.5 text-base font-bold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all"
          >
            -
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleNumber("1")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            1
          </button>
          <button
            onClick={() => handleNumber("2")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            2
          </button>
          <button
            onClick={() => handleNumber("3")}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            3
          </button>
          <button
            onClick={() => handleOperator("+")}
            className="rounded-xl bg-indigo-600/30 p-3.5 text-base font-bold text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white active:scale-95 transition-all"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleNumber("0")}
            className="col-span-2 rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all text-left pl-6"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="rounded-xl bg-slate-950/80 p-3.5 text-base font-semibold text-white border border-slate-800 hover:bg-slate-800 active:scale-95 transition-all"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="rounded-xl bg-indigo-600 p-3.5 text-base font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center"
          >
            <Equal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* History Sidebar */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <History className="h-4 w-4 text-indigo-400" />
              <span>Riwayat Hitung</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                title="Hapus riwayat"
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Belum ada riwayat perhitungan.
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setDisplay(item.result)}
                  className="group cursor-pointer rounded-xl bg-slate-950/80 p-3 border border-slate-800/80 hover:border-indigo-500/40 transition-all text-right"
                >
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {item.expression} =
                  </div>
                  <div className="text-sm font-bold text-white font-mono group-hover:text-indigo-300 transition-colors">
                    {item.result}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
          Mendukung input keyboard angka & operator
        </div>
      </div>
    </div>
  );
}