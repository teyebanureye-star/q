import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  X,
  Upload,
  Play,
  Square,
  Video,
  Download,
  Scissors,
  RotateCcw,
  Sparkles,
  Sliders,
  Volume2,
  Tv,
  CheckCircle2,
  Camera,
  Activity,
  Layers,
  CircleDot,
  Smile,
} from "lucide-react";
import { studioAudio } from "../utils/audioEngine";
import { downloadDirectVideo, openCapCutWithMedia } from "../utils/mediaMerger";
import { useLanguage } from "../context/LanguageContext";

interface TalkingAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
  activeHeadline: string;
  isPlaying?: boolean;
  onPlayBroadcast?: () => void;
  onStopBroadcast?: () => void;
}

interface AvatarPreset {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  roleAmharic: string;
  imageUrl: string;
  type: "human" | "animal" | "cartoon";
  mouthConfig: {
    y: number; // 0 to 1
    x: number; // 0 to 1
    width: number; // 0 to 1
    height: number; // 0 to 1
  };
}

const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "hyena_anchor",
    nameAmharic: "ጅቦ ዜና አቅራቢ",
    nameEnglish: "Hyena Anchor",
    roleAmharic: "የስቱዲዮ ገፀ-ባህሪ አንባቢ",
    imageUrl: "/images/hyena_anchor.jpg",
    type: "animal",
    mouthConfig: { x: 0.5, y: 0.52, width: 0.28, height: 0.14 },
  },
  {
    id: "anchor_dawit",
    nameAmharic: "ዳዊት ከበደ",
    nameEnglish: "Dawit Kebede",
    roleAmharic: "አበይት ዜና አቅራቢ",
    imageUrl: "/images/anchor_dawit.jpg",
    type: "human",
    mouthConfig: { x: 0.5, y: 0.63, width: 0.22, height: 0.11 },
  },
  {
    id: "anchor_aster",
    nameAmharic: "አስቴር ማሞ",
    nameEnglish: "Aster Mamo",
    roleAmharic: "ዋና ዜና አቅራቢ",
    imageUrl: "/images/anchor_aster.jpg",
    type: "human",
    mouthConfig: { x: 0.5, y: 0.61, width: 0.21, height: 0.11 },
  },
  {
    id: "anchor_solomon",
    nameAmharic: "ሰሎሞን ግርማ",
    nameEnglish: "Solomon Girma",
    roleAmharic: "ሰበር ዜና ዘጋቢ",
    imageUrl: "/images/anchor_solomon.jpg",
    type: "human",
    mouthConfig: { x: 0.5, y: 0.62, width: 0.22, height: 0.12 },
  },
  {
    id: "anchor_sofia",
    nameAmharic: "ሶፊያ ኑረዲን",
    nameEnglish: "Sofia Nuredin",
    roleAmharic: "ማህበራዊና ባህል ዘጋቢ",
    imageUrl: "/images/anchor_sofia.jpg",
    type: "human",
    mouthConfig: { x: 0.5, y: 0.62, width: 0.2, height: 0.11 },
  },
  {
    id: "anchor_temesgen",
    nameAmharic: "ተመስገን አሰፋ",
    nameEnglish: "Temesgen Assefa",
    roleAmharic: "ትንታኔና ኢኮኖሚ ዘጋቢ",
    imageUrl: "/images/anchor_temesgen.jpg",
    type: "human",
    mouthConfig: { x: 0.5, y: 0.63, width: 0.22, height: 0.11 },
  },
];

