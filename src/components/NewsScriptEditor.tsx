import React, { useState, useMemo } from "react";
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
  HeartPulse,
  PenLine,
  CheckCircle2,
  Smile,
  FolderArchive,
} from "lucide-react";
import { NewsScriptPreset, MusicBedType } from "../types/studio";
import { useLanguage } from "../context/LanguageContext";
import {
  analyzeScriptSentiment,
  TONE_DEFINITIONS,
  EmotionalToneType,
} from "../utils/sentimentAnalyzer";

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
  onOpenTalkingAvatar?: () => void;
  onOpenDashboard?: () => void;
  isAdmin?: boolean;
  onApplyToneSettings?: (toneSettings: {
    anchorId: string;
    speechRate: number;
    musicBed: MusicBedType;
  }) => void;
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
  onOpenTalkingAvatar,
  onOpenDashboard,
  isAdmin = false,
  onApplyToneSettings,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [copied, setCopied] = useState(false);
  const [showEmotionalTone, setShowEmotionalTone] = useState(false);
  const [toneApplied, setToneApplied] = useState(false);

  // Analyze script sentiment and sentence segments
  const sentimentAnalysis = useMemo(() => {
    return analyzeScriptSentiment(script);
  }, [script]);

  const handleApplyDominantTone = () => {
    if (!onApplyToneSettings) return;
    const rec = sentimentAnalysis.recommendedTone;
    onApplyToneSettings({
      anchorId: rec.recommendedAnchorId,
      speechRate: rec.recommendedRate,
      musicBed: rec.recommendedMusicBed,
    });
    setToneApplied(true);
    setTimeout(() => setToneApplied(false), 2200);
  };

  const handleApplySegmentTone = (toneType: EmotionalToneType) => {
    if (!onApplyToneSettings) return;
    const toneDef = TONE_DEFINITIONS[toneType];
    onApplyToneSettings({
      anchorId: toneDef.recommendedAnchorId,
      speechRate: toneDef.recommendedRate,
      musicBed: toneDef.recommendedMusicBed,
    });
    setToneApplied(true);
    setTimeout(() => setToneApplied(false), 2200);
  };

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

      {/* Main Textarea OR Color-Coded Emotional Tone Analysis View */}
      <div className="relative">
        {showEmotionalTone ? (
          <div className="bg-neutral-950 rounded-lg p-3 sm:p-3.5 border border-amber-500/50 space-y-3 shadow-inner">
            {/* Tone Header & Voice Recommendation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
              <div className="flex flex-wrap items-center gap-2">
                {/* Dominant Tone Pill */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${sentimentAnalysis.recommendedTone.badgeBg} ${sentimentAnalysis.recommendedTone.badgeText} ${sentimentAnalysis.recommendedTone.borderClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${sentimentAnalysis.recommendedTone.dotColor} animate-pulse`} />
                  <span>
                    {isEn ? sentimentAnalysis.recommendedTone.labelEnglish : sentimentAnalysis.recommendedTone.labelAmharic}
                  </span>
                </div>

                {/* Recommended Anchor */}
                <span className="text-xs text-neutral-300 font-medium">
                  {isEn ? "Recommended:" : "ምርጥ አንባቢ፦"}{" "}
                  <strong className="text-amber-400 font-bold">
                    {sentimentAnalysis.recommendedTone.recommendedAnchorName}
                  </strong>
                </span>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {onApplyToneSettings && (
                  <button
                    type="button"
                    onClick={handleApplyDominantTone}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer shadow-sm ${
                      toneApplied
                        ? "bg-emerald-500 text-neutral-950"
                        : "bg-amber-500 hover:bg-amber-400 text-neutral-950"
                    }`}
                  >
                    {toneApplied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isEn ? "Applied" : "ተተግብሯል"}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isEn ? "Apply Voice Style" : "ድምፁን ተግብር"}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowEmotionalTone(false)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors font-medium cursor-pointer"
                >
                  <PenLine className="w-3 h-3 text-neutral-400" />
                  <span>{isEn ? "Edit" : "አርትዕ"}</span>
                </button>
              </div>
            </div>

            {/* Distribution Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {(Object.keys(sentimentAnalysis.toneCounts) as EmotionalToneType[]).map((t) => {
                const count = sentimentAnalysis.toneCounts[t];
                if (count === 0) return null;
                const def = TONE_DEFINITIONS[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleApplySegmentTone(t)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${def.badgeBg} ${def.badgeText} ${def.borderClass}`}
                    title={isEn ? `Apply ${def.labelEnglish}` : `${def.labelAmharic} ተግብር`}
                  >
                    {isEn ? def.labelEnglish.split(" ")[1] : def.labelAmharic.split(" ")[1]}: {count}
                  </button>
                );
              })}
            </div>

            {/* Color-Coded Script Sentences List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {sentimentAnalysis.segments.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-4 text-center">
                  {isEn ? "Script is empty" : "የዜና ጽሑፍ አልገባም"}
                </p>
              ) : (
                sentimentAnalysis.segments.map((seg) => {
                  const def = TONE_DEFINITIONS[seg.tone];
                  return (
                    <div
                      key={seg.id}
                      onClick={() => handleApplySegmentTone(seg.tone)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer group hover:brightness-110 ${def.highlightClass} ${def.borderClass}`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-1">
                        <span className={`text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded border ${def.badgeBg} ${def.badgeText} ${def.borderClass}`}>
                          {def.labelAmharic.split(" ")[1]}
                        </span>
                        {seg.matchedKeywords.length > 0 && (
                          <div className="flex items-center gap-1">
                            {seg.matchedKeywords.slice(0, 3).map((kw, i) => (
                              <span key={i} className="text-[9px] font-mono px-1 rounded bg-black/40 text-neutral-300">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed text-neutral-100 font-sans">
                        {seg.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
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
        )}

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
            {/* Emotional Tone Quick Toggle */}
            <button
              type="button"
              onClick={() => setShowEmotionalTone(!showEmotionalTone)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg transition-colors border font-semibold cursor-pointer ${
                showEmotionalTone
                  ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-sm"
                  : "bg-neutral-900 hover:bg-neutral-800 text-rose-300 hover:text-rose-200 border-rose-500/30"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>{isEn ? "Tone" : "የስሜት ቃና"}</span>
            </button>

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
            {/* Emotional Tone Tool Button */}
            <button
              type="button"
              onClick={() => setShowEmotionalTone(!showEmotionalTone)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                showEmotionalTone
                  ? "bg-amber-500 text-neutral-950 shadow-md ring-1 ring-amber-400"
                  : "bg-neutral-900 hover:bg-rose-950/50 text-rose-300 hover:text-rose-100 border border-rose-600/50"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
              <span>{isEn ? "Emotional Tone" : "የስሜት ቃና (Tone)"}</span>
            </button>

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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all border border-neutral-700 font-bold cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-neutral-400" />
              <span>{isEn ? "3D Studio" : "3D ስቱዲዮ"}</span>
            </button>

            {/* AI Talking Avatar & Photo Animator */}
            <button
              type="button"
              onClick={onOpenTalkingAvatar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-amber-600/30 via-red-600/30 to-amber-500/30 hover:from-amber-600/50 hover:to-red-600/50 text-amber-200 transition-all border border-amber-500/60 font-bold cursor-pointer shadow-sm"
            >
              <Smile className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Talking Avatar" : "ተንቀሳቃሽ ፎቶ (Avatar)"}</span>
            </button>

            {/* User Work Archive & Audit Log Dashboard */}
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gradient-to-r from-neutral-900 to-neutral-850 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 transition-all border border-amber-500/40 font-bold cursor-pointer shadow-sm"
              title="የተጠቃሚ ስራዎች ማህደር እና ኦዲት ሎግ ዳሽቦርድ"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Work Archive & Audit" : "የስራ ማህደርና ኦዲት"}</span>
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
