export interface VoiceAnchor {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  roleAmharic: string;
  geminiVoice: "Fenrir" | "Kore" | "Charon" | "Puck" | "Zephyr";
  styleDirective: string;
  gender: "male" | "female";
  avatarUrl: string;
  description: string;
  sampleText: string;
  sampleAudioUrl?: string;
  defaultPitch: number; // 0.8 to 1.2
  defaultRate: number;  // 0.8 to 1.2
}

export type MusicBedType = "breaking" | "prime" | "analysis" | "tech" | "none";

export interface StudioSettings {
  selectedAnchorId: string;
  speechRate: number;      // 0.8 - 1.25
  speechPitch: number;     // 0.7 - 1.3
  musicBed: MusicBedType;
  musicVolume: number;     // 0 - 1
  autoDucking: boolean;    // auto reduce music when speaking
  includeIntroStinger: boolean;
  reverbAmount: number;    // 0 - 1
}

export interface NewsScriptPreset {
  id: string;
  categoryAmharic: string;
  headlineAmharic: string;
  contentAmharic: string;
  recommendedAnchorId: string;
  musicBed: MusicBedType;
  durationEstimateSec: number;
}
