<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  defineProps({
    position: { type: String, default: '0.8 0.9 -1' },
    rotation: { type: String, default: '0 200 0' },
  });

  const reverbEnabled = ref(false);

  function toggleReverb() {
    reverbEnabled.value = !reverbEnabled.value;
    if (window.setDrumReverb) {
      window.setDrumReverb(reverbEnabled.value);
    }
  }

  function onReverbChanged(event) {
    reverbEnabled.value = event.detail.enabled;
  }

  onMounted(() => {
    // Sync with current state
    if (window.isDrumReverbEnabled) {
      reverbEnabled.value = window.isDrumReverbEnabled();
    }
    // Listen for external changes
    window.addEventListener('drum-reverb-changed', onReverbChanged);
  });

  onUnmounted(() => {
    window.removeEventListener('drum-reverb-changed', onReverbChanged);
  });
</script>

<template>
  <!-- Position = base du pied (point d'ancrage au sol) -->
  <a-entity :position="position" :rotation="rotation">
    <!-- Groupe table (décalé vers le haut depuis le sol) -->
    <a-entity position="0 0.5 0">
      <!-- Table surface (à 0.5m du sol) -->
      <a-box
        position="0 0 0"
        width="0.4"
        height="0.02"
        depth="0.25"
        color="#2c2c2c"
        material="roughness: 0.8; metalness: 0.2"
      ></a-box>

      <!-- Table leg (descend de 0.25m sous la surface) -->
      <a-cylinder
        position="0 -0.25 0"
        radius="0.02"
        height="0.5"
        color="#1a1a1a"
        material="roughness: 0.9; metalness: 0.1"
      ></a-cylinder>

      <!-- Effects label -->
      <a-text
        value="EFFECTS"
        position="0 0.03 0.08"
        rotation="-90 0 0"
        align="center"
        color="#ffffff"
        width="0.8"
      ></a-text>

      <!-- Reverb button -->
      <a-box
        class="clickable"
        position="0 0.03 -0.03"
        width="0.15"
        height="0.04"
        depth="0.08"
        :color="reverbEnabled ? '#4CAF50' : '#666666'"
        material="roughness: 0.6; metalness: 0.3"
        @click="toggleReverb"
      ></a-box>

      <!-- Reverb button label -->
      <a-text
        value="REVERB"
        position="0 0.06 -0.03"
        rotation="-90 0 0"
        align="center"
        color="#ffffff"
        width="0.5"
      ></a-text>

      <!-- Status indicator text -->
      <a-text
        :value="reverbEnabled ? 'ON' : 'OFF'"
        position="0.12 0.03 -0.03"
        rotation="-90 0 0"
        align="left"
        :color="reverbEnabled ? '#4CAF50' : '#999999'"
        width="0.4"
      ></a-text>
    </a-entity>
  </a-entity>
</template>
