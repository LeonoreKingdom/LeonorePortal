"use client";

import { useState, useMemo } from "react";
import { 
  FileText, 
  Clock, 
  BookOpen, 
  BarChart3, 
  RotateCcw, 
  Sparkles,
  Award,
  Type
} from "lucide-react";

export function ContentAnalyzerTool() {
  const [text, setText] = useState(
    `Teknologi informasi modern berkembang dengan sangat pesat dan merevolusi cara kerja manusia di seluruh dunia. Kehadiran kecerdasan buatan (AI) mempermudah analisis data dalam jumlah masif dan mempercepat otomasi tugas-tugas berulang. Dengan alat bantu yang tepat, pengembang web dan penulis dapat meningkatkan produktivitas serta kualitas karya mereka tanpa mengorbankan privasi data pengguna.`
  );

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        chars: 0,
        charsNoSpace: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMin: 0,
        speakingTimeMin: 0,
        fleschScore: 0,
        fleschGrade: "N/A",
        topWords: [] as { word: string; count: number; pct: number }[],
      };
    }

    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const wordsArr = trimmed.split(/\s+/).filter(Boolean);
    const words = wordsArr.length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
    const paragraphs = text.split(/\n+/).filter((p) => p.trim().length > 0).length || 1;

    // Reading & Speaking times
    const readingTimeMin = Math.ceil(words / 200);
    const speakingTimeMin = Math.ceil(words / 130);

    // Approximate syllable count for Indonesian / English
    let totalSyllables = 0;
    wordsArr.forEach((w) => {
      const matches = w.match(/[aiueoAIUEO]/g);
      totalSyllables += matches ? matches.length : 1;
    });

    // Flesch Reading Ease Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = totalSyllables / words;
    let flesch = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;
    flesch = Math.max(0, Math.min(100, Math.round(flesch)));

    let fleschGrade = "Mudah Dipahami";
    if (flesch >= 90) fleschGrade = "Sangat Mudah (Anak-anak)";
    else if (flesch >= 80) fleschGrade = "Mudah (Sederhana)";
    else if (flesch >= 70) fleschGrade = "Cukup Mudah (Santai)";
    else if (flesch >= 60) fleschGrade = "Standar (Artikel Populer)";
    else if (flesch >= 50) fleschGrade = "Cukup Sulit (Majalah Khusus)";
    else if (flesch >= 30) fleschGrade = "Sulit (Teks Akademis)";
    else fleschGrade = "Sangat Kompleks (Jurnal/Hukum)";

    // Word frequency (excluding short common words)
    const stopWords = new Set(["dan", "yang", "di", "ke", "dari", "ini", "itu", "untuk", "dengan", "pada", "adalah", "the", "a", "an", "is", "of", "and", "in", "to", "for"]);
    const wordCounts: Record<string, number> = {};
    wordsArr.forEach((raw) => {
      const clean = raw.toLowerCase().replace(/[^\w]/g, "");
      if (clean.length > 2 && !stopWords.has(clean)) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordCounts)
      .map(([word, count]) => ({
        word,
        count,
        pct: Math.round((count / words) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      chars,
      charsNoSpace,
      words,
      sentences,
      paragraphs,
      readingTimeMin,
      speakingTimeMin,
      fleschScore: flesch,
      fleschGrade,
      topWords,
    };
  }, [text]);

  return (
    <div className="space-y-6">
      {/* Header Box */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Readability & Content Analyzer</h2>
              <p className="text-xs text-slate-400">Analisis keterbacaan, statistik kata, dan kepadatan kata kunci secara live</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setText("")}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Bersihkan
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tempel atau ketik teks artikel/konten Anda di sini untuk dianalisis..."
          rows={7}
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Type className="h-3.5 w-3.5 text-sky-400" /> Jumlah Kata
          </div>
          <div className="text-2xl font-black text-white">{stats.words}</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.chars} karakter ({stats.charsNoSpace} tanpa spasi)</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Clock className="h-3.5 w-3.5 text-emerald-400" /> Waktu Baca
          </div>
          <div className="text-2xl font-black text-white">~{stats.readingTimeMin} mnt</div>
          <div className="text-[11px] text-slate-500 mt-1">Kecepatan ~200 kata/menit</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> Kalimat & Paragraf
          </div>
          <div className="text-2xl font-black text-white">{stats.sentences}</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.paragraphs} paragraf terdeteksi</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Award className="h-3.5 w-3.5 text-amber-400" /> Skor Flesch
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.fleschScore}/100</div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">{stats.fleschGrade}</div>
        </div>
      </div>

      {/* Word Frequency & Readability Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-sky-400" />
            Kepadatan Kata Kunci Teratas (Keyword Density)
          </h3>
          {stats.topWords.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Belum ada kata kunci yang cukup untuk dihitung.</p>
          ) : (
            <div className="space-y-3">
              {stats.topWords.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.word}</span>
                    <span className="text-slate-500">{item.count}x ({item.pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, item.pct * 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Readability Guide */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Panduan Keterbacaan & SEO Teks
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Skor Flesch Reading Ease mengukur seberapa mudah suatu teks dipahami oleh pembaca. Nilai 60-70 adalah target ideal untuk konten web, blog teknologi, dan komunikasi umum.
          </p>
          <div className="rounded-xl bg-slate-950/70 p-3 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">90 - 100</span>
              <span className="text-emerald-400 font-medium">Sangat Mudah (Murid SD)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">60 - 70</span>
              <span className="text-sky-400 font-medium">Standar (Artikel Web Umum)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">30 - 50</span>
              <span className="text-amber-400 font-medium">Sulit (Makalah Ilmiah / Bisnis)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">0 - 29</span>
              <span className="text-rose-400 font-medium">Sangat Kompleks (Regulasi Hukum)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
