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
  Tv,
  CheckCircle2,
  Camera,
  Layers,
  Smile,
  Move,
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
    x: number; // 0 to 1
    y: number; // 0 to 1
    width: number; // 0 to 1
    height: number; // 0 to 1
  };
  headConfig: {
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;
    neckY: number; // Pivot point for head nod/tilt
  };
  eyesConfig?: {
    leftX: number;
    rightX: number;
    y: number;
    radius: number;
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
    mouthConfig: { x: 0.5, y: 0.385, width: 0.22, height: 0.085 },
    headConfig: { x: 0.5, y: 0.31, radiusX: 0.23, radiusY: 0.23, neckY: 0.46 },
    eyesConfig: { leftX: 0.442, rightX: 0.558, y: 0.292, radius: 0.035 },
  },
  {
    id: "anchor_dawit",
    nameAmharic: "ዳዊት ከበደ",
    nameEnglish: "Dawit Kebede",
    roleAmharic: "አበይት ዜና አቅራቢ",
    imageUrl: "/images/anchor_dawit.jpg",
    type: "human",
    mouthConfig: { x: 0.507, y: 0.338, width: 0.12, height: 0.05 },
    headConfig: { x: 0.507, y: 0.27, radiusX: 0.16, radiusY: 0.19, neckY: 0.4 },
    eyesConfig: { leftX: 0.473, rightX: 0.542, y: 0.252, radius: 0.02 },
  },
  {
    id: "anchor_aster",
    nameAmharic: "አስቴር ማሞ",
    nameEnglish: "Aster Mamo",
    roleAmharic: "ዋና ዜና አቅራቢ",
    imageUrl: "/images/anchor_aster.jpg",
    type: "human",
    mouthConfig: { x: 0.535, y: 0.342, width: 0.11, height: 0.05 },
    headConfig: { x: 0.535, y: 0.27, radiusX: 0.16, radiusY: 0.19, neckY: 0.39 },
    eyesConfig: { leftX: 0.505, rightX: 0.568, y: 0.262, radius: 0.02 },
  },
  {
    id: "anchor_solomon",
    nameAmharic: "ሰሎሞን ግርማ",
    nameEnglish: "Solomon Girma",
    roleAmharic: "ሰበር ዜና ዘጋቢ",
    imageUrl: "/images/anchor_solomon.jpg",
    type: "human",
    mouthConfig: { x: 0.508, y: 0.362, width: 0.12, height: 0.055 },
    headConfig: { x: 0.508, y: 0.29, radiusX: 0.16, radiusY: 0.2, neckY: 0.41 },
    eyesConfig: { leftX: 0.478, rightX: 0.538, y: 0.282, radius: 0.02 },
  },
  {
    id: "anchor_sofia",
    nameAmharic: "ሶፊያ ኑረዲን",
    nameEnglish: "Sofia Nuredin",
    roleAmharic: "ማህበራዊና ባህል ዘጋቢ",
    imageUrl: "/images/anchor_sofia.jpg",
    type: "human",
    mouthConfig: { x: 0.535, y: 0.342, width: 0.11, height: 0.05 },
    headConfig: { x: 0.535, y: 0.27, radiusX: 0.16, radiusY: 0.19, neckY: 0.39 },
    eyesConfig: { leftX: 0.505, rightX: 0.568, y: 0.262, radius: 0.02 },
  },
  {
    id: "anchor_temesgen",
    nameAmharic: "ተመስገን አሰፋ",
    nameEnglish: "Temesgen Assefa",
    roleAmharic: "ትንታኔና ኢኮኖሚ ዘጋቢ",
    imageUrl: "/images/anchor_temesgen.jpg",
    type: "human",
    mouthConfig: { x: 0.518, y: 0.36, width: 0.11, height: 0.05 },
    headConfig: { x: 0.518, y: 0.29, radiusX: 0.16, radiusY: 0.2, neckY: 0.42 },
    eyesConfig: { leftX: 0.485, rightX: 0.552, y: 0.295, radius: 0.02 },
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
    y: 0.385,
    width: 0.22,
    height: 0.085,
  });

  // Animation Tweaks
  const [sensitivity, setSensitivity] = useState<number>(1.3);
  const [bodyMotionIntensity, setBodyMotionIntensity] = useState<number>(1.0);
  const [showMouthGuide, setShowMouthGuide] = useState<boolean>(false);
  const [studioChannel, setStudioChannel] = useState<"etv" | "amc" | "fana">("etv");
  const [studioTheme, setStudioTheme] = useState<"newsroom" | "breaking" | "prime">("newsroom");

  // Dragging state for canvas mouse calibration
  const [isDraggingMouth, setIsDraggingMouth] = useState<boolean>(false);

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
  const currentImageSrc =
    customImageUrl ||
    AVATAR_PRESETS.find((p) => p.id === selectedPresetId)?.imageUrl ||
    "/images/hyena_anchor.jpg";

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
      // Default natural face mouth position (upper-mid face)
      setMouthConfig({ x: 0.5, y: 0.38, width: 0.14, height: 0.06 });
      setShowMouthGuide(true);
    };
    reader.readAsDataURL(file);
  };

  // Reset to default preset calibration
  const handleResetCalibration = () => {
    const preset = AVATAR_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset) {
      setMouthConfig(preset.mouthConfig);
    } else {
      setMouthConfig({ x: 0.5, y: 0.38, width: 0.14, height: 0.06 });
    }
  };

  // Helper to calculate image framing on 1280x720 canvas
  const getImageBounds = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img || img.naturalWidth === 0) {
      return { imgX: 0, imgY: 0, targetW: 1280, targetH: 720 };
    }
    const targetH = canvas.height;
    const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
    const imgX = (canvas.width - targetW) / 2;
    const imgY = 0;
    return { imgX, imgY, targetW, targetH };
  };

  // Canvas Click / Drag to position mouth directly on face
  const updateMouthFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    const { imgX, imgY, targetW, targetH } = getImageBounds();
    const normX = (canvasX - imgX) / targetW;
    const normY = (canvasY - imgY) / targetH;

    if (normX >= 0.1 && normX <= 0.9 && normY >= 0.1 && normY <= 0.9) {
      setMouthConfig((prev) => ({
        ...prev,
        x: Number(normX.toFixed(3)),
        y: Number(normY.toFixed(3)),
      }));
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showMouthGuide) return;
    setIsDraggingMouth(true);
    updateMouthFromEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingMouth) {
      updateMouthFromEvent(e);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingMouth(false);
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

        // Low-mid vocal formant frequencies peak
        let freqSum = 0;
        for (let i = 5; i < Math.min(60, bufferLength); i++) {
          freqSum += freqData[i];
        }
        formantPitch = freqSum / 55 / 255;

        audioEnergy = Math.min(1.0, rms * 4.8 * sensitivity);
      } else if (isPlaying) {
        // Fallback natural speaking cadence modulation
        audioEnergy =
          (Math.sin(elapsed * 12) * 0.5 + 0.5) *
          (Math.sin(elapsed * 4) * 0.4 + 0.6) *
          0.6;
      }

      // Smooth mouth lerp
      currentOpenRef.current += (audioEnergy - currentOpenRef.current) * 0.45;
      const mouthOpen = Math.max(0, Math.min(1.0, currentOpenRef.current));

      // 2. Eye Blinking Logic (every 3.8 to 4.6 seconds)
      eyeBlinkTimerRef.current += 1 / 60;
      if (eyeBlinkTimerRef.current > 4.0) {
        isBlinkingRef.current = true;
        if (eyeBlinkTimerRef.current > 4.14) {
          isBlinkingRef.current = false;
          eyeBlinkTimerRef.current = 0;
        }
      }

      // 3. Clear Screen & Studio Background Base
      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (studioTheme === "breaking") {
        bgGrad.addColorStop(0, "#220303");
        bgGrad.addColorStop(1, "#090101");
      } else if (studioTheme === "prime") {
        bgGrad.addColorStop(0, "#081b33");
        bgGrad.addColorStop(1, "#02070e");
      } else {
        bgGrad.addColorStop(0, "#1c1917");
        bgGrad.addColorStop(1, "#080706");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const img = imageObjRef.current;
      if (img && img.complete && img.naturalWidth > 0) {
        // Precise framing: full vertical height on 1280x720 canvas
        const targetH = height;
        const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
        const imgX = (width - targetW) / 2;
        const imgY = 0;

        // A. Draw Ambient Blurred Studio Extension if image is narrower than 16:9
        if (targetW < width) {
          ctx.save();
          ctx.filter = "blur(26px) brightness(0.65)";
          ctx.drawImage(img, 0, 0, width, height);
          ctx.restore();
        }

        // B. Draw Static Crisp Base Anchor Image (STATIONARY STUDIO & DESK!)
        // The studio monitors, room, walls, and desk stay 100% FIXED & STABLE!
        ctx.drawImage(img, imgX, imgY, targetW, targetH);

        // Active Preset Config or Custom defaults
        const currentPreset = AVATAR_PRESETS.find((p) => p.id === selectedPresetId);
        const headCfg = currentPreset?.headConfig || {
          x: 0.5,
          y: 0.3,
          radiusX: 0.2,
          radiusY: 0.22,
          neckY: 0.44,
        };
        const eyesCfg = currentPreset?.eyesConfig;

        // C. Calculate Head Motion (Speech Nod & Micro-tilt) — APPLIED TO HEAD ONLY!
        const speechNod = isPlaying ? mouthOpen * 3.2 * bodyMotionIntensity : 0;
        const headTilt =
          (Math.sin(elapsed * 1.5) * 0.012 +
            (isPlaying ? Math.sin(elapsed * 7) * 0.005 : 0)) *
          bodyMotionIntensity;

        const headCanvasX = imgX + targetW * headCfg.x;
        const headCanvasY = imgY + targetH * headCfg.y;
        const headRadiusX = targetW * headCfg.radiusX;
        const headRadiusY = targetH * headCfg.radiusY;
        const neckCanvasY = imgY + targetH * headCfg.neckY;

        // Animate head cutout around the neck pivot without moving the studio walls or desk
        if (bodyMotionIntensity > 0 && (isPlaying || Math.abs(headTilt) > 0.001)) {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(headCanvasX, headCanvasY, headRadiusX, headRadiusY, 0, 0, Math.PI * 2);
          ctx.clip();

          // Pivot around base of neck so only the head tilts/nods
          ctx.translate(headCanvasX, neckCanvasY);
          ctx.rotate(headTilt);
          ctx.translate(-headCanvasX, -neckCanvasY);
          ctx.translate(0, speechNod);

          // Re-draw head area from source
          ctx.drawImage(img, imgX, imgY, targetW, targetH);
          ctx.restore();
        }

        // D. Eye Blinking (Micro-animation every ~4s)
        if (isBlinkingRef.current && eyesCfg) {
          const leftEyeX = imgX + targetW * eyesCfg.leftX;
          const rightEyeX = imgX + targetW * eyesCfg.rightX;
          const eyeY = imgY + targetH * eyesCfg.y + speechNod;
          const eyeRad = targetW * eyesCfg.radius;

          [leftEyeX, rightEyeX].forEach((eX) => {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(eX, eyeY, eyeRad, eyeRad * 0.72, 0, 0, Math.PI * 2);
            ctx.clip();

            const srcEX =
              img.naturalWidth * (eX === leftEyeX ? eyesCfg.leftX : eyesCfg.rightX);
            const srcEY = img.naturalHeight * eyesCfg.y;
            const srcER = img.naturalWidth * eyesCfg.radius;

            // Draw upper eyelid skin over eye
            ctx.drawImage(
              img,
              srcEX - srcER,
              srcEY - srcER * 1.5,
              srcER * 2,
              srcER * 1.5,
              eX - eyeRad,
              eyeY - eyeRad * 0.6,
              eyeRad * 2,
              eyeRad * 1.35
            );

            // Subtle lash line
            ctx.strokeStyle = "rgba(40, 25, 20, 0.75)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(eX, eyeY + eyeRad * 0.1, eyeRad * 0.85, eyeRad * 0.25, 0, 0, Math.PI);
            ctx.stroke();

            ctx.restore();
          });
        }

        // E. Audio-Reactive Lip-Syncing & Jaw Animation
        const mX = imgX + targetW * mouthConfig.x;
        const mY = imgY + targetH * mouthConfig.y + speechNod;
        const mW = targetW * mouthConfig.width;
        const mH = targetH * mouthConfig.height;

        if (mouthOpen > 0.03) {
          const srcMX = img.naturalWidth * mouthConfig.x;
          const srcMY = img.naturalHeight * mouthConfig.y;
          const srcMW = img.naturalWidth * mouthConfig.width;
          const srcMH = img.naturalHeight * mouthConfig.height;

          const maxJawDrop = mH * 0.85;
          const jawDrop = mouthOpen * maxJawDrop;
          const horizontalMod = 1 + (formantPitch - 0.5) * 0.1;

          // 1. Inner Mouth Cavity (Dark, realistic depth with teeth and tongue highlights)
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            mX,
            mY + jawDrop * 0.45,
            (mW * 0.44) * horizontalMod,
            Math.max(2, (mH * 0.3) * mouthOpen + jawDrop * 0.4),
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
          mouthGrad.addColorStop(0, "#3e0505");
          mouthGrad.addColorStop(0.55, "#1e0101");
          mouthGrad.addColorStop(1, "#0a0000");
          ctx.fillStyle = mouthGrad;
          ctx.fill();

          // Upper teeth highlight
          ctx.fillStyle = "rgba(242, 242, 242, 0.9)";
          ctx.beginPath();
          ctx.ellipse(mX, mY + 1, (mW * 0.28) * horizontalMod, Math.min(4, mH * 0.16), 0, 0, Math.PI);
          ctx.fill();

          // Lower tongue highlight
          if (jawDrop > 2.5) {
            ctx.fillStyle = "rgba(185, 55, 60, 0.8)";
            ctx.beginPath();
            ctx.ellipse(
              mX,
              mY + jawDrop * 0.68,
              (mW * 0.25) * horizontalMod,
              Math.min(5.5, jawDrop * 0.35),
              0,
              0,
              Math.PI
            );
            ctx.fill();
          }
          ctx.restore();

          // 2. Draw Lower Lip / Jaw Patch (shifted down by jawDrop)
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            mX,
            mY + jawDrop + mH * 0.35,
            (mW * 0.48) * horizontalMod,
            mH * 0.52,
            0,
            0,
            Math.PI * 2
          );
          ctx.clip();

          ctx.drawImage(
            img,
            srcMX - srcMW / 2,
            srcMY,
            srcMW,
            srcMH * 1.25,
            mX - (mW / 2) * horizontalMod,
            mY + jawDrop - mH * 0.1,
            mW * horizontalMod,
            mH * 1.1
          );
          ctx.restore();

          // 3. Anchor Upper Lip (re-draw upper lip contour seamlessly)
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(mX, mY - mH * 0.15, (mW * 0.46) * horizontalMod, mH * 0.32, 0, 0, Math.PI * 2);
          ctx.clip();

          ctx.drawImage(
            img,
            srcMX - srcMW / 2,
            srcMY - srcMH * 0.45,
            srcMW,
            srcMH * 0.65,
            mX - (mW / 2) * horizontalMod,
            mY - mH * 0.45,
            mW * horizontalMod,
            mH * 0.65
          );
          ctx.restore();
        }

        // F. Interactive Mouth Guide (Calibration)
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

          // Calibration badge above mouth box
          ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
          ctx.beginPath();
          ctx.roundRect(mX - 60, mY - mH / 2 - 24, 120, 20, 4);
          ctx.fill();
          ctx.fillStyle = "#fef08a";
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.textAlign = "center";
          ctx.fillText(
            `ከንፈር (${Math.round(mouthConfig.x * 100)}%, ${Math.round(mouthConfig.y * 100)}%)`,
            mX,
            mY - mH / 2 - 10
          );
          ctx.restore();
        }
      }

      // 4. TV Broadcast Overlays (LIVE ON AIR + Logo + Lower-Third)
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

      ctx.fillStyle =
        studioChannel === "etv"
          ? "#3b82f6"
          : studioChannel === "amc"
          ? "#10b981"
          : "#f59e0b";
      ctx.font = "900 13px system-ui, sans-serif";
      const logoText =
        studioChannel === "etv"
          ? "ETV NEWS"
          : studioChannel === "amc"
          ? "AMC NEWS"
          : "FANA TV";
      ctx.fillText(logoText, width - 136, 46);
      ctx.restore();

      // C. Professional Lower-Third News Banner
      const currentSentenceIndex = isPlaying
        ? Math.floor(elapsed / 4.5) % sentences.length
        : 0;
      const currentSentence =
        sentences[currentSentenceIndex] || activeHeadline || "የቀጥታ ስቱዲዮ ዜና";

      const barY = height - 100;
      ctx.save();

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
      ctx.fillText(
        `🎙️ ${activeAvatarName}  |  ${
          studioTheme === "breaking" ? "ሰበር መረጃ" : "አበይት ዜና"
        }`,
        44,
        barY + 22
      );

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
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.fillText("BREAKING", 16, tickerY + 17);

      // Scrolling text
      const fullTickerText = `  •  ${sentences.join(
        "   •   "
      )}   •   ፋና ብሮድካስቲንግ ኮርፖሬት • ${activeAvatarName}  `;
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
    selectedPresetId,
  ]);

  // Video Recording Engine
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      recordedChunksRef.current = [];
      const stream = canvas.captureStream(30);

      // Attach audio from studio destination if active
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
                <span>
                  {isEn
                    ? "AI Talking Photo & Character Animator"
                    : "ተንቀሳቃሽ የፎቶና ገፀ-ባህሪ ዜና አቅራቢ"}
                </span>
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
            {/* The 16:9 Canvas Stage with Interactive Mouth Placement Click/Drag */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/80 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onClick={updateMouthFromEvent}
                className={`w-full h-full object-contain select-none ${
                  showMouthGuide ? "cursor-crosshair" : "cursor-default"
                }`}
              />

              {/* Recording Indicator Overlay */}
              {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-lg shadow-red-950/80 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>REC {recordSeconds}s</span>
                </div>
              )}

              {/* On-Screen Click to Calibrate Hint when guide active */}
              {showMouthGuide && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/80 border border-amber-500/80 text-amber-300 text-[11px] font-medium backdrop-blur-md pointer-events-none shadow-lg">
                  {isEn
                    ? "Click or drag anywhere on the face to position the mouth"
                    : "የከንፈሩን ቦታ ለመወሰን ፊቱ ላይ የሚፈልጉት ቦታ ይጫኑ"}
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

              {/* Video Actions & Calibration Toggle */}
              <div className="flex items-center gap-2">
                {recordedBlob && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadVideo}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? "Download MP4" : "ቪዲዮውን አውርድ"}</span>
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
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    showMouthGuide
                      ? "bg-amber-500 text-neutral-950 border-amber-400 shadow-md"
                      : "bg-neutral-900 text-neutral-300 hover:text-white border-neutral-800"
                  }`}
                  title={isEn ? "Calibrate mouth position" : "የከንፈር መመርመሪያ አሳይ"}
                >
                  <Smile className="w-3.5 h-3.5 text-current" />
                  <span>{isEn ? "Mouth Guide" : "የከንፈር መቆጣጠሪያ"}</span>
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
                className="p-3.5 rounded-xl border-2 border-dashed border-neutral-700 hover:border-amber-500 bg-neutral-900/60 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isEn ? "Click to upload face / character" : "ምስል ለመምረጥ እዚህ ይጫኑ"}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {isEn
                      ? "Human face, hyena, animal or cartoon"
                      : "የሰው፣ የጅብ፣ የእንስሳት ወይም የካርቱን ፎቶ"}
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block pb-1 border-b border-neutral-800">
                {isEn ? "Character & Anchor Presets" : "ዝግጁ ገፀ-ባህሪያትና አንባቢዎች"}
              </span>

              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-0.5">
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
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-neutral-700"
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
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isEn ? "Lip & Motion Tuning" : "የከንፈርና እንቅስቃሴ ማስተካከያ"}</span>
                </span>
                <button
                  type="button"
                  onClick={handleResetCalibration}
                  className="text-[10px] text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isEn ? "Reset" : "መልስ"}</span>
                </button>
              </div>

              {/* Mouth Vertical Position (Calibration) */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Mouth Position (Y-Axis):" : "የከንፈር ቁመት (Y-Axis)፦"}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round(mouthConfig.y * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.75"
                  step="0.005"
                  value={mouthConfig.y}
                  onChange={(e) =>
                    setMouthConfig((prev) => ({ ...prev, y: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mouth Horizontal Position */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Mouth Horizontal (X-Axis):" : "የከንፈር አግድም (X-Axis)፦"}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {Math.round(mouthConfig.x * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="0.75"
                  step="0.005"
                  value={mouthConfig.x}
                  onChange={(e) =>
                    setMouthConfig((prev) => ({ ...prev, x: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Mouth Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Mouth Width:" : "የከንፈር ስፋት፦"}</span>
                  <span className="font-mono text-neutral-400">
                    {Math.round(mouthConfig.width * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.06"
                  max="0.35"
                  step="0.005"
                  value={mouthConfig.width}
                  onChange={(e) =>
                    setMouthConfig((prev) => ({
                      ...prev,
                      width: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Head Motion Intensity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Head & Neck Motion:" : "የራስና አንገት እንቅስቃሴ፦"}</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {bodyMotionIntensity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="2.0"
                  step="0.1"
                  value={bodyMotionIntensity}
                  onChange={(e) => setBodyMotionIntensity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Lip-Sync Sensitivity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Lip-Sync Sensitivity:" : "የከንፈር ምላሽ ፍጥነት፦"}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {sensitivity.toFixed(1)}x
                  </span>
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

              {/* TV Studio Brand Channel */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-1">
                <span className="text-[11px] text-neutral-400">
                  {isEn ? "Studio Logo:" : "የቴሌቪዥን ሎጎ፦"}
                </span>
                <div className="flex items-center gap-1">
                  {(["etv", "amc", "fana"] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setStudioChannel(ch)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        studioChannel === ch
                          ? "bg-amber-500 text-neutral-950 font-black"
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
