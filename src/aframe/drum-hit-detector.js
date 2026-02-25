/**
 * drum-hit-detector.js
 * 
 * A-Frame components for VR drum hit detection
 * - drum-pad: Placed on drum hitboxes, handles sound playback
 * - drumstick-tip: Placed on drumstick tips, detects collisions with drum-pads
 */

// Audio context singleton for Web Audio API
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * drum-pad component
 * Place this on drum hitbox cylinders
 * 
 * Usage: drum-pad="sound: /sounds/snare.wav"
 */
AFRAME.registerComponent('drum-pad', {
  schema: {
    sound: { type: 'string', default: '' },
    cooldown: { type: 'number', default: 150 } // ms
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

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

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

      // Get drum pad world position
      padEl.object3D.getWorldPosition(this.tempPosition);

      // Calculate distance
      const distance = tipPos.distanceTo(this.tempPosition);

      // Get collision radius (drum pad radius + small buffer)
      const collisionRadius = padComponent.radius + 0.02;

      // Check if we're inside the collision zone
      const isInside = distance < collisionRadius;
      const wasInside = this.insidePads.has(padId);

      if (isInside && !wasInside) {
        // Just entered the pad - trigger the hit!
        if (this.data.debug) {
          console.log(`[drumstick-tip] Hit! Distance: ${distance.toFixed(3)}, Velocity: ${velocity.toFixed(2)}`);
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
