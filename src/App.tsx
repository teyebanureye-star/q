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
  BookOpen,
  Loader2,
  Ban,
  Bell,
  ShieldAlert,
  Smile,
} from "lucide-react";
import { VoiceAnchor, StudioSettings, NewsScriptPreset, DictionaryEntry, MusicBedType } from "./types/studio";
import { FANA_ANCHORS, NEWS_PRESETS } from "./data/newsData";
import {
  normalizeAmharicForSpeech,
  calculateAmharicDuration,
  getStoredDictionary,
} from "./utils/amharicNormalizer";
import { studioAudio } from "./utils/audioEngine";
import { StudioHeader } from "./components/StudioHeader";
import { AudioVisualizer } from "./components/AudioVisualizer";
import { AnchorSelector } from "./components/AnchorSelector";
import { NewsScriptEditor } from "./components/NewsScriptEditor";
import { StudioControls } from "./components/StudioControls";
import { TeleprompterModal } from "./components/TeleprompterModal";
import { AiPolishModal } from "./components/AiPolishModal";
import { ExportModal } from "./components/ExportModal";
import { DictionaryModal } from "./components/DictionaryModal";
import { AuthModal } from "./components/AuthModal";
import { AdminModal } from "./components/AdminModal";
import { HeadlineGeneratorModal } from "./components/HeadlineGeneratorModal";
import { AudioDictationModal } from "./components/AudioDictationModal";
import { NewsroomChatModal } from "./components/NewsroomChatModal";
import { NewsGraphicsModal } from "./components/NewsGraphicsModal";
import { Virtual3DStudioModal } from "./components/Virtual3DStudioModal";
import { TalkingAvatarModal } from "./components/TalkingAvatarModal";
import { StudioAuthGate } from "./components/StudioAuthGate";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";

