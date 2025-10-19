<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useScrollProgress } from '@/composables/useScrollProgress'
import { useSound } from '@/composables/useSound'
import confetti from 'canvas-confetti'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const { scrollProgress, getOpacity, getScale, getTranslateY, isVisible } = useScrollProgress()

// Sons
const knockSound = useSound('/sounds/knock.mp3')
const creakSound = useSound('/sounds/creak.mp3')
const whooshSound = useSound('/sounds/whoosh.mp3')
const wowSound = useSound('/sounds/wow.mp3')

// États des portes
const doorOneKnocked = ref(false)
const doorTwoKnocked = ref(false)
const doorTwoOpened = ref(false)

// Phase 0 : Écran d'accueil (0-10%)
const initExperience = ref(false);
const welcomeOpacity = computed(() => getOpacity(0, 0, 10))
const welcomeScale = computed(() => getScale(0, 5, 0.95, 1.2))

// Phase 1 : Intro (10-25%)
const introOpacity = computed(() => getOpacity(8, 17, 27))
const introScale = computed(() => getScale(10, 17, 0.95, 1))
const introTranslateY = computed(() => getTranslateY(10, 17, 27, 0))

// Phase 2 : Première porte (25-50%)
const doorOneOpacity = computed(() => getOpacity(23, 37, 52))
const doorOneScale = computed(() => getScale(25, 37, 0.9, 1))

// Phase 3 : Deuxième porte (50-62%)
const doorTwoOpacity = computed(() => getOpacity(48, 55, 65))
const doorTwoScale = computed(() => getScale(50, 55, 0.9, 1))

// Phase 4 : Révélation (62-75%)
const revealOpacity = computed(() => getOpacity(60, 68, 78))
const revealScale = computed(() => getScale(62, 68, 0.95, 1))

// Phase 5 : Finale (75-100%)
const finalOpacity = computed(() => getOpacity(73, 80, 1000))
const finalScale = computed(() => getScale(75, 85, 0.95, 1))

// Swiper configuration
const swiperModules = [Pagination]
const isMobile = ref(window.innerWidth < 768)

// Interactions
const scrollToNext = (percentage: number) => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  const targetScroll = (percentage / 100) * scrollHeight
  window.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  })
}

const knockDoorOne = async () => {
  if (doorOneKnocked.value || scrollProgress.value < 30 || scrollProgress.value > 47) return
  
  doorOneKnocked.value = true
  await knockSound.play()
  
  setTimeout(() => {
    creakSound.play()
    // Reset après un délai
    setTimeout(() => {
      doorOneKnocked.value = false
    }, 6000)
  }, 1000)
}

const knockDoorTwo = async () => {
  if (doorTwoKnocked.value || scrollProgress.value < 52 || scrollProgress.value > 62) return
  
  doorTwoKnocked.value = true
  
  await knockSound.play()
  
  setTimeout(() => {
    doorTwoOpened.value = true
    whooshSound.play()
    // Scroll automatique vers la révélation
    setTimeout(() => {
      scrollToNext(68)
      // Confettis après le scroll
      setTimeout(() => {
        wowSound.play()
        fireConfetti()
      }, 800)
    }, 300)
  }, 1000)
}

const fireConfetti = () => {
  const count = 200
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#ff6b35', '#ffc857', '#ffb3d9', '#5d3b8e']
  }

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    })
  }

  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

onMounted(() => {
  // Initial setup if needed
  window.scrollTo({
    top: 0,
  })
  initExperience.value = true;

  // Update isMobile on resize
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
  }
  window.addEventListener('resize', handleResize)
})

watch(scrollProgress, (newVal) => {
  // Reset door two interaction if user scrolls back above 58%
  if (newVal < 58) {
    doorTwoKnocked.value = false;
    doorTwoOpened.value = false;
  }
});

</script>

