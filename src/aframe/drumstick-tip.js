// drumstick-tip.js
// Composant A-Frame drumstick-tip
import './drum-pad.js';

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
    const distance = this.worldPosition.distanceTo(this.previousPosition);
    const deltaSeconds = deltaTime / 1000;
    this.velocity = distance / deltaSeconds;
    const normalizedVelocity = Math.min(this.velocity / 5, 1);
    this.checkCollisions(normalizedVelocity);
    this.previousPosition.copy(this.worldPosition);
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
    for (const padEl of this.drumPads) {
      const padComponent = padEl.components['drum-pad'];
      if (!padComponent) continue;
      const padId = padEl;
      padEl.object3D.getWorldPosition(this.tempPosition);
      padEl.object3D.updateMatrixWorld(true);
      const upVector = new THREE.Vector3(0, 1, 0);
      upVector.applyQuaternion(padEl.object3D.getWorldQuaternion(new THREE.Quaternion()));
      const worldScale = new THREE.Vector3();
      padEl.object3D.getWorldScale(worldScale);
      const scaledHeight = padComponent.height * worldScale.y;
      const scaledRadius = padComponent.radius * Math.max(worldScale.x, worldScale.z);
      const topSurfaceCenter = this.tempPosition.clone().add(
        upVector.clone().multiplyScalar(scaledHeight / 2)
      );
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
        if (this.data.debug) {
          console.log(`[drumstick-tip] Hit! Radial: ${radialDist.toFixed(3)}, Height: ${heightDist.toFixed(3)}, Velocity: ${velocity.toFixed(2)}`);
        }
        padComponent.hit(velocity);
        this.insidePads.add(padId);
      } else if (!isInside && wasInside) {
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
