/**
 * Fana Voice News Studio - የዜና ድምፅ ስቱዲዮ
 * Professional Ethiopian Broadcast Newsroom Audio Production Studio
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Play,
  Square,
  Sparkles,
  Sliders,
  Tv,
  Download,
  Info,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Headphones,
  Flame,
  Volume2,
} from "lucide-react";
import { VoiceAnchor, StudioSettings, NewsScriptPreset } from "./types/studio";
import { FANA_ANCHORS, NEWS_PRESETS } from "./data/newsData";
import { normalizeAmharicForSpeech, calculateAmharicDuration } from "./utils/amharicNormalizer";
import { studioAudio } from "./utils/audioEngine";
import { StudioHeader } from "./components/StudioHeader";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { AnchorSelector } from "./components/AnchorSelector";
import { NewsScriptEditor } from "./components/NewsScriptEditor";
import { StudioControls } from "./components/StudioControls";
import { TeleprompterModal } from "./components/TeleprompterModal";
import { AiPolishModal } from "./components/AiPolishModal";
import { ExportModal } from "./components/ExportModal";

export default function App() {
  // Navigation Section
  const [activeSection, setActiveSection] = useState<string>("studio");

  // Core Studio State
  const [script, setScript] = useState<string>(NEWS_PRESETS[0].contentAmharic);
  const [selectedAnchor, setSelectedAnchor] = useState<VoiceAnchor>(FANA_ANCHORS[0]);
  const [settings, setSettings] = useState<StudioSettings>({
    selectedAnchorId: FANA_ANCHORS[0].id,
    speechRate: FANA_ANCHORS[0].defaultRate,
    speechPitch: FANA_ANCHORS[0].defaultPitch,
    musicBed: "breaking",
    musicVolume: 0.35,
    autoDucking: true,
    includeIntroStinger: true,
    reverbAmount: 0.2,
  });

  // Playback & Processing State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewingAnchorId, setPreviewingAnchorId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("ስቱዲዮው ዝግጁ ነው");
  const [notification, setNotification] = useState<{ type: "success" | "warning" | "info"; text: string } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Modals
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isAiPolishOpen, setIsAiPolishOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Export State
  const [exportedAudioUrl, setExportedAudioUrl] = useState<string | null>(null);
  const [exportedAudioBlob, setExportedAudioBlob] = useState<Blob | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Timer Ref
  const timerIntervalRef = useRef<any>(null);

  // Update Settings helper
  const updateSettings = (newPartial: Partial<StudioSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      if (newPartial.musicVolume !== undefined) {
        studioAudio.setMusicVolume(newPartial.musicVolume);
      }
      return updated;
    });
  };

  // Change selected anchor
  const handleSelectAnchor = (anchor: VoiceAnchor) => {
    setSelectedAnchor(anchor);
    updateSettings({
      selectedAnchorId: anchor.id,
      speechRate: anchor.defaultRate,
      speechPitch: anchor.defaultPitch,
    });
    setNotification({
      type: "info",
      text: `አቅራቢ ወደ "${anchor.nameAmharic}" ተቀይሯል`,
    });
  };

  // Select News Preset
  const handleSelectPreset = (preset: NewsScriptPreset) => {
    setScript(preset.contentAmharic);
    const recAnchor = FANA_ANCHORS.find((a) => a.id === preset.recommendedAnchorId);
    if (recAnchor) {
      setSelectedAnchor(recAnchor);
    }
    updateSettings({
      musicBed: preset.musicBed,
      selectedAnchorId: preset.recommendedAnchorId,
    });
    setNotification({
      type: "success",
      text: `"${preset.headlineAmharic}" አብነት ተመርጧል`,
    });
  };

  // Normalize Abbreviations
  const handleNormalize = () => {
    if (!script.trim()) return;
    const normalized = normalizeAmharicForSpeech(script);
    setScript(normalized);
    setNotification({
      type: "success",
      text: "አጽህሮተ-ቃላት ወደ ሙሉ አማርኛ ቃል ተቀይረዋል!",
    });
  };

  // Timer effect for playback
  useEffect(() => {
    if (isPlaying) {
      setElapsedSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying]);

  // Handle Stop Click
  const handleStop = () => {
    studioAudio.stopVoice();
    studioAudio.stopMusicBed();
    setIsPlaying(false);
    setIsLoading(false);
    setStatusMessage("ስርጭቱ ቆሟል");
  };

  // Preview sample of anchor
  const handlePreviewSample = async (anchor: VoiceAnchor) => {
    if (isPlaying || isLoading) {
      handleStop();
    }

    setPreviewingAnchorId(anchor.id);
    studioAudio.init();

    try {
      // Try neural TTS first
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: anchor.sampleText,
          voice: anchor.geminiVoice,
          style: anchor.styleDirective,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          await studioAudio.playWavAudio(data.audioBase64);
          setPreviewingAnchorId(null);
          return;
        }
      }

      // Fallback to Web Speech
      await studioAudio.speakWithWebSpeech(anchor.sampleText, {
        pitch: anchor.defaultPitch,
        rate: anchor.defaultRate,
        voiceGender: anchor.gender,
      });
    } catch {
      await studioAudio.speakWithWebSpeech(anchor.sampleText, {
        pitch: anchor.defaultPitch,
        rate: anchor.defaultRate,
        voiceGender: anchor.gender,
      });
    } finally {
      setPreviewingAnchorId(null);
    }
  };

  // Main Broadcast News Execution ("አንብብ")
  const handleBroadcast = async () => {
    const rawText = script.trim();
    if (!rawText) {
      setNotification({
        type: "warning",
        text: "እባክዎ መጀመሪያ የሚነበበውን የዜና ጽሑፍ ያስገቡ",
      });
      return;
    }

    handleStop();
    setIsLoading(true);
    setStatusMessage("የስቱዲዮ ድምፅ በፋና ጋዜጠኛ ስልት በማዘጋጀት ላይ...");

    studioAudio.init();
    studioAudio.setMusicVolume(settings.musicVolume);

    // Phonetically clean script
    const spokenText = normalizeAmharicForSpeech(rawText);

    try {
      // Start recording master mix for download export
      studioAudio.startRecording();

      // 1. Play intro stinger if enabled
      if (settings.includeIntroStinger) {
        setStatusMessage("🚨 የሰበር ዜና የመግቢያ ጅንግል...");
        await studioAudio.playIntroStinger();
      }

      // 2. Start background music bed
      if (settings.musicBed !== "none") {
        studioAudio.startMusicBed(settings.musicBed);
      }

      // 3. Request high-fidelity Gemini 3.8 Neural Audio from server
      setStatusMessage(`🎙️ በ${selectedAnchor.nameAmharic} ድምፅ በመነበብ ላይ ነው...`);
      setIsLoading(false);
      setIsPlaying(true);

      const ttsResponse = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: spokenText,
          voice: selectedAnchor.geminiVoice,
          style: selectedAnchor.styleDirective,
        }),
      });

      if (ttsResponse.ok) {
        const ttsData = await ttsResponse.json();
        if (ttsData.audioBase64) {
          // Play the 24kHz studio master WAV
          await studioAudio.playWavAudio(ttsData.audioBase64);
          finishBroadcast();
          return;
        }
      }

      // Fallback: Web Speech API synthesis
      setNotification({
        type: "info",
        text: `በቀጥታ ስቱዲዮ ንባብ ሁነታ በ${selectedAnchor.nameAmharic} ስልት እየተነበበ ነው`,
      });

      await studioAudio.speakWithWebSpeech(spokenText, {
        pitch: settings.speechPitch,
        rate: settings.speechRate,
        voiceGender: selectedAnchor.gender,
      });

      finishBroadcast();
    } catch (err: any) {
      console.warn("TTS Error, running fallback speech:", err);
      try {
        await studioAudio.speakWithWebSpeech(spokenText, {
          pitch: settings.speechPitch,
          rate: settings.speechRate,
          voiceGender: selectedAnchor.gender,
        });
      } catch (e) {
        console.error(e);
      }
      finishBroadcast();
    }
  };

  const finishBroadcast = async () => {
    // Let background music play for 1 second after voice ends, then stop
    setTimeout(async () => {
      studioAudio.stopMusicBed();
      const recordedBlob = await studioAudio.stopRecording();
      if (recordedBlob) {
        setExportedAudioBlob(recordedBlob);
        const url = URL.createObjectURL(recordedBlob);
        setExportedAudioUrl(url);
      }
      setIsPlaying(false);
      setStatusMessage("የዜና ስርጭቱ ተጠናቋል");
    }, 1200);
  };

  // Preview Intro Stinger only
  const handlePreviewStinger = async () => {
    studioAudio.init();
    await studioAudio.playIntroStinger();
  };

  // Export Combined Master Mix Audio
  const handleExportAudio = async () => {
    if (exportedAudioUrl && exportedAudioBlob) {
      setIsExportOpen(true);
      return;
    }

    // If not played yet, trigger a fast generation and open export
    setIsExporting(true);
    setNotification({
      type: "info",
      text: "የተሟላ የዜና ድምፅ ቅንብር በማዘጋጀት ላይ...",
    });

    try {
      const spokenText = normalizeAmharicForSpeech(script);
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: spokenText,
          voice: selectedAnchor.geminiVoice,
          style: selectedAnchor.styleDirective,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const binary = atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "audio/wav" });
          setExportedAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setExportedAudioUrl(url);
          setIsExportOpen(true);
          return;
        }
      }

      // If network fails or quota limit, open export modal to instruct
      setIsExportOpen(true);
    } catch {
      setIsExportOpen(true);
    } finally {
      setIsExporting(false);
    }
  };

  const { wordCount, durationSeconds } = calculateAmharicDuration(script, settings.speechRate);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <StudioHeader
        isPlaying={isPlaying}
        isLoading={isLoading}
        onPlayClick={handleBroadcast}
        onStopClick={handleStop}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div className="bg-neutral-900 border border-amber-500/40 text-amber-200 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-neutral-400 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* Hero Studio Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 shadow-2xl">
          <div className="relative h-48 sm:h-56 md:h-64 w-full overflow-hidden">
            <img
              src="/src/assets/images/fana_newsroom_studio_1792062308296.jpg"
              alt="Fana Newsroom Studio Desk"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center brightness-75 scale-100 hover:scale-105 transition-transform duration-700"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-600/90 text-white shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE BROADCAST STUDIO
                  </span>
                  <span className="text-xs text-neutral-300 font-mono">
                    ፋና ብሮድካስቲንግ ኮርፖሬት
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white text-balance">
                  የኢትዮጵያ ዜና እና ሶሻል ሚዲያ ድምፅ ስቱዲዮ
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                  ስቴዲዮ ለሌላቸው የቲክቶክ፣ ዩቲዩብ እና ቴሌግራም ዜና አዘጋጆች፤ የተፃፈውን ጽሑፍ በፋና ጋዜጠኞች ተፈጥሯዊ የዜና አቀራረብ ስልት ያንብቡ።
                </p>
              </div>

              {/* Quick Broadcast Button */}
              <div className="shrink-0">
                {isPlaying ? (
                  <button
                    onClick={handleStop}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xl shadow-red-950/50 transition-all"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>ስርጭት አቁም</span>
                  </button>
                ) : (
                  <button
                    onClick={handleBroadcast}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs shadow-xl shadow-amber-950/50 transition-all disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ዜናውን አንብብ (Start News)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Visualizer & VU Meter */}
        <AudioVisualizer
          isPlaying={isPlaying}
          anchorName={selectedAnchor.nameAmharic}
          musicBedName={
            settings.musicBed === "breaking"
              ? "ሰበር ዜና ቴማ"
              : settings.musicBed === "prime"
              ? "ፋና ዋና ዜና"
              : settings.musicBed === "analysis"
              ? "ትንታኔና ዘገባ"
              : settings.musicBed === "tech"
              ? "ቴክኖሎጂ"
              : "ድምፅ ብቻ"
          }
          elapsedSeconds={elapsedSeconds}
        />

        {/* Status ticker */}
        <div className="flex items-center justify-between text-xs bg-neutral-900/60 px-4 py-2 rounded-lg border border-neutral-800 text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>ሁኔታ፦ <strong className="text-neutral-200">{statusMessage}</strong></span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="hidden sm:inline">የድምፅ ጥራት፦ 24kHz Studio Audio</span>
            <span>የተመረጠ ድምፅ፦ {selectedAnchor.nameAmharic} ({selectedAnchor.nameEnglish})</span>
          </div>
        </div>

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Script Editor & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <NewsScriptEditor
              script={script}
              setScript={setScript}
              wordCount={wordCount}
              durationSeconds={durationSeconds}
              presets={NEWS_PRESETS}
              onSelectPreset={handleSelectPreset}
              onNormalizeAbbreviations={handleNormalize}
              onOpenAiPolish={() => setIsAiPolishOpen(true)}
              onOpenTeleprompter={() => setIsTeleprompterOpen(true)}
            />

            <StudioControls
              settings={settings}
              updateSettings={updateSettings}
              onPreviewStinger={handlePreviewStinger}
              onExportMixedAudio={handleExportAudio}
              isExporting={isExporting}
              isPlaying={isPlaying}
            />
          </div>

          {/* Side Column: Anchors Selection (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <AnchorSelector
              anchors={FANA_ANCHORS}
              selectedAnchorId={selectedAnchor.id}
              onSelectAnchor={handleSelectAnchor}
              onPreviewSample={handlePreviewSample}
              previewingAnchorId={previewingAnchorId}
            />

            {/* Quick Tips Box for Social Media Creators */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-xs space-y-3">
              <h3 className="font-bold text-amber-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ስቴዲዮ ለሌላቸው ፈጣሪዎች የዜና ዝግጅት መመሪያ፦</span>
              </h3>
              <ol className="text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  የዜናውን መረጃ በስክሪፕት ሳጥኑ ውስጥ ይጻፉ ወይም ከታች ካሉት አብነቶች አንዱን ይምረጡ።
                </li>
                <li>
                  <strong className="text-amber-300">"አጽህሮተ-ቃል አስተካክል"</strong> የሚለውን በመጫን አጽህሮተ-ቃላት (ጠ/ሚ፣ ዶ/ር) ወደ ሙሉ ቃል ይቀይሩ።
                </li>
                <li>
                  ለዜናው የሚስማማውን የፋና ጋዜጠኛ (ለምሳሌ ዳዊት ወይም አስቴር) ይምረጡ።
                </li>
                <li>
                  <strong className="text-emerald-400">"ድምፁን አውርድ (.WAV)"</strong> በማለት የዜናውን ድምፅ አውርደው በካፕከት (CapCut) ወይም ፕሪሚየር ቪዲዮ ይስሩበት!
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-800 bg-neutral-950/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Fana Voice Studio · የኢትዮጵያ ሶሻል ሚዲያ ዜና ፕሮዳክሽን ስቱዲዮ</p>
          <div className="flex items-center gap-4 text-neutral-400 font-medium">
            <span>ቲክቶክ (TikTok)</span>
            <span>·</span>
            <span>ቴሌግራም (Telegram)</span>
            <span>·</span>
            <span>ዩቲዩብ ሾርትስ (YouTube Shorts)</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TeleprompterModal
        isOpen={isTeleprompterOpen}
        onClose={() => setIsTeleprompterOpen(false)}
        script={script}
        isPlaying={isPlaying}
        onTogglePlay={() => {
          if (isPlaying) handleStop();
          else handleBroadcast();
        }}
        anchorName={selectedAnchor.nameAmharic}
      />

      <AiPolishModal
        isOpen={isAiPolishOpen}
        onClose={() => setIsAiPolishOpen(false)}
        currentScript={script}
        onApplyScript={(newScript) => {
          setScript(newScript);
          setNotification({
            type: "success",
            text: "የተስተካከለው የፋና ዜና ስክሪፕት በስቱዲዮው ውስጥ ተተክቷል!",
          });
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        audioBlob={exportedAudioBlob}
        audioUrl={exportedAudioUrl}
        script={script}
        anchorName={selectedAnchor.nameAmharic}
      />
    </div>
  );
}
