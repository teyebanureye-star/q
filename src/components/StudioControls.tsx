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

interface StudioControlsProps {
  settings: StudioSettings;
  updateSettings: (newSettings: Partial<StudioSettings>) => void;
  onPreviewStinger: () => void;
  onExportMixedAudio: () => void;
  isExporting: boolean;
  isPlaying: boolean;
  onPlaySoundEffect?: (type: SoundEffectType) => void;
}

const MUSIC_OPTIONS: { id: MusicBedType; labelAmharic: string; desc: string }[] = [
  { id: "breaking", labelAmharic: "🚨 የሰበር ዜና ቴማ", desc: "አስቸኳይ እና ቀልብ ገዢ የሰበር ዜና ሪትም" },
  { id: "prime", labelAmharic: "🏛️ ፋና ዋና ዜና ቴማ", desc: "ግርማ ሞገስ ያለው የተከበረ የዜና አጃቢ" },
  { id: "analysis", labelAmharic: "🌍 የትንታኔና ዘገባ ቴማ", desc: "የተረጋጋ፣ ጥልቅና ረጋ ያለ የሰነድ ሙዚቃ" },
  { id: "tech", labelAmharic: "📱 የቴክኖሎጂና ቢዝነስ", desc: "ዘመናዊ እና ፈጣን የኤሌክትሮኒክ ዜማ" },
  { id: "none", labelAmharic: "🔇 ድምፅ ብቻ (Dry Vocals)", desc: "ሙዚቃ የሌለው ንጹህ የጋዜጠኛው ድምፅ" },
];

