import React, { useState } from "react";
import {
  ImageIcon,
  Sparkles,
  Download,
  Loader2,
  X,
  Video,
  CheckCircle,
} from "lucide-react";
import {
  mergeImageAndAudioToVideo,
  downloadBlob,
  downloadDirectVideo,
  downloadUrl,
} from "../utils/mediaMerger";

interface NewsGraphicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHeadline: string;
  audioBlob?: Blob | null;
  audioUrl?: string | null;
  anchorName?: string;
}

export const NewsGraphicsModal: React.FC<NewsGraphicsModalProps> = ({
  isOpen,
  onClose,
  currentHeadline,
  audioBlob,
  audioUrl,
  anchorName = "ዳዊት ከበደ",
}) => {
  const [prompt, setPrompt] = useState(currentHeadline || "የሰበር ዜና ስቱዲዮ ዘገባ");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    "/images/studio_hero.jpg"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isMergingVideo, setIsMergingVideo] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [mergedVideoBlob, setMergedVideoBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setMergedVideoBlob(null);

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
        throw new Error("ምስሉ አልተገኘም");
      }
    } catch {
      setGeneratedImageUrl("/images/studio_hero.jpg");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImageUrl) return;
    downloadUrl(generatedImageUrl, `news_image_${Date.now()}.jpg`);
  };

  const handleMergeVideo = async () => {
    if (!generatedImageUrl) return;
    setIsMergingVideo(true);
    setMergeProgress(0);
    setErrorMsg(null);

    try {
      const targetAudioUrl = audioUrl || "/audio/sample_dawit_news.wav";
      const videoBlob = await mergeImageAndAudioToVideo({
        imageUrl: generatedImageUrl,
        audioBlob,
        audioUrl: targetAudioUrl,
        headline: prompt,
        anchorName,
        onProgress: (pct) => setMergeProgress(pct),
      });

      setMergedVideoBlob(videoBlob);
      // Auto download directly to user's device
      downloadDirectVideo(videoBlob, "news_broadcast_video");
    } catch (err: any) {
      console.error("Video merge error:", err);
      setErrorMsg("ቪዲዮውን ማዋሃድ አልተቻለም፤ እባክዎ አስቀድመው ድምፅ ያጫውቱ");
    } finally {
      setIsMergingVideo(false);
    }
  };

  const handleDownloadMergedVideo = () => {
    if (!mergedVideoBlob) return;
    const ext = mergedVideoBlob.type.includes("mp4") ? "mp4" : "webm";
    downloadBlob(mergedVideoBlob, `broadcast_video_${Date.now()}.${ext}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">የዜና ምስልና ቪዲዮ</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Prompt Form */}
          <form onSubmit={handleGenerate} className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="የዜና ርዕስ..."
              className="flex-1 bg-neutral-950 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>ምስል አመንጭ</span>
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
          )}

          {/* Image & Video Visual Area */}
          <div className="aspect-video w-full rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center relative">
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            ) : generatedImageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={generatedImageUrl}
                  alt="News graphic"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3.5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm">
                      16:9 HD
                    </span>

                    <button
                      type="button"
                      onClick={handleDownloadImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 font-bold text-xs rounded-lg shadow-lg transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>ምስል አውርድ</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Action Buttons: Merge Video & Download Video */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* 1. Merge Image & Voice Audio */}
            <button
              type="button"
              onClick={handleMergeVideo}
              disabled={isMergingVideo}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isMergingVideo ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{mergeProgress}% በማዋሃድ ላይ...</span>
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  <span>ምስልና ድምፅ አዋህድ</span>
                </>
              )}
            </button>

            {/* 2. Download Merged Video */}
            {mergedVideoBlob ? (
              <button
                type="button"
                onClick={handleDownloadMergedVideo}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ቪዲዮ አውርድ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadImage}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ምስል አውርድ</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            ዝጋ
          </button>
        </div>
      </div>
    </div>
  );
};
