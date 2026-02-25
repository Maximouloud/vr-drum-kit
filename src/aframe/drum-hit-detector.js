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
let dryGain = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    initReverbSystem(audioContext);
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
  const duration = 1.5; // seconds - medium room decay
  const length = sampleRate * duration;
  const decay = 2.5; // decay factor
  
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
 * Initialize the reverb system with convolver and routing
 * @param {AudioContext} ctx 
 */
function initReverbSystem(ctx) {
  // Create convolver for reverb
  reverbNode = ctx.createConvolver();
  reverbNode.buffer = generateImpulseResponse(ctx);
  
  // Create gain nodes for wet/dry mix
  reverbGain = ctx.createGain();
  dryGain = ctx.createGain();
  
  // Connect reverb path: reverbNode -> reverbGain -> destination
  reverbNode.connect(reverbGain);
  reverbGain.connect(ctx.destination);
  
  // Connect dry path: dryGain -> destination
  dryGain.connect(ctx.destination);
  
  // Initial state: reverb OFF (dry only)
  reverbGain.gain.value = 0;
  dryGain.gain.value = 1;
  
  console.log('[drum-hit-detector] Reverb system initialized');
}

/**
 * Get the audio output node based on reverb state
 * Returns an object with nodes to connect to for proper routing
 * @returns {{ dry: GainNode, wet: ConvolverNode }}
 */
function getOutputNodes() {
  return {
    dry: dryGain,
    wet: reverbNode
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
    // Reverb ON: blend wet and dry signals
    reverbGain.gain.setTargetAtTime(0.5, currentTime, 0.1);
    dryGain.gain.setTargetAtTime(0.7, currentTime, 0.1);
    console.log('[drum-hit-detector] Reverb enabled');
  } else {
    // Reverb OFF: dry signal only
    reverbGain.gain.setTargetAtTime(0, currentTime, 0.1);
    dryGain.gain.setTargetAtTime(1, currentTime, 0.1);
    console.log('[drum-hit-detector] Reverb disabled');
  }
  
  // Dispatch event for UI updates
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

    // Connect nodes through reverb system
    source.connect(gainNode);
    
    // Get output nodes for reverb routing
    const outputs = getOutputNodes();
    
    // Connect to both dry and wet paths (gains control the mix)
    gainNode.connect(outputs.dry);
    gainNode.connect(outputs.wet);

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
    
    // Cache drum pads - will be populated on first tick
    this.drumPads = [];
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
  },

  checkCollisions: function (velocity) {
    const tipPos = this.worldPosition;

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
  }
});
