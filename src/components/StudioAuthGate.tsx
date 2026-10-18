import React, { useState } from "react";
import {
  Lock,
  Mail,
  User as UserIcon,
  KeyRound,
  ArrowRight,
  Loader2,
  Crown,
  Radio,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Tv,
  Headphones,
  Sliders,
} from "lucide-react";
import { useAuth, ADMIN_EMAIL } from "../context/AuthContext";

export const StudioAuthGate: React.FC = () => {
  const { signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        if (!email.trim() || !password) {
          throw new Error("እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ");
        }
        await signInWithEmail(email, password);
      } else if (mode === "register") {
        if (!email.trim() || !password) {
          throw new Error("እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ");
        }
        if (password.length < 6) {
          throw new Error("የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት");
        }
        await signUpWithEmail(email, password, displayName);
      } else if (mode === "reset") {
        if (!email.trim()) {
          throw new Error("እባክዎ የይለፍ ቃል መቀየሪያ የሚላክበትን ኢሜይል ያስገቡ");
        }
        await sendPasswordReset(email);
        setSuccessMessage("የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል! እባክዎ ኢሜይልዎን ይክፈቱ።");
      }
    } catch (err: any) {
      console.warn("Auth Gate note:", err?.code || err?.message);
      let msg = "ስህተት አጋጥሟል፤ እባክዎ እንደገና ይሞክሩ";
      const code = err?.code || "";
      const text = String(err?.message || "");

      if (code === "auth/invalid-credential" || text.includes("invalid-credential")) {
        msg = "የተሳሳተ ኢሜይል ወይም የይለፍ ቃል። አካውንት ከሌልዎት «አካውንት ክፈት» የሚለውን ይጫኑ።";
      } else if (code === "auth/user-not-found" || text.includes("user-not-found")) {
        msg = "በዚህ ኢሜይል የተመዘገበ አካውንት አልተገኘም። እባክዎ መጀመሪያ ይመዝገቡ።";
      } else if (code === "auth/wrong-password" || text.includes("wrong-password")) {
        msg = "የተሳሳተ የይለፍ ቃል። እባክዎ እንደገና ያረጋግጡ።";
      } else if (code === "auth/email-already-in-use" || text.includes("email-already-in-use")) {
        msg = "ይህ ኢሜይል አስቀድሞ ተመዝግቧል። እባክዎ «ግባ» የሚለውን ተጠቅመው ይግቡ።";
      } else if (code === "auth/weak-password" || text.includes("weak-password")) {
        msg = "የይለፍ ቃሉ ደካማ ነው፤ እባክዎ ቢያንስ 6 ፊደላት ወይም ምልክቶች ይጠቀሙ።";
      } else if (err?.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail(ADMIN_EMAIL);
    setPassword("0908#@&$Wo*");
    setMode("login");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Top Ambient Light Strip */}
      <div className="w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 shadow-md shadow-amber-500/20" />

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Brand Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl shadow-black/60">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-900/40 flex items-center justify-center">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="text-sm font-extrabold text-white tracking-wider block">
                  ፋና ብሮድካስቲንግ ኮርፖሬት
                </span>
                <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase block">
                  FANA VOICE NEWS STUDIO
                </span>
              </div>
              <div className="ml-2 pl-3 border-l border-neutral-800 flex items-center gap-1.5 text-[11px] text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>ON AIR</span>
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ወደ ዜና ስቱዲዮው ይግቡ
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
                የፋና ድምፅ ዜና ስቱዲዮን ለመጠቀም እና ሙሉ የስቱዲዮ መሣሪያዎችን ለማግኘት አስቀድመው አካውንት ይክፈቱ ወይም ይግቡ።
              </p>
            </div>
          </div>

          {/* Access Protected Card */}
          <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden backdrop-blur-xl">
            {/* Lock Banner */}
            <div className="p-3.5 bg-gradient-to-r from-red-950/40 via-amber-950/30 to-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>የተጠበቀ የስቱዲዮ መግቢያ (Protected Studio Access)</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                AUTH REQUIRED
              </span>
            </div>

            {/* Tab Switcher */}
            <div className="grid grid-cols-3 border-b border-neutral-800 bg-neutral-950 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-3 transition-colors ${
                  mode === "login"
                    ? "text-amber-400 border-b-2 border-amber-500 bg-neutral-900/60 font-bold"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
                }`}
              >
                ግባ (Sign In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-3 transition-colors ${
                  mode === "register"
                    ? "text-amber-400 border-b-2 border-amber-500 bg-neutral-900/60 font-bold"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
                }`}
              >
                አካውንት ክፈት (Register)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("reset");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-3 transition-colors ${
                  mode === "reset"
                    ? "text-amber-400 border-b-2 border-amber-500 bg-neutral-900/60 font-bold"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/30"
                }`}
              >
                የይለፍ ቃል
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{successMessage}</span>
                </div>
              )}

              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    ሙሉ ስም (Full Name)
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="የእርስዎ ሙሉ ስም"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  ኢሜይል አድራሻ (Email Address)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {mode !== "reset" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-neutral-300">
                      የይለፍ ቃል (Password)
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => setMode("reset")}
                        className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        የይለፍ ቃል ጠፋብዎት?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="ቢያንስ 6 ፊደላት"
                      className="w-full bg-neutral-950 border border-neutral-700/80 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>በማረጋገጥ ላይ...</span>
                  </>
                ) : mode === "login" ? (
                  <>
                    <span>ወደ ስቱዲዮው ግባ (Enter Studio)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === "register" ? (
                  <>
                    <span>አካውንት ፈጥረህ ግባ (Create & Enter)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>የይለፍ ቃል መቀየሪያ ሊንክ ላክ (Send Link)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Admin Credentials Shortcut */}
              <div className="pt-3 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>የአድሚን አካውንት ሙላ (Admin: {ADMIN_EMAIL})</span>
                </button>
                <p className="text-[10px] text-center text-neutral-500 mt-1.5">
                  የአድሚን መለያን በ 1-ጠቅታ ሞልተው በቀጥታ መግባት ይችላሉ
                </p>
              </div>
            </form>
          </div>

          {/* News Studio Feature Highlights */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/70 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Headphones className="w-4 h-4 text-amber-400" />
                <span>10+ የዜና አንባቢዎች</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                የወንድ እና የሴት ከፍተኛ የፋና ዜና አንባቢዎች ድምፅ
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/70 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-300">
                <Sliders className="w-4 h-4 text-red-400" />
                <span>የስቱዲዮ ድምፅ ተፅዕኖዎች</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Intro Stingers, Breaking News Alert, Reverb እና Ducking
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/70 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>3D ቨርቹዋል ስቱዲዮ</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                ባለ 3-ልኬት ምናባዊ የዜና ክፍሎች እና ካሜራ ቅንብሮች
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/70 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>የአድሚን ጥበቃ</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                ዳታ የማጥፋት ፈቃድ በአስተማማኝ ሁኔታ ለአድሚን ብቻ የተገደበ
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[11px] text-neutral-500 pt-2 font-mono">
            Fana Broadcasting Corporate • News Audio Production Studio © 2026
          </div>
        </div>
      </div>
    </div>
  );
};
