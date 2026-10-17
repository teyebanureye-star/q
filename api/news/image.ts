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

    const { prompt, headline } = req.body || {};
    const inputPrompt = prompt || headline || "Ethiopian broadcast news studio breaking news report";

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

    const enhancedPrompt = `Photorealistic modern Ethiopian television broadcast news graphics for Fana Broadcasting Corporate, headline graphic: "${inputPrompt}", dramatic newsroom studio lighting, high resolution 8k, cinematic broadcast quality, clean graphic design.`;

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
    console.error("Image Gen API Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "የምስል አገልግሎት አልተሳካም" });
  }
}
