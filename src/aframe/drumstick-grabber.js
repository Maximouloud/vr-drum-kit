/**
 * drumstick-grabber.js
 * 
 * A-Frame components for VR drumstick grabbing system
 * - grabbable-drumstick: Placed on drumsticks, makes them grabbable
 * - drumstick-hand: Placed on controller hands, handles grabbing with raycast
 */

/**
 * Component for grabbable drumsticks
 * Place this on drumstick entities that can be picked up
 */
AFRAME.registerComponent('grabbable-drumstick', {
  schema: {
    hand: { type: 'string', default: '' } // 'left' or 'right' - which hand this stick is for
  },

  init: function() {
    this.isGrabbed = false;
    this.originalParent = this.el.parentNode;
    this.originalPosition = this.el.getAttribute('position');
    this.originalRotation = this.el.getAttribute('rotation');
    this.currentHand = null;
  },

  grab: function(handEl) {
    if (this.isGrabbed) return false;
    
    this.isGrabbed = true;
    this.currentHand = handEl;
    
    // Hide at original position
    this.el.setAttribute('visible', false);
    
    // Create a clone in the hand
    this.handStick = document.createElement('a-entity');
    this.handStick.setAttribute('id', `grabbed-stick-${this.data.hand}`);
    
    // Add drumstick geometry to hand
    this.handStick.innerHTML = `
      <!-- Manche -->
      <a-cylinder
        color="#8B4513"
        height="0.35"
        radius="0.008"
        position="0 0 -0.175"
        rotation="90 0 0"
        material="roughness: 0.7"
      ></a-cylinder>
      <!-- Tête (partie plus épaisse) -->
      <a-cylinder
        color="#8B4513"
        height="0.05"
        radius="0.012"
        position="0 0 -0.375"
        rotation="90 0 0"
        material="roughness: 0.7"
      ></a-cylinder>
      <!-- Sphère de collision -->
      <a-sphere 
        class="drumstick-tip"
        radius="0.01"
        position="0 0 -0.4"
        color="#00ff00"
        opacity="0"
        material="transparent: true"
        drumstick-tip
      ></a-sphere>
    `;
    
    handEl.appendChild(this.handStick);
    
    // Emit event
    this.el.emit('drumstick-grabbed', { hand: handEl });
    
    console.log(`[grabbable-drumstick] Grabbed by ${handEl.id}`);
    
    return true;
  },

  drop: function() {
    if (!this.isGrabbed) return;
    
    this.isGrabbed = false;
    
    // Remove clone from hand
    if (this.handStick && this.handStick.parentNode) {
      this.handStick.parentNode.removeChild(this.handStick);
      this.handStick = null;
    }
    
    // Show original again
    this.el.setAttribute('visible', true);
    
    this.currentHand = null;
    
    // Emit event
    this.el.emit('drumstick-dropped');
    
    console.log(`[grabbable-drumstick] Dropped`);
  }
});

/**
 * Component for controller hands that can grab drumsticks
 * Uses raycaster to detect and grab nearby drumsticks
 */
