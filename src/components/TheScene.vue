<script setup>
  import TheCameraRig from './TheCameraRig.vue';

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

    <!-- Lumière ambiante pour voir la scène -->
    <a-light type="ambient" color="#ffffff" intensity="0.5"></a-light>
    
    <!-- Lumière directionnelle principale -->
    <a-light type="directional" color="#ffffff" intensity="0.8" position="0 10 5"></a-light>
    
    <!-- Sol simple pour référence -->
    <a-plane 
      position="0 0 0" 
      rotation="-90 0 0" 
      width="20" 
      height="20" 
      color="#2d2d44"
      material="roughness: 0.8"
    ></a-plane>

    <TheCameraRig />

  </a-scene>
</template>