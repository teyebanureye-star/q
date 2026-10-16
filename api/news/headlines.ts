import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const rawKey =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return res.status(401).json({
        error: "በ Vercel ላይ GEMINI_API_KEY አልተገኘም።",
        missingApiKey: true,
      });
    }

    const { topic } = req.body || {};

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "እባክዎ ርዕሰ ጉዳይ ያስገቡ (Topic is required)" });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

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
      const cleanJson = jsonText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        headlines: [
          {
            id: "1",
            style: "🚨 ሰበር ዜና (Breaking News)",
            headline: `ሰበር ዜና፤ ${topic.trim()}`,
            hookNote: "አፋጣኝ የሰበር ዜና ርዕስ",
          },
          {
            id: "2",
            style: "🏛️ አበይት ዜና (Prime Broadcast)",
            headline: `የፋና አበይት ዜና፤ ${topic.trim()}`,
            hookNote: "የተሟላ የዋና ዜና ርዕስ",
          },
          {
            id: "3",
            style: "🔥 ቲክቶክ እና ሶሻል ሚዲያ (Viral Hook)",
            headline: `አስደናቂ መረጃ! ${topic.trim()}`,
            hookNote: "ለሶሻል ሚዲያ ተስማሚ አጭር ርዕስ",
          },
        ],
      };
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error("AI Headline Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "ርዕሶችን ማመንጨት አልተቻለም" });
  }
}
