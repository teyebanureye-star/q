import React, { useEffect, useRef } from "react";
import { studioAudio } from "../utils/audioEngine";
import { Radio, Music2, Gauge } from "lucide-react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  anchorName: string;
  musicBedName: string;
  elapsedSeconds: number;
  statusMessage: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  anchorName,
  musicBedName,
  elapsedSeconds,
  statusMessage,
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
        // Idle ambient subtle line with slight glow
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

      if (leftMeterRef.current) {
        leftMeterRef.current.style.height = `${meterPercent}%`;
      }
      if (rightMeterRef.current) {
        const rightVal = Math.min(100, Math.max(5, meterPercent * (0.94 + Math.random() * 0.12)));
        rightMeterRef.current.style.height = `${rightVal}%`;
      }

      // Draw high-resolution frequency bars
      const barCount = 56;
      const barWidth = (width / barCount) * 0.72;
      const gap = (width - barWidth * barCount) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor((i / barCount) * (bufferLength * 0.75));
        const val = dataArray[binIndex] || 0;
        const barHeight = Math.max(3, (val / 255) * height * 0.88);
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        // Broadcast amber-red gradient
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
    <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-3.5 sm:p-4 shadow-xl shadow-black/40">
      {/* Unified Master Telemetry Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-neutral-800">
        {/* Left: ON-AIR Badge & Current Status */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-mono font-bold tracking-wider transition-all ${
              isPlaying
                ? "bg-red-950/80 border-red-600/80 text-red-300 shadow-md shadow-red-950/50"
                : "bg-neutral-950 border-neutral-800 text-neutral-400"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isPlaying
                  ? "bg-red-500 shadow-sm shadow-red-500 animate-pulse"
                  : "bg-neutral-600"
              }`}
            />
            <span>{isPlaying ? "ON AIR // ቀጥታ ስርጭት" : "STANDBY // ዝግጁ"}</span>
          </div>

          <span className="text-xs text-neutral-300 font-medium">
            {statusMessage}
          </span>
        </div>

        {/* Right: Anchor, Music, Master Format & Digital Clock */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 text-neutral-400">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-200 font-sans font-semibold">{anchorName}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-neutral-400">
            <Music2 className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-neutral-300 font-sans">{musicBedName}</span>
          </div>

          <span className="hidden lg:inline text-[10px] text-neutral-500 uppercase">
            24kHz Studio HD
          </span>

          {/* Master Timer */}
          <div className="bg-neutral-950 px-2.5 py-0.5 rounded border border-neutral-800 text-amber-400 font-bold tracking-widest tabular-nums text-sm">
            {formatTimer(elapsedSeconds)}
          </div>
        </div>
      </div>

      {/* Visualizer Display & Stereo Meters */}
      <div className="grid grid-cols-12 gap-3 items-center">
        {/* Waveform Canvas */}
        <div className="col-span-10 sm:col-span-11 bg-neutral-950 rounded-lg p-1.5 border border-neutral-800/80 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            width={720}
            height={70}
            className="w-full h-16 sm:h-20 block"
          />
          {/* Subtle Grid line pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(to_right,#555_1px,transparent_1px),linear-gradient(to_bottom,#555_1px,transparent_1px)] bg-[size:28px_14px]" />
        </div>

        {/* Stereo Peak VU Meters */}
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
    </div>
  );
};
