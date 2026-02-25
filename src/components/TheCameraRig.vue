<script setup>
  import '../aframe/disable-in-vr.js';
  import '../aframe/hide-in-vr.js';
  import '../aframe/simple-navmesh-constraint.js';
  import '../aframe/blink-controls.js';
  import '../aframe/physx-grab.js';
  import '../aframe/drum-hit-detector.js';
</script>

<template>
  <a-entity
    id="camera-rig"
    position="0 0 -1.5"
    rotation="0 180 0"
    movement-controls="camera: #head;"
    disable-in-vr="component: movement-controls;"
  >

    <a-entity
      id="head"
      look-controls="pointerLockEnabled: true"
      simple-navmesh-constraint="navmesh: [data-role='nav-mesh']; height: 1.65;"
      disable-in-vr="component: simple-navmesh-constraint;"
      camera
      position="0 1.65 0"
    >
      <a-entity
        geometry="primitive: circle; radius: 0.0003;"
        material="shader: flat; color: white;"
        cursor
        raycaster="far: 4; objects: [clickable]; showLine: false;"
        position="0 0 -0.1"
        disable-in-vr="component: raycaster; disableInAR: false;"
        hide-in-vr="hideInAR: false"
      ></a-entity>
      <a-box
        id="dummy-hand-right"
        obb-collider
        position="0.3 -0.4 -0.5"
      ></a-box>
      <a-entity
        id="dummy-hand-left"
        obb-collider
        position="-0.3 -0.4 -0.5"
      ></a-entity>
    </a-entity>

    <a-entity
      id="hand-left"
      oculus-touch-controls="hand: left"
      blink-controls="
        cameraRig: #camera-rig;
        teleportOrigin: #head;
        collisionEntities: [data-role='nav-mesh'];
        snapTurn: false;
      "
    >
      <!-- Baguette gauche -->
      <a-entity id="drumstick-left" position="0 0 0" rotation="0 0 0">
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
          id="drumstick-left-tip"
          class="drumstick-tip"
          radius="0.01"
          position="0 0 -0.4"
          color="#00ff00"
          opacity="0"
          material="transparent: true"
          drumstick-tip
        ></a-sphere>
      </a-entity>
    </a-entity>

    <a-entity
      id="hand-right"
      oculus-touch-controls="hand: right"
    >
      <!-- Baguette droite -->
      <a-entity id="drumstick-right" position="0 0 0" rotation="0 0 0">
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
          id="drumstick-right-tip"
          class="drumstick-tip"
          radius="0.01"
          position="0 0 -0.4"
          color="#00ff00"
          opacity="0"
          material="transparent: true"
          drumstick-tip
        ></a-sphere>
      </a-entity>
    </a-entity>

  </a-entity>
</template>