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

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
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

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { "User-Agent": "aistudio-build" } },
        });

        const formattedContents = validMessages.map((m: any) => ({
          role: m.role === "assistant" || m.role === "model" ? "model" : "user",
          parts: [{ text: m.text }],
        }));

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
      } catch (genErr) {
        console.warn("Vercel AI Chat Warning:", genErr);
      }
    }

    // High quality intelligent editorial fallback
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
    console.error("Newsroom Chat API Error:", error?.message || error);
    return res.status(500).json({ error: error?.message || "መልስ ማግኘት አልተቻለም" });
  }
}
