/**
 * drum-hit-detector.js
 * 
 * Composants A-Frame pour la détection de frappes de tambour en VR
 * - drum-pad : Placé sur les zones de frappe des tambours, gère la lecture des sons
 * - drumstick-tip : Placé sur les pointes des baguettes, détecte les collisions avec les pads de tambour
 */

// Audio context singleton for Web Audio API
let audioContext = null;

// Reverb system
let reverbNode = null;
let reverbEnabled = false;
let reverbGain = null;

// Delay system
let delayNode = null;
let delayFeedback = null;
let delayEnabled = false;
let delayGain = null;

// Distortion system
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
 * generation d'une impulse response pour la convolution de réverbération
 * @param {AudioContext} ctx 
 * @returns {AudioBuffer}
 */
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

/**
 * generation d'une courbe de distorsion pour le nœud WaveShaper
 * @param {number} amount
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
 * initialisation du système d'effets (reverb, delay, distortion) et connexion à la sortie master
 * @param {AudioContext} ctx 
 */
function initEffectsSystem(ctx) {
  
  masterGain = ctx.createGain();
  masterGain.gain.value = 1;
  masterGain.connect(ctx.destination);

  // === REVERB SETUP ===
  reverbNode = ctx.createConvolver();
  reverbNode.buffer = generateImpulseResponse(ctx);
  
  reverbGain = ctx.createGain();
  reverbGain.gain.value = 0; 
  
  reverbNode.connect(reverbGain);
  reverbGain.connect(masterGain);

  // === DELAY SETUP ===
  
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

  // === DISTORTION SETUP ===
  distortionNode = ctx.createWaveShaper();
  distortionNode.curve = makeDistortionCurve(50); 
  distortionNode.oversample = '4x';
  
  distortionGain = ctx.createGain();
  distortionGain.gain.value = 0;
  
  distortionNode.connect(distortionGain);
  distortionGain.connect(masterGain);

  console.log('[drum-hit-detector] Effects system initialized (reverb + delay + distortion)');
}

/**
 * avoir accès aux nœuds d'effets pour les connecter aux sources audio des pads
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
 * fonction globale pour activer/désactiver la réverbération
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
 * vérifier si la réverbération est actuellement activée
 * @returns {boolean}
 */
window.isDrumReverbEnabled = function() {
  return reverbEnabled;
};

/**
 * fonction globale pour activer/désactiver le delay
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
 * vérifier si le delay est actuellement activé
 * @returns {boolean}
 */
window.isDrumDelayEnabled = function() {
  return delayEnabled;
};

/**
 * fonction globale pour activer/désactiver la distorsion
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
 * vérifier si la distorsion est actuellement activée
 * @returns {boolean}
 */
window.isDrumDistortionEnabled = function() {
  return distortionEnabled;
};

/**
 * Composant drum-pad
 * 
 * 
 * Utilisation : drum-pad="sound: /sounds/snare.wav"
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

    
    if (this.data.sound) {
      this.loadAudio(this.data.sound);
    }

    // avoir à chaque hit de recalculer le rayon et la hauteur à partir de la géométrie, on les stocke dans init
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

  /**
   * Play the drum sound with given velocity
   * @param {number} velocity 
   */
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

    // créer une source audio pour jouer le son du pad
    const source = ctx.createBufferSource();
    source.buffer = this.audioBuffer;

    
    const gainNode = ctx.createGain();
    const clampedVelocity = Math.max(0, Math.min(1, velocity));
    gainNode.gain.value = 0.3 + (clampedVelocity * 0.7);

    
    source.connect(gainNode);
    
    
    const effects = getEffectNodes();
    
    // Connecter le gain du son à la fois à la sortie master et aux effets pour qu'ils puissent les traiter
    
    gainNode.connect(effects.master);

    gainNode.connect(effects.reverb);
    gainNode.connect(effects.delay);
    gainNode.connect(effects.distortion);

    
    source.start(0);

    
    this.el.emit('drum-hit', { velocity: clampedVelocity });
  }
});


