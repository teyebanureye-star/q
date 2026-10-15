import React, { useEffect, useRef, useState } from "react";
import { X, Play, Square, FlipHorizontal, Type, RotateCcw } from "lucide-react";

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  anchorName: string;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  isOpen,
  onClose,
  script,
  isPlaying,
  onTogglePlay,
  anchorName,
}) => {
  const [fontSize, setFontSize] = useState<number>(36);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.5);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const autoScroll = () => {
      if (isPlaying && scrollContainer) {
        scrollContainer.scrollTop += scrollSpeed * 0.7;
      }
      animId = requestAnimationFrame(autoScroll);
    };

    animId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, scrollSpeed]);

  const handleResetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Top Prompter Toolbar */}
      <div className="h-16 border-b border-neutral-800 bg-neutral-950 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-red-950/80 border border-red-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-red-300">
              TELEPROMPTER // ቴሌፕሮምፕተር
            </span>
          </div>
          <span className="text-xs text-neutral-400 hidden sm:inline">
            ጋዜጠኛ፦ <strong className="text-amber-400">{anchorName}</strong>
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Font Size */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
            <Type className="w-3.5 h-3.5" />
            <input
              type="range"
              min="24"
              max="54"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Speed */}
          <div className="hidden md:flex items-center gap-2 text-xs text-neutral-400">
            <span>ፍጥነት:</span>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Mirror Flip */}
          <button
            type="button"
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 rounded transition-colors ${
              isMirrored ? "bg-amber-500 text-neutral-950" : "bg-neutral-800 text-neutral-300 hover:text-white"
            }`}
            title="መስተዋት ሁነታ (Mirror Mode for Glass Prompters)"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Reset Scroll */}
          <button
            type="button"
            onClick={handleResetScroll}
            className="p-2 rounded bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="ወደ መጀመሪያ ተመለስ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Play/Stop Audio & Prompter */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-lg transition-all ${
              isPlaying
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-950/40"
                : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-950/40"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>አቁም</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>አንብብ</span>
              </>
            )}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            title="ዝጋ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prompter Text Scroll Area */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-6 sm:px-16 lg:px-32 py-20 text-center select-none ${
          isMirrored ? "-scale-x-100" : ""
        }`}
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <p
            className="text-white font-bold leading-relaxed tracking-wide transition-all"
            style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
          >
            {script || "ምንም ጽሑፍ አልተገኘም። እባክዎ በስቱዲዮው ውስጥ የዜና ጽሑፍ ያስገቡ።"}
          </p>
        </div>
      </div>

      {/* Subtle guide line in center of screen */}
      <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-[2px] bg-red-600/30 -translate-y-1/2 flex items-center justify-between px-4">
        <span className="text-[10px] font-mono text-red-500 bg-neutral-950/80 px-1 rounded">
          READ LINE
        </span>
        <span className="text-[10px] font-mono text-red-500 bg-neutral-950/80 px-1 rounded">
          READ LINE
        </span>
      </div>
    </div>
  );
};
