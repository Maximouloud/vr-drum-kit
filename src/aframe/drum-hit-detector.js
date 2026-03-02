/**
 * drum-hit-detector.js
 * 
 * A-Frame components for VR drum hit detection
 * - drum-pad: Placed on drum hitboxes, handles sound playback
 * - drumstick-tip: Placed on drumstick tips, detects collisions with drum-pads
 */

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

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    initEffectsSystem(audioContext);
  }
  return audioContext;
}

/**
 * Generate an impulse response for a medium-sized room reverb
 * @param {AudioContext} ctx 
 * @returns {AudioBuffer}
 */
function generateImpulseResponse(ctx) {
  // Medium room reverb parameters
  const sampleRate = ctx.sampleRate;
  const duration = 2.0; // seconds - medium room decay
  const length = sampleRate * duration;
  const decay = 2.0; // decay factor (lower = longer tail)
  
  // Create stereo buffer
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const leftChannel = impulse.getChannelData(0);
  const rightChannel = impulse.getChannelData(1);
  
  for (let i = 0; i < length; i++) {
    // Exponential decay envelope
    const envelope = Math.pow(1 - i / length, decay);
    
    // Random noise with decay
    leftChannel[i] = (Math.random() * 2 - 1) * envelope;
    rightChannel[i] = (Math.random() * 2 - 1) * envelope;
  }
  
  return impulse;
}

/**
 * Generate a distortion curve for the WaveShaperNode
 * @param {number} amount - Distortion intensity (0-100)
 * @returns {Float32Array}
 */
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

/**
 * Initialize the effects system (reverb + delay + distortion)
 * @param {AudioContext} ctx 
 */
function initEffectsSystem(ctx) {
  // Master gain (all effects mix here before going to destination)
  masterGain = ctx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(ctx.destination);

  // === REVERB SETUP ===
  reverbNode = ctx.createConvolver();
  reverbNode.buffer = generateImpulseResponse(ctx);
  
  reverbGain = ctx.createGain();
  reverbGain.gain.value = 0; // OFF by default
  
  reverbNode.connect(reverbGain);
  reverbGain.connect(masterGain);

  // === DELAY SETUP ===
  // Delay time: 300ms for a nice echo effect
  delayNode = ctx.createDelay(1.0);
  delayNode.delayTime.value = 0.3;
  
  // Feedback loop for multiple echoes
  delayFeedback = ctx.createGain();
  delayFeedback.gain.value = 0.4; // 40% feedback for subtle repeats
  
  delayGain = ctx.createGain();
  delayGain.gain.value = 0; // OFF by default
  
  // Delay routing: input -> delay -> feedback -> delay (loop)
  //                              -> delayGain -> master
  delayNode.connect(delayFeedback);
  delayFeedback.connect(delayNode); // feedback loop
  delayNode.connect(delayGain);
  delayGain.connect(masterGain);

  // === DISTORTION SETUP ===
  distortionNode = ctx.createWaveShaper();
  distortionNode.curve = makeDistortionCurve(50); // Medium distortion
  distortionNode.oversample = '4x'; // Reduces aliasing
  
  distortionGain = ctx.createGain();
  distortionGain.gain.value = 0; // OFF by default
  
  distortionNode.connect(distortionGain);
  distortionGain.connect(masterGain);

  console.log('[drum-hit-detector] Effects system initialized (reverb + delay + distortion)');
}

/**
 * Get the effects input nodes for routing audio
 * @returns {{ master: GainNode, reverb: ConvolverNode, delay: DelayNode, distortion: WaveShaperNode }}
 */
function getEffectNodes() {
  return {
    master: masterGain,
    reverb: reverbNode,
    delay: delayNode,
    distortion: distortionNode
  };
}

/**
 * Global function to toggle reverb on/off
 * @param {boolean} enabled 
 */
window.setDrumReverb = function(enabled) {
  reverbEnabled = enabled;
  
  if (!audioContext) {
    console.warn('[drum-hit-detector] Audio context not initialized yet');
    return;
  }
  
  const currentTime = audioContext.currentTime;
  
  if (enabled) {
    reverbGain.gain.setTargetAtTime(0.7, currentTime, 0.1);
    console.log('[drum-hit-detector] Reverb enabled');
  } else {
    reverbGain.gain.setTargetAtTime(0, currentTime, 0.1);
    console.log('[drum-hit-detector] Reverb disabled');
  }
  
  window.dispatchEvent(new CustomEvent('drum-reverb-changed', { detail: { enabled } }));
};

