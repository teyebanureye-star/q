import React, { useState, useRef } from "react";
import {
  Mic,
  Square,
  Sparkles,
  Loader2,
  X,
  Volume2,
  FileAudio,
  AlertCircle,
  Check,
} from "lucide-react";

interface AudioDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppendScript: (text: string) => void;
}

export const AudioDictationModal: React.FC<AudioDictationModalProps> = ({
  isOpen,
  onClose,
  onAppendScript,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      setTranscript(null);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Mic access error:", err);
      setErrorMsg("የማይክሮፎን ፈቃድ ማግኘት አልተቻለም፤ እባክዎ ብሮውዘርዎ ላይ ማይክሮፎኑን ይፍቀዱ።");
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const res = await fetch("/api/news/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64Audio,
            mimeType: blob.type || "audio/webm",
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "ድምፁን ወደ ጽሑፍ መቀየር አልተቻለም");
        }

        const data = await res.json();
        if (data.transcript) {
          setTranscript(data.transcript);
        } else {
          throw new Error("ምንም ጽሑፍ አልተገኘም፤ እባክዎ ድምፅዎን ከፍ አድርገው በድጋሚ ይሞክሩ።");
        }
        setIsProcessing(false);
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error("Transcribe process error:", err);
      setErrorMsg(err?.message || "ድምፁን ወደ ጽሑፍ መቀየር አልተሳካም");
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (transcript) {
      onAppendScript(transcript);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-black/80 text-neutral-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                የድምፅ ቅጂ
              </h2>
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
        <div className="p-5 sm:p-6 space-y-5 text-center">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Recording Status & Waveform Simulation */}
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="relative">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-red-900/60"
                    : "bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 shadow-amber-950/50"
                }`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 fill-current" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>

              {isRecording && (
                <div className="absolute -inset-2 rounded-full border-2 border-red-500/50 animate-ping pointer-events-none" />
              )}
            </div>

            {isRecording ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-400 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>በመቅረጽ ላይ... ({recordSeconds} ሰከንድ)</span>
                </p>
                <p className="text-[11px] text-neutral-400">
                  ሲጨርሱ ቁልፉን ተጭነው ያቁሙት
                </p>
              </div>
            ) : isProcessing ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ድምፁን ወደ አማርኛ ጽሑፍ በመቀየር ላይ...</span>
                </p>
                <p className="text-[11px] text-neutral-500">Gemini Neural Audio Engine</p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 font-medium">
                ለመጀመር የማይክሮፎን ቁልፉን ይጫኑ
              </p>
            )}
          </div>

          {/* Transcript Output */}
          {transcript && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left space-y-2">
              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>የተቀየረው የዜና ጽሑፍ (Transcribed Text)፦</span>
              </span>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans bg-neutral-900/60 p-3 rounded-lg border border-neutral-800/80">
                {transcript}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ይቅር (Cancel)
          </button>

          {transcript && (
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 rounded-lg text-xs font-bold transition-all shadow-md"
            >
              <span>ወደ ስክሪፕቱ ጨምር</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
