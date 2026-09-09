"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Flame, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings2, 
  CheckCircle2,
  Volume2
} from "lucide-react";

type TimerMode = "focus" | "shortBreak" | "longBreak";

export function PomodoroTimerTool() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [focusMin, setFocusMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [taskName, setTaskName] = useState("Menyelesaikan fitur aplikasi web");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const totalTimeForMode = (m: TimerMode) => {
    if (m === "focus") return focusMin * 60;
    if (m === "shortBreak") return shortBreakMin * 60;
    return longBreakMin * 60;
  };

  const totalSeconds = totalTimeForMode(mode);
  const progressPct = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Web Audio chime generator
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      playBeep();
      if (mode === "focus") {
        const nextSessions = completedSessions + 1;
        setCompletedSessions(nextSessions);
        if (nextSessions % 4 === 0) {
          switchMode("longBreak");
        } else {
          switchMode("shortBreak");
        }
      } else {
        switchMode("focus");
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, completedSessions]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(totalTimeForMode(newMode));
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(totalTimeForMode(mode));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Pomodoro Focus Timer</h2>
            <p className="text-xs text-slate-400">Teknik manajemen waktu 25 menit fokus & istirahat untuk produktivitas optimal</p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 self-start sm:self-auto ${
            soundEnabled
              ? "bg-slate-800 text-rose-400 border-slate-700"
              : "bg-slate-950 text-slate-500 border-slate-800"
          }`}
        >
          <Volume2 className="h-3.5 w-3.5" />
          Suara: {soundEnabled ? "ON" : "OFF"}
        </button>
      </div>

      {/* Main Timer Display Frame */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6">
        {/* Mode Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => switchMode("focus")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              mode === "focus" ? "bg-rose-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Fokus ({focusMin}m)
          </button>
          <button
            onClick={() => switchMode("shortBreak")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              mode === "shortBreak" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Istirahat Singkat ({shortBreakMin}m)
          </button>
          <button
            onClick={() => switchMode("longBreak")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              mode === "longBreak" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Istirahat Panjang ({longBreakMin}m)
          </button>
        </div>

        {/* Task Title editable */}
        <div className="w-full max-w-md">
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Apa target fokus Anda saat ini?"
            className="w-full text-center bg-transparent border-b border-slate-800 focus:border-rose-500 text-sm font-medium text-slate-300 focus:outline-none py-1"
          />
        </div>

        {/* Circular Progress & Digits */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-800"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`transition-all duration-300 ${
                mode === "focus"
                  ? "stroke-rose-500"
                  : mode === "shortBreak"
                  ? "stroke-emerald-400"
                  : "stroke-indigo-400"
              }`}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progressPct / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black font-mono tracking-tight text-white">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
              {mode === "focus" ? "Sesi Fokus" : "Waktu Istirahat"}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl transition-all ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                : mode === "focus"
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
            <span>{isRunning ? "Jeda" : "Mulai"}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reset Waktu"
          >
            <RotateCcw className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              if (mode === "focus") switchMode("shortBreak");
              else switchMode("focus");
            }}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Lewati Sesi Ini"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Completed Session Badges */}
        <div className="pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Selesai: <strong className="text-white">{completedSessions} Sesi Pomodoro</strong>
          </span>
          <span className="text-[11px] text-slate-500">
            Siklus: {completedSessions % 4}/4 menuju istirahat panjang
          </span>
        </div>
      </div>
    </div>
  );
}
