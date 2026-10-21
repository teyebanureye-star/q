import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  X,
  Camera,
  Lightbulb,
  Radio,
  Sparkles,
  Flame,
  Globe,
  Coffee,
  Play,
  Square,
  Video,
  Download,
  Scissors,
  CircleDot,
  RotateCcw,
  Volume2,
  CheckCircle,
  Zap,
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

// Composites the 3D WebGL Canvas with high-fidelity broadcast news overlay (ON AIR + News Ticker + Anchor)
function createBroadcastCompositeStream(
  webglCanvas: HTMLCanvasElement,
  headline: string,
  anchor: string
): { stream: MediaStream; stop: () => void } {
  const width = 1280;
  const height = 720;
  const compCanvas = document.createElement("canvas");
  compCanvas.width = width;
  compCanvas.height = height;
  const ctx = compCanvas.getContext("2d")!;

  let animFrameId: number;
  let active = true;

  const draw = () => {
    if (!active) return;

    // 1. Draw 3D WebGL Studio Canvas
    try {
      ctx.drawImage(webglCanvas, 0, 0, width, height);
    } catch {
      // ignore
    }

    // 2. Top-Left ON AIR Live Badge
    ctx.fillStyle = "rgba(220, 38, 38, 0.95)";
    drawRoundedRect(ctx, 32, 28, 115, 34, 8);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("🔴 ON AIR", 46, 50);

    // 3. Top-Right 3D Studio Badge
    ctx.fillStyle = "rgba(10, 10, 15, 0.88)";
    drawRoundedRect(ctx, width - 250, 28, 218, 34, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("3D ቨርቹዋል ዜና ስቱዲዮ", width - 232, 50);

    // 4. Lower-Third Headline & Anchor Banner
    const barHeight = 84;
    const barY = height - barHeight - 36;

    // Card background
    ctx.fillStyle = "rgba(10, 10, 12, 0.90)";
    drawRoundedRect(ctx, 36, barY, width - 72, barHeight, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Amber Tag
    ctx.fillStyle = "#f59e0b";
    drawRoundedRect(ctx, 50, barY + 12, 112, 26, 6);
    ctx.fill();
    ctx.fillStyle = "#0a0a0a";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("በርዕሰ አንቀጽ", 63, barY + 29);

    // Headline Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px sans-serif";
    const cleanHeadline = headline || "የፋና ብሮድካስቲንግ የቀጥታ ዜና ስርጭት";
    const displayHeadline = cleanHeadline.length > 70 ? cleanHeadline.substring(0, 67) + "..." : cleanHeadline;
    ctx.fillText(displayHeadline, 176, barY + 31);

    // Subtitle / Anchor Tag
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText(`ፋና ብሮድካስቲንግ ኮርፖሬት • ${anchor || "የዜና አንባቢ"}`, 50, barY + 65);

    animFrameId = requestAnimationFrame(draw);
  };

  draw();

  const stream = compCanvas.captureStream(30);
  return {
    stream,
    stop: () => {
      active = false;
      cancelAnimationFrame(animFrameId);
    },
  };
}

export type StudioSetType = "prime" | "breaking" | "cyber" | "morning";

interface Virtual3DStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHeadline: string;
  anchorName: string;
  audioBlob?: Blob | null;
  audioUrl?: string | null;
  script?: string;
  isPlaying?: boolean;
  onPlayBroadcast?: () => void;
  onStopBroadcast?: () => void;
}

const STUDIO_SETS: {
  id: StudioSetType;
  labelAmharic: string;
  tag: string;
  desc: string;
  icon: any;
  accentColor: string;
}[] = [
  {
    id: "prime",
    labelAmharic: "🏛️ ዋና ዜና",
    tag: "PRIME",
    desc: "የተከበረ የዋና ዜና መድረክ ከሮያል ሰማያዊ ጀርባ ጋር",
    icon: Sparkles,
    accentColor: "border-amber-500 text-amber-300",
  },
  {
    id: "breaking",
    labelAmharic: "🚨 የሰበር ዜና ክፍል",
    tag: "ALERT",
    desc: "አስቸኳይ ቀይ መብራቶችና የሰበር ዜና ኮማንድ ዴስክ",
    icon: Flame,
    accentColor: "border-red-500 text-red-400",
  },
  {
    id: "cyber",
    labelAmharic: "🌐 ዓለም አቀፍ ሳይበር",
    tag: "CYBER",
    desc: "የሚሽከረከር 3D ዓለም ሉልና የሳይበር ግሪድ መድረክ",
    icon: Globe,
    accentColor: "border-cyan-500 text-cyan-300",
  },
  {
    id: "morning",
    labelAmharic: "☕ ማለዳና ውይይት",
    tag: "LOUNGE",
    desc: "የእንጨት ዲዛይን ያለው የማለዳ ዘገባና የውይይት ስቱዲዮ",
    icon: Coffee,
    accentColor: "border-orange-500 text-orange-300",
  },
];

export const Virtual3DStudioModal: React.FC<Virtual3DStudioModalProps> = ({
  isOpen,
  onClose,
  activeHeadline,
  anchorName,
  audioBlob,
  audioUrl,
  script,
  isPlaying,
  onPlayBroadcast,
  onStopBroadcast,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [studioSet, setStudioSet] = useState<StudioSetType>("prime");
  const [lightingMode, setLightingMode] = useState<"day" | "dramatic" | "night">("day");
  const [cameraView, setCameraView] = useState<"wide" | "anchor" | "overhead" | "auto">("auto");

  // Audio & Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isFastExporting, setIsFastExporting] = useState(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isLocalAudioPlaying, setIsLocalAudioPlaying] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCameraPos = useRef(new THREE.Vector3(0, 3, 9));
  const currentCameraPos = useRef(new THREE.Vector3(0, 3, 9));

  const setGroupRef = useRef<THREE.Group | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const onAirLightRef = useRef<THREE.PointLight | null>(null);

  // Recording & Streaming Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const compositeStreamRef = useRef<{ stream: MediaStream; stop: () => void } | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Build the 3D Set objects based on selected theme
  const buildStudioSet = (scene: THREE.Scene, theme: StudioSetType) => {
    if (setGroupRef.current) {
      scene.remove(setGroupRef.current);
      setGroupRef.current.traverse((child) => {
        if ((child as THREE.Mesh).geometry) {
          (child as THREE.Mesh).geometry.dispose();
        }
      });
      setGroupRef.current = null;
    }

    const setGroup = new THREE.Group();
    setGroupRef.current = setGroup;

    const metalMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.1 });

    if (theme === "prime") {
      scene.background = new THREE.Color(0x0a0c14);

      const deskTopGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.15, 32, 1, false, 0, Math.PI);
      const deskTopMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.3, metalness: 0.6 });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 1.1, 0);
      deskTop.castShadow = true;
      setGroup.add(deskTop);

      const trimGeo = new THREE.CylinderGeometry(2.42, 2.42, 0.05, 32, 1, false, 0, Math.PI);
      const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6 });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(0, 1.15, 0);
      setGroup.add(trim);

      const wallGeo = new THREE.CylinderGeometry(7.5, 7.5, 4.8, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.4,
        metalness: 0.6,
        side: THREE.BackSide,
        emissive: 0x1e3a8a,
        emissiveIntensity: 0.25,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 2.4, 0);
      setGroup.add(wall);

      const gridHelper = new THREE.PolarGridHelper(7.5, 8, 8, 64, 0x3b82f6, 0x1e293b);
      gridHelper.position.set(0, 0.01, 0);
      setGroup.add(gridHelper);
    } else if (theme === "breaking") {
      scene.background = new THREE.Color(0x160505);

      const deskTopGeo = new THREE.BoxGeometry(4.2, 0.15, 1.6);
      const deskTopMat = new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.2,
        metalness: 0.8,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 1.1, 0);
      setGroup.add(deskTop);

      const neonGeo = new THREE.BoxGeometry(4.3, 0.04, 1.65);
      const neonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.2 });
      const neon = new THREE.Mesh(neonGeo, neonMat);
      neon.position.set(0, 1.18, 0);
      setGroup.add(neon);

      const wallGeo = new THREE.CylinderGeometry(7.5, 7.5, 4.8, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x220505,
        roughness: 0.5,
        side: THREE.BackSide,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.35,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 2.4, 0);
      setGroup.add(wall);

      const gridHelper = new THREE.GridHelper(16, 20, 0xef4444, 0x450a0a);
      gridHelper.position.set(0, 0.01, 0);
      setGroup.add(gridHelper);
    } else if (theme === "cyber") {
      scene.background = new THREE.Color(0x020617);

      const globeGeo = new THREE.SphereGeometry(1.6, 24, 24);
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        wireframe: true,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      globe.position.set(0, 3.2, -1.8);
      globeMeshRef.current = globe;
      setGroup.add(globe);

      const deskTopGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.1, 32, 1, false, 0, Math.PI);
      const deskTopMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.9,
        emissive: 0x0e7490,
        emissiveIntensity: 0.2,
      });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 1.1, 0);
      setGroup.add(deskTop);

      const gridHelper = new THREE.GridHelper(18, 24, 0x06b6d4, 0x164e63);
      gridHelper.position.set(0, 0.01, 0);
      setGroup.add(gridHelper);
    } else {
      scene.background = new THREE.Color(0x18130e);

      const deskTopGeo = new THREE.CylinderGeometry(2.6, 2.8, 0.18, 32, 1, false, 0, Math.PI);
      const deskTopMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6, metalness: 0.1 });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 1.1, 0);
      setGroup.add(deskTop);

      const wallGeo = new THREE.CylinderGeometry(7.5, 7.5, 4.8, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x271a10,
        roughness: 0.7,
        side: THREE.BackSide,
        emissive: 0x451a03,
        emissiveIntensity: 0.25,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 2.4, 0);
      setGroup.add(wall);

      const floorGeo = new THREE.PlaneGeometry(16, 16);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
      const floor = new THREE.Mesh(floorGeo, floorMat);
      floor.rotation.x = -Math.PI / 2;
      setGroup.add(floor);
    }

    // Anchor Microphones
    [-0.6, 0.6].forEach((xPos) => {
      const standGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 12);
      const stand = new THREE.Mesh(standGeo, metalMat);
      stand.position.set(xPos, 1.35, 0.3);

      const micHeadGeo = new THREE.SphereGeometry(0.04, 12, 12);
      const micHead = new THREE.Mesh(micHeadGeo, chromeMat);
      micHead.position.set(xPos, 1.55, 0.3);

      setGroup.add(stand);
      setGroup.add(micHead);
    });

    // Studio Camera Rig
    const camBoxGeo = new THREE.BoxGeometry(0.3, 0.35, 0.5);
    const camBox = new THREE.Mesh(camBoxGeo, metalMat);
    camBox.position.set(2.8, 1.7, 4.2);
    camBox.lookAt(0, 1.2, 0);

    const tallyGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const tallyMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const tally = new THREE.Mesh(tallyGeo, tallyMat);
    tally.position.set(2.8, 1.95, 4.2);
    setGroup.add(camBox);
    setGroup.add(tally);

    scene.add(setGroup);
  };

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 3, 9);
    cameraRef.current = camera;
    currentCameraPos.current.set(0, 3, 9);
    targetCameraPos.current.set(0, 3, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const onAirLight = new THREE.PointLight(0xef4444, 2.2, 12);
    onAirLight.position.set(0, 4.5, 0);
    scene.add(onAirLight);
    onAirLightRef.current = onAirLight;

    buildStudioSet(scene, studioSet);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Camera transitions / director movement
      if (cameraView === "auto") {
        // Slow cinematic sweep
        const radius = 7.5 + Math.sin(elapsed * 0.25) * 1.5;
        const angle = Math.sin(elapsed * 0.15) * 0.45;
        targetCameraPos.current.x = Math.sin(angle) * radius;
        targetCameraPos.current.z = Math.cos(angle) * radius;
        targetCameraPos.current.y = 2.4 + Math.sin(elapsed * 0.2) * 0.6;
      }

      currentCameraPos.current.lerp(targetCameraPos.current, 1 - Math.exp(-4.5 * dt));
      camera.position.copy(currentCameraPos.current);
      camera.lookAt(0, 1.2, 0);

      // Rotate cyber globe if active
      if (globeMeshRef.current) {
        globeMeshRef.current.rotation.y += 0.8 * dt;
      }

      // Subtle on-air pulse
      if (onAirLightRef.current) {
        onAirLightRef.current.intensity = 2.0 + Math.sin(elapsed * 3.5) * 0.8;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle Studio Set Change
  const handleChangeSet = (newSet: StudioSetType) => {
    setStudioSet(newSet);
    if (sceneRef.current) {
      buildStudioSet(sceneRef.current, newSet);
    }
  };

  // Handle Camera Presets
  const setCameraPreset = (view: "wide" | "anchor" | "overhead" | "auto") => {
    setCameraView(view);
    if (view === "wide") {
      targetCameraPos.current.set(0, 3, 9);
    } else if (view === "anchor") {
      targetCameraPos.current.set(0, 1.7, 3.8);
    } else if (view === "overhead") {
      targetCameraPos.current.set(0, 8, 5);
    }
  };

  // Handle Lighting
  const setLightingPreset = (mode: "day" | "dramatic" | "night") => {
    setLightingMode(mode);
    if (!keyLightRef.current) return;

    if (mode === "day") {
      keyLightRef.current.color.setHex(0xffeedd);
      keyLightRef.current.intensity = 2.2;
    } else if (mode === "dramatic") {
      keyLightRef.current.color.setHex(0xff3322);
      keyLightRef.current.intensity = 2.8;
    } else if (mode === "night") {
      keyLightRef.current.color.setHex(0x38bdf8);
      keyLightRef.current.intensity = 1.7;
    }
  };

  // Play / Pause news broadcast audio inside 3D Studio
  const handleTogglePlay = async () => {
    if (isLocalAudioPlaying || isPlaying) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (onStopBroadcast) {
        onStopBroadcast();
      }
      setIsLocalAudioPlaying(false);
    } else {
      let resolvedAudioUrl = audioUrl;
      if (!resolvedAudioUrl && audioBlob) {
        resolvedAudioUrl = URL.createObjectURL(audioBlob);
      }

      if (resolvedAudioUrl) {
        const audio = new Audio(resolvedAudioUrl);
        audioElementRef.current = audio;
        audio.onended = () => setIsLocalAudioPlaying(false);
        await audio.play().catch(() => {});
        setIsLocalAudioPlaying(true);
      } else if (onPlayBroadcast) {
        onPlayBroadcast();
        setIsLocalAudioPlaying(true);
      }
    }
  };

  // Start HD 3D Studio Recording with Broadcast Graphics & Audio Merge
  const handleStartRecording = async (maxDurationSeconds?: number) => {
    if (!rendererRef.current?.domElement) return;

    try {
      recordedChunksRef.current = [];
      const canvas = rendererRef.current.domElement;

      // Create composite stream with live TV broadcast overlay
      let videoStream: MediaStream;
      try {
        const comp = createBroadcastCompositeStream(
          canvas,
          activeHeadline,
          anchorName
        );
        compositeStreamRef.current = comp;
        videoStream = comp.stream;
      } catch (e) {
        console.warn("Composite stream fallback:", e);
        videoStream = canvas.captureStream(30);
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtx();
      audioContextRef.current = actx;
      const dest = actx.createMediaStreamDestination();

      let resolvedAudioUrl = audioUrl;
      if (!resolvedAudioUrl && audioBlob) {
        resolvedAudioUrl = URL.createObjectURL(audioBlob);
      }
      if (!resolvedAudioUrl) {
        resolvedAudioUrl = "/audio/sample_dawit_news.wav";
      }

      if (resolvedAudioUrl) {
        try {
          const resp = await fetch(resolvedAudioUrl);
          const ab = await resp.arrayBuffer();
          const audioBuffer = await actx.decodeAudioData(ab);
          const bufferSource = actx.createBufferSource();
          bufferSource.buffer = audioBuffer;
          bufferSource.connect(dest);
          bufferSource.connect(actx.destination);
          bufferSource.onended = () => {
            handleStopRecording();
          };
          bufferSource.start();
          audioBufferSourceRef.current = bufferSource;
          setIsLocalAudioPlaying(true);
        } catch (audioErr) {
          console.warn("Audio buffer fallback:", audioErr);
          const audio = new Audio(resolvedAudioUrl);
          audio.crossOrigin = "anonymous";
          audioElementRef.current = audio;
          try {
            const source = actx.createMediaElementSource(audio);
            source.connect(dest);
            source.connect(actx.destination);
          } catch {}
          audio.onended = () => handleStopRecording();
          await audio.play().catch(() => {});
          setIsLocalAudioPlaying(true);
        }
      } else if (onPlayBroadcast) {
        onPlayBroadcast();
        setIsLocalAudioPlaying(true);
      }

      const tracks: MediaStreamTrack[] = [...videoStream.getVideoTracks()];
      const audioTracks = dest.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        tracks.push(...audioTracks);
      }

      const combinedStream = new MediaStream(tracks);

      let mimeType = "video/webm;codecs=vp9,opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4";
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 3500000,
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        setRecordedVideoBlob(blob);
        setIsRecording(false);
        setIsFastExporting(false);
        setIsLocalAudioPlaying(false);
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }

        // DIRECT DOWNLOAD TO DEVICE IMMEDIATELY without preconditions
        downloadDirectVideo(blob, "fana_3d_studio_broadcast");
        setDownloadSuccessMsg("ቪዲዮው ያለምንም ቅድመ ሁኔታ በቀጥታ ወደ ዲቫይስዎ ወርዶ ተቀምጧል!");
        setTimeout(() => {
          setDownloadSuccessMsg(null);
        }, 5000);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordedVideoBlob(null);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);

      if (maxDurationSeconds && maxDurationSeconds > 0) {
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            handleStopRecording();
          }
        }, maxDurationSeconds * 1000);
      }
    } catch (err) {
      console.error("3D Studio Recording error:", err);
      setIsRecording(false);
      setIsFastExporting(false);
    }
  };

  const handleStopRecording = () => {
    if (compositeStreamRef.current) {
      compositeStreamRef.current.stop();
      compositeStreamRef.current = null;
    }
    if (audioBufferSourceRef.current) {
      try {
        audioBufferSourceRef.current.stop();
      } catch {}
      audioBufferSourceRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (onStopBroadcast) {
      onStopBroadcast();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    setIsLocalAudioPlaying(false);
    setIsRecording(false);
    setIsFastExporting(false);
  };

  // Direct Fast 1-Click Video Download (e.g. 7 seconds broadcast preview clip directly to device)
  const handleDirectFastDownload = async (durationSecs: number = 7) => {
    if (isRecording || isFastExporting) {
      handleStopRecording();
      return;
    }
    setIsFastExporting(true);
    await handleStartRecording(durationSecs);
  };

  if (!isOpen) return null;

  const isLiveAudioActive = isLocalAudioPlaying || isPlaying;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-neutral-950 border border-neutral-700/80 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[850px] overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Top Header & Quick Action Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/60">
              <Radio className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                3D ቨርቹዋል ዜና ስቱዲዮ
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isLiveAudioActive || isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-neutral-800 text-neutral-400"
              }`}>
                ON AIR
              </span>
            </div>
          </div>

          {/* Action Buttons: Play, Direct Download, Record, Export & Close */}
          <div className="flex items-center gap-2">
            {/* Recording Timer Badge */}
            {isRecording && (
              <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-700 px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-red-200">
                <CircleDot className="w-3.5 h-3.5 text-red-400 animate-ping" />
                <span>REC {formatTime(recordSeconds)}</span>
              </div>
            )}

            {/* Direct Instant Video Download Button */}
            <button
              type="button"
              onClick={() => handleDirectFastDownload(7)}
              disabled={isFastExporting}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md ${
                isFastExporting
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-950/60"
              }`}
              title="ያለምንም ቅድመ ሁኔታ ቪዲዮውን በቀጥታ ወደ ዲቫይስዎ ያውርዱ"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isFastExporting ? "በማውረድ ላይ..." : "በቀጥታ ቪዲዮ አውርድ"}</span>
            </button>

            {/* Play/Stop Audio Button */}
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isLiveAudioActive
                  ? "bg-amber-500 text-neutral-950 shadow-md"
                  : "bg-neutral-900 border border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-800"
              }`}
            >
              {isLiveAudioActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveAudioActive ? "አቁም" : "አጫውት"}</span>
            </button>

            {/* Record 3D Video Button (Auto-downloads upon stop) */}
            {!isRecording ? (
              <button
                type="button"
                onClick={() => handleStartRecording()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md transition-all cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>ቪዲዮ ቅረጽ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 border border-red-500 text-red-300 transition-all cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 text-red-400" />
                <span>ቀረጻ አቁም & አውርድ</span>
              </button>
            )}

            {/* Re-Download Video Button (if already recorded) */}
            {recordedVideoBlob && (
              <button
                type="button"
                onClick={() => downloadDirectVideo(recordedVideoBlob, "fana_3d_studio_broadcast")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md transition-all cursor-pointer"
                title="ቪዲዮውን በድጋሚ ያውርዱ"
              >
                <Download className="w-3.5 h-3.5" />
                <span>በድጋሚ አውርድ</span>
              </button>
            )}

            {/* CapCut Launcher Button */}
            {recordedVideoBlob && (
              <button
                type="button"
                onClick={() =>
                  openCapCutWithMedia({
                    blob: recordedVideoBlob,
                    filename: `3d_studio_news_${Date.now()}.mp4`,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 hover:bg-neutral-800 border border-cyan-500/60 text-cyan-300 shadow-md transition-all cursor-pointer"
              >
                <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                <span>CapCut</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Export Status Banner */}
        {isFastExporting && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-neutral-900/95 border border-emerald-500/80 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs text-white">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">
              ቪዲዮው በቀጥታ ወደ ዲቫይስዎ እየወረደ ነው... ({recordSeconds}s)
            </span>
            <button
              type="button"
              onClick={handleStopRecording}
              className="px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs cursor-pointer shadow-md"
            >
              አሁን አውርድና ጨርስ
            </button>
          </div>
        )}

        {/* Download Success Notification */}
        {downloadSuccessMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-emerald-950/95 border border-emerald-500 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs text-emerald-200 animate-fade-in font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{downloadSuccessMsg}</span>
          </div>
        )}

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className="w-full flex-1 relative cursor-grab active:cursor-grabbing" />

        {/* Live Headline Ticker on 3D Studio */}
        <div className="absolute top-16 left-3 right-3 z-10 pointer-events-none">
          <div className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-sm max-w-xl mx-auto flex items-center gap-2.5 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-bold uppercase text-[10px] shrink-0">
              በርዕሰ አንቀጽ
            </span>
            <span className="font-semibold text-neutral-200 truncate font-sans">
              {activeHeadline || "የዜና አንባቢ ስቱዲዮው የቀጥታ ስርጭት"}
            </span>
          </div>
        </div>

        {/* Floating Controls Dock: Studio Set Selector + Camera + Lighting */}
        <div className="absolute bottom-3 left-3 right-3 z-20 space-y-2 max-w-4xl mx-auto">
          {/* Row 1: Studio Set Options (4 Themes) */}
          <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider pl-1.5 shrink-0 hidden sm:inline">
              የስቱዲዮ መድረክ ምረጥ፦
            </span>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-start sm:justify-end">
              {STUDIO_SETS.map((set) => {
                const isSelected = studioSet === set.id;
                const IconComponent = set.icon;

                return (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => handleChangeSet(set.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-amber-500 text-neutral-950 shadow-md scale-105"
                        : "bg-neutral-950/80 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{set.labelAmharic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Camera & Lighting Controls */}
          <div className="bg-neutral-900/95 border border-neutral-800 rounded-xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
            {/* Camera Angles */}
            <div className="flex items-center gap-1.5 text-xs">
              <Camera className="w-4 h-4 text-neutral-400 mr-1" />
              <button
                type="button"
                onClick={() => setCameraPreset("auto")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  cameraView === "auto" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ራስ-ሰር (Auto)
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset("wide")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  cameraView === "wide" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ሰፊ እይታ (Wide)
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset("anchor")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  cameraView === "anchor" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ቀረብ (Close-up)
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset("overhead")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  cameraView === "overhead" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ክሬን (Crane)
              </button>
            </div>

            {/* Lighting */}
            <div className="flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-400 mr-1" />
              <button
                type="button"
                onClick={() => setLightingPreset("day")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  lightingMode === "day" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                መደበኛ (Day)
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset("dramatic")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  lightingMode === "dramatic" ? "bg-red-600 text-white" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ሰበር ቀይ (Alert)
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset("night")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  lightingMode === "night" ? "bg-cyan-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ሳይበር/ምሽት (Cyber)
              </button>
            </div>

            {/* Direct Instant Download Button in dock */}
            <button
              type="button"
              onClick={() => handleDirectFastDownload(7)}
              disabled={isFastExporting}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ml-auto sm:ml-0 ${
                isFastExporting
                  ? "bg-emerald-600 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }`}
              title="ያለምንም ቅድመ ሁኔታ ቪዲዮውን በቀጥታ ወደ ዲቫይስዎ ያውርዱ"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isFastExporting ? "በማውረድ ላይ..." : "ቀጥታ ቪዲዮ አውርድ"}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              ዝጋ (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
