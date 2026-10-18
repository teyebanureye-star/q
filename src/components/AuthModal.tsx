import React, { useState } from "react";
import {
  Lock,
  Mail,
  User as UserIcon,
  X,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Crown,
} from "lucide-react";
import { useAuth, ADMIN_EMAIL } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register" | "reset";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
}) => {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

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
        onClose();
      } else if (mode === "register") {
        if (!email.trim() || !password) {
          throw new Error("እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ");
        }
        if (password.length < 6) {
          throw new Error("የይለፍ ቃል ቢያንስ 6 ፊደላት መሆን አለበት");
        }
        await signUpWithEmail(email, password, displayName);
        onClose();
      } else if (mode === "reset") {
        if (!email.trim()) {
          throw new Error("እባክዎ የይለፍ ቃል መቀየሪያ የሚላክበትን ኢሜይል ያስገቡ");
        }
        await sendPasswordReset(email);
        setSuccessMessage("የይለፍ ቃል መቀየሪያ ሊንክ ወደ ኢሜይልዎ ተልኳል! እባክዎ ኢሜይልዎን ይክፈቱ።");
      }
    } catch (err: any) {
      console.warn("Auth note:", err?.code || err?.message);
      let msg = "ስህተት አጋጥሟል፤ እባክዎ እንደገና ይሞክሩ";
      const code = err?.code || "";
      const text = String(err?.message || "");

      if (
        code === "auth/invalid-credential" ||
        text.includes("invalid-credential") ||
        code === "auth/user-not-found" ||
        code === "auth/wrong-password"
      ) {
        msg = "የተሳሳተ ኢሜይል ወይም የይለፍ ቃል አስገብተዋል፤ ወይም አካውንቱ ገና አልተመዘገበም። እባክዎ 'ተመዝገብ' የሚለውን ተጭነው ይመዝገቡ ወይም የይለፍ ቃል ይቀይሩ።";
      } else if (code === "auth/email-already-in-use" || text.includes("email-already-in-use")) {
        msg = "ይህ ኢሜይል አስቀድሞ ተመዝግቧል። እባክዎ 'ግባ' የሚለውን በመጫን ይግቡ።";
      } else if (code === "auth/weak-password" || text.includes("weak-password")) {
        msg = "የይለፍ ቃል ቢያንስ 6 ፊደላት ወይም ቁጥሮች መሆን አለበት።";
      } else if (code === "auth/invalid-email" || text.includes("invalid-email")) {
        msg = "እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።";
      } else if (code === "auth/network-request-failed" || text.includes("network")) {
        msg = "የኔትወርክ መቋረጥ አጋጥሟል። እባክዎ ኢንተርኔትዎን አረጋግጠው እንደገና ይሞክሩ።";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/80 text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === "login"
                  ? "ወደ ስቱዲዮው ይግቡ (Sign In)"
                  : mode === "register"
                  ? "አዲስ አካውንት ይክፈቱ (Register)"
                  : "የይለፍ ቃል መቀየሪያ (Reset Password)"}
              </h2>
              <p className="text-[11px] text-neutral-400">
                የዜና አንባቢ ስቱዲዮው አባልነት
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
                ? "text-amber-400 border-b-2 border-amber-400 bg-neutral-900/40"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ግባ (Login)
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
                ? "text-amber-400 border-b-2 border-amber-400 bg-neutral-900/40"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ተመዝገብ (Sign Up)
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
                ? "text-amber-400 border-b-2 border-amber-400 bg-neutral-900/40"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ይለፍ ቃል (Reset)
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                ሙሉ ስም (Full Name)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="የእርስዎ ሙሉ ስም"
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              ኢሜይል አድራሻ (Email Address)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none font-sans"
              />
            </div>
          </div>

          {mode !== "reset" && (
            <div>
              <div className="flex items-center justify-between mb-1">
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
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ቢያንስ 6 ፊደላት"
                  className="w-full bg-neutral-950 border border-neutral-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold rounded-lg shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>በማረጋገጥ ላይ...</span>
              </>
            ) : mode === "login" ? (
              <>
                <span>ግባ (Sign In)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === "register" ? (
              <>
                <span>ተመዝገብ (Create Account)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>የይለፍ ቃል መቀየሪያ ላክ (Send Reset Link)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Admin Credentials Shortcut */}
          <div className="pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>የአድሚን አካውንት ሙላ (Admin: workumesafint2@gmail.com)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
