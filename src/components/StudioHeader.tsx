import React from "react";
import { Radio, Mic, Play, Square, Loader2, User, LogOut, Crown, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

interface StudioHeaderProps {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayClick: () => void;
  onStopClick: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenDictionary?: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  isPlaying,
  isLoading,
  onPlayClick,
  onStopClick,
  activeSection,
  setActiveSection,
  onOpenDictionary,
  onOpenAuth,
  onOpenAdmin,
}) => {
  const { user, profile, isAdmin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 via-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-950/40">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap block leading-tight">
              {language === "am" ? "ዜና አንባቢ ስቱዲዮው" : "News Anchor Studio"}
            </span>
            <span className="text-[10px] text-amber-400 font-mono tracking-wider block">
              {language === "am" ? "NEWS AUDIO STUDIO" : "BROADCAST NEWS AUDIO"}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden xl:flex items-center gap-5 lg:gap-7 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveSection("studio")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeSection === "studio" ? "text-amber-400 font-semibold" : ""
            }`}
          >
            {t("navMainStudio")}
          </button>
          <button
            onClick={() => setActiveSection("anchors")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeSection === "anchors" ? "text-amber-400 font-semibold" : ""
            }`}
          >
            {t("navAnchors")}
          </button>
          <button
            onClick={() => setActiveSection("controls")}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-white ${
              activeSection === "controls" ? "text-amber-400 font-semibold" : ""
            }`}
          >
            {t("navAudioMix")}
          </button>
          <button
            onClick={() => onOpenDictionary?.()}
            className="transition-colors whitespace-nowrap shrink-0 hover:text-amber-300 text-neutral-300 flex items-center gap-1"
          >
            <span>{t("navDictionary")}</span>
          </button>
        </nav>

        {/* Zone 3: Language Toggle, Auth & Primary Broadcast CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Toggle Component */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 hover:border-amber-500/60 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-sm cursor-pointer"
            title={language === "am" ? "Switch to English interface and audio" : "ወደ አማርኛ በይነገፅና ድምፅ ቀይር"}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-xs font-bold text-amber-300">
              {language === "am" ? "EN" : "አማ"}
            </span>
            <span className="hidden md:inline text-[11px] text-neutral-400 font-normal">
              {language === "am" ? "English" : "አማርኛ"}
            </span>
          </button>

          {/* User / Admin Auth Badge */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-sm hover:from-amber-500/30 hover:to-amber-600/30 transition-all cursor-pointer"
                  title="የአድሚን መቆጣጠሪያ ዳሽቦርድ"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{t("adminDashboard")}</span>
                </button>
              )}

              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 font-sans">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                <span className="max-w-28 truncate">{profile?.displayName || user.email?.split("@")[0]}</span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-900 hover:bg-red-950/80 border border-neutral-700/80 hover:border-red-600/80 rounded-lg transition-all shadow-sm cursor-pointer"
                title="ከአካውንት ውጣ (Sign Out)"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">{t("signOut")}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs text-neutral-200 font-semibold transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("signIn")}</span>
            </button>
          )}

          {/* Primary CTA */}
          {isPlaying ? (
            <button
              onClick={onStopClick}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-900/40 transition-all whitespace-nowrap cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t("stopBroadcast")}</span>
            </button>
          ) : (
            <button
              onClick={onPlayClick}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-lg shadow-amber-950/40 transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("generatingAudio")}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t("startBroadcast")}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
