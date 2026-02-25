<script setup>
/**
 * TheDrumKit.vue - Composant principal de la batterie VR
 * 
 * Modèle 3D: "Burgundy Drum Kit by Opal" par Glowbox 3D
 * Source: https://sketchfab.com/3d-models/burgundy-drum-kit-by-opal-8d0ae92a6a664c5abf65fa9395427ce3
 * Licence: CC Attribution
 */

defineProps({
  position: {
    type: String,
    default: '0 0 -2'
  },
  rotation: {
    type: String,
    default: '0 0 0'
  },
  scale: {
    type: String,
    default: '1 1 1'
  }
});
</script>

<template>
  <!-- Conteneur principal de la batterie -->
  <a-entity
    id="drum-kit"
    :position="position"
    :rotation="rotation"
    :scale="scale"
  >
    <!-- Modèle 3D de la batterie -->
    <a-entity
      id="drum-model"
      gltf-model="url(assets/drum-kit.glb)"
      position="0 0 0"
      rotation="0 0 0"
      scale="0.8 0.8 0.8"
    ></a-entity>
    
    <!-- 
      TODO: Étape 3 - Ajouter les hitboxes ici
      Chaque élément de batterie aura sa propre hitbox invisible
      pour la détection de collision avec les baguettes
    -->
    
    <!-- Hitbox Snare Drum (rouge pour calibration, mettre visible="false" une fois positionné) -->
    <a-cylinder
      id="hitbox-snare"
      radius="0.23"
      height="0.05"
      position="-0.45 0.70 0.12"
      color="red"
      opacity="0"
      material="transparent: true"
      drum-pad="sound: /sounds/snare.wav"
    ></a-cylinder>

    <!-- Hitbox Hi-Hat (jaune pour calibration, mettre visible="false" une fois positionné) -->
    <a-cylinder
      id="hitbox-hihat"
      radius="0.24"
      height="0.03"
      position="-0.8 1.13 0.35"
      color="yellow"
      opacity="0"
      material="transparent: true"
      drum-pad="sound: /sounds/hihat.wav"
    ></a-cylinder>

    <!-- Hitbox Crash Cymbal (orange pour calibration, mettre visible="false" une fois positionné) -->
    <a-cylinder
      id="hitbox-crash"
      radius="0.33"
      height="0.03"
      position="0.8 1.21 -0.5"
      rotation="+40 -15 10"
      color="orange"
      opacity="0"
      material="transparent: true"
      drum-pad="sound: /sounds/crash.wav"
    ></a-cylinder>

    <!-- Hitbox Tom 01 (bleu pour calibration, mettre visible="false" une fois positionné) -->
    <a-cylinder
      id="hitbox-tom1"
      radius="0.18"
      height="0.05"
      position="-0.22 1.08 -0.48"
      rotation="43 0 -10"
      color="blue"
      opacity="0"
      material="transparent: true"
      drum-pad="sound: /sounds/tom-01.wav"
    ></a-cylinder>

    <!-- Hitbox Tom 02 (cyan pour calibration, mettre visible="false" une fois positionné) -->
    <a-cylinder
      id="hitbox-tom2"
      radius="0.20"
      height="0.05"
      position="0.22 1.08 -0.48"
      rotation="43 0 10"
      color="cyan"
      opacity="0"
      material="transparent: true"
      drum-pad="sound: /sounds/tom-02.wav"
    ></a-cylinder>

    <!-- Hitbox Floor Tom (vert pour calibration, mettre visible="false" une fois positionné) -->
    <a-cylinder
      id="hitbox-floor-tom"
      radius="0.23"
      height="0.05"
      position="0.60 0.65 0.05"
      color="green"
      opacity="0"
      material="transparent: true"
      drum-pad="sound: /sounds/tom-floor.wav"
    ></a-cylinder>

    <!-- Hitbox Kick Drum (magenta pour calibration, mettre visible="false" une fois positionné) -->
    <a-cylinder
      id="hitbox-kick"
      radius="0.35"
      height="0.05"
      position="0 0.40 -0.1"
      rotation="90 0 0"
      color="magenta"
      opacity="0"
      material="transparent: true"
      drum-pad="sound: /sounds/kick.wav"
    ></a-cylinder>
    
  </a-entity>
</template>
