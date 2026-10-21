import React, { useState } from "react";
import {
  X,
  Download,
  Play,
  Square,
  Video,
  Scissors,
  Loader2,
} from "lucide-react";
import {
  downloadBlob,
  downloadDirectVideo,
  downloadUrl,
  openCapCutWithMedia,
  mergeImageAndAudioToVideo,
} from "../utils/mediaMerger";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioBlob: Blob | null;
  audioUrl: string | null;
  script: string;
  anchorName: string;
  newsImageUrl?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  audioBlob,
  audioUrl,
  script,
  anchorName,
  newsImageUrl = "/images/studio_hero.jpg",
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isMergingVideo, setIsMergingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [exportedVideoBlob, setExportedVideoBlob] = useState<Blob | null>(null);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleDownloadAudio = () => {
    const filename = `broadcast_audio_${Date.now()}.wav`;
    if (audioBlob) {
      downloadBlob(audioBlob, filename);
    } else if (audioUrl) {
      downloadUrl(audioUrl, filename);
    }
  };

  const handleCreateVideo = async () => {
    setIsMergingVideo(true);
    setVideoProgress(0);

    try {
      const headline = script.split("\n")[0] || "የዜና አንባቢ ስቱዲዮው";
      const blob = await mergeImageAndAudioToVideo({
        imageUrl: newsImageUrl,
        audioBlob,
        audioUrl: audioUrl || "/audio/sample_dawit_news.wav",
        headline,
        anchorName,
        onProgress: (pct) => setVideoProgress(pct),
      });

      setExportedVideoBlob(blob);
      // Directly download to user's device without requiring a second click
      downloadDirectVideo(blob, "broadcast_video");
    } catch (err) {
      console.warn("Video merge error:", err);
    } finally {
      setIsMergingVideo(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!exportedVideoBlob) return;
    const ext = exportedVideoBlob.type.includes("mp4") ? "mp4" : "webm";
    downloadBlob(exportedVideoBlob, `broadcast_video_${Date.now()}.${ext}`);
  };

  const togglePreview = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">ድምፅና ቪዲዮ አውርድ</h3>
          </div>

          <button
            onClick={() => {
              if (audioPlayerRef.current) audioPlayerRef.current.pause();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player Card */}
        {audioUrl ? (
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlayingAudio(false)}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">{anchorName}</p>
                <p className="text-xs text-amber-400/90 font-mono">24kHz Master WAV</p>
              </div>

              <button
                type="button"
                onClick={togglePreview}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition-colors shadow-md cursor-pointer"
              >
                {isPlayingAudio ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* Audio Download Button */}
              <button
                type="button"
                onClick={handleDownloadAudio}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ድምፅ አውርድ (.WAV)</span>
              </button>

              {/* Video Creation & Download */}
              {exportedVideoBlob ? (
                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>ቪዲዮ አውርድ (MP4)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateVideo}
                  disabled={isMergingVideo}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isMergingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{videoProgress}% ቪዲዮ በማዘጋጀት ላይ...</span>
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>ምስልና ድምፅ ወደ ቪዲዮ ቀይር</span>
                    </>
                  )}
                </button>
              )}

              {/* 1-Click CapCut Button */}
              <button
                type="button"
                onClick={() =>
                  openCapCutWithMedia({
                    blob: exportedVideoBlob || audioBlob,
                    url: audioUrl,
                    filename: exportedVideoBlob
                      ? `news_video_for_capcut_${Date.now()}.webm`
                      : `news_audio_for_capcut_${Date.now()}.wav`,
                  })
                }
                className="w-full py-2.5 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 hover:from-neutral-700 hover:to-neutral-600 text-white border border-neutral-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Scissors className="w-4 h-4 text-cyan-400" />
                <span>CapCut ክፈት</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 text-center text-neutral-400 text-xs">
            <p>ድምፅ አልተገኘም። እባክዎ በስቱዲዮው «አንብብ» የሚለውን ይጫኑ።</p>
          </div>
        )}
      </div>
    </div>
  );
};
