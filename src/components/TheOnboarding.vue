<script setup>
  import { ref } from 'vue';

  defineProps({
    loaded: Boolean,
  });

  const showOnboarding = ref(true);

  function enterScene() {
    showOnboarding.value = false;
    if (AFRAME.utils.device.checkHeadsetConnected() && !AFRAME.utils.device.isMobile()) {
      document.querySelector('a-scene').enterVR();
    }
    document.querySelector('a-scene').emit('enter-scene');
  }
</script>

<template>
  <div id="onboarding" v-if="showOnboarding">
    <div>
      <h1>VR Drumkit - Maximilien Maret</h1>
      <p v-if="!loaded">Chargement...</p>
      <button v-if="loaded" @click="enterScene()">Jouer</button>

      <div class="licences">

        <section>
          <h4>🥁 Comment jouer</h4>
          <p class="goal">Approche-toi de la batterie et frappe les éléments du kit avec tes contrôleurs pour produire des sons. Explore la pièce, trouve le bon rythme et laisse-toi emporter par la musique !</p>
          <ul>
            <li><strong>Frapper une pièce</strong> – Approche un contrôleur et touche la surface d'une caisse, d'une cymbale ou d'un tom pour déclencher le son correspondant</li>
            <li><strong>Se déplacer</strong> – Utilise le joystick gauche ou le téléport (grip) pour te repositionner autour de la batterie</li>
          </ul>
        </section>

        <section>
          <h4>🕹️ Modes de contrôle</h4>
          <ul>
            <li>
              <strong>Desktop</strong> – Clavier pour se déplacer (WASD ou flèches) + Souris pour regarder (clic + glisser)
            </li>
            <li>
              <strong>Mobile</strong> – 1 doigt pour avancer · 2 doigts pour reculer · Curseur de regard pour cliquer
            </li>
            <li>
              <strong>VR/AR</strong> – Déplacement physique + Téléport (grip pour saisir, laser pour cliquer) · Curseur de regard pour cliquer
            </li>
          </ul>
        </section>

        <section>
          <h4>🔗 Code source</h4>
          <blockquote><a href="https://github.com/Maximouloud/vr-drum-kit" target="_blank">Github repo</a></blockquote>
        </section>

        <dl>
          <dt><i>Librairies</i></dt>

          <dt><a href="https://github.com/c-frame/aframe-extras" target="_blank">aframe-extras</a></dt>
          <dd><a href="https://github.com/c-frame/aframe-extras/blob/master/LICENSE" target="_blank">MIT License</a></dd>

          <dt><a href="https://github.com/c-frame/physx" target="_blank">aframe physx</a></dt>
          <dd><a href="https://github.com/c-frame/aframe-extras/blob/master/LICENSE" target="_blank">MIT License</a></dd>

          <dt><a href="https://github.com/jure/aframe-blink-controls/" target="_blank">aframe-blink-controls</a></dt>
          <dd><a href="https://github.com/jure/aframe-blink-controls/blob/main/LICENSE" target="_blank">MIT License</a></dd>

          <dt><a href="https://github.com/diarmidmackenzie/aframe-multi-camera/" target="_blank">aframe-multi-camera</a></dt>
          <dd><a href="https://github.com/diarmidmackenzie/aframe-multi-camera/blob/main/LICENSE" target="_blank">MIT License</a></dd>

          <dt><a href="https://github.com/AdaRoseCannon/aframe-xr-boilerplate" target="_blank">simple-navmesh-constraint</a></dt>
          <dd>By Ada Rose Cannon under MIT License</dd>

          <dt><i>Assets 3D</i></dt>

          <dt><a href="https://sketchfab.com/3d-models/burgundy-drum-kit-by-opal-8d0ae92a6a664c5abf65fa9395427ce3" target="_blank">Burgundy Drum Kit by Opal</a></dt>
          <dd>by <a href="https://sketchfab.com/glowbox3d" target="_blank">Glowbox 3D</a> under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a></dd>

          <dt><a href="https://sketchfab.com/3d-models/vr-liminal-room-baked-826fc238e9d443c9b801e35cc831ff14" target="_blank">VR Liminal Room [Baked]</a></dt>
          <dd>by <a href="https://sketchfab.com/abhayexe" target="_blank">abhayexe</a> under <a href="https://sketchfab.com/licenses" target="_blank">Free Standard License</a></dd>

          <dt><a href="https://sketchfab.com/3d-models/table-lamp-ac90b3ea2cc742a49405bec08d5ddcd4" target="_blank">Table Lamp</a></dt>
          <dd>by <a href="https://sketchfab.com/siotech2011" target="_blank">siotech2011</a> under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a></dd>

          <dt><a href="https://sketchfab.com/3d-models/soviet-old-table-9e1fc1a8f6f64995bcfab5e0ca17f6ea" target="_blank">Soviet Old Table</a></dt>
          <dd>by <a href="https://sketchfab.com/Skilletik" target="_blank">Skilletik</a> under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a></dd>

          <dt><a href="https://sketchfab.com/3d-models/vr-gallery-1ac32ed62fdf424498acc146fad31f7e" target="_blank">VR Gallery</a></dt>
          <dd>by <a href="https://sketchfab.com/mvrc.art" target="_blank">Maxim Mavrichev</a> under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a></dd>

          <dt><a href="https://sketchfab.com/3d-models/3d-gallery-for-vr-projects-68f77ed8558c4bd59e0a13e2cc9d1fd1" target="_blank">Physic room model</a></dt>
          <dd>by <a href="https://sketchfab.com/tekuto1s" target="_blank">tekuto1s</a> under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0</a></dd>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped>
  h1 { font-size: 1.5rem }
  a {
    color: #eee;
    text-decoration: none;
  }
  .licences {
    margin: 2rem 0;
    padding-bottom: 1rem;
    font-size: 1rem;
    text-align: left;
  }
  .licences section {
    margin-bottom: 1.5rem;
  }
  .licences h4 {
    margin-bottom: 0.5rem;
  }
  .licences .goal {
    font-size: 0.95rem;
    color: #bbb;
    margin-bottom: 0.5rem;
  }
  .licences dt {
    padding-top: 0.75rem;
    font-size: 0.9rem;
    font-weight: bold;
  }
  .licences dd {
    margin-left: 0;
    font-size: 0.8rem;
  }

  #onboarding {
    position: absolute;
    top: 0;
    left: 0;
    background-color: #2a2d35;
    color: #ccc;
    width: 100vw;
    height: 100vh;
    padding: 1rem;
    font-family: monospace;
    z-index: 10000;
    overflow: auto;
  }
  #onboarding > * {
    margin: 0 auto;
    max-width: 50rem;
    width: calc(100vw - 10rem);
    text-align: center;
    border-radius: 0.3rem;
    padding: 1rem;
    font-size: 1.3rem;
  }
  #onboarding button {
    font-size: 1.3rem;
    padding: 0.5rem 1rem;
    border-radius: 0.3rem;
    background-color: white;
    color: black;
    border: none;
    cursor: pointer;
  }
  #onboarding li {
    font-size: 1rem;
    text-align: left;
  }
</style>