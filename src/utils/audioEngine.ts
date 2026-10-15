/**
 * Web Audio Engine for Broadcast News Production
 * Features:
 * - Real-time Audio Visualizer Analyser
 * - Procedural News Theme Beds (Breaking, Prime, Analysis, Tech)
 * - Breaking News Intro Stinger
 * - Auto-Ducking (music drops during voice)
 * - Multi-track Audio Mixing & WAV Export for social media videos
 */

import { MusicBedType } from "../types/studio";

class StudioAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;

  // Background music scheduling
  private musicIntervalId: any = null;
  private activeMusicType: MusicBedType = "none";
  private isDucked = false;
  private baseMusicVolume = 0.35;

  // Currently playing voice source
  private currentVoiceSource: AudioBufferSourceNode | null = null;
  private currentVoiceAudioEl: HTMLAudioElement | null = null;
  private isSpeechSynthesisSpeaking = false;

  // MediaRecorder for exporting combined master mix
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    // Lazy initialized on first user gesture
  }

  public init() {
    if (this.ctx && this.ctx.state !== "closed") {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return this.ctx;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.baseMusicVolume, this.ctx.currentTime);

    this.voiceGain = this.ctx.createGain();
    this.voiceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Audio routing
    this.musicGain.connect(this.masterGain);
    this.voiceGain.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Setup destination for audio recording / export
    try {
      this.destinationNode = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.destinationNode);
    } catch {
      // Ignored if not supported
    }

    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMusicVolume(volume: number) {
    this.baseMusicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain && this.ctx) {
      const target = this.isDucked ? this.baseMusicVolume * 0.22 : this.baseMusicVolume;
      this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
    }
  }

  public duckMusic(duck: boolean) {
    this.isDucked = duck;
    if (this.musicGain && this.ctx) {
      const target = duck ? this.baseMusicVolume * 0.22 : this.baseMusicVolume;
      this.musicGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.15);
    }
  }

  /**
   * Play Breaking News Signature Stinger ("BEE-BEE-BOOM" brass stinger)
   */
  public playIntroStinger(): Promise<void> {
    return new Promise((resolve) => {
      this.init();
      if (!this.ctx || !this.musicGain) {
        resolve();
        return;
      }

      const now = this.ctx.currentTime;

      // 1. High Tension Beeps (Beep-Beep-Beep)
      [0, 0.18, 0.36].forEach((timeOffset, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(idx === 2 ? 1480 : 1240, now + timeOffset);

        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.3, now + timeOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.12);

        osc.connect(gain);
        gain.connect(this.musicGain!);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.14);
      });

      // 2. Powerful Sub-Bass Impact Boom at 0.54s
      const boomTime = now + 0.54;
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(140, boomTime);
      subOsc.frequency.exponentialRampToValueAtTime(38, boomTime + 0.8);

      subGain.gain.setValueAtTime(0.7, boomTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 1.2);

      subOsc.connect(subGain);
      subGain.connect(this.musicGain);

      subOsc.start(boomTime);
      subOsc.stop(boomTime + 1.25);

      // 3. News Broadcast Brass Chord
      const chordFreqs = [220, 277.18, 329.63, 440]; // A major
      chordFreqs.forEach((freq) => {
        const chordOsc = this.ctx!.createOscillator();
        const chordGain = this.ctx!.createGain();
        chordOsc.type = "sawtooth";
        chordOsc.frequency.setValueAtTime(freq, boomTime);

        // Filter for analog broadcast warmth
        const filter = this.ctx!.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1600, boomTime);
        filter.frequency.exponentialRampToValueAtTime(600, boomTime + 1.2);

        chordGain.gain.setValueAtTime(0.2, boomTime);
        chordGain.gain.exponentialRampToValueAtTime(0.001, boomTime + 1.2);

        chordOsc.connect(filter);
        filter.connect(chordGain);
        chordGain.connect(this.musicGain!);

        chordOsc.start(boomTime);
        chordOsc.stop(boomTime + 1.25);
      });

      setTimeout(() => {
        resolve();
      }, 1400);
    });
  }

  /**
   * Starts a procedural background music bed
   */
  public startMusicBed(type: MusicBedType) {
    this.stopMusicBed();
    if (type === "none") {
      this.activeMusicType = "none";
      return;
    }

    this.init();
    if (!this.ctx || !this.musicGain) return;
    this.activeMusicType = type;

    let step = 0;
    const bpm = type === "breaking" ? 128 : type === "prime" ? 114 : type === "tech" ? 122 : 92;
    const stepDuration = 60 / bpm / 2; // 8th notes

    // Trigger procedural synthesizer loops
    this.musicIntervalId = setInterval(() => {
      if (!this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;

      if (type === "breaking") {
        // Dramatic breaking pulse
        this.synthBreakingPulse(now, step);
      } else if (type === "prime") {
        // Authoritative prime evening newsroom bed
        this.synthPrimeNewsBed(now, step);
      } else if (type === "analysis") {
        // Deep thoughtful analysis bed
        this.synthAnalysisBed(now, step);
      } else if (type === "tech") {
        // Tech & business pulse
        this.synthTechBed(now, step);
      }

      step = (step + 1) % 16;
    }, stepDuration * 1000);
  }

  public stopMusicBed() {
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    this.activeMusicType = "none";
  }

  private synthBreakingPulse(now: number, step: number) {
    if (!this.ctx || !this.musicGain) return;

    // Sub pulse on beats 0, 4, 8, 12
    if (step % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.2);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.22);
    }

    // High newsroom ticking on every 8th note
    const tickOsc = this.ctx.createOscillator();
    const tickGain = this.ctx.createGain();
    tickOsc.type = "square";
    tickOsc.frequency.setValueAtTime(step % 2 === 0 ? 1800 : 2400, now);

    tickGain.gain.setValueAtTime(0.03, now);
    tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    tickOsc.connect(tickGain);
    tickGain.connect(this.musicGain);
    tickOsc.start(now);
    tickOsc.stop(now + 0.05);

    // Minor chord pad swell on step 0
    if (step === 0) {
      [110, 130.81, 164.81].forEach((f) => {
        const padOsc = this.ctx!.createOscillator();
        const padGain = this.ctx!.createGain();
        padOsc.type = "sawtooth";
        padOsc.frequency.setValueAtTime(f, now);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);

        padGain.gain.setValueAtTime(0.08, now);
        padGain.gain.linearRampToValueAtTime(0.12, now + 1.0);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

        padOsc.connect(filter);
        filter.connect(padGain);
        padGain.connect(this.musicGain!);

        padOsc.start(now);
        padOsc.stop(now + 3.3);
      });
    }
  }

  private synthPrimeNewsBed(now: number, step: number) {
    if (!this.ctx || !this.musicGain) return;

    // Warm bassline on step 0, 3, 6, 10
    if ([0, 3, 6, 10].includes(step)) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      const notes = [65.41, 73.42, 82.41, 65.41];
      osc.frequency.setValueAtTime(notes[step % notes.length], now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    // Elegant rhythmic mallet/glass accent on step 0, 8
    if (step === 0 || step === 8) {
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bellOsc.type = "sine";
      bellOsc.frequency.setValueAtTime(step === 0 ? 880 : 1046.5, now);

      bellGain.gain.setValueAtTime(0.08, now);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      bellOsc.connect(bellGain);
      bellGain.connect(this.musicGain);
      bellOsc.start(now);
      bellOsc.stop(now + 0.52);
    }
  }

  private synthAnalysisBed(now: number, step: number) {
    if (!this.ctx || !this.musicGain) return;

    // Atmospheric low drone
    if (step === 0) {
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      droneOsc.type = "sine";
      droneOsc.frequency.setValueAtTime(55, now);

      droneGain.gain.setValueAtTime(0.2, now);
      droneGain.gain.linearRampToValueAtTime(0.25, now + 2.0);
      droneGain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

      droneOsc.connect(droneGain);
      droneGain.connect(this.musicGain);
      droneOsc.start(now);
      droneOsc.stop(now + 5.0);
    }
  }

  private synthTechBed(now: number, step: number) {
    if (!this.ctx || !this.musicGain) return;

    // Crisp electronic synth sequence
    const techNotes = [440, 554.37, 659.25, 880];
    if (step % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(techNotes[(step / 2) % techNotes.length], now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.14);
    }
  }

  /**
   * Play base64 WAV audio through the studio mixer (with ducking and visualizer)
   */
  public async playWavAudio(base64Data: string): Promise<void> {
    this.stopVoice();
    this.init();

    if (!this.ctx || !this.voiceGain) return;

    // Decode base64 to ArrayBuffer
    const binary = atob(base64Data);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer.slice(0));

    this.currentVoiceSource = this.ctx.createBufferSource();
    this.currentVoiceSource.buffer = audioBuffer;
    this.currentVoiceSource.connect(this.voiceGain);

    this.duckMusic(true);

    return new Promise((resolve) => {
      if (!this.currentVoiceSource) {
        resolve();
        return;
      }

      this.currentVoiceSource.onended = () => {
        this.duckMusic(false);
        this.currentVoiceSource = null;
        resolve();
      };

      this.currentVoiceSource.start(0);
    });
  }

  /**
   * Play pre-recorded/cached WAV audio from URL through the studio mixer (with ducking and visualizer)
   */
  public async playAudioUrl(url: string): Promise<void> {
    this.stopVoice();
    this.init();

    if (!this.ctx || !this.voiceGain) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Audio fetch failed");
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

      this.currentVoiceSource = this.ctx.createBufferSource();
      this.currentVoiceSource.buffer = audioBuffer;
      this.currentVoiceSource.connect(this.voiceGain);

      this.duckMusic(true);

      return new Promise((resolve) => {
        if (!this.currentVoiceSource) {
          resolve();
          return;
        }

        this.currentVoiceSource.onended = () => {
          this.duckMusic(false);
          this.currentVoiceSource = null;
          resolve();
        };

        this.currentVoiceSource.start(0);
      });
    } catch (err) {
      this.duckMusic(false);
      console.error("Error playing audio url:", err);
    }
  }

  /**
   * Stop any current speech or audio
   */
  public stopVoice() {
    if (this.currentVoiceSource) {
      try {
        this.currentVoiceSource.stop();
        this.currentVoiceSource.disconnect();
      } catch {
        // Ignore
      }
      this.currentVoiceSource = null;
    }

    if (this.currentVoiceAudioEl) {
      this.currentVoiceAudioEl.pause();
      this.currentVoiceAudioEl = null;
    }

    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      this.isSpeechSynthesisSpeaking = false;
    }

    this.duckMusic(false);
  }

  /**
   * Play speech using Web Speech API fallback tuned for Amharic
   */
  public speakWithWebSpeech(
    text: string,
    options: { rate?: number; pitch?: number; voiceGender?: "male" | "female" } = {}
  ): Promise<void> {
    this.stopVoice();
    this.init();

    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("Web Speech API is not supported in this browser."));
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate ?? 0.95;
      utterance.pitch = options.pitch ?? (options.voiceGender === "female" ? 1.05 : 0.85);

      // Look for Amharic or best available voice
      const voices = window.speechSynthesis.getVoices();
      const amVoice = voices.find((v) => v.lang.startsWith("am") || v.lang.startsWith("gez"));
      if (amVoice) {
        utterance.voice = amVoice;
        utterance.lang = amVoice.lang;
      } else {
        // Fallback to primary preferred voice
        utterance.lang = "am-ET";
      }

      this.duckMusic(true);
      this.isSpeechSynthesisSpeaking = true;

      // Simulate audio visualizer energy during Web Speech synthesis
      const visSimInterval = setInterval(() => {
        if (!this.isSpeechSynthesisSpeaking || !this.ctx || !this.voiceGain) {
          clearInterval(visSimInterval);
          return;
        }
        // inject subtle noise into voiceGain for the visualizer
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.setValueAtTime(180 + Math.random() * 200, now);
        g.gain.setValueAtTime(0.001, now);
        osc.connect(g);
        g.connect(this.voiceGain);
        osc.start(now);
        osc.stop(now + 0.05);
      }, 100);

      utterance.onend = () => {
        clearInterval(visSimInterval);
        this.isSpeechSynthesisSpeaking = false;
        this.duckMusic(false);
        resolve();
      };

      utterance.onerror = (e) => {
        clearInterval(visSimInterval);
        this.isSpeechSynthesisSpeaking = false;
        this.duckMusic(false);
        resolve(); // resolve so flow does not block
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Start recording the master mix to WAV/WebM blob
   */
  public startRecording(): boolean {
    this.init();
    if (!this.destinationNode) return false;

    try {
      this.recordedChunks = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      this.mediaRecorder = new MediaRecorder(this.destinationNode.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      this.mediaRecorder.start(100);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Stop recording and return combined audio blob
   */
  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || "audio/webm";
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.recordedChunks = [];
        this.mediaRecorder = null;
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }
}

export const studioAudio = new StudioAudioEngine();
