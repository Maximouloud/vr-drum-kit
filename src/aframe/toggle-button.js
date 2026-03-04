// toggle-button.js
// Composant A-Frame toggle-button

AFRAME.registerComponent('toggle-button', {
  schema: {
    action: { type: 'string', default: 'reverb' },
    cooldown: { type: 'number', default: 300 }
  },

  init: function () {
    if (this.data.action === 'radio') {
      this.enabled = false;
      this.updateVisual();
    } else {
      this.enabled = false;
    }
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
    if (this.data.action === 'radio') {
      this.enabled = !this.enabled;
      var radio = document.querySelector('#radio');
      if (radio && radio.components['radio-player']) {
        if (this.enabled) {
          radio.components['radio-player'].play();
        } else {
          radio.components['radio-player'].pause();
        }
      }
    } else {
      this.enabled = !this.enabled;
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
    }
    this.updateVisual();
    this.el.emit('toggle', { enabled: this.enabled });
    console.log(`[toggle-button] ${this.data.action} toggled:`, this.enabled);
  },

  updateVisual: function () {
    const color = this.enabled ? '#4CAF50' : '#f44336';
    const tag = this.el.tagName ? this.el.tagName.toLowerCase() : '';
    if (tag === 'a-box' || tag === 'a-sphere' || this.el.getAttribute('geometry')) {
      this.el.setAttribute('color', color);
    } else {
      if (this.el.getObject3D('mesh')) {
        this.el.getObject3D('mesh').traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.color && node.material.color.set && node.material.color.set(color);
          }
        });
      }
    }
  }
});
