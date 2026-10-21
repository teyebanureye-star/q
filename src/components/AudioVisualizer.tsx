import React, { useEffect, useRef, useState, useCallback } from "react";
import { studioAudio } from "../utils/audioEngine";
import {
  Radio,
  Music2,
  Scissors,
  Play,
  Square,
  RotateCcw,
  Download,
  Crop,
  Layers,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  decodeAudioBlob,
  extractWaveformPeaks,
  autoTrimSilence,
  trimAudioBuffer,
  cutSegmentFromAudioBuffer,
  audioBufferToWavBlob,
} from "../utils/audioEditor";
import { downloadBlob, openCapCutWithMedia } from "../utils/mediaMerger";

interface AudioVisualizerProps {
  isPlaying: boolean;
  anchorName: string;
  musicBedName: string;
  elapsedSeconds: number;
  statusMessage: string;
  audioBlob?: Blob | null;
  audioUrl?: string | null;
  onUpdateAudio?: (newBlob: Blob, newUrl: string) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  anchorName,
  musicBedName,
  elapsedSeconds,
  statusMessage,
  audioBlob,
  audioUrl,
  onUpdateAudio,
}) => {
  // Mode: "waveform" (Interactive Editor) or "live" (Real-time Spectrum VU)
  const [activeTab, setActiveTab] = useState<"waveform" | "live">("waveform");

  // Waveform canvas & live visualizer refs
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftMeterRef = useRef<HTMLDivElement | null>(null);
  const rightMeterRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio Editor State
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Audio playback elements for waveform scrubbing/preview
  const previewAudioElRef = useRef<HTMLAudioElement | null>(null);
  const isDraggingRef = useRef<"start" | "end" | "create" | null>(null);
  const dragStartSecRef = useRef<number>(0);

  // Auto-switch to waveform editor when audioBlob or audioUrl becomes available
  useEffect(() => {
    if (audioBlob || audioUrl) {
      setActiveTab("waveform");
    }
  }, [audioBlob, audioUrl]);

  // Decode audioBlob or audioUrl into AudioBuffer & extract waveform peaks
  useEffect(() => {
    let isCancelled = false;

    const loadBuffer = async () => {
      let blobToDecode = audioBlob;
      if (!blobToDecode && audioUrl) {
        try {
          const res = await fetch(audioUrl);
          if (res.ok) {
            blobToDecode = await res.blob();
          }
        } catch {
          // Ignore
        }
      }

      if (!blobToDecode) {
        setAudioBuffer(null);
        setWaveformPeaks([]);
        return;
      }

      try {
        setIsProcessing(true);
        const buffer = await decodeAudioBlob(blobToDecode);
        if (!isCancelled) {
          setAudioBuffer(buffer);
          setOriginalBuffer(buffer);
          const peaks = extractWaveformPeaks(buffer, 280);
          setWaveformPeaks(peaks);
          setCurrentTime(0);
          setSelectionRange(null);
        }
      } catch (err) {
        console.warn("Waveform decode warning:", err);
      } finally {
        if (!isCancelled) setIsProcessing(false);
      }
    };

    loadBuffer();

    return () => {
      isCancelled = true;
      if (previewAudioElRef.current) {
        previewAudioElRef.current.pause();
        previewAudioElRef.current = null;
      }
    };
  }, [audioBlob, audioUrl]);

  // Show transient action badge (e.g. "Silence Trimmed")
  const triggerNotice = (text: string) => {
    setActionNotice(text);
    setTimeout(() => setActionNotice(null), 2500);
  };

  // 1. Live Spectrum Visualizer loop
  useEffect(() => {
    const canvas = liveCanvasRef.current;
    if (!canvas || activeTab !== "live") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = studioAudio.getAnalyser();

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!analyser || !isPlaying) {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        if (leftMeterRef.current) leftMeterRef.current.style.height = "5%";
        if (rightMeterRef.current) rightMeterRef.current.style.height = "5%";
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const meterPercent = Math.min(100, Math.max(5, (average / 135) * 100));

      if (leftMeterRef.current) leftMeterRef.current.style.height = `${meterPercent}%`;
      if (rightMeterRef.current) {
        const rightVal = Math.min(100, Math.max(5, meterPercent * (0.94 + Math.random() * 0.12)));
        rightMeterRef.current.style.height = `${rightVal}%`;
      }

      const barCount = 56;
      const barWidth = (width / barCount) * 0.72;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor((i / barCount) * (bufferLength * 0.75));
        const val = dataArray[binIndex] || 0;
        const barHeight = Math.max(3, (val / 255) * height * 0.88);
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "rgba(245, 158, 11, 0.65)");
        gradient.addColorStop(0.65, "rgba(239, 68, 68, 0.9)");
        gradient.addColorStop(1, "rgba(254, 240, 138, 0.98)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, activeTab]);

  // 2. Interactive Waveform Canvas Renderer
  const renderWaveform = useCallback(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas || activeTab !== "waveform") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const duration = audioBuffer?.duration || 1;

    // Draw baseline
    ctx.strokeStyle = "rgba(115, 115, 115, 0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw Waveform bars
    if (waveformPeaks.length > 0) {
      const count = waveformPeaks.length;
      const barWidth = width / count;

      for (let i = 0; i < count; i++) {
        const peak = waveformPeaks[i];
        const barH = Math.max(2, peak * (height * 0.85));
        const x = i * barWidth;
        const y = (height - barH) / 2;

        const timeAtBar = (i / count) * duration;

        // Check if bar is inside selection
        let inSelection = false;
        if (selectionRange) {
          const sMin = Math.min(selectionRange.start, selectionRange.end);
          const sMax = Math.max(selectionRange.start, selectionRange.end);
          inSelection = timeAtBar >= sMin && timeAtBar <= sMax;
        }

        const isPlayed = timeAtBar <= currentTime;

        if (inSelection) {
          // Highlighted selection range in bright red-orange
          ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
        } else if (isPlayed) {
          // Played region in warm amber
          ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
        } else {
          // Unplayed in cool slate
          ctx.fillStyle = "rgba(115, 115, 115, 0.55)";
        }

        ctx.fillRect(x, y, Math.max(1, barWidth - 1), barH);
      }
    }

    // Draw Selection Overlay Box & Handles
    if (selectionRange && duration > 0) {
      const sMin = Math.min(selectionRange.start, selectionRange.end);
      const sMax = Math.max(selectionRange.start, selectionRange.end);
      const startX = (sMin / duration) * width;
      const endX = (sMax / duration) * width;
      const selW = endX - startX;

      // Shaded selection box
      ctx.fillStyle = "rgba(239, 68, 68, 0.18)";
      ctx.fillRect(startX, 0, selW, height);

      // Left & right border lines
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, 0, selW, height);

      // Trim Handle tags
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(startX - 2, 0, 4, 14);
      ctx.fillRect(endX - 2, height - 14, 4, 14);
    }

    // Draw Playhead Line
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead top marker
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(playheadX - 4, 0);
      ctx.lineTo(playheadX + 4, 0);
      ctx.lineTo(playheadX, 6);
      ctx.closePath();
      ctx.fill();
    }
  }, [audioBuffer, waveformPeaks, selectionRange, currentTime, activeTab]);

  useEffect(() => {
    renderWaveform();
  }, [renderWaveform]);

  // Click & Drag Waveform Interaction (Click to seek, Drag to select range)
  const getTimeFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = waveCanvasRef.current;
    if (!canvas || !audioBuffer) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = x / rect.width;
    return percent * audioBuffer.duration;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer) return;
    const clickTime = getTimeFromEvent(e);

    // Check if clicking near existing selection handles
    if (selectionRange) {
      const duration = audioBuffer.duration;
      const width = waveCanvasRef.current?.getBoundingClientRect().width || 1;
      const sMin = Math.min(selectionRange.start, selectionRange.end);
      const sMax = Math.max(selectionRange.start, selectionRange.end);
      const startX = (sMin / duration) * width;
      const endX = (sMax / duration) * width;
      const mouseX = e.clientX - (waveCanvasRef.current?.getBoundingClientRect().left || 0);

      if (Math.abs(mouseX - startX) <= 8) {
        isDraggingRef.current = "start";
        return;
      }
      if (Math.abs(mouseX - endX) <= 8) {
        isDraggingRef.current = "end";
        return;
      }
    }

    // Start creating new selection
    isDraggingRef.current = "create";
    dragStartSecRef.current = clickTime;
    setCurrentTime(clickTime);
    setSelectionRange({ start: clickTime, end: clickTime });

    // If audio element is loaded, seek it
    if (previewAudioElRef.current) {
      previewAudioElRef.current.currentTime = clickTime;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !audioBuffer) return;
    const curTime = getTimeFromEvent(e);

    if (isDraggingRef.current === "create") {
      setSelectionRange({ start: dragStartSecRef.current, end: curTime });
    } else if (isDraggingRef.current === "start") {
      setSelectionRange((prev) => (prev ? { ...prev, start: curTime } : null));
    } else if (isDraggingRef.current === "end") {
      setSelectionRange((prev) => (prev ? { ...prev, end: curTime } : null));
    }
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = null;

    // If start == end, clear selection (simple click seek)
    if (selectionRange && Math.abs(selectionRange.start - selectionRange.end) < 0.15) {
      setSelectionRange(null);
    }
  };

  // Preview Audio playback
  const handleTogglePreview = () => {
    if (!audioBuffer) return;

    if (isPlayingPreview) {
      if (previewAudioElRef.current) {
        previewAudioElRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      let resolvedUrl = audioUrl;
      if (!resolvedUrl && audioBlob) {
        resolvedUrl = URL.createObjectURL(audioBlob);
      }

      if (!resolvedUrl) return;

      const audio = previewAudioElRef.current || new Audio(resolvedUrl);
      previewAudioElRef.current = audio;

      const startTime = selectionRange
        ? Math.min(selectionRange.start, selectionRange.end)
        : currentTime;
      const endTime = selectionRange
        ? Math.max(selectionRange.start, selectionRange.end)
        : audioBuffer.duration;

      audio.currentTime = startTime;

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        if (selectionRange && audio.currentTime >= endTime) {
          audio.pause();
          setIsPlayingPreview(false);
          setCurrentTime(startTime);
        }
      };

      audio.onended = () => {
        setIsPlayingPreview(false);
        setCurrentTime(0);
      };

      audio.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  // 1. Auto Trim Silence
  const handleTrimSilence = () => {
    if (!audioBuffer) return;
    try {
      setIsProcessing(true);
      const { trimmedBuffer, leadCutSec, tailCutSec } = autoTrimSilence(audioBuffer, 0.015);
      const newBlob = audioBufferToWavBlob(trimmedBuffer);
      const newUrl = URL.createObjectURL(newBlob);

      setAudioBuffer(trimmedBuffer);
      const peaks = extractWaveformPeaks(trimmedBuffer, 280);
      setWaveformPeaks(peaks);
      setCurrentTime(0);
      setSelectionRange(null);

      if (onUpdateAudio) {
        onUpdateAudio(newBlob, newUrl);
      }

      triggerNotice(`ዝምታ ተቆርጧል (-${(leadCutSec + tailCutSec).toFixed(1)}s)`);
    } catch (err) {
      console.error("Trim silence error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Cut Segment (Remove highlighted range)
  const handleCutSegment = () => {
    if (!audioBuffer || !selectionRange) return;
    try {
      setIsProcessing(true);
      const sMin = Math.min(selectionRange.start, selectionRange.end);
      const sMax = Math.max(selectionRange.start, selectionRange.end);

      const newBuffer = cutSegmentFromAudioBuffer(audioBuffer, sMin, sMax);
      const newBlob = audioBufferToWavBlob(newBuffer);
      const newUrl = URL.createObjectURL(newBlob);

      setAudioBuffer(newBuffer);
      const peaks = extractWaveformPeaks(newBuffer, 280);
      setWaveformPeaks(peaks);
      setCurrentTime(Math.min(sMin, newBuffer.duration));
      setSelectionRange(null);

      if (onUpdateAudio) {
        onUpdateAudio(newBlob, newUrl);
      }

      triggerNotice(`ክፍሉ ተቆርጧል (-${(sMax - sMin).toFixed(1)}s)`);
    } catch (err) {
      console.error("Cut segment error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Keep Selection (Crop audio to only highlighted range)
  const handleKeepSelection = () => {
    if (!audioBuffer || !selectionRange) return;
    try {
      setIsProcessing(true);
      const sMin = Math.min(selectionRange.start, selectionRange.end);
      const sMax = Math.max(selectionRange.start, selectionRange.end);

      const newBuffer = trimAudioBuffer(audioBuffer, sMin, sMax);
      const newBlob = audioBufferToWavBlob(newBuffer);
      const newUrl = URL.createObjectURL(newBlob);

      setAudioBuffer(newBuffer);
      const peaks = extractWaveformPeaks(newBuffer, 280);
      setWaveformPeaks(peaks);
      setCurrentTime(0);
      setSelectionRange(null);

      if (onUpdateAudio) {
        onUpdateAudio(newBlob, newUrl);
      }

      triggerNotice(`ምርጫው ተቀምጧል (${(sMax - sMin).toFixed(1)}s)`);
    } catch (err) {
      console.error("Keep selection error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Reset Original
  const handleResetOriginal = () => {
    if (!originalBuffer) return;
    try {
      setIsProcessing(true);
      const newBlob = audioBufferToWavBlob(originalBuffer);
      const newUrl = URL.createObjectURL(newBlob);

      setAudioBuffer(originalBuffer);
      const peaks = extractWaveformPeaks(originalBuffer, 280);
      setWaveformPeaks(peaks);
      setCurrentTime(0);
      setSelectionRange(null);

      if (onUpdateAudio) {
        onUpdateAudio(newBlob, newUrl);
      }

      triggerNotice("ወደ ነበረበት ተመልሷል");
    } catch (err) {
      console.error("Reset error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const dec = Math.floor((totalSeconds % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${dec}`;
  };

  const duration = audioBuffer?.duration || 0;
  const hasSelection = !!(
    selectionRange && Math.abs(selectionRange.start - selectionRange.end) >= 0.15
  );
  const selMin = selectionRange ? Math.min(selectionRange.start, selectionRange.end) : 0;
  const selMax = selectionRange ? Math.max(selectionRange.start, selectionRange.end) : 0;
  const selDuration = selMax - selMin;

  return (
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-3.5 sm:p-4 shadow-xl shadow-black/40 font-sans space-y-3">
      {/* Unified Master Telemetry Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        {/* Left: ON-AIR Badge, Mode Switch & Status */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-mono font-bold tracking-wider transition-all ${
              isPlaying || isPlayingPreview
                ? "bg-red-950/80 border-red-600/80 text-red-300 shadow-md shadow-red-950/50"
                : "bg-neutral-950 border-neutral-800 text-neutral-400"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPlaying || isPlayingPreview
                  ? "bg-red-500 shadow-sm shadow-red-500 animate-pulse"
                  : "bg-neutral-600"
              }`}
            />
            <span>{isPlaying || isPlayingPreview ? "ON AIR" : "STANDBY"}</span>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex items-center bg-neutral-950 p-0.5 rounded-lg border border-neutral-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("waveform")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "waveform"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              ሞገድ (Waveform)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("live")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === "live"
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              አናላይዘር (Live VU)
            </button>
          </div>

          <span className="text-xs text-neutral-300 font-medium truncate max-w-xs hidden sm:inline">
            {statusMessage}
          </span>
        </div>

        {/* Right: Telemetry info & Timer */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 text-neutral-400">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-200 font-sans font-semibold truncate max-w-[120px]">
              {anchorName}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-neutral-400">
            <Music2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-neutral-300 font-sans">{musicBedName}</span>
          </div>

          {/* Master Timer */}
          <div className="bg-neutral-950 px-2.5 py-0.5 rounded border border-neutral-800 text-amber-400 font-bold tracking-widest tabular-nums text-sm">
            {formatTimer(activeTab === "waveform" ? currentTime : elapsedSeconds)}
          </div>
        </div>
      </div>

      {/* Main Interactive Display Area */}
      {activeTab === "waveform" ? (
        /* Waveform Editor Display */
        <div className="space-y-2.5">
          {/* Waveform Canvas & Time Labels */}
          <div className="bg-neutral-950 rounded-xl p-2 sm:p-2.5 border border-neutral-800/90 relative overflow-hidden select-none">
            {/* Transient action notification badge */}
            {actionNotice && (
              <div className="absolute top-2 left-2 z-20 px-2.5 py-1 rounded bg-amber-500 text-neutral-950 font-bold text-[11px] shadow-lg animate-fade-in flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>{actionNotice}</span>
              </div>
            )}

            {/* Time Markers */}
            <div className="flex justify-between text-[10px] font-mono text-neutral-400 pb-1 px-1">
              <span>00:00.0</span>
              {hasSelection && (
                <span className="text-red-400 font-bold">
                  ምርጫ፦ {formatTimer(selMin)} - {formatTimer(selMax)} ({selDuration.toFixed(1)}s)
                </span>
              )}
              <span>{formatTimer(duration)}</span>
            </div>

            {/* Canvas */}
            <canvas
              ref={waveCanvasRef}
              width={820}
              height={76}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-18 sm:h-20 block cursor-crosshair active:cursor-ew-resize rounded"
            />
          </div>

          {/* Precision Action Buttons Row (Strictly No Long Text) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            {/* Playback & Seeking controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleTogglePreview}
                disabled={!audioBuffer || isProcessing}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 ${
                  isPlayingPreview
                    ? "bg-amber-500 text-neutral-950 shadow-md"
                    : "bg-neutral-950 text-white border border-neutral-700 hover:bg-neutral-800"
                }`}
              >
                {isPlayingPreview ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{isPlayingPreview ? "አቁም" : "አጫውት"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTime(0);
                  if (previewAudioElRef.current) previewAudioElRef.current.currentTime = 0;
                }}
                disabled={!audioBuffer || isProcessing}
                className="p-1.5 rounded-lg bg-neutral-950 text-neutral-300 hover:text-white border border-neutral-800 hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trimming & Cutting Tools */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Silence Auto-Trim Button */}
              <button
                type="button"
                onClick={handleTrimSilence}
                disabled={!audioBuffer || isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-amber-500/40 hover:border-amber-400 transition-all cursor-pointer disabled:opacity-40 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ዝምታ ቁረጥ</span>
              </button>

              {/* Cut Selected Segment Button */}
              <button
                type="button"
                onClick={handleCutSegment}
                disabled={!audioBuffer || !hasSelection || isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                <Scissors className="w-3.5 h-3.5 text-red-400" />
                <span>ክፍል ቁረጥ</span>
              </button>

              {/* Keep / Crop Selection Only */}
              <button
                type="button"
                onClick={handleKeepSelection}
                disabled={!audioBuffer || !hasSelection || isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-950 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              >
                <Crop className="w-3.5 h-3.5 text-emerald-400" />
                <span>ምርጫ አስቀር</span>
              </button>

              {/* Reset to Original Audio */}
              <button
                type="button"
                onClick={handleResetOriginal}
                disabled={!originalBuffer || isProcessing}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer disabled:opacity-30"
              >
                <span>ወደ ነበረበት</span>
              </button>

              {/* Direct Export & CapCut */}
              {audioBlob && (
                <>
                  <button
                    type="button"
                    onClick={() => downloadBlob(audioBlob, `news_edited_${Date.now()}.wav`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>አውርድ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openCapCutWithMedia({
                        blob: audioBlob,
                        filename: `news_audio_${Date.now()}.wav`,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-950 hover:bg-neutral-800 border border-cyan-500/60 text-cyan-300 transition-all cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CapCut</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Real-time Spectrum & Stereo VU Meters */
        <div className="grid grid-cols-12 gap-3 items-center">
          <div className="col-span-10 sm:col-span-11 bg-neutral-950 rounded-lg p-1.5 border border-neutral-800/80 overflow-hidden relative">
            <canvas
              ref={liveCanvasRef}
              width={720}
              height={70}
              className="w-full h-16 sm:h-20 block"
            />
            <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#555_1px,transparent_1px),linear-gradient(to_bottom,#555_1px,transparent_1px)] bg-[size:28px_14px]" />
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 h-16 sm:h-20 bg-neutral-950 rounded-lg p-1 border border-neutral-800/80">
            <div className="relative w-2 h-full bg-neutral-900 rounded-sm overflow-hidden flex flex-col justify-end">
              <div
                ref={leftMeterRef}
                className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 rounded-sm transition-all duration-75"
                style={{ height: "5%" }}
              />
            </div>

            <div className="relative w-2 h-full bg-neutral-900 rounded-sm overflow-hidden flex flex-col justify-end">
              <div
                ref={rightMeterRef}
                className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 rounded-sm transition-all duration-75"
                style={{ height: "5%" }}
              />
            </div>

            <div className="hidden sm:flex flex-col justify-between text-[7px] font-mono text-neutral-500 h-full py-0.5 select-none">
              <span>0dB</span>
              <span>-12</span>
              <span>-30</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
