import React, { useEffect, useState } from "react";
import {
  Crown,
  ShieldCheck,
  Users,
  Database,
  Radio,
  Server,
  X,
  CheckCircle,
  FileText,
  Activity,
  Lock,
  LogOut,
} from "lucide-react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { handleFirestoreError, OperationType } from "../firebase/errorHandler";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, logout } = useAuth();
  const [userCount, setUserCount] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(query(collection(db, "users"), limit(50)));
        setUserCount(Math.max(1, usersSnap.size));
      } catch (err) {
        console.warn("Could not fetch user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-black/80 text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-neutral-950 to-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  የስቱዲዮ አድሚን ዳሽቦርድ (Admin Console)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                {user?.email || "workumesafint2@gmail.com"}
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

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>የተመዘገቡ ተጠቃሚዎች</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-white font-mono">{userCount}</p>
            </div>

            <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>የዳታቤዝ ሁኔታ</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore Active</span>
              </p>
            </div>

            <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>የብሮድካስት ሞተር</span>
                <Radio className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xs font-bold text-neutral-200 mt-1">
                Gemini 3.8 Neural Audio
              </p>
            </div>
          </div>

          {/* Admin Credentials Info */}
          <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h3 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>የአድሚን መለያ መረጃ (Admin Account Security)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">ADMIN EMAIL</span>
                <span className="text-amber-300 font-semibold">{user?.email || "workumesafint2@gmail.com"}</span>
              </div>
              <div className="p-2 rounded bg-neutral-900 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">SECURITY LEVEL</span>
                <span className="text-emerald-400 font-semibold">Tier 1 Full Control</span>
              </div>
            </div>
          </div>

          {/* Cloud Firestore Security Rules Status */}
          <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-2">
            <h3 className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>የዳታቤዝ ደህንነት ህግጋት (Security Rules Status)</span>
            </h3>

            <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
              <li>ተጠቃሚዎች የራሳቸውን ዜናዎች እና መዝገበ-ቃላት ብቻ ያያሉ (Strict Ownership)</li>
              <li>አድሚኑ ({user?.email}) ሙሉ የዳታቤዝ እና የአስተዳዳሪ ፈቃድ አለው</li>
              <li>የይለፍ ቃል መቀየሪያ (Password Reset) በኢሜይል እንዲላክ ተደርጓል</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>ከአድሚን ውጣ (Sign Out)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ዝጋ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
