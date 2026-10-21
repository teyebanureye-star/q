import React, { useState } from "react";
import { X, Sparkles, Wand2, Loader2, Check, ArrowRight } from "lucide-react";

interface AiPolishModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScript: string;
  onApplyScript: (polishedScript: string) => void;
}

export const AiPolishModal: React.FC<AiPolishModalProps> = ({
  isOpen,
  onClose,
  currentScript,
  onApplyScript,
}) => {
  const [inputText, setInputText] = useState(currentScript);
  const [formatType, setFormatType] = useState<string>("breaking");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    headline?: string;
    broadcastScript?: string;
    category?: string;
    teleprompterNotes?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

function clientSideAmharicFormat(rawText: string, formatType: string) {
  const clean = rawText.trim();
  const firstSentence = clean.split(/[።\n.!?]/)[0]?.trim() || clean.slice(0, 70);
  let headline = "";
  if (formatType === "breaking") headline = `🚨 ሰበር ዜና፤ ${firstSentence.slice(0, 80)}`;
  else if (formatType === "headline") headline = `🏛️ አበይት ዜና፤ ${firstSentence.slice(0, 80)}`;
  else if (formatType === "brief") headline = `📱 አጭር መረጃ፤ ${firstSentence.slice(0, 80)}`;
  else headline = `🌍 የትንታኔ ዘገባ፤ ${firstSentence.slice(0, 80)}`;

  let script = clean
    .replace(/\bጠ\/ሚ\b|\bጠ\/ሚኒስትር\b/g, "ጠቅላይ ሚኒስትር")
    .replace(/\bዶ\/ር\b/g, "ዶክተር")
    .replace(/\bወ\/ሮ\b/g, "ወይዘሮ")
    .replace(/\bወ\/ሪት\b/g, "ወይዘሪት")
    .replace(/\bኪ\.ሜ\b|\bኪ\/ሜ\b/g, "ኪሎሜትር")
    .replace(/\bም\/ቤት\b/g, "ምክር ቤት")
    .replace(/\bሚ\/ር\b/g, "ሚኒስቴር")
    .replace(/\bፕ\/ት\b/g, "ፕሬዝዳንት")
    .replace(/\bኮ\/ል\b/g, "ኮሎኔል")
    .replace(/\bጀ\/ል\b/g, "ጄኔራል")
    .replace(/\bዓ\.ም\b|\bዓ\/ም\b/g, "ዓመተ ምሕረት");

  let broadcastScript = "";
  if (formatType === "breaking") {
    broadcastScript = script.startsWith("ሰበር ዜና")
      ? script
      : `ሰበር ዜና፤ የዜና አንባቢ ስቱዲዮው የሰዓቱን አበይት መረጃዎች ይዘንላችሁ ቀርበናል::\n\n${script}\n\nየዜና አንባቢ ስቱዲዮው፤ አዲስ አበባ።`;
  } else if (formatType === "brief") {
    broadcastScript = `አስደናቂ የሰዓቱ አጭር መረጃ! ${script}\n\nለተጨማሪ ወቅታዊ መረጃዎች ይከታተሉን።`;
  } else if (formatType === "report") {
    broadcastScript = `የትንታኔ ዘገባ፤ በዛሬው ዕለት የወጣውን አበይት ጉዳይ አስመልክቶ የቀረበ ዝርዝር ዘገባ::\n\n${script}\n\nየዜና አንባቢ ስቱዲዮው የትንታኔ ዘገባ፤ አዲስ አበባ።`;
  } else {
    broadcastScript = `አበይት ዜናዎች፤ የዜና አንባቢ ስቱዲዮው የሰዓቱ ዋና ዋና ዜናዎችን ይዘን ቀርበናል::\n\n${script}\n\nየዜና አንባቢ ስቱዲዮው፤ አዲስ አበባ።`;
  }

  return {
    headline,
    broadcastScript,
    category: formatType === "breaking" ? "ሰበር ዜና" : formatType === "headline" ? "ዋና ዜና" : "የተስተካከለ ዜና",
    teleprompterNotes: "በተረጋጋና ሳቢ በሆነ የዜና አቀራረብ ስልት ያንብቡ።",
  };
}

  const handlePolish = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/news/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: inputText,
          formatType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.broadcastScript) {
          setResult(data);
          return;
        }
      }

      // Fallback
      const fallback = clientSideAmharicFormat(inputText, formatType);
      setResult(fallback);
    } catch {
      // Fallback on network error
      const fallback = clientSideAmharicFormat(inputText, formatType);
      setResult(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result?.broadcastScript) {
      onApplyScript(result.broadcastScript);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                የዜና አዘጋጅ
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300">
            የሚፈልጉትን የዜና ቅርጸት ይምረጡ፦
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "breaking", label: "🚨 ሰበር ዜና" },
              { id: "headline", label: "🏛️ ዋና ዜና" },
              { id: "brief", label: "📱 ቲክቶክ / ቴሌግራም" },
              { id: "report", label: "🌍 የትንታኔ ዘገባ" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormatType(f.id)}
                className={`px-3 py-2 text-xs rounded-lg border font-medium transition-colors ${
                  formatType === f.id
                    ? "bg-amber-500/20 border-amber-500 text-amber-200"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-300">
            ጥሬ መረጃ ወይም ያልተስተካከለ ጽሑፍ ያስገቡ፦
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="ማስተካከል የሚፈልጉትን መረጃ እዚህ ይጻፉ..."
            className="w-full bg-neutral-950 text-neutral-100 rounded-lg p-3 border border-neutral-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none text-sm font-sans"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={handlePolish}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>በዜና አዘጋጅ ስልት በማዘጋጀት ላይ...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>በዜና አጻጻፍ ስልት አዘጋጅ</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded border border-red-800/60">
            {errorMsg}
          </p>
        )}

        {/* Result Preview Area */}
        {result?.broadcastScript && (
          <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase">
                {result.category || "የተስተካከለ የዜና ስክሪፕት"}
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>ተስተካክሏል</span>
              </span>
            </div>

            {result.headline && (
              <h4 className="text-sm font-bold text-white border-b border-neutral-800 pb-2">
                {result.headline}
              </h4>
            )}

            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans whitespace-pre-wrap">
              {result.broadcastScript}
            </p>

            {result.teleprompterNotes && (
              <p className="text-[11px] text-neutral-400 italic bg-neutral-900 p-2 rounded">
                💡 የአቅራቢው ማስታወሻ፦ {result.teleprompterNotes}
              </p>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg text-xs font-bold transition-colors"
              >
                <span>ወደ ስቱዲዮ ተግብር (Apply to Studio)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
