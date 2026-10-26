import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  X,
  Upload,
  Play,
  Square,
  Video,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Tv,
  Smile,
  Users,
  User,
  Mic,
  MessageSquare,
  Volume2,
} from "lucide-react";
import { studioAudio } from "../utils/audioEngine";
import { downloadDirectVideo } from "../utils/mediaMerger";
import { useLanguage } from "../context/LanguageContext";

interface TalkingAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
  activeHeadline: string;
  isPlaying?: boolean;
  onPlayBroadcast?: () => void;
  onStopBroadcast?: () => void;
  onUpdateScript?: (newScript: string) => void;
}

interface AvatarPreset {
  id: string;
  nameAmharic: string;
  nameEnglish: string;
  roleAmharic: string;
  imageUrl: string;
  type: "human" | "animal" | "cartoon";
  mouthConfig: {
    x: number;
    y: number;
    width: number;
    height: number;
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
    id: "anchor_dawit",
    nameAmharic: "ዳዊት ከበደ",
    nameEnglish: "Dawit Kebede",
    roleAmharic: "ጠያቂና ዋና አቅራቢ",
    imageUrl: "/images/anchor_dawit.jpg",
    type: "human",
    mouthConfig: { x: 0.507, y: 0.338, width: 0.085, height: 0.032 },
    eyesConfig: { leftX: 0.473, rightX: 0.542, y: 0.252, radius: 0.02 },
  },
  {
    id: "hyena_anchor",
    nameAmharic: "ጅቦ ተንታኝ",
    nameEnglish: "Hyena Analyst",
    roleAmharic: "ተጠያቂና የትንታኔ ባለሙያ",
    imageUrl: "/images/hyena_anchor.jpg",
    type: "animal",
    mouthConfig: { x: 0.5, y: 0.388, width: 0.11, height: 0.038 },
    eyesConfig: { leftX: 0.442, rightX: 0.558, y: 0.292, radius: 0.035 },
  },
  {
    id: "anchor_aster",
    nameAmharic: "አስቴር ማሞ",
    nameEnglish: "Aster Mamo",
    roleAmharic: "ዋና አቅራቢ",
    imageUrl: "/images/anchor_aster.jpg",
    type: "human",
    mouthConfig: { x: 0.535, y: 0.342, width: 0.078, height: 0.03 },
    eyesConfig: { leftX: 0.505, rightX: 0.568, y: 0.262, radius: 0.02 },
  },
  {
    id: "anchor_temesgen",
    nameAmharic: "ተመስገን አሰፋ",
    nameEnglish: "Temesgen Assefa",
    roleAmharic: "የኢኮኖሚ ተንታኝ",
    imageUrl: "/images/anchor_temesgen.jpg",
    type: "human",
    mouthConfig: { x: 0.518, y: 0.36, width: 0.082, height: 0.032 },
    eyesConfig: { leftX: 0.485, rightX: 0.552, y: 0.295, radius: 0.02 },
  },
  {
    id: "anchor_solomon",
    nameAmharic: "ሰሎሞን ግርማ",
    nameEnglish: "Solomon Girma",
    roleAmharic: "ተጋባዥ እንግዳ",
    imageUrl: "/images/anchor_solomon.jpg",
    type: "human",
    mouthConfig: { x: 0.508, y: 0.362, width: 0.082, height: 0.032 },
    eyesConfig: { leftX: 0.478, rightX: 0.538, y: 0.282, radius: 0.02 },
  },
  {
    id: "anchor_sofia",
    nameAmharic: "ሶፊያ ኑረዲን",
    nameEnglish: "Sofia Nuredin",
    roleAmharic: "ዘጋቢና ጋዜጠኛ",
    imageUrl: "/images/anchor_sofia.jpg",
    type: "human",
    mouthConfig: { x: 0.535, y: 0.342, width: 0.078, height: 0.03 },
    eyesConfig: { leftX: 0.505, rightX: 0.568, y: 0.262, radius: 0.02 },
  },
];

const SAMPLE_INTERVIEW_SCRIPT = `ጠያቂ፦ በዛሬው የስቱዲዮ ውይይታችን በወቅታዊ የኢኮኖሚና የቴክኖሎጂ እድገት ዙሪያ ከተንታኛችን ጋር እንወያያለን፤ ወደ ስቱዲዮአችን እንኳን ደህና መጡ!
ተጠያቂ፦ በጣም አመሰግናለሁ፤ በአሁኑ ወቅት የዲጂታል ኢኮኖሚው እና የኢኖቬሽን ዘርፉ ከፍተኛ መነቃቃት እያሳየ ይገኛል።
ጠያቂ፦ ለተፈጠረው አዎንታዊ ለውጥ ዋናው አንቀሳቃሽ ኃይል ምንድነው ይላሉ?
ተጠያቂ፦ የፈጠራ ስራዎች መበራከትና በቴክኖሎጂ የተደገፉ የክፍያ ስርዓቶች መዘርጋት ዘርፉን በእጅጉ አሳድጎታል።
ጠያቂ፦ በቀጣይስ በዘርፉ ለሚሰማሩ ወጣቶች ምን ዓይነት ምክረ-ሀሳብ አለዎት?
ተጠያቂ፦ እውቀትንና ክህሎትን ማሳደግ፣ አዳዲስ የቴክኖሎጂ አዝማሚያዎችን መከታተልና ለገበያ ምቹ የሆኑ መፍትሄዎችን ማመንጨት ቁልፍ ጉዳይ ነው።`;