<template>
  <div class="halloween-container" :class="{ 'experience-started': initExperience }">
    <!-- Spacer pour créer le scroll virtuel -->
    <div class="scroll-spacer"></div>

    <!-- Progress indicator -->
    <div class="progress-indicator">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${scrollProgress}%` }"></div>
      </div>
      <div class="progress-text">{{ Math.round(scrollProgress) }}%</div>
    </div>

    <!-- Layer 0 : Écran d'accueil (0-10%) -->
    <div class="scene-layer scene-welcome-layer" :style="{
        opacity: welcomeOpacity,
        transform: `scale(${welcomeScale})`,
        pointerEvents: isVisible(0, 12) ? 'auto' : 'none'
      }">
      <div class="scene-content">
        <h1 class="welcome-title">🎃 Halloween 2025 🎃</h1>
        <p class="welcome-subtitle">Une aventure interactive</p>
        <p class="welcome-by">par A French Couple</p>

        <div class="welcome-decoration">
          <span class="float-emoji">👻</span>
          <span class="float-emoji">🦇</span>
          <span class="float-emoji">🕷️</span>
        </div>

        <button class="btn btn-primary" @click="scrollToNext(17)">
          🚀 Commencer l'aventure
        </button>

        <p class="welcome-hint">ou scrolle pour commencer</p>
      </div>
    </div>

    <!-- Layer 1 : Intro (10-25%) -->
    <div class="scene-layer scene-intro-layer" :style="{
        opacity: introOpacity,
        transform: `scale(${introScale}) translateY(${introTranslateY}px)`,
        pointerEvents: isVisible(8, 27) ? 'auto' : 'none'
      }">
      <div class="scene-content">
        <h1 class="title">🎃 L'Immeuble Hanté</h1>
        <p class="subtitle">Ce soir, les enfants partent à la chasse aux bonbons…</p>
        <p class="subtitle">Mais toutes les portes ne s'ouvriront pas 👀</p>

        <div class="building-illustration">
          <div class="building">
            <div class="windows-row">
              <div class="window"></div>
              <div class="window"></div>
            </div>
            <div class="windows-row">
              <div class="window"></div>
              <div class="window"></div>
            </div>
            <div class="windows-row">
              <div class="window"></div>
              <div class="window"></div>
            </div>
            <div class="door-icon">🚪</div>
          </div>
        </div>

        <button class="scroll-hint" @click="scrollToNext(37)" :style=" { opacity: scrollProgress < 20 ? 1 : 0 }">

        </button>
      </div>
    </div>

    <!-- Layer 2 : Première porte (25-50%) -->
    <div class="scene-layer scene-door-one-layer" :style="{
        opacity: doorOneOpacity,
        transform: `scale(${doorOneScale})`,
        pointerEvents: isVisible(23, 52) ? 'auto' : 'none'
      }">
      <div class="scene-content">
        <p class="instruction">👻 La Porte Fantôme</p>
        <p class="hint" :style="{ opacity: (scrollProgress > 30 && scrollProgress < 40) ? 1 : 0 }">
          Toque sur la porte 👇
        </p>

        <div class="door-container">
          <div class="door door-ghost" @click="knockDoorOne" :class="{ 'knocked': doorOneKnocked }">
            <div class="door-decoration">
              <span class="pumpkin">🎃</span>
              <span class="pumpkin">🎃</span>
            </div>
            <div class="door-handle">🔘</div>
          </div>
        </div>

        <p class="result"
          :style="{ opacity: (doorOneKnocked || scrollProgress > 40) ? 1 : 0, pointerEvents: doorOneKnocked || scrollProgress > 40 ? 'auto' : 'none' }">
          Pas de bonbons ici 😅
        </p>

        <button class="btn btn-primary" @click="scrollToNext(55)"
          :style="{ opacity: (doorOneKnocked || scrollProgress > 40) && scrollProgress < 49 ? 1 : 0, pointerEvents: doorOneKnocked || scrollProgress > 40 ? 'auto' : 'none' }">
          Continuer →
        </button>
      </div>
    </div>

    <!-- Layer 3 : Deuxième porte (50-62%) -->
    <div class="scene-layer scene-door-two-layer" :style="{
        opacity: doorTwoOpacity,
        transform: `scale(${doorTwoScale})`,
        pointerEvents: isVisible(48, 65) ? 'auto' : 'none'
      }">
      <div class="scene-content">
        <p class="instruction">✨ La Porte Magique ?</p>
        <p class="hint" :style="{ opacity: (scrollProgress > 52 && scrollProgress < 60) ? 1 : 0 }">
          Toque pour découvrir 🎃
        </p>

        <div class="door-container">
          <div class="door door-home" @click="knockDoorTwo"
            :class="{ 'knocked': doorTwoKnocked, 'opened': doorTwoOpened }">
            <div class="door-decorations-top">
              <span>🎃</span>
              <span>💀</span>
              <span>🦇</span>
              <span>🕷️</span>
            </div>
            <div class="door-wreath">🎃👻🎃</div>
            <div class="door-lights">
              <span class="light">💡</span>
              <span class="light">💡</span>
              <span class="light">💡</span>
            </div>
            <div class="door-handle">🔘</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Layer 4 : Révélation (62-75%) -->
    <div class="scene-layer scene-reveal-layer" :style="{
        opacity: revealOpacity,
        transform: `scale(${revealScale})`,
        pointerEvents: isVisible(60, 78) ? 'auto' : 'none'
      }">
      <div class="scene-content">
        <div class="reveal">
          <div class="characters">
            <img src="/halloween-afrenchcouple.png" alt="">
          </div>
          <h2 class="reveal-title">Joyeux Halloween 🎃</h2>
        </div>

        <button class="btn btn-primary" @click="scrollToNext(85)">Je récupère mon affiche</button>
      </div>
    </div>

    <!-- Layer 5 : Finale (75-100%) -->
    <div class="scene-layer scene-final-layer" :style="{
        opacity: finalOpacity,
        transform: `scale(${finalScale})`,
        pointerEvents: isVisible(73, 100) ? 'auto' : 'none'
      }">
      <div class="scene-content">
        <h1 class="final-title">Prépare ta propre&nbsp;tournée&nbsp;!</h1>
        <p class="final-subtitle">en téléchargeant ton affiche personnalisée</p>

        <!-- Desktop Grid -->
        <div v-if="!isMobile" class="poster-grid">
          <div class="poster-card" v-for="i in 3" :key="i">
            <div class="poster-icon">{{ ['🎃', '👻', '🦇'][i-1] }}</div>
            <h3>Version {{ i }}</h3>
            <p>{{ ['Date libre', 'le 31 en soirée', 'vierge'][i-1] }}</p>
            <a :href="`/affiches/accroche-porte-${['date-libre.pdf', 'soiree.jpg', 'vierge.pdf'][i-1]}`" download
              :aria-label="`Télécharger la version ${['Date libre', 'le 31 en soirée', 'vierge'][i-1]}`">
              <button class="btn btn-primary">📥 Télécharger</button>
            </a>
          </div>
        </div>

        <!-- Mobile Carousel -->
        <div v-else class="poster-carousel">
          <Swiper :modules="swiperModules" :slides-per-view="1" :space-between="20" :pagination="{ clickable: true }"
            :centeredSlides="true" class="swiper-container">
            <SwiperSlide v-for="i in 3" :key="i">
              <div class="poster-card">
                <div class="poster-icon">{{ ['🎃', '👻', '🦇'][i-1] }}</div>
                <h3>Version {{ i }}</h3>
                <p>{{ ['Date libre', 'le 31 en soirée', 'vierge'][i-1] }}</p>
                <a :href="`/affiches/accroche-porte-${['date-libre.pdf', 'soiree.jpg', 'vierge.pdf'][i-1]}`" download
                  :aria-label="`Télécharger la version ${['Date libre', 'le 31 en soirée', 'vierge'][i-1]}`">
                  <button class="btn btn-primary">📥 Télécharger</button>
                </a>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div class="final-footer" :style="{ opacity: scrollProgress > 85 ? 1 : 0 }">
          <p>Créé avec 💙🤍❤️ par <strong><a href="https://instagram.com/a_french_couple" target="_blank"
                rel="noopener noreferrer">A French Couple</a></strong></p>
        </div>
      </div>
    </div>

    <!-- Confettis de fond -->
    <div class="confetti-background">
      <span class="confetti" v-for="i in 15" :key="i">✨</span>
    </div>
  </div>
</template>

<style scoped>
.halloween-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  transition: opacity 1s ease-in-out;
  opacity: 0;
}

.halloween-container.experience-started {
  /* Styles when experience has started */
  opacity: 1;
}

/* Spacer pour créer le scroll */
.scroll-spacer {
  height: 500vh;
  /* 5x la hauteur de l'écran */
  width: 1px;
  opacity: 0;
  pointer-events: none;
}

/* Progress Indicator */
.progress-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 100px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-orange), var(--color-yellow));
  transition: width 0.1s ease-out;
  border-radius: 10px;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  min-width: 45px;
}

/* Layers superposés */
.scene-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
  will-change: opacity, transform;
  overflow: hidden;
}

.scene-content {
  max-width: 900px;
  width: 100%;
  padding: var(--spacing-md);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Intro Layer */
.scene-intro-layer {
  background: linear-gradient(180deg, var(--color-night) 0%, var(--color-purple-dark) 100%);
}

/* Welcome Layer */
.scene-welcome-layer {
  background: linear-gradient(180deg, #1a0b2e 0%, var(--color-night) 100%);
}

.scene-welcome-layer .scene-content {
  max-width: 80%;
  width: 80%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.welcome-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 4px 20px rgba(255, 107, 53, 0.6);
  animation: welcomePulse 3s ease-in-out infinite;

  @media screen and (max-width: 768px) {
    font-size: clamp(1.3rem, 3vw, 2rem);
  }
}

@keyframes welcomePulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.welcome-subtitle {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  opacity: 0.9;
  margin-bottom: var(--spacing-xs);
}

.welcome-by {
  font-size: 1rem;
  opacity: 0.7;
  font-style: italic;
  margin-bottom: var(--spacing-xl);
}

.welcome-decoration {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin: var(--spacing-sm) 0;
}

.float-emoji {
  font-size: 3rem;
  animation: floatEmoji 3s ease-in-out infinite;
}

.float-emoji:nth-child(1) {
  animation-delay: 0s;
}

.float-emoji:nth-child(2) {
  animation-delay: 0.5s;
}

.float-emoji:nth-child(3) {
  animation-delay: 1s;
}

@keyframes floatEmoji {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.welcome-hint {
  font-size: 0.9rem;
  opacity: 0.6;
  margin-top: var(--spacing-sm);
  animation: bounce 2s ease-in-out infinite;
}

.title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 4px 12px rgba(255, 107, 53, 0.5);
}

.subtitle {
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  opacity: 0.9;
  margin: var(--spacing-xs) 0;
}

.building-illustration {
  margin: var(--spacing-md) 0;
}

.building {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, var(--color-purple) 0%, var(--color-purple-dark) 100%);
  padding: var(--spacing-md);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
  max-width: 220px;
  margin: 0 auto;
  gap: var(--spacing-xs);
}

.windows-row {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
}

.window {
  width: 45px;
  height: 45px;
  background: var(--color-yellow);
  border-radius: 8px;
  box-shadow: 0 0 20px var(--color-yellow);
  animation: windowGlow 2s ease-in-out infinite;
}

.window:nth-child(2) {
  animation-delay: 0.3s;
}

@keyframes windowGlow {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
    box-shadow: 0 0 30px var(--color-yellow);
  }
}

.door-icon {
  font-size: 3rem;
  margin-top: var(--spacing-xs);
  animation: doorFloat 3s ease-in-out infinite;
}

@keyframes doorFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.scroll-hint {
  margin-top: var(--spacing-md);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-yellow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  transition: opacity 0.3s ease;
  cursor: pointer;
  background: none;
  border: none;
}

.scroll-hint::after {
  content: '↓';
  font-size: 1.8rem;
  display: block;
  animation: arrowBounce 1.5s ease-in-out infinite;
  margin-top: var(--spacing-xs);
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
    opacity: 0.9;
  }

  50% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

@keyframes arrowBounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(15px);
  }
}

.instruction {
  font-size: clamp(1.3rem, 2.5vw, 1.8rem);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.hint {
  font-size: 1.1rem;
  color: var(--color-yellow);
  margin-bottom: var(--spacing-md);
  animation: pulse 2s ease-in-out infinite;
  transition: opacity 0.3s ease;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.door-container {
  display: flex;
  justify-content: center;
  margin: var(--spacing-md) 0;
}

.door {
  width: min(280px, 70vw);
  height: min(380px, 55vh);
  max-height: 450px;
  background: linear-gradient(135deg, #4a2c5e 0%, #2d1b4e 100%);
  border-radius: 25px 25px 0 0;
  border: 5px solid var(--color-purple-dark);
  cursor: pointer;
  transition: transform 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
}

.door:hover {
  transform: scale(1.05);
}

.door.knocked {
  animation: doorShake 0.5s ease-in-out;
  animation-delay: 1s;
}

@keyframes doorShake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-10px);
  }

  75% {
    transform: translateX(10px);
  }
}

.door.opened {
  transform: scale(0.95);
  opacity: 0.7;
}

.door-ghost {
  background: linear-gradient(135deg, #4a2c5e 0%, #2d1b4e 100%);
}

.door-home {
  background: linear-gradient(135deg, var(--color-orange-light) 0%, var(--color-orange) 100%);
  border-color: #d45a2a;
}

.door-decoration {
  display: flex;
  gap: var(--spacing-md);
}

.door-decorations-top {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
}

.pumpkin {
  font-size: 3rem;
  animation: swing 3s ease-in-out infinite;
}

@keyframes swing {

  0%,
  100% {
    transform: rotate(-5deg);
  }

  50% {
    transform: rotate(5deg);
  }
}

.door-wreath {
  font-size: 2rem;
  margin-top: var(--spacing-sm);
}

.door-lights {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.light {
  font-size: 1.5rem;
  animation: twinkle 1.5s ease-in-out infinite;
}

.light:nth-child(2) {
  animation-delay: 0.5s;
}

.light:nth-child(3) {
  animation-delay: 1s;
}

@keyframes twinkle {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.door-handle {
  position: absolute;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2.5rem;
}

.result {
  font-size: 1.2rem;
  animation: fadeIn 0.5s ease-in;
  transition: opacity 0.3s ease;
}

.reveal {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  animation: fadeIn 1s ease-in;
  transition: opacity 0.5s ease;
}

.characters {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.characters img {
  max-width: 320px;
}

.reveal-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  color: var(--color-yellow);
  margin-bottom: var(--spacing-xs);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.reveal-subtitle {
  font-size: 1.2rem;
  font-style: italic;
  color: var(--color-pink);
}

/* Reveal Layer */
.scene-reveal-layer {
  background: linear-gradient(180deg, var(--color-purple) 0%, var(--color-pink) 50%, var(--color-orange) 100%);
}

/* Final Layer */
.scene-final-layer {
  background: linear-gradient(180deg, var(--color-orange) 0%, var(--color-pink) 50%, var(--color-purple) 100%);
}

.final-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.final-subtitle {
  font-size: 1.1rem;
  opacity: 0.95;
  margin-bottom: var(--spacing-md);
}

.poster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.poster-card {
  background: rgba(255, 255, 255, 0.95);
  padding: var(--spacing-sm);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.poster-card:hover {
  transform: translateY(-3px);
}

.poster-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-xs);
  animation: iconFloat 3s ease-in-out infinite;
}

.poster-card:nth-child(2) .poster-icon {
  animation-delay: 0.5s;
}

.poster-card:nth-child(3) .poster-icon {
  animation-delay: 1s;
}

@keyframes iconFloat {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.poster-card h3 {
  font-size: 1.1rem;
  color: var(--color-purple);
  margin-bottom: var(--spacing-xs);
}

.poster-card p {
  font-size: 0.9rem;
  color: var(--color-purple);
  opacity: 0.8;
  margin-bottom: var(--spacing-sm);
}

.poster-card .btn {
  width: 100%;
}

/* Mobile Carousel */
.poster-carousel {
  width: 100%;
  max-width: 400px;
  margin: 0;
  padding: 0 var(--spacing-sm);
}

.swiper-container {
  width: 100%;
  padding-bottom: var(--spacing-lg);
}

.poster-carousel .poster-card {
  margin: 0 auto;
  max-width: 320px;
}

/* Swiper pagination customization */
:deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.5);
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background: var(--color-yellow);
}

.final-footer {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 2px solid rgba(255, 255, 255, 0.3);
  animation: fadeIn 1s ease-in;
  transition: opacity 0.5s ease;
}

.final-footer p {
  font-size: 0.95rem;
  margin: var(--spacing-xs) 0;
}

.final-footer a {
  color: var(--color-yellow);
  text-decoration: underline;
}

.final-footer .small {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Confetti Background */
.confetti-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 1;
}

.confetti {
  position: absolute;
  font-size: 1.5rem;
  opacity: 0.4;
  animation: confettiFall 15s linear infinite;
}

.confetti:nth-child(2n) {
  left: 10%;
  animation-delay: -2s;
}

.confetti:nth-child(3n) {
  left: 25%;
  animation-delay: -4s;
}

.confetti:nth-child(4n) {
  left: 40%;
  animation-delay: -6s;
}

.confetti:nth-child(5n) {
  left: 55%;
  animation-delay: -8s;
}

.confetti:nth-child(6n) {
  left: 70%;
  animation-delay: -3s;
}

.confetti:nth-child(7n) {
  left: 85%;
  animation-delay: -5s;
}

@keyframes confettiFall {
  0% {
    top: -10%;
    transform: rotate(0deg);
  }

  100% {
    top: 110%;
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .scene-content {
    padding: var(--spacing-sm);
  }

  .progress-indicator {
    top: 10px;
    right: 10px;
  }

  .progress-bar {
    width: 60px;
  }

  .title {
    font-size: 1.8rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .building {
    padding: var(--spacing-sm);
    max-width: 180px;
  }

  .windows-row {
    gap: var(--spacing-xs);
  }

  .window {
    width: 40px;
    height: 40px;
  }

  .door-icon {
    font-size: 2.5rem;
  }

  .scroll-hint {
    font-size: 0.95rem;
  }

  .scroll-hint::after {
    font-size: 1.5rem;
  }

  .door {
    width: min(240px, 75vw);
    height: min(320px, 50vh);
  }

  .instruction {
    font-size: 1.2rem;
  }

  .hint {
    font-size: 0.95rem;
  }

  .characters {
    gap: var(--spacing-sm);
  }

  .poster-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }

  .poster-icon {
    font-size: 2.5rem;
  }
}

@media (max-height: 700px) {
  .title {
    font-size: 1.6rem;
    margin-bottom: var(--spacing-xs);
  }

  .building-illustration {
    margin: var(--spacing-sm) 0;
  }

  .building {
    padding: var(--spacing-xs);
    max-width: 160px;
  }

  .windows-row {
    gap: 6px;
  }

  .window {
    width: 35px;
    height: 35px;
  }

  .door-icon {
    font-size: 2rem;
  }

  .door {
    height: min(280px, 45vh);
  }
}
</style>
