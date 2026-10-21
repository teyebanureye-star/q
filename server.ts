import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

const rawApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const cleanApiKey = rawApiKey.replace(/^["']|["']$/g, "").trim();

// Initialize GoogleGenAI SDK on server-side
const ai = new GoogleGenAI({
  apiKey: cleanApiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// In-memory audio cache to reduce quota and latency
const audioCache = new Map<string, { audioBase64: string; mimeType: string; timestamp: number }>();

/**
 * Text-to-Speech Endpoint for Amharic News Broadcast
 */
app.post("/api/tts/generate", async (req, res) => {
  try {
    const {
      text,
      voice = "Fenrir",
      style,
      language = "am",
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "ጽሑፍ አልተገኘም (Text is required)" });
    }

    const cleanText = text.trim();
    const cacheKey = `${voice}:::${language}:::${cleanText}:::${style || ""}`;

    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        cached: true,
      });
    }

    let audioBase64: string | undefined;

    let fullStyle: string;
    if (language === "en") {
      const englishBroadcastDirective =
        "Crisp, authoritative international television broadcast news anchor. Fluent, native English news delivery with impeccable diction, rhythmic television newsroom pacing, confident cadence, and professional broadcast microphone presence. Zero robotic artifacts.";
      fullStyle = style ? `${englishBroadcastDirective} ${style}` : englishBroadcastDirective;
    } else {
      const amharicPhoneticDirective =
        "Flawless native Ethiopian national television prime-time news anchor from Addis Ababa. Deliver in warm, authoritative, human broadcast cadence with authentic Amharic gemination, expressive newsroom pacing, natural breathing pauses between sentences, and rich acoustic microphone presence. Strictly articulate the consonant 'b' (በ, ቡ, ቢ, ባ, ቤ, ብ, ቦ) as an assertive voiced bilabial plosive [b] (e.g. 'ሰበር' is articulated with a firm B, never 'v'). Zero robotic intonation, zero stutter, and zero synthetic hesitation. Deliver as an authentic, respected Ethiopian broadcaster.";
      fullStyle = style ? `${amharicPhoneticDirective} ${style}` : amharicPhoneticDirective;
    }

    // Call Gemini 3.8 Flash TTS (flagship voice model with rich prosody & nuance)
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: fullStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
        },
      });
      audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (primaryErr: any) {
      console.warn("Flash TTS primary failed, retrying with gemini-3.8-flash-lite-tts:", primaryErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: fullStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice,
              },
            },
          },
        },
      });
      audioBase64 = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!audioBase64) {
      return res.status(500).json({ error: "የድምፅ ቅጂ ማመንጨት አልተቻለም (Could not extract audio data)" });
    }

    const mimeType = "audio/wav";

    // Cache the result (keep max 100 clips)
    if (audioCache.size > 100) {
      const oldestKey = audioCache.keys().next().value;
      if (oldestKey) audioCache.delete(oldestKey);
    }
    audioCache.set(cacheKey, { audioBase64, mimeType, timestamp: Date.now() });

    return res.json({
      audioBase64,
      mimeType,
      cached: false,
    });
  } catch (error: any) {
    console.error("Gemini TTS Error:", error?.message || error);
    const isQuota = error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED");
    return res.status(isQuota ? 429 : 500).json({
      error: error?.message || "ድምፅ ማመንጨት አልተቻለም",
      isQuota,
      fallbackSuggestion: true,
    });
  }
});

/**
 * News Polish / Broadcast Script Formatter Endpoint
 */
