/**
 * Advanced Amharic Phonetic, Pronunciation Dictionary and News Normalizer
 * Eliminates robotic speech artifacts, expands abbreviations, converts numbers, decimals,
 * prefixes and loanwords to spoken Amharic, and structures authentic newsroom breathing cadence.
 */

import { DictionaryEntry } from "../types/studio";

const DICTIONARY_STORAGE_KEY = "fana_pronunciation_dictionary";

export const DEFAULT_DICTIONARY: DictionaryEntry[] = [
  {
    id: "def_1",
    originalWord: "ሰቨር",
    phoneticReplacement: "ሰበር",
    notes: "የሰበር ዜና የተሳሳተ አነባበብ ማረሚያ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_2",
    originalWord: "ሰበር ዜና",
    phoneticReplacement: "ሰበር ዜና፤ ",
    notes: "የሰበር ዜና የትንፋሽ እና የቃና ማረፊያ",
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
    originalWord: "ፕ/ዳንት",
    phoneticReplacement: "ፕሬዝዳንት",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_10",
    originalWord: "ፕ/ር",
    phoneticReplacement: "ፕሮፌሰር",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_11",
    originalWord: "ወ/ሮ",
    phoneticReplacement: "ወይዘሮ",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_12",
    originalWord: "ወ/ሪት",
    phoneticReplacement: "ወይዘሪት",
    notes: "የማዕረግ አጽህሮተ-ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_13",
    originalWord: "ኮ/ል",
    phoneticReplacement: "ኮሎኔል",
    notes: "የወታደራዊ ማዕረግ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_14",
    originalWord: "ጄ/ል",
    phoneticReplacement: "ጄኔራል",
    notes: "የወታደራዊ ማዕረግ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_15",
    originalWord: "ሜ/ጄ",
    phoneticReplacement: "ሜጀር ጄኔራል",
    notes: "የወታደራዊ ማዕረግ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_16",
    originalWord: "ብ/ጄ",
    phoneticReplacement: "ብርጋዴር ጄኔራል",
    notes: "የወታደራዊ ማዕረግ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_17",
    originalWord: "ዓ.ም",
    phoneticReplacement: "ዓመተ ምሕረት",
    notes: "የዘመን አቆጣጠር",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_18",
    originalWord: "ዓ.ዓ",
    phoneticReplacement: "አዲስ አበባ",
    notes: "የከተማ ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_19",
    originalWord: "አ.አ",
    phoneticReplacement: "አዲስ አበባ",
    notes: "የከተማ ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_20",
    originalWord: "ኪ.ሜ",
    phoneticReplacement: "ኪሎሜትር",
    notes: "የመለኪያ አሃድ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_21",
    originalWord: "ኪ.ግ",
    phoneticReplacement: "ኪሎግራም",
    notes: "የመለኪያ አሃድ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_22",
    originalWord: "ቢ.ብር",
    phoneticReplacement: "ቢሊዮን ብር",
    notes: "የገንዘብ መጠን",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_23",
    originalWord: "ሚ.ብር",
    phoneticReplacement: "ሚሊዮን ብር",
    notes: "የገንዘብ መጠን",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_24",
    originalWord: "GERD",
    phoneticReplacement: "ታላቁ የኢትዮጵያ ሕዳሴ ግድብ",
    notes: "የግድቡ ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_25",
    originalWord: "ኮቪድ-19",
    phoneticReplacement: "ኮቪድ አስራ ዘጠኝ",
    notes: "የበሽታ ስም",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_26",
    originalWord: "AI",
    phoneticReplacement: "ሰው ሠራሽ አስተውሎት",
    notes: "የቴክኖሎጂ ቃል",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_27",
    originalWord: "TikTok",
    phoneticReplacement: "ቲክቶክ",
    notes: "ሶሻል ሚዲያ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_28",
    originalWord: "Telegram",
    phoneticReplacement: "ቴሌግራም",
    notes: "ሶሻል ሚዲያ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_29",
    originalWord: "YouTube",
    phoneticReplacement: "ዩቲዩብ",
    notes: "ሶሻል ሚዲያ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_30",
    originalWord: "Facebook",
    phoneticReplacement: "ፌስቡክ",
    notes: "ሶሻል ሚዲያ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_31",
    originalWord: "Instagram",
    phoneticReplacement: "ኢንስታግራም",
    notes: "ሶሻል ሚዲያ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_32",
    originalWord: "CapCut",
    phoneticReplacement: "ካፕከት",
    notes: "ቪዲዮ አዘጋጅ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_33",
    originalWord: "Video",
    phoneticReplacement: "ቪዲዮ",
    notes: "ሚዲያ",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_34",
    originalWord: "Live",
    phoneticReplacement: "የቀጥታ",
    notes: "ስርጭት",
    enabled: true,
    isDefault: true,
  },
  {
    id: "def_35",
    originalWord: "Breaking",
    phoneticReplacement: "ሰበር",
    notes: "ዜና",
    enabled: true,
    isDefault: true,
  },
];

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
    console.warn("Failed to load dictionary:", err);
  }
  return DEFAULT_DICTIONARY;
}

