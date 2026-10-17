import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { X, Camera, Eye, Lightbulb, Radio, Play, RotateCw } from "lucide-react";

interface Virtual3DStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeHeadline: string;
  anchorName: string;
}

export const Virtual3DStudioModal: React.FC<Virtual3DStudioModalProps> = ({
  isOpen,
  onClose,
  activeHeadline,
  anchorName,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [lightingMode, setLightingMode] = useState<"prime" | "breaking" | "night">("prime");
  const [cameraView, setCameraView] = useState<"wide" | "anchor" | "overhead">("wide");

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetCameraPos = useRef(new THREE.Vector3(0, 3, 9));
  const currentCameraPos = useRef(new THREE.Vector3(0, 3, 9));
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const onAirLightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3, 9);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer with PBR Tonemapping
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting System
    const hemiLight = new THREE.HemisphereLight(0x223355, 0x050510, 0.6);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0x4466aa, 1.0);
    fillLight.position.set(-5, 4, 3);
    scene.add(fillLight);

    // On-Air Glowing Light
    const onAirLight = new THREE.PointLight(0xff2222, 2.5, 12);
    onAirLight.position.set(0, 4.5, -2);
    scene.add(onAirLight);
    onAirLightRef.current = onAirLight;

    // 5. Studio Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121218,
      roughness: 0.2,
      metalness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor Reflection Grid Circles
    const ringGeo = new THREE.RingGeometry(2, 6, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // 6. Anchor News Desk (Composite 5-Part Model)
    const deskGroup = new THREE.Group();

    // Curved Front Glass/Wood Panel
    const deskTopGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.15, 32, 1, false, 0, Math.PI);
    const deskTopMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.3,
      metalness: 0.7,
    });
    const deskTop = new THREE.Mesh(deskTopGeo, deskTopMat);
    deskTop.position.set(0, 1.1, 0);
    deskTop.castShadow = true;
    deskGroup.add(deskTop);

    // Glowing Amber Trim on Desk
    const trimGeo = new THREE.CylinderGeometry(2.42, 2.42, 0.05, 32, 1, false, 0, Math.PI);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, 1.15, 0);
    deskGroup.add(trim);

    // Base Support Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.6, 2.0, 1.1, 32, 1, false, 0, Math.PI);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a09,
      roughness: 0.6,
      metalness: 0.4,
    });
    const deskBase = new THREE.Mesh(baseGeo, baseMat);
    deskBase.position.set(0, 0.55, 0);
    deskGroup.add(deskBase);

    // Newsroom Gooseneck Microphones (2 items)
    for (let i = -0.5; i <= 0.5; i += 1.0) {
      const micBaseGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.04, 16);
      const micMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 });
      const micBase = new THREE.Mesh(micBaseGeo, micMat);
      micBase.position.set(i, 1.2, 0.6);

      const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8);
      const stem = new THREE.Mesh(stemGeo, micMat);
      stem.position.set(i, 1.35, 0.5);
      stem.rotation.x = -0.3;

      const capsuleGeo = new THREE.CapsuleGeometry(0.03, 0.08, 8, 16);
      const capsuleMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
      });
      const capsule = new THREE.Mesh(capsuleGeo, capsuleMat);
      capsule.position.set(i, 1.48, 0.42);
      capsule.rotation.x = -0.3;

      deskGroup.add(micBase);
      deskGroup.add(stem);
      deskGroup.add(capsule);
    }

    // Anchor Tablet / News Script Prompter
    const tabletGeo = new THREE.BoxGeometry(0.45, 0.02, 0.3);
    const tabletMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.1,
      metalness: 0.9,
    });
    const tablet = new THREE.Mesh(tabletGeo, tabletMat);
    tablet.position.set(0, 1.2, 0.8);
    tablet.rotation.x = 0.2;
    deskGroup.add(tablet);

    deskGroup.position.set(0, 0, 0);
    scene.add(deskGroup);

    // 7. Curved Studio Backdrop Video Wall
    const wallGeo = new THREE.CylinderGeometry(7, 7, 4.5, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.6,
      side: THREE.BackSide,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.2,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 2.25, 0);
    scene.add(wall);

    // 8. ON-AIR Neon Sign Box
    const signBoxGeo = new THREE.BoxGeometry(1.6, 0.45, 0.2);
    const signBoxMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
    const signBox = new THREE.Mesh(signBoxGeo, signBoxMat);
    signBox.position.set(0, 4.2, -3);

    const signTextGeo = new THREE.PlaneGeometry(1.4, 0.35);
    const signTextMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });
    const signFace = new THREE.Mesh(signTextGeo, signTextMat);
    signFace.position.set(0, 4.2, -2.89);
    scene.add(signBox);
    scene.add(signFace);

    // 9. Broadcast Camera Rig on Pedestal (Right front)
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
    // Tally Red Light on camera
    const tally = new THREE.Mesh(
      new THREE.SphereGeometry(0.04),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    tally.position.set(0, 1.9, 0.2);
    camRig.add(camBase, camPole, camBody, camLens, tally);
    camRig.position.set(3.5, 0, 4.5);
    camRig.rotation.y = -0.55;
    scene.add(camRig);

    // 10. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      // Smooth camera transition (exponential damping)
      currentCameraPos.current.lerp(targetCameraPos.current, 1 - Math.exp(-4 * dt));
      camera.position.copy(currentCameraPos.current);
      camera.lookAt(0, 1.2, 0);

      // Subtle on-air pulse
      const t = clock.getElapsedTime();
      if (onAirLightRef.current) {
        onAirLightRef.current.intensity = 2.0 + Math.sin(t * 3) * 0.8;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
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

  // Handle Studio Lighting Presets
  const setLightingPreset = (mode: "prime" | "breaking" | "night") => {
    setLightingMode(mode);
    if (!keyLightRef.current || !sceneRef.current) return;

    if (mode === "prime") {
      keyLightRef.current.color.setHex(0xffeedd);
      keyLightRef.current.intensity = 2.0;
      sceneRef.current.background = new THREE.Color(0x0a0a0f);
    } else if (mode === "breaking") {
      keyLightRef.current.color.setHex(0xff4433);
      keyLightRef.current.intensity = 2.8;
      sceneRef.current.background = new THREE.Color(0x180505);
    } else if (mode === "night") {
      keyLightRef.current.color.setHex(0x38bdf8);
      keyLightRef.current.intensity = 1.6;
      sceneRef.current.background = new THREE.Color(0x030712);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-neutral-950 border border-neutral-700/80 rounded-2xl w-full max-w-4xl h-[85vh] max-h-[800px] overflow-hidden shadow-2xl flex flex-col relative text-white">
        {/* Top Floating Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-950/60">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  ፋና 3D ቨርቹዋል ዜና ስቱዲዮ (3D Virtual Set)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600/80 text-white animate-pulse">
                  ON AIR
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans">
                አቅራቢ፦ {anchorName} · 3D የቴሌቪዥን ስቱዲዮ መድረክ
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

        {/* 3D WebGL Canvas Container */}
        <div ref={mountRef} className="w-full flex-1 relative cursor-grab active:cursor-grabbing" />

        {/* Live Headline Ticker on 3D Studio */}
        <div className="absolute top-16 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-neutral-900/90 border border-amber-500/40 rounded-xl p-2.5 shadow-2xl backdrop-blur-sm max-w-xl mx-auto flex items-center gap-2.5 text-xs">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-bold uppercase text-[10px] shrink-0">
              በርዕሰ አንቀጽ
            </span>
            <span className="font-semibold text-neutral-200 truncate font-sans">
              {activeHeadline || "የፋና ብሮድካስቲንግ ኮርፖሬት የቀጥታ ስርጭት ስቱዲዮ"}
            </span>
          </div>
        </div>

        {/* Bottom Floating Control Dock */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-2xl backdrop-blur-md">
          {/* Camera Angles */}
          <div className="flex items-center gap-1.5 text-xs">
            <Camera className="w-4 h-4 text-neutral-400 mr-1" />
            <span className="text-[11px] text-neutral-400 hidden sm:inline">ካሜራ፦</span>
            <button
              type="button"
              onClick={() => setCameraPreset("wide")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                cameraView === "wide" ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              ሰፊ እይታ (Wide)
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset("anchor")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                cameraView === "anchor" ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              ቀረብ (Close-up)
            </button>
            <button
              type="button"
              onClick={() => setCameraPreset("overhead")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                cameraView === "overhead" ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              ክሬን (Crane)
            </button>
          </div>

          {/* Lighting Mode */}
          <div className="flex items-center gap-1.5 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 mr-1" />
            <span className="text-[11px] text-neutral-400 hidden sm:inline">መብራት፦</span>
            <button
              type="button"
              onClick={() => setLightingPreset("prime")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                lightingMode === "prime" ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              ዋና ዜና (Prime)
            </button>
            <button
              type="button"
              onClick={() => setLightingPreset("breaking")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                lightingMode === "breaking" ? "bg-red-600 text-white font-bold" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              ሰበር ዜና (Breaking Red)
            </button>
            <button
              type="button"
              onClick={() => setLightingPreset("night")}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                lightingMode === "night" ? "bg-cyan-500 text-neutral-950 font-bold" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              ምሽት (Late Night)
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ዝጋ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