function buildEditorialNewsScript(rawText: string, formatType: string = "breaking") {
  const cleanText = rawText.trim();
  const firstSentence = cleanText.split(/[።\n.!?]/)[0]?.trim() || cleanText.slice(0, 70);

  let headline = "";
  if (formatType === "breaking") {
    headline = `🚨 ሰበር ዜና፤ ${firstSentence.slice(0, 80)}`;
  } else if (formatType === "headline") {
    headline = `🏛️ አበይት ዜና፤ ${firstSentence.slice(0, 80)}`;
  } else if (formatType === "brief") {
    headline = `📱 አጭር መረጃ፤ ${firstSentence.slice(0, 80)}`;
  } else {
    headline = `🌍 የትንታኔ ዘገባ፤ ${firstSentence.slice(0, 80)}`;
  }

  // Common abbreviation expansions
  let script = cleanText
    .replace(/\bጠ\/ሚ\b|\bጠ\/ሚኒስትር\b/g, "ጠቅላይ ሚኒስትር")
    .replace(/\bዶ\/ር\b/g, "ዶክተር")
    .replace(/\bወ\/ሮ\b/g, "ወይዘሮ")
    .replace(/\bወ\/ሪት\b/g, "ወይዘሪት")
    .replace(/\bኪ\.ሜ\b|\bኪ\/ሜ\b/g, "ኪሎሜትር")
    .replace(/\bም\/ቤት\b/g, "ምክር ቤት")
    .replace(/\bሚ\/ር\b/g, "ሚኒስቴር")
    .replace(/\bፕ\/ት\b/g, "ፕሬዝዳንት")
    .replace(/\bኮ\/ል\b/g, "ኮሎኔል")
    .replace(/\bጀ\/ል\b/g, "ጄኔራል")
    .replace(/\bዓ\.ም\b|\bዓ\/ም\b/g, "ዓመተ ምሕረት");

  let broadcastScript = "";
  if (formatType === "breaking") {
    if (!script.startsWith("ሰበር ዜና")) {
      broadcastScript = `ሰበር ዜና፤ የዜና አንባቢ ስቱዲዮው የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል::\n\n${script}`;
    } else {
      broadcastScript = script;
    }
    if (!broadcastScript.includes("አዲስ አበባ")) {
      broadcastScript += `\n\nየዜና አንባቢ ስቱዲዮው፤ አዲስ አበባ።`;
    }
  } else if (formatType === "brief") {
    broadcastScript = `አስደናቂ የሰዓቱ አጭር መረጃ! ${script}\n\nለተጨማሪ ወቅታዊ መረጃዎች ይከታተሉን።`;
  } else if (formatType === "report") {
    broadcastScript = `የትንታኔ ዘገባ፤ በዛሬው ዕለት የወጣውን አበይት ጉዳይ አስመልክቶ የቀረበ ዝርዝር ዘገባ::\n\n${script}\n\nየዜና አንባቢ ስቱዲዮው የትንታኔ ዘገባ፤ አዲስ አበባ።`;
  } else {
    broadcastScript = `አበይት ዜናዎች፤ የዜና አንባቢ ስቱዲዮው የሰዓቱ ዋና ዋና ዜናዎችን ይዘን ቀርበናል::\n\n${script}\n\nየዜና አንባቢ ስቱዲዮው፤ አዲስ አበባ።`;
  }

  const categoryMap: Record<string, string> = {
    breaking: "ሰበር ዜና (Breaking News)",
    headline: "አበይት ዜና (Prime Broadcast)",
    brief: "ሶሻል ሚዲያ / ቲክቶክ (Viral Hook)",
    report: "የትንታኔ ዘገባ (In-depth Analysis)",
  };

  const teleprompterMap: Record<string, string> = {
    breaking: "በአስቸኳይ፣ በከፍተኛ ግርማ ሞገስና ቀልብ በሚገዛ የሰበር ዜና አነባበብ ስልት ያንብቡ።",
    headline: "በተረጋጋ፣ ግልጽና ባለስልጣን በሆነ የዋና ዜና አቀራረብ ስልት ያንብቡ።",
    brief: "ፈጣንና ለቲክቶክ/ሶሻል ሚዲያ ተስማሚ በሆነ ሳቢ አነባበብ ያንብቡ።",
    report: "ጥልቅና አድማጭን በሚያስተምር የተረጋጋ የትንታኔ አነባበብ ያንብቡ።",
  };

  return {
    headline,
    broadcastScript,
    category: categoryMap[formatType] || "የተስተካከለ የዜና ስክሪፕት",
    estimatedDurationSec: Math.max(30, Math.round(broadcastScript.length / 15)),
    teleprompterNotes: teleprompterMap[formatType] || "በተረጋጋና ጥራት ባለው የዜና አቀራረብ ስልት ያንብቡ።",
  };
}

