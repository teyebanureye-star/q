import React, { useEffect, useMemo, useState } from "react";
import {
  FolderArchive,
  ShieldCheck,
  BarChart3,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Play,
  FileText,
  Video,
  Radio,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  Clock,
  User,
  X,
  Eye,
  Calendar,
  Share2,
  Sparkles,
  Info,
  Layers,
  Flame,
} from "lucide-react";
import { UserWorkItem, fetchUserWorks, deleteUserWork, saveUserWork } from "../utils/userWorkService";
import { AuditLogItem, fetchAuditLogs, exportAuditLogsAsCSV, exportAuditLogsAsJSON, recordAuditLog } from "../utils/auditLogger";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { FANA_ANCHORS } from "../data/newsData";

interface UserWorkDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScript?: string;
  currentAnchorId?: string;
  onLoadScriptToStudio?: (script: string, anchorId?: string) => void;
}

export const UserWorkDashboardModal: React.FC<UserWorkDashboardModalProps> = ({
  isOpen,
  onClose,
  currentScript,
  currentAnchorId,
  onLoadScriptToStudio,
}) => {
  const { user, profile, isAdmin } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";

  const [activeTab, setActiveTab] = useState<"works" | "audit" | "analytics">("works");
  const [works, setWorks] = useState<UserWorkItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>("all");

  // Preview & Delete Modals (No native alert/prompt)
  const [previewWork, setPreviewWork] = useState<UserWorkItem | null>(null);
  const [deleteConfirmWork, setDeleteConfirmWork] = useState<UserWorkItem | null>(null);

  // Quick Save Current State Dialog
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState("");
  const [newWorkCategory, setNewWorkCategory] = useState("አጠቃላይ ዜና");

  // Load Data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [fetchedWorks, fetchedLogs] = await Promise.all([
        fetchUserWorks(),
        fetchAuditLogs(120),
      ]);
      setWorks(fetchedWorks);
      setAuditLogs(fetchedLogs);
    } catch (err) {
      console.warn("Failed loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
    }
  }, [isOpen]);

  const showBannerNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3200);
  };

  // Quick Save Current Active Script
  const handleSaveActiveScript = async () => {
    if (!currentScript || !currentScript.trim()) {
      showBannerNotice("ለማስቀመጥ የሚያስችል የዜና ስክሪፕት በስቱዲዮው ውስጥ የለም!");
      return;
    }

    const anchorObj = FANA_ANCHORS.find((a) => a.id === currentAnchorId) || FANA_ANCHORS[0];
    const generatedTitle = newWorkTitle.trim() || currentScript.split(/[።\n!?]/)[0].slice(0, 70) || "የስቱዲዮ ዜና ዘገባ";

    try {
      const saved = await saveUserWork({
        title: generatedTitle,
        type: "script",
        content: currentScript,
        category: newWorkCategory,
        anchorId: anchorObj.id,
        anchorName: anchorObj.nameAmharic,
        durationSeconds: Math.ceil(currentScript.length / 18),
      });

      setWorks((prev) => [saved, ...prev]);
      setIsQuickSaving(false);
      setNewWorkTitle("");
      showBannerNotice(`"${saved.title}" በተጠቃሚ ስራዎች ማህደር ውስጥ ተቀምጧል!`);
      // Refresh audit logs
      const updatedLogs = await fetchAuditLogs(120);
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      showBannerNotice("ስራውን ማስቀመጥ አልተቻለም፦ " + (err?.message || ""));
    }
  };

  // Delete Work
  const handleConfirmDelete = async () => {
    if (!deleteConfirmWork) return;
    try {
      await deleteUserWork(deleteConfirmWork.id, deleteConfirmWork.title);
      setWorks((prev) => prev.filter((w) => w.id !== deleteConfirmWork.id));
      showBannerNotice(`"${deleteConfirmWork.title}" ከማህደሩ ተሰርዟል`);
      setDeleteConfirmWork(null);
      // Refresh audit logs
      const updatedLogs = await fetchAuditLogs(120);
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      showBannerNotice("መሰረዝ አልተቻለም፦ " + (err?.message || ""));
    }
  };

  // Filtered Works
  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      const matchSearch =
        !searchQuery ||
        w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.anchorName && w.anchorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchType = typeFilter === "all" || w.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [works, searchQuery, typeFilter]);

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      const matchSearch =
        !searchQuery ||
        l.actionLabelAmharic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = auditCategoryFilter === "all" || l.category === auditCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [auditLogs, searchQuery, auditCategoryFilter]);

  // Analytics Computation
  const analyticsData = useMemo(() => {
    const totalWords = works.reduce((acc, w) => acc + (w.content.split(/\s+/).filter(Boolean).length || 0), 0);
    const categoryCounts: Record<string, number> = {};
    const anchorCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};

    works.forEach((w) => {
      const cat = w.category || "አጠቃላይ";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      const anc = w.anchorName || "ዳዊት ከበደ";
      anchorCounts[anc] = (anchorCounts[anc] || 0) + 1;
      const usr = w.userName || "ጋዜጠኛ";
      userCounts[usr] = (userCounts[usr] || 0) + 1;
    });

    return {
      totalWorks: works.length,
      totalAudit: auditLogs.length,
      totalWords,
      categories: Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]),
      anchors: Object.entries(anchorCounts).sort((a, b) => b[1] - a[1]),
      users: Object.entries(userCounts).sort((a, b) => b[1] - a[1]),
    };
  }, [works, auditLogs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-6xl h-[90vh] max-h-[880px] overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-neutral-900/90 via-neutral-950 to-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-red-600 flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-950/40">
              <FolderArchive className="w-5 h-5 text-neutral-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isEn ? "User Works & Audit Log Dashboard" : "የተጠቃሚዎች ስራ ማህደር እና ኦዲት ሎግ ዳሽቦርድ"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  FIRESTORE CLOUD
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                {isEn
                  ? "Track newsroom activities, user-generated scripts, audio packages, and security audit trails"
                  : "በስቱዲዮው ውስጥ የተሰሩ የዜና ስራዎች፣ የቪዲዮና ኦዲዮ ስርጭቶች እንዲሁም አጠቃላይ የኦዲት ሎግ መዝገብ"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Save Current Script Button */}
            <button
              type="button"
              onClick={() => setIsQuickSaving(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 hover:from-amber-300 hover:to-amber-400 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEn ? "Save Current Work" : "የአሁን ስራዬን መዝግብ"}</span>
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="አድስ (Refresh)"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {notification && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-medium flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{notification}</span>
            </div>
            <button type="button" onClick={() => setNotification(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Metric Cards Ribbon */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-neutral-950 border-b border-neutral-850">
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block font-medium">የተመዘገቡ ስራዎች</span>
              <span className="text-lg font-bold text-white tabular-nums">{works.length}</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block font-medium">የኦዲት ሎግ መዝገቦች</span>
              <span className="text-lg font-bold text-amber-400 tabular-nums">{auditLogs.length}</span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block font-medium">የስቱዲዮ ስርጭቶች</span>
              <span className="text-lg font-bold text-purple-300 tabular-nums">
                {works.filter((w) => w.type === "broadcast_video" || w.type === "interview").length}
              </span>
            </div>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 p-3 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block font-medium">ተሳታፊ ጋዜጠኞች</span>
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                {new Set(works.map((w) => w.userId)).size || 1}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action Bar */}
        <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              type="button"
              onClick={() => setActiveTab("works")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "works"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{isEn ? "User Works Archive" : "የተጠቃሚ ስራዎች ማህደር"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 ml-1">
                {works.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "audit"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isEn ? "System Audit Log" : "የስርዓቱ ኦዲት ሎግ"}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-800 text-neutral-300 ml-1">
                {auditLogs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("analytics")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{isEn ? "Analytics & Stats" : "የትንታኔ መረጃዎች"}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 flex-1 max-w-sm ml-auto">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "works"
                    ? isEn ? "Search work by title, author..." : "ስራዎችን በርዕስ፣ በይዘት ወይም በጋዜጠኛ ፈልግ..."
                    : isEn ? "Search audit logs..." : "ኦዲት ሎግን በድርጊት ወይም በኢሜይል ፈልግ..."
                }
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Audit Log Export Buttons */}
            {activeTab === "audit" && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => exportAuditLogsAsCSV(filteredLogs)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white cursor-pointer"
                  title="CSV አውርድ"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportAuditLogsAsJSON(filteredLogs)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-neutral-200 hover:text-white cursor-pointer"
                  title="JSON አውርድ"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: USER WORKS ARCHIVE */}
          {activeTab === "works" && (
            <div className="space-y-4">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {[
                  { id: "all", label: "ሁሉም ስራዎች (" + works.length + ")" },
                  { id: "script", label: "📝 የዜና ስክሪፕቶች" },
                  { id: "broadcast_video", label: "🎬 3D/2D ቪዲዮ ስርጭቶች" },
                  { id: "interview", label: "👥 ቃለ-መጠይቆች" },
                  { id: "audio_export", label: "🎙️ ኦዲዮ ፓኬጆች" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTypeFilter(item.id)}
                    className={`px-3 py-1 text-xs rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${
                      typeFilter === item.id
                        ? "bg-amber-500 text-neutral-950 shadow-sm"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Works Grid */}
              {filteredWorks.length === 0 ? (
                <div className="text-center py-16 bg-neutral-900/30 rounded-2xl border border-neutral-800/80 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 mx-auto flex items-center justify-center text-neutral-400 mb-3">
                    <FolderArchive className="w-6 h-6 text-neutral-500" />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-300">ምንም የተቀመጠ የስቱዲዮ ስራ አልተገኘም</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                    በስቱዲዮው ውስጥ የተዘጋጁ የዜና ስክሪፕቶችን ወይም የቀረጹትን ቪዲዮ "የአሁን ስራዬን መዝግብ" በሚለው ቁልፍ ማስቀመጥ ይችላሉ።
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsQuickSaving(true)}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>የአሁን ስክሪፕት መዝግብ</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredWorks.map((work) => {
                    const isVideo = work.type === "broadcast_video" || work.type === "interview";
                    const isScript = work.type === "script";

                    return (
                      <div
                        key={work.id}
                        className="bg-neutral-900/90 border border-neutral-800/90 hover:border-amber-500/50 rounded-xl p-4 transition-all flex flex-col justify-between shadow-lg shadow-black/20 group"
                      >
                        <div>
                          {/* Card Header: Type Badge & Date */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                                isVideo
                                  ? "bg-purple-950/80 text-purple-300 border border-purple-800/60"
                                  : work.type === "audio_export"
                                  ? "bg-blue-950/80 text-blue-300 border border-blue-800/60"
                                  : "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                              }`}
                            >
                              {isVideo ? "🎬 ቪዲዮ ስርጭት" : work.type === "audio_export" ? "🎙️ ኦዲዮ ፓኬጅ" : "📝 ስክሪፕት"}
                            </span>

                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-neutral-500" />
                              <span>{new Date(work.createdAt).toLocaleDateString("am-ET")}</span>
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                            {work.title}
                          </h4>

                          {/* Content Snippet */}
                          <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                            {work.content}
                          </p>
                        </div>

                        {/* Card Footer: Metadata & Actions */}
                        <div className="mt-4 pt-3 border-t border-neutral-800/80">
                          <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2.5">
                            <span className="truncate max-w-[140px] text-neutral-300">
                              👤 {work.userName || "ጋዜጠኛ"}
                            </span>
                            <span className="text-amber-400/90 font-mono font-semibold">
                              🎙️ {work.anchorName || "ዳዊት ከበደ"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Load into studio */}
                            {onLoadScriptToStudio && (
                              <button
                                type="button"
                                onClick={() => {
                                  onLoadScriptToStudio(work.content, work.anchorId);
                                  showBannerNotice(`"${work.title}" ወደ ስቱዲዮ ተጭኗል!`);
                                  onClose();
                                }}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>ወደ ስቱዲዮ ጫን</span>
                              </button>
                            )}

                            {/* Preview */}
                            <button
                              type="button"
                              onClick={() => setPreviewWork(work)}
                              className="p-1.5 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="ሙሉ ስክሪፕቱን አንብብ"
                            >
                              <Eye className="w-4 h-4 text-cyan-400" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmWork(work)}
                              className="p-1.5 rounded-lg bg-neutral-950 hover:bg-red-950 border border-neutral-800 hover:border-red-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="ስራውን ሰርዝ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SYSTEM AUDIT LOG */}
          {activeTab === "audit" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {[
                  { id: "all", label: "ሁሉም ድርጊቶች (" + auditLogs.length + ")" },
                  { id: "news", label: "📝 የዜና ዝግጅት" },
                  { id: "broadcast", label: "🎬 ስርጭትና ቪዲዮ" },
                  { id: "audio", label: "🎙️ ድምፅና ንባብ" },
                  { id: "dictionary", label: "📖 መዝገበ-ቃላት" },
                  { id: "admin", label: "🛡️ አስተዳደርና ደህንነት" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAuditCategoryFilter(item.id)}
                    className={`px-3 py-1 text-xs rounded-full font-bold transition-all whitespace-nowrap cursor-pointer ${
                      auditCategoryFilter === item.id
                        ? "bg-amber-500 text-neutral-950 shadow-sm"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Audit Log Table */}
              <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-neutral-950/90 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4">ቀንና ሰዓት</th>
                        <th className="py-3 px-4">ጋዜጠኛ / ተጠቃሚ</th>
                        <th className="py-3 px-4">የተከናወነ ድርጊት</th>
                        <th className="py-3 px-4">ዝርዝር መግለጫ</th>
                        <th className="py-3 px-4">ምድብ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-sans">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-neutral-500">
                            ምንም የኦዲት ሎግ መዝገብ አልተገኘም
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => {
                          const isSecurity = log.category === "admin";
                          const isVideo = log.category === "broadcast";

                          return (
                            <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                              <td className="py-3 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString("am-ET", {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-semibold text-white">{log.userName}</div>
                                <div className="text-[10px] text-neutral-500 font-mono">{log.userEmail}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    isSecurity
                                      ? "bg-red-950/80 text-red-300 border border-red-800/60"
                                      : isVideo
                                      ? "bg-purple-950/80 text-purple-300 border border-purple-800/60"
                                      : "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                                  }`}
                                >
                                  {log.actionLabelAmharic}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-neutral-300 max-w-md truncate" title={log.details}>
                                {log.details}
                              </td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-950 text-neutral-400 border border-neutral-800">
                                  {log.category}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANALYTICS & STATS */}
          {activeTab === "analytics" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Categories Breakdown */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-lg">
                  <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>የይዘት ምድቦች ስርጭት</span>
                  </h4>
                  <div className="space-y-2.5">
                    {analyticsData.categories.map(([cat, count]) => {
                      const pct = Math.round((count / (analyticsData.totalWorks || 1)) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-300 font-medium">{cat}</span>
                            <span className="text-amber-400 font-bold">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Anchors Popularity */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-lg">
                  <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    <span>በብዛት የተመረጡ አንባቢዎች</span>
                  </h4>
                  <div className="space-y-2.5">
                    {analyticsData.anchors.map(([anchor, count]) => {
                      const pct = Math.round((count / (analyticsData.totalWorks || 1)) * 100);
                      return (
                        <div key={anchor} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-neutral-300 font-medium">{anchor}</span>
                            <span className="text-cyan-400 font-bold">{count} ጊዜ</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Newsroom Contributors */}
                <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 shadow-lg">
                  <h4 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>ንቁ የዜና ክፍል አዘጋጆች</span>
                  </h4>
                  <div className="space-y-2.5">
                    {analyticsData.users.map(([name, count]) => (
                      <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800/80">
                        <span className="text-xs font-semibold text-white">{name}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 font-mono">
                          {count} ስራዎች
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Newsroom Metrics Summary */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-400 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    በስቱዲዮው ውስጥ እስካሁን በድምሩ <strong className="text-white">{analyticsData.totalWords.toLocaleString()}</strong> ቃላት ተዘጋጅተው ተመዝግበዋል።
                  </span>
                </div>
                <span className="text-neutral-500">የመረጃ ማከማቻ፦ Firebase Firestore & Client Cache</span>
              </div>
            </div>
          )}
        </div>

        {/* WORK PREVIEW MODAL */}
        {previewWork && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-950 border border-neutral-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">{previewWork.title}</h3>
                  <span className="text-xs text-amber-400 font-medium">
                    {previewWork.category} • {previewWork.anchorName} • {previewWork.userName}
                  </span>
                </div>
                <button type="button" onClick={() => setPreviewWork(null)} className="p-1 text-neutral-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto flex-1 font-sans text-neutral-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {previewWork.content}
              </div>

              <div className="p-3 border-t border-neutral-800 bg-neutral-900/70 flex items-center justify-between gap-2">
                <span className="text-xs text-neutral-400">
                  የተመዘገበበት ቀን፦ {new Date(previewWork.createdAt).toLocaleString("am-ET")}
                </span>
                {onLoadScriptToStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadScriptToStudio(previewWork.content, previewWork.anchorId);
                      setPreviewWork(null);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-neutral-950 hover:bg-amber-400 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ወደ ስቱዲዮ ጫን</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION DIALOG (In-modal, no alert) */}
        {deleteConfirmWork && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-950 border border-red-900/60 rounded-2xl w-full max-w-md p-5 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                <span>ስራውን መሰረዝ ይፈልጋሉ?</span>
              </h3>
              <p className="text-xs text-neutral-300 mt-2">
                "{deleteConfirmWork.title}" የሚለውን ስራ ከማህደሩ ላይ በቋሚነት መሰረዝ ይፈልጋሉ? ይህ ድርጊት በኦዲት ሎግ ውስጥ ይመዘገባል።
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmWork(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer"
                >
                  ተመለስ (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  አዎ፣ ሰርዝ (Delete)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QUICK SAVE DIALOG */}
        {isQuickSaving && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-950 border border-neutral-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>የአሁን ስራን በማህደር መዝግብ</span>
                </h3>
                <button type="button" onClick={() => setIsQuickSaving(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    የዜና ርዕስ (Title)
                  </label>
                  <input
                    type="text"
                    value={newWorkTitle}
                    onChange={(e) => setNewWorkTitle(e.target.value)}
                    placeholder="ለምሳሌ፡ የዛሬው አበይት ዜና ዘገባ..."
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    የይዘት ምድብ (Category)
                  </label>
                  <select
                    value={newWorkCategory}
                    onChange={(e) => setNewWorkCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="አጠቃላይ ዜና">አጠቃላይ ዜና</option>
                    <option value="ፖለቲካና ሀገራዊ">ፖለቲካና ሀገራዊ</option>
                    <option value="ኢኮኖሚና ንግድ">ኢኮኖሚና ንግድ</option>
                    <option value="ቴክኖሎጂና ፈጠራ">ቴክኖሎጂና ፈጠራ</option>
                    <option value="ስፖርት">ስፖርት</option>
                    <option value="ልዩ ቃለ-መጠይቅ">ልዩ ቃለ-መጠይቅ</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickSaving(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-neutral-300 hover:text-white cursor-pointer"
                >
                  ተመለስ
                </button>
                <button
                  type="button"
                  onClick={handleSaveActiveScript}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 cursor-pointer"
                >
                  መዝግብና አስቀምጥ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
