// drum-pad.js
// Composant A-Frame drum-pad
import { getAudioContext, getEffectNodes } from './drum-audio-effects.js';

AFRAME.registerComponent('drum-pad', {
  schema: {
    sound: { type: 'string', default: '' },
    cooldown: { type: 'number', default: 0 }
  },

  init: function () {
    this.audioBuffer = null;
    this.lastHitTime = 0;
    this.isLoaded = false;
    if (this.data.sound) {
      this.loadAudio(this.data.sound);
    }
    const geometry = this.el.getAttribute('geometry');
    if (geometry && geometry.radius) {
      this.radius = geometry.radius;
    } else {
      this.radius = parseFloat(this.el.getAttribute('radius')) || 0.2;
    }
    if (geometry && geometry.height) {
      this.height = geometry.height;
    } else {
      this.height = parseFloat(this.el.getAttribute('height')) || 0.05;
    }
  },

  loadAudio: async function (url) {
    try {
      const ctx = getAudioContext();
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.isLoaded = true;
      console.log(`[drum-pad] Loaded: ${url}`);
    } catch (error) {
      console.error(`[drum-pad] Failed to load audio: ${url}`, error);
    }
  },

  hit: function (velocity) {
    const now = Date.now();
    if (now - this.lastHitTime < this.data.cooldown) {
      return;
    }
    if (!this.isLoaded || !this.audioBuffer) {
      console.warn('[drum-pad] Audio not loaded yet');
      return;
    }
    this.lastHitTime = now;
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = this.audioBuffer;
    const gainNode = ctx.createGain();
    const clampedVelocity = Math.max(0, Math.min(1, velocity));
    gainNode.gain.value = 0.3 + (clampedVelocity * 0.7);
    source.connect(gainNode);
    const effects = getEffectNodes();
    gainNode.connect(effects.master);
    gainNode.connect(effects.reverb);
    gainNode.connect(effects.delay);
    gainNode.connect(effects.distortion);
    source.start(0);
    this.el.emit('drum-hit', { velocity: clampedVelocity });
  }
});
