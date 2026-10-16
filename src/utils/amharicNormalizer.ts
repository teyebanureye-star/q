/**
 * Advanced Amharic Phonetic, Pronunciation Dictionary and News Normalizer
 * Eliminates robotic speech artifacts, expands abbreviations, converts numbers to Amharic words,
 * applies user custom pronunciation dictionary mappings, and structures natural newsroom breathing pauses.
 */

import { DictionaryEntry } from "../types/studio";

const DICTIONARY_STORAGE_KEY = "fana_pronunciation_dictionary";

export const DEFAULT_DICTIONARY: DictionaryEntry[] = [
  {
    id: "def_1",
    originalWord: "ሰቨር",
    phoneticReplacement: "ሰበር",
    notes: "የሰበር ዜና የተሳሳተ አነባበብ ማረሚያ (Mispronounced bilabial stop)",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_2",
    originalWord: "ሰበር ዜና",
    phoneticReplacement: "ሰበር ዜና፤",
    notes: "የሰበር ዜና የትንፋሽ እና የስርዓተ-ነጥብ ማረፊያ (Headline cadence)",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_3",
    originalWord: "ጠ/ሚ",
    phoneticReplacement: "ጠቅላይ ሚኒስትር",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_4",
    originalWord: "ጠ/ሚኒስትር",
    phoneticReplacement: "ጠቅላይ ሚኒስትር",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_5",
    originalWord: "ም/ጠ/ሚ",
    phoneticReplacement: "ምክትል ጠቅላይ ሚኒስትር",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_6",
    originalWord: "ዶ/ር",
    phoneticReplacement: "ዶክተር",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_7",
    originalWord: "ኢ/ር",
    phoneticReplacement: "ኢንጂነር",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_8",
    originalWord: "ፕ/ት",
    phoneticReplacement: "ፕሬዝዳንት",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_9",
    originalWord: "ወ/ሮ",
    phoneticReplacement: "ወይዘሮ",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_10",
    originalWord: "ኪ.ሜ",
    phoneticReplacement: "ኪሎሜትር",
    notes: "የመለኪያ አሃድ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_11",
    originalWord: "ኪ.ግ",
    phoneticReplacement: "ኪሎግራም",
    notes: "የመለኪያ አሃድ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_12",
    originalWord: "ዓ.ም",
    phoneticReplacement: "ዓመተ ምሕረት",
    notes: "የዘመን አቆጣጠር",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_13",
    originalWord: "እ.ኤ.አ",
    phoneticReplacement: "እንደ አውሮፓውያን አቆጣጠር",
    notes: "የዘመን አቆጣጠር",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_14",
    originalWord: "FBC",
    phoneticReplacement: "ፋና ብሮድካስቲንግ ኮርፖሬት",
    notes: "የሚዲያ ተቋም ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_15",
    originalWord: "EBC",
    phoneticReplacement: "የኢትዮጵያ ብሮድካስቲንግ ኮርፖሬሽን",
    notes: "የሚዲያ ተቋም ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_16",
    originalWord: "CBE",
    phoneticReplacement: "የኢትዮጵያ ንግድ ባንክ",
    notes: "የባንክ ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_17",
    originalWord: "GERD",
    phoneticReplacement: "ታላቁ የኢትዮጵያ ሕዳሴ ግድብ",
    notes: "የግድቡ ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_18",
    originalWord: "ኮቪድ-19",
    phoneticReplacement: "ኮቪድ አስራ ዘጠኝ",
    notes: "የበሽታ ስም አነባበብ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_19",
    originalWord: "AI",
    phoneticReplacement: "ሰው ሠራሽ አስተውሎት",
    notes: "የቴክኖሎጂ ቃል",
    enabled: true,
    isDefault: true,
  },
];

/**
 * Retrieve user's pronunciation dictionary from LocalStorage
 */
export function getStoredDictionary(): DictionaryEntry[] {
  if (typeof window === "undefined") return DEFAULT_DICTIONARY;
  try {
    const raw = localStorage.getItem(DICTIONARY_STORAGE_KEY);
    if (!raw) return DEFAULT_DICTIONARY;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to load custom dictionary from storage:", err);
  }
  return DEFAULT_DICTIONARY;
}

/**
 * Save user's pronunciation dictionary to LocalStorage
 */
export function saveStoredDictionary(entries: DictionaryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("Failed to save custom dictionary to storage:", err);
  }
}

/**
 * Reset pronunciation dictionary to factory defaults
 */
