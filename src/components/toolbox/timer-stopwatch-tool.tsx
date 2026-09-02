"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Flag, 
  Volume2, 
  Sparkles,
  CheckCircle2,
  Trash2,
  Copy,
  Check
} from "lucide-react";

interface LapItem {
  lapIndex: number;
  lapTime: number; // in ms
  overallTime: number; // in ms
}

export function TimerStopwatchTool() {
  const [activeTab, setActiveTab] = useState<"timer" | "stopwatch">("timer");

  // --- TIMER STATE ---
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [totalTimerSeconds, setTotalTimerSeconds] = useState(300);
  const [remainingSeconds, setRemainingSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  // --- STOPWATCH STATE ---
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0); // in ms
  const [laps, setLaps] = useState<LapItem[]>([]);
  const [copiedLaps, setCopiedLaps] = useState(false);

  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Beep sound function using Web Audio API
  const playBeep = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio context might be restricted before interaction
    }
  };

  // Timer Countdown loop
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current as NodeJS.Timeout);
            setIsTimerRunning(false);
            setIsTimerFinished(true);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // Stopwatch loop
  useEffect(() => {
    if (isStopwatchRunning) {
      const startTime = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(Date.now() - startTime);
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  // Timer controls
  const handleStartTimer = () => {
    if (remainingSeconds === 0) {
      const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
      if (total <= 0) return;
      setTotalTimerSeconds(total);
      setRemainingSeconds(total);
    }
    setIsTimerFinished(false);
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setIsTimerFinished(false);
    const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
    setTotalTimerSeconds(total);
    setRemainingSeconds(total);
  };

  const setTimerPreset = (mins: number) => {
    setIsTimerRunning(false);
    setIsTimerFinished(false);
    setTimerHours(Math.floor(mins / 60));
    setTimerMinutes(mins % 60);
    setTimerSeconds(0);
    setTotalTimerSeconds(mins * 60);
    setRemainingSeconds(mins * 60);
  };

  // Stopwatch controls
  const handleStartStopwatch = () => {
    setIsStopwatchRunning(true);
  };

  const handlePauseStopwatch = () => {
    setIsStopwatchRunning(false);
  };

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (!isStopwatchRunning) return;
    const lastLapTotal = laps.length > 0 ? laps[0].overallTime : 0;
    const lapDuration = stopwatchTime - lastLapTotal;
    const newLap: LapItem = {
      lapIndex: laps.length + 1,
      lapTime: lapDuration,
      overallTime: stopwatchTime,
    };
    setLaps((prev) => [newLap, ...prev]);
  };

  const handleCopyLaps = () => {
    const formatted = laps
      .map(
        (l) =>
          `Lap ${l.lapIndex}: ${formatMs(l.lapTime)} (Total: ${formatMs(l.overallTime)})`
      )
      .join("\n");
    navigator.clipboard.writeText(formatted);
    setCopiedLaps(true);
    setTimeout(() => setCopiedLaps(false), 2000);
  };

  // Formatters
  const formatTimerDigits = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatMs = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  };

  const timerProgress =
    totalTimerSeconds > 0
      ? Math.max(0, Math.min(100, ((totalTimerSeconds - remainingSeconds) / totalTimerSeconds) * 100))
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab("timer")}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${
              activeTab === "timer"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Timer (Hitung Mundur)</span>
          </button>
          <button
            onClick={() => setActiveTab("stopwatch")}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold transition-all ${
              activeTab === "stopwatch"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flag className="h-4 w-4" />
            <span>Stopwatch & Lap</span>
          </button>
        </div>
      </div>

      {activeTab === "timer" ? (
        /* TIMER COMPONENT */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-md text-center space-y-8">
          {/* Presets */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[1, 3, 5, 10, 15, 25, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => setTimerPreset(mins)}
                className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs font-mono font-semibold text-slate-300 hover:border-indigo-500 hover:text-white transition-all"
              >
                {mins === 25 ? "🍅 25m" : `${mins}m`}
              </button>
            ))}
          </div>

          {/* Big Time Display */}
          <div className="relative py-4">
            <div
              className={`text-5xl sm:text-7xl font-extrabold font-mono tracking-tight transition-all ${
                isTimerFinished
                  ? "text-rose-400 animate-pulse"
                  : remainingSeconds <= 10 && remainingSeconds > 0
                  ? "text-amber-300"
                  : "text-white"
              }`}
            >
              {formatTimerDigits(remainingSeconds)}
            </div>

            {/* Progress bar */}
            <div className="mt-6 mx-auto max-w-md h-2.5 overflow-hidden rounded-full bg-slate-950 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${100 - timerProgress}%` }}
              />
            </div>
          </div>

          {/* Time Inputs (when paused/reset) */}
          {!isTimerRunning && (
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={timerHours}
                  onChange={(e) => {
                    const h = Math.max(0, parseInt(e.target.value) || 0);
                    setTimerHours(h);
                    const total = h * 3600 + timerMinutes * 60 + timerSeconds;
                    setTotalTimerSeconds(total);
                    setRemainingSeconds(total);
                  }}
                  className="w-14 rounded-lg bg-slate-950 border border-slate-800 p-2 text-center text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <span>Jam</span>
              </div>
              <span>:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={timerMinutes}
                  onChange={(e) => {
                    const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    setTimerMinutes(m);
                    const total = timerHours * 3600 + m * 60 + timerSeconds;
                    setTotalTimerSeconds(total);
                    setRemainingSeconds(total);
                  }}
                  className="w-14 rounded-lg bg-slate-950 border border-slate-800 p-2 text-center text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <span>Menit</span>
              </div>
              <span>:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={timerSeconds}
                  onChange={(e) => {
                    const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                    setTimerSeconds(s);
                    const total = timerHours * 3600 + timerMinutes * 60 + s;
                    setTotalTimerSeconds(total);
                    setRemainingSeconds(total);
                  }}
                  className="w-14 rounded-lg bg-slate-950 border border-slate-800 p-2 text-center text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <span>Detik</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
              >
                <Play className="h-5 w-5 fill-current" />
                Mulai Timer
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="flex items-center gap-2 rounded-2xl bg-amber-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-amber-600/30 hover:bg-amber-500 active:scale-95 transition-all"
              >
                <Pause className="h-5 w-5 fill-current" />
                Jeda
              </button>
            )}
            <button
              onClick={handleResetTimer}
              className="flex items-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      ) : (
        /* STOPWATCH COMPONENT */
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
          <div className="text-center py-4">
            <div className="text-5xl sm:text-7xl font-extrabold font-mono tracking-tight text-white">
              {formatMs(stopwatchTime)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isStopwatchRunning ? (
              <button
                onClick={handleStartStopwatch}
                className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-600/30 hover:bg-emerald-500 active:scale-95 transition-all"
              >
                <Play className="h-5 w-5 fill-current" />
                Mulai
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseStopwatch}
                  className="flex items-center gap-2 rounded-2xl bg-amber-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-amber-600/30 hover:bg-amber-500 active:scale-95 transition-all"
                >
                  <Pause className="h-5 w-5 fill-current" />
                  Jeda
                </button>
                <button
                  onClick={handleLap}
                  className="flex items-center gap-2 rounded-2xl bg-sky-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-sky-600/30 hover:bg-sky-500 active:scale-95 transition-all"
                >
                  <Flag className="h-5 w-5" />
                  Catat Lap
                </button>
              </>
            )}

            <button
              onClick={handleResetStopwatch}
              className="flex items-center gap-2 rounded-2xl bg-slate-800 border border-slate-700 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Flag className="h-4 w-4 text-sky-400" />
                  <span>Daftar Lap ({laps.length})</span>
                </div>
                <button
                  onClick={handleCopyLaps}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  {copiedLaps ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLaps ? "Tersalin" : "Salin Laps"}</span>
                </button>
              </div>

              <div className="mt-3 divide-y divide-slate-800/60 max-h-56 overflow-y-auto">
                {laps.map((lap) => (
                  <div key={lap.lapIndex} className="flex items-center justify-between py-2 text-xs font-mono">
                    <span className="text-slate-400 font-bold">Lap {lap.lapIndex}</span>
                    <span className="text-sky-300 font-semibold">+{formatMs(lap.lapTime)}</span>
                    <span className="text-slate-200">{formatMs(lap.overallTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}