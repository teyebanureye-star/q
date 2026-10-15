import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(401).json({
        error: "በ Vercel ላይ GEMINI_API_KEY አልተገኘም።",
        missingApiKey: true,
      });
    }

    const { rawText, formatType = "breaking" } = req.body || {};
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "ጽሑፍ አልተገኘም" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "aistudio-build" },
      },
    });

    const prompt = `እርስዎ የፋና ብሮድካስቲንግ ኮርፖሬት (Fana Broadcasting Corporate) ከፍተኛ የዜና አዘጋጅና ኤዲተር ነዎት። 
የቀረበውን ጽሑፍ ተመልክተው ለሶሻል ሚዲያ (ቲክቶክ፣ ቴሌግራም፣ ዩቲዩብ) እና ለቴሌቪዥን ዜና አቅራቢዎች ተስማሚ በሆነ የፋና ፕሮፌሽናል የዜና አጻጻፍ ስልት ያዘጋጁ።

የተሰጠው ጽሑፍ:
"""
${rawText}
"""

የተመረጠው የዜና ቅርጸት: ${formatType}

ደንቦች:
1. ጽሑፉን በንጹህ እና ማራኪ አማርኛ፣ ያለምንም የፊደልና የሰዋሰው ስህተት አዘጋጁ።
2. አጽህሮተ-ቃላትን ወደ ሙሉ ቃል ቀይሩ (ምሳሌ፦ "ጠ/ሚ" -> "ጠቅላይ ሚኒስትር"፣ "ዶ/ር" -> "ዶክተር"፣ "ኪ.ሜ" -> "ኪሎሜትር"፣ "ብር" -> "የኢትዮጵያ ብር") የድምፅ አንባቢው በቀላሉ እንዲያነበው።
3. አንባቢው የት ላይ ማቆም እንዳለበት የሚያሳዩ ሥርዓተ-ነጥቦችን (፤ ፣ ።) በትክክል ተጠቀሙ።
4. የፋና ዜና የተለመዱ መግቢያ እና መደምደሚያዎችን አካትቱ።

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
      const cleanJson = jsonText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = {
        headline: "አበይት ዜና",
        broadcastScript: response.text || rawText,
        category: "ሰበር ዜና",
        teleprompterNotes: "በተረጋጋ የዜና አቀራረብ ስልት ያንብቡ",
      };
    }

    return res.json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "ዜናውን ማስተካከል አልተቻለም" });
  }
}
