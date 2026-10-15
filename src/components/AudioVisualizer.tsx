import React, { useEffect, useRef } from "react";
import { studioAudio } from "../utils/audioEngine";

interface AudioVisualizerProps {
  isPlaying: boolean;
  anchorName: string;
  musicBedName: string;
  elapsedSeconds: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  anchorName,
  musicBedName,
  elapsedSeconds,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftMeterRef = useRef<HTMLDivElement | null>(null);
  const rightMeterRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = studioAudio.getAnalyser();

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (!analyser || !isPlaying) {
        // Idle ambient subtle line
        ctx.strokeStyle = "rgba(245, 158, 11, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        if (leftMeterRef.current) leftMeterRef.current.style.height = "6%";
        if (rightMeterRef.current) rightMeterRef.current.style.height = "6%";
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      // Calculate approximate RMS volume for meters
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const meterPercent = Math.min(100, Math.max(5, (average / 140) * 100));

      if (leftMeterRef.current) {
        leftMeterRef.current.style.height = `${meterPercent}%`;
      }
      if (rightMeterRef.current) {
        // slight stereo variation
        const rightVal = Math.min(100, Math.max(5, meterPercent * (0.95 + Math.random() * 0.1)));
        rightMeterRef.current.style.height = `${rightVal}%`;
      }

      // Draw modern frequency bars
      const barCount = 48;
      const barWidth = (width / barCount) * 0.7;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor((i / barCount) * (bufferLength * 0.75));
        const val = dataArray[binIndex] || 0;
        const barHeight = Math.max(4, (val / 255) * height * 0.85);
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        // Gradient from warm amber to red peak
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "rgba(245, 158, 11, 0.6)");
        gradient.addColorStop(0.7, "rgba(239, 68, 68, 0.85)");
        gradient.addColorStop(1, "rgba(254, 240, 138, 0.95)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xl shadow-black/40">
      {/* Studio Monitor Top Bar */}
      <div className="flex items-center justify-between gap-4 pb-3 mb-3 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          {/* ON-AIR status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                isPlaying
                  ? "bg-red-500 shadow-md shadow-red-500/80 animate-pulse"
                  : "bg-neutral-600"
              }`}
            />
            <span
              className={`text-xs font-mono font-bold tracking-wider ${
                isPlaying ? "text-red-400" : "text-neutral-500"
              }`}
            >
              {isPlaying ? "ON AIR // ቀጥታ ስርጭት" : "STANDBY // ዝግጁ"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <span>አቅራቢ፦</span>
            <span className="text-amber-300 font-semibold">{anchorName}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden md:flex items-center gap-2 text-neutral-400">
            <span>የጀርባ ሙዚቃ፦</span>
            <span className="text-neutral-200">{musicBedName}</span>
          </div>

          {/* Broadcast Timer */}
          <div className="bg-neutral-950 px-3 py-1 rounded border border-neutral-800 text-amber-400 font-semibold tracking-wider tabular-nums">
            {formatTimer(elapsedSeconds)}
          </div>
        </div>
      </div>

      {/* Visualizer Display Area & VU Meters */}
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Main Canvas Waveform */}
        <div className="col-span-10 sm:col-span-11 bg-neutral-950 rounded-lg p-2 border border-neutral-800/80 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={720}
            height={90}
            className="w-full h-20 sm:h-24 block"
          />

          {/* Grid lines overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:24px_16px]" />
        </div>

        {/* Dual VU Meters */}
        <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 h-20 sm:h-24 bg-neutral-950 rounded-lg p-1.5 border border-neutral-800/80">
          {/* Left Meter */}
          <div className="relative w-2 h-full bg-neutral-900 rounded-sm overflow-hidden flex flex-col justify-end">
            <div
              ref={leftMeterRef}
              className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 rounded-sm transition-all duration-75"
              style={{ height: "6%" }}
            />
          </div>

          {/* Right Meter */}
          <div className="relative w-2 h-full bg-neutral-900 rounded-sm overflow-hidden flex flex-col justify-end">
            <div
              ref={rightMeterRef}
              className="w-full bg-gradient-to-t from-emerald-500 via-amber-400 to-red-500 rounded-sm transition-all duration-75"
              style={{ height: "6%" }}
            />
          </div>

          <div className="hidden lg:flex flex-col justify-between text-[8px] font-mono text-neutral-500 h-full py-0.5">
            <span>0dB</span>
            <span>-12</span>
            <span>-30</span>
          </div>
        </div>
      </div>
    </div>
  );
};
