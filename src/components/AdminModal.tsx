import React, { useEffect, useState } from "react";
import {
  Crown,
  ShieldCheck,
  Users,
  Database,
  Radio,
  X,
  CheckCircle,
  FileText,
  Activity,
  Lock,
  LogOut,
  Ban,
  ShieldAlert,
  Search,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Bell,
  Sliders,
  Filter,
} from "lucide-react";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth, UserProfile, ADMIN_EMAIL } from "../context/AuthContext";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemNotice?: string | null;
  onUpdateSystemNotice?: (notice: string | null) => void;
  bannedWords?: string[];
  onUpdateBannedWords?: (words: string[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  systemNotice,
  onUpdateSystemNotice,
  bannedWords = [],
  onUpdateBannedWords,
}) => {
  const { user, profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "moderation" | "notice" | "health">("users");

  // User Management State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked" | "admins">("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // In-modal dialog states (no window.prompt/confirm/alert)
  const [suspendTarget, setSuspendTarget] = useState<{ user: UserProfile; reason: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  // Moderation state
  const [newBannedWord, setNewBannedWord] = useState<string>("");
  const [noticeText, setNoticeText] = useState<string>(systemNotice || "");
  const [inspectText, setInspectText] = useState<string>("");
  const [inspectionResult, setInspectionResult] = useState<string[] | null>(null);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list: UserProfile[] = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data() as UserProfile);
      });

      // Ensure current user or admin is visible if empty
      if (list.length === 0 && user) {
        list.push({
          id: user.uid,
          email: user.email || ADMIN_EMAIL,
          displayName: user.displayName || "ዋና አድሚን",
          role: "admin",
          createdAt: new Date().toISOString(),
        });
      }

      setUsersList(list);
    } catch (err: any) {
      console.warn("Could not fetch users list:", err);
      setActionError("የተጠቃሚዎችን ዝርዝር ማምጣት አልተቻለም፦ " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setNoticeText(systemNotice || "");
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Block / Suspend User
  const handleToggleBlock = async (targetUser: UserProfile) => {
    const isCurrentlyBlocked = !!targetUser.isBlocked;

    if (!isCurrentlyBlocked) {
      // Open inline suspend modal with editable reason
      setSuspendTarget({
        user: targetUser,
        reason: "አላስፈላጊ ወይም የተከለከለ የዜና ይዘት በማሰራጨት",
      });
      return;
    }

    // Direct unblock
    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                isBlocked: false,
                blockedReason: undefined,
              }
            : u
        )
      );

      showToast(`የ ${targetUser.email} እገዳ በተሳካ ሁኔታ ተነስቷል!`);
    } catch (err: any) {
      console.error("Failed to update user block status:", err);
      setActionError("የተጠቃሚውን ሁኔታ ማስተካከል አልተቻለም፦ " + (err?.message || ""));
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget) return;
    const { user: targetUser, reason } = suspendTarget;

    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        isBlocked: true,
        blockedReason: reason.trim() || "የስቱዲዮ ደንብ መጣስ",
        blockedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setUsersList((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? {
                ...u,
                isBlocked: true,
                blockedReason: reason.trim() || "የስቱዲዮ ደንብ መጣስ",
              }
            : u
        )
      );

      showToast(`ተጠቃሚ ${targetUser.email} በስኬት ታግዷል!`);
      setSuspendTarget(null);
    } catch (err: any) {
      console.error("Failed to block user:", err);
      setActionError("ተጠቃሚውን ማገድ አልተቻለም፦ " + (err?.message || ""));
    }
  };

  // Change Role
  const handleChangeRole = async (targetUser: UserProfile, newRole: "user" | "editor" | "admin") => {
    if (targetUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && newRole !== "admin") {
      setActionError("የዋናው አድሚን ሚና መቀየር አይቻልም!");
      return;
    }

    try {
      const userRef = doc(db, "users", targetUser.id);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      showToast(`የ ${targetUser.email} ሚና ወደ ${newRole} ተቀይሯል!`);
    } catch (err: any) {
      setActionError("ሚና መቀየር አልተቻለም፦ " + (err?.message || ""));
    }
  };

  // Delete User Account
  const handleDeleteUser = (targetUser: UserProfile) => {
    if (targetUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setActionError("ዋናውን አድሚን መሰረዝ አይቻልም!");
      return;
    }
    setDeleteTarget(targetUser);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDoc(doc(db, "users", deleteTarget.id));
      setUsersList((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      showToast(`የ ${deleteTarget.email} አካውንት ተሰርዟል`);
      setDeleteTarget(null);
    } catch (err: any) {
      setActionError("አካውንቱን መሰረዝ አልተቻለም፦ " + (err?.message || ""));
    }
  };

  // Add Banned Word
  const handleAddBannedWord = (e: React.FormEvent) => {
    e.preventDefault();
    const word = newBannedWord.trim().toLowerCase();
    if (!word) return;
    if (bannedWords.includes(word)) {
      setActionError("ይህ ቃል አስቀድሞ ተመዝግቧል!");
      return;
    }
    const updated = [...bannedWords, word];
    onUpdateBannedWords?.(updated);
    setNewBannedWord("");
    showToast(`«${word}» ወደ ተከለከሉ ቃላት ዝርዝር ታክሏል!`);
  };

  const handleRemoveBannedWord = (word: string) => {
    const updated = bannedWords.filter((w) => w !== word);
    onUpdateBannedWords?.(updated);
    showToast(`«${word}» ከተከለከሉ ቃላት ተወግዷል`);
  };

  const handleInspectText = () => {
    if (!inspectText.trim()) return;
    const lower = inspectText.toLowerCase();
    const found = bannedWords.filter((w) => lower.includes(w.toLowerCase()));
    setInspectionResult(found);
  };

  const handleSaveNotice = () => {
    const clean = noticeText.trim() || null;
    onUpdateSystemNotice?.(clean);
    showToast(clean ? "የስቱዲዮ አጠቃላይ ማስታወቂያ ተሰራጭቷል!" : "ማስታወቂያው ተነስቷል");
  };

  if (!isOpen) return null;

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "active") return !u.isBlocked;
    if (statusFilter === "blocked") return !!u.isBlocked;
    if (statusFilter === "admins") return u.role === "admin";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl shadow-black/90 text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-950/40 via-amber-950/30 to-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-lg shadow-amber-900/40 flex items-center justify-center text-neutral-950 font-black">
              <Crown className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  የስቱዲዮ አድሚን መቆጣጠሪያ ዳሽቦርድ (Admin Console)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                የአድሚን መለያ፦ {user?.email || ADMIN_EMAIL}
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

        {/* Action Toasts */}
        {actionSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-800/80 text-emerald-200 text-xs px-4 py-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="bg-red-950/80 border-b border-red-800/80 text-red-200 text-xs px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-950 px-4 gap-2 overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "users"
                ? "border-amber-500 text-amber-400 font-bold bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>የተጠቃሚዎች ቁጥጥርና እገዳ ({usersList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("moderation")}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "moderation"
                ? "border-amber-500 text-amber-400 font-bold bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Ban className="w-3.5 h-3.5 text-red-400" />
            <span>የይዘት ቁጥጥርና የተከለከሉ ቃላት ({bannedWords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notice")}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "notice"
                ? "border-amber-500 text-amber-400 font-bold bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
            <span>የስቱዲዮ ማስታወቂያ (Notice)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("health")}
            className={`py-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "health"
                ? "border-amber-500 text-amber-400 font-bold bg-neutral-900/60"
                : "border-transparent text-neutral-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>የስርዓት ደህንነት (Security & Health)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto max-h-[70vh] space-y-4">
          {/* TAB 1: USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Top Stats Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block">ጠቅላላ ተጠቃሚዎች</span>
                  <span className="text-xl font-extrabold text-white font-mono">{usersList.length}</span>
                </div>
                <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block">ንቁ አካውንቶች</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {usersList.filter((u) => !u.isBlocked).length}
                  </span>
                </div>
                <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block">የታገዱ (Suspended)</span>
                  <span className="text-xl font-extrabold text-red-400 font-mono">
                    {usersList.filter((u) => !!u.isBlocked).length}
                  </span>
                </div>
                <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block">የስቱዲዮ አድሚኖች</span>
                  <span className="text-xl font-extrabold text-amber-400 font-mono">
                    {usersList.filter((u) => u.role === "admin").length}
                  </span>
                </div>
              </div>

              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-neutral-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="በስም ወይም በኢሜይል ፈልግ..."
                    className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("all")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      statusFilter === "all" ? "bg-amber-500 text-neutral-950 font-bold" : "bg-neutral-900 text-neutral-400 hover:text-white"
                    }`}
                  >
                    ሁሉም ({usersList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("active")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      statusFilter === "active" ? "bg-emerald-500 text-neutral-950 font-bold" : "bg-neutral-900 text-neutral-400 hover:text-white"
                    }`}
                  >
                    ንቁ
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter("blocked")}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      statusFilter === "blocked" ? "bg-red-500 text-white font-bold" : "bg-neutral-900 text-neutral-400 hover:text-white"
                    }`}
                  >
                    የታገዱ
                  </button>
                  <button
                    type="button"
                    onClick={fetchUsers}
                    className="p-1.5 rounded bg-neutral-900 text-neutral-400 hover:text-amber-400 transition-colors ml-1"
                    title="አድስ (Refresh)"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Users Table / List */}
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-10 bg-neutral-950/40 rounded-xl border border-neutral-800 text-xs text-neutral-500">
                    ምንም ተጠቃሚ አልተገኘም
                  </div>
                ) : (
                  filteredUsers.map((item) => {
                    const isMainAdmin = item.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                    const isBlocked = !!item.isBlocked;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          isBlocked
                            ? "bg-red-950/20 border-red-900/60"
                            : "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
                        }`}
                      >
                        {/* User Details */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                              isBlocked
                                ? "bg-red-900/40 text-red-300 border border-red-700/60"
                                : item.role === "admin"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                            }`}
                          >
                            {isBlocked ? <Ban className="w-4 h-4 text-red-400" /> : (item.displayName || item.email || "U")[0]}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-white truncate">
                                {item.displayName || "ስም ያልተሰጠው ጋዜጠኛ"}
                              </span>

                              {/* Role Badge */}
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                  item.role === "admin"
                                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                    : item.role === "editor"
                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                    : "bg-neutral-800 text-neutral-400 border border-neutral-700"
                                }`}
                              >
                                {item.role === "admin" ? "SUPER ADMIN" : item.role === "editor" ? "EDITOR" : "USER"}
                              </span>

                              {/* Status Badge */}
                              {isBlocked ? (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-300 font-bold flex items-center gap-1">
                                  <Ban className="w-2.5 h-2.5" />
                                  <span>ታግዷል (SUSPENDED)</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                                  ACTIVE
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-neutral-400 font-mono mt-0.5 truncate">
                              {item.email}
                            </p>

                            {isBlocked && item.blockedReason && (
                              <p className="text-[11px] text-red-300/90 mt-1 italic">
                                የእገዳ ምክንያት፦ {item.blockedReason}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* Role Toggle Selector */}
                          {!isMainAdmin && (
                            <select
                              value={item.role || "user"}
                              onChange={(e) => handleChangeRole(item, e.target.value as any)}
                              className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-amber-500"
                              title="የተጠቃሚ ሚና ቀይር"
                            >
                              <option value="user">User (ጋዜጠኛ)</option>
                              <option value="editor">Editor (አዘጋጅ)</option>
                              <option value="admin">Admin (አድሚን)</option>
                            </select>
                          )}

                          {/* Block / Unblock Button */}
                          {!isMainAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(item)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                                isBlocked
                                  ? "bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-700"
                                  : "bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/80"
                              }`}
                              title={isBlocked ? "የተጠቃሚውን እገዳ አንሳ" : "ተጠቃሚውን ለጊዜው እገድ"}
                            >
                              {isBlocked ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>እገዳ አንሳ</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5 text-red-400" />
                                  <span>አግድ</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Delete User */}
                          {!isMainAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(item)}
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                              title="አካውንት ሰርዝ (Delete Data)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CONTENT MODERATION */}
          {activeTab === "moderation" && (
            <div className="space-y-4">
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>በስቱዲዮው ውስጥ የተከለከሉ ቃላት ዝርዝር (Prohibited Terms Blacklist)</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  አድሚኑ አላስፈላጊ፣ ጸያፍ ወይም ህገ-ወጥ የሆኑ ቃላትን እዚህ በመመዝገብ በስቱዲዮው ውስጥ ማንም እንዳያሰራጫቸው ማገድ ይችላል።
                </p>

                {/* Add Banned Word Form */}
                <form onSubmit={handleAddBannedWord} className="flex gap-2">
                  <input
                    type="text"
                    value={newBannedWord}
                    onChange={(e) => setNewBannedWord(e.target.value)}
                    placeholder="አዲስ የሚታገድ ቃል ያስገቡ (ለምሳሌ፦ ስድብ፣ የጥላቻ ንግግር)..."
                    className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-red-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-red-950/50 flex items-center gap-1.5"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>ቃል አግድ</span>
                  </button>
                </form>

                {/* Banned Words Pills */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {bannedWords.length === 0 ? (
                    <span className="text-xs text-neutral-500 italic">ምንም የተከለከለ ቃል አልተመዘገበም</span>
                  ) : (
                    bannedWords.map((word) => (
                      <span
                        key={word}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/60 text-xs font-semibold text-red-300"
                      >
                        <span>{word}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBannedWord(word)}
                          className="text-neutral-400 hover:text-white"
                          title="ከእገዳ አስወግድ"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Text Inspection Sandbox */}
              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-800 space-y-3">
                <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <span>የይዘት ፈታሽ (Script Content Scanner)</span>
                </h4>
                <textarea
                  value={inspectText}
                  onChange={(e) => setInspectText(e.target.value)}
                  placeholder="ማንኛውንም አጠራጣሪ የዜና ጽሑፍ እዚህ በመለጠፍ የተከለከሉ ቃላት መኖራቸውን ይፈትሹ..."
                  rows={3}
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleInspectText}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  ጽሑፉን ፈትሽ (Scan Text)
                </button>

                {inspectionResult !== null && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      inspectionResult.length > 0
                        ? "bg-red-950/50 border-red-800 text-red-200"
                        : "bg-emerald-950/50 border-emerald-800 text-emerald-200"
                    }`}
                  >
                    {inspectionResult.length > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>
                          ማስጠንቀቂያ፦ ጽሑፉ {inspectionResult.length} የተከለከሉ ቃላትን ይዟል ({inspectionResult.join(", ")})!
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>ይዘቱ ንጹህ ነው፤ ምንም የተከለከለ ቃል አልተገኘም።</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SYSTEM BROADCAST NOTICE */}
          {activeTab === "notice" && (
            <div className="bg-neutral-950/80 p-5 rounded-xl border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>የስቱዲዮ አጠቃላይ ማስታወቂያ (Studio Broadcast Banner)</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                በስቱዲዮው ውስጥ ለሚሰሩ ጋዜጠኞች በሙሉ የሚታይ አጠቃላይ የስራ መመሪያ ወይም የአደጋ ጊዜ ማሳሰቢያ እዚህ ያሰራጩ።
              </p>

              <textarea
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="ማስታወቂያውን እዚህ ይጻፉ (ለምሳሌ፦ «ዛሬ ከሰዓት በኃላ የቀጥታ ስርጭት ስለሚኖር እባክዎ ዜናዎችን በፍጥነት ያጠናቁ»)..."
                rows={4}
                className="w-full bg-neutral-900 border border-neutral-700/80 rounded-xl p-3.5 text-xs text-white placeholder:text-neutral-500 focus:border-cyan-500 focus:outline-none"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveNotice}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-950/50"
                >
                  ማስታወቂያውን አሰራጭ (Publish Notice)
                </button>
                {noticeText && (
                  <button
                    type="button"
                    onClick={() => {
                      setNoticeText("");
                      onUpdateSystemNotice?.(null);
                      showToast("ማስታወቂያው ተነስቷል");
                    }}
                    className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-xl transition-colors"
                  >
                    ማስታወቂያውን አንሳ (Clear)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM HEALTH & SECURITY */}
          {activeTab === "health" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Cloud Firestore Status</span>
                  </h4>
                  <div className="text-xs font-mono space-y-1 text-neutral-400">
                    <p>Database: <span className="text-emerald-400">Connected & Synced</span></p>
                    <p>Security Rules: <span className="text-emerald-400">Enforced (Admin-Only Delete)</span></p>
                    <p>Auth State: <span className="text-amber-400">Super Admin Verified</span></p>
                  </div>
                </div>

                <div className="bg-neutral-950/80 p-3.5 rounded-xl border border-neutral-800 space-y-2">
                  <h4 className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-red-400" />
                    <span>Neural Audio Engine</span>
                  </h4>
                  <div className="text-xs font-mono space-y-1 text-neutral-400">
                    <p>Model: <span className="text-neutral-200">Gemini 3.8 Flash Neural TTS</span></p>
                    <p>Language: <span className="text-cyan-400">Amharic (ET) & English (Intl)</span></p>
                    <p>Mixing Latency: <span className="text-emerald-400">&lt; 150ms Real-Time</span></p>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-950/80 p-4 rounded-xl border border-neutral-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>የአድሚን ስልጣንና ደህንነት (Admin Control Rights)</span>
                </h4>
                <ul className="text-xs text-neutral-400 space-y-1.5 list-disc list-inside">
                  <li>የተመዘገቡ ተጠቃሚዎችን የማየት፣ የመቆጣጠር እና ማናቸውንም አላስፈላጊ መለያ የማገድ ሙሉ ስልጣን።</li>
                  <li>የተከለከሉ ቃላትን በመመዝገብ አላስፈላጊ ዜናዎችን የመቆጣጠር መብት።</li>
                  <li>በደመናው ዳታቤዝ ላይ ዳታን የማጥፋት እና የማስተካከል ፈቃድ ለአድሚን ብቻ ተገድቧል።</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <button
            type="button"
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-200 rounded-lg text-xs font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>ከአድሚን ውጣ (Sign Out)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            ዝጋ (Close)
          </button>
        </div>

        {/* Suspend Confirmation Dialog */}
        {suspendTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-neutral-900 border border-red-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl shadow-red-950/60">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-9 h-9 rounded-xl bg-red-950 border border-red-700/60 flex items-center justify-center shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">ተጠቃሚን ማገድ (Suspend User)</h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    {suspendTarget.user.displayName || suspendTarget.user.email}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium block">
                  የእገዳ ምክንያት (Reason for Suspension)፦
                </label>
                <input
                  type="text"
                  value={suspendTarget.reason}
                  onChange={(e) =>
                    setSuspendTarget({
                      ...suspendTarget,
                      reason: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-red-500"
                  placeholder="የእገዳ ምክንያት ያስገቡ..."
                />
              </div>

              {/* Quick Preset Reasons */}
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 block font-mono">የተለመዱ ምክንያቶች፦</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "አላስፈላጊ ወይም የተከለከለ የዜና ይዘት በማሰራጨት",
                    "የስቱዲዮ ደንብ መጣስ",
                    "ያልተፈቀደ የይዘት አጠቃቀም",
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSuspendTarget({ ...suspendTarget, reason: r })}
                      className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSuspendTarget(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
                >
                  ተመለስ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSuspend}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-md shadow-red-900/50 cursor-pointer"
                >
                  ተጠቃሚውን እገድ (Confirm Suspend)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-neutral-900 border border-red-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl shadow-red-950/60">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-9 h-9 rounded-xl bg-red-950 border border-red-700/60 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">አካውንት መሰረዝ (Delete User)</h3>
                  <p className="text-xs text-neutral-400 font-mono">{deleteTarget.email}</p>
                </div>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                የተጠቃሚው መለያና መረጃዎች ሙሉ በሙሉ ከደመናው ዳታቤዝ ይሰረዛሉ። ይህ ተግባር ወደ ኋላ ሊመለስ አይችልም።
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium cursor-pointer"
                >
                  ተመለስ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors shadow-md shadow-red-900/50 cursor-pointer"
                >
                  አዎ ሰርዝ (Confirm Delete)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