export function resetDictionaryToDefault(): DictionaryEntry[] {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(DICTIONARY_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return DEFAULT_DICTIONARY;
}

// Ethiopic number conversion lookup table
const ONES: { [k: number]: string } = {
  0: "ዜሮ",
  1: "አንድ",
  2: "ሁለት",
  3: "ሦስት",
  4: "አራት",
  5: "አምስት",
  6: "ስድስት",
  7: "ሰባት",
  8: "ስምንት",
  9: "ዘጠኝ",
};

const TEENS: { [k: number]: string } = {
  10: "አስር",
  11: "አስራ አንድ",
  12: "አስራ ሁለት",
  13: "አስራ ሦስት",
  14: "አስራ አራት",
  15: "አስራ አምስት",
  16: "አስራ ስድስት",
  17: "አስራ ሰባት",
  18: "አስራ ስምንት",
  19: "አስራ ዘጠኝ",
};

const TENS: { [k: number]: string } = {
  2: "ሃያ",
  3: "ሠላሳ",
  4: "አርባ",
  5: "ሃምሳ",
  6: "ስልሳ",
  7: "ሰባ",
  8: "ሰማንያ",
  9: "ዘጠና",
};

/**
 * Converts numbers (0-999999999) to written Amharic words so TTS never reads in English
 */
export function numberToAmharicWords(num: number): string {
  if (num === 0) return ONES[0];
  if (num < 10) return ONES[num];
  if (num < 20) return TEENS[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const rem = num % 10;
    return rem === 0 ? TENS[ten] : `${TENS[ten]} ${ONES[rem]}`;
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rem = num % 100;
    const hundredPrefix = hundred === 1 ? "መቶ" : `${ONES[hundred]} መቶ`;
    return rem === 0 ? hundredPrefix : `${hundredPrefix} ${numberToAmharicWords(rem)}`;
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const rem = num % 1000;
    const thousandPrefix = thousand === 1 ? "አንድ ሺህ" : `${numberToAmharicWords(thousand)} ሺህ`;
    return rem === 0 ? thousandPrefix : `${thousandPrefix} ${numberToAmharicWords(rem)}`;
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const rem = num % 1000000;
    const millionPrefix = million === 1 ? "አንድ ሚሊዮን" : `${numberToAmharicWords(million)} ሚሊዮን`;
    return rem === 0 ? millionPrefix : `${millionPrefix} ${numberToAmharicWords(rem)}`;
  }
  return num.toString();
}

/**
 * Replace Western digits with spoken Amharic words in text
 */
function replaceDigitsWithAmharic(text: string): string {
  return text.replace(/\b(\d{1,9})\b/g, (_match, digits) => {
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n <= 999999999) {
      return numberToAmharicWords(n);
    }
    return digits;
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes Amharic news script for audio speech synthesis:
 * 1. Custom & Default Dictionary replacements (e.g. mapping "ሰቨር" to "ሰበር", "ጠ/ሚ" to "ጠቅላይ ሚኒስትር")
 * 2. Units, currencies, and percent signs
 * 3. Western digits to Amharic spoken words
 * 4. Punctuation breathing cadence
 */
export function normalizeAmharicForSpeech(
  text: string,
  customDictionary?: DictionaryEntry[]
): string {
  let normalized = text;

  // 1. Load dictionary (custom if provided, otherwise stored or default)
  const dictionary = customDictionary || getStoredDictionary();

  // Apply enabled dictionary entries
  for (const entry of dictionary) {
    if (!entry.enabled || !entry.originalWord.trim()) continue;
    const escaped = escapeRegex(entry.originalWord.trim());
    // Match word with boundary or exact string
    const regex = new RegExp(`(^|\\s|[.,;፤፡፣!?()"\`'])${escaped}($|\\s|[.,;፤፡፣!?()"\`'])`, "gi");
    normalized = normalized.replace(regex, `$1${entry.phoneticReplacement}$2`);
  }

  // 2. Units, percent, currencies
  normalized = normalized
    .replace(/\b%([0-9]+)\b/g, "$1 በመቶ")
    .replace(/\b([0-9]+)%\b/g, "$1 በመቶ")
    .replace(/\b([0-9]+)\s*ብር\b/g, "$1 የኢትዮጵያ ብር")
    .replace(/\b([0-9]+)\s*ዶላር\b/g, "$1 የአሜሪካ ዶላር")
    .replace(/\b(\$|USD)\s*([0-9]+)\b/gi, "$2 የአሜሪካ ዶላር")
    .replace(/\b([0-9]+)\s*MW\b/gi, "$1 ሜጋ ዋት")
    .replace(/\b([0-9]+)\s*ሜ\.ዋ\b/g, "$1 ሜጋ ዋት");

  // 3. Convert Western digits to Amharic words
  normalized = replaceDigitsWithAmharic(normalized);

  // 4. Clean stutter-inducing multiple punctuation (e.g. "!!!" -> "።", "???" -> "？")
  normalized = normalized
    .replace(/[!！]+/g, "።")
    .replace(/[?？]+/g, "？")
    .replace(/\.{2,}/g, "...");

  // 5. Ensure clear newsroom breathing pauses around major Amharic punctuation
  normalized = normalized
    .replace(/\s*።\s*/g, "። ")
    .replace(/\s*፤\s*/g, "፤ ")
    .replace(/\s*፣\s*/g, "፣ ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

/**
 * Calculate word count and estimated speech duration in seconds
 * Professional news anchor cadence: approx 135 words per minute in Amharic
 */
export function calculateAmharicDuration(
  text: string,
  speechRate: number = 1.0
): { wordCount: number; charCount: number; durationSeconds: number } {
  const clean = text.trim();
  if (!clean) {
    return { wordCount: 0, charCount: 0, durationSeconds: 0 };
  }

  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = clean.length;

  // Base: 135 words per minute = 2.25 words per second
  const wordsPerSecond = 2.25 * speechRate;
  const rawSeconds = Math.max(2, Math.round(wordCount / wordsPerSecond));

  return {
    wordCount,
    charCount,
    durationSeconds: rawSeconds,
  };
}
