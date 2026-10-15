import React from "react";
import { VoiceAnchor } from "../types/studio";
import { Volume2, CheckCircle2, Mic } from "lucide-react";

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
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-400" />
            <span>የፋና ዜና ጋዜጠኞች (Voice Anchors)</span>
          </h2>
          <p className="text-xs text-neutral-400">
            ጽሑፍዎን በሚያምርና ተፈጥሯዊ የኢትዮጵያዊ የዜና አቀራረብ ስልት የሚያነብ ጋዜጠኛ ይምረጡ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {anchors.map((anchor) => {
          const isSelected = selectedAnchorId === anchor.id;
          const isPreviewing = previewingAnchorId === anchor.id;

          return (
            <div
              key={anchor.id}
              onClick={() => onSelectAnchor(anchor)}
              className={`group relative rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-neutral-900 to-neutral-900/90 border-amber-500/80 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30"
                  : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80"
              }`}
            >
              <div>
                <div className="flex items-start gap-3 mb-2.5">
                  {/* Anchor Avatar Image with fallback */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-800 shrink-0 border border-neutral-700/60 shadow-sm">
                    <img
                      src={anchor.avatarUrl}
                      alt={anchor.nameAmharic}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback placeholder container if image fails
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-amber-400 text-xs font-bold -z-10">
                      {anchor.nameEnglish.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-sm font-bold text-white truncate">
                        {anchor.nameAmharic}
                      </h3>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-amber-400/90 truncate">
                      {anchor.roleAmharic}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {anchor.nameEnglish} · {anchor.gender === "male" ? "ወንድ" : "ሴት"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-3">
                  {anchor.description}
                </p>
              </div>

              {/* Card Footer Action */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-neutral-400">
                  ቅላጼ፦ {anchor.defaultPitch < 1 ? "ጥልቅ (Deep)" : anchor.defaultPitch > 1 ? "ቀጭን (Crisp)" : "መካከለኛ"}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreviewSample(anchor);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    isPreviewing
                      ? "bg-amber-500 text-neutral-950 font-semibold"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  }`}
                  title="የድምፅ ናሙና አድምጥ"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isPreviewing ? "በማድመጥ ላይ..." : "ድምፁን ሞክር"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