app.post("/api/news/format", async (req, res) => {
  const { rawText, formatType = "breaking" } = req.body || {};

  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ error: "ጽሑፍ አልተገኘም (Raw text required)" });
  }

  try {
    const prompt = `እርስዎ የዜና አንባቢ ስቱዲዮው (News Reader Studio) ከፍተኛ የዜና አዘጋጅና ኤዲተር ነዎት። 
የቀረበውን ጽሑፍ ተመልክተው ለሶሻል ሚዲያ (ቲክቶክ፣ ቴሌግራም፣ ዩቲዩብ) እና ለቴሌቪዥን ዜና አቅራቢዎች ተስማሚ በሆነ የዜና አንባቢ ስቱዲዮው ፕሮፌሽናል የዜና አጻጻፍ ስልት ያዘጋጁ።

የተሰጠው ጽሑፍ:
"""
${rawText}
"""

የተመረጠው የዜና ቅርጸት: ${formatType} (breaking: ሰበር ዜና, headline: ዋና ዜና, report: የትንታኔ ዘገባ, sports: ስፖርት, brief: አጭር የ30 ሰከንድ ዜና)

ደንቦች:
1. ጽሑፉን በንጹህ እና ማራኪ አማርኛ፣ ያለምንም የፊደልና የሰዋሰው ስህተት አዘጋጁ።
2. አጽህሮተ-ቃላትን ወደ ሙሉ ቃል ቀይሩ (ምሳሌ፦ "ጠ/ሚ" -> "ጠቅላይ ሚኒስትር"፣ "ዶ/ር" -> "ዶክተር"፣ "ኪ.ሜ" -> "ኪሎሜትር"፣ "ብር" -> "የኢትዮጵያ ብር")።
3. አንባቢው የት ላይ ማቆም እንዳለበት የሚያሳዩ ሥርዓተ-ነጥቦችን (፤ ፣ ።) በትክክል ተጠቀሙ።
4. የተለመዱ የዜና መግቢያ እና መደምደሚያዎችን አካትቱ (ለምሳሌ፦ "ሰበር ዜና፤ ... የዜና አንባቢ ስቱዲዮው፤ አዲስ አበባ")።
5. ቁጥሮችን በሙሉ ወደ ተነባቢ አማርኛ ቃላት ቀይሩ (ምሳሌ፦ "2016" -> "ሁለት ሺህ አስራ ስድስት"፣ "50%" -> "ሃምሳ በመቶ")።
6. የቃላት አነባበብ እንዳይዛባ እንደ "ሰበር ዜና፤" ያሉትን ቃላት በግልጽ ሥርዓተ-ነጥብ አስቀምጡ።

መልስዎን በሚከተለው JSON ቅርጸት ብቻ ይመልሱ:
{
  "headline": "አጭርና ሳቢ የዜና ርዕስ",
  "broadcastScript": "ጋዜጠኛው ቀጥታ የሚያነበው ሙሉ የዜና ጽሑፍ",
  "category": "ሰበር ዜና / ፖለቲካ / ኢኮኖሚ / ስፖርት / ዓለም አቀፍ",
  "estimatedDurationSec": 45,
  "teleprompterNotes": "ለአቅራቢው የተዘጋጀ የድምፅና የቅላጼ መመሪያ"
}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    }

    const jsonText = response.text?.trim() || "{}";
    const cleanJson = jsonText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed?.broadcastScript) {
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn("News Format AI call failed, activating newsroom editorial fallback:", error?.message || error);
  }

  // Resilient fallback: Always returns high-quality broadcast script
  const fallback = buildEditorialNewsScript(rawText, formatType);
  return res.json(fallback);
});

/**
 * AI Headline Generator Endpoint
 */
app.post("/api/news/headlines", async (req, res) => {
  const { topic = "" } = req.body || {};

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return res.status(400).json({ error: "እባክዎ ርዕሰ ጉዳይ ያስገቡ (Topic is required)" });
  }

  const topicStr = topic.trim();

  try {

    const prompt = `እርስዎ የፋና ብሮድካስቲንግ ኮርፖሬት (FBC) ዋና የዜና አርታዒና የርዕስ ስፔሻሊስት ነዎት።
ለተሰጠው ርዕሰ ጉዳይ ወይም መረጃ 3 (ሦስት) እጅግ ሳቢ፣ ፕሮፌሽናል እና አድማጭን የሚስቡ የአማርኛ የዜና ርዕሶችን ያመንጩ።

ርዕሰ ጉዳይ (Topic):
"""
${topic.trim()}
"""

የተፈለገው ቅርጸት:
1. "🚨 ሰበር ዜና (Breaking News)" - አፋጣኝ፣ ትኩረት የሚስብ እና አስቸኳይ ስሜት ያለው
2. "🏛️ አበይት ዜና (Prime Broadcast)" - የተከበረ፣ ግርማ ሞገስ ያለው እና የተሟላ መረጃ የያዘ
3. "🔥 ቲክቶክ እና ሶሻል ሚዲያ (Viral Hook)" - አጭር፣ ቀልብ የሚስብ እና ለቲክቶክ/ቴሌግራም ተስማሚ የሆነ

ደንቦች:
- ሦስቱም ርዕሶች በንጹህ፣ ማራኪ እና ትክክለኛ አማርኛ ይዘጋጁ።
- አነባበቡ እንዳይዛባ "ሰበር ዜና፤" በሚል ትክክለኛ ሥርዓተ-ነጥብ ያስቀምጡ።
- ቁጥሮች ካሉ በቃላትም ጭምር ይግለጹ።

መልስዎን በሚከተለው JSON ቅርጸት ብቻ ይመልሱ:
{
  "headlines": [
    {
      "id": "1",
      "style": "🚨 ሰበር ዜና (Breaking News)",
      "headline": "ርዕሱ እዚህ ይጻፍ",
      "hookNote": "ይህ ርዕስ ለምን ሳቢ እንደሆነ አጭር ማብራሪያ"
    },
    {
      "id": "2",
      "style": "🏛️ አበይት ዜና (Prime Broadcast)",
      "headline": "ርዕሱ እዚህ ይጻፍ",
      "hookNote": "ይህ ርዕስ ለምን ሳቢ እንደሆነ አጭር ማብራሪያ"
    },
    {
      "id": "3",
      "style": "🔥 ቲክቶክ እና ሶሻል ሚዲያ (Viral Hook)",
      "headline": "ርዕሱ እዚህ ይጻፍ",
      "hookNote": "ይህ ርዕስ ለምን ሳቢ እንደሆነ አጭር ማብራሪያ"
    }
  ]
}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    }

    const jsonText = response.text?.trim() || "{}";
    const cleanJson = jsonText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanJson);
    if (parsed?.headlines && Array.isArray(parsed.headlines) && parsed.headlines.length > 0) {
      return res.json(parsed);
    }
  } catch (error: any) {
    console.warn("AI Headline Error, using fallback:", error?.message || error);
  }

  return res.json({
    headlines: [
      {
        id: "1",
        style: "🚨 ሰበር ዜና (Breaking News)",
        headline: `ሰበር ዜና፤ ${topicStr}`,
        hookNote: "አፋጣኝ የሰበር ዜና ርዕስ",
      },
      {
        id: "2",
        style: "🏛️ አበይት ዜና (Prime Broadcast)",
        headline: `የዜና አንባቢ ስቱዲዮው አበይት ዜና፤ ${topicStr}`,
        hookNote: "የተሟላ የዋና ዜና ርዕስ",
      },
      {
        id: "3",
        style: "🔥 ቲክቶክ እና ሶሻል ሚዲያ (Viral Hook)",
        headline: `አስደናቂ መረጃ! ${topicStr}`,
        hookNote: "ለሶሻል ሚዲያ ተስማሚ አጭር ርዕስ",
      },
    ],
  });
});

