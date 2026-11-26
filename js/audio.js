import { config } from "./config.js";

const NOTES = [523.25, 587.33, 659.25, 783.99, 880];
const ARPEGGIO = [523.25, 659.25, 783.99, 1046.5];

export function createAudio() {
  let ctx = null;
  let enabled = true;
  let started = false;
  let music = null;
  let musicGain = null;
  let step = 0;

  async function ensure() {
    if (!enabled) return null;
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") await ctx.resume();
    started = true;
    return ctx;
  }

  function tone(context, freq, when, dur = 0.42) {
    const osc = context.createOscillator();
    const partial = context.createOscillator();
    const gain = context.createGain();
    osc.type = "sine";
    partial.type = "sine";
    osc.frequency.value = freq;
    partial.frequency.value = freq * 2;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(0.07, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    const partialGain = context.createGain();
    partialGain.gain.value = 0.18;
    osc.connect(gain);
    partial.connect(partialGain);
    partialGain.connect(gain);
    gain.connect(context.destination);
    osc.start(when);
    partial.start(when);
    osc.stop(when + dur + 0.02);
    partial.stop(when + dur + 0.02);
  }

  return {
    setEnabled(value) {
      enabled = value;
      if (musicGain && ctx) {
        musicGain.gain.cancelScheduledValues(ctx.currentTime);
        musicGain.gain.linearRampToValueAtTime(value ? 0.12 : 0.0001, ctx.currentTime + 0.2);
      }
      if (!value && ctx?.state === "running") ctx.suspend().catch(() => {});
    },
    async unlock() {
      const context = await ensure();
      if (!context || music || !config.music) return;
      try {
        const response = await fetch("./assets/music.mp3");
        if (!response.ok) return;
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        musicGain = context.createGain();
        musicGain.gain.setValueAtTime(0.0001, context.currentTime);
        musicGain.gain.linearRampToValueAtTime(0.12, context.currentTime + 1.4);
        musicGain.connect(context.destination);
        music = context.createBufferSource();
        music.buffer = buffer;
        music.loop = true;
        music.connect(musicGain);
        music.start();
      } catch {
        music = null;
      }
    },
    async tap() {
      const context = await ensure();
      if (!context) return;
      tone(context, NOTES[step % NOTES.length], context.currentTime, 0.36);
      step += 1;
    },
    async arpeggio() {
      const context = await ensure();
      if (!context) return;
      ARPEGGIO.forEach((freq, index) => tone(context, freq, context.currentTime + index * 0.28, 0.7));
    },
    get started() {
      return started;
    },
  };
}