export function saveStoredDictionary(entries: DictionaryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("Failed to save dictionary:", err);
  }
}

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

// Ethiopic numbers lookup
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
 * Converts integer numbers (0 to 999,999,999) to written Amharic words
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
 * Replaces numbers (including attached Amharic prefixes, commas, and decimals) with spoken Amharic
 */
function replaceDigitsWithAmharic(text: string): string {
  // First, handle numbers with decimals (e.g. 3.5, 12.8, በ3.5%)
  let res = text.replace(/(በ|ከ|ለ|ወደ|እስከ|እንደ)?(\d+)\.(\d+)/g, (_match, prefix, intPart, decPart) => {
    const p = prefix || "";
    const intNum = parseInt(intPart, 10);
    const decNum = parseInt(decPart, 10);
    if (!isNaN(intNum) && !isNaN(decNum)) {
      return `${p}${numberToAmharicWords(intNum)} ነጥብ ${numberToAmharicWords(decNum)}`;
    }
    return _match;
  });

  // Handle comma-separated numbers (e.g. 1,000, 250,000, በ1,000)
  res = res.replace(/(በ|ከ|ለ|ወደ|እስከ|እንደ)?(\d{1,3}(?:,\d{3})+)/g, (_match, prefix, group) => {
    const p = prefix || "";
    const cleanNum = parseInt(group.replace(/,/g, ""), 10);
    if (!isNaN(cleanNum) && cleanNum <= 999999999) {
      return `${p}${numberToAmharicWords(cleanNum)}`;
    }
    return _match;
  });

  // Handle standard integer numbers with optional Amharic prefixes (e.g. 2016, በ2016, ከ50)
  res = res.replace(/(በ|ከ|ለ|ወደ|እስከ|እንደ)?(\d{1,9})/g, (_match, prefix, digits) => {
    const p = prefix || "";
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n <= 999999999) {
      return `${p}${numberToAmharicWords(n)}`;
    }
    return _match;
  });

  return res;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes Amharic news script for audio speech synthesis:
 * - Expands abbreviations & titles
 * - Replaces English loanwords with clean phonetic Amharic
 * - Expands currencies, percentages, and measurement units
 * - Expands numbers and decimals (with prefixes) to spoken Amharic words
 * - Structures natural newsroom breathing pauses and punctuation
 */
