<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';

  defineProps({
    position: { type: String, default: '0.8 0.9 -1' },
    rotation: { type: String, default: '0 200 0' },
  });

  const reverbEnabled = ref(false);
  const delayEnabled = ref(false);
  const distortionEnabled = ref(false);

  function onReverbChanged(event) {
    reverbEnabled.value = event.detail.enabled;
  }

  function onDelayChanged(event) {
    delayEnabled.value = event.detail.enabled;
  }

  function onDistortionChanged(event) {
    distortionEnabled.value = event.detail.enabled;
  }

  onMounted(() => {
    // Sync with current state
    if (window.isDrumReverbEnabled) {
      reverbEnabled.value = window.isDrumReverbEnabled();
    }
    if (window.isDrumDelayEnabled) {
      delayEnabled.value = window.isDrumDelayEnabled();
    }
    if (window.isDrumDistortionEnabled) {
      distortionEnabled.value = window.isDrumDistortionEnabled();
    }
    // Listen for external changes
    window.addEventListener('drum-reverb-changed', onReverbChanged);
    window.addEventListener('drum-delay-changed', onDelayChanged);
    window.addEventListener('drum-distortion-changed', onDistortionChanged);
  });

  onUnmounted(() => {
    window.removeEventListener('drum-reverb-changed', onReverbChanged);
    window.removeEventListener('drum-delay-changed', onDelayChanged);
    window.removeEventListener('drum-distortion-changed', onDistortionChanged);
  });
</script>

<template>
  <!-- Position = base du pied (point d'ancrage au sol) -->
  <a-entity :position="position" :rotation="rotation">
    <!-- Groupe table (décalé vers le haut depuis le sol) -->
    <a-entity position="0 0.5 0">
      <!-- Table surface (à 0.5m du sol) - agrandie pour 3 boutons -->
      <a-box
        position="0 0 0"
        width="0.5"
        height="0.02"
        depth="0.2"
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

      <!-- Reverb button -->
      <a-entity id="reverb-button-group" position="-0.15 0.05 0">
        <a-box
          id="reverb-button"
          position="0 0 0"
          width="0.1"
          height="0.06"
          depth="0.07"
          :color="reverbEnabled ? '#4CAF50' : '#f44336'"
          material="roughness: 0.6; metalness: 0.3"
          toggle-button="action: reverb"
        ></a-box>
        <a-text
          value="REVERB"
          position="0 0.031 0"
          rotation="-90 0 0"
          align="center"
          color="#ffffff"
          width="0.25"
        ></a-text>
      </a-entity>

      <!-- Delay button -->
      <a-entity id="delay-button-group" position="0 0.05 0">
        <a-box
          id="delay-button"
          position="0 0 0"
          width="0.1"
          height="0.06"
          depth="0.07"
          :color="delayEnabled ? '#4CAF50' : '#f44336'"
          material="roughness: 0.6; metalness: 0.3"
          toggle-button="action: delay"
        ></a-box>
        <a-text
          value="DELAY"
          position="0 0.031 0"
          rotation="-90 0 0"
          align="center"
          color="#ffffff"
          width="0.25"
        ></a-text>
      </a-entity>

      <!-- Distortion button -->
      <a-entity id="distortion-button-group" position="0.15 0.05 0">
        <a-box
          id="distortion-button"
          position="0 0 0"
          width="0.1"
          height="0.06"
          depth="0.07"
          :color="distortionEnabled ? '#4CAF50' : '#f44336'"
          material="roughness: 0.6; metalness: 0.3"
          toggle-button="action: distortion"
        ></a-box>
        <a-text
          value="DISTO"
          position="0 0.031 0"
          rotation="-90 0 0"
          align="center"
          color="#ffffff"
          width="0.25"
        ></a-text>
      </a-entity>
    </a-entity>
  </a-entity>
</template>
