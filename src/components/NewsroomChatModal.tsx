import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  X,
  Sparkles,
  Copy,
  Check,
  Plus,
  Radio,
  User,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface NewsroomChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScript: string;
  onInsertText: (text: string) => void;
}

const QUICK_PROMPTS = [
  "ይህንን ዜና ለቲክቶክ እና ዩቲዩብ ሾርትስ በሚመች አጭር መንጠቆ (Hook) አሳምርልኝ",
  "ለዚህ ዜና ለባለሙያ የሚቀርቡ 3 ቁልፍ የቃለ-መጠይቅ ጥያቄዎችን አዘጋጅልኝ",
  "የዚህን ዜና ዋና ዋና ነጥቦች በአጭሩ ዘርዝርልኝ",
  "የዜናውን ምንጭና መረጃ እንዴት ማረጋገጥ እንደሚቻል ሙያዊ ምክር ስጠኝ",
];

export const NewsroomChatModal: React.FC<NewsroomChatModalProps> = ({
  isOpen,
  onClose,
  currentScript,
  onInsertText,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      text: "እንኳን ወደ ፋና የዜና ክፍል AI ረዳት በደህና መጡ! ጽሑፎችን ለማስተካከል፣ የቃለ-መጠይቅ ጥያቄዎችን ለማዘጋጀት ወይም የዜና መረጃዎችን ለማጣራት ምን ላግዝዎት?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      text: text,
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText("");
    setIsLoading(true);

    try {
      // Include current script context if applicable
      const contextPrefix = currentScript.trim()
        ? `[በስቱዲዮው ውስጥ ያለው የአሁኑ ዜና ስክሪፕት፦ "${currentScript.slice(0, 500)}..."]\n\n`
        : "";

      const res = await fetch("/api/news/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m, idx) => ({
            role: m.role === "user" ? "user" : "model",
            text: idx === newHistory.length - 1 ? contextPrefix + m.text : m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("ምላሽ ማግኘት አልተቻለም");
      }

      const data = await res.json();
      const replyText = data.reply || "ምላሽ ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          role: "assistant",
          text: replyText,
        },
      ]);
    } catch (err: any) {
      console.warn("Chat error:", err);
      const lower = text.toLowerCase();
      let fallback = "";
      if (lower.includes("መንጠቆ") || lower.includes("ቲክቶክ") || lower.includes("ሾርትስ")) {
        fallback = `🎯 **ለሶሻል ሚዲያ (ቲክቶክ/ዩቲዩብ) 3 ማራኪ የዜና መንጠቆዎች፦**\n1. "ይህን ያውቁ ኖሯል? በዛሬው ዕለት የወጣው አስደናቂ መረጃ..."\n2. "ሰበር መረጃ! በመላው ኢትዮጵያ ከፍተኛ መነጋገሪያ የሆነው ዜና..."\n3. "ከጥቂት ደቂቃዎች በፊት የደረሰን አዲስ መረጃ እነሆ..."\n\n📌 *ምክር፦ በመጀመሪያዎቹ 3 ሰከንዶች ውስጥ ዋናውን ነጥብ በመናገር ተመልካቹን ያስሩ!*`;
      } else if (lower.includes("ጥያቄ") || lower.includes("ቃለ-መጠይቅ")) {
        fallback = `🎙️ **ለዚህ ዜና የሚሆኑ 3 ቁልፍ የቃለ-መጠይቅ ጥያቄዎች፦**\n1. "ይህ ውሳኔ በማህበረሰቡ እና በኢኮኖሚው ላይ ምን ተጨባጭ ለውጥ ያመጣል?"\n2. "የተያዘው የጊዜ ሰሌዳ እና አፈፃፀሙ ምን ይመስላል?"\n3. "ለህዝብ የሚተላለፈው ዋና መልዕክትና ጥንቃቄ ምንድን ነው?"`;
      } else {
        fallback = `የዜና ስክሪፕትዎን በዜና አንባቢ ስቱዲዮው የአቀራረብ ስልት ለማሳመር፦\n1. ዓረፍተ-ነገሮቹን አጫጭር እና ግልጽ ያድርጓቸው።\n2. አኃዞችን እና አጽህሮተ-ቃላትን በአማርኛ ፊደል ሙሉ አድርገው ይጻፉ።\n3. በስክሪፕት ሳጥኑ ስር ያለውን **«የዜና አዘጋጅ»** ወይም **«ርዕስ አመንጭ»** ቁልፍ በመጫን ጽሑፉን ማበልጸግ ይችላሉ።`;
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_fallback_${Date.now()}`,
          role: "assistant",
          text: fallback,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl h-[85vh] max-h-[750px] overflow-hidden shadow-2xl shadow-black/80 text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-neutral-950 to-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  የዜና ክፍል AI ረዳት
                </h2>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Topic Chips */}
        <div className="p-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-800 whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                  <Radio className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed font-sans ${
                  m.role === "user"
                    ? "bg-amber-500 text-neutral-950 font-medium rounded-tr-none shadow-md"
                    : "bg-neutral-950 border border-neutral-800 text-neutral-100 rounded-tl-none shadow-sm"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>

                {m.role === "assistant" && m.id !== "initial" && (
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-neutral-900">
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.text)}
                      className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white transition-colors"
                      title="ኮፒ"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">ኮፒ ተደርጓል</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>ኮፒ</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onInsertText(m.text)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                      title="ወደ ስክሪፕቱ ጨምር"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ወደ ስክሪፕት ጨምር</span>
                    </button>
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-neutral-400 pl-11">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>የፋና ዜና ክፍል ረዳት በማሰብ ላይ ነው...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="ጥያቄዎን ወይም የዜና ሀሳብዎን እዚህ ይጻፉ..."
              className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none font-sans"
            />

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
