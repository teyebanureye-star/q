import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Wand2,
  Tv,
  Trash2,
  Copy,
  Check,
  BookOpen,
  Heading,
  Play,
  Square,
  Loader2,
  Mic,
  Image as ImageIcon,
  MessageSquare,
  Camera,
  Lock,
  Scissors,
} from "lucide-react";
import { NewsScriptPreset } from "../types/studio";
import { useLanguage } from "../context/LanguageContext";
import { openCapCut } from "../utils/mediaMerger";

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
  isAdmin?: boolean;
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
  isAdmin = false,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!script) return;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (!isAdmin) return;
    if (!script) return;
    setScript("");
  };

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 flex flex-col gap-3 font-sans">
      {/* Editor Header: Title & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            {isEn ? "News Script" : "የዜና ስክሪፕት"}
          </h2>
        </div>

        {/* Category Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className="px-2.5 py-1 text-xs rounded-md bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-colors shrink-0 whitespace-nowrap font-medium cursor-pointer"
            >
              {isEn ? (p.categoryEnglish || p.categoryAmharic) : p.categoryAmharic}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder={
            isEn
              ? "Type or paste your news script here..."
              : "የሚነበበውን የዜና ጽሑፍ እዚህ ይጻፉ ወይም ይለጥፉ..."
          }
          rows={7}
          className="w-full bg-neutral-950 text-neutral-100 rounded-lg p-3.5 border border-neutral-800/90 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 outline-none transition-all resize-y text-sm sm:text-base leading-relaxed placeholder:text-neutral-600 font-sans"
        />

        {/* Action Bar Row 1: Metrics & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 pb-1">
          {/* Metrics */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>
              {isEn ? "Words" : "ቃላት"}: <strong className="text-amber-400 tabular-nums">{wordCount}</strong>
            </span>
            <span>·</span>
            <span>
              {isEn ? "Time" : "ጊዜ"}: <strong className="text-amber-400 tabular-nums">{durationSeconds}</strong>s
            </span>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Normalize */}
            <button
              type="button"
              onClick={onNormalizeAbbreviations}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-300 hover:text-amber-200 transition-colors border border-amber-500/25 font-medium cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Normalize" : "አጽህሮተ-ቃል"}</span>
            </button>

            {/* Dictionary */}
            <button
              type="button"
              onClick={onOpenDictionary}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors border border-neutral-700/80 font-medium cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Dictionary" : "መዝገበ-ቃላት"}</span>
            </button>

            {/* Copy */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              title="ኮፒ"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Clear */}
            {isAdmin ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                title="አጽዳ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="p-1.5 text-neutral-600 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-neutral-600" />
              </div>
            )}
          </div>
        </div>

        {/* Action Bar Row 2: Studio Tools Dock */}
        <div className="mt-2 p-3 rounded-xl bg-neutral-950/90 border border-neutral-800/90 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Studio Tools" : "የስቱዲዮ መሣሪያዎች"}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            {/* Dictate */}
            <button
              type="button"
              onClick={onOpenDictation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-red-950/60 text-red-300 hover:text-red-200 transition-all border border-red-800/70 font-semibold cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>{isEn ? "Dictate" : "ድምፅ ተናገር"}</span>
            </button>

            {/* Polish */}
            <button
              type="button"
              onClick={onOpenAiPolish}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-red-600/25 via-amber-600/25 to-amber-500/25 hover:from-red-600/40 hover:to-amber-500/40 text-amber-200 transition-all border border-amber-500/50 font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Polish" : "አሳምር"}</span>
            </button>

            {/* Headline */}
            <button
              type="button"
              onClick={onOpenHeadlineGenerator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-amber-950/50 text-amber-300 hover:text-amber-200 transition-all border border-amber-500/40 font-semibold cursor-pointer"
            >
              <Heading className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Headlines" : "ርዕስ አመንጭ"}</span>
            </button>

            {/* Chat Assistant */}
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-emerald-950/50 text-emerald-300 hover:text-emerald-200 transition-all border border-emerald-700/60 font-semibold cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isEn ? "Assistant" : "AI ረዳት"}</span>
            </button>

            {/* Graphics & Video */}
            <button
              type="button"
              onClick={onOpenGraphics}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-purple-950/50 text-purple-300 hover:text-purple-200 transition-all border border-purple-700/60 font-semibold cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>{isEn ? "Graphics" : "ምስልና ቪዲዮ"}</span>
            </button>

            {/* Teleprompter */}
            <button
              type="button"
              onClick={onOpenTeleprompter}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 transition-all border border-cyan-700/60 font-semibold cursor-pointer"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEn ? "Teleprompter" : "ቴሌፕሮምፕተር"}</span>
            </button>

            {/* 3D Studio */}
            <button
              type="button"
              onClick={onOpen3DStudio}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-amber-950/40 text-amber-300 hover:text-amber-100 transition-all border border-amber-500/50 font-bold cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "3D Studio" : "3D ስቱዲዮ"}</span>
            </button>

            {/* CapCut Launcher */}
            <button
              type="button"
              onClick={openCapCut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white transition-all border border-neutral-700 font-bold cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span>CapCut</span>
            </button>
          </div>
        </div>

        {/* Primary Broadcast Action Bar */}
        <div className="mt-4 pt-3.5 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800">
          <div className="flex items-center gap-2.5 text-xs text-neutral-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-white">{isEn ? "Studio Broadcast" : "የስቱዲዮ ንባብ"}</span>
          </div>

          <div className="w-full sm:w-auto">
            {isPlaying ? (
              <button
                type="button"
                onClick={onStopClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-lg shadow-red-950/50 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{isEn ? "Stop" : "አቁም"}</span>
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
                    <span>{isEn ? "Synthesizing..." : "ድምፅ በማዘጋጀት ላይ..."}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isEn ? "Broadcast" : "አንብብ"}</span>
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