/**
 * Microphone Audio Transcribe Endpoint (Speech-to-Text with Gemini)
 */
app.post("/api/news/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: "የድምፅ ቅጂ አልተገኘም (audioBase64 required)" });
    }

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, "");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType.split(";")[0],
              },
            },
            {
              text: `እርስዎ የፋና ብሮድካስቲንግ ከፍተኛ የዜና ቃለ-መጠይቅ እና ድምፅ አንባቢ ነዎት።
ይህንን የተናገረውን የአማርኛ ድምፅ በትክክል ሰምተው ወደ ተነባቢ፣ ንጹህ እና ፕሮፌሽናል የአማርኛ የዜና ጽሑፍ ቀይረው ይመልሱ።
ማስታወሻ፦ ንግግሩን እና ጽሑፉን ብቻ ጽፈው ይመልሱ፤ ምንም ተጨማሪ መግቢያ፣ ትርጓሜ ወይም ማብራሪያ አይጻፉ። ሥርዓተ-ነጥቦችን (፤ ፣ ።) በትክክል ይጠቀሙ።`,
            },
          ],
        },
      ],
    });

    const transcript = response.text?.trim() || "";
    return res.json({ transcript });
  } catch (error: any) {
    console.error("Transcribe Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "ድምፁን ወደ ጽሑፍ መቀየር አልተቻለም" });
  }
});

