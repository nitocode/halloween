import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable pour gérer la progression du scroll virtuel
 * Style Apple : l'utilisateur scroll mais reste sur place
 */
export function useScrollProgress() {
  // Hauteur totale virtuelle pour le scroll (multiplié par le viewport)
  const SCROLL_MULTIPLIER = 5 // 5x la hauteur de l'écran
  
  // Position actuelle du scroll (0-100%)
  const scrollProgress = ref(0)
  
  // Position brute du scroll en pixels
  const scrollY = ref(0)
  
  // Hauteur totale scrollable
  const totalScrollHeight = ref(0)
  
  // Calculer la progression (0-1)
  const progress = computed(() => scrollProgress.value / 100)
  
  /**
   * Calculer l'opacité d'un élément basé sur une plage de scroll
   * @param start - Début de l'apparition (0-100)
   * @param peak - Pic d'opacité (0-100)
   * @param end - Fin de disparition (0-100)
   */
  const getOpacity = (start: number, peak: number, end: number): number => {
    const current = scrollProgress.value
    
    if (current < start) {
      return 0
    } else if (current >= start && current <= peak) {
      // Fade in
      return (current - start) / (peak - start)
    } else if (current > peak && current <= end) {
      // Fade out
      return 1 - (current - peak) / (end - peak)
    } else {
      return 0
    }
  }
  
  /**
   * Vérifier si un élément est visible
   */
  const isVisible = (start: number, end: number): boolean => {
    const current = scrollProgress.value
    return current >= start && current <= end
  }
  
  /**
   * Obtenir le scale d'un élément
   */
  const getScale = (start: number, end: number, minScale = 0.8, maxScale = 1): number => {
    const current = scrollProgress.value
    
    if (current < start) {
      return minScale
    } else if (current >= start && current <= end) {
      const progress = (current - start) / (end - start)
      return minScale + (maxScale - minScale) * progress
    } else {
      return maxScale
    }
  }
  
  /**
   * Obtenir la translation Y d'un élément
   */
  const getTranslateY = (start: number, end: number, startY = 50, endY = 0): number => {
    const current = scrollProgress.value
    
    if (current < start) {
      return startY
    } else if (current >= start && current <= end) {
      const progress = (current - start) / (end - start)
      return startY + (endY - startY) * progress
    } else {
      return endY
    }
  }
  
  // Handler du scroll
  const handleScroll = () => {
    scrollY.value = window.scrollY
    const maxScroll = totalScrollHeight.value - window.innerHeight
    scrollProgress.value = (scrollY.value / maxScroll) * 100
    
    // Limiter entre 0 et 100
    scrollProgress.value = Math.max(0, Math.min(100, scrollProgress.value))
  }
  
  // Calculer la hauteur totale nécessaire
  const calculateScrollHeight = () => {
    totalScrollHeight.value = window.innerHeight * SCROLL_MULTIPLIER
  }
  
  onMounted(() => {
    calculateScrollHeight()
    handleScroll() // Init
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', calculateScrollHeight)
  })
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', calculateScrollHeight)
  })
  
  return {
    scrollProgress,
    progress,
    scrollY,
    totalScrollHeight,
    getOpacity,
    isVisible,
    getScale,
    getTranslateY
  }
}
