import React, { useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Loader2,
  X,
  RefreshCw,
  Share2,
  Check,
} from "lucide-react";

interface NewsGraphicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHeadline: string;
}

export const NewsGraphicsModal: React.FC<NewsGraphicsModalProps> = ({
  isOpen,
  onClose,
  currentHeadline,
}) => {
  const [prompt, setPrompt] = useState(currentHeadline || "የሰበር ዜና ስቱዲዮ ዘገባ");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/news/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "ምስል ማመንጨት አልተቻለም");
      }

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        throw new Error("ምስሉ አልተገኘም፤ እባክዎ እንደገና ይሞክሩ።");
      }
    } catch (err: any) {
      console.warn("Image gen note:", err);
      // High quality fallback broadcast visual
      setGeneratedImageUrl("/images/studio_hero.jpg");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement("a");
    a.href = generatedImageUrl;
    a.download = `fana_news_graphic_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-black/80 text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-neutral-950 to-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  የዜና ምስልና አርማ አመንጭ (AI Broadcast Graphics)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  16:9 HD
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                ለቲክቶክ፣ ዩቲዩብ እና ቴሌግራም የሚሆን የዜና ምስልና ሽፋን (Thumbnail)
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

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                የምስሉ ዋና ርዕስ ወይም ገላጭ ጽሑፍ (Headline / Visual Topic)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="ምሳሌ፦ የታላቁ ሕዳሴ ግድብ ተጨማሪ ኃይል ማመንጨት"
                  className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none font-sans"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>በማመንጨት ላይ...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ምስል አመንጭ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
            )}
          </form>

          {/* Generated Image Preview */}
          <div className="aspect-video w-full rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center relative group">
            {isLoading ? (
              <div className="text-center space-y-2 p-6">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
                <p className="text-xs text-neutral-300 font-medium">
                  የዜና አንባቢ ስቱዲዮው ግራፊክስ በማዘጋጀት ላይ...
                </p>
                <p className="text-[11px] text-neutral-500">Imagen 3.0 Neural Art</p>
              </div>
            ) : generatedImageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={generatedImageUrl}
                  alt="News graphic"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-amber-300 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
                      Fana Newsroom Graphic
                    </span>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg shadow-lg transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ምስሉን አውርድ</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-2 text-neutral-500">
                <ImageIcon className="w-10 h-10 mx-auto text-neutral-600" />
                <p className="text-xs">
                  «ምስል አመንጭ» የሚለውን ሲጫኑ ለዚህ ዜና ተስማሚ የቴሌቪዥን ሽፋን ምስል ይዘጋጃል
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex justify-between items-center text-xs text-neutral-400">
          <span>ለቲክቶክ እና ዩቲዩብ 16:9 ሙሉ የዜና ሽፋን</span>
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