export function normalizeAmharicForSpeech(
  text: string,
  customDictionary?: DictionaryEntry[]
): string {
  if (!text) return "";
  let normalized = text;

  // 1. Common English media & tech terms to phonetic Amharic so TTS never stumbles
  normalized = normalized
    .replace(/\b(Breaking\s*News|breaking\s*news)\b/gi, "ሰበር ዜና፤")
    .replace(/\b(Breaking|breaking)\b/gi, "ሰበር")
    .replace(/\b(TikTok|tiktok)\b/gi, "ቲክቶክ")
    .replace(/\b(Telegram|telegram)\b/gi, "ቴሌግራም")
    .replace(/\b(YouTube|youtube)\b/gi, "ዩቲዩብ")
    .replace(/\b(Facebook|facebook)\b/gi, "ፌስቡክ")
    .replace(/\b(Instagram|instagram)\b/gi, "ኢንስታግራም")
    .replace(/\b(CapCut|capcut|cabcut)\b/gi, "ካፕከት")
    .replace(/\b(Live|live)\b/gi, "የቀጥታ")
    .replace(/\b(Video|video)\b/gi, "ቪዲዮ")
    .replace(/\b(Audio|audio)\b/gi, "ኦዲዮ")
    .replace(/\b(Online|online)\b/gi, "ኦንላይን")
    .replace(/\b(Website|website)\b/gi, "ድህረ-ገጽ")
    .replace(/\b(PDF|pdf)\b/gi, "ፒዲኤፍ")
    .replace(/\b(AI|ai)\b/g, "ሰው ሠራሽ አስተውሎት")
    .replace(/\b(COVID-19|Covid-19|covid-19)\b/gi, "ኮቪድ አስራ ዘጠኝ")
    .replace(/\b(COVID|Covid|covid)\b/gi, "ኮቪድ")
    .replace(/\b(AU)\b/g, "የአፍሪካ ህብረት")
    .replace(/\b(UN)\b/g, "የተባበሩት መንግስታት")
    .replace(/\b(EU)\b/g, "የአውሮፓ ህብረት")
    .replace(/\b(USA|US)\b/g, "አሜሪካ");

  // 2. Units, percent, currencies
  normalized = normalized
    .replace(/%([0-9.,]+)/g, "$1 በመቶ")
    .replace(/([0-9.,]+)%/g, "$1 በመቶ")
    .replace(/([0-9.,]+)\s*ብር\b/g, "$1 የኢትዮጵያ ብር")
    .replace(/([0-9.,]+)\s*ዶላር\b/g, "$1 የአሜሪካ ዶላር")
    .replace(/(\$|USD)\s*([0-9.,]+)/gi, "$2 የአሜሪካ ዶላር")
    .replace(/([0-9.,]+)\s*MW\b/gi, "$1 ሜጋ ዋት")
    .replace(/([0-9.,]+)\s*ሜ\.ዋ\b/g, "$1 ሜጋ ዋት")
    .replace(/([0-9.,]+)\s*ኪ\.ሜ\b/g, "$1 ኪሎሜትር")
    .replace(/([0-9.,]+)\s*ኪ\.ግ\b/g, "$1 ኪሎግራም");

  // 3. Custom & default dictionary replacements
  const dictionary = customDictionary || getStoredDictionary();
  for (const entry of dictionary) {
    if (!entry.enabled || !entry.originalWord.trim()) continue;
    const escaped = escapeRegex(entry.originalWord.trim());
    const regex = new RegExp(`(^|\\s|[.,;፤፡፣!?()"\`'])${escaped}($|\\s|[.,;፤፡፣!?()"\`'])`, "gi");
    normalized = normalized.replace(regex, `$1${entry.phoneticReplacement}$2`);
  }

  // 4. Convert numbers (including prefixed numbers like በ2016) to spoken Amharic words
  normalized = replaceDigitsWithAmharic(normalized);

  // 5. Clean stutter-inducing multiple punctuation (e.g. "!!!" -> "።", "???" -> "？")
  normalized = normalized
    .replace(/[!！]+/g, "። ")
    .replace(/[?？]+/g, "？ ")
    .replace(/\.{2,}/g, "... ");

  // 6. Ensure clear newsroom breathing pauses around major Amharic punctuation
  normalized = normalized
    .replace(/\s*።\s*/g, "። ")
    .replace(/\s*፤\s*/g, "፤ ")
    .replace(/\s*፣\s*/g, "፣ ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized;
}

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

  const wordsPerSecond = 2.25 * speechRate;
  const rawSeconds = Math.max(2, Math.round(wordCount / wordsPerSecond));

  return {
    wordCount,
    charCount,
    durationSeconds: rawSeconds,
  };
}
