import React, { useState } from "react";
import {
  Sparkles,
  Heading,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  X,
  Flame,
  Radio,
  Share2,
  Zap,
} from "lucide-react";

export interface GeneratedHeadline {
  id: string;
  style: string;
  headline: string;
  hookNote: string;
}

interface HeadlineGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyHeadline: (headline: string) => void;
}

const EXAMPLE_TOPICS = [
  "የታላቁ የኢትዮጵያ ሕዳሴ ግድብ ተጨማሪ ኃይል ማመንጨት",
  "የኢትዮጵያ አየር መንገድ አዳዲስ ቦይንግ አውሮፕላኖችን ገዛ",
  "የኢትዮጵያ ንግድ ባንክ አዲስ ዲጂታል የብድር አገልግሎት ይፋ አደረገ",
  "የኢትዮጵያ ፕሪሚየር ሊግ የደረጃ ሰንጠረዥ እና አዳዲስ ውጤቶች",
];

export const HeadlineGeneratorModal: React.FC<HeadlineGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyHeadline,
}) => {
  const [topic, setTopic] = useState("");
  const [headlines, setHeadlines] = useState<GeneratedHeadline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg("እባክዎ መረጃ ወይም ርዕሰ ጉዳይ ያስገቡ");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/news/headlines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "ርዕሶችን ማመንጨት አልተቻለም");
      }

      const data = await res.json();
      if (Array.isArray(data.headlines) && data.headlines.length > 0) {
        setHeadlines(data.headlines);
      } else {
        throw new Error("ምንም ርዕስ አልተገኘም፤ እባክዎ እንደገና ይሞክሩ");
      }
    } catch (err: any) {
      console.error("Headline generation error:", err);
      // Fallback local headlines generator if offline/quota
      const clean = topic.trim();
      setHeadlines([
        {
          id: "1",
          style: "🚨 ሰበር ዜና (Breaking News)",
          headline: `ሰበር ዜና፤ ${clean} ይፋ ተደርጓል!`,
          hookNote: "አፋጣኝ የሰበር ዜና ሪትም",
        },
        {
          id: "2",
          style: "🏛️ አበይት ዜና (Prime Broadcast)",
          headline: `የፋና አበይት ዜና፤ በ${clean} ዙሪያ ዝርዝር መግለጫ ተሰጠ`,
          hookNote: "የተሟላ የዋና ዜና አቀራረብ",
        },
        {
          id: "3",
          style: "🔥 ቲክቶክ እና ሶሻል ሚዲያ (Viral Hook)",
          headline: `ስለ ${clean} እስካሁን ያልተሰሙ አስገራሚ ዝርዝሮች!`,
          hookNote: "ለሶሻል ሚዲያ አጫጭር ቪዲዮዎች ተመራጭ",
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
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl shadow-black/80 text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-neutral-950 to-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  AI የዜና ርዕስ አመንጭ (AI Headline Generator)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                ርዕሰ ጉዳይ ያስገቡ፤ ሲስተሙ 3 እጅግ ሳቢ እና ፕሮፌሽናል የፋና ዜና ርዕሶችን ያዘጋጅልዎታል
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Topic Input Form */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                የዜናው ርዕሰ ጉዳይ ወይም ዋና ሀሳብ (News Topic / Event)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="ምሳሌ፦ የታላቁ ሕዳሴ ግድብ ተጨማሪ ኃይል ማመንጨት ወይም የኢኮኖሚ ማሻሻያ..."
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none pr-28 font-sans"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>በማመንጨት ላይ...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>አመንጭ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
            )}

            {/* Quick Example Topic Chips */}
            <div>
              <span className="text-[11px] text-neutral-400 block mb-1.5">
                የተለመዱ አርዕስተ ዜና ምሳሌዎች፦
              </span>
              <div className="flex flex-wrap gap-1.5">
                {EXAMPLE_TOPICS.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTopic(ex);
                      setErrorMsg(null);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border border-neutral-800 hover:border-neutral-700 transition-colors text-left"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Results: 3 Catchy Headlines */}
          {headlines.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-neutral-800">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>የተዘጋጁ 3 ሳቢ አርዕስተ ዜናዎች (Generated Headlines)</span>
              </h3>

              <div className="space-y-3">
                {headlines.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/50 transition-all space-y-2 group"
                  >
                    {/* Style Badge & Hook Note */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-amber-300 bg-amber-950/40 px-2.5 py-0.5 rounded border border-amber-900/60 font-sans">
                        {item.style}
                      </span>
                      {item.hookNote && (
                        <span className="text-[11px] text-neutral-500">
                          {item.hookNote}
                        </span>
                      )}
                    </div>

                    {/* Headline Text */}
                    <p className="text-sm sm:text-base font-bold text-white leading-snug font-sans group-hover:text-amber-200 transition-colors">
                      {item.headline}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-900">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.headline)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 transition-colors"
                        title="ርዕሱን ኮፒ አድርግ"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">ኮፒ ተደርጓል</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>ኮፒ</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onApplyHeadline(item.headline);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-sm"
                      >
                        <span>ይህን ርዕስ ተጠቀም</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex justify-between items-center text-xs text-neutral-400">
          <span>ለሰበር ዜና፣ ለዋና ዜና እና ለቲክቶክ የተመቻቹ ርዕሶች</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ዝጋ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
