/**
 * kick-button.js
 * 
 * Component to trigger kick drum sound with controller button
 */

AFRAME.registerComponent('kick-button', {
  schema: {
    button: { type: 'string', default: 'abuttondown' }, // Button to trigger kick
    sound: { type: 'string', default: '/sounds/kick.wav' }
  },

  init: function() {
    this.audioBuffer = null;
    this.isLoaded = false;
    
    // Load the kick sound
    this.loadSound();
    
    // Bind event handler
    this.onButtonPress = this.onButtonPress.bind(this);
    
    // Listen to the specified button
    this.el.addEventListener(this.data.button, this.onButtonPress);
    
    console.log(`[kick-button] Initialized on ${this.el.id}, listening for ${this.data.button}`);
  },

  loadSound: function() {
    const audioContext = this.getAudioContext();
    
    fetch(this.data.sound)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.audioBuffer = audioBuffer;
        this.isLoaded = true;
        console.log(`[kick-button] Sound loaded: ${this.data.sound}`);
      })
      .catch(error => {
        console.error(`[kick-button] Error loading sound: ${error}`);
      });
  },

  getAudioContext: function() {
    // Use the same audio context as drum-hit-detector if available
    if (window.drumAudioContext) {
      return window.drumAudioContext;
    }
    
    // Create a new one if needed
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      window.drumAudioContext = this.audioContext;
    }
    
    return this.audioContext;
  },

  onButtonPress: function(evt) {
    if (!this.isLoaded || !this.audioBuffer) {
      console.warn('[kick-button] Sound not loaded yet');
      return;
    }
    
    this.playSound();
  },

  playSound: function() {
    const audioContext = this.getAudioContext();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Create buffer source
    const source = audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    
    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.8;
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Play the sound
    source.start(0);
    
    console.log('[kick-button] Kick sound played!');
  },

  remove: function() {
    this.el.removeEventListener(this.data.button, this.onButtonPress);
  }
});
