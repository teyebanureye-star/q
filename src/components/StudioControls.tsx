import React from "react";
import { Sliders, Music, Disc3, Mic2, Download, BellRing, VolumeX, Volume2 } from "lucide-react";
import { MusicBedType, StudioSettings } from "../types/studio";

interface StudioControlsProps {
  settings: StudioSettings;
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  onPreviewStinger: () => void;
  onExportMixedAudio: () => void;
  isExporting: boolean;
  isPlaying: boolean;
}

const MUSIC_OPTIONS: { id: MusicBedType; labelAmharic: string; desc: string }[] = [
  { id: "breaking", labelAmharic: "🚨 የሰበር ዜና ቴማ", desc: "አስቸኳይ እና ቀልብ ገዢ የሰበር ዜና ሪትም" },
  { id: "prime", labelAmharic: "🏛️ ፋና ዋና ዜና ቴማ", desc: "ግርማ ሞገስ ያለው የተከበረ የዜና አጃቢ" },
  { id: "analysis", labelAmharic: "🌍 የትንታኔና ዘገባ ቴማ", desc: "የተረጋጋ፣ ጥልቅና ረጋ ያለ የሰነድ ሙዚቃ" },
  { id: "tech", labelAmharic: "📱 የቴክኖሎጂና ቢዝነስ", desc: "ዘመናዊ እና ፈጣን የኤሌክትሮኒክ ዜማ" },
  { id: "none", labelAmharic: "🔇 ድምፅ ብቻ (Dry Vocals)", desc: "ሙዚቃ የሌለው ንጹህ የጋዜጠኛው ድምፅ" },
];

export const StudioControls: React.FC<StudioControlsProps> = ({
  settings,
  updateSettings,
  onPreviewStinger,
  onExportMixedAudio,
  isExporting,
  isPlaying,
}) => {
  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span>የስቱዲዮ ድምፅ ቅንብር (Broadcast Audio Console)</span>
        </h2>
        <span className="text-[11px] font-mono text-neutral-400">
          24kHz Studio Master
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Voice Cadence & Pitch */}
        <div className="space-y-4 bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800/80">
          <h3 className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
            <Mic2 className="w-3.5 h-3.5" />
            <span>የአንባቢው የንግግር ስልት (Voice Tuning)</span>
          </h3>

          {/* Speed Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>የንባብ ፍጥነት (Speed / Tempo)</span>
              <span className="font-mono text-amber-400">{settings.speechRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.25"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 pt-1">
              <button
                type="button"
                onClick={() => updateSettings({ speechRate: 0.85 })}
                className="hover:text-neutral-300"
              >
                የተረጋጋ (0.85x)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ speechRate: 0.98 })}
                className="hover:text-amber-400 font-semibold"
              >
                መደበኛ ዜና (1.0x)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ speechRate: 1.15 })}
                className="hover:text-neutral-300"
              >
                ሰበር ፈጣን (1.15x)
              </button>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>የድምፅ ቅላጼ (Voice Pitch)</span>
              <span className="font-mono text-amber-400">
                {settings.speechPitch < 0.95 ? "ጥልቅ (Baritone)" : settings.speechPitch > 1.05 ? "ቀጭን (Higher)" : "መደበኛ (Standard)"}
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={settings.speechPitch}
              onChange={(e) => updateSettings({ speechPitch: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
            />
          </div>

          {/* Intro Stinger Toggle */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-3.5 h-3.5 text-red-500" />
              <div>
                <p className="text-xs font-medium text-white">የመግቢያ ሰበር ዜና ጅንግል</p>
                <p className="text-[10px] text-neutral-400">ከዜናው በፊት ድምቀታዊ ጅንግል ይጫወት</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onPreviewStinger}
                className="px-2 py-0.5 text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
              >
                ጅንግሉን ሞክር
              </button>
              <input
                type="checkbox"
                checked={settings.includeIntroStinger}
                onChange={(e) => updateSettings({ includeIntroStinger: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Music Bed & Master Output */}
        <div className="space-y-4 bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800/80">
          <h3 className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            <span>የጀርባ ዜና ሙዚቃ (News Music Bed)</span>
          </h3>

          {/* Music Selection Options */}
          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
            {MUSIC_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                  settings.musicBed === opt.id
                    ? "bg-amber-500/10 border-amber-500/50 text-white"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <input
                    type="radio"
                    name="musicBed"
                    value={opt.id}
                    checked={settings.musicBed === opt.id}
                    onChange={() => updateSettings({ musicBed: opt.id })}
                    className="accent-amber-500 shrink-0"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-neutral-200 truncate">{opt.labelAmharic}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{opt.desc}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Music Volume and Ducking */}
          {settings.musicBed !== "none" && (
            <div className="space-y-2 pt-1 border-t border-neutral-800/60">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span className="flex items-center gap-1.5">
                  {settings.musicVolume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>የሙዚቃው ድምፅ (Music Volume)</span>
                </span>
                <span className="font-mono text-amber-400">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-neutral-400">
                  አውቶ-ዳኪንግ (ጋዜጠኛው ሲናገር ሙዚቃው ይቀንስ)
                </span>
                <input
                  type="checkbox"
                  checked={settings.autoDucking}
                  onChange={(e) => updateSettings({ autoDucking: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export / Download Master Mix Strip */}
      <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Disc3 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            የተቀላቀለውን ሙሉ የዜና ድምፅ (ድምፅ + ጅንግል + ሙዚቃ) ለቲክቶክና ቴሌግራም አውርድ
          </span>
        </div>

        <button
          type="button"
          onClick={onExportMixedAudio}
          disabled={isExporting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-emerald-950/40 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? "በማቀነባበር ላይ..." : "ድምፁን አውርድ (.WAV Export)"}</span>
        </button>
      </div>
    </div>
  );
};
