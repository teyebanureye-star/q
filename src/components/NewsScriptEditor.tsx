import React from "react";
import {
  FileText,
  Sparkles,
  Wand2,
  Tv,
  Trash2,
  Copy,
  Check,
  Flame,
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
}) => {
  const [copied, setCopied] = React.useState(false);

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
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 flex flex-col gap-4">
      {/* Editor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-semibold text-white">
            የዜና ስክሪፕት ዝግጅት (News Script Editor)
          </h2>
        </div>

        {/* Quick Presets Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-[11px] text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
            <Flame className="w-3 h-3 text-red-500" />
            <span>አብነቶች፦</span>
          </span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className="px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors shrink-0 whitespace-nowrap"
            >
              {p.categoryAmharic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Amharic Script Textarea */}
      <div className="relative">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="ጋዜጠኛው እንዲያነብልዎ የሚፈልጉትን የዜና ጽሑፍ እዚህ ይጻፉ ወይም ይለጥፉ... (ምሳሌ፡ ሰበር ዜና፤ የፋና ብሮድካስቲንግ ኮርፖሬት የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል...)"
          rows={7}
          className="w-full bg-neutral-950 text-neutral-100 rounded-lg p-3.5 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all resize-y text-sm sm:text-base leading-relaxed placeholder:text-neutral-600 font-sans"
        />

        {/* Floating Quick Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
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
              <span className="hidden sm:inline-block text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded font-sans">
                ✓ ለቲክቶክ እና ሪልስ ተስማሚ (Shorts ready)
              </span>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Normalize Abbreviations */}
            <button
              type="button"
              onClick={onNormalizeAbbreviations}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 transition-colors border border-neutral-700/60"
              title="አጽህሮተ-ቃላትን (ጠ/ሚ፣ ዶ/ር፣ ብር) ወደ ሙሉ አማርኛ ቃል ቀይር"
            >
              <Wand2 className="w-3 h-3 text-amber-400" />
              <span>አጽህሮተ-ቃል አስተካክል</span>
            </button>

            {/* AI Script Polish */}
            <button
              type="button"
              onClick={onOpenAiPolish}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-gradient-to-r from-red-600/30 to-amber-600/30 hover:from-red-600/40 hover:to-amber-600/40 text-amber-200 transition-colors border border-amber-500/30 font-medium"
              title="በፋና የዜና አጻጻፍ ስልት ጽሑፉን በኤአይ አሳምር"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>በፋና ስልት አሳምር</span>
            </button>

            {/* Teleprompter Button */}
            <button
              type="button"
              onClick={onOpenTeleprompter}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
              title="ሙሉ ስክሪን ቴሌፕሮምፕተር ክፈት"
            >
              <Tv className="w-3 h-3 text-cyan-400" />
              <span>ቴሌፕሮምፕተር</span>
            </button>

            {/* Copy Script */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
              title="ጽሑፉን ኮፒ አድርግ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
              title="አጽዳ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
