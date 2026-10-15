/**
 * Amharic Phonetic and Abbreviation Normalizer for Broadcast News
 */

const AMHARIC_ABBREVIATIONS: [RegExp, string][] = [
  [/\bጠ\/ሚኒስትር\b/g, "ጠቅላይ ሚኒስትር"],
  [/\bጠ\/ሚ\b/g, "ጠቅላይ ሚኒስትር"],
  [/\bም\/ጠ\/ሚ\b/g, "ምክትል ጠቅላይ ሚኒስትር"],
  [/\bም\/ፕሬዝዳንት\b/g, "ምክትል ፕሬዝዳንት"],
  [/\bፕ\/ት\b/g, "ፕሬዝዳንት"],
  [/\bፕ\/ዳንት\b/g, "ፕሬዝዳንት"],
  [/\bዶ\/ር\b/g, "ዶክተር"],
  [/\bፕሮ\/ር\b/g, "ፕሮፌሰር"],
  [/\bኢ\/ር\b/g, "ኢንጂነር"],
  [/\bሚ\/ር\b/g, "ሚኒስትር"],
  [/\bኮ\/ል\b/g, "ኮሎኔል"],
  [/\bጄ\/ል\b/g, "ጄኔራል"],
  [/\bወ\/ሮ\b/g, "ወይዘሮ"],
  [/\bወ\/ት\b/g, "ወይዘሪት"],
  [/\bአቶ\b/g, "አቶ"],
  [/\bኪ\.ሜ\b/g, "ኪሎሜትር"],
  [/\bኪ\/ሜ\b/g, "ኪሎሜትር"],
  [/\bኪ\.ግ\b/g, "ኪሎግራም"],
  [/\bዓ\.ም\b/g, "ዓመተ ምሕረት"],
  [/\bእ\.ኤ\.አ\b/g, "እንደ አውሮፓውያን አቆጣጠር"],
  [/\bየኢ\.ፌ\.ዲ\.ሪ\b/g, "የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ"],
  [/\bኢፌዲሪ\b/g, "ኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ"],
  [/\bFBC\b/gi, "ፋና ብሮድካስቲንግ ኮርፖሬት"],
  [/\bEBC\b/gi, "የኢትዮጵያ ብሮድካስቲንግ ኮርፖሬሽን"],
  [/\bCBE\b/gi, "የኢትዮጵያ ንግድ ባንክ"],
  [/\bGERD\b/gi, "ታላቁ የኢትዮጵያ ሕዳሴ ግድብ"],
  [/\b%([0-9]+)\b/g, "በመቶ $1"],
  [/\b([0-9]+)%\b/g, "$1 በመቶ"],
  [/\b([0-9]+)\s*ብር\b/g, "$1 የኢትዮጵያ ብር"],
  [/\b([0-9]+)\s*ዶላር\b/g, "$1 የአሜሪካ ዶላር"],
];

/**
 * Normalizes Amharic news script for audio speech synthesis
 */
export function normalizeAmharicForSpeech(text: string): string {
  let normalized = text;

  // Apply abbreviation replacements
  for (const [regex, replacement] of AMHARIC_ABBREVIATIONS) {
    normalized = normalized.replace(regex, replacement);
  }

  // Ensure breathing pauses around major Amharic punctuation
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
export function calculateAmharicDuration(text: string, speechRate: number = 1.0): { wordCount: number; charCount: number; durationSeconds: number } {
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
