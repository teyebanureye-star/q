import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  X,
  Camera,
  Lightbulb,
  Radio,
  Sparkles,
  Layers,
  Flame,
  Globe,
  Coffee,
  RotateCw,
} from "lucide-react";

export type StudioSetType = "prime" | "breaking" | "cyber" | "morning";

interface Virtual3DStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHeadline: string;
  anchorName: string;
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
    labelAmharic: "🏛️ ፋና ዋና ዜና",
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
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [studioSet, setStudioSet] = useState<StudioSetType>("prime");
  const [lightingMode, setLightingMode] = useState<"day" | "dramatic" | "night">("day");
  const [cameraView, setCameraView] = useState<"wide" | "anchor" | "overhead">("wide");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCameraPos = useRef(new THREE.Vector3(0, 3, 9));
  const currentCameraPos = useRef(new THREE.Vector3(0, 3, 9));

  const setGroupRef = useRef<THREE.Group | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const onAirLightRef = useRef<THREE.PointLight | null>(null);

  // Build the 3D Set objects based on selected theme
  const buildStudioSet = (scene: THREE.Scene, theme: StudioSetType) => {
    // Remove previous set group if exists
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

    // Materials based on theme
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.25 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.95, roughness: 0.1 });

    if (theme === "prime") {
      // 1. PRIME BROADCAST STAGE
      scene.background = new THREE.Color(0x0a0c14);

      // Curved Executive Desk
      const deskTopGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.15, 32, 1, false, 0, Math.PI);
      const deskTopMat = new THREE.MeshStandardMaterial({ color: 0x1e1b18, roughness: 0.3, metalness: 0.6 });
      const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
      deskTop.position.set(0, 1.1, 0);
      deskTop.castShadow = true;
      setGroup.add(deskTop);

      // Glowing Gold Trim
      const trimGeo = new THREE.CylinderGeometry(2.42, 2.42, 0.05, 32, 1, false, 0, Math.PI);
      const trimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.6 });
      const trim = new THREE.Mesh(trimGeo, trimMat);
      trim.position.set(0, 1.15, 0);
      setGroup.add(trim);

      // Curved Blue Royal Cyclorama Wall
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

      // Radial Gold Floor Ring
      const ringGeo = new THREE.RingGeometry(2.2, 5.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      setGroup.add(ring);
    } else if (theme === "breaking") {
      // 2. BREAKING NEWS RED ALERT ROOM
      scene.background = new THREE.Color(0x180505);

      // Angular Hexagonal High-Tech Desk
      const deskGeo = new THREE.CylinderGeometry(2.5, 2.8, 0.2, 6);
      const deskMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(0, 1.1, 0);
      desk.castShadow = true;
      setGroup.add(desk);

      // Red Glowing Edge
      const edgeGeo = new THREE.CylinderGeometry(2.52, 2.52, 0.05, 6);
      const edgeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.0 });
      const edge = new THREE.Mesh(edgeGeo, edgeMat);
      edge.position.set(0, 1.16, 0);
      setGroup.add(edge);

      // Dual Warning Beacon Pillars
      [-3.2, 3.2].forEach((x) => {
        const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.5, 16);
        const pillar = new THREE.Mesh(pillarGeo, metalMat);
        pillar.position.set(x, 2.25, -2);

        const beaconTop = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        beaconTop.position.set(x, 4.4, -2);
        setGroup.add(pillar);
        setGroup.add(beaconTop);
      });

      // Red Segmented Back Wall
      const wallGeo = new THREE.CylinderGeometry(7, 7, 4.5, 32, 1, true, Math.PI * 0.75, Math.PI * 0.5);
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x220505,
        roughness: 0.3,
        metalness: 0.7,
        side: THREE.BackSide,
        emissive: 0x7f1d1d,
        emissiveIntensity: 0.4,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 2.25, 0);
      setGroup.add(wall);
    } else if (theme === "cyber") {
      // 3. GLOBAL CYBER & DIGITAL NEWSROOM
      scene.background = new THREE.Color(0x030712);

      // Transparent Holographic Glass Desk with Cyan Glow
      const glassGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.12, 32, 1, false, 0, Math.PI);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.75,
        emissive: 0x0891b2,
        emissiveIntensity: 0.3,
      });
      const glassDesk = new THREE.Mesh(glassGeo, glassMat);
      glassDesk.position.set(0, 1.1, 0);
      setGroup.add(glassDesk);

      // Floating 3D Wireframe World Globe above desk center
      const globeGeo = new THREE.SphereGeometry(0.85, 24, 24);
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        wireframe: true,
        emissive: 0x0284c7,
        emissiveIntensity: 0.8,
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      globe.position.set(0, 2.6, -0.6);
      setGroup.add(globe);
      globeMeshRef.current = globe;

      // Cyan Grid Rings on Floor
      [3, 5, 7].forEach((radius) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(radius - 0.05, radius, 64),
          new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        setGroup.add(ring);
      });
    } else if (theme === "morning") {
      // 4. MORNING TALK & LOUNGE STUDIO
      scene.background = new THREE.Color(0x1a1510);

      // Modern Lounge Coffee Table
      const tableGeo = new THREE.BoxGeometry(2.4, 0.15, 1.2);
      const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, metalness: 0.2 });
      const table = new THREE.Mesh(tableGeo, tableMat);
      table.position.set(0, 0.7, 0.2);
      setGroup.add(table);

      // Chrome Table Legs
      [
        [-1, -0.4],
        [1, -0.4],
        [-1, 0.4],
        [1, 0.4],
      ].forEach(([x, z]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.65), chromeMat);
        leg.position.set(x, 0.35, z + 0.2);
        setGroup.add(leg);
      });

      // Warm Acoustic Wood-Slat Back Wall
      for (let s = -4; s <= 4; s += 0.4) {
        const slatGeo = new THREE.BoxGeometry(0.25, 4.5, 0.08);
        const slatMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.5 });
        const slat = new THREE.Mesh(slatGeo, slatMat);
        slat.position.set(s, 2.25, -3.2);
        setGroup.add(slat);
      }

      // Studio Coffee Cup on Table
      const cupGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.12, 16);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(0.6, 0.82, 0.3);
      setGroup.add(cup);
    }

    // Common Studio Items (Microphones & Prompter Tablet)
    if (theme !== "morning") {
      for (let i = -0.5; i <= 0.5; i += 1.0) {
        const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 16), metalMat);
        micBase.position.set(i, 1.2, 0.6);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), metalMat);
        stem.position.set(i, 1.35, 0.5);
        stem.rotation.x = -0.3;
        const capsule = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.08, 8, 16), metalMat);
        capsule.position.set(i, 1.48, 0.42);
        capsule.rotation.x = -0.3;
        setGroup.add(micBase, stem, capsule);
      }

      const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.3), metalMat);
      tablet.position.set(0, 1.2, 0.8);
      tablet.rotation.x = 0.2;
      setGroup.add(tablet);
    }

    scene.add(setGroup);
  };

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & PBR Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c14);
    scene.fog = new THREE.FogExp2(0x0a0c14, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3, 9);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0x334466, 0x050510, 0.6);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x4466aa, 1.0);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    const onAirLight = new THREE.PointLight(0xff2222, 2.5, 12);
    onAirLight.position.set(0, 4.5, -2);
    scene.add(onAirLight);
    onAirLightRef.current = onAirLight;

    // Floor
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.2, metalness: 0.85 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Initial Set Build
    buildStudioSet(scene, studioSet);

    // Broadcast Camera on Pedestal
    const studioHardwareMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });
    const camRig = new THREE.Group();
    const camBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.2, 16), studioHardwareMat);
    const camPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16), studioHardwareMat);
    camPole.position.y = 0.8;
    const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 1.1), studioHardwareMat);
    camBody.position.y = 1.6;
    const camLens = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.4, 16), studioHardwareMat);
    camLens.rotation.x = Math.PI / 2;
    camLens.position.set(0, 1.6, -0.65);
    const tally = new THREE.Mesh(new THREE.SphereGeometry(0.04), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    tally.position.set(0, 1.9, 0.2);
    camRig.add(camBase, camPole, camBody, camLens, tally);
    camRig.position.set(3.5, 0, 4.5);
    camRig.rotation.y = -0.55;
    scene.add(camRig);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // Smooth camera transition (exponential damping)
      currentCameraPos.current.lerp(targetCameraPos.current, 1 - Math.exp(-4.5 * dt));
      camera.position.copy(currentCameraPos.current);
      camera.lookAt(0, 1.2, 0);

      // Rotate cyber globe if active
      if (globeMeshRef.current) {
        globeMeshRef.current.rotation.y += 0.8 * dt;
      }

      // Subtle on-air pulse
      const t = clock.getElapsedTime();
      if (onAirLightRef.current) {
        onAirLightRef.current.intensity = 2.0 + Math.sin(t * 3.5) * 0.8;
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
  const setCameraPreset = (view: "wide" | "anchor" | "overhead") => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-700/80 rounded-2xl w-full max-w-5xl h-[88vh] max-h-[850px] overflow-hidden shadow-2xl flex flex-col relative text-white">
        {/* Top Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/50 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/60">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  ፋና 3D ቨርቹዋል ዜና ስቱዲዮ (3D Virtual Newsroom)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-white animate-pulse">
                  ON AIR
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                አቅራቢ፦ {anchorName} · 4 የተለያዩ የብሮድካስት መድረኮች
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D WebGL Canvas */}
        <div ref={mountRef} className="w-full flex-1 relative cursor-grab active:cursor-grabbing" />

        {/* Live Headline Ticker on 3D Studio */}
        <div className="absolute top-16 left-3 right-3 z-10 pointer-events-none">
          <div className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-sm max-w-xl mx-auto flex items-center gap-2.5 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-bold uppercase text-[10px] shrink-0">
              በርዕሰ አንቀጽ
            </span>
            <span className="font-semibold text-neutral-200 truncate font-sans">
              {activeHeadline || "የፋና ብሮድካስቲንግ ኮርፖሬት የቀጥታ ስርጭት ስቱዲዮ"}
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
                onClick={() => setCameraPreset("wide")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  cameraView === "wide" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ሰፊ እይታ (Wide)
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset("anchor")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  cameraView === "anchor" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ቀረብ (Close-up)
              </button>
              <button
                type="button"
                onClick={() => setCameraPreset("overhead")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
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
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  lightingMode === "day" ? "bg-amber-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                መደበኛ (Day)
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset("dramatic")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  lightingMode === "dramatic" ? "bg-red-600 text-white" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ሰበር ቀይ (Alert)
              </button>
              <button
                type="button"
                onClick={() => setLightingPreset("night")}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  lightingMode === "night" ? "bg-cyan-500 text-neutral-950" : "bg-neutral-950 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                ሳይበር/ምሽት (Cyber)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors ml-auto sm:ml-0"
            >
              ዝጋ (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
