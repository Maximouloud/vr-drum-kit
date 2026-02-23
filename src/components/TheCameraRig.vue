<script setup>
  import '../aframe/disable-in-vr.js';
  import '../aframe/hide-in-vr.js';
  import '../aframe/simple-navmesh-constraint.js';
  import '../aframe/blink-controls.js';
  import '../aframe/physx-grab.js';
</script>

<template>
  <a-entity
    id="camera-rig"
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
        hand-controls="hand: left"
        blink-controls="
          cameraRig: #camera-rig;
          teleportOrigin: #head;
          collisionEntities: [data-role='nav-mesh'];
          snapTurn: false;
        "
        obb-collider
        position="0 1.5 0"
        physx-grab
      >
        <!-- Baguette de batterie gauche (modèle Sketchfab mirroré) -->
        <a-entity id="drumstick-left" position="0 0 0" rotation="-45 0 0">
          <!-- Modèle 3D de baguette (mirroré sur X pour main gauche) -->
          <a-entity
            gltf-model="url(assets/drumstick-right.glb)"
            scale="-0.01 0.01 0.01"
            position="0 0 -0.2"
            rotation="0 0 90"
          ></a-entity>
          <!-- Sphère de collision invisible à la pointe -->
          <a-sphere 
            id="drumstick-left-tip"
            class="drumstick-tip"
            radius="0.05"
            position="0 0 -0.4"
            visible="false"
            obb-collider
          ></a-sphere>
        </a-entity>
      </a-entity>

      <a-entity
        id="hand-right"
        hand-controls="hand: right"
        laser-controls="hand: right"
        raycaster="far: 4; objects: [clickable]; showLine: true;"
        position="0 1.5 0"
        obb-collider
        physx-grab
      >
        <!-- Baguette de batterie droite (modèle Sketchfab) -->
        <a-entity id="drumstick-right" position="0 0 0" rotation="-45 0 0">
          <!-- Modèle 3D de baguette -->
          <a-entity
            gltf-model="url(assets/drumstick-right.glb)"
            scale="0.01 0.01 0.01"
            position="0 0 -0.2"
            rotation="0 0 90"
          ></a-entity>
          <!-- Sphère de collision invisible à la pointe -->
          <a-sphere 
            id="drumstick-right-tip"
            class="drumstick-tip"
            radius="0.05"
            position="0 0 -0.4"
            visible="false"
            obb-collider
          ></a-sphere>
        </a-entity>
      </a-entity>

  </a-entity>
</template>