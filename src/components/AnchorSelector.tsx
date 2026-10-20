import React from "react";
import { VoiceAnchor } from "../types/studio";
import { Volume2, CheckCircle2, Mic, Square } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface AnchorSelectorProps {
  anchors: VoiceAnchor[];
  selectedAnchorId: string;
  onSelectAnchor: (anchor: VoiceAnchor) => void;
  onPreviewSample: (anchor: VoiceAnchor) => void;
  previewingAnchorId: string | null;
}

export const AnchorSelector: React.FC<AnchorSelectorProps> = ({
  anchors,
  selectedAnchorId,
  onSelectAnchor,
  onPreviewSample,
  previewingAnchorId,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isEn ? "Broadcast News Anchors" : "የዜና ጋዜጠኞች"}</span>
              <span className="text-[11px] font-mono text-amber-400 font-normal px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                {anchors.length}
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* Anchor List Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {anchors.map((anchor) => {
          const isSelected = selectedAnchorId === anchor.id;
          const isPreviewing = previewingAnchorId === anchor.id;

          const displayName = isEn ? anchor.nameEnglish : anchor.nameAmharic;
          const subName = isEn ? anchor.nameAmharic : anchor.nameEnglish;
          const displayRole = isEn ? (anchor.roleEnglish || anchor.roleAmharic) : anchor.roleAmharic;
          const displayDesc = isEn ? (anchor.descriptionEnglish || anchor.description) : anchor.description;

          return (
            <div
              key={anchor.id}
              onClick={() => onSelectAnchor(anchor)}
              className={`group relative rounded-xl p-3 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-gradient-to-r from-amber-500/10 via-neutral-900 to-neutral-900 border-amber-500/80 shadow-md shadow-amber-950/20 ring-1 ring-amber-500/40"
                  : "bg-neutral-950/70 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60"
              }`}
            >
              {/* Left: Avatar & Anchor Info */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Portrait Avatar */}
                <div className="relative w-13 h-13 rounded-xl overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700/80 shadow-sm">
                  <img
                    src={anchor.avatarUrl}
                    alt={anchor.nameEnglish}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-amber-400 text-xs font-bold -z-10">
                    {anchor.nameEnglish.charAt(0)}
                  </div>
                  {isSelected && (
                    <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-neutral-950" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">
                      {displayName}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline">
                      ({subName})
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-amber-300/90 font-medium truncate mt-0.5">
                    {displayRole}
                  </p>
                </div>
              </div>

              {/* Right: Audio Sample Preview Button */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewSample(anchor);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                    isPreviewing
                      ? "bg-amber-500 text-neutral-950 shadow-amber-500/20"
                      : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white border border-neutral-700/80"
                  }`}
                  title={isEn ? "Preview anchor audio" : "የጋዜጠኛውን ድምፅ አድምጥ"}
                >
                  {isPreviewing ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>{isEn ? "Playing..." : "በማድመጥ ላይ..."}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isEn ? "Preview" : "ድምፁን ሞክር"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
