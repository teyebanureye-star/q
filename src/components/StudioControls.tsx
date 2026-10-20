import React, { useState } from "react";
import {
  Sliders,
  Music,
  Disc3,
  Mic2,
  Download,
  BellRing,
  Volume2,
  Zap,
  Play,
  Scissors,
} from "lucide-react";
import { MusicBedType, SoundEffectType, StudioSettings } from "../types/studio";
import { useLanguage } from "../context/LanguageContext";
import { openCapCut } from "../utils/mediaMerger";

interface StudioControlsProps {
  settings: StudioSettings;
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  onPreviewStinger: () => void;
  onExportMixedAudio: () => void;
  isExporting: boolean;
  isPlaying: boolean;
  onPlaySoundEffect?: (type: SoundEffectType) => void;
}

const MUSIC_OPTIONS: {
  id: MusicBedType;
  labelAmharic: string;
  labelEnglish: string;
}[] = [
  { id: "breaking", labelAmharic: "🚨 የሰበር ዜና ቴማ", labelEnglish: "🚨 Breaking News" },
  { id: "prime", labelAmharic: "🏛️ ዋና ዜና ቴማ", labelEnglish: "🏛️ Prime News" },
  { id: "analysis", labelAmharic: "🌍 ትንታኔና ዘገባ", labelEnglish: "🌍 World Analysis" },
  { id: "tech", labelAmharic: "📱 ቴክኖሎጂና ቢዝነስ", labelEnglish: "📱 Tech & Economy" },
  { id: "none", labelAmharic: "🔇 ድምፅ ብቻ", labelEnglish: "🔇 Voice Only" },
];

const SOUND_EFFECTS: {
  id: SoundEffectType;
  labelAmharic: string;
  labelEnglish: string;
  tag: string;
  badgeColor: string;
}[] = [
  {
    id: "breaking_alert",
    labelAmharic: "🚨 ሰበር ዜና",
    labelEnglish: "🚨 Breaking Alert",
    tag: "ALERT",
    badgeColor: "text-red-400 bg-red-950/60 border-red-800/80",
  },
  {
    id: "news_intro",
    labelAmharic: "🎺 መግቢያ ጅንግል",
    labelEnglish: "🎺 News Intro",
    tag: "INTRO",
    badgeColor: "text-amber-300 bg-amber-950/60 border-amber-800/80",
  },
  {
    id: "clock_chime",
    labelAmharic: "⏱️ የሰዓት ደወል",
    labelEnglish: "⏱️ Hour Pips",
    tag: "TIME",
    badgeColor: "text-cyan-300 bg-cyan-950/60 border-cyan-800/80",
  },
  {
    id: "transition_swoosh",
    labelAmharic: "💥 መሸጋገሪያ ስዉሽ",
    labelEnglish: "💥 Transition",
    tag: "SWOOSH",
    badgeColor: "text-purple-300 bg-purple-950/60 border-purple-800/80",
  },
  {
    id: "social_ping",
    labelAmharic: "📲 ሶሻል ፒንግ",
    labelEnglish: "📲 Social Ping",
    tag: "PING",
    badgeColor: "text-emerald-300 bg-emerald-950/60 border-emerald-800/80",
  },
];