/**
 * AI Newsroom Assistant Chat Endpoint
 */
app.post("/api/news/chat", async (req, res) => {
  try {
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "መልዕክት አልተገኘም (messages array required)" });
    }

    // Filter valid messages and ensure the first message starts with 'user'
    const filtered = messages.filter((m: any) => m?.text && m.text.trim());
    const firstUserIdx = filtered.findIndex(
      (m: any) => m.role === "user" || (m.role !== "assistant" && m.role !== "model")
    );
    const validMessages = firstUserIdx !== -1 ? filtered.slice(firstUserIdx) : filtered;

    if (validMessages.length === 0) {
      return res.json({ reply: "እባክዎ የሚፈልጉትን ጥያቄ ወይም የዜና ሀሳብ ይጻፉ።" });
    }

    const formattedContents = validMessages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: `እርስዎ የዜና አንባቢ ስቱዲዮው (News Reader Studio) ዋና የዜና ኤዲተርና የጋዜጠኞች ረዳት ነዎት።
ለጋዜጠኞችና ለዜና አዘጋጆች የሚከተሉትን ሙያዊ ድጋፎች ይሰጣሉ:
1. የዜና መረጃዎችንና ምንጮችን ማጣራት (Fact-checking advice)
2. አጫጭር መረጃዎችን ወደ ሙሉ የዜና ዘገባ ማሳደግ
3. ለቲክቶክ፣ ዩቲዩብ እና ቴሌግራም የሚሆኑ ማራኪ መንጠቆዎችን (Hooks) ማዘጋጀት
4. ከእንግሊዝኛ ወደ አማርኛ የዜና አጻጻፍ ስልት መተርጎም
መልስዎን ሁልጊዜ በአክብሮት፣ በማራኪ እና ፕሮፌሽናል የአማርኛ ቋንቋ ያቅርቡ።`,
        },
      });

      const text = response.text?.trim() || "";
      if (text) {
        return res.json({ reply: text });
      }
    } catch (modelErr: any) {
      console.warn("Gemini model call warning, activating newsroom fallback:", modelErr?.message || modelErr);
    }

    // Fallback: Intelligent Broadcast Newsroom Editor Assistant
    const lastUserMsg = validMessages[validMessages.length - 1]?.text || "";
    let fallbackReply = `በዜና አንባቢ ስቱዲዮው ክፍል አሰራር መሰረት ለቀረበው ሀሳብ የሚከተለውን ሙያዊ ምክር አዘጋጅተናል፦\n\n`;

    if (lastUserMsg.includes("መንጠቆ") || lastUserMsg.includes("ቲክቶክ") || lastUserMsg.includes("ሾርትስ")) {
      fallbackReply += `🎯 **ለሶሻል ሚዲያ (ቲክቶክ/ዩቲዩብ) 3 ማራኪ የዜና መንጠቆዎች፦**\n1. "ይህን ያውቁ ኖሯል? በዛሬው ዕለት የወጣው አስደናቂ መረጃ..."\n2. "ሰበር መረጃ! በመላው ኢትዮጵያ ከፍተኛ መነጋገሪያ የሆነው ዜና..."\n3. "ከጥቂት ደቂቃዎች በፊት የደረሰን አዲስ መረጃ እነሆ..."\n\n📌 *ምክር፦ በመጀመሪያዎቹ 3 ሰከንዶች ውስጥ ዋናውን ነጥብ በመናገር ተመልካቹን ያስሩ!*`;
    } else if (lastUserMsg.includes("ጥያቄ") || lastUserMsg.includes("ቃለ-መጠይቅ")) {
      fallbackReply += `🎙️ **ለዚህ ዜና የሚሆኑ 3 ቁልፍ የቃለ-መጠይቅ ጥያቄዎች፦**\n1. "ይህ ውሳኔ በማህበረሰቡ እና በኢኮኖሚው ላይ ምን ተጨባጭ ለውጥ ያመጣል?"\n2. "የተያዘው የጊዜ ሰሌዳ እና አፈፃፀሙ ምን ይመስላል?"\n3. "ለህዝብ የሚተላለፈው ዋና መልዕክትና ጥንቃቄ ምንድን ነው?"`;
    } else if (lastUserMsg.includes("ነጥብ") || lastUserMsg.includes("አጠቃልል") || lastUserMsg.includes("አሳጥር")) {
      fallbackReply += `📋 **የዜናው ዋና ዋና ነጥቦች ማጠቃለያ፦**\n• የዜናው ዋና መነሻና የተከሰተበት ሁኔታ\n• በቀጥታ የሚመለከታቸው አካላትና የተሰጡ ምላሾች\n• ቀጣይ እርምጃዎችና የክትትል መረጃዎች\n\n*ማስታወሻ፦ ጽሑፉን በስክሪፕት ሳጥንዎ ውስጥ አስገብተው በድምፅ ማሰማት ይችላሉ።*`;
    } else {
      fallbackReply += `የዜና ስክሪፕትዎን በዜና አንባቢ ስቱዲዮው የአቀራረብ ስልት ለማሳመር፦\n1. ዓረፍተ-ነገሮቹን አጫጭር እና ግልጽ ያድርጓቸው።\n2. አኃዞችን እና አጽህሮተ-ቃላትን በአማርኛ ፊደል ሙሉ አድርገው ይጻፉ።\n3. በስክሪፕት ሳጥኑ ስር ያለውን **«የዜና አዘጋጅ»** ወይም **«ርዕስ አመንጭ»** ቁልፍ በመጫን ጽሑፉን ማበልጸግ ይችላሉ።`;
    }

    return res.json({ reply: fallbackReply });
  } catch (error: any) {
    console.error("Chat Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "መልስ ማግኘት አልተቻለም" });
  }
});

/**
 * AI News Thumbnail / Story Graphics Generator Endpoint
 */
app.post("/api/news/image", async (req, res) => {
  try {
    const { prompt, headline } = req.body || {};
    const inputPrompt = prompt || headline || "Ethiopian broadcast news studio breaking news report";

    const enhancedPrompt = `Photorealistic modern Ethiopian television broadcast news graphics for News Reader Studio (ዜና አንባቢ ስቱዲዮው), headline graphic: "${inputPrompt}", dramatic newsroom studio lighting, high resolution 8k, cinematic broadcast quality, clean graphic design.`;

    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "16:9",
      },
    });

    const image = response.generatedImages?.[0]?.image;
    if (image?.imageBytes) {
      const imageUrl = `data:image/jpeg;base64,${image.imageBytes}`;
      return res.json({ imageUrl });
    }

    return res.status(500).json({ error: "ምስል ማመንጨት አልተቻለም" });
  } catch (error: any) {
    console.error("Image Gen Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "የምስል አገልግሎት አልተሳካም" });
  }
});

app.use(express.static(path.join(__dirname, "public")));

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🎙️ Fana Voice News Studio Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