// Pure reusable avatar renderer
function drawAnchorAvatar({
  ctx,
  img,
  bounds,
  mouthConfig,
  eyesConfig,
  mouthOpen,
  formantPitch,
  sensitivity,
  isBlinking,
  tilt,
  nod,
  sway,
  showGuide,
  guideLabel,
}: {
  ctx: CanvasRenderingContext2D;
  img: HTMLImageElement;
  bounds: { x: number; y: number; width: number; height: number };
  mouthConfig: { x: number; y: number; width: number; height: number };
  eyesConfig?: { leftX: number; rightX: number; y: number; radius: number };
  mouthOpen: number;
  formantPitch: number;
  sensitivity: number;
  isBlinking: boolean;
  tilt: number;
  nod: number;
  sway: number;
  showGuide?: boolean;
  guideLabel?: string;
}) {
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const { x, y, width, height } = bounds;
  const pivotX = x + width * 0.5;
  // Natural neck base pivot: articulates head and neck while keeping shoulders anchored
  const pivotY = y + height * 0.65;

  ctx.save();
  // Pivot transform: articulates neck & head naturally while keeping base torso anchored
  ctx.translate(pivotX, pivotY);
  ctx.rotate(tilt);
  ctx.translate(sway, nod);
  ctx.translate(-pivotX, -pivotY);

  // Draw Base Anchor Image
  ctx.drawImage(img, x, y, width, height);

  // Eye Blinking
  if (isBlinking && eyesConfig) {
    const leftEyeX = x + width * eyesConfig.leftX;
    const rightEyeX = x + width * eyesConfig.rightX;
    const eyeY = y + height * eyesConfig.y;
    const eyeRad = width * eyesConfig.radius;

    [leftEyeX, rightEyeX].forEach((eX) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(eX, eyeY, eyeRad, eyeRad * 0.7, 0, 0, Math.PI * 2);
      ctx.clip();

      const srcEX =
        img.naturalWidth * (eX === leftEyeX ? eyesConfig.leftX : eyesConfig.rightX);
      const srcEY = img.naturalHeight * eyesConfig.y;
      const srcER = img.naturalWidth * eyesConfig.radius;

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

      ctx.strokeStyle = "rgba(40, 25, 20, 0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(eX, eyeY + eyeRad * 0.1, eyeRad * 0.85, eyeRad * 0.25, 0, 0, Math.PI);
      ctx.stroke();

      ctx.restore();
    });
  }

  // Mouth Lip-Sync
  const mX = x + width * mouthConfig.x;
  const mY = y + height * mouthConfig.y;
  const mW = width * mouthConfig.width;
  const mH = height * mouthConfig.height;

  if (mouthOpen > 0.02) {
    const srcMX = img.naturalWidth * mouthConfig.x;
    const srcMY = img.naturalHeight * mouthConfig.y;
    const srcMW = img.naturalWidth * mouthConfig.width;
    const srcMH = img.naturalHeight * mouthConfig.height;

    const maxJawDrop = Math.min(8.5, Math.max(3, mH * 0.38 * sensitivity));
    const jawDrop = mouthOpen * maxJawDrop;

    const cavityW = mW * 0.34 * (1 + (formantPitch - 0.5) * 0.08);
    const cavityH = Math.min(6.5, Math.max(1.5, jawDrop * 0.65));

    // Inner mouth cavity
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(mX, mY + jawDrop * 0.38, cavityW, cavityH, 0, 0, Math.PI * 2);
    const mouthGrad = ctx.createRadialGradient(
      mX,
      mY + jawDrop * 0.25,
      1,
      mX,
      mY + jawDrop * 0.25,
      cavityW
    );
    mouthGrad.addColorStop(0, "#2a0404");
    mouthGrad.addColorStop(0.65, "#140101");
    mouthGrad.addColorStop(1, "#070000");
    ctx.fillStyle = mouthGrad;
    ctx.fill();

    // Subtle teeth highlight
    if (cavityH > 2.2) {
      ctx.fillStyle = "rgba(245, 245, 245, 0.88)";
      ctx.beginPath();
      ctx.ellipse(
        mX,
        mY + 0.5,
        cavityW * 0.65,
        Math.min(2.2, cavityH * 0.35),
        0,
        0,
        Math.PI
      );
      ctx.fill();
    }

    // Tongue
    if (jawDrop > 3.0) {
      ctx.fillStyle = "rgba(175, 50, 54, 0.75)";
      ctx.beginPath();
      ctx.ellipse(
        mX,
        mY + jawDrop * 0.6,
        cavityW * 0.55,
        Math.min(2.8, jawDrop * 0.28),
        0,
        0,
        Math.PI
      );
      ctx.fill();
    }
    ctx.restore();

    // Lower Lip displaced downwards
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(mX, mY + jawDrop + mH * 0.45, mW * 0.46, mH * 0.52, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      img,
      srcMX - srcMW / 2,
      srcMY,
      srcMW,
      srcMH * 1.3,
      mX - mW / 2,
      mY + jawDrop - mH * 0.1,
      mW,
      mH * 1.2
    );
    ctx.restore();

    // Upper Lip
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(mX, mY - mH * 0.2, mW * 0.44, mH * 0.32, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      img,
      srcMX - srcMW / 2,
      srcMY - srcMH * 0.5,
      srcMW,
      srcMH * 0.65,
      mX - mW / 2,
      mY - mH * 0.48,
      mW,
      mH * 0.65
    );
    ctx.restore();
  }

  // Mouth Calibration Guide
  if (showGuide) {
    ctx.save();
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(mX - mW / 2, mY - mH / 2, mW, mH);

    ctx.fillStyle = "#eab308";
    ctx.beginPath();
    ctx.arc(mX, mY, 4, 0, Math.PI * 2);
    ctx.fill();

    if (guideLabel) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(mX - 60, mY - mH / 2 - 24, 120, 20, 4);
      ctx.fill();
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(guideLabel, mX, mY - mH / 2 - 10);
    }
    ctx.restore();
  }

  ctx.restore();
}