export default function App() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const { language, t, toggleLanguage } = useLanguage();
  const isEn = language === "en";

  // System notice & Banned words managed by Admin
  const [bannedWords, setBannedWords] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("studio_banned_words");
      if (stored) return JSON.parse(stored);
    } catch {}
    return ["አላስፈላጊ ቃላት", "ጥላቻ", "የሀሰት መረጃ", "fake news", "scam"];
  });

  const [systemNotice, setSystemNotice] = useState<string | null>(() => {
    try {
      return localStorage.getItem("studio_system_notice");
    } catch {}
    return null;
  });

  const handleUpdateBannedWords = (words: string[]) => {
    setBannedWords(words);
    try {
      localStorage.setItem("studio_banned_words", JSON.stringify(words));
    } catch {}
  };

  const handleUpdateSystemNotice = (notice: string | null) => {
    setSystemNotice(notice);
    try {
      if (notice) {
        localStorage.setItem("studio_system_notice", notice);
      } else {
        localStorage.removeItem("studio_system_notice");
      }
    } catch {}
  };

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
    autoEq: true,
    includeIntroStinger: true,
    introSoundEffect: "prime_fanfare",
    includeOutroStinger: true,
    outroSoundEffect: "broadcast_outro",
    sfxVolume: 0.85,
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
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isHeadlineGeneratorOpen, setIsHeadlineGeneratorOpen] = useState<boolean>(false);
  const [isDictationOpen, setIsDictationOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isGraphicsOpen, setIsGraphicsOpen] = useState<boolean>(false);
  const [is3DStudioOpen, setIs3DStudioOpen] = useState<boolean>(false);
  const [isTalkingAvatarOpen, setIsTalkingAvatarOpen] = useState<boolean>(false);

  // Pronunciation Dictionary State
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(() => getStoredDictionary());

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
      if (newPartial.sfxVolume !== undefined) {
        studioAudio.setSfxVolume(newPartial.sfxVolume);
      }
      if (newPartial.autoEq !== undefined) {
        studioAudio.setAutoEq(newPartial.autoEq);
      }
      if (newPartial.speechRate !== undefined) {
        studioAudio.setSpeechRate(newPartial.speechRate);
      }
      if (newPartial.speechPitch !== undefined) {
        studioAudio.setSpeechPitch(newPartial.speechPitch);
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
    setScript(isEn ? (preset.contentEnglish || preset.contentAmharic) : preset.contentAmharic);
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
      text: isEn
        ? `Preset "${preset.headlineEnglish || preset.headlineAmharic}" selected`
        : `"${preset.headlineAmharic}" አብነት ተመርጧል`,
    });
  };

  // Normalize Abbreviations & Dictionary Mappings
  const handleNormalize = () => {
    if (!script.trim()) return;
    const normalized = normalizeAmharicForSpeech(script, dictionary);
    setScript(normalized);
    setNotification({
      type: "success",
      text: "አጽህሮተ-ቃላት፣ የቃላት አነባበብ እና ቁጥሮች ለንባብ በሚመች መልኩ ተስተካክለዋል!",
    });
  };

  // Apply AI Generated Headline
  const handleApplyHeadline = (selectedHeadline: string) => {
    if (!script.trim()) {
      setScript(`${selectedHeadline}\n\nየዝርዝር መረጃው እዚህ ይቀጥላል...`);
    } else {
      setScript(`${selectedHeadline}\n\n${script.trim()}`);
    }
    setNotification({
      type: "success",
      text: "አዲሱ የዜና ርዕስ በስክሪፕቱ ውስጥ ተተክቷል!",
    });
  };

  // Append Transcribed Audio to Script
  const handleAppendScript = (spokenText: string) => {
    if (!script.trim()) {
      setScript(spokenText);
    } else {
      setScript(`${script.trim()}\n\n${spokenText}`);
    }
    setNotification({
      type: "success",
      text: "የተናገሩት ድምፅ ወደ ዜና ጽሑፍ ተቀይሮ ተጨምሯል!",
    });
  };

  // Insert Newsroom Chat text to Script
  const handleInsertChatText = (text: string) => {
    if (!script.trim()) {
      setScript(text);
    } else {
      setScript(`${script.trim()}\n\n${text}`);
    }
    setNotification({
      type: "success",
      text: "ከአዘጋጁ ረዳት የተገኘው ጽሑፍ በስክሪፕቱ ውስጥ ተካቷል!",
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
      // 1. If anchor has pre-generated authentic broadcast audio file (Amharic only), play it directly!
      if (!isEn && anchor.sampleAudioUrl) {
        await studioAudio.playAudioUrl(anchor.sampleAudioUrl);
        setPreviewingAnchorId(null);
        return;
      }

      // 2. Otherwise request neural TTS (supports English news audio generation)
      const textToPreview = isEn ? (anchor.sampleTextEnglish || anchor.sampleText) : anchor.sampleText;
      const styleDirective = isEn ? (anchor.styleDirectiveEnglish || anchor.styleDirective) : anchor.styleDirective;

      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToPreview,
          voice: anchor.geminiVoice,
          style: styleDirective,
          language: isEn ? "en" : "am",
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

      setNotification({
        type: "warning",
        text: isEn
          ? `Could not synthesize audio for ${anchor.nameEnglish || anchor.nameAmharic}. Verify GEMINI_API_KEY.`
          : `የ${anchor.nameAmharic} ድምፅ ማመንጨት አልተቻለም። በ Vercel ላይ GEMINI_API_KEY መግባቱን ያረጋግጡ።`,
      });
    } catch {
      setNotification({
        type: "warning",
        text: isEn
          ? `Could not synthesize audio for ${anchor.nameEnglish || anchor.nameAmharic}. Check environment configuration.`
          : `የ${anchor.nameAmharic} ድምፅ ማመንጨት አልተቻለም። እባክዎ የ Vercel Environment Variables ያረጋግጡ።`,
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
        text: isEn ? "Please enter a news script to broadcast" : "እባክዎ መጀመሪያ የሚነበበውን የዜና ጽሑፍ ያስገቡ",
      });
      return;
    }

    // Check if user account is suspended by admin!
    if (profile?.isBlocked) {
      setNotification({
        type: "warning",
        text: isEn
          ? `Broadcasting blocked: Your account has been suspended by the administrator (${profile.blockedReason || "Policy violation"}).`
          : `የእርስዎ መለያ በአድሚኑ ታግዷል፦ ${profile.blockedReason || "የስቱዲዮ ደንብ መጣስ"}። ድምፅ ማመንጨት አይቻልም።`,
      });
      return;
    }

    // Admin content moderation check
    const lowerText = rawText.toLowerCase();
    const violation = bannedWords.find((w) => lowerText.includes(w.toLowerCase()));
    if (violation) {
      setNotification({
        type: "warning",
        text: isEn
          ? `Broadcasting blocked: Script contains prohibited term ("${violation}") flagged by admin moderation!`
          : `ስርጭቱ ተከልክሏል፦ ጽሑፉ በአድሚኑ የተከለከለ ቃል («${violation}») ይዟል! እባክዎ ጽሑፉን ያርሙ።`,
      });
      return;
    }

    handleStop();
    setIsLoading(true);
    setStatusMessage(
      isEn
        ? "Synthesizing broadcast audio with neural anchor voice..."
        : "የስቱዲዮ ድምፅ በዜና አንባቢ ስቱዲዮው ስልት በማዘጋጀት ላይ..."
    );

    studioAudio.init();
    studioAudio.setMusicVolume(settings.musicVolume);
    studioAudio.setSpeechRate(settings.speechRate);
    studioAudio.setSpeechPitch(settings.speechPitch);
    studioAudio.setAutoEq(settings.autoEq ?? true);

    // Phonetically clean script with custom pronunciation dictionary (for Amharic)
    const spokenText = isEn ? rawText : normalizeAmharicForSpeech(rawText, dictionary);

    try {
      // Start recording master mix for download export
      studioAudio.startRecording();

      // 1. Play intro stinger if enabled
      if (settings.includeIntroStinger && settings.introSoundEffect !== "none") {
        setStatusMessage(isEn ? "🚨 Playing intro sound stinger..." : "🚨 የዜና መግቢያ ድምፅ ተፅዕኖ...");
        await studioAudio.playSoundEffect(settings.introSoundEffect);
      }

      // 2. Start background music bed
      if (settings.musicBed !== "none") {
        studioAudio.startMusicBed(settings.musicBed);
      }

      // 3. Check if this is one of our anchor's sample scripts with pre-rendered studio audio (Amharic only)
      if (!isEn && selectedAnchor.sampleAudioUrl && (spokenText.includes(selectedAnchor.nameAmharic) || rawText === selectedAnchor.sampleText)) {
        setStatusMessage(`🎙️ በ${selectedAnchor.nameAmharic} ስቱዲዮ ድምፅ በመነበብ ላይ ነው...`);
        setIsLoading(false);
        setIsPlaying(true);
        await studioAudio.playAudioUrl(selectedAnchor.sampleAudioUrl);
        finishBroadcast();
        return;
      }

      // 4. Request high-fidelity Gemini 3.8 Neural Audio from server
      setStatusMessage(
        isEn
          ? `🎙️ Broadcasting live with ${selectedAnchor.nameEnglish || selectedAnchor.nameAmharic}...`
          : `🎙️ በ${selectedAnchor.nameAmharic} ድምፅ በመነበብ ላይ ነው...`
      );

      const ttsResponse = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: spokenText,
          voice: selectedAnchor.geminiVoice,
          style: (() => {
            const baseStyle = isEn
              ? (selectedAnchor.styleDirectiveEnglish || selectedAnchor.styleDirective)
              : selectedAnchor.styleDirective;
            if (settings.speechRate <= 0.88) {
              return `${baseStyle} Deliver in a deliberate, solemn, measured cadence with thoughtful pacing.`;
            } else if (settings.speechRate >= 1.20) {
              return `${baseStyle} Deliver in a fast-paced, high-tempo, urgent breaking news delivery.`;
            } else if (settings.speechRate >= 1.08) {
              return `${baseStyle} Deliver in a dynamic, brisk broadcast tempo.`;
            }
            return baseStyle;
          })(),
          language: isEn ? "en" : "am",
        }),
      });

      if (ttsResponse.ok) {
        const ttsData = await ttsResponse.json();
        if (ttsData.audioBase64) {
          setIsLoading(false);
          setIsPlaying(true);
          // Play the 24kHz studio master WAV
          await studioAudio.playWavAudio(ttsData.audioBase64);
          finishBroadcast();
          return;
        }
      }

      // If the response failed
      const errData = await ttsResponse.json().catch(() => ({}));
      setIsLoading(false);
      studioAudio.stopMusicBed();

      if (errData?.missingApiKey || ttsResponse.status === 401) {
        setNotification({
          type: "warning",
          text: "⚠️ በ Vercel ላይ GEMINI_API_KEY አልተገኘም! እባክዎ Vercel Settings > Environment Variables ውስጥ GEMINI_API_KEY ያስገቡ። ወደ ሮቦት ድምፅ እንዳይቀየር ቆሟል።",
        });
        setStatusMessage("GEMINI_API_KEY አልተገኘም (Vercel Settings ያረጋግጡ)");
      } else if (errData?.isQuota || ttsResponse.status === 429) {
        setNotification({
          type: "warning",
          text: "⚠️ የ Gemini API ዕለታዊ የነፃ ኮታ ገደብ ደርሷል። እባክዎ ጥቂት ደቂቃዎች ቆይተው እንደገና ይሞክሩ።",
        });
        setStatusMessage("የኤፒአይ ኮታ ገደብ ደርሷል (እባክዎ ቆይተው ይሞክሩ)");
      } else {
        setNotification({
          type: "warning",
          text: `⚠️ የድምፅ ኤፒአይ ምላሽ አልሰጠም (${errData?.error || "Error"})። የሮቦት ድምፅ እንዳይገባ ስርጭቱ ተቋርጧል።`,
        });
        setStatusMessage("ድምፅ ማመንጨት አልተቻለም");
      }

      setIsPlaying(false);
    } catch (err: any) {
      console.error("TTS fetch error:", err);
      setIsLoading(false);
      setIsPlaying(false);
      studioAudio.stopMusicBed();
      setNotification({
        type: "warning",
        text: "⚠️ የስቱዲዮ ድምፅ ሰርቨሩ አልተገናኘም። በ Vercel ላይ GEMINI_API_KEY መግባቱን ያረጋግጡ።",
      });
      setStatusMessage("የግንኙነት ችግር አጋጥሟል");
    }
  };

  const finishBroadcast = async () => {
    // 1. Play outro stinger if enabled
    if (settings.includeOutroStinger && settings.outroSoundEffect && settings.outroSoundEffect !== "none") {
      setStatusMessage(isEn ? "📺 Playing news outro stinger..." : "📺 የዜና መዝጊያ ጅንግል...");
      await studioAudio.playSoundEffect(settings.outroSoundEffect);
    }

    // Let background music play briefly, then stop
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
    }, 1000);
  };

  // Apply voice style & music matching script emotional tone
  const handleApplyToneSettings = (toneSettings: {
    anchorId: string;
    speechRate: number;
    musicBed: MusicBedType;
  }) => {
    const targetAnchor = FANA_ANCHORS.find((a) => a.id === toneSettings.anchorId);
    if (targetAnchor) {
      setSelectedAnchor(targetAnchor);
    }
    updateSettings({
      selectedAnchorId: toneSettings.anchorId,
      speechRate: toneSettings.speechRate,
      musicBed: toneSettings.musicBed,
    });
    setNotification({
      type: "success",
      text: isEn ? "Applied voice style matching script tone" : "የስክሪፕቱ የስሜት ቃና እና ድምፅ ተተግብሯል",
    });
  };

  // Preview Intro Stinger only
  const handlePreviewStinger = async () => {
    studioAudio.init();
    await studioAudio.playSoundEffect(settings.introSoundEffect);
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
      const spokenText = isEn ? script : normalizeAmharicForSpeech(script, dictionary);
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: spokenText,
          voice: selectedAnchor.geminiVoice,
          style: isEn
            ? (selectedAnchor.styleDirectiveEnglish || selectedAnchor.styleDirective)
            : selectedAnchor.styleDirective,
          language: isEn ? "en" : "am",
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

  const handleUpdateEditedAudio = (newBlob: Blob, newUrl: string) => {
    setExportedAudioBlob(newBlob);
    setExportedAudioUrl(newUrl);
    setNotification({
      type: "success",
      text: "የተስተካከለው የድምፅ ፋይል ተዘጋጅቷል",
    });
  };

  const { wordCount, durationSeconds } = calculateAmharicDuration(script, settings.speechRate);

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-100 p-4 font-sans selection:bg-amber-500">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 p-0.5 shadow-2xl shadow-red-900/50 flex items-center justify-center animate-pulse mb-4">
          <Radio className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-lg font-bold text-white tracking-wide">ዜና አንባቢ ስቱዲዮው</h1>
        <div className="text-xs text-neutral-400 mt-2 font-mono flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>የስቱዲዮ መለያ እና ደህንነት በመረጋገጥ ላይ...</span>
        </div>
      </div>
    );
  }

  // Mandatory Authentication Gate: Unauthenticated users cannot access the studio
  if (!user) {
    return <StudioAuthGate />;
  }

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
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Account Suspended Banner */}
        {profile?.isBlocked && (
          <div className="bg-red-950/90 border border-red-600/80 text-red-200 px-4 py-3.5 rounded-2xl text-xs flex items-center justify-between shadow-2xl shadow-red-950/60 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-900 border border-red-500/80 flex items-center justify-center shrink-0">
                <Ban className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-red-100 text-sm">
                  {isEn ? "Studio Account Suspended by Administrator" : "የስቱዲዮ መለያዎ በአድሚኑ ታግዷል (Account Suspended)"}
                </p>
                <p className="text-red-300 font-mono text-xs mt-0.5">
                  {isEn
                    ? `Reason: ${profile.blockedReason || "Violation of newsroom editorial standards"}`
                    : `የእገዳ ምክንያት፦ ${profile.blockedReason || "የስቱዲዮ እና የዜና አዘጋጅ ደንብ መጣስ"}`}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-red-900 text-red-200 font-mono text-[10px] font-bold border border-red-700 uppercase">
              {isEn ? "Access Restricted" : "ተገድቧል"}
            </span>
          </div>
        )}

        {/* System Notice Banner (Broadcast from Admin) */}
        {systemNotice && (
          <div className="bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/60 border border-amber-500/60 text-amber-200 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xl animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="font-bold text-amber-300 block text-xs">
                  {isEn ? "Studio Notice (from Editorial Director)፦" : "የስቱዲዮ ማስታወቂያ (ከዋና አዘጋጅ/አድሚን)፦"}
                </span>
                <span className="text-neutral-200 text-xs">{systemNotice}</span>
              </div>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleUpdateSystemNotice(null)}
                className="text-[11px] text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 transition-colors"
                title="ማስታወቂያውን አስወግድ"
              >
                {isEn ? "Dismiss" : "አስወግድ"}
              </button>
            )}
          </div>
        )}

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
          <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden">
            <img
              src="/images/studio_hero.jpg"
              alt="Fana Newsroom Studio Desk"
              className="w-full h-full object-cover object-center brightness-75 scale-100 hover:scale-105 transition-transform duration-700"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/90 text-white shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    {isEn ? "NEWSROOM STUDIO" : "ዜና አንባቢ ስቱዲዮው"}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    {isEn ? "News Anchor Studio" : "ዜና አንባቢ ስቱዲዮው"}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white text-balance">
                  {isEn ? t("heroTitle") : "የኢትዮጵያ ዜና እና ሶሻል ሚዲያ ድምፅ ስቱዲዮ"}
                </h1>
              </div>

              {/* Utility Shortcuts */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsHeadlineGeneratorOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-800/60 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ርዕስ አመንጭ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDictionaryOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-amber-300 border border-amber-800/60 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>መዝገበ-ቃላት</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTeleprompterOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-cyan-300 border border-cyan-800/60 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>ቴሌፕሮምፕተር</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTalkingAvatarOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600/30 to-red-600/30 hover:from-amber-600/50 hover:to-red-600/50 text-amber-200 border border-amber-500/60 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer shadow-sm"
                >
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  <span>ተንቀሳቃሽ ፎቶ (Avatar)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGraphicsOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-purple-300 border border-purple-800/60 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                >
                  <span>ምስልና ቪዲዮ</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportAudio}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/60 text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>አውርድ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Visualizer & Master Telemetry Console with Clickable Waveform Editor */}
        <AudioVisualizer
          isPlaying={isPlaying}
          anchorName={selectedAnchor.nameAmharic}
          musicBedName={
            settings.musicBed === "breaking"
              ? "ሰበር ዜና ቴማ"
              : settings.musicBed === "prime"
              ? "ዋና ዜና"
              : settings.musicBed === "analysis"
              ? "ትንታኔና ዘገባ"
              : settings.musicBed === "tech"
              ? "ቴክኖሎጂ"
              : "ድምፅ ብቻ"
          }
          elapsedSeconds={elapsedSeconds}
          statusMessage={statusMessage}
          audioBlob={exportedAudioBlob}
          audioUrl={exportedAudioUrl || selectedAnchor.sampleAudioUrl}
          onUpdateAudio={handleUpdateEditedAudio}
        />

        {/* Two-Column Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
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
              onOpenDictionary={() => setIsDictionaryOpen(true)}
              onOpenHeadlineGenerator={() => setIsHeadlineGeneratorOpen(true)}
              isPlaying={isPlaying}
              isLoading={isLoading}
              onPlayClick={handleBroadcast}
              onStopClick={handleStop}
              onOpenDictation={() => setIsDictationOpen(true)}
              onOpenChat={() => setIsChatOpen(true)}
              onOpenGraphics={() => setIsGraphicsOpen(true)}
              onOpen3DStudio={() => setIs3DStudioOpen(true)}
              onOpenTalkingAvatar={() => setIsTalkingAvatarOpen(true)}
              isAdmin={isAdmin}
              onApplyToneSettings={handleApplyToneSettings}
            />

            <StudioControls
              settings={settings}
              updateSettings={updateSettings}
              onPreviewStinger={handlePreviewStinger}
              onExportMixedAudio={handleExportAudio}
              isExporting={isExporting}
              isPlaying={isPlaying}
              onPlaySoundEffect={(type) => studioAudio.playSoundEffect(type)}
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-800 bg-neutral-950/80 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} ዜና አንባቢ ስቱዲዮው · News Audio Production Studio</p>
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
            text: "የተስተካከለው የዜና ስክሪፕት በስቱዲዮው ውስጥ ተተክቷል!",
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

      <DictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        dictionary={dictionary}
        setDictionary={setDictionary}
        onPreviewWord={(word) => {
          studioAudio.init();
          studioAudio.speakWithWebSpeech(word, {
            pitch: selectedAnchor.defaultPitch,
            rate: selectedAnchor.defaultRate,
            voiceGender: selectedAnchor.gender,
          });
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        bannedWords={bannedWords}
        onUpdateBannedWords={handleUpdateBannedWords}
        systemNotice={systemNotice}
        onUpdateSystemNotice={handleUpdateSystemNotice}
      />

      <HeadlineGeneratorModal
        isOpen={isHeadlineGeneratorOpen}
        onClose={() => setIsHeadlineGeneratorOpen(false)}
        onApplyHeadline={handleApplyHeadline}
      />

      <AudioDictationModal
        isOpen={isDictationOpen}
        onClose={() => setIsDictationOpen(false)}
        onAppendScript={handleAppendScript}
      />

      <NewsroomChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentScript={script}
        onInsertText={handleInsertChatText}
      />

      <NewsGraphicsModal
        isOpen={isGraphicsOpen}
        onClose={() => setIsGraphicsOpen(false)}
        currentHeadline={script.split("\n")[0] || "የዜና አንባቢ ስቱዲዮው ዜና"}
        audioBlob={exportedAudioBlob}
        audioUrl={exportedAudioUrl || selectedAnchor.sampleAudioUrl}
        anchorName={selectedAnchor.nameAmharic}
      />

      <Virtual3DStudioModal
        isOpen={is3DStudioOpen}
        onClose={() => setIs3DStudioOpen(false)}
        activeHeadline={script.split("\n")[0] || "የዜና አንባቢ ስቱዲዮው ዜና"}
        anchorName={selectedAnchor.nameAmharic}
        selectedAnchor={selectedAnchor}
        audioBlob={exportedAudioBlob}
        audioUrl={exportedAudioUrl || selectedAnchor.sampleAudioUrl}
        script={script}
        estimatedDurationSeconds={durationSeconds}
        isPlaying={isPlaying}
        onPlayBroadcast={handleBroadcast}
        onStopBroadcast={handleStop}
      />

      <TalkingAvatarModal
        isOpen={isTalkingAvatarOpen}
        onClose={() => setIsTalkingAvatarOpen(false)}
        script={script}
        activeHeadline={NEWS_PRESETS[0].headlineAmharic}
        isPlaying={isPlaying}
        onPlayBroadcast={handleBroadcast}
        onStopBroadcast={handleStop}
        onUpdateScript={(newScript) => setScript(newScript)}
      />
    </div>
  );
}
