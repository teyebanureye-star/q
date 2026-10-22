/**
 * Emotional Tone & Sentiment Analyzer for Broadcast News Scripts
 * Color-codes text segments and determines optimal neural voice anchors & prosody
 */

export type EmotionalToneType = "urgent" | "solemn" | "uplifting" | "analytical" | "neutral";

export interface ToneDefinition {
  type: EmotionalToneType;
  labelAmharic: string;
  labelEnglish: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  highlightClass: string;
  dotColor: string;
  recommendedAnchorId: string;
  recommendedAnchorName: string;
  recommendedRate: number;
  recommendedMusicBed: "breaking" | "prime" | "analysis" | "tech";
  styleDirectiveAmharic: string;
}

export const TONE_DEFINITIONS: Record<EmotionalToneType, ToneDefinition> = {
  urgent: {
    type: "urgent",
    labelAmharic: "🚨 ሰበር / አስቸኳይ (Urgent)",
    labelEnglish: "🚨 Urgent / Breaking",
    badgeBg: "bg-red-950/70",
    badgeText: "text-red-300",
    borderClass: "border-red-600/70",
    highlightClass: "bg-red-950/30 text-red-100 border-l-2 border-red-500",
    dotColor: "bg-red-500",
    recommendedAnchorId: "solomon",
    recommendedAnchorName: "ሰሎሞን ግርማ (ሰበር ዜና)",
    recommendedRate: 1.15,
    recommendedMusicBed: "breaking",
    styleDirectiveAmharic: "ፈጣንና አስቸኳይ የሰበር ዜና ስልት",
  },
  solemn: {
    type: "solemn",
    labelAmharic: "🏛️ ሐዘን / የተከበረ (Solemn)",
    labelEnglish: "🏛️ Solemn / Grave",
    badgeBg: "bg-purple-950/70",
    badgeText: "text-purple-300",
    borderClass: "border-purple-600/70",
    highlightClass: "bg-purple-950/30 text-purple-100 border-l-2 border-purple-500",
    dotColor: "bg-purple-500",
    recommendedAnchorId: "dawit",
    recommendedAnchorName: "ዳዊት ከበደ (አበይት ዜና)",
    recommendedRate: 0.88,
    recommendedMusicBed: "analysis",
    styleDirectiveAmharic: "ዝግተኛ፣ የተከበረና የረጋ ስልት",
  },
  uplifting: {
    type: "uplifting",
    labelAmharic: "🌟 ስኬት / አዎንታዊ (Uplifting)",
    labelEnglish: "🌟 Uplifting / Success",
    badgeBg: "bg-emerald-950/70",
    badgeText: "text-emerald-300",
    borderClass: "border-emerald-600/70",
    highlightClass: "bg-emerald-950/30 text-emerald-100 border-l-2 border-emerald-500",
    dotColor: "bg-emerald-500",
    recommendedAnchorId: "sofia",
    recommendedAnchorName: "ሶፊያ ኑረዲን (ማህበራዊና ባህል)",
    recommendedRate: 1.02,
    recommendedMusicBed: "tech",
    styleDirectiveAmharic: "ብርቱ፣ ሞቅ ያለና አዎንታዊ ስልት",
  },
  analytical: {
    type: "analytical",
    labelAmharic: "📊 ትንታኔ / ቢዝነስ (Analytical)",
    labelEnglish: "📊 Analytical / Finance",
    badgeBg: "bg-cyan-950/70",
    badgeText: "text-cyan-300",
    borderClass: "border-cyan-600/70",
    highlightClass: "bg-cyan-950/30 text-cyan-100 border-l-2 border-cyan-500",
    dotColor: "bg-cyan-500",
    recommendedAnchorId: "temesgen",
    recommendedAnchorName: "ተመስገን አሰፋ (ትንታኔና ኢኮኖሚ)",
    recommendedRate: 0.94,
    recommendedMusicBed: "analysis",
    styleDirectiveAmharic: "የተረጋጋ ጥልቅ የትንታኔ ስልት",
  },
  neutral: {
    type: "neutral",
    labelAmharic: "📰 መደበኛ ሪፖርት (Neutral)",
    labelEnglish: "📰 Neutral / Official",
    badgeBg: "bg-blue-950/70",
    badgeText: "text-blue-300",
    borderClass: "border-blue-600/70",
    highlightClass: "bg-blue-950/20 text-blue-100 border-l-2 border-blue-500",
    dotColor: "bg-blue-400",
    recommendedAnchorId: "aster",
    recommendedAnchorName: "አስቴር ማሞ (ዋና ዜና)",
    recommendedRate: 0.98,
    recommendedMusicBed: "prime",
    styleDirectiveAmharic: "ሚዛናዊ የቴሌቪዥን ዋና ዜና ስልት",
  },
};

const URGENT_KEYWORDS = [
  "ሰበር",
  "አስቸኳይ",
  "አደጋ",
  "ጥቃት",
  "ድንገተኛ",
  "አሳሳቢ",
  "ሞት",
  "ፍንዳታ",
  "ማስጠንቀቂያ",
  "ግጭት",
  "ታግዷል",
  "ወረርሽኝ",
  "ፖሊስ",
  "ወታደር",
  "ሰደድ",
  "breaking",
  "urgent",
  "alert",
  "emergency",
  "crisis",
  "disaster",
  "danger",
  "warning",
  "attack",
  "critical",
];