AFRAME.registerComponent('drumstick-hand', {
  schema: {
    hand: { type: 'string', default: 'right' }, // 'left' or 'right'
    grabButton: { type: 'string', default: 'triggerdown' }, // button to grab
    dropButton: { type: 'string', default: 'gripdown' }, // button to drop
    rayLength: { type: 'number', default: 0.5 } // raycast length in meters
  },

  init: function() {
    this.grabbedStick = null;
    this.raycaster = new THREE.Raycaster();
    this.rayDirection = new THREE.Vector3(0, 0, -1);
    
    // Bind event handlers
    this.onGrabButton = this.onGrabButton.bind(this);
    this.onDropButton = this.onDropButton.bind(this);
    
    // Listen to controller buttons
    this.el.addEventListener(this.data.grabButton, this.onGrabButton);
    this.el.addEventListener(this.data.dropButton, this.onDropButton);
    
    // Also listen to A/X buttons as alternatives
    this.el.addEventListener('abuttondown', this.onGrabButton);
    this.el.addEventListener('xbuttondown', this.onGrabButton);
    
    // Create visual ray for debugging (hidden by default)
    this.createRayVisual();
  },

  createRayVisual: function() {
    // Create a line to show the raycast (useful for debugging)
    this.rayVisual = document.createElement('a-entity');
    this.rayVisual.setAttribute('line', {
      start: '0 0 0',
      end: `0 0 -${this.data.rayLength}`,
      color: '#00ff00',
      opacity: 0.5
    });
    this.rayVisual.setAttribute('visible', false); // Set to true for debugging
    this.el.appendChild(this.rayVisual);
  },

  onGrabButton: function(evt) {
    // If already holding a stick, do nothing
    if (this.grabbedStick) return;
    
    // Find grabbable drumsticks using raycast
    const stick = this.findDrumstickWithRaycast();
    
    if (stick) {
      const grabbableComponent = stick.components['grabbable-drumstick'];
      if (grabbableComponent && grabbableComponent.grab(this.el)) {
        this.grabbedStick = stick;
        console.log(`[drumstick-hand] ${this.data.hand} hand grabbed drumstick`);
      }
    }
  },

  onDropButton: function(evt) {
    if (this.grabbedStick) {
      const grabbableComponent = this.grabbedStick.components['grabbable-drumstick'];
      if (grabbableComponent) {
        grabbableComponent.drop();
      }
      this.grabbedStick = null;
      console.log(`[drumstick-hand] ${this.data.hand} hand dropped drumstick`);
    }
  },

  findDrumstickWithRaycast: function() {
    // Get world position and direction of the controller
    const handObject = this.el.object3D;
    const worldPos = new THREE.Vector3();
    const worldDir = new THREE.Vector3(0, 0, -1);
    
    handObject.getWorldPosition(worldPos);
    handObject.getWorldDirection(worldDir);
    worldDir.negate(); // A-Frame controllers point in -Z direction
    
    // Set up raycaster
    this.raycaster.set(worldPos, worldDir);
    this.raycaster.far = this.data.rayLength;
    
    // Find all grabbable drumsticks
    const drumsticks = document.querySelectorAll('[grabbable-drumstick]');
    const meshes = [];
    
    drumsticks.forEach(stick => {
      // Get all meshes in the drumstick entity
      stick.object3D.traverse(child => {
        if (child.isMesh) {
          child.userData.drumstickEl = stick;
          meshes.push(child);
        }
      });
    });
    
    // Perform raycast
    const intersects = this.raycaster.intersectObjects(meshes, false);
    
    if (intersects.length > 0) {
      // Return the A-Frame entity of the first hit
      const hit = intersects[0];
      return hit.object.userData.drumstickEl;
    }
    
    // Fallback: proximity-based detection
    return this.findDrumstickByProximity();
  },

  findDrumstickByProximity: function() {
    const handPos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(handPos);
    
    const drumsticks = document.querySelectorAll('[grabbable-drumstick]');
    let closestStick = null;
    let closestDist = this.data.rayLength;
    
    drumsticks.forEach(stick => {
      const grabbable = stick.components['grabbable-drumstick'];
      if (grabbable && grabbable.isGrabbed) return; // Skip already grabbed sticks
      
      const stickPos = new THREE.Vector3();
      stick.object3D.getWorldPosition(stickPos);
      
      const dist = handPos.distanceTo(stickPos);
      if (dist < closestDist) {
        closestDist = dist;
        closestStick = stick;
      }
    });
    
    return closestStick;
  },

  remove: function() {
    this.el.removeEventListener(this.data.grabButton, this.onGrabButton);
    this.el.removeEventListener(this.data.dropButton, this.onDropButton);
    this.el.removeEventListener('abuttondown', this.onGrabButton);
    this.el.removeEventListener('xbuttondown', this.onGrabButton);
  }
});
