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
    const rawKey =
      process.env.GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";
    const apiKey = rawKey.replace(/^["']|["']$/g, "").trim();

    if (!apiKey) {
      return res.status(401).json({
        error: "GEMINI_API_KEY አልተገኘም።",
        missingApiKey: true,
      });
    }

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `እርስዎ የፋና ብሮድካስቲንግ ኮርፖሬት (FBC) ዋና የዜና ኤዲተርና የጋዜጠኞች ረዳት ነዎት።
ለጋዜጠኞችና ለዜና አዘጋጆች የሚከተሉትን ሙያዊ ድጋፎች ይሰጣሉ:
1. የዜና መረጃዎችንና ምንጮችን ማጣራት (Fact-checking advice)
2. አጫጭር መረጃዎችን ወደ ሙሉ የዜና ዘገባ ማሳደግ
3. ለቲክቶክ፣ ዩቲዩብ እና ቴሌግራም የሚሆኑ ማራኪ መንጠቆዎችን (Hooks) ማዘጋጀት
4. ከእንግሊዝኛ ወደ አማርኛ የዜና አጻጻፍ ስልት መተርጎም
መልስዎን ሁልጊዜ በአክብሮት፣ በማራኪ እና ፕሮፌሽናል የአማርኛ ቋንቋ ያቅርቡ።`,
      },
    });

    const text = response.text || "መልስ ማዘጋጀት አልተቻለም።";
    return res.json({ reply: text });
  } catch (error: any) {
    console.error("Newsroom Chat API Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "መልስ ማግኘት አልተቻለም" });
  }
}
