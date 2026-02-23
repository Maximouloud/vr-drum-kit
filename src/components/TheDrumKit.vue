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
      scale="1 1 1"
    ></a-entity>
    
    <!-- 
      TODO: Étape 3 - Ajouter les hitboxes ici
      Chaque élément de batterie aura sa propre hitbox invisible
      pour la détection de collision avec les baguettes
    -->
    
  </a-entity>
</template>
