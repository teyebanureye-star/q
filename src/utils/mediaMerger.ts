/**
 * Studio Media Merger & Video Generator
 * Merges news graphics (image) and broadcast audio into a video (WebM/MP4)
 * client-side using Canvas + AudioContext + MediaRecorder.
 * Also provides direct CapCut export launcher.
 */

export const CAPCUT_EDITOR_URL = "https://www.capcut.com/editor";

export function openCapCut() {
  window.open(CAPCUT_EDITOR_URL, "_blank", "noopener,noreferrer");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadUrl(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export interface MergeOptions {
  imageUrl: string;
  audioBlob?: Blob | null;
  audioUrl?: string | null;
  headline?: string;
  anchorName?: string;
  onProgress?: (pct: number) => void;
}

/**
 * Merges a news graphic image and an audio track into an HD 1080p / 16:9 video file
 */
export async function mergeImageAndAudioToVideo(
  options: MergeOptions
): Promise<Blob> {
  const { imageUrl, audioBlob, audioUrl, headline, anchorName, onProgress } =
    options;

  // 1. Resolve Audio Buffer
  const audioCtx = new (window.AudioContext ||
    (window as any).webkitAudioContext)();

  let arrayBuffer: ArrayBuffer;
  if (audioBlob) {
    arrayBuffer = await audioBlob.arrayBuffer();
  } else if (audioUrl) {
    const res = await fetch(audioUrl);
    arrayBuffer = await res.arrayBuffer();
  } else {
    throw new Error("ምንም የድምፅ ፋይል አልተገኘም (No audio found to merge)");
  }

  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const duration = audioBuffer.duration;

  // 2. Load Image
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => {
      // Fallback: continue with gradient background if image load fails
      resolve();
    };
    img.src = imageUrl;
  });

  // 3. Setup 1280x720 Canvas
  const width = 1280;
  const height = 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 4. Setup Audio Destination & Source
  const dest = audioCtx.createMediaStreamDestination();
  const audioSource = audioCtx.createBufferSource();
  audioSource.buffer = audioBuffer;

  // Setup analyser for live audio waveform
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 128;
  const freqData = new Uint8Array(analyser.frequencyBinCount);

  audioSource.connect(analyser);
  analyser.connect(dest);

  // 5. Setup MediaRecorder with combined stream
  const canvasStream = canvas.captureStream(30); // 30 FPS
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...dest.stream.getAudioTracks(),
  ]);

  const mimeTypes = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  const selectedMime =
    mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

  const recorder = new MediaRecorder(combinedStream, {
    mimeType: selectedMime,
    videoBitsPerSecond: 3000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    const startTime = performance.now();
    let animId: number;

    recorder.onstop = () => {
      cancelAnimationFrame(animId);
      audioCtx.close();
      const finalBlob = new Blob(chunks, { type: selectedMime });
      resolve(finalBlob);
    };

    recorder.onerror = (e) => {
      cancelAnimationFrame(animId);
      audioCtx.close();
      reject(e);
    };

    // Draw frame function
    const renderFrame = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);
      if (onProgress) onProgress(Math.round(progress * 100));

      // Draw background image (cover fit)
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, width, height);
      } else {
        // Dark studio gradient
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, "#0f172a");
        bgGrad.addColorStop(1, "#020617");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Cinematic Vignette & Bottom gradient
      const grad = ctx.createLinearGradient(0, height * 0.4, 0, height);
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Top Header Badge
      ctx.fillStyle = "rgba(220, 38, 38, 0.9)";
      ctx.beginPath();
      ctx.roundRect(40, 35, 140, 32, 6);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("● ዜና ስቱዲዮ", 55, 57);

      if (anchorName) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.roundRect(190, 35, 200, 32, 6);
        ctx.fill();

        ctx.fillStyle = "#f59e0b";
        ctx.font = "14px sans-serif";
        ctx.fillText(`🎙️ ${anchorName}`, 202, 57);
      }

      // Audio Waveform Visualizer Bar
      analyser.getByteFrequencyData(freqData);
      const barCount = 32;
      const barWidth = 6;
      const barGap = 4;
      const waveStartX = width - 40 - barCount * (barWidth + barGap);
      const waveBaseY = 65;

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i] || 0;
        const barH = Math.max(3, (val / 255) * 28);
        ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
        ctx.fillRect(
          waveStartX + i * (barWidth + barGap),
          waveBaseY - barH,
          barWidth,
          barH
        );
      }

      // Headline Lower-Third
      if (headline) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.roundRect(40, height - 120, width - 80, 75, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px sans-serif";
        const trimmedHeadline =
          headline.length > 70 ? headline.slice(0, 68) + "..." : headline;
        ctx.fillText(trimmedHeadline, 65, height - 75);
      }

      // Progress bar at very bottom
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(0, height - 6, width, 6);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(0, height - 6, width * progress, 6);

      if (elapsed < duration) {
        animId = requestAnimationFrame(renderFrame);
      } else {
        recorder.stop();
      }
    };

    recorder.start();
    audioSource.start(0);
    animId = requestAnimationFrame(renderFrame);
  });
}