export const TalkingAvatarModal: React.FC<TalkingAvatarModalProps> = ({
  isOpen,
  onClose,
  script,
  activeHeadline,
  isPlaying = false,
  onPlayBroadcast,
  onStopBroadcast,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  // Active Avatar Image & Presets
  const [selectedPresetId, setSelectedPresetId] = useState<string>("hyena_anchor");
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);
  const [activeAvatarName, setActiveAvatarName] = useState<string>("ጅቦ ዜና አቅራቢ");

  // Mouth & Lip Configuration
  const [mouthConfig, setMouthConfig] = useState({
    x: 0.5,
    y: 0.52,
    width: 0.28,
    height: 0.14,
  });

  // Animation Tweaks
  const [sensitivity, setSensitivity] = useState<number>(1.3);
  const [bodyMotionIntensity, setBodyMotionIntensity] = useState<number>(1.0);
  const [showMouthGuide, setShowMouthGuide] = useState<boolean>(false);
  const [studioChannel, setStudioChannel] = useState<"etv" | "amc" | "fana">("etv");
  const [studioTheme, setStudioTheme] = useState<"newsroom" | "breaking" | "prime">("newsroom");

  // Recording & Video Export State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);

  // Canvas and Animation Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);

  // Active audio energy & lip smoothing
  const currentOpenRef = useRef<number>(0);
  const eyeBlinkTimerRef = useRef<number>(0);
  const isBlinkingRef = useRef<boolean>(false);

  // Parse script sentences for lower-third synchronization
  const sentences = useMemo(() => {
    if (!script.trim()) return ["የቀጥታ የዜና ስርጭት በመካሄድ ላይ ይገኛል"];
    const raw = script
      .split(/(?<=[።\n!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return raw.length > 0 ? raw : [script.trim()];
  }, [script]);

  // Current image source
  const currentImageSrc = customImageUrl || AVATAR_PRESETS.find((p) => p.id === selectedPresetId)?.imageUrl || "/images/hyena_anchor.jpg";

  // Preload Image
  useEffect(() => {
    if (!isOpen) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageSrc;
    img.onload = () => {
      imageObjRef.current = img;
    };
  }, [currentImageSrc, isOpen]);

  // Handle Preset Select
  const handleSelectPreset = (preset: AvatarPreset) => {
    setSelectedPresetId(preset.id);
    setCustomImageUrl(null);
    setMouthConfig(preset.mouthConfig);
    setActiveAvatarName(isEn ? preset.nameEnglish : preset.nameAmharic);
  };

  // Handle Custom Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImageUrl(dataUrl);
      setSelectedPresetId("custom");
      setActiveAvatarName(isEn ? "Uploaded Character" : "የገዛ ፎቶ / ገፀ-ባህሪ");
      // Default human/character mouth position
      setMouthConfig({ x: 0.5, y: 0.62, width: 0.24, height: 0.12 });
    };
    reader.readAsDataURL(file);
  };

  // Main Canvas Render Loop (Lip Sync + Body Movement + Studio Frame)
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime = performance.now();
    let tickerX = canvas.width;

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Get Live Audio Analyser Energy
      let audioEnergy = 0;
      let formantPitch = 0;

      const analyser = studioAudio.getAnalyser();
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        // Calculate Root Mean Square (RMS) volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (timeData[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Vocal formant energy peak (low-mid vocal frequencies)
        let freqSum = 0;
        for (let i = 5; i < Math.min(60, bufferLength); i++) {
          freqSum += freqData[i];
        }
        formantPitch = freqSum / 55 / 255;

        audioEnergy = Math.min(1.0, rms * 4.5 * sensitivity);
      } else if (isPlaying) {
        // Fallback natural speaking cadence modulation if audio analyser is connecting
        audioEnergy = (Math.sin(elapsed * 12) * 0.5 + 0.5) * (Math.sin(elapsed * 4) * 0.4 + 0.6) * 0.6;
      }

      // Smooth mouth lerp
      currentOpenRef.current += (audioEnergy - currentOpenRef.current) * 0.4;
      const mouthOpen = Math.max(0, Math.min(1.0, currentOpenRef.current));

      // 2. Eye Blinking Logic (every 3.5 to 5s)
      eyeBlinkTimerRef.current += 1 / 60;
      if (eyeBlinkTimerRef.current > 4.2) {
        isBlinkingRef.current = true;
        if (eyeBlinkTimerRef.current > 4.35) {
          isBlinkingRef.current = false;
          eyeBlinkTimerRef.current = 0;
        }
      }

      // 3. Clear Screen & Draw Studio Backdrop
      ctx.clearRect(0, 0, width, height);

      // Studio Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (studioTheme === "breaking") {
        bgGrad.addColorStop(0, "#2a0505");
        bgGrad.addColorStop(0.5, "#150202");
        bgGrad.addColorStop(1, "#0a0101");
      } else if (studioTheme === "prime") {
        bgGrad.addColorStop(0, "#081b33");
        bgGrad.addColorStop(0.5, "#040d1a");
        bgGrad.addColorStop(1, "#02070e");
      } else {
        bgGrad.addColorStop(0, "#1c1917");
        bgGrad.addColorStop(0.5, "#0f0e0d");
        bgGrad.addColorStop(1, "#080706");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Studio studio monitor lines & glow
      ctx.save();
      ctx.strokeStyle = studioTheme === "breaking" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      ctx.restore();

      // 4. Calculate Body & Head Lifelike Movement
      // Natural breathing oscillation
      const breathCycle = Math.sin(elapsed * 1.8) * 0.008 * bodyMotionIntensity;
      // Head tilt / roll based on speech rhythm
      const headTilt = (Math.sin(elapsed * 1.4) * 0.015 + (isPlaying ? Math.sin(elapsed * 6) * 0.008 : 0)) * bodyMotionIntensity;
      // Body horizontal sway
      const bodySwayX = Math.sin(elapsed * 0.9) * 4 * bodyMotionIntensity;
      // Speaking nod (downward emphasis when loud)
      const speechNod = isPlaying ? mouthOpen * 3.5 * bodyMotionIntensity : 0;

      // 5. Draw Talking Avatar Layer
      const img = imageObjRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();

        // Center point for rotation and breathing scale
        const avatarCenterX = width / 2 + bodySwayX;
        const avatarCenterY = height / 2 + 30 + speechNod;

        ctx.translate(avatarCenterX, avatarCenterY);
        ctx.rotate(headTilt);
        ctx.scale(1 + breathCycle, 1 + breathCycle);

        // Aspect ratio fit
        const targetH = height * 0.94;
        const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
        const drawX = -targetW / 2;
        const drawY = -targetH / 2;

        // Draw Base Avatar Photo
        ctx.drawImage(img, drawX, drawY, targetW, targetH);

        // 6. Draw Lip & Mouth Movement
        // Coordinates in canvas space
        const mX = drawX + targetW * mouthConfig.x;
        const mY = drawY + targetH * mouthConfig.y;
        const mW = targetW * mouthConfig.width;
        const mH = targetH * mouthConfig.height;

        if (mouthOpen > 0.03) {
          // Source mouth patch from original image
          const srcMX = img.naturalWidth * mouthConfig.x;
          const srcMY = img.naturalHeight * mouthConfig.y;
          const srcMW = img.naturalWidth * mouthConfig.width;
          const srcMH = img.naturalHeight * mouthConfig.height;

          // Upper Lip Box (Source)
          const srcUpperY = srcMY - srcMH * 0.35;
          const srcUpperH = srcMH * 0.7;

          // Lower Jaw Box (Source)
          const srcLowerY = srcMY;
          const srcLowerH = srcMH * 0.85;

          const maxJawDrop = mH * 0.65;
          const jawDrop = mouthOpen * maxJawDrop;
          const horizontalMod = 1 + (formantPitch - 0.5) * 0.12;

          // A. Draw Inner Mouth Cavity (Dark realistic mouth depth with teeth & tongue)
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            mX,
            mY + jawDrop * 0.45,
            (mW * 0.45) * horizontalMod,
            (mH * 0.35) * mouthOpen + jawDrop * 0.35,
            0,
            0,
            Math.PI * 2
          );
          const mouthGrad = ctx.createRadialGradient(
            mX,
            mY + jawDrop * 0.3,
            2,
            mX,
            mY + jawDrop * 0.3,
            mW * 0.5
          );
          mouthGrad.addColorStop(0, "#4a0404");
          mouthGrad.addColorStop(0.6, "#280101");
          mouthGrad.addColorStop(1, "#120000");
          ctx.fillStyle = mouthGrad;
          ctx.fill();

          // Upper teeth highlight
          ctx.fillStyle = "rgba(240, 240, 240, 0.88)";
          ctx.beginPath();
          ctx.ellipse(mX, mY - 2, (mW * 0.32) * horizontalMod, Math.min(5, mH * 0.15), 0, 0, Math.PI);
          ctx.fill();

          // Lower tongue highlight
          ctx.fillStyle = "rgba(180, 50, 50, 0.75)";
          ctx.beginPath();
          ctx.ellipse(mX, mY + jawDrop * 0.65, (mW * 0.28) * horizontalMod, Math.min(7, jawDrop * 0.4), 0, 0, Math.PI);
          ctx.fill();
          ctx.restore();

          // B. Draw Lower Jaw / Lip (shifted down by jawDrop with feathered edge)
          ctx.save();
          // Clip to lower jaw region
          ctx.beginPath();
          ctx.ellipse(
            mX,
            mY + jawDrop + mH * 0.3,
            (mW * 0.52) * horizontalMod,
            mH * 0.55,
            0,
            0,
            Math.PI * 2
          );
          ctx.clip();

          // Draw the lower jaw piece displaced downwards
          ctx.drawImage(
            img,
            srcMX - srcMW / 2,
            srcLowerY,
            srcMW,
            srcLowerH,
            mX - (mW / 2) * horizontalMod,
            mY - mH * 0.15 + jawDrop,
            mW * horizontalMod,
            mH * 0.95
          );
          ctx.restore();

          // C. Re-draw Upper Lip (firmly anchored at top)
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(mX, mY - mH * 0.2, (mW * 0.5) * horizontalMod, mH * 0.35, 0, 0, Math.PI * 2);
          ctx.clip();

          ctx.drawImage(
            img,
            srcMX - srcMW / 2,
            srcUpperY,
            srcMW,
            srcUpperH,
            mX - (mW / 2) * horizontalMod,
            mY - mH * 0.45,
            mW * horizontalMod,
            mH * 0.65
          );
          ctx.restore();
        }

        // 7. Interactive Mouth Guide (if enabled by user for calibration)
        if (showMouthGuide) {
          ctx.save();
          ctx.strokeStyle = "#eab308";
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(mX - mW / 2, mY - mH / 2, mW, mH);

          // Center crosshair
          ctx.fillStyle = "#eab308";
          ctx.beginPath();
          ctx.arc(mX, mY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      }

      // 8. Draw Desktop Broadcast Studio Microphone in Foreground
      ctx.save();
      const micX = width / 2;
      const micY = height - 120;

      // Mic arm
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(micX, height);
      ctx.lineTo(micX, micY + 30);
      ctx.stroke();

      // Mic capsule body
      ctx.fillStyle = "#18181b";
      ctx.strokeStyle = isPlaying ? "#ef4444" : "#eab308";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(micX - 16, micY - 25, 32, 50, 10);
      ctx.fill();
      ctx.stroke();

      // On-air microphone illuminated ring
      ctx.fillStyle = isPlaying ? "#ef4444" : "rgba(234, 179, 8, 0.4)";
      ctx.beginPath();
      ctx.arc(micX, micY, 5, 0, Math.PI * 2);
      ctx.fill();
      if (isPlaying) {
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 12;
      }
      ctx.restore();

      // 9. TV Broadcast Overlays (LIVE ON AIR + Logo + Lower-Third)
      // A. Top-Left "LIVE ON AIR"
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.roundRect(24, 24, 150, 36, 8);
      ctx.fill();

      // Pulsing red live light
      ctx.fillStyle = isPlaying ? "#ef4444" : "#71717a";
      ctx.beginPath();
      ctx.arc(42, 42, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 12px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
      ctx.fillText(isPlaying ? "ቀጥታ ስርጭት" : "ስቱዲዮ ዝግጁ", 56, 46);
      ctx.restore();

      // B. Top-Right Channel Bug
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.roundRect(width - 150, 24, 126, 36, 8);
      ctx.fill();

      ctx.fillStyle = studioChannel === "etv" ? "#3b82f6" : studioChannel === "amc" ? "#10b981" : "#f59e0b";
      ctx.font = '900 13px system-ui, sans-serif';
      const logoText = studioChannel === "etv" ? "ETV NEWS" : studioChannel === "amc" ? "AMC NEWS" : "FANA TV";
      ctx.fillText(logoText, width - 136, 46);
      ctx.restore();

      // C. Professional Lower-Third News Banner
      const currentSentenceIndex = isPlaying ? Math.floor(elapsed / 4.5) % sentences.length : 0;
      const currentSentence = sentences[currentSentenceIndex] || activeHeadline || "የቀጥታ ስቱዲዮ ዜና";

      // Main lower-third bar
      const barY = height - 100;
      ctx.save();

      // Background banner with gradient
      const barGrad = ctx.createLinearGradient(0, barY, 0, barY + 65);
      barGrad.addColorStop(0, "rgba(10, 10, 10, 0.95)");
      barGrad.addColorStop(1, "rgba(20, 20, 20, 0.98)");
      ctx.fillStyle = barGrad;
      ctx.fillRect(24, barY, width - 48, 65);

      // Left Accent Ribbon
      ctx.fillStyle = studioTheme === "breaking" ? "#dc2626" : "#f59e0b";
      ctx.fillRect(24, barY, 8, 65);

      // Anchor & Headline Tag
      ctx.fillStyle = studioTheme === "breaking" ? "#fca5a5" : "#fde68a";
      ctx.font = 'bold 12px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
      ctx.fillText(`🎙️ ${activeAvatarName}  |  ${studioTheme === "breaking" ? "ሰበር መረጃ" : "አበይት ዜና"}`, 44, barY + 22);

      // Active Subtitle Line
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 17px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
      ctx.fillText(currentSentence.slice(0, 95), 44, barY + 48);
      ctx.restore();

      // D. Continuous Breaking Ticker
      const tickerY = height - 26;
      ctx.save();
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, tickerY, width, 26);

      // Ticker label
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(0, tickerY, 95, 26);
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText("BREAKING", 16, tickerY + 17);

      // Scrolling text
      const fullTickerText = `  •  ${sentences.join("   •   ")}   •   ፋና ብሮድካስቲንግ ኮርፖሬት • ${activeAvatarName}  `;
      ctx.fillStyle = "#e4e4e7";
      ctx.font = '12px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
      ctx.fillText(fullTickerText, tickerX, tickerY + 17);
      tickerX -= 1.8;
      if (tickerX < -2200) {
        tickerX = width;
      }
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    isOpen,
    isPlaying,
    sensitivity,
    bodyMotionIntensity,
    mouthConfig,
    showMouthGuide,
    studioChannel,
    studioTheme,
    activeAvatarName,
    sentences,
    activeHeadline,
  ]);

  // Video Recording Engine
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(30);

      // Attempt to attach audio from studio audio engine destination
      const ctx = studioAudio.init();
      if (ctx && (studioAudio as any).destinationNode) {
        const audioStream = (studioAudio as any).destinationNode.stream;
        if (audioStream && audioStream.getAudioTracks().length > 0) {
          stream.addTrack(audioStream.getAudioTracks()[0]);
        }
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const mr = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4000000 });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setIsRecording(false);
      };

      mr.start(100);
      setIsRecording(true);
      setRecordSeconds(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);

      // If not currently playing speech, trigger broadcast
      if (!isPlaying && onPlayBroadcast) {
        onPlayBroadcast();
      }
    } catch (err) {
      console.error("Recording start error:", err);
    }
  };

  const stopRecording = () => {
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedBlob) return;
    downloadDirectVideo(recordedBlob, `talking_anchor_${selectedPresetId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>{isEn ? "AI Talking Photo & Character Animator" : "ተንቀሳቃሽ የፎቶና ገፀ-ባህሪ ዜና አቅራቢ"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500 text-red-300 font-extrabold uppercase">
                  LIP-SYNC LIVE
                </span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns on large screens) */}
        <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto">
          {/* Main Visualizer Stage (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* The 16:9 Canvas Stage */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/80 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />

              {/* Recording Indicator Overlay */}
              {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-lg shadow-red-950/80 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>REC {recordSeconds}s</span>
                </div>
              )}
            </div>

            {/* Stage Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              {/* Play / Stop Audio Broadcast */}
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <button
                    type="button"
                    onClick={onStopBroadcast}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>{isEn ? "Stop Audio" : "አቁም"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPlayBroadcast}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isEn ? "Broadcast & Talk" : "ዜናውን አንብብ"}</span>
                  </button>
                )}

                {/* Record Video Button */}
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 border border-red-500 active:scale-95 transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                    <span>{isEn ? "Finish Recording" : "ቀረጻ አቁም"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-200 bg-red-950/60 hover:bg-red-900/80 border border-red-700/80 active:scale-95 transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-red-400" />
                    <span>{isEn ? "Record Video" : "ቪዲዮ ቅረፅ"}</span>
                  </button>
                )}
              </div>

              {/* Download / CapCut Buttons if recorded */}
              <div className="flex items-center gap-2">
                {recordedBlob && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadVideo}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? "Download MP4/WebM" : "ቪዲዮውን አውርድ"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openCapCutWithMedia({
                          blob: recordedBlob,
                          filename: `talking_anchor_${Date.now()}.webm`,
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                      <span>CapCut</span>
                    </button>
                  </>
                )}

                {/* Mouth Guide Calibration Toggle */}
                <button
                  type="button"
                  onClick={() => setShowMouthGuide(!showMouthGuide)}
                  className={`p-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    showMouthGuide
                      ? "bg-amber-500 text-neutral-950 border-amber-400"
                      : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
                  }`}
                  title={isEn ? "Toggle mouth calibration guide" : "የከንፈር መመርመሪያ አሳይ"}
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Control & Custom Upload Panel (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* Custom Image Upload Card */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isEn ? "Upload Your Photo" : "የገዛ ፎቶ አስገባ (Upload)"}</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">PNG/JPG/WEBP</span>
              </div>

              {/* Upload Trigger Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-amber-500 bg-neutral-900/60 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isEn ? "Click to upload face / character" : "ምስል ለመምረጥ እዚህ ይጫኑ"}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isEn ? "Human face, animal, hyena, or cartoon" : "የሰው፣ የጅብ፣ የእንስሳት ወይም የካርቱን ፎቶ"}
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block pb-1 border-b border-neutral-800">
                {isEn ? "Character & Anchor Presets" : "ዝግጁ ገፀ-ባህሪያትና አንባቢዎች"}
              </span>

              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-0.5">
                {AVATAR_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id && !customImageUrl;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPreset(p)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-neutral-900 border-amber-500 ring-1 ring-amber-500 shadow-md"
                          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                      }`}
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.nameAmharic}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-neutral-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {isEn ? p.nameEnglish : p.nameAmharic}
                        </p>
                        <p className="text-[10px] text-neutral-400 truncate">
                          {p.roleAmharic}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Animation & Lip-Sync Controls */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block pb-1 border-b border-neutral-800 flex items-center justify-between">
                <span>{isEn ? "Lip & Body Tuning" : "የከንፈርና አካል እንቅስቃሴ ማስተካከያ"}</span>
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
              </span>

              {/* Lip-Sync Sensitivity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Lip Movement Sensitivity:" : "የከንፈር ምላሽ ፍጥነት፦"}</span>
                  <span className="font-mono text-amber-400 font-bold">{sensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Body Motion Intensity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Body & Head Breathing Motion:" : "የሰውነትና ራስ እንቅስቃሴ፦"}</span>
                  <span className="font-mono text-cyan-400 font-bold">{bodyMotionIntensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={bodyMotionIntensity}
                  onChange={(e) => setBodyMotionIntensity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mouth Vertical Position (Calibration) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Mouth Position (Y-Axis):" : "የአፍ ቁመት አቀማመጥ፦"}</span>
                  <span className="font-mono text-neutral-400">{Math.round(mouthConfig.y * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="0.8"
                  step="0.01"
                  value={mouthConfig.y}
                  onChange={(e) =>
                    setMouthConfig((prev) => ({ ...prev, y: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* TV Studio Brand Channel */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-1">
                <span className="text-[11px] text-neutral-400">{isEn ? "Studio Logo:" : "የቴሌቪዥን ሎጎ፦"}</span>
                <div className="flex items-center gap-1">
                  {(["etv", "amc", "fana"] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setStudioChannel(ch)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        studioChannel === ch
                          ? "bg-amber-500 text-neutral-950"
                          : "bg-neutral-900 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
