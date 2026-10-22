export interface VoiceAnchor {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  roleAmharic: string;
  roleEnglish?: string;
  geminiVoice: "Fenrir" | "Kore" | "Charon" | "Puck" | "Zephyr" | "Aoede";
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
  | "etv_news_intro"         // 🏛️ ETV ዜና መክፈቻ (ETV Grand News Fanfare)
  | "etv_breaking_intro"     // 🚨 ETV ሰበር ዜና (ETV Breaking Alert)
  | "etv_outro_stinger"      // 📺 ETV ዜና መዝጊያ (ETV News Sign-off)
  | "amhara_media_intro"     // 🦅 አማራ ሚዲያ መክፈቻ (AMC News Theme)
  | "amhara_media_bulletin"  // ⚡ አማራ ሚዲያ ሰበር (AMC Breaking Bulletin)
  | "amhara_media_outro"     // 📡 አማራ ሚዲያ መዝጊያ (AMC News Sign-off)
  | "breaking_alert"         // 🚨 ዓለምአቀፍ ሰበር (Global Breaking Alert)
  | "news_intro"             // 🎺 ክላሲክ ጅንግል (Classic News Intro)
  | "clock_chime"            // ⏱️ የሰዓት ደወል (Top-of-Hour Pips)
  | "transition_swoosh"      // 💥 መሸጋገሪያ ስዉሽ (Transition Swoosh)
  | "social_ping"            // 📲 ሶሻል ፒንግ (Social Ping)
  | "none";

export interface StudioSettings {
  selectedAnchorId: string;
  speechRate: number;      // 0.8 - 1.25
  speechPitch: number;     // 0.7 - 1.3
  musicBed: MusicBedType;
  musicVolume: number;     // 0 - 1
  autoDucking: boolean;    // auto reduce music when speaking
  autoEq?: boolean;        // auto-blend voice & music frequencies for professional studio sound
  includeIntroStinger: boolean;
  introSoundEffect: SoundEffectType; // Selected Intro Sound Effect (ከዜና በፊት)
  includeOutroStinger: boolean;
  outroSoundEffect: SoundEffectType; // Selected Outro Sound Effect (ከዜና በኋላ)
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
