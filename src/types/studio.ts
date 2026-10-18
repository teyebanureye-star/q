export interface VoiceAnchor {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  roleAmharic: string;
  roleEnglish?: string;
  geminiVoice: "Fenrir" | "Kore" | "Charon" | "Puck" | "Zephyr";
  styleDirective: string;
  styleDirectiveEnglish?: string;
  gender: "male" | "female";
  avatarUrl: string;
  description: string;
  descriptionEnglish?: string;
  sampleText: string;
  sampleTextEnglish?: string;
  sampleAudioUrl?: string;
  defaultPitch: number; // 0.8 to 1.2
  defaultRate: number;  // 0.8 to 1.2
}

export type MusicBedType = "breaking" | "prime" | "analysis" | "tech" | "none";

export type SoundEffectType =
  | "breaking_alert"    // 🚨 የሰበር ዜና ማስታወቂያ (Breaking Alert)
  | "news_intro"         // 🎺 የዜና መግቢያ ጅንግል (News Intro Fanfare)
  | "clock_chime"        // ⏱️ የዜና ሰዓት ደወል (Top-of-Hour Pips)
  | "transition_swoosh"  // 💥 የዜና ትራንዚሽን ስዉሽ (Transition Swoosh)
  | "social_ping"        // 📲 የሶሻል ሚዲያ ኖቲፊኬሽን (Social Ping)
  | "none";

export interface StudioSettings {
  selectedAnchorId: string;
  speechRate: number;      // 0.8 - 1.25
  speechPitch: number;     // 0.7 - 1.3
  musicBed: MusicBedType;
  musicVolume: number;     // 0 - 1
  autoDucking: boolean;    // auto reduce music when speaking
  includeIntroStinger: boolean;
  introSoundEffect: SoundEffectType; // Selected Intro Sound Effect
  sfxVolume: number;       // Sound effect volume 0 - 1
  reverbAmount: number;    // 0 - 1
  language?: "am" | "en";  // Audio & Interface language mode
}

export interface NewsScriptPreset {
  id: string;
  categoryAmharic: string;
  categoryEnglish?: string;
  headlineAmharic: string;
  headlineEnglish?: string;
  contentAmharic: string;
  contentEnglish?: string;
  recommendedAnchorId: string;
  musicBed: MusicBedType;
  durationEstimateSec: number;
}

export interface DictionaryEntry {
  id: string;
  originalWord: string;
  phoneticReplacement: string;
  notes?: string;
  enabled: boolean;
  isDefault?: boolean;
}
