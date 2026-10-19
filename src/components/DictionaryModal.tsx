import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  Search,
  Check,
  X,
  Sparkles,
  Info,
  Volume2,
  Lock,
  AlertCircle,
} from "lucide-react";
import { DictionaryEntry } from "../types/studio";
import {
  saveStoredDictionary,
  resetDictionaryToDefault,
} from "../utils/amharicNormalizer";
import { useAuth } from "../context/AuthContext";

interface DictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dictionary: DictionaryEntry[];
  setDictionary: (entries: DictionaryEntry[]) => void;
  onPreviewWord?: (word: string) => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({
  isOpen,
  onClose,
  dictionary,
  setDictionary,
  onPreviewWord,
}) => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [newOriginal, setNewOriginal] = useState("");
  const [newReplacement, setNewReplacement] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = newOriginal.trim();
    const repl = newReplacement.trim();

    if (!orig || !repl) {
      setErrorMsg("እባክዎ ሁለቱንም ቃላት (የተሳሳተውን እና ትክክለኛውን አነባበብ) ያስገቡ");
      return;
    }

    // Check if already exists
    const existingIndex = dictionary.findIndex(
      (d) => d.originalWord.toLowerCase() === orig.toLowerCase()
    );

    let updated: DictionaryEntry[];
    if (existingIndex >= 0) {
      updated = [...dictionary];
      updated[existingIndex] = {
        ...updated[existingIndex],
        phoneticReplacement: repl,
        notes: newNotes.trim() || updated[existingIndex].notes,
        enabled: true,
      };
      showToast(`"${orig}" ወደ "${repl}" ተሻሽሏል!`);
    } else {
      const newEntry: DictionaryEntry = {
        id: `custom_${Date.now()}`,
        originalWord: orig,
        phoneticReplacement: repl,
        notes: newNotes.trim() || "በተጠቃሚ የተጨመረ ቃል",
        enabled: true,
        isDefault: false,
      };
      updated = [newEntry, ...dictionary];
      showToast(`አዲሱ ቃል "${orig} ➔ ${repl}" ተቀምጧል!`);
    }

    setDictionary(updated);
    saveStoredDictionary(updated);
    setNewOriginal("");
    setNewReplacement("");
    setNewNotes("");
    setErrorMsg(null);
  };

  const handleToggleEntry = (id: string) => {
    const updated = dictionary.map((entry) =>
      entry.id === id ? { ...entry, enabled: !entry.enabled } : entry
    );
    setDictionary(updated);
    saveStoredDictionary(updated);
  };

  const handleDeleteEntry = (id: string) => {
    if (!isAdmin) {
      showToast("❌ ዳታ የማጥፋት ፈቃድ ለአድሚን (Admin) ብቻ የተፈቀደ ነው!");
      return;
    }
    const updated = dictionary.filter((entry) => entry.id !== id);
    setDictionary(updated);
    saveStoredDictionary(updated);
    showToast("ቃሉ ከመዝገበ-ቃላቱ ተወግዷል");
  };

  const handleResetDefaults = () => {
    if (!isAdmin) {
      showToast("❌ መዝገበ-ቃላቱን ወደ ነባሪ የመመለስ/ዳታ የማጥፋት ፈቃድ ለአድሚን ብቻ የተፈቀደ ነው!");
      return;
    }
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    const defaults = resetDictionaryToDefault();
    setDictionary(defaults);
    saveStoredDictionary(defaults);
    showToast("መዝገበ-ቃላቱ ወደ ነባሪው ሁኔታ ተመልሷል");
    setShowResetConfirm(false);
  };

  const filteredEntries = dictionary.filter(
    (entry) =>
      entry.originalWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.phoneticReplacement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>የቃላት አነባበብ መዝገበ-ቃላት</span>
                  <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {dictionary.length} ቃላት
                  </span>
                </h2>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-300 px-4 py-2 text-xs flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Add New Word Form */}
          <form
            onSubmit={handleAddEntry}
            className="bg-neutral-950/80 p-3.5 sm:p-4 rounded-xl border border-neutral-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>አዲስ የአነባበብ ማረሚያ አክል (Add Word Rule)</span>
              </h3>
              <span className="text-[10px] text-neutral-500">
                በራስ-ሰር በስክሪፕቱ ውስጥ ይተካል
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  የተሳሳተው ወይም የሚጻፈው ቃል (Original Word)
                </label>
                <input
                  type="text"
                  value={newOriginal}
                  onChange={(e) => {
                    setNewOriginal(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="ምሳሌ፦ ሰቨር ወይም ጠ/ሚ"
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  ትክክለኛው አነባበብ (Target Replacement)
                </label>
                <input
                  type="text"
                  value={newReplacement}
                  onChange={(e) => {
                    setNewReplacement(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="ምሳሌ፦ ሰበር ወይም ጠቅላይ ሚኒስትር"
                  className="w-full bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="ማስታወሻ ወይም ምክንያት (አማራጭ)"
                className="w-full sm:flex-1 bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold rounded-lg shadow-md transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ቃል መዝግብ (Save Rule)</span>
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-medium">{errorMsg}</p>
            )}
          </form>

          {/* Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="በመዝገበ-ቃላቱ ውስጥ ፈልግ..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                <span>ነባሪዎችን መልስ</span>
              </button>
            )}
          </div>

          {/* Reset Confirmation Banner */}
          {showResetConfirm && (
            <div className="p-3 bg-red-950/40 border border-red-700/60 rounded-xl flex items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>መዝገበ-ቃላቱን ወደ መጀመሪያው ነባሪ ሁኔታ መመለስ ይፈልጋሉ?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
                >
                  ተመለስ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-sm shadow-red-950"
                >
                  አዎ መልስ
                </button>
              </div>
            </div>
          )}

          {/* Dictionary Entries List */}
          <div className="space-y-2">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-neutral-500 text-xs bg-neutral-950/40 rounded-xl border border-neutral-800/80">
                ምንም የተገኘ ቃል የለም
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    entry.enabled
                      ? "bg-neutral-950/80 border-neutral-800 hover:border-neutral-700"
                      : "bg-neutral-950/30 border-neutral-900 opacity-60"
                  }`}
                >
                  {/* Word Mapping Display */}
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={entry.enabled}
                      onChange={() => handleToggleEntry(entry.id)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer shrink-0"
                      title={entry.enabled ? "አቦዝን" : "አብራ"}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-amber-300 text-sm font-sans bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
                          {entry.originalWord}
                        </span>
                        <span className="text-neutral-500 text-xs">➔</span>
                        <span className="font-bold text-emerald-400 text-sm font-sans bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                          {entry.phoneticReplacement}
                        </span>

                        {entry.isDefault && (
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                            ነባሪ (Default)
                          </span>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="text-[11px] text-neutral-400 mt-1 truncate">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {onPreviewWord && (
                      <button
                        type="button"
                        onClick={() => onPreviewWord(entry.phoneticReplacement)}
                        className="p-1.5 text-neutral-400 hover:text-amber-300 rounded hover:bg-neutral-800 transition-colors"
                        title="አነባበቡን አድምጥ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!entry.isDefault && (
                      isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800 transition-colors"
                          title="ቃሉን ሰርዝ (የአድሚን ፈቃድ)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span
                          className="p-1.5 text-neutral-600 cursor-not-allowed flex items-center justify-center"
                        >
                          <Lock className="w-3.5 h-3.5 text-neutral-600" />
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              በዚህ መዝገበ-ቃላት ውስጥ ያሉ ቃላት ዜናውን ሲያነቡ ወይም ሲያስተካክሉ በራስ-ሰር ይተገበራሉ።
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ዝጋ (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
