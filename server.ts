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

// Initialize GoogleGenAI SDK on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
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
    const { text, voice = "Fenrir", style = "Authoritative Ethiopian broadcast news anchor at Fana Broadcasting Corporate, reading Amharic news clearly with natural broadcast rhythm and cadence" } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "ጽሑፍ አልተገኘም (Text is required)" });
    }

    const cleanText = text.trim();
    const cacheKey = `${voice}:::${cleanText}:::${style}`;

    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      return res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        cached: true,
      });
    }

    // Call Gemini 3.8 Flash Lite TTS with speech configuration
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: style,
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

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

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
app.post("/api/news/format", async (req, res) => {
  try {
    const { rawText, formatType = "breaking" } = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "ጽሑፍ አልተገኘም (Raw text required)" });
    }

    const prompt = `እርስዎ የፋና ብሮድካስቲንግ ኮርፖሬት (Fana Broadcasting Corporate) ከፍተኛ የዜና አዘጋጅና ኤዲተር ነዎት። 
የቀረበውን ጽሑፍ ተመልክተው ለሶሻል ሚዲያ (ቲክቶክ፣ ቴሌግራም፣ ዩቲዩብ) እና ለቴሌቪዥን ዜና አቅራቢዎች ተስማሚ በሆነ የፋና ፕሮፌሽናል የዜና አጻጻፍ ስልት ያዘጋጁ።

የተሰጠው ጽሑፍ:
"""
${rawText}
"""

የተመረጠው የዜና ቅርጸት: ${formatType} (breaking: ሰበር ዜና, headline: ዋና ዜና, report: የትንታኔ ዘገባ, sports: ስፖርት, brief: አጭር የ30 ሰከንድ ዜና)

ደንቦች:
1. ጽሑፉን በንጹህ እና ማራኪ አማርኛ፣ ያለምንም የፊደልና የሰዋሰው ስህተት አዘጋጁ።
2. አጽህሮተ-ቃላትን ወደ ሙሉ ቃል ቀይሩ (ምሳሌ፦ "ጠ/ሚ" -> "ጠቅላይ ሚኒስትር"፣ "ዶ/ር" -> "ዶክተር"፣ "ኪ.ሜ" -> "ኪሎሜትር"፣ "ብር" -> "የኢትዮጵያ ብር") የድምፅ አንባቢው በቀላሉ እንዲያነበው።
3. አንባቢው የት ላይ ማቆም እንዳለበት የሚያሳዩ ሥርዓተ-ነጥቦችን (፤ ፣ ።) በትክክል ተጠቀሙ።
4. የፋና ዜና የተለመዱ መግቢያ እና መደምደሚያዎችን አካትቱ (ለምሳሌ፦ "ሰበር ዜና፤ ... ፋና ዜና አዲስ አበባ")።

መልስዎን በሚከተለው JSON ቅርጸት ብቻ ይመልሱ:
{
  "headline": "አጭርና ሳቢ የዜና ርዕስ",
  "broadcastScript": "ጋዜጠኛው ቀጥታ የሚያነበው ሙሉ የዜና ጽሑፍ",
  "category": "ሰበር ዜና / ፖለቲካ / ኢኮኖሚ / ስፖርት / ዓለም አቀፍ",
  "estimatedDurationSec": 45,
  "teleprompterNotes": "ለአቅራቢው የተዘጋጀ የድምፅና የቅላጼ መመሪያ"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonText = response.text?.trim() || "{}";
    let parsed: any;
    try {
      // Strip markdown code fences if present
      const cleanJson = jsonText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        headline: "አበይት ዜና",
        broadcastScript: response.text || rawText,
        category: "ሰበር ዜና",
        teleprompterNotes: "በተረጋጋ የዜና አቀራረብ ስልት ያንብቡ"
      };
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error("News Format Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "ዜናውን ማስተካከል አልተቻለም" });
  }
});

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

startServer();
