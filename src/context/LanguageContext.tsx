import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "am" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  am: {
    // Header & Brand
    studioTitle: "ዜና አንባቢ ስቱዲዮው",
    studioTagline: "የዜና ስቱዲዮ",
    navMainStudio: "ዋና ስቱዲዮ (Studio)",
    navAnchors: "አንባቢዎች (Anchors)",
    navAudioMix: "ድምፅ ማቀናበሪያ (Mix)",
    navDictionary: "መዝገበ-ቃላት (Dict)",
    signOut: "ውጣ",
    signIn: "ግባ",
    adminDashboard: "አድሚን",
    langToggle: "English",

    // Hero Banner
    heroBadge: "የቀጥታ ስቱዲዮ",
    heroOrgName: "ዜና አንባቢ ስቱዲዮው",
    heroTitle: "የኢትዮጵያ ዜና እና ሶሻል ሚዲያ ድምፅ ስቱዲዮ",
    heroDescription:
      "ስቴዲዮ ለሌላቸው የቲክቶክ፣ ዩቲዩብ እና ቴሌግራም ዜና አዘጋጆች፤ የተፃፈውን ጽሑፍ በዜና አንባቢ ስቱዲዮው ተፈጥሯዊ የዜና አቀራረብ ስልት ያንብቡ።",
    heroHeadlineBtn: "ርዕስ አመንጭ",

    // Script Studio
    scriptStudioTitle: "የዜና ስክሪፕት ማዘጋጃ (Script Studio)",
    wordsLabel: "ቃላት",
    estDurationLabel: "የሚፈጀው ጊዜ",
    normalizeBtn: "ምህፃረ ቃላት ዘርዝር",
    dictBtn: "መዝገበ-ቃላት",
    copyBtn: "ጽሑፉን ኮፒ አድርግ",
    clearBtn: "አጽዳ",
    dictateBtn: "ድምፅ ተናገር",
    polishBtn: "በዜና ስልት አሳምር",
    headlineGenBtn: "ርዕስ አመንጭ",
    chatBtn: "AI ረዳት",
    graphicsBtn: "የዜና ምስል",
    teleprompterBtn: "ቴሌፕሮምፕተር",
    virtual3dBtn: "3D ስቱዲዮ",
    broadcastLiveStatus: "የቀጥታ ስርጭት ስቱዲዮ",
    startBroadcast: "ዜናውን አንብብ (Start Broadcast)",
    stopBroadcast: "ስርጭቱን አቁም (Stop)",
    generatingAudio: "ድምፅ በመፍጠር ላይ...",

    // Visualizer & Status
    studioReady: "ስቱዲዮው ዝግጁ ነው",
    broadcastingLive: "የቀጥታ ስርጭት በመካሄድ ላይ ነው...",
    audioTelemetry: "የድምፅ ፍሪኩዌንሲና የሞገድ ሁኔታ",
    musicBed: "ሙዚቃ",
    activeAnchor: "የተመረጠ አንባቢ",
    elapsedTime: "የፈጀው ጊዜ",

    // Controls
    controlsTitle: "የድምፅ ማስተካከያ እና ሙዚቃዎች (Studio Controls)",
    speechRate: "የማንበቢያ ፍጥነት",
    speechPitch: "የድምፅ ቃና (Pitch)",
    musicBedTitle: "የዜና ዳራ ሙዚቃ (News Music Bed)",
    autoDucking: "ራስ-ሰር ዳኪንግ (Auto-Ducking)",
    autoEq: "Auto-EQ",
    introStinger: "የዜና መግቢያ ድምፅ (Intro Sound FX)",
    soundEffects: "የስቱዲዮ ድምፅ ተፅዕኖዎች (Sound Effects)",
    exportWav: "የድምፅ ፋይል አውርድ (Export WAV)",

    // Anchors
    anchorsTitle: "ከፍተኛ የዜና አንባቢዎች (Voice Anchors)",
    previewVoice: "ድምፁን አድምጥ",
    selectAnchor: "ምረጥ",
    activeBadge: "የተመረጠ",

    // Admin
    adminConsoleTitle: "የስቱዲዮ አድሚን መቆጣጠሪያ ዳሽቦርድ (Admin Console)",
    registeredUsers: "የተመዘገቡ ተጠቃሚዎች",
    activeUsers: "ንቁ ተጠቃሚዎች",
    suspendedUsers: "የታገዱ ተጠቃሚዎች",
    blockUser: "አግድ (Suspend)",
    unblockUser: "እገዳ አንሳ (Restore)",
    deleteUser: "አካውንት ሰርዝ",
    roleUser: "ተጠቃሚ (User)",
    roleEditor: "ኤዲተር (Editor)",
    roleAdmin: "አድሚን (Admin)",
    confirmBlock: "ተጠቃሚውን ማገድ ይፈልጋሉ?",
    confirmUnblock: "የተጠቃሚውን እገዳ ማንሳት ይፈልጋሉ?",
    contentModeration: "የይዘት እና የስክሪፕት ቁጥጥር",
    systemNotice: "የስቱዲዮ አጠቃላይ ማስታወቂያ",
  },
  en: {
    // Header & Brand
    studioTitle: "News Anchor Studio",
    studioTagline: "News Studio",
    navMainStudio: "Main Studio",
    navAnchors: "Voice Anchors",
    navAudioMix: "Audio Mix",
    navDictionary: "Dictionary",
    signOut: "Sign Out",
    signIn: "Sign In",
    adminDashboard: "Admin",
    langToggle: "አማርኛ",

    // Hero Banner
    heroBadge: "LIVE BROADCAST",
    heroOrgName: "News Anchor Studio",
    heroTitle: "Broadcast News & Social Media Audio Production Studio",
    heroDescription:
      "Transform written news stories into realistic, high-fidelity broadcast news audio. Perfect for creators, podcasters, and newsrooms.",
    heroHeadlineBtn: "Headline AI",

    // Script Studio
    scriptStudioTitle: "News Script Studio",
    wordsLabel: "words",
    estDurationLabel: "Est. duration",
    normalizeBtn: "Expand Abbreviations",
    dictBtn: "Dictionary",
    copyBtn: "Copy Script",
    clearBtn: "Clear",
    dictateBtn: "Dictate",
    polishBtn: "AI Polish",
    headlineGenBtn: "Generate Headline",
    chatBtn: "AI Assistant",
    graphicsBtn: "News Graphic",
    teleprompterBtn: "Teleprompter",
    virtual3dBtn: "3D Studio",
    broadcastLiveStatus: "Live Broadcast Studio",
    startBroadcast: "Read News (Start Broadcast)",
    stopBroadcast: "Stop Broadcast",
    generatingAudio: "Synthesizing Neural Audio...",

    // Visualizer & Status
    studioReady: "Studio is ready",
    broadcastingLive: "Live broadcast is in progress...",
    audioTelemetry: "Audio frequency & waveform telemetry",
    musicBed: "Music Bed",
    activeAnchor: "Selected Anchor",
    elapsedTime: "Elapsed Time",

    // Controls
    controlsTitle: "Audio Settings & Music Beds",
    speechRate: "Speech Rate",
    speechPitch: "Speech Pitch",
    musicBedTitle: "News Background Music Bed",
    autoDucking: "Auto-Ducking (Lower music during speech)",
    autoEq: "Auto-EQ",
    introStinger: "Intro Sound Effect (Stinger)",
    soundEffects: "Studio Sound Effects & Alerts",
    exportWav: "Export WAV Audio",

    // Anchors
    anchorsTitle: "Senior Broadcast News Anchors",
    previewVoice: "Preview Voice",
    selectAnchor: "Select",
    activeBadge: "Selected",

    // Admin
    adminConsoleTitle: "Studio Administrator Control Dashboard",
    registeredUsers: "Registered Journalists",
    activeUsers: "Active Accounts",
    suspendedUsers: "Suspended Accounts",
    blockUser: "Suspend User",
    unblockUser: "Restore User",
    deleteUser: "Delete Account",
    roleUser: "Journalist (User)",
    roleEditor: "Senior Editor",
    roleAdmin: "Super Admin",
    confirmBlock: "Are you sure you want to suspend this user?",
    confirmUnblock: "Are you sure you want to restore this user?",
    contentModeration: "Content & Script Moderation",
    systemNotice: "System Broadcast Notice",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("fana_studio_language");
      if (stored === "en" || stored === "am") return stored;
    } catch {}
    return "am";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("fana_studio_language", lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "am" ? "en" : "am");
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.am[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