/**
 * Composant drumstick-tip
 * Placez ceci sur les sphères du bout de la baguette
 * 
 * Utilisation : drumstick-tip
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
    
   
    this.drumPads = [];
    this.toggleButtons = [];
    this.drumPadPositions = new Map();
    
    
    this.insidePads = new Set();
    
   
    this.el.object3D.getWorldPosition(this.previousPosition);
  },

  tick: function (time, deltaTime) {
    if (deltaTime <= 0) return;


    this.el.object3D.getWorldPosition(this.worldPosition);

 
    if (this.isFirstTick) {
      this.previousPosition.copy(this.worldPosition);
      this.isFirstTick = false;
      this.updateDrumPadCache();
      return;
    }

    // calculer la vitesse du mouvement du bout de la baguette
    const distance = this.worldPosition.distanceTo(this.previousPosition);
    const deltaSeconds = deltaTime / 1000;
    this.velocity = distance / deltaSeconds;

    // Rend la vitesse plus gérable (0 to 1 range) pour les pads, en limitant les valeurs extrêmes
    const normalizedVelocity = Math.min(this.velocity / 5, 1);

    // check la collisions avec les pads et les boutons
    this.checkCollisions(normalizedVelocity);

    
    this.previousPosition.copy(this.worldPosition);

    // mettre à jour le cache des pads toutes les secondes pour gérer les changements dynamiques
    this.lastCacheUpdateTime = Math.floor(time / 1000);
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

      
      const padId = padEl;

      // Get drum pad world position (center of cylinder)
      padEl.object3D.getWorldPosition(this.tempPosition);

      // Get the world matrix to extract orientation
      padEl.object3D.updateMatrixWorld(true);
      
      
      
      const upVector = new THREE.Vector3(0, 1, 0);
      upVector.applyQuaternion(padEl.object3D.getWorldQuaternion(new THREE.Quaternion()));
      
      
      const worldScale = new THREE.Vector3();
      padEl.object3D.getWorldScale(worldScale);
      const scaledHeight = padComponent.height * worldScale.y;
      const scaledRadius = padComponent.radius * Math.max(worldScale.x, worldScale.z);
      
      // Calculer le centre de la surface du tambour (au milieu de la hauteur)
      const topSurfaceCenter = this.tempPosition.clone().add(
        upVector.clone().multiplyScalar(scaledHeight / 2)
      );
      
      // Projeter la position du bout de la baguette sur le plan de la surface du tambour
      // Vecteur du centre de la surface au bout
      const toTip = tipPos.clone().sub(topSurfaceCenter);
      
      
      const heightDist = toTip.dot(upVector);
      
      
      const radialVec = toTip.clone().sub(upVector.clone().multiplyScalar(heightDist));
      const radialDist = radialVec.length();
      

      const surfaceThreshold = 0.08;
      const isInside = radialDist < (scaledRadius + 0.02) && 
                       heightDist > -surfaceThreshold && 
                       heightDist < surfaceThreshold;
      
      const wasInside = this.insidePads.has(padId);

      if (isInside && !wasInside) {
        // Rentre dans la zone de collision - trigger hit
        if (this.data.debug) {
          console.log(`[drumstick-tip] Hit! Radial: ${radialDist.toFixed(3)}, Height: ${heightDist.toFixed(3)}, Velocity: ${velocity.toFixed(2)}`);
        }
        padComponent.hit(velocity);
        this.insidePads.add(padId);
      } else if (!isInside && wasInside) {
        //  Sors de la zone de collision
        this.insidePads.delete(padId);
        if (this.data.debug) {
          console.log(`[drumstick-tip] Exited pad`);
        }
      }
    }


    for (const buttonEl of this.toggleButtons) {
      const buttonComponent = buttonEl.components['toggle-button'];
      if (!buttonComponent) continue;

      const buttonId = buttonEl;


      buttonEl.object3D.getWorldPosition(this.tempPosition);


      const distance = tipPos.distanceTo(this.tempPosition);
      const collisionRadius = 0.08; 

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
 * Composant toggle-button
 * Un bouton qui peut être activé/désactivé en le frappant avec les baguettes
 * 

 */
AFRAME.registerComponent('toggle-button', {
  schema: {
    action: { type: 'string', default: 'reverb' },
    cooldown: { type: 'number', default: 300 } // ms between toggles
  },

  init: function () {
    this.enabled = false;
    this.lastToggleTime = 0;
    

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
    // Mise à jour de la couleur
    const color = this.enabled ? '#4CAF50' : '#f44336';
    this.el.setAttribute('color', color);
  }
});
