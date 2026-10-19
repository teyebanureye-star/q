import React, { useState } from "react";
import {
  Sliders,
  Music,
  Disc3,
  Mic2,
  Download,
  BellRing,
  VolumeX,
  Volume2,
  Sparkles,
  Zap,
  Radio,
  Play,
  Volume1,
  Layers,
} from "lucide-react";
import { MusicBedType, SoundEffectType, StudioSettings } from "../types/studio";
import { useLanguage } from "../context/LanguageContext";

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
  descAmharic: string;
  descEnglish: string;
}[] = [
  {
    id: "breaking",
    labelAmharic: "🚨 የሰበር ዜና ቴማ",
    labelEnglish: "🚨 Breaking News Theme",
    descAmharic: "አስቸኳይ እና ቀልብ ገዢ የሰበር ዜና ሪትም",
    descEnglish: "High-urgency dramatic newsroom pulse",
  },
  {
    id: "prime",
    labelAmharic: "🏛️ ፋና ዋና ዜና ቴማ",
    labelEnglish: "🏛️ Prime Evening News",
    descAmharic: "ግርማ ሞገስ ያለው የተከበረ የዜና አጃቢ",
    descEnglish: "Majestic authoritative orchestral theme",
  },
  {
    id: "analysis",
    labelAmharic: "🌍 የትንታኔና ዘገባ ቴማ",
    labelEnglish: "🌍 World Analysis & Documentaries",
    descAmharic: "የተረጋጋ፣ ጥልቅና ረጋ ያለ የሰነድ ሙዚቃ",
    descEnglish: "Calm, thoughtful documentary underscore",
  },
  {
    id: "tech",
    labelAmharic: "📱 የቴክኖሎጂና ቢዝነስ",
    labelEnglish: "📱 Tech & Economy Beat",
    descAmharic: "ዘመናዊ እና ፈጣን የኤሌክትሮኒክ ዜማ",
    descEnglish: "Modern electronic broadcast groove",
  },
  {
    id: "none",
    labelAmharic: "🔇 ድምፅ ብቻ (Dry Vocals)",
    labelEnglish: "🔇 Dry Vocals (Voice Only)",
    descAmharic: "ሙዚቃ የሌለው ንጹህ የጋዜጠኛው ድምፅ",
    descEnglish: "Pure clean voiceover without music",
  },
];

