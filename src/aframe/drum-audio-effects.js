// drum-audio-effects.js
// Contient la logique des effets audio pour le drum kit

// Audio context singleton for Web Audio API
let audioContext = null;

// Reverb system globals
let reverbNode = null;
let reverbEnabled = false;
let reverbGain = null;

// Delay system globals
let delayNode = null;
let delayFeedback = null;
let delayEnabled = false;
let delayGain = null;

// Distortion system globals
let distortionNode = null;
let distortionEnabled = false;
let distortionGain = null;

// Master output
let masterGain = null;

export function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    initEffectsSystem(audioContext);
  }
  return audioContext;
}

function generateImpulseResponse(ctx) {
  const sampleRate = ctx.sampleRate;
  const duration = 2.0;
  const length = sampleRate * duration;
  const decay = 2.0;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const leftChannel = impulse.getChannelData(0);
  const rightChannel = impulse.getChannelData(1);
  for (let i = 0; i < length; i++) {
    const envelope = Math.pow(1 - i / length, decay);
    leftChannel[i] = (Math.random() * 2 - 1) * envelope;
    rightChannel[i] = (Math.random() * 2 - 1) * envelope;
  }
  return impulse;
}

function makeDistortionCurve(amount) {
  const k = amount;
  const numSamples = 44100;
  const curve = new Float32Array(numSamples);
  const deg = Math.PI / 180;
  for (let i = 0; i < numSamples; i++) {
    const x = (i * 2) / numSamples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function initEffectsSystem(ctx) {
  masterGain = ctx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(ctx.destination);
  reverbNode = ctx.createConvolver();
  reverbNode.buffer = generateImpulseResponse(ctx);
  reverbGain = ctx.createGain();
  reverbGain.gain.value = 0;
  reverbNode.connect(reverbGain);
  reverbGain.connect(masterGain);
  delayNode = ctx.createDelay(1.0);
  delayNode.delayTime.value = 0.3;
  delayFeedback = ctx.createGain();
  delayFeedback.gain.value = 0.4;
  delayGain = ctx.createGain();
  delayGain.gain.value = 0;
  delayNode.connect(delayFeedback);
  delayFeedback.connect(delayNode);
  delayNode.connect(delayGain);
  delayGain.connect(masterGain);
  distortionNode = ctx.createWaveShaper();
  distortionNode.curve = makeDistortionCurve(50);
  distortionNode.oversample = '4x';
  distortionGain = ctx.createGain();
  distortionGain.gain.value = 0;
  distortionNode.connect(distortionGain);
  distortionGain.connect(masterGain);
}

export function getEffectNodes() {
  return {
    master: masterGain,
    reverb: reverbNode,
    delay: delayNode,
    distortion: distortionNode
  };
}

export function setDrumReverb(enabled) {
  reverbEnabled = enabled;
  if (!audioContext) return;
  const currentTime = audioContext.currentTime;
  if (enabled) {
    reverbGain.gain.setTargetAtTime(0.7, currentTime, 0.1);
  } else {
    reverbGain.gain.setTargetAtTime(0, currentTime, 0.1);
  }
  window.dispatchEvent(new CustomEvent('drum-reverb-changed', { detail: { enabled } }));
}

export function isDrumReverbEnabled() {
  return reverbEnabled;
}

export function setDrumDelay(enabled) {
  delayEnabled = enabled;
  if (!audioContext) return;
  const currentTime = audioContext.currentTime;
  if (enabled) {
    delayGain.gain.setTargetAtTime(0.5, currentTime, 0.1);
  } else {
    delayGain.gain.setTargetAtTime(0, currentTime, 0.1);
  }
  window.dispatchEvent(new CustomEvent('drum-delay-changed', { detail: { enabled } }));
}

export function isDrumDelayEnabled() {
  return delayEnabled;
}

export function setDrumDistortion(enabled) {
  distortionEnabled = enabled;
  if (!audioContext) return;
  const currentTime = audioContext.currentTime;
  if (enabled) {
    distortionGain.gain.setTargetAtTime(0.6, currentTime, 0.1);
  } else {
    distortionGain.gain.setTargetAtTime(0, currentTime, 0.1);
  }
  window.dispatchEvent(new CustomEvent('drum-distortion-changed', { detail: { enabled } }));
}

export function isDrumDistortionEnabled() {
  return distortionEnabled;
}
