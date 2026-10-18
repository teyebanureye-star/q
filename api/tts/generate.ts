import { GoogleGenAI } from "@google/genai";

// In-memory cache for warm serverless instances
const audioCache = new Map<string, { audioBase64: string; mimeType: string }>();

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();
    if (!apiKey) {
      return res.status(401).json({
        error: "በ Vercel ላይ GEMINI_API_KEY አልተገኘም። እባክዎ በ Vercel Settings > Environment Variables ውስጥ GEMINI_API_KEY አስገብተው Redeploy ያድርጉ።",
        missingApiKey: true,
      });
    }

    const {
      text,
      voice = "Fenrir",
      style,
      language = "am",
    } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "የሚነበብ ጽሑፍ አልተገኘም (Text required)" });
    }

    const cleanText = text.trim();
    const isEnglish = language === "en" || /^[a-zA-Z0-9\s.,!?'"():;\-_/]+$/.test(cleanText.substring(0, 80));
    const cacheKey = `${voice}:::${cleanText}:::${style || "default"}:::${isEnglish ? "en" : "am"}`;

    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        cached: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let audioBase64: string | undefined;

    const languageDirective = isEnglish
      ? "Flawless international broadcast news delivery in English. Speak with crisp, authoritative BBC/CNN style television newsroom articulation, steady rhythm, natural breath control, and professional broadcast pacing."
      : "Flawless standard Ethiopian Amharic broadcast pronunciation. Strictly articulate the consonant 'b' (በ, ቡ, ቢ, ባ, ቤ, ብ, ቦ) as an assertive bilabial plosive [b] (e.g. 'ሰበር' is strictly 'Se-ber' with a solid B, never 'Sever' or 'v'). Natural Addis Ababa newsroom cadence, proper gemination, and zero robotic hesitation.";

    const defaultAmharicStyle = "Authoritative news anchor at Ethiopian News Studio, reading news clearly with natural broadcast rhythm and cadence";
    const defaultEnglishStyle = "Authoritative international television news anchor, delivering stories clearly with polished transatlantic or British newsroom diction";

    const baseStyle = style || (isEnglish ? defaultEnglishStyle : defaultAmharicStyle);
    const fullStyle = `${languageDirective} ${baseStyle}`;

    // Try primary model (gemini-3.8-flash-lite-tts)
    try {
      const response = await ai.models.generateContent({
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

      audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (primaryErr: any) {
      console.warn("Primary model error, attempting fallback model:", primaryErr?.message);
      // Fallback to flagship model (gemini-3.8-flash-tts)
      const fallbackResponse = await ai.models.generateContent({
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

      audioBase64 = fallbackResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }

    if (!audioBase64) {
      return res.status(500).json({ error: "የስቱዲዮ ድምፅ ማመንጨት አልተቻለም" });
    }

    if (audioCache.size > 80) {
      const first = audioCache.keys().next().value;
      if (first) audioCache.delete(first);
    }
    audioCache.set(cacheKey, { audioBase64, mimeType: "audio/wav" });

    return res.json({
      audioBase64,
      mimeType: "audio/wav",
      cached: false,
    });
  } catch (error: any) {
    console.error("Vercel TTS Handler Error:", error?.message || error);
    const isQuota =
      error?.status === 429 ||
      error?.message?.includes("quota") ||
      error?.message?.includes("RESOURCE_EXHAUSTED");

    return res.status(isQuota ? 429 : 500).json({
      error: isQuota
        ? "የ Gemini API ዕለታዊ የነፃ ኮታ ገደብ ደርሷል። እባክዎ ጥቂት ቆይተው እንደገና ይሞክሩ።"
        : error?.message || "ድምፅ ማመንጨት አልተቻለም",
      isQuota,
    });
  }
}
