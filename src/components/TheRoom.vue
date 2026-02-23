<script setup>
/**
 * TheRoom.vue - Environnement de la chambre abandonnée
 * 
 * Modèle 3D: "Old Room" par samixalam
 * Source: https://sketchfab.com/3d-models/old-room-b92ccf2c119a47328bf9007a467ecdc8
 * Licence: CC Attribution
 */

defineProps({
  position: {
    type: String,
    default: '0 0 0'
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
  <!-- Environnement de la chambre -->
  <a-entity
    id="room"
    :position="position"
    :rotation="rotation"
    :scale="scale"
  >
    <!-- Modèle 3D de la chambre -->
    <a-entity
      id="room-model"
      gltf-model="url(assets/old-room.glb)"
      position="0 0 0"
      rotation="0 0 0"
    ></a-entity>
  </a-entity>
</template>
