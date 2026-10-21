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
  Zap,
  CheckCircle,
} from "lucide-react";
import { downloadBlob, downloadDirectVideo, openCapCutWithMedia } from "../utils/mediaMerger";

// Safe rounded rectangle for cross-browser 2D Canvas rendering
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof (ctx as any).roundRect === "function") {
    ctx.beginPath();
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

// Word-wraps text into distinct lines for canvas rendering
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split("\n");
  const result: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      result.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        result.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
  }

  return result;
}

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
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);

  // Pure Text Motion Video State (no mic, no camera, full text animation)
  const [isExportingTextVideo, setIsExportingTextVideo] = useState<boolean>(false);
  const [textVideoProgress, setTextVideoProgress] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const textRecorderRef = useRef<MediaRecorder | null>(null);
  const textAnimIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      stopTextVideoExport();
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

  // Clean up camera & text animation on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopTextVideoExport();
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
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const stopTextVideoExport = () => {
    if (textAnimIdRef.current) {
      cancelAnimationFrame(textAnimIdRef.current);
      textAnimIdRef.current = null;
    }
    if (textRecorderRef.current && textRecorderRef.current.state !== "inactive") {
      textRecorderRef.current.stop();
    }
    setIsExportingTextVideo(false);
  };

  // Pure Text Motion Video Generator (No microphone, no webcam, full text animation)
  const startTextScrollVideoExport = () => {
    if (isExportingTextVideo) {
      stopTextVideoExport();
      return;
    }

    try {
      setIsExportingTextVideo(true);
      setTextVideoProgress(0);

      const width = 1280;
      const height = 720;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;

      const effectiveFontSize = Math.max(34, Math.min(48, fontSize));
      ctx.font = `bold ${effectiveFontSize}px "Nyala", "Noto Sans Ethiopic", system-ui, -apple-system, sans-serif`;

      const maxWidth = width - 240;
      const lines = wrapText(ctx, script || "የፋና ብሮድካስቲንግ የቀጥታ ዜና ስርጭት", maxWidth);
      const lineHeight = effectiveFontSize * 1.55;
      const totalContentHeight = Math.max(height, lines.length * lineHeight);

      // Start scrolling entering viewport, end when last line passes
      const startScrollY = -(height * 0.35);
      const endScrollY = totalContentHeight + (height * 0.4);
      const totalDistance = Math.max(1, endScrollY - startScrollY);

      const stream = canvas.captureStream(30);
      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
      ];
      const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 3500000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      textRecorderRef.current = recorder;

      recorder.onstop = () => {
        if (textAnimIdRef.current) {
          cancelAnimationFrame(textAnimIdRef.current);
          textAnimIdRef.current = null;
        }
        setIsExportingTextVideo(false);
        const finalBlob = new Blob(chunks, { type: mimeType });
        setRecordedVideoBlob(finalBlob);

        // DIRECT DOWNLOAD TO DEVICE (pure text animation, no camera, no mic)
        downloadDirectVideo(finalBlob, "teleprompter_text_animation");
        setSuccessMsg("ሙሉ የጽሑፍ እንቅስቃሴ ቪዲዮው በቀጥታ ወደ ዲቫይስዎ ወርዶ ተቀምጧል!");
        setTimeout(() => setSuccessMsg(null), 5000);
      };

      recorder.start(100);

      // Speed: Pixels per frame based on scrollSpeed slider
      const speedFactor = Math.max(2.4, scrollSpeed * 2.5);
      let currentY = startScrollY;

      const renderLoop = () => {
        currentY += speedFactor;
        const progress = Math.min(100, Math.round(((currentY - startScrollY) / totalDistance) * 100));
        setTextVideoProgress(progress);

        // 1. Dark Broadcast Background
        ctx.fillStyle = "#09090b";
        ctx.fillRect(0, 0, width, height);

        // 2. Reading Guide Line across the middle
        ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, height / 2);
        ctx.lineTo(width - 80, height / 2);
        ctx.stroke();

        // 3. Render Amharic Text Lines
        ctx.font = `bold ${effectiveFontSize}px "Nyala", "Noto Sans Ethiopic", system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < lines.length; i++) {
          const lineText = lines[i];
          if (!lineText) continue;
          const lineY = i * lineHeight - currentY;
          if (lineY > -lineHeight && lineY < height + lineHeight) {
            const distFromCenter = Math.abs(lineY - height / 2);
            if (distFromCenter < lineHeight * 0.75) {
              ctx.fillStyle = "#ffffff";
            } else {
              ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
            }
            ctx.fillText(lineText, width / 2, lineY);
          }
        }

        // 4. Soft Top Shadow Fade
        const topGrad = ctx.createLinearGradient(0, 0, 0, 100);
        topGrad.addColorStop(0, "rgba(9, 9, 11, 1)");
        topGrad.addColorStop(1, "rgba(9, 9, 11, 0)");
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, width, 100);

        // 5. Soft Bottom Shadow Fade
        const btmGrad = ctx.createLinearGradient(0, height - 100, 0, height);
        btmGrad.addColorStop(0, "rgba(9, 9, 11, 0)");
        btmGrad.addColorStop(1, "rgba(9, 9, 11, 1)");
        ctx.fillStyle = btmGrad;
        ctx.fillRect(0, height - 100, width, 100);

        // 6. Teleprompter Badge
        ctx.fillStyle = "rgba(220, 38, 38, 0.95)";
        drawRoundedRect(ctx, 40, 24, 130, 32, 6);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText("ቴሌፕሮምፕተር", 105, 41);

        if (currentY < endScrollY) {
          textAnimIdRef.current = requestAnimationFrame(renderLoop);
        } else {
          // Finished entire text motion!
          if (recorder.state === "recording") {
            recorder.stop();
          }
        }
      };

      textAnimIdRef.current = requestAnimationFrame(renderLoop);
    } catch (err) {
      console.error("Text scroll export error:", err);
      setIsExportingTextVideo(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedVideoBlob) return;
    const ext = recordedVideoBlob.type.includes("mp4") ? "mp4" : "webm";
    downloadBlob(recordedVideoBlob, `teleprompter_text_${Date.now()}.${ext}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col font-sans select-none">
      {/* Live Text Video Export Status Banner */}
      {isExportingTextVideo && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 border border-emerald-500/80 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold">
            ሙሉ የጽሑፍ እንቅስቃሴ ቪዲዮ በመዘጋጀት ላይ ነው... ({textVideoProgress}%)
          </span>
          <button
            type="button"
            onClick={stopTextVideoExport}
            className="px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
          >
            አሁን አውርድና ጨርስ
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-950/95 border border-emerald-500 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs text-emerald-200 animate-fade-in font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

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

          {/* PRIMARY ACTION: Download Full Text Motion Video */}
          <button
            type="button"
            onClick={startTextScrollVideoExport}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer ${
              isExportingTextVideo
                ? "bg-emerald-600 text-white animate-pulse"
                : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-950/60"
            }`}
            title="ያለምንም ድምፅና ካሜራ የሙሉ ጽሑፉን እንቅስቃሴ ቪዲዮ በቀጥታ ያውርዱ"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              {isExportingTextVideo
                ? `${textVideoProgress}% በማውረድ ላይ...`
                : "የጽሑፍ እንቅስቃሴ ቪዲዮ አውርድ"}
            </span>
          </button>

          {/* Re-download button if already exported */}
          {recordedVideoBlob && (
            <button
              type="button"
              onClick={handleDownloadVideo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg shadow-md transition-all cursor-pointer"
              title="ቪዲዮውን በድጋሚ ያውርዱ"
            >
              <Download className="w-3.5 h-3.5" />
              <span>በድጋሚ አውርድ</span>
            </button>
          )}

          {/* Optional Camera Preview Toggle */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-2 rounded-lg transition-all cursor-pointer ${
              isCameraActive
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                : "bg-neutral-900 text-neutral-400 hover:text-white"
            }`}
            title="የካሜራ እይታ"
          >
            {isCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

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