/**
 * Check if reverb is currently enabled
 * @returns {boolean}
 */
window.isDrumReverbEnabled = function() {
  return reverbEnabled;
};

/**
 * Global function to toggle delay on/off
 * @param {boolean} enabled 
 */
window.setDrumDelay = function(enabled) {
  delayEnabled = enabled;
  
  if (!audioContext) {
    console.warn('[drum-hit-detector] Audio context not initialized yet');
    return;
  }
  
  const currentTime = audioContext.currentTime;
  
  if (enabled) {
    delayGain.gain.setTargetAtTime(0.5, currentTime, 0.1);
    console.log('[drum-hit-detector] Delay enabled');
  } else {
    delayGain.gain.setTargetAtTime(0, currentTime, 0.1);
    console.log('[drum-hit-detector] Delay disabled');
  }
  
  window.dispatchEvent(new CustomEvent('drum-delay-changed', { detail: { enabled } }));
};

/**
 * Check if delay is currently enabled
 * @returns {boolean}
 */
window.isDrumDelayEnabled = function() {
  return delayEnabled;
};

/**
 * Global function to toggle distortion on/off
 * @param {boolean} enabled 
 */
window.setDrumDistortion = function(enabled) {
  distortionEnabled = enabled;
  
  if (!audioContext) {
    console.warn('[drum-hit-detector] Audio context not initialized yet');
    return;
  }
  
  const currentTime = audioContext.currentTime;
  
  if (enabled) {
    distortionGain.gain.setTargetAtTime(0.6, currentTime, 0.1);
    console.log('[drum-hit-detector] Distortion enabled');
  } else {
    distortionGain.gain.setTargetAtTime(0, currentTime, 0.1);
    console.log('[drum-hit-detector] Distortion disabled');
  }
  
  window.dispatchEvent(new CustomEvent('drum-distortion-changed', { detail: { enabled } }));
};

/**
 * Check if distortion is currently enabled
 * @returns {boolean}
 */
window.isDrumDistortionEnabled = function() {
  return distortionEnabled;
};

/**
 * drum-pad component
 * Place this on drum hitbox cylinders
 * 
 * Usage: drum-pad="sound: /sounds/snare.wav"
 */
