import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Wand2,
  Tv,
  Trash2,
  Copy,
  Check,
  Flame,
  BookOpen,
} from "lucide-react";
import { NewsScriptPreset } from "../types/studio";

interface NewsScriptEditorProps {
  script: string;
  setScript: (val: string) => void;
  wordCount: number;
  durationSeconds: number;
  presets: NewsScriptPreset[];
  onSelectPreset: (preset: NewsScriptPreset) => void;
  onNormalizeAbbreviations: () => void;
  onOpenAiPolish: () => void;
  onOpenTeleprompter: () => void;
  onOpenDictionary: () => void;
}

export const NewsScriptEditor: React.FC<NewsScriptEditorProps> = ({
  script,
  setScript,
  wordCount,
  durationSeconds,
  presets,
  onSelectPreset,
  onNormalizeAbbreviations,
  onOpenAiPolish,
  onOpenTeleprompter,
  onOpenDictionary,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!script) return;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (!script) return;
    setScript("");
  };

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 flex flex-col gap-3.5">
      {/* Editor Header: Title & Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            የዜና ስክሪፕት ማዘጋጃ (Script Studio)
          </h2>
        </div>

        {/* Category Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className="px-2.5 py-1 text-xs rounded-md bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors shrink-0 whitespace-nowrap font-medium"
            >
              {p.categoryAmharic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="ጋዜጠኛው እንዲያነብልዎ የሚፈልጉትን የዜና ጽሑፍ እዚህ ይጻፉ ወይም ይለጥፉ... (ምሳሌ፡ ሰበር ዜና፤ የፋና ብሮድካስቲንግ ኮርፖሬት የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል...)"
          rows={7}
          className="w-full bg-neutral-950 text-neutral-100 rounded-lg p-3.5 border border-neutral-800/90 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 outline-none transition-all resize-y text-sm sm:text-base leading-relaxed placeholder:text-neutral-600 font-sans"
        />

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5">
          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            <span>
              ቃላት: <strong className="text-amber-400 tabular-nums">{wordCount}</strong>
            </span>
            <span>·</span>
            <span>
              የንባብ ጊዜ: <strong className="text-amber-400 tabular-nums">{durationSeconds}</strong> ሰከንድ
            </span>
            {durationSeconds <= 60 && durationSeconds > 10 && (
              <span className="hidden md:inline-block text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded font-sans">
                ✓ ለቲክቶክ እና ሪልስ ተስማሚ (Shorts ready)
              </span>
            )}
          </div>

          {/* Action Tools Cluster */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Abbreviation & Phonetics Normalizer */}
            <button
              type="button"
              onClick={onNormalizeAbbreviations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/25 font-medium shadow-sm"
              title="አጽህሮተ-ቃላት (ጠ/ሚ)፣ ቁጥሮች እና ሥርዓተ-ነጥቦችን ለጋዜጠኛ ንባብ በሚመች ሁኔታ ያስተካክላል"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>አነባበብና አጽህሮተ-ቃል አስተካክል</span>
            </button>

            {/* Custom Pronunciation Dictionary */}
            <button
              type="button"
              onClick={onOpenDictionary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors border border-neutral-700/80 font-medium shadow-sm"
              title="የቃላት አነባበብ መዝገበ-ቃላት (የተሳሳቱ አነባበቦችን ለማረም)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>መዝገበ-ቃላት (Dictionary)</span>
            </button>

            {/* AI News Polisher */}
            <button
              type="button"
              onClick={onOpenAiPolish}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-red-600/25 via-amber-600/25 to-amber-500/25 hover:from-red-600/35 hover:to-amber-500/35 text-amber-200 transition-colors border border-amber-500/40 font-semibold shadow-sm"
              title="በፋና የዜና አጻጻፍ ስልት ጽሑፉን በኤአይ አሳምር"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>በፋና ስልት አሳምር</span>
            </button>

            {/* Fullscreen Teleprompter */}
            <button
              type="button"
              onClick={onOpenTeleprompter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 text-cyan-300 hover:text-cyan-200 transition-colors border border-cyan-800/60 font-medium shadow-sm"
              title="ሙሉ ስክሪን ቴሌፕሮምፕተር ክፈት"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>ቴሌፕሮምፕተር</span>
            </button>

            {/* Copy Script */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              title="ጽሑፉን ኮፒ አድርግ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Clear Textarea */}
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
              title="አጽዳ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