const SOLEMN_KEYWORDS = [
  "ሐዘን",
  "ህልፈት",
  "አረፉ",
  "ተሰናበቱ",
  "መታሰቢያ",
  "የቀብር",
  "ሰለባ",
  "ጉዳት",
  "አሳዛኝ",
  "ተጎዱ",
  "ስቃይ",
  "ልቅሶ",
  "condolences",
  "tragedy",
  "mourning",
  "solemn",
  "passed away",
  "funeral",
  "grief",
  "sorrow",
  "casualty",
];

const UPLIFTING_KEYWORDS = [
  "ስኬት",
  "ድል",
  "ተመረቀ",
  "ዕድገት",
  "ልማት",
  "አሸነፈ",
  "ተጠናቀቀ",
  "ተስፋ",
  "ሰላም",
  "ሽልማት",
  "ስምምነት",
  "ምርቃት",
  "ፈጠራ",
  "ደስታ",
  "ውጤት",
  "ብልጽግና",
  "success",
  "victory",
  "win",
  "triumph",
  "celebration",
  "achievement",
  "progress",
  "growth",
  "peace",
  "historic",
  "awarded",
];

const ANALYTICAL_KEYWORDS = [
  "ኢኮኖሚ",
  "ገበያ",
  "የውጭ ምንዛሪ",
  "ትንታኔ",
  "ፖሊሲ",
  "በጀት",
  "ኢንቨስትመንት",
  "ንግድ",
  "ዶላር",
  "ቢር",
  "ባንክ",
  "ዋጋ",
  "ግሽበት",
  "ወለድ",
  "አክሲዮን",
  "economy",
  "market",
  "finance",
  "analysis",
  "inflation",
  "investment",
  "budget",
  "trade",
  "banking",
  "revenue",
  "policy",
];

export interface AnalyzedSegment {
  id: string;
  text: string;
  tone: EmotionalToneType;
  matchedKeywords: string[];
}

export interface ScriptAnalysisResult {
  dominantTone: EmotionalToneType;
  toneCounts: Record<EmotionalToneType, number>;
  segments: AnalyzedSegment[];
  recommendedTone: ToneDefinition;
}

/**
 * Categorize a single text segment into an emotional tone
 */
export function classifySentenceTone(sentence: string): { tone: EmotionalToneType; matchedKeywords: string[] } {
  const lower = sentence.toLowerCase();

  const urgentMatches = URGENT_KEYWORDS.filter((w) => lower.includes(w.toLowerCase()));
  const solemnMatches = SOLEMN_KEYWORDS.filter((w) => lower.includes(w.toLowerCase()));
  const upliftingMatches = UPLIFTING_KEYWORDS.filter((w) => lower.includes(w.toLowerCase()));
  const analyticalMatches = ANALYTICAL_KEYWORDS.filter((w) => lower.includes(w.toLowerCase()));

  // Prioritize high-urgency keywords
  if (urgentMatches.length > 0) {
    return { tone: "urgent", matchedKeywords: urgentMatches };
  }
  if (solemnMatches.length > 0) {
    return { tone: "solemn", matchedKeywords: solemnMatches };
  }
  if (upliftingMatches.length > 0) {
    return { tone: "uplifting", matchedKeywords: upliftingMatches };
  }
  if (analyticalMatches.length > 0) {
    return { tone: "analytical", matchedKeywords: analyticalMatches };
  }

  return { tone: "neutral", matchedKeywords: [] };
}

/**
 * Analyzes full news script and segments into color-coded lines
 */
export function analyzeScriptSentiment(script: string): ScriptAnalysisResult {
  const clean = script.trim();
  if (!clean) {
    return {
      dominantTone: "neutral",
      toneCounts: { urgent: 0, solemn: 0, uplifting: 0, analytical: 0, neutral: 0 },
      segments: [],
      recommendedTone: TONE_DEFINITIONS.neutral,
    };
  }

  // Split by Ethiopian sentence boundary '።' or newline, or standard punctuation
  const rawSegments = clean
    .split(/(?<=[።\n!?])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const toneCounts: Record<EmotionalToneType, number> = {
    urgent: 0,
    solemn: 0,
    uplifting: 0,
    analytical: 0,
    neutral: 0,
  };

  const segments: AnalyzedSegment[] = rawSegments.map((text, idx) => {
    const { tone, matchedKeywords } = classifySentenceTone(text);
    toneCounts[tone]++;
    return {
      id: `seg-${idx}`,
      text,
      tone,
      matchedKeywords,
    };
  });

  // Calculate dominant tone (giving higher weight to high-impact broadcast news alerts)
  const weightedScores = {
    urgent: toneCounts.urgent * 3.0,
    solemn: toneCounts.solemn * 2.2,
    uplifting: toneCounts.uplifting * 1.5,
    analytical: toneCounts.analytical * 1.2,
    neutral: toneCounts.neutral * 0.8,
  };

  let maxScore = -1;
  let dominantTone: EmotionalToneType = "neutral";

  (Object.keys(weightedScores) as EmotionalToneType[]).forEach((tone) => {
    if (weightedScores[tone] > maxScore && toneCounts[tone] > 0) {
      maxScore = weightedScores[tone];
      dominantTone = tone;
    }
  });

  return {
    dominantTone,
    toneCounts,
    segments,
    recommendedTone: TONE_DEFINITIONS[dominantTone],
  };
}
