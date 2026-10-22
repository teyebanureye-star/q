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
  Activity,
  Gauge,
  RotateCcw,
  Sparkles,
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

interface SoundFxItem {
  id: SoundEffectType;
  labelAmharic: string;
  labelEnglish: string;
  category: "etv" | "amhara" | "general";
  tag: string;
  badgeColor: string;
  isOutroCompatible?: boolean;
  isIntroCompatible?: boolean;
}

const SOUND_EFFECTS: SoundFxItem[] = [
  // ETV (የኢትዮጵያ ቴሌቪዥን)
  {
    id: "etv_news_intro",
    labelAmharic: "🏛️ ETV ዜና መክፈቻ",
    labelEnglish: "🏛️ ETV News Fanfare",
    category: "etv",
    tag: "ETV INTRO",
    badgeColor: "text-amber-300 bg-amber-950/60 border-amber-800/80",
    isIntroCompatible: true,
  },
  {
    id: "etv_breaking_intro",
    labelAmharic: "🚨 ETV ሰበር ዜና",
    labelEnglish: "🚨 ETV Breaking Alert",
    category: "etv",
    tag: "ETV ALERT",
    badgeColor: "text-red-400 bg-red-950/60 border-red-800/80",
    isIntroCompatible: true,
  },
  {
    id: "etv_outro_stinger",
    labelAmharic: "📺 ETV ዜና መዝጊያ",
    labelEnglish: "📺 ETV News Outro",
    category: "etv",
    tag: "ETV OUTRO",
    badgeColor: "text-blue-300 bg-blue-950/60 border-blue-800/80",
    isOutroCompatible: true,
  },

  // Amhara Media Corporation (አማራ ሚዲያ ኮርፖሬሽን / AMC)
  {
    id: "amhara_media_intro",
    labelAmharic: "🦅 አማራ ሚዲያ መክፈቻ",
    labelEnglish: "🦅 AMC News Theme",
    category: "amhara",
    tag: "AMC INTRO",
    badgeColor: "text-emerald-300 bg-emerald-950/60 border-emerald-800/80",
    isIntroCompatible: true,
  },
  {
    id: "amhara_media_bulletin",
    labelAmharic: "⚡ አማራ ሚዲያ ሰበር",
    labelEnglish: "⚡ AMC Urgent Alert",
    category: "amhara",
    tag: "AMC ALERT",
    badgeColor: "text-orange-400 bg-orange-950/60 border-orange-800/80",
    isIntroCompatible: true,
  },
  {
    id: "amhara_media_outro",
    labelAmharic: "📡 አማራ ሚዲያ መዝጊያ",
    labelEnglish: "📡 AMC News Outro",
    category: "amhara",
    tag: "AMC OUTRO",
    badgeColor: "text-teal-300 bg-teal-950/60 border-teal-800/80",
    isOutroCompatible: true,
  },

  // General Studio Effects
  {
    id: "breaking_alert",
    labelAmharic: "🚨 ዓለምአቀፍ ሰበር",
    labelEnglish: "🚨 Global Alert",
    category: "general",
    tag: "ALERT",
    badgeColor: "text-red-400 bg-red-950/60 border-red-800/80",
    isIntroCompatible: true,
  },
  {
    id: "news_intro",
    labelAmharic: "🎺 ክላሲክ ጅንግል",
    labelEnglish: "🎺 Classic Fanfare",
    category: "general",
    tag: "INTRO",
    badgeColor: "text-amber-300 bg-amber-950/60 border-amber-800/80",
    isIntroCompatible: true,
  },
  {
    id: "clock_chime",
    labelAmharic: "⏱️ የሰዓት ደወል",
    labelEnglish: "⏱️ Hour Pips",
    category: "general",
    tag: "TIME",
    badgeColor: "text-cyan-300 bg-cyan-950/60 border-cyan-800/80",
    isOutroCompatible: true,
  },
  {
    id: "transition_swoosh",
    labelAmharic: "💥 መሸጋገሪያ ስዉሽ",
    labelEnglish: "💥 Transition",
    category: "general",
    tag: "SWOOSH",
    badgeColor: "text-purple-300 bg-purple-950/60 border-purple-800/80",
    isOutroCompatible: true,
  },
  {
    id: "social_ping",
    labelAmharic: "📲 ሶሻል ፒንግ",
    labelEnglish: "📲 Social Ping",
    category: "general",
    tag: "PING",
    badgeColor: "text-emerald-300 bg-emerald-950/60 border-emerald-800/80",
    isOutroCompatible: true,
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
  const [soundCategory, setSoundCategory] = useState<"all" | "etv" | "amhara" | "general">("all");

  const triggerSoundboard = (type: SoundEffectType) => {
    setActivePad(type);
    if (onPlaySoundEffect) {
      onPlaySoundEffect(type);
    } else {
      onPreviewStinger();
    }
    setTimeout(() => setActivePad(null), 800);
  };

  const filteredSounds = soundCategory === "all" 
    ? SOUND_EFFECTS 
    : SOUND_EFFECTS.filter((s) => s.category === soundCategory);

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
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {isEn ? "Intro & Outro Stingers" : "የዜና መግቢያና መዝጊያ ጅንግሎች"}
            </h3>
          </div>

          {/* Category Tabs: All, ETV, Amhara Media, General */}
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: isEn ? "All" : "ሁሉም" },
              { id: "etv", label: "🏛️ ETV" },
              { id: "amhara", label: "🦅 አማራ ሚዲያ" },
              { id: "general", label: isEn ? "Other" : "ሌሎች" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSoundCategory(tab.id as any)}
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold transition-all cursor-pointer ${
                  soundCategory === tab.id
                    ? "bg-amber-500 text-neutral-950"
                    : "bg-neutral-900 text-neutral-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual Broadcast Automation Row: Intro (ከዜና በፊት) & Outro (ከዜና በኋላ) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2 rounded-lg bg-neutral-900/80 border border-neutral-800">
          {/* Intro Stinger (ከዜና በፊት) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeIntroStinger}
                  onChange={(e) => updateSettings({ includeIntroStinger: e.target.checked })}
                  className="w-3.5 h-3.5 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-amber-300">
                  {isEn ? "Intro (Before News):" : "ከዜና በፊት (መግቢያ)፦"}
                </span>
              </label>
            </div>
            <select
              value={settings.introSoundEffect}
              onChange={(e) => updateSettings({ introSoundEffect: e.target.value as SoundEffectType, includeIntroStinger: true })}
              className="w-full bg-neutral-950 text-neutral-200 text-xs rounded-md p-1.5 border border-neutral-700 outline-none focus:border-amber-500"
            >
              <optgroup label="ETV (የኢትዮጵያ ቴሌቪዥን)">
                <option value="etv_news_intro">🏛️ ETV ዜና መክፈቻ (Fanfare)</option>
                <option value="etv_breaking_intro">🚨 ETV ሰበር ዜና (Breaking Alert)</option>
              </optgroup>
              <optgroup label="Amhara Media Corporation (አማራ ሚዲያ)">
                <option value="amhara_media_intro">🦅 አማራ ሚዲያ መክፈቻ (AMC Theme)</option>
                <option value="amhara_media_bulletin">⚡ አማራ ሚዲያ ሰበር (AMC Alert)</option>
              </optgroup>
              <optgroup label="General / አጠቃላይ">
                <option value="breaking_alert">🚨 ዓለምአቀፍ ሰበር (Global Alert)</option>
                <option value="news_intro">🎺 ክላሲክ ጅንግል (Classic Intro)</option>
                <option value="none">🔇 የለም (None)</option>
              </optgroup>
            </select>
          </div>

          {/* Outro Stinger (ከዜና በኋላ) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeOutroStinger}
                  onChange={(e) => updateSettings({ includeOutroStinger: e.target.checked })}
                  className="w-3.5 h-3.5 accent-cyan-500 rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-cyan-300">
                  {isEn ? "Outro (After News):" : "ከዜና በኋላ (መዝጊያ)፦"}
                </span>
              </label>
            </div>
            <select
              value={settings.outroSoundEffect || "etv_outro_stinger"}
              onChange={(e) => updateSettings({ outroSoundEffect: e.target.value as SoundEffectType, includeOutroStinger: true })}
              className="w-full bg-neutral-950 text-neutral-200 text-xs rounded-md p-1.5 border border-neutral-700 outline-none focus:border-cyan-500"
            >
              <optgroup label="ETV (የኢትዮጵያ ቴሌቪዥን)">
                <option value="etv_outro_stinger">📺 ETV ዜና መዝጊያ (ETV Outro)</option>
              </optgroup>
              <optgroup label="Amhara Media Corporation (አማራ ሚዲያ)">
                <option value="amhara_media_outro">📡 አማራ ሚዲያ መዝጊያ (AMC Outro)</option>
              </optgroup>
              <optgroup label="General / አጠቃላይ">
                <option value="clock_chime">⏱️ የሰዓት ደወል (Top-of-Hour Pips)</option>
                <option value="transition_swoosh">💥 መሸጋገሪያ ስዉሽ (Swoosh)</option>
                <option value="social_ping">📲 ሶሻል ፒንግ (Social Ping)</option>
                <option value="none">🔇 የለም (None)</option>
              </optgroup>
            </select>
          </div>
        </div>

        {/* Live Soundboard Pads Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredSounds.map((fx) => {
            const isSelectedIntro = settings.introSoundEffect === fx.id;
            const isSelectedOutro = settings.outroSoundEffect === fx.id;
            const isPadTriggered = activePad === fx.id;

            return (
              <div
                key={fx.id}
                onClick={() => {
                  if (fx.isOutroCompatible) {
                    updateSettings({ outroSoundEffect: fx.id, includeOutroStinger: true });
                  } else {
                    updateSettings({ introSoundEffect: fx.id, includeIntroStinger: true });
                  }
                  triggerSoundboard(fx.id);
                }}
                className={`group relative p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isSelectedIntro
                    ? "bg-neutral-900 border-amber-500 shadow-md ring-1 ring-amber-500/50"
                    : isSelectedOutro
                    ? "bg-neutral-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/50"
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
                    className="p-1 rounded-md bg-neutral-800 text-neutral-300 hover:text-white hover:bg-amber-500 hover:text-neutral-950 transition-colors cursor-pointer"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </button>
                </div>

                <p className="text-xs font-bold text-white leading-tight truncate">
                  {isEn ? fx.labelEnglish : fx.labelAmharic}
                </p>

                {(isSelectedIntro || isSelectedOutro) && (
                  <div className="text-[9px] font-mono font-bold flex items-center gap-1 pt-1 border-t border-neutral-800">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isSelectedIntro ? "bg-amber-400" : "bg-cyan-400"}`} />
                    <span className={isSelectedIntro ? "text-amber-400" : "text-cyan-400"}>
                      {isSelectedIntro ? (isEn ? "Intro Pick" : "የተመረጠ መግቢያ") : (isEn ? "Outro Pick" : "የተመረጠ መዝጊያ")}
                    </span>
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

      {/* DEDICATED GLOBAL PROSODY & READING PACE CONTROLLER (REAL-TIME) */}
      {(() => {
        const getProsodyDetails = (rate: number) => {
          if (rate < 0.88) {
            return {
              label: isEn ? "Solemn & Measured" : "ዝግተኛና የተከበረ (Solemn)",
              desc: isEn ? "Spacious formal cadence for state announcements" : "ለከበዱና ለታላላቅ አገራዊ መግለጫዎች የሚሆን ስልት",
              badgeColor: "text-blue-400 bg-blue-950/80 border-blue-800",
              tag: "SOLEMN",
            };
          }
          if (rate <= 0.98) {
            return {
              label: isEn ? "Measured Newsroom" : "ረጋ ያለ መደበኛ (Measured)",
              desc: isEn ? "Reflective cadence for in-depth analysis & features" : "ለትንታኔና ረጋ ላለ የዜና ዘገባ",
              badgeColor: "text-cyan-400 bg-cyan-950/80 border-cyan-800",
              tag: "MEASURED",
            };
          }
          if (rate <= 1.05) {
            return {
              label: isEn ? "Prime Broadcast Standard" : "ዋና ዜና ስልት (Prime-Time)",
              desc: isEn ? "National evening television flagship cadence" : "ለዋናው የምሽት ዜና ስርጭት የተመጠነ ስልት",
              badgeColor: "text-amber-400 bg-amber-950/80 border-amber-800",
              tag: "PRIME",
            };
          }
          if (rate <= 1.18) {
            return {
              label: isEn ? "Dynamic Fast-Paced" : "ፈጣን ንባብ (Dynamic Paced)",
              desc: isEn ? "Brisk rhythmic momentum with energetic clarity" : "ለፈጣን ዜናዎችና ለንግድ ዘገባዎች",
              badgeColor: "text-orange-400 bg-orange-950/80 border-orange-800",
              tag: "DYNAMIC",
            };
          }
          return {
            label: isEn ? "Urgent Breaking Alert" : "አስቸኳይ ሰበር ዜና (Urgent Alert)",
            desc: isEn ? "High-urgency rapid tempo for breaking bulletins" : "ለሰበር ዜናና ለአስቸኳይ መረጃዎች",
            badgeColor: "text-red-400 bg-red-950/80 border-red-800",
            tag: "URGENT",
          };
        };

        const prosody = getProsodyDetails(settings.speechRate);

        return (
          <div className="bg-neutral-950/90 p-4 rounded-xl border border-amber-500/40 shadow-lg shadow-black/40 space-y-3.5 relative overflow-hidden">
            {/* Ambient accent background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Section Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-sm">
                  <Gauge className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>{isEn ? "Global Prosody & Reading Pace" : "የንባብ ስልትና ፍጥነት (Prosody & Pace)"}</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {isEn ? "Dynamically modulates neural cadence in real-time" : "በቀጥታ ድምፁ በሚያነብበት ቅጽበት ፍጥነትንና ስልትን ያስተካክላል"}
                  </p>
                </div>
              </div>

              {/* Live Sync Status Indicator */}
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 shadow-sm animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{isEn ? "LIVE REAL-TIME SYNC" : "በቀጥታ በቅጽበት ይስተካከላል"}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    <Activity className="w-3 h-3 text-amber-400" />
                    <span>{isEn ? "Neural Prosody" : "የነርቭ ንባብ ስልት"}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic Prosody Mood Banner */}
            <div className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${prosody.badgeColor}`}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/40 border border-current">
                  {prosody.tag}
                </span>
                <span className="text-xs font-bold text-white">
                  {prosody.label}
                </span>
              </div>
              <span className="text-[11px] text-neutral-300 font-medium">
                {prosody.desc}
              </span>
            </div>

            {/* Master Pace & Prosody Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? "Tempo / Pace Multiplier:" : "የፍጥነት መጣጣኝ፦"}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-300 font-extrabold text-sm bg-neutral-900 px-2.5 py-0.5 rounded border border-amber-500/40 tabular-nums">
                    {settings.speechRate.toFixed(2)}x
                  </span>
                </div>
              </div>

              <div className="relative pt-1">
                <input
                  type="range"
                  min="0.75"
                  max="1.35"
                  step="0.01"
                  value={settings.speechRate}
                  onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                />
                {/* Tick Mark Labels */}
                <div className="flex justify-between text-[10px] font-mono text-neutral-500 pt-1">
                  <span>0.75x (ዝግተኛ)</span>
                  <span>0.85x</span>
                  <span className="text-amber-400 font-bold">1.00x (መደበኛ)</span>
                  <span>1.15x</span>
                  <span>1.35x (ሰበር)</span>
                </div>
              </div>

              {/* Quick-Jump Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {[
                  { rate: 0.85, labelAmharic: "🏛️ 0.85x ዝግተኛ", labelEnglish: "🏛️ 0.85x Solemn" },
                  { rate: 1.00, labelAmharic: "🎙️ 1.00x መደበኛ", labelEnglish: "🎙️ 1.00x Normal" },
                  { rate: 1.12, labelAmharic: "⚡ 1.12x ፈጣን", labelEnglish: "⚡ 1.12x Brisk" },
                  { rate: 1.25, labelAmharic: "🚨 1.25x ሰበር", labelEnglish: "🚨 1.25x Alert" },
                ].map((p) => {
                  const isCurrent = Math.abs(settings.speechRate - p.rate) < 0.02;
                  return (
                    <button
                      key={p.rate}
                      type="button"
                      onClick={() => updateSettings({ speechRate: p.rate })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                        isCurrent
                          ? "bg-amber-500 text-neutral-950 shadow-md ring-1 ring-amber-400"
                          : "bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800"
                      }`}
                    >
                      {isEn ? p.labelEnglish : p.labelAmharic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vocal Pitch / Formant Adjuster */}
            <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{isEn ? "Vocal Pitch & Tone:" : "የድምፅ ቃና (Vocal Pitch)፦"}</span>
                <span className="font-mono text-amber-400 font-bold tabular-nums ml-1">
                  {settings.speechPitch.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.02"
                  value={settings.speechPitch}
                  onChange={(e) => updateSettings({ speechPitch: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateSettings({ speechPitch: 1.0 })}
                  className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  title={isEn ? "Reset pitch" : "ቃናን መልስ"}
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
