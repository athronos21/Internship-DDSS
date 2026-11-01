/**
 * Audio feedback synthesizer for POS barcode scanning and checkout operations.
 * Uses the Web Audio API for zero-latency, realistic hardware scanner audio feedback.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API not available in current environment', e);
    return null;
  }
}

/**
 * Toggle audio feedback on/off globally for the user session
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/**
 * Play audible feedback for POS actions:
 * - 'scan_success': Classic 2150Hz POS barcode laser beep (85ms duration)
 * - 'scan_double': Rapid high-pitch double chirp for multi-quantity scan
 * - 'scan_error': Low frequency alert tone for out-of-stock / unrecognized barcode
 * - 'checkout_complete': Register chime upon completed transaction
 */
export function playSound(
  type: 'scan_success' | 'scan_double' | 'scan_error' | 'checkout_complete' = 'scan_success',
  customVolume = 0.35
): void {
  if (!soundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    if (type === 'scan_success') {
      // Authentic retail/pharmacy barcode scanner beep (2150 Hz sine wave with rapid exponential decay)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2150, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(customVolume, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'scan_double') {
      // Rapid dual-tone chirp
      const tones = [2150, 2600];
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.065;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(customVolume * 0.9, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.055);
      });
    } else if (type === 'scan_error') {
      // Low dual error buzz (220 Hz sawtooth)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(190, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(customVolume * 0.7, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } else if (type === 'checkout_complete') {
      // Elegant register confirmation chord (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + idx * 0.045;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(customVolume * 0.6, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.32);
      });
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}
