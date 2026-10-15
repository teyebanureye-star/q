import React from "react";
import { X, Download, Share2, Check, Video, MessageSquare, Play, Square } from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioBlob: Blob | null;
  audioUrl: string | null;
  script: string;
  anchorName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  audioBlob,
  audioUrl,
  script,
  anchorName,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const audioPlayerRef = React.useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `fana_news_broadcast_${dateStr}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePreview = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                የተቀነባበረ የዜና ድምፅ (Export Broadcast Audio)
              </h3>
              <p className="text-xs text-neutral-400">
                ለሶሻል ሚዲያ (TikTok, Telegram, YouTube) የተዘጋጀ ድምፅ
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (audioPlayerRef.current) audioPlayerRef.current.pause();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player Card */}
        {audioUrl ? (
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlayingAudio(false)}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  የዜና ድምፅ፡ {anchorName}
                </p>
                <p className="text-xs text-neutral-400 font-mono">
                  ቅርጸት፦ 24kHz Studio Master (.WAV)
                </p>
              </div>

              <button
                type="button"
                onClick={togglePreview}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center justify-center transition-colors shadow-md"
              >
                {isPlayingAudio ? (
                  <Square className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Download className="w-4 h-4" />
              <span>የዜና ድምፁን አውርድ (.WAV ፋይል)</span>
            </button>
          </div>
        ) : (
          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-center py-6 text-neutral-400 text-xs">
            እስካሁን ምንም ድምፅ አልተቀዳም። እባክዎ በስቱዲዮው ውስጥ ዜናውን ያጫውቱ።
          </div>
        )}

        {/* Social Media Creator Tips */}
        <div className="space-y-2 bg-neutral-950/60 p-3.5 rounded-lg border border-neutral-800/80">
          <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5" />
            <span>ስቴዲዮ ለሌላቸው የሶሻል ሚዲያ ፈጣሪዎች አጠቃቀም፦</span>
          </h4>
          <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
            <li>
              የወረደውን የድምፅ ፋይል በቀጥታ <strong>CapCut</strong> ወይም <strong>Premiere</strong> ላይ በማስገባት ተዛማጅ ቪዲዮዎችን ጨምሩበት።
            </li>
            <li>
              ለቴሌግራም ቻናል ቀጥታ በድምፅ (Voice Message) ወይም በፋይል ማጋራት ይችላሉ።
            </li>
            <li>
              የቲክቶክ እና ዩቲዩብ ሾርትስ (Shorts) ቪዲዮ ለመስራት የቴሌፕሮምፕተር ሁነታን በመጠቀም ፊትዎን እየቀረጹ ማንበብ ይችላሉ።
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={handleCopyScript}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "ስክሪፕቱ ኮፒ ተደርጓል!" : "ስክሪፕቱን ኮፒ አድርግ"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded-lg transition-colors"
          >
            ዝጋ
          </button>
        </div>
      </div>
    </div>
  );
};