const SOUND_EFFECTS: {
  id: SoundEffectType;
  labelAmharic: string;
  tag: string;
  desc: string;
  badgeColor: string;
}[] = [
  {
    id: "breaking_alert",
    labelAmharic: "🚨 የሰበር ዜና ማስታወቂያ (Breaking News Alert)",
    tag: "ALERT",
    desc: "አስቸኳይ የቢፕ ድምፆችና ኃይለኛ የባስ ኢምፓክት",
    badgeColor: "text-red-400 bg-red-950/60 border-red-800/80",
  },
  {
    id: "news_intro",
    labelAmharic: "🎺 የዜና መግቢያ ጅንግል (News Intro Fanfare)",
    tag: "FANFARE",
    desc: "የተከበረ የቴሌቪዥንና የሬዲዮ መግቢያ ትራምፔት",
    badgeColor: "text-amber-300 bg-amber-950/60 border-amber-800/80",
  },
  {
    id: "clock_chime",
    labelAmharic: "⏱️ የዜና ሰዓት ደወል (Top-of-Hour Pips)",
    tag: "TIME SIGNAL",
    desc: "ትክክለኛውን የዜና ሰዓት የሚያበስር የደወል ምልክት",
    badgeColor: "text-cyan-300 bg-cyan-950/60 border-cyan-800/80",
  },
  {
    id: "transition_swoosh",
    labelAmharic: "💥 የትራንዚሽን ስዉሽ (Transition Swoosh)",
    tag: "TRANSITION",
    desc: "ከአንድ ዜና ወደ ሌላ ዜና መሸጋገሪያ ሲኒማቲክ ድምፅ",
    badgeColor: "text-purple-300 bg-purple-950/60 border-purple-800/80",
  },
  {
    id: "social_ping",
    labelAmharic: "📲 የሶሻል ሚዲያ ኖቲፊኬሽን (Social Ping)",
    tag: "DIGITAL",
    desc: "ለቲክቶክና ቴሌግራም ተስማሚ ዘመናዊ የደወል ድምፅ",
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
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/30 space-y-5">
      {/* Console Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white">
            የስቱዲዮ ድምፅ ቅንብርና ማቀናበሪያ (Audio Mixer & Soundboard)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-amber-400/80 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
          Studio Master Console
        </span>
      </div>

      {/* NEW: Dedicated Sound Effects & Jingles Mixer Section */}
      <div className="bg-neutral-950/90 p-4 rounded-xl border border-amber-500/30 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                የድምፅ ተፅዕኖዎችና ጅንግሎች (Sound Effects & Alert Jingles)
              </h3>
              <p className="text-[10px] text-neutral-400">
                በዜናው መጀመሪያ ወይም መሃል የሚገቡ ማራኪ የቴሌቪዥንና ሬዲዮ ድምፆች
              </p>
            </div>
          </div>

          {/* Intro Stinger Master Toggle */}
          <label className="flex items-center gap-2 cursor-pointer bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800">
            <input
              type="checkbox"
              checked={settings.includeIntroStinger}
              onChange={(e) => updateSettings({ includeIntroStinger: e.target.checked })}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-neutral-200">
              የመግቢያ ድምፅ ይግባ (Intro SFX)
            </span>
          </label>
        </div>

        {/* SFX Volume Slider */}
        <div className="bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Volume1 className="w-3.5 h-3.5 text-amber-400" />
              <span>የድምፅ ተፅዕኖዎች መጠን (SFX Volume)</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">
              {Math.round((settings.sfxVolume ?? 0.85) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.sfxVolume ?? 0.85}
            onChange={(e) => updateSettings({ sfxVolume: parseFloat(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-neutral-800 rounded-lg"
          />
        </div>

        {/* Sound Effects Selector & Instant Live Soundboard */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-neutral-400 block">
            የሚፈለገውን የዜና መግቢያ ድምፅ ይምረጡ ወይም በቀጥታ ለመሞከር ጠቅ ያድርጉ፦
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SOUND_EFFECTS.map((sfx) => {
              const isSelected = settings.introSoundEffect === sfx.id;
              const isActive = activePad === sfx.id;

              return (
                <div
                  key={sfx.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    isActive
                      ? "bg-amber-500/25 border-amber-400 shadow-lg scale-[1.01]"
                      : isSelected && settings.includeIntroStinger
                      ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                      : "bg-neutral-900/80 border-neutral-800/80 hover:border-neutral-700"
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer truncate flex-1">
                    <input
                      type="radio"
                      name="introSoundEffect"
                      value={sfx.id}
                      checked={isSelected}
                      onChange={() =>
                        updateSettings({
                          introSoundEffect: sfx.id,
                          includeIntroStinger: true,
                        })
                      }
                      className="accent-amber-500 shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-xs font-bold text-white truncate">
                          {sfx.labelAmharic}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1 py-0.2 rounded border uppercase font-bold shrink-0 ${sfx.badgeColor}`}
                        >
                          {sfx.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{sfx.desc}</p>
                    </div>
                  </label>

                  {/* Instant Test / Play Button */}
                  <button
                    type="button"
                    onClick={() => triggerSoundboard(sfx.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-neutral-700/80 text-[11px] font-semibold shrink-0 transition-transform active:scale-95"
                    title="ድምፁን ወዲያውኑ አድምጥ"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>አድምጥ</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Section: Voice Tuning & Music Bed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Voice Tuning */}
        <div className="space-y-3.5 bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80">
          <h3 className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
            <Mic2 className="w-3.5 h-3.5" />
            <span>የአንባቢው የንግግር ስልት (Voice Tuning)</span>
          </h3>

          {/* Speed Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>የንባብ ፍጥነት (Speed / Tempo)</span>
              <span className="font-mono text-amber-400 font-bold">{settings.speechRate.toFixed(2)}x</span>
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
            <div className="flex justify-between text-[10px] text-neutral-400 pt-1">
              <button
                type="button"
                onClick={() => updateSettings({ speechRate: 0.85 })}
                className="hover:text-amber-300"
              >
                የተረጋጋ (0.85x)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ speechRate: 0.98 })}
                className="hover:text-amber-300 font-semibold text-neutral-300"
              >
                መደበኛ (1.0x)
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ speechRate: 1.15 })}
                className="hover:text-amber-300"
              >
                ሰበር ፈጣን (1.15x)
              </button>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300 mb-1.5">
              <span>የድምፅ ቅላጼ (Voice Pitch)</span>
              <span className="font-mono text-amber-400 font-semibold">
                {settings.speechPitch < 0.95
                  ? "ጥልቅ (Baritone)"
                  : settings.speechPitch > 1.05
                  ? "ቀጭን (Crisp)"
                  : "መደበኛ (Standard)"}
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
        </div>

        {/* Right Column: Music Bed & Auto-Ducking */}
        <div className="space-y-3.5 bg-neutral-950/70 p-3.5 rounded-xl border border-neutral-800/80">
          <h3 className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5" />
            <span>የጀርባ ዜና ሙዚቃ (News Music Bed)</span>
          </h3>

          {/* Music Selection Options */}
          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {MUSIC_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                  settings.musicBed === opt.id
                    ? "bg-amber-500/15 border-amber-500/60 text-white"
                    : "bg-neutral-900/80 border-neutral-800/80 text-neutral-400 hover:text-neutral-200"
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
                  <span>የሙዚቃው ድምፅ</span>
                </span>
                <span className="font-mono text-amber-400 font-bold">
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

      {/* Export Audio Strip */}
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-950/40 transition-colors whitespace-nowrap disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExporting ? "በማቀነባበር ላይ..." : "ድምፁን አውርድ (.WAV Export)"}</span>
        </button>
      </div>
    </div>
  );
};
