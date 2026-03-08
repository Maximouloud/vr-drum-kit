<script setup>
  import TheCameraRig from './TheCameraRig.vue';
  import TheDrumKit from './TheDrumKit.vue';
  import TheRoom from './TheRoom.vue';
  import EffectsTable from './EffectsTable.vue';

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


    <!-- Décor visuel 360° -->
    <a-sky src="/assets/sunset.jpg" rotation="0 0 0"></a-sky>


    <!-- Liminal Room -->
    <TheRoom 
      position="0 0 0"
      rotation="0 90 0"
      scale="0.6 0.6 0.6"
    />

    <!-- Table basse -->
    <a-entity
      id="table-basse"
      gltf-model="url(assets/table-basse.glb)"
      position="3 0 -2"
      rotation="0 180 0"
      scale="1.2 1.2 1.2"
    ></a-entity>



    <!-- Lampe sur la table basse -->
    <a-entity
      id="lampe"
      gltf-model="url(assets/lampe.glb)"
      position="3 0.6 -2.5"
      rotation="0 0 0"
      scale="0.5 0.5 0.5"
    >
      <!-- Lumière orange provenant de la lampe -->
      <a-light 
        type="point" 
        color="#ff9933" 
        intensity="0.8" 
        distance="5"
        decay="2"
        position="0 0.5 0"
      ></a-light>
    </a-entity>

    <!-- Radio rétro sur la table basse avec bouton On/Off -->
    <a-entity
      id="radio"
      gltf-model="url(assets/radio.glb)"
      position="2.9 0.6 -2"
      rotation="0 -100 0"
      scale="0.0012 0.0012 0.0012"
      radio-player="src: /sounds/backing-track.mp3; volume: 0.5; loop: true"
      clickable
      animation__fixscale="property: scale; to: 0.0012 0.0012 0.0012; dur: 1; startEvents: radio-fix-scale"
    ></a-entity>
    <a-entity
      id="radio-scale-fix-trigger"
      visible="false"
      position="0 0 0"
      event-set__fixscale="_event: loaded; target: #radio; emit: radio-fix-scale"
    ></a-entity>
    <!-- Bouton On/Off radio -->
    <a-box
      id="radio-toggle-button"
      position="2.9 0.75 -2"
      width="0.18"
      height="0.08"
      depth="0.04"
      color="#f39c12"
      material="opacity: 0.95"
      rotation="0 -90 0"
      toggle-button="action: radio"
    >
      <a-text value="On/Off" align="center" color="#222" position="0 0 0.03" width="1.5"></a-text>
    </a-box>

    <!-- La batterie VR (positionnée au centre de la chambre) -->
    <TheDrumKit 
      position="0 0 -1"
      rotation="0 180 0"
      scale="0.75 0.75 0.75"
    />
    <!-- Effects control table (position = base du pied au sol) -->
    <EffectsTable 
      position="-0.8 0 -1.5"
      rotation="0 100 0"
    />

    <TheCameraRig />

  </a-scene>
</template>