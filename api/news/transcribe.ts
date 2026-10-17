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

    const { audioBase64, mimeType = "audio/webm" } = req.body || {};
    if (!audioBase64) {
      return res.status(400).json({ error: "audioBase64 is required" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

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
    console.error("Transcribe API Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "ድምፁን ወደ ጽሑፍ መቀየር አልተቻለም" });
  }
}
