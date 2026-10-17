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
  Heading,
  Play,
  Square,
  Loader2,
  Radio,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  Camera,
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
  onOpenHeadlineGenerator: () => void;
  isPlaying?: boolean;
  isLoading?: boolean;
  onPlayClick?: () => void;
  onStopClick?: () => void;
  onOpenDictation?: () => void;
  onOpenChat?: () => void;
  onOpenGraphics?: () => void;
  onOpen3DStudio?: () => void;
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
  onOpenHeadlineGenerator,
  isPlaying,
  isLoading,
  onPlayClick,
  onStopClick,
  onOpenDictation,
  onOpenChat,
  onOpenGraphics,
  onOpen3DStudio,
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

            {/* AI Headline Generator */}
            <button
              type="button"
              onClick={onOpenHeadlineGenerator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-red-500/30 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/40 font-semibold shadow-sm"
              title="በርዕሰ ጉዳይ ሳቢ የዜና ርዕስ በኤአይ አመንጭ"
            >
              <Heading className="w-3.5 h-3.5 text-amber-400" />
              <span>ርዕስ አመንጭ</span>
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

            {/* Voice Dictation (Speech-to-Text) */}
            <button
              type="button"
              onClick={onOpenDictation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 text-red-300 hover:text-red-200 transition-colors border border-red-800/60 font-medium shadow-sm"
              title="በማይክሮፎን ተናግረው ዜናውን በጽሑፍ ያዘጋጁ (Speech-to-Text)"
            >
              <Mic className="w-3.5 h-3.5 text-red-400" />
              <span>ድምፅ ተናገር</span>
            </button>

            {/* AI Newsroom Assistant Chat */}
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 text-emerald-300 hover:text-emerald-200 transition-colors border border-emerald-800/60 font-medium shadow-sm"
              title="የፋና ዜና ክፍል AI ረዳት ጋር ተወያዩ"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI ረዳት</span>
            </button>

            {/* AI News Graphics */}
            <button
              type="button"
              onClick={onOpenGraphics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 text-violet-300 hover:text-violet-200 transition-colors border border-violet-800/60 font-medium shadow-sm"
              title="ለዜናው የሚሆን 16:9 ምስልና ሽፋን (Thumbnail) አመንጭ"
            >
              <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
              <span>የዜና ምስል</span>
            </button>

            {/* 3D Virtual Studio */}
            <button
              type="button"
              onClick={onOpen3DStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 transition-colors border border-amber-800/60 font-medium shadow-sm"
              title="ፋና 3D ቨርቹዋል ዜና ስቱዲዮን ክፈት"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>3D ስቱዲዮ</span>
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

        {/* Primary Broadcast Action Bar */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-2.5 text-xs text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-white">የስቱዲዮ ቀጥታ ንባብ</span>
            <span className="text-neutral-600 hidden sm:inline">|</span>
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              በፋና ጋዜጠኛ ድምፅ እና የጀርባ ሙዚቃ
            </span>
          </div>

          <div className="w-full sm:w-auto">
            {isPlaying ? (
              <button
                type="button"
                onClick={onStopClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-lg shadow-red-950/50 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>አቁም (Stop Broadcast)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPlayClick}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 text-sm font-extrabold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 rounded-xl shadow-xl shadow-amber-950/60 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>ድምፅ በማዘጋጀት ላይ...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>ዜናውን አንብብ (Broadcast)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
