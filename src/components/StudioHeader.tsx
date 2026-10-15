import React from "react";
import { Radio, Mic, Play, Square, Loader2 } from "lucide-react";

interface StudioHeaderProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayClick: () => void;
  onStopClick: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  isPlaying,
  isLoading,
  onPlayClick,
  onStopClick,
  activeSection,
  setActiveSection,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 via-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-950/40">
            <Radio className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            FANA VOICE STUDIO
          </span>
          <span className="hidden sm:inline-block text-xs font-medium text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            የዜና ስቱዲዮ
          </span>
        </div>

        {/* Zone 2: 4–5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveSection("studio")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeSection === "studio" ? "text-amber-400 font-semibold" : ""
            }`}
          >
            ዋና ስቱዲዮ (Studio)
          </button>
          <button
            onClick={() => setActiveSection("anchors")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeSection === "anchors" ? "text-amber-400 font-semibold" : ""
            }`}
          >
            አቅራቢዎች (Anchors)
          </button>
          <button
            onClick={() => setActiveSection("templates")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeSection === "templates" ? "text-amber-400 font-semibold" : ""
            }`}
          >
            የዜና አብነቶች (Templates)
          </button>
          <button
            onClick={() => setActiveSection("controls")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeSection === "controls" ? "text-amber-400 font-semibold" : ""
            }`}
          >
            የድምፅ ቅንብር (Mixer)
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {isPlaying ? (
            <button
              onClick={onStopClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-900/40 transition-all whitespace-nowrap"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>አቁም (Stop)</span>
            </button>
          ) : (
            <button
              onClick={onPlayClick}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-lg shadow-amber-950/40 transition-all whitespace-nowrap disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>ድምፅ በማዘጋጀት ላይ...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>ዜናውን አንብብ (Broadcast)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
