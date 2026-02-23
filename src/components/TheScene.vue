<script setup>
  import TheCameraRig from './TheCameraRig.vue';
  import TheDrumKit from './TheDrumKit.vue';
  import TheRoom from './TheRoom.vue';

  import '../aframe/simple-grab.js';
  import '../aframe/outline.js';

  defineProps({
    scale: Number,
    overlaySelector: String,
  });
</script>

<template>
  <a-scene
    obb-collider="showColliders: false;"
    background="color: #1a1a2e;"
    :webxr="`
      requiredFeatures: local-floor;
      referenceSpaceType: local-floor;
      optionalFeatures: dom-overlay;
      overlayElement: ${overlaySelector};
    `"
    xr-mode-ui="XRMode: xr"
    physx="
      autoLoad: true;
      delay: 1000;
      useDefaultScene: false;
      wasmUrl: lib/physx.release.wasm;
    "
    outline
    simple-grab
  >

    <!-- Lumière ambiante pour éclairer la chambre -->
    <a-light type="ambient" color="#ffffff" intensity="0.4"></a-light>
    
    <!-- Lumière directionnelle (simule la lumière de la fenêtre) -->
    <a-light type="directional" color="#ffeedd" intensity="0.6" position="3 4 2"></a-light>
    
    <!-- Lumière d'appoint pour la batterie -->
    <a-light type="point" color="#ffaa66" intensity="0.5" position="0 2.5 -1"></a-light>
    
    <!-- Spot lumineux sur la batterie -->
    <a-light type="spot" color="#ffffff" intensity="0.8" position="0 3 -1" angle="60" penumbra="0.3" target="#drum-kit"></a-light>

    <!-- L'environnement de la chambre -->
    <!-- Ajuste position/rotation/scale pour centrer la batterie dans la pièce -->
    <TheRoom 
      position="0 0 -7"
      rotation="0 360 0"
      scale="1.5 1.5 1.5"
    />

    <!-- Mur arrière pour fermer la pièce -->
    <a-plane
      position="0 2 -5.6"
      rotation="0 360 0"
      width="8"
      height="5"
      color="#3a3a3a"
      material="roughness: 0.9; metalness: 0.1"
    ></a-plane>

    <!-- La batterie VR (positionnée au centre de la chambre) -->
    <TheDrumKit 
      position="0 0 -1"
      rotation="0 180 0"
      scale="1 1 1"
    />

    <TheCameraRig />

  </a-scene>
</template>