AFRAME.registerComponent('drum-pad', {
  schema: {
    sound: { type: 'string', default: '' },
    cooldown: { type: 'number', default: 0 } // ms
  },

  init: function () {
    this.audioBuffer = null;
    this.lastHitTime = 0;
    this.isLoaded = false;

    // Preload audio
    if (this.data.sound) {
      this.loadAudio(this.data.sound);
    }

    // Get radius from geometry for collision detection
    const geometry = this.el.getAttribute('geometry');
    if (geometry && geometry.radius) {
      this.radius = geometry.radius;
    } else {
      // Fallback: try to get from radius attribute directly
      this.radius = parseFloat(this.el.getAttribute('radius')) || 0.2;
    }

    // Get height for surface detection
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

  /**
   * Play the drum sound with given velocity
   * @param {number} velocity - Value between 0 and 1
   */
  hit: function (velocity) {
    const now = Date.now();
    
    // Cooldown check
    if (now - this.lastHitTime < this.data.cooldown) {
      return;
    }
    
    if (!this.isLoaded || !this.audioBuffer) {
      console.warn('[drum-pad] Audio not loaded yet');
      return;
    }

    this.lastHitTime = now;

    // Resume audio context if suspended (browser autoplay policy)
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Create audio source
    const source = ctx.createBufferSource();
    source.buffer = this.audioBuffer;

    // Create gain node for velocity-based volume
    const gainNode = ctx.createGain();
    const clampedVelocity = Math.max(0, Math.min(1, velocity));
    gainNode.gain.value = 0.3 + (clampedVelocity * 0.7); // Range: 0.3 to 1.0

    // Connect source to gain
    source.connect(gainNode);
    
    // Get effect nodes
    const effects = getEffectNodes();
    
    // Connect to all effect paths (gains control whether each effect is audible)
    // Dry signal goes directly to master
    gainNode.connect(effects.master);
    // Wet signals go through effects
    gainNode.connect(effects.reverb);
    gainNode.connect(effects.delay);
    gainNode.connect(effects.distortion);

    // Play
    source.start(0);

    // Emit event for visual feedback
    this.el.emit('drum-hit', { velocity: clampedVelocity });
  }
});


/**
 * drumstick-tip component
 * Place this on drumstick tip spheres
 * 
 * Usage: drumstick-tip
 */
AFRAME.registerComponent('drumstick-tip', {
  schema: {
    debug: { type: 'boolean', default: false }
  },

  init: function () {
    this.worldPosition = new THREE.Vector3();
    this.previousPosition = new THREE.Vector3();
    this.tempPosition = new THREE.Vector3();
    this.velocity = 0;
    this.isFirstTick = true;
    
    // Cache drum pads and toggle buttons - will be populated on first tick
    this.drumPads = [];
    this.toggleButtons = [];
    this.drumPadPositions = new Map();
    
    // Track which pads we're currently inside (to avoid repeated triggers)
    this.insidePads = new Set();
    
    // Get initial position
    this.el.object3D.getWorldPosition(this.previousPosition);
  },

  tick: function (time, deltaTime) {
    if (deltaTime <= 0) return;

    // Get current world position
    this.el.object3D.getWorldPosition(this.worldPosition);

    // Skip first tick (no previous position to compare)
    if (this.isFirstTick) {
      this.previousPosition.copy(this.worldPosition);
      this.isFirstTick = false;
      this.updateDrumPadCache();
      return;
    }

    // Calculate velocity (distance / time in seconds)
    const distance = this.worldPosition.distanceTo(this.previousPosition);
    const deltaSeconds = deltaTime / 1000;
    this.velocity = distance / deltaSeconds;

    // Normalize velocity to 0-1 range (assuming max velocity ~5 m/s)
    const normalizedVelocity = Math.min(this.velocity / 5, 1);

    // Check collisions with drum pads
    this.checkCollisions(normalizedVelocity);

    // Store position for next frame
    this.previousPosition.copy(this.worldPosition);

    // Update drum pad cache periodically (every 60 frames ~1 second)
    if (Math.floor(time / 1000) !== Math.floor((time - deltaTime) / 1000)) {
      this.updateDrumPadCache();
    }
  },

  updateDrumPadCache: function () {
    this.drumPads = Array.from(document.querySelectorAll('[drum-pad]'));
    this.toggleButtons = Array.from(document.querySelectorAll('[toggle-button]'));
  },

  checkCollisions: function (velocity) {
    const tipPos = this.worldPosition;

    // Check drum pads
    for (const padEl of this.drumPads) {
      const padComponent = padEl.components['drum-pad'];
      if (!padComponent) continue;

      // Use element as unique identifier
      const padId = padEl;

      // Get drum pad world position (center of cylinder)
      padEl.object3D.getWorldPosition(this.tempPosition);

      // Get the world matrix to extract orientation
      padEl.object3D.updateMatrixWorld(true);
      
      // Get the local "up" direction of the cylinder in world space
      // Cylinders in A-Frame have their axis along local Y
      const upVector = new THREE.Vector3(0, 1, 0);
      upVector.applyQuaternion(padEl.object3D.getWorldQuaternion(new THREE.Quaternion()));
      
      // Get world scale to properly scale height
      const worldScale = new THREE.Vector3();
      padEl.object3D.getWorldScale(worldScale);
      const scaledHeight = padComponent.height * worldScale.y;
      const scaledRadius = padComponent.radius * Math.max(worldScale.x, worldScale.z);
      
      // Calculate the top surface center (offset from center by half height along up axis)
      const topSurfaceCenter = this.tempPosition.clone().add(
        upVector.clone().multiplyScalar(scaledHeight / 2)
      );
      
      // Project the tip position onto the plane of the drum surface
      // Vector from surface center to tip
      const toTip = tipPos.clone().sub(topSurfaceCenter);
      
      // Distance along the up axis (how far above/below the surface)
      const heightDist = toTip.dot(upVector);
      
      // Radial distance (distance in the plane of the drum)
      const radialVec = toTip.clone().sub(upVector.clone().multiplyScalar(heightDist));
      const radialDist = radialVec.length();
      
      // Check if we're within the collision zone:
      // - Within radius of the drum surface
      // - Close to the surface (within a small threshold above/below)
      const surfaceThreshold = 0.08; // 8cm above or below surface
      const isInside = radialDist < (scaledRadius + 0.02) && 
                       heightDist > -surfaceThreshold && 
                       heightDist < surfaceThreshold;
      
      const wasInside = this.insidePads.has(padId);

      if (isInside && !wasInside) {
        // Just entered the pad - trigger the hit!
        if (this.data.debug) {
          console.log(`[drumstick-tip] Hit! Radial: ${radialDist.toFixed(3)}, Height: ${heightDist.toFixed(3)}, Velocity: ${velocity.toFixed(2)}`);
        }
        padComponent.hit(velocity);
        this.insidePads.add(padId);
      } else if (!isInside && wasInside) {
        // Just exited the pad - remove from tracking
        this.insidePads.delete(padId);
        if (this.data.debug) {
          console.log(`[drumstick-tip] Exited pad`);
        }
      }
    }

    // Check toggle buttons
    for (const buttonEl of this.toggleButtons) {
      const buttonComponent = buttonEl.components['toggle-button'];
      if (!buttonComponent) continue;

      const buttonId = buttonEl;

      // Get button world position
      buttonEl.object3D.getWorldPosition(this.tempPosition);

      // Simple distance check for box buttons
      const distance = tipPos.distanceTo(this.tempPosition);
      const collisionRadius = 0.08; // Button collision radius

      const isInside = distance < collisionRadius;
      const wasInside = this.insidePads.has(buttonId);

      if (isInside && !wasInside) {
        buttonComponent.toggle();
        this.insidePads.add(buttonId);
      } else if (!isInside && wasInside) {
        this.insidePads.delete(buttonId);
      }
    }
  }
});


/**
 * toggle-button component
 * A button that can be toggled by hitting it with drumsticks
 * 
 * Usage: toggle-button="action: reverb" or toggle-button="action: delay" or toggle-button="action: distortion"
 */
AFRAME.registerComponent('toggle-button', {
  schema: {
    action: { type: 'string', default: 'reverb' },
    cooldown: { type: 'number', default: 300 } // ms between toggles
  },

  init: function () {
    this.enabled = false;
    this.lastToggleTime = 0;
    
    // Listen for external state changes
    window.addEventListener('drum-reverb-changed', (e) => {
      if (this.data.action === 'reverb') {
        this.enabled = e.detail.enabled;
        this.updateVisual();
      }
    });
    
    window.addEventListener('drum-delay-changed', (e) => {
      if (this.data.action === 'delay') {
        this.enabled = e.detail.enabled;
        this.updateVisual();
      }
    });
    
    window.addEventListener('drum-distortion-changed', (e) => {
      if (this.data.action === 'distortion') {
        this.enabled = e.detail.enabled;
        this.updateVisual();
      }
    });
  },

  toggle: function () {
    const now = Date.now();
    
    // Cooldown check
    if (now - this.lastToggleTime < this.data.cooldown) {
      return;
    }
    
    this.lastToggleTime = now;
    this.enabled = !this.enabled;
    
    // Execute action based on type
    if (this.data.action === 'reverb') {
      if (window.setDrumReverb) {
        window.setDrumReverb(this.enabled);
      }
    } else if (this.data.action === 'delay') {
      if (window.setDrumDelay) {
        window.setDrumDelay(this.enabled);
      }
    } else if (this.data.action === 'distortion') {
      if (window.setDrumDistortion) {
        window.setDrumDistortion(this.enabled);
      }
    }
    
    this.updateVisual();
    this.el.emit('toggle', { enabled: this.enabled });
    console.log(`[toggle-button] ${this.data.action} toggled:`, this.enabled);
  },

  updateVisual: function () {
    // Update color: red when OFF, green when ON
    const color = this.enabled ? '#4CAF50' : '#f44336';
    this.el.setAttribute('color', color);
  }
});