const SOUND_EFFECTS: {
  id: SoundEffectType;
  labelAmharic: string;
  labelEnglish: string;
  tag: string;
  descAmharic: string;
  descEnglish: string;
  badgeColor: string;
}[] = [
  {
    id: "breaking_alert",
    labelAmharic: "🚨 የሰበር ዜና ማስታወቂያ (Breaking News Alert)",
    labelEnglish: "🚨 Breaking News Alert",
    tag: "ALERT",
    descAmharic: "አስቸኳይ የቢፕ ድምፆችና ኃይለኛ የባስ ኢምፓክት",
    descEnglish: "Urgent pings and deep sub-bass impact",
    badgeColor: "text-red-400 bg-red-950/60 border-red-800/80",
  },
  {
    id: "news_intro",
    labelAmharic: "🎺 የዜና መግቢያ ጅንግል (News Intro Fanfare)",
    labelEnglish: "🎺 News Intro Fanfare",
    tag: "FANFARE",
    descAmharic: "የተከበረ የቴሌቪዥንና የሬዲዮ መግቢያ ትራምፔት",
    descEnglish: "Classic television opening fanfare",
    badgeColor: "text-amber-300 bg-amber-950/60 border-amber-800/80",
  },
  {
    id: "clock_chime",
    labelAmharic: "⏱️ የዜና ሰዓት ደወል (Top-of-Hour Pips)",
    labelEnglish: "⏱️ Top-of-Hour Pips",
    tag: "TIME SIGNAL",
    descAmharic: "ትክክለኛውን የዜና ሰዓት የሚያበስር የደወል ምልክት",
    descEnglish: "Broadcast clock synchronization chime",
    badgeColor: "text-cyan-300 bg-cyan-950/60 border-cyan-800/80",
  },
  {
    id: "transition_swoosh",
    labelAmharic: "💥 የትራንዚሽን ስዉሽ (Transition Swoosh)",
    labelEnglish: "💥 Transition Swoosh",
    tag: "TRANSITION",
    descAmharic: "ከአንድ ዜና ወደ ሌላ ዜና መሸጋገሪያ ሲኒማቲክ ድምፅ",
    descEnglish: "Cinematic story transition whoosh",
    badgeColor: "text-purple-300 bg-purple-950/60 border-purple-800/80",
  },
  {
    id: "social_ping",
    labelAmharic: "📲 የሶሻል ሚዲያ ኖቲፊኬሽን (Social Ping)",
    labelEnglish: "📲 Social Media Ping",
    tag: "DIGITAL",
    descAmharic: "ለቲክቶክና ቴሌግራም ተስማሚ ዘመናዊ የደወል ድምፅ",
    descEnglish: "Modern notification sound for short clips",
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
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-5 font-sans">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            {isEn ? "Studio Audio Mixer & Soundboard" : "የስቱዲዮ ድምፅ ቅንብርና ማቀናበሪያ (Audio Mixer & Soundboard)"}
          </h2>
        </div>
        <span className="text-[11px] font-mono text-amber-400/80 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
          Studio Master Console
        </span>
      </div>

      {/* Dedicated Sound Effects & Jingles Mixer Section */}
      <div className="bg-neutral-950/90 p-4 rounded-xl border border-amber-500/30 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {isEn ? "Sound Effects & Alert Jingles" : "የድምፅ ተፅዕኖዎችና ጅንግሎች (Sound Effects & Alert Jingles)"}
              </h3>
              <p className="text-[10px] text-neutral-400">
                {isEn ? "Pre-broadcast openers, alerts, and segment transitions" : "በዜናው መጀመሪያ ወይም መሃል የሚገቡ ማራኪ የቴሌቪዥንና ሬዲዮ ድምፆች"}
              </p>
            </div>
          </div>

          {/* Intro Stinger Master Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
            <input
              type="checkbox"
              checked={settings.includeIntroStinger}
              onChange={(e) => updateSettings({ includeIntroStinger: e.target.checked })}
              className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-xs text-neutral-200 font-medium">
              {isEn ? "Play before broadcast" : "በስርጭቱ መጀመሪያ ይግባ"}
            </span>
          </label>
        </div>

        {/* 1-Click Interactive Live Soundboard Pads */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-300/90 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{isEn ? "Live Broadcast Soundboard Pads (Click to Play)" : "የቀጥታ ስቱዲዮ የድምፅ ፓዶች (ጠቅ በማድረግ ያሰሙ)"}</span>
            </span>
            <span className="text-[10px] text-neutral-500 hidden sm:inline">
              {isEn ? "Real-Time Synth FX" : "ወዲያውኑ ይሰማል"}
            </span>
          </div>

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
                      ? "bg-neutral-900 border-amber-500 shadow-md shadow-amber-950/30 ring-1 ring-amber-500/50"
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
                      title={isEn ? "Test Sound" : "ድምፁን ሞክር"}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-white leading-tight truncate">
                    {isEn ? fx.labelEnglish : fx.labelAmharic}
                  </p>

                  <p className="text-[10px] text-neutral-400 line-clamp-1">
                    {isEn ? fx.descEnglish : fx.descAmharic}
                  </p>

                  {isSelectedIntro && (
                    <div className="text-[9px] font-mono font-bold text-amber-400 flex items-center gap-1 pt-1 border-t border-neutral-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>{isEn ? "Selected" : "የተመረጠ መግቢያ"}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SFX Volume Slider */}
        <div className="flex items-center gap-3 pt-1">
          <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="text-xs text-neutral-300 shrink-0 font-medium">
            {isEn ? "Sound FX Volume:" : "የተፅዕኖዎች ድምፅ መጠን፦"}
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

      {/* Primary Mixing Sliders: Speed, Pitch, Music Bed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Speed Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Speech Rate (Pacing)" : "የማንበቢያ ፍጥነት (Speed)"}</span>
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
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>{isEn ? "Calm (0.8x)" : "ረጋ ያለ (0.8x)"}</span>
            <span>{isEn ? "Standard (1.0x)" : "መደበኛ (1.0x)"}</span>
            <span>{isEn ? "Urgent (1.25x)" : "ፈጣን ሰበር (1.25x)"}</span>
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium flex items-center gap-1.5">
              <Mic2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? "Voice Pitch & Tone" : "የድምፅ ቃና (Tone Pitch)"}</span>
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
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
            <span>{isEn ? "Deep Baritone (0.75)" : "ጎርነን ያለ (0.75)"}</span>
            <span>{isEn ? "Natural (1.0)" : "ተፈጥሯዊ (1.0)"}</span>
            <span>{isEn ? "Crisp Treble (1.25)" : "ጥርት ያለ (1.25)"}</span>
          </div>
        </div>
      </div>

      {/* Music Bed Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEn ? "News Background Music Bed" : "የዜና ዳራ ሙዚቃ (Theme Music)"}</span>
          </span>
          <span className="text-[10px] text-neutral-400">
            {isEn ? "Selected: " : "የተመረጠ፦ "}
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
                <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                  {isEn ? bed.descEnglish : bed.descAmharic}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Mixing Controls: Music Volume, Auto-Ducking, Export */}
      <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Music Volume & Auto-Ducking */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:w-48">
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
              {isEn ? "Auto-Ducking" : "ዳኪንግ (Auto-Ducking)"}
            </span>
          </label>
        </div>

        {/* Master Export WAV Button */}
        <button
          type="button"
          onClick={onExportMixedAudio}
          disabled={isExporting || isPlaying}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
          title={isEn ? "Export combined WAV master audio file" : "የተቀናበረውን የዜና ድምፅ በ WAV ፋይል አውርድ"}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? (isEn ? "Mixing WAV..." : "በማቀናበር ላይ...") : (isEn ? "Export Master WAV" : "ድምፁን አውርድ (Export WAV)")}</span>
        </button>
      </div>
    </div>
  );
};
