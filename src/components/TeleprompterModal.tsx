import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Play,
  Square,
  FlipHorizontal,
  Type,
  RotateCcw,
  Video,
  VideoOff,
  Download,
  ExternalLink,
  CircleDot,
  Scissors,
} from "lucide-react";
import { downloadBlob, downloadDirectVideo, openCapCutWithMedia } from "../utils/mediaMerger";

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  anchorName: string;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  isOpen,
  onClose,
  script,
  isPlaying,
  onTogglePlay,
  anchorName,
}) => {
  const [fontSize, setFontSize] = useState<number>(36);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.5);
  const [isMirrored, setIsMirrored] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let animId: number;
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const autoScroll = () => {
      if (isPlaying && scrollContainer) {
        scrollContainer.scrollTop += scrollSpeed * 0.7;
      }
      animId = requestAnimationFrame(autoScroll);
    };

    animId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isPlaying, scrollSpeed]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, []);

  const handleResetScroll = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
      }
    }
  };

  const stopCamera = () => {
    if (isRecordingVideo) {
      stopVideoRecording();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Start / Stop Video Recording
  const startVideoRecording = async () => {
    if (!mediaStreamRef.current) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        return;
      }
    }

    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];
    const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
    const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

    const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      setRecordedVideoBlob(blob);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      setRecordingSeconds(0);
      setIsRecordingVideo(false);
      // Directly download to user's device without requiring an extra click
      downloadDirectVideo(blob, "teleprompter_news_video");
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setIsRecordingVideo(true);
    setRecordedVideoBlob(null);
    setRecordingSeconds(0);

    // Auto-scroll when recording starts
    if (!isPlaying) {
      onTogglePlay();
    }

    recordTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    setIsRecordingVideo(false);
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoBlob) return;
    const ext = recordedVideoBlob.type.includes("mp4") ? "mp4" : "webm";
    downloadBlob(recordedVideoBlob, `teleprompter_video_${Date.now()}.${ext}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col font-sans select-none">
      {/* Top Prompter Toolbar */}
      <div className="h-16 border-b border-neutral-800 bg-neutral-950 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0">
        {/* Brand / Anchor */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/80 border border-red-700/60">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-red-300">ቴሌፕሮምፕተር</span>
          </div>
          {anchorName && (
            <span className="text-xs font-semibold text-amber-400 hidden sm:inline">{anchorName}</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar">
          {/* Font Size */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400">
            <Type className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="range"
              min="24"
              max="54"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Speed */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400">
            <span className="text-[11px] font-mono">ፍጥነት</span>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Mirror Flip */}
          <button
            type="button"
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isMirrored ? "bg-amber-500 text-neutral-950" : "bg-neutral-900 text-neutral-300 hover:text-white"
            }`}
            title="መስተዋት"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Reset Scroll */}
          <button
            type="button"
            onClick={handleResetScroll}
            className="p-2 rounded-lg bg-neutral-900 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="ወደ መጀመሪያ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              isCameraActive
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                : "bg-neutral-900 text-neutral-300 hover:text-white"
            }`}
            title="ካሜራ"
          >
            {isCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Video Record / Stop Button */}
          {isRecordingVideo ? (
            <button
              type="button"
              onClick={stopVideoRecording}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-950/60 animate-pulse transition-all cursor-pointer"
            >
              <CircleDot className="w-3.5 h-3.5 fill-current animate-ping" />
              <span>{recordingSeconds}s አቁም</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startVideoRecording}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-neutral-900 hover:bg-red-950 text-red-400 hover:text-red-300 border border-red-800/80 rounded-lg transition-all cursor-pointer"
            >
              <CircleDot className="w-3.5 h-3.5 text-red-500" />
              <span>ቪዲዮ ቅረጽ</span>
            </button>
          )}

          {/* Direct Video Download Button */}
          {recordedVideoBlob && (
            <button
              type="button"
              onClick={handleDownloadVideo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ቪዲዮ አውርድ</span>
            </button>
          )}

          {/* Direct CapCut Launcher Button */}
          <button
            type="button"
            onClick={() =>
              openCapCutWithMedia({
                blob: recordedVideoBlob,
                filename: `teleprompter_news_video_${Date.now()}.webm`,
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 text-white border border-neutral-700 rounded-lg shadow-sm transition-all cursor-pointer"
            title="CapCut ላይ አርትዕ"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-400" />
            <span>CapCut</span>
          </button>

          {/* Audio / Prompter Play Toggle */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer ${
              isPlaying
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-neutral-950"
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>አቁም</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>አንብብ</span>
              </>
            )}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Prompter Main Content View with Optional Camera PIP/Backdrop */}
      <div className="relative flex-1 overflow-hidden flex flex-col">
        {/* Live Camera View */}
        {isCameraActive && (
          <div className="absolute top-4 right-4 z-20 w-44 sm:w-60 aspect-video rounded-xl overflow-hidden border-2 border-red-500 shadow-2xl bg-black">
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
            {isRecordingVideo && (
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-bold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>REC {recordingSeconds}s</span>
              </div>
            )}
          </div>
        )}

        {/* Prompter Text Scroll Area */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto px-6 sm:px-16 lg:px-32 py-24 text-center ${
            isMirrored ? "-scale-x-100" : ""
          }`}
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="max-w-4xl mx-auto">
            <p
              className="text-white font-bold leading-relaxed tracking-wide transition-all"
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
            >
              {script || "ምንም ጽሑፍ አልተገኘም። እባክዎ በስቱዲዮው ውስጥ የዜና ጽሑፍ ያስገቡ።"}
            </p>
          </div>
        </div>

        {/* Center Prompter Reading Line */}
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-[2px] bg-red-600/40 -translate-y-1/2 flex items-center justify-between px-4">
          <span className="text-[10px] font-mono text-red-500 bg-neutral-950/80 px-1 rounded">
            ●
          </span>
          <span className="text-[10px] font-mono text-red-500 bg-neutral-950/80 px-1 rounded">
            ●
          </span>
        </div>
      </div>
    </div>
  );
};