export const TalkingAvatarModal: React.FC<TalkingAvatarModalProps> = ({
  isOpen,
  onClose,
  script,
  activeHeadline,
  isPlaying = false,
  onPlayBroadcast,
  onStopBroadcast,
  onUpdateScript,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  // Studio Mode: Dual Interview Desk vs Solo Anchor
  const [studioMode, setStudioMode] = useState<"interview" | "solo">("interview");

  // Avatar 1: ጠያቂ / Interviewer (Host - Left)
  const [hostPresetId, setHostPresetId] = useState<string>("anchor_dawit");
  const [hostCustomImage, setHostCustomImage] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string>("ዳዊት ከበደ");
  const [hostMouth, setHostMouth] = useState({
    x: 0.507,
    y: 0.338,
    width: 0.085,
    height: 0.032,
  });

  // Avatar 2: ተጠያቂ / Interviewee (Guest Analyst - Right)
  const [guestPresetId, setGuestPresetId] = useState<string>("hyena_anchor");
  const [guestCustomImage, setGuestCustomImage] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string>("ጅቦ ተንታኝ");
  const [guestMouth, setGuestMouth] = useState({
    x: 0.5,
    y: 0.388,
    width: 0.11,
    height: 0.038,
  });

  // Active speaker control for dual interview: "auto" | "interviewer" | "interviewee"
  const [speakerMode, setSpeakerMode] = useState<"auto" | "interviewer" | "interviewee">("auto");
  // Active settings tab for configuring: "host" | "guest"
  const [activeConfigTab, setActiveConfigTab] = useState<"host" | "guest">("host");

  // Lip-Sync Sensitivity & Guide
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [showMouthGuide, setShowMouthGuide] = useState<boolean>(false);
  const [broadcastBadge, setBroadcastBadge] = useState<"prime" | "global" | "live24">("prime");

  // Mouse calibration drag state
  const [isDraggingMouth, setIsDraggingMouth] = useState<boolean>(false);

  // Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);

  // Canvas and Animation Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputHostRef = useRef<HTMLInputElement | null>(null);
  const fileInputGuestRef = useRef<HTMLInputElement | null>(null);
  const imageHostRef = useRef<HTMLImageElement | null>(null);
  const imageGuestRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);

  // Audio energy & mouth smoothing
  const currentOpenRef = useRef<number>(0);
  const eyeBlinkTimerRef = useRef<number>(0);
  const isBlinkingRef = useRef<boolean>(false);

  // Head motion tracking
  const hostMotionRef = useRef<{ tilt: number; nod: number; sway: number }>({
    tilt: 0,
    nod: 0,
    sway: 0,
  });
  const guestMotionRef = useRef<{ tilt: number; nod: number; sway: number }>({
    tilt: 0,
    nod: 0,
    sway: 0,
  });

  // Parse turns for Q&A dialogue
  const dialogueTurns = useMemo(() => {
    const lines = script.split("\n").map((l) => l.trim()).filter(Boolean);
    const turns: { speaker: "interviewer" | "interviewee"; text: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(ጠያቂ|host|interviewer)[፦:]/i.test(line)) {
        turns.push({
          speaker: "interviewer",
          text: line.replace(/^(ጠያቂ|host|interviewer)[፦:]\s*/i, ""),
        });
      } else if (/^(ተጠያቂ|ተንታኝ|guest|analyst)[፦:]/i.test(line)) {
        turns.push({
          speaker: "interviewee",
          text: line.replace(/^(ተጠያቂ|ተንታኝ|guest|analyst)[፦:]\s*/i, ""),
        });
      } else {
        turns.push({
          speaker: i % 2 === 0 ? "interviewer" : "interviewee",
          text: line,
        });
      }
    }

    return turns.length > 0
      ? turns
      : [
          { speaker: "interviewer" as const, text: "የመጀመሪያ ጥያቄ" },
          { speaker: "interviewee" as const, text: "የትንታኔ ምላሽ" },
        ];
  }, [script]);

  // Preload Host Image
  const hostImageSrc =
    hostCustomImage ||
    AVATAR_PRESETS.find((p) => p.id === hostPresetId)?.imageUrl ||
    "/images/anchor_dawit.jpg";

  useEffect(() => {
    if (!isOpen) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = hostImageSrc;
    img.onload = () => {
      imageHostRef.current = img;
    };
  }, [hostImageSrc, isOpen]);

  // Preload Guest Image
  const guestImageSrc =
    guestCustomImage ||
    AVATAR_PRESETS.find((p) => p.id === guestPresetId)?.imageUrl ||
    "/images/hyena_anchor.jpg";

  useEffect(() => {
    if (!isOpen) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = guestImageSrc;
    img.onload = () => {
      imageGuestRef.current = img;
    };
  }, [guestImageSrc, isOpen]);

  // Handle Preset Select
  const handleSelectPreset = (preset: AvatarPreset, role: "host" | "guest") => {
    if (role === "host") {
      setHostPresetId(preset.id);
      setHostCustomImage(null);
      setHostMouth(preset.mouthConfig);
      setHostName(isEn ? preset.nameEnglish : preset.nameAmharic);
    } else {
      setGuestPresetId(preset.id);
      setGuestCustomImage(null);
      setGuestMouth(preset.mouthConfig);
      setGuestName(isEn ? preset.nameEnglish : preset.nameAmharic);
    }
  };

  // Handle Custom Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, role: "host" | "guest") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (role === "host") {
        setHostCustomImage(dataUrl);
        setHostPresetId("custom_host");
        setHostName(isEn ? "Uploaded Host" : "የገዛ ጠያቂ ፎቶ");
        setHostMouth({ x: 0.5, y: 0.38, width: 0.09, height: 0.032 });
      } else {
        setGuestCustomImage(dataUrl);
        setGuestPresetId("custom_guest");
        setGuestName(isEn ? "Uploaded Guest" : "የገዛ ተጠያቂ ፎቶ");
        setGuestMouth({ x: 0.5, y: 0.38, width: 0.09, height: 0.032 });
      }
      setShowMouthGuide(true);
    };
    reader.readAsDataURL(file);
  };

  // Reset Calibration
  const handleResetCalibration = (role: "host" | "guest") => {
    if (role === "host") {
      const p = AVATAR_PRESETS.find((x) => x.id === hostPresetId);
      setHostMouth(p ? p.mouthConfig : { x: 0.5, y: 0.38, width: 0.09, height: 0.032 });
    } else {
      const p = AVATAR_PRESETS.find((x) => x.id === guestPresetId);
      setGuestMouth(p ? p.mouthConfig : { x: 0.5, y: 0.38, width: 0.09, height: 0.032 });
    }
  };

  // Canvas Click/Drag Calibration
  const updateMouthFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = (e.clientX - rect.left) * scaleX;
    const canvasY = (e.clientY - rect.top) * scaleY;

    if (studioMode === "solo") {
      const img = imageHostRef.current;
      if (!img || img.naturalWidth === 0) return;
      const targetH = canvas.height;
      const targetW = (img.naturalWidth / img.naturalHeight) * targetH;
      const imgX = (canvas.width - targetW) / 2;
      const normX = (canvasX - imgX) / targetW;
      const normY = canvasY / targetH;
      if (normX >= 0.1 && normX <= 0.9 && normY >= 0.1 && normY <= 0.9) {
        setHostMouth((prev) => ({
          ...prev,
          x: Number(normX.toFixed(3)),
          y: Number(normY.toFixed(3)),
        }));
      }
    } else {
      // Dual mode: Left avatar or Right avatar
      if (canvasX < canvas.width / 2) {
        // Left (Host) bounds: x=70, y=35, w=540, h=660
        const normX = (canvasX - 70) / 540;
        const normY = (canvasY - 35) / 660;
        if (normX >= 0.1 && normX <= 0.9 && normY >= 0.1 && normY <= 0.9) {
          setHostMouth((prev) => ({
            ...prev,
            x: Number(normX.toFixed(3)),
            y: Number(normY.toFixed(3)),
          }));
        }
      } else {
        // Right (Guest) bounds: x=670, y=35, w=540, h=660
        const normX = (canvasX - 670) / 540;
        const normY = (canvasY - 35) / 660;
        if (normX >= 0.1 && normX <= 0.9 && normY >= 0.1 && normY <= 0.9) {
          setGuestMouth((prev) => ({
            ...prev,
            x: Number(normX.toFixed(3)),
            y: Number(normY.toFixed(3)),
          }));
        }
      }
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

  // Main Canvas Render Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Audio Energy Analyser
      let audioEnergy = 0;
      let formantPitch = 0;

      const analyser = studioAudio.getAnalyser();
      if (analyser && isPlaying) {
        const bufferLength = analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (timeData[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / bufferLength);

        let freqSum = 0;
        for (let i = 5; i < Math.min(60, bufferLength); i++) {
          freqSum += freqData[i];
        }
        formantPitch = freqSum / 55 / 255;
        audioEnergy = Math.min(1.0, rms * 4.4 * sensitivity);
      } else if (isPlaying) {
        audioEnergy =
          (Math.sin(elapsed * 11) * 0.45 + 0.5) *
          (Math.sin(elapsed * 3.8) * 0.35 + 0.6) *
          0.55;
      }

      currentOpenRef.current += (audioEnergy - currentOpenRef.current) * 0.48;
      const mouthOpen = Math.max(0, Math.min(1.0, currentOpenRef.current));

      // 2. Eye Blinking Logic
      eyeBlinkTimerRef.current += 1 / 60;
      if (eyeBlinkTimerRef.current > 4.0) {
        isBlinkingRef.current = true;
        if (eyeBlinkTimerRef.current > 4.13) {
          isBlinkingRef.current = false;
          eyeBlinkTimerRef.current = 0;
        }
      }

      // 3. Determine Active Speaker in Dual Mode
      let effectiveSpeaker: "interviewer" | "interviewee" = "interviewer";
      if (studioMode === "interview") {
        if (speakerMode === "auto") {
          // Turn alternates every ~5.2s during playback
          const turnIdx = Math.floor(elapsed / 5.2) % dialogueTurns.length;
          effectiveSpeaker = dialogueTurns[turnIdx]?.speaker || "interviewer";
        } else {
          effectiveSpeaker = speakerMode;
        }
      }

      // 4. Kinematics for Host and Guest (Articulated Neck & Head Motion)
      // Host motion: lifelike neck articulation (speech cadence nod + conversational tilt & sway)
      const isHostSpeaking = studioMode === "solo" ? isPlaying : isPlaying && effectiveSpeaker === "interviewer";
      let hostTargetNod = Math.sin(elapsed * 1.5) * 4.5;
      let hostTargetTilt = (studioMode === "interview" ? 0.025 : 0) + Math.sin(elapsed * 0.9) * 0.025;
      let hostTargetSway = Math.cos(elapsed * 0.8) * 2.0;

      if (isHostSpeaking) {
        const cadence = Math.sin(elapsed * 3.6);
        const kick = Math.sin(elapsed * 7.2) * Math.max(0, audioEnergy - 0.1);
        // Clear, lifelike neck nod on speech emphasis beats (up to 25px travel)
        hostTargetNod = cadence * 11.0 + kick * 14.0 + 4.0;
        // Expressive conversational head & neck tilt
        hostTargetTilt =
          (studioMode === "interview" ? 0.035 : 0) +
          Math.sin(elapsed * 1.5) * 0.05 +
          Math.cos(elapsed * 2.8) * 0.025 * audioEnergy;
        // Natural subtle torso and neck sway
        hostTargetSway = Math.sin(elapsed * 1.4) * 4.5 + Math.cos(elapsed * 2.8) * 2.2 * audioEnergy;
      } else if (studioMode === "interview" && isPlaying) {
        // Listening to guest with attentive responsive head nods
        hostTargetNod = Math.sin(elapsed * 2.0) * 8.0;
        hostTargetTilt = 0.035 + Math.sin(elapsed * 0.9) * 0.025;
        hostTargetSway = Math.cos(elapsed * 0.9) * 2.2;
      }

      hostMotionRef.current.nod += (hostTargetNod - hostMotionRef.current.nod) * 0.14;
      hostMotionRef.current.tilt += (hostTargetTilt - hostMotionRef.current.tilt) * 0.12;
      hostMotionRef.current.sway += (hostTargetSway - hostMotionRef.current.sway) * 0.12;

      // Guest motion (Interview mode): lifelike neck articulation
      const isGuestSpeaking = studioMode === "interview" && isPlaying && effectiveSpeaker === "interviewee";
      let guestTargetNod = Math.sin(elapsed * 1.5 + 1) * 4.5;
      let guestTargetTilt = -0.025 + Math.sin(elapsed * 0.9 + 1) * 0.025;
      let guestTargetSway = Math.cos(elapsed * 0.8 + 1) * 2.0;

      if (isGuestSpeaking) {
        const cadence = Math.sin(elapsed * 3.6);
        const kick = Math.sin(elapsed * 7.2) * Math.max(0, audioEnergy - 0.1);
        // Clear, lifelike neck nod on speech emphasis beats (up to 25px travel)
        guestTargetNod = cadence * 11.0 + kick * 14.0 + 4.0;
        // Expressive conversational head & neck tilt
        guestTargetTilt =
          -0.035 +
          Math.sin(elapsed * 1.5) * 0.05 +
          Math.cos(elapsed * 2.8) * 0.025 * audioEnergy;
        // Natural subtle torso and neck sway
        guestTargetSway = Math.sin(elapsed * 1.4) * 4.5 + Math.cos(elapsed * 2.8) * 2.2 * audioEnergy;
      } else if (isPlaying) {
        // Listening to host with attentive responsive head nods
        guestTargetNod = Math.sin(elapsed * 2.0 + 1.2) * 8.0;
        guestTargetTilt = -0.035 + Math.sin(elapsed * 0.9 + 1) * 0.025;
        guestTargetSway = Math.cos(elapsed * 0.9 + 1) * 2.2;
      }

      guestMotionRef.current.nod += (guestTargetNod - guestMotionRef.current.nod) * 0.14;
      guestMotionRef.current.tilt += (guestTargetTilt - guestMotionRef.current.tilt) * 0.12;
      guestMotionRef.current.sway += (guestTargetSway - guestMotionRef.current.sway) * 0.12;

      // 5. Clear & Render Background
      ctx.clearRect(0, 0, width, height);

      if (studioMode === "solo") {
        // Solo Mode Background - Stable & Steady
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#081b33");
        bgGrad.addColorStop(1, "#02070e");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        const imgHost = imageHostRef.current;
        if (imgHost && imgHost.complete && imgHost.naturalWidth > 0) {
          const targetH = height;
          const targetW = (imgHost.naturalWidth / imgHost.naturalHeight) * targetH;
          const imgX = (width - targetW) / 2;
          const imgY = 0;

          if (targetW < width) {
            ctx.save();
            ctx.filter = "blur(26px) brightness(0.65)";
            ctx.drawImage(imgHost, 0, 0, width, height);
            ctx.restore();
          }

          const currentPreset = AVATAR_PRESETS.find((p) => p.id === hostPresetId);
          drawAnchorAvatar({
            ctx,
            img: imgHost,
            bounds: { x: imgX, y: imgY, width: targetW, height: targetH },
            mouthConfig: hostMouth,
            eyesConfig: currentPreset?.eyesConfig,
            mouthOpen: mouthOpen,
            formantPitch,
            sensitivity,
            isBlinking: isBlinkingRef.current,
            tilt: hostMotionRef.current.tilt,
            nod: hostMotionRef.current.nod,
            sway: hostMotionRef.current.sway,
            showGuide: showMouthGuide,
            guideLabel: `ከንፈር (${Math.round(hostMouth.x * 100)}%, ${Math.round(hostMouth.y * 100)}%)`,
          });
        }
      } else {
        // Dual Interview Studio Background - 100% Rock-Solid & Stable (No pulsating/shifting)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#08111e");
        bgGrad.addColorStop(0.65, "#040810");
        bgGrad.addColorStop(1, "#020408");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Constant Steady Overhead Studio Keylights (Never flicker or shift)
        const leftLight = ctx.createRadialGradient(340, 0, 20, 340, 300, 480);
        leftLight.addColorStop(0, "rgba(245, 158, 11, 0.12)");
        leftLight.addColorStop(1, "rgba(245, 158, 11, 0)");
        ctx.fillStyle = leftLight;
        ctx.fillRect(0, 0, width, height);

        const rightLight = ctx.createRadialGradient(940, 0, 20, 940, 300, 480);
        rightLight.addColorStop(0, "rgba(56, 189, 248, 0.12)");
        rightLight.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = rightLight;
        ctx.fillRect(0, 0, width, height);

        // Center Newsroom Video Monitor Wall - Steady Grid Design
        ctx.save();
        ctx.fillStyle = "rgba(10, 20, 35, 0.65)";
        ctx.beginPath();
        ctx.roundRect(width * 0.28, 40, width * 0.44, 280, 16);
        ctx.fill();
        ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.strokeStyle = "rgba(56, 189, 248, 0.08)";
        ctx.lineWidth = 1;
        for (let gy = 60; gy < 300; gy += 25) {
          ctx.beginPath();
          ctx.moveTo(width * 0.29, gy);
          ctx.lineTo(width * 0.71, gy);
          ctx.stroke();
        }
        for (let gx = width * 0.31; gx < width * 0.71; gx += 40) {
          ctx.beginPath();
          ctx.moveTo(gx, 50);
          ctx.lineTo(gx, 310);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(56, 189, 248, 0.85)";
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.fillText("STUDIO INTERVIEW DESK", width * 0.5, 75);

        // Fixed elegant studio monitor graphic (rock-solid, no jitter)
        for (let b = 0; b < 24; b++) {
          const barH = 14 + (b % 5) * 4;
          ctx.fillStyle = b % 2 === 0 ? "rgba(245, 158, 11, 0.35)" : "rgba(56, 189, 248, 0.35)";
          ctx.fillRect(width * 0.36 + b * 15, 230 - barH, 9, barH);
        }
        ctx.restore();

        // 6. Draw Left Avatar (ጠያቂ / Host)
        const imgHost = imageHostRef.current;
        if (imgHost && imgHost.complete && imgHost.naturalWidth > 0) {
          const hostPreset = AVATAR_PRESETS.find((p) => p.id === hostPresetId);
          drawAnchorAvatar({
            ctx,
            img: imgHost,
            bounds: { x: 70, y: 35, width: 540, height: 660 },
            mouthConfig: hostMouth,
            eyesConfig: hostPreset?.eyesConfig,
            mouthOpen: isHostSpeaking ? mouthOpen : 0,
            formantPitch,
            sensitivity,
            isBlinking: isBlinkingRef.current,
            tilt: hostMotionRef.current.tilt,
            nod: hostMotionRef.current.nod,
            sway: hostMotionRef.current.sway,
            showGuide: showMouthGuide && activeConfigTab === "host",
            guideLabel: `ጠያቂ (${Math.round(hostMouth.x * 100)}%)`,
          });
        }

        // 7. Draw Right Avatar (ተጠያቂ / Guest Analyst)
        const imgGuest = imageGuestRef.current;
        if (imgGuest && imgGuest.complete && imgGuest.naturalWidth > 0) {
          const guestPreset = AVATAR_PRESETS.find((p) => p.id === guestPresetId);
          drawAnchorAvatar({
            ctx,
            img: imgGuest,
            bounds: { x: 670, y: 35, width: 540, height: 660 },
            mouthConfig: guestMouth,
            eyesConfig: guestPreset?.eyesConfig,
            mouthOpen: isGuestSpeaking ? mouthOpen : 0,
            formantPitch,
            sensitivity,
            isBlinking: isBlinkingRef.current,
            tilt: guestMotionRef.current.tilt,
            nod: guestMotionRef.current.nod,
            sway: guestMotionRef.current.sway,
            showGuide: showMouthGuide && activeConfigTab === "guest",
            guideLabel: `ተጠያቂ (${Math.round(guestMouth.x * 100)}%)`,
          });
        }

        // 8. Foreground Studio Curved News Desk
        const deskY = height - 120;
        ctx.save();
        const deskGrad = ctx.createLinearGradient(0, deskY, 0, height);
        deskGrad.addColorStop(0, "rgba(15, 23, 42, 0.95)");
        deskGrad.addColorStop(0.3, "rgba(10, 15, 30, 0.98)");
        deskGrad.addColorStop(1, "rgba(3, 7, 18, 1)");
        ctx.fillStyle = deskGrad;

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, deskY + 30);
        ctx.bezierCurveTo(width * 0.25, deskY, width * 0.75, deskY, width, deskY + 30);
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Glowing LED strip along desk edge
        ctx.beginPath();
        ctx.moveTo(0, deskY + 30);
        ctx.bezierCurveTo(width * 0.25, deskY, width * 0.75, deskY, width, deskY + 30);
        ctx.strokeStyle = "rgba(245, 158, 11, 0.65)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Host Placard (Left)
        const leftX = width * 0.28;
        ctx.fillStyle = isHostSpeaking ? "rgba(245, 158, 11, 0.18)" : "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.roundRect(leftX - 140, deskY + 45, 280, 44, 10);
        ctx.fill();
        ctx.strokeStyle = isHostSpeaking ? "#f59e0b" : "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = isHostSpeaking ? 2 : 1;
        ctx.stroke();

        if (isHostSpeaking) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(leftX - 115, deskY + 67, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = isHostSpeaking ? "#fef08a" : "#e2e8f0";
        ctx.font = 'bold 13px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(`🎙️ ጠያቂ  |  ${hostName}`, leftX + (isHostSpeaking ? 6 : 0), deskY + 72);

        // Guest Placard (Right)
        const rightX = width * 0.72;
        ctx.fillStyle = isGuestSpeaking ? "rgba(56, 189, 248, 0.18)" : "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.roundRect(rightX - 140, deskY + 45, 280, 44, 10);
        ctx.fill();
        ctx.strokeStyle = isGuestSpeaking ? "#38bdf8" : "rgba(148, 163, 184, 0.25)";
        ctx.lineWidth = isGuestSpeaking ? 2 : 1;
        ctx.stroke();

        if (isGuestSpeaking) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(rightX - 115, deskY + 67, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = isGuestSpeaking ? "#bae6fd" : "#e2e8f0";
        ctx.font = 'bold 13px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
        ctx.textAlign = "center";
        ctx.fillText(`💡 ተጠያቂ  |  ${guestName}`, rightX + (isGuestSpeaking ? 6 : 0), deskY + 72);

        ctx.restore();
      }

      // 8.5 Continuous TV Scrolling News Ticker Tape (CNN/BBC Broadcast Style)
      const tickerH = 40;
      const tickerY = height - tickerH;

      ctx.save();
      // Dark high-contrast broadcast ticker bar
      ctx.fillStyle = "rgba(7, 11, 22, 0.96)";
      ctx.fillRect(0, tickerY, width, tickerH);

      // Top accent divider
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(0, tickerY, width, 2.5);

      // Red Breaking News Left Badge
      const badgeW = 145;
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(0, tickerY, badgeW, tickerH);

      // Left Badge Text
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 13px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("🔴 ሰበር ዜና", badgeW / 2, tickerY + 25);

      // Clipping Region for Horizontally Scrolling News Text
      ctx.beginPath();
      ctx.rect(badgeW + 12, tickerY, width - badgeW - 12, tickerH);
      ctx.clip();

      const rawText = (script || activeHeadline || "የቀጥታ ስቱዲዮ ዜና ስርጭት")
        .replace(/^(ጠያቂ|ተጠያቂ|ተንታኝ|guest|host|interviewer|analyst)[፦:]\s*/gim, "")
        .replace(/\r?\n+/g, "   ◄►   ")
        .trim();
      const tickerUnit = `${activeHeadline ? `【 ${activeHeadline} 】   ` : ""}${rawText}   ◄►   `;

      ctx.font = 'bold 15px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
      ctx.textAlign = "left";
      const unitWidth = Math.max(200, ctx.measureText(tickerUnit).width);
      const scrollSpeed = 85; // px / sec
      const offset = (elapsed * scrollSpeed) % unitWidth;

      for (let tx = badgeW + 16 - offset; tx < width + unitWidth; tx += unitWidth) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(tickerUnit, tx, tickerY + 25);
      }
      ctx.restore();

      // 9. TV Top Overlays (LIVE badge and channel logo)
      // Top-Left "LIVE ON AIR"
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.beginPath();
      ctx.roundRect(24, 24, 160, 36, 8);
      ctx.fill();

      ctx.fillStyle = isPlaying ? "#ef4444" : "#71717a";
      ctx.beginPath();
      ctx.arc(42, 42, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 12px "Nyala", "Noto Sans Ethiopic", system-ui, sans-serif';
      const liveLabel = isPlaying
        ? studioMode === "interview"
          ? "ቀጥታ ውይይት"
          : "ቀጥታ ስርጭት"
        : "ስቱዲዮ ዝግጁ";
      ctx.fillText(liveLabel, 56, 46);
      ctx.restore();

      // Top-Right Channel Bug
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(width - 165, 24, 140, 36, 8);
      ctx.fill();

      ctx.fillStyle =
        broadcastBadge === "prime"
          ? "#f59e0b"
          : broadcastBadge === "global"
          ? "#38bdf8"
          : "#ef4444";
      ctx.font = "900 13px system-ui, sans-serif";
      const logoText =
        broadcastBadge === "prime"
          ? "PRIME NEWS"
          : broadcastBadge === "global"
          ? "GLOBAL 24"
          : "LIVE DESK";
      ctx.fillText(logoText, width - 150, 46);
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
    studioMode,
    hostPresetId,
    guestPresetId,
    hostMouth,
    guestMouth,
    showMouthGuide,
    broadcastBadge,
    speakerMode,
    hostName,
    guestName,
    dialogueTurns,
    activeConfigTab,
    script,
    activeHeadline,
  ]);

  // Video Recording Logic
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(30);
      const audioStream = studioAudio.getMediaStreamDestination();
      if (audioStream && audioStream.stream) {
        const audioTracks = audioStream.stream.getAudioTracks();
        if (audioTracks.length > 0) {
          stream.addTrack(audioTracks[0]);
        }
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 3500000,
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        downloadDirectVideo(blob, studioMode === "interview" ? "interview_broadcast" : "anchor_broadcast");
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
    }
  };

  const handleDownloadVideo = () => {
    if (recordedBlob) {
      downloadDirectVideo(
        recordedBlob,
        studioMode === "interview" ? "interview_broadcast" : "anchor_broadcast"
      );
    }
  };

  const handleLoadSampleDialogue = () => {
    if (onUpdateScript) {
      onUpdateScript(SAMPLE_INTERVIEW_SCRIPT);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="p-3 sm:p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>
                  {studioMode === "interview"
                    ? isEn
                      ? "Dual Avatar Interview & Analysis Desk"
                      : "የሁለት አቫተሮች ቃለ-መጠይቅና ውይይት ስቱዲዮ"
                    : isEn
                    ? "Solo Anchor Studio"
                    : "ነጠላ አቅራቢ ስቱዲዮ"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-extrabold uppercase">
                  {studioMode === "interview" ? "DUAL INTERVIEW" : "SOLO ANCHOR"}
                </span>
              </h2>
            </div>
          </div>

          {/* Mode Switcher: Solo vs Interview */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
              <button
                type="button"
                onClick={() => setStudioMode("interview")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioMode === "interview"
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isEn ? "Interview (Dual)" : "ቃለ-መጠይቅ (ድርብ)"}</span>
              </button>
              <button
                type="button"
                onClick={() => setStudioMode("solo")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  studioMode === "solo"
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{isEn ? "Solo" : "ነጠላ"}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto">
          {/* Main Visualizer Stage (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* The 16:9 Canvas Stage */}
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

              {/* Recording Indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-mono font-bold shadow-lg shadow-red-950/80 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>REC {recordSeconds}s</span>
                </div>
              )}

              {/* Mouth Calibration Overlay Hint */}
              {showMouthGuide && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/85 border border-amber-500/80 text-amber-300 text-[11px] font-medium backdrop-blur-md pointer-events-none shadow-lg">
                  {isEn
                    ? "Click on the face to adjust mouth position"
                    : "የከንፈሩን ቦታ ለማስተካከል ፊቱ ላይ ይጫኑ"}
                </div>
              )}
            </div>

            {/* Stage Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              {/* Play / Record Action Buttons */}
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
                    <span>{isEn ? "Start Dialogue" : "ውይይቱን ጀምር"}</span>
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

              {/* Speaker Selector in Dual Interview Mode */}
              {studioMode === "interview" && (
                <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <span className="text-[11px] text-neutral-400 px-1 font-medium">
                    {isEn ? "Speaker:" : "ተናጋሪ፦"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSpeakerMode("auto")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      speakerMode === "auto"
                        ? "bg-amber-500 text-neutral-950 shadow-sm"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    {isEn ? "Auto Turns" : "በየተራ (Auto)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeakerMode("interviewer")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      speakerMode === "interviewer"
                        ? "bg-amber-500 text-neutral-950 shadow-sm"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    🎙️ {isEn ? "Host" : "ጠያቂ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeakerMode("interviewee")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      speakerMode === "interviewee"
                        ? "bg-cyan-500 text-neutral-950 shadow-sm"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    💡 {isEn ? "Guest" : "ተጠያቂ"}
                  </button>
                </div>
              )}

              {/* Download & Calibration */}
              <div className="flex items-center gap-2">
                {recordedBlob && (
                  <button
                    type="button"
                    onClick={handleDownloadVideo}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEn ? "Download MP4" : "ቪዲዮውን አውርድ"}</span>
                  </button>
                )}

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

          {/* Right Control & Custom Configuration Panel (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* Dual Interview Quick Script Loader */}
            {studioMode === "interview" && (
              <div className="p-3 rounded-xl bg-neutral-950 border border-amber-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {isEn ? "Sample Q&A Dialogue" : "የውይይት ቃለ-መጠይቅ ስክሪፕት"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSampleDialogue}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-all cursor-pointer shadow-sm"
                >
                  {isEn ? "Load" : "ስክሪፕት ሙላ"}
                </button>
              </div>
            )}

            {/* In Interview mode: Tab Switcher for Configuring Host vs Guest */}
            {studioMode === "interview" && (
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveConfigTab("host")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeConfigTab === "host"
                      ? "bg-amber-500 text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isEn ? "Host (Left)" : "ጠያቂ (ግራ)"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveConfigTab("guest")}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeConfigTab === "guest"
                      ? "bg-cyan-500 text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEn ? "Guest (Right)" : "ተጠያቂ (ቀኝ)"}</span>
                </button>
              </div>
            )}

            {/* Custom Photo Upload Card for Active Role */}
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {studioMode === "interview"
                      ? activeConfigTab === "host"
                        ? isEn
                          ? "Upload Host Photo"
                          : "የጠያቂ ፎቶ አስገባ"
                        : isEn
                        ? "Upload Guest Photo"
                        : "የተጠያቂ ፎቶ አስገባ"
                      : isEn
                      ? "Upload Photo"
                      : "የገዛ ፎቶ አስገባ"}
                  </span>
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">PNG/JPG</span>
              </div>

              <input
                ref={fileInputHostRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "host")}
                className="hidden"
              />
              <input
                ref={fileInputGuestRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "guest")}
                className="hidden"
              />

              <div
                onClick={() => {
                  if (studioMode === "solo" || activeConfigTab === "host") {
                    fileInputHostRef.current?.click();
                  } else {
                    fileInputGuestRef.current?.click();
                  }
                }}
                className="p-3 rounded-xl border-2 border-dashed border-neutral-800 hover:border-amber-500/80 bg-neutral-900/50 hover:bg-neutral-900 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-1 group"
              >
                <Upload className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
                <p className="text-xs font-bold text-neutral-200">
                  {isEn ? "Click to upload face / character" : "ፎቶ ለመምረጥ እዚህ ይጫኑ"}
                </p>
              </div>
            </div>

            {/* Presets Grid for Active Role */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider block pb-1 border-b border-neutral-800">
                {studioMode === "interview"
                  ? activeConfigTab === "host"
                    ? isEn
                      ? "Select Host Character"
                      : "የጠያቂ ገፀ-ባህሪ ይምረጡ"
                    : isEn
                    ? "Select Guest Character"
                    : "የተጠያቂ ገፀ-ባህሪ ይምረጡ"
                  : isEn
                  ? "Select Character"
                  : "ገፀ-ባህሪ ይምረጡ"}
              </span>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-0.5">
                {AVATAR_PRESETS.map((p) => {
                  const currentSelectedId =
                    studioMode === "solo" || activeConfigTab === "host"
                      ? hostPresetId
                      : guestPresetId;
                  const isSelected = currentSelectedId === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() =>
                        handleSelectPreset(
                          p,
                          studioMode === "solo" || activeConfigTab === "host"
                            ? "host"
                            : "guest"
                        )
                      }
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? "bg-neutral-900 border-amber-500 ring-1 ring-amber-500 shadow-md"
                          : "bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900"
                      }`}
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.nameAmharic}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border border-neutral-700"
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

            {/* Lip-Sync Tuning for Active Role */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {studioMode === "interview"
                      ? activeConfigTab === "host"
                        ? isEn
                          ? "Host Lip-Sync"
                          : "የጠያቂ ከንፈር ማስተካከያ"
                        : isEn
                        ? "Guest Lip-Sync"
                        : "የተጠያቂ ከንፈር ማስተካከያ"
                      : isEn
                      ? "Lip-Sync Tuning"
                      : "የከንፈር ማስተካከያ"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleResetCalibration(
                      studioMode === "solo" || activeConfigTab === "host" ? "host" : "guest"
                    )
                  }
                  className="text-[10px] text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{isEn ? "Reset" : "መልስ"}</span>
                </button>
              </div>

              {/* Mouth Vertical Position (Calibration) */}
              {(() => {
                const currentMouth =
                  studioMode === "solo" || activeConfigTab === "host"
                    ? hostMouth
                    : guestMouth;
                const setMouth =
                  studioMode === "solo" || activeConfigTab === "host"
                    ? setHostMouth
                    : setGuestMouth;

                return (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                        <span>{isEn ? "Mouth Height (Y):" : "የከንፈር ቁመት (Y)፦"}</span>
                        <span className="font-mono text-amber-400 font-bold">
                          {Math.round(currentMouth.y * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.15"
                        max="0.75"
                        step="0.005"
                        value={currentMouth.y}
                        onChange={(e) =>
                          setMouth((prev) => ({ ...prev, y: parseFloat(e.target.value) }))
                        }
                        className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                        <span>{isEn ? "Mouth Width:" : "የከንፈር ስፋት፦"}</span>
                        <span className="font-mono text-neutral-400 font-bold">
                          {Math.round(currentMouth.width * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.04"
                        max="0.20"
                        step="0.004"
                        value={currentMouth.width}
                        onChange={(e) =>
                          setMouth((prev) => ({
                            ...prev,
                            width: parseFloat(e.target.value),
                          }))
                        }
                        className="w-full accent-amber-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </>
                );
              })()}

              {/* Audio Lip-Sync Sensitivity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-neutral-300 font-medium">
                  <span>{isEn ? "Voice Sensitivity:" : "የድምፅ ምላሽ ፍጥነት፦"}</span>
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

              {/* Broadcast Channel Badge */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-1">
                <span className="text-[11px] text-neutral-400">
                  {isEn ? "Channel Bug:" : "የስቱዲዮ መለያ፦"}
                </span>
                <div className="flex items-center gap-1">
                  {(["prime", "global", "live24"] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBroadcastBadge(b)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                        broadcastBadge === b
                          ? "bg-amber-500 text-neutral-950 font-black shadow-sm"
                          : "bg-neutral-900 text-neutral-400 hover:text-white"
                      }`}
                    >
                      {b === "prime" ? "PRIME" : b === "global" ? "GLOBAL" : "LIVE 24"}
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
