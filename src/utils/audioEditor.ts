/**
 * Broadcast Audio Editor & Waveform Processing Utilities
 * Provides high-performance client-side AudioBuffer manipulation:
 * - Waveform peak extraction for interactive rendering
 * - Silence detection & auto-trimming
 * - Clickable selection & range trimming
 * - Precision segment cutting / splice with micro-crossfade
 * - 16-bit PCM WAV Blob encoding
 */

export async function decodeAudioBlob(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } finally {
    if (ctx.state !== "closed") {
      ctx.close().catch(() => {});
    }
  }
}

export function extractWaveformPeaks(buffer: AudioBuffer, numPoints = 280): number[] {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  if (length === 0) return [];
  const blockSize = Math.max(1, Math.floor(length / numPoints));
  const peaks: number[] = [];

  for (let i = 0; i < numPoints; i++) {
    const start = i * blockSize;
    const end = Math.min(start + blockSize, length);
    let max = 0;

    for (let c = 0; c < numChannels; c++) {
      const channelData = buffer.getChannelData(c);
      for (let j = start; j < end; j++) {
        const absVal = Math.abs(channelData[j]);
        if (absVal > max) max = absVal;
      }
    }
    peaks.push(max);
  }

  const maxPeak = Math.max(...peaks, 0.001);
  return peaks.map((p) => p / maxPeak);
}

/**
 * Automatically trims leading and trailing silence below threshold (< -38dB)
 */
export function autoTrimSilence(
  buffer: AudioBuffer,
  threshold = 0.015
): { trimmedBuffer: AudioBuffer; leadCutSec: number; tailCutSec: number } {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;

  let startSample = 0;
  let endSample = length - 1;

  // Find start: first sample above threshold
  outerStart: for (let i = 0; i < length; i++) {
    for (let c = 0; c < numChannels; c++) {
      if (Math.abs(buffer.getChannelData(c)[i]) > threshold) {
        // Leave 25ms lead-in padding
        startSample = Math.max(0, i - Math.floor(sampleRate * 0.025));
        break outerStart;
      }
    }
  }

  // Find end: last sample above threshold
  outerEnd: for (let i = length - 1; i >= startSample; i--) {
    for (let c = 0; c < numChannels; c++) {
      if (Math.abs(buffer.getChannelData(c)[i]) > threshold) {
        // Leave 25ms tail padding
        endSample = Math.min(length - 1, i + Math.floor(sampleRate * 0.025));
        break outerEnd;
      }
    }
  }

  const leadCutSec = startSample / sampleRate;
  const tailCutSec = (length - 1 - endSample) / sampleRate;

  const newLength = Math.max(1, endSample - startSample + 1);
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const trimmed = ctx.createBuffer(numChannels, newLength, sampleRate);
  ctx.close().catch(() => {});

  for (let c = 0; c < numChannels; c++) {
    const src = buffer.getChannelData(c);
    const dest = trimmed.getChannelData(c);
    for (let i = 0; i < newLength; i++) {
      dest[i] = src[startSample + i];
    }
  }

  return { trimmedBuffer: trimmed, leadCutSec, tailCutSec };
}

/**
 * Trims audio to keep ONLY the range between startSec and endSec
 */
export function trimAudioBuffer(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(buffer.length, Math.floor(endSec * sampleRate));
  const newLength = Math.max(1, endSample - startSample);

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const trimmed = ctx.createBuffer(numChannels, newLength, sampleRate);
  ctx.close().catch(() => {});

  for (let c = 0; c < numChannels; c++) {
    const src = buffer.getChannelData(c);
    const dest = trimmed.getChannelData(c);
    for (let i = 0; i < newLength; i++) {
      dest[i] = src[startSample + i];
    }
  }

  return trimmed;
}

/**
 * Cuts out a specific segment [cutStartSec, cutEndSec] and splices remaining parts together
 */
export function cutSegmentFromAudioBuffer(
  buffer: AudioBuffer,
  cutStartSec: number,
  cutEndSec: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  const cutStartSample = Math.max(0, Math.floor(cutStartSec * sampleRate));
  const cutEndSample = Math.min(buffer.length, Math.floor(cutEndSec * sampleRate));

  if (cutEndSample <= cutStartSample) return buffer;

  const removedLength = cutEndSample - cutStartSample;
  const newLength = Math.max(1, buffer.length - removedLength);

  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const newBuffer = ctx.createBuffer(numChannels, newLength, sampleRate);
  ctx.close().catch(() => {});

  const crossfadeLen = Math.min(Math.floor(sampleRate * 0.005), cutStartSample, newLength - cutStartSample);

  for (let c = 0; c < numChannels; c++) {
    const src = buffer.getChannelData(c);
    const dest = newBuffer.getChannelData(c);

    // Copy segment prior to cut
    for (let i = 0; i < cutStartSample; i++) {
      dest[i] = src[i];
    }

    // Copy segment after cut
    for (let i = cutStartSample; i < newLength; i++) {
      dest[i] = src[i + removedLength];
    }

    // Micro crossfade at the splice point
    if (crossfadeLen > 0) {
      for (let j = 0; j < crossfadeLen; j++) {
        const progress = j / crossfadeLen;
        const idx = cutStartSample - crossfadeLen + j;
        if (idx >= 0 && idx < newLength) {
          dest[idx] = dest[idx] * (1 - progress * 0.3);
        }
      }
    }
  }

  return newBuffer;
}

/**
 * Converts AudioBuffer to 16-bit PCM WAV Blob
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const bufferLen = 44 + length;
  const arrayBuffer = new ArrayBuffer(bufferLen);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(8, "WAVE");

  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  writeString(36, "data");
  view.setUint32(40, length, true);

  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}