export const StudioControls: React.FC<StudioControlsProps> = ({
  settings,
  updateSettings,
  onPreviewStinger,
  onExportMixedAudio,
  isExporting,
  isPlaying,
  onPlaySoundEffect,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";
  const [activePad, setActivePad] = useState<string | null>(null);

  const triggerSoundboard = (type: SoundEffectType) => {
    setActivePad(type);
    if (onPlaySoundEffect) {
      onPlaySoundEffect(type);
    } else {
      onPreviewStinger();
    }
    setTimeout(() => setActivePad(null), 800);
  };

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-4 font-sans">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            {isEn ? "Audio Mixer" : "የድምፅ ማቀናበሪያ"}
          </h2>
        </div>
      </div>

      {/* Sound Effects & Jingles Mixer Section */}
      <div className="bg-neutral-950/90 p-3.5 rounded-xl border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isEn ? "Sound Effects" : "የድምፅ ተፅዕኖዎች"}
            </h3>
          </div>

          {/* Intro Stinger Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
            <input
              type="checkbox"
              checked={settings.includeIntroStinger}
              onChange={(e) => updateSettings({ includeIntroStinger: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-xs text-neutral-200 font-medium">
              {isEn ? "Intro Stinger" : "መግቢያ ድምፅ"}
            </span>
          </label>
        </div>

        {/* Live Soundboard Pads */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SOUND_EFFECTS.map((fx) => {
            const isSelectedIntro = settings.introSoundEffect === fx.id;
            const isPadTriggered = activePad === fx.id;

            return (
              <div
                key={fx.id}
                onClick={() => {
                  updateSettings({ introSoundEffect: fx.id, includeIntroStinger: true });
                  triggerSoundboard(fx.id);
                }}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelectedIntro
                    ? "bg-neutral-900 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                    : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                } ${isPadTriggered ? "scale-95 brightness-125" : ""}`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${fx.badgeColor} font-bold`}>
                    {fx.tag}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerSoundboard(fx.id);
                    }}
                    className="p-1 rounded-md bg-neutral-800 text-neutral-300 hover:text-white hover:bg-amber-500 hover:text-neutral-950 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </button>
                </div>

                <p className="text-xs font-bold text-white leading-tight truncate">
                  {isEn ? fx.labelEnglish : fx.labelAmharic}
                </p>

                {isSelectedIntro && (
                  <div className="text-[9px] font-mono font-bold text-amber-400 flex items-center gap-1 pt-1 border-t border-neutral-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>{isEn ? "Selected" : "የተመረጠ"}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SFX Volume */}
        <div className="flex items-center gap-3 pt-1">
          <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-xs text-neutral-300 shrink-0 font-medium">
            {isEn ? "FX Volume:" : "የተፅዕኖ ድምፅ፦"}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.sfxVolume}
            onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-amber-400 w-9 text-right tabular-nums">
            {Math.round(settings.sfxVolume * 100)}%
          </span>
        </div>
      </div>

      {/* Sliders: Speed, Pitch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Speed Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Speech Rate" : "ፍጥነት"}</span>
            </span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">
              {settings.speechRate.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.25"
            step="0.02"
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Pitch Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1.5">
              <Mic2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Pitch" : "ቃና"}</span>
            </span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">
              {settings.speechPitch.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0.75"
            max="1.25"
            step="0.02"
            value={settings.speechPitch}
            onChange={(e) => updateSettings({ speechPitch: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Music Bed Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEn ? "Music Bed" : "ዳራ ሙዚቃ"}</span>
          </span>
          <span className="text-[10px] text-neutral-400">
            <strong className="text-amber-400">
              {MUSIC_OPTIONS.find((m) => m.id === settings.musicBed)?.[isEn ? "labelEnglish" : "labelAmharic"]}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {MUSIC_OPTIONS.map((bed) => {
            const isSelected = settings.musicBed === bed.id;
            return (
              <button
                key={bed.id}
                type="button"
                onClick={() => updateSettings({ musicBed: bed.id })}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500 text-amber-200 shadow-md shadow-amber-950/20"
                    : "bg-neutral-950/60 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                }`}
              >
                <div className="font-bold text-xs truncate">
                  {isEn ? bed.labelEnglish : bed.labelAmharic}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Music Volume, Auto-Ducking, Export & CapCut */}
      <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-44">
            <Disc3 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => updateSettings({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <span className="text-xs font-mono text-amber-400 w-8 text-right tabular-nums">
              {Math.round(settings.musicVolume * 100)}%
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.autoDucking}
              onChange={(e) => updateSettings({ autoDucking: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-xs text-neutral-300 font-medium">
              {isEn ? "Auto-Ducking" : "ዳኪንግ"}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={settings.autoEq ?? true}
              onChange={(e) => updateSettings({ autoEq: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-xs text-neutral-300 font-medium">
              Auto-EQ
            </span>
          </label>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* CapCut Launcher */}
          <button
            type="button"
            onClick={openCapCut}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-all cursor-pointer"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>CapCut</span>
          </button>

          {/* Export WAV Button */}
          <button
            type="button"
            onClick={onExportMixedAudio}
            disabled={isExporting || isPlaying}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? (isEn ? "Mixing..." : "በማቀናበር ላይ...") : (isEn ? "Export" : "አውርድ")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
