import { ref } from 'vue'

interface Sound {
  audio: HTMLAudioElement | null
  play: () => Promise<void>
  stop: () => void
  setVolume: (volume: number) => void
}

export function useSound(src: string): Sound {
  const audio = ref<HTMLAudioElement | null>(null)

  // Initialiser l'audio
  if (typeof window !== 'undefined') {
    audio.value = new Audio(src)
    audio.value.volume = 0.5 // Volume par défaut à 50%
  }

  const play = async (): Promise<void> => {
    if (!audio.value) return
    
    try {
      audio.value.currentTime = 0
      await audio.value.play()
    } catch (error) {
      console.warn('Erreur lors de la lecture du son:', error)
    }
  }

  const stop = (): void => {
    if (!audio.value) return
    audio.value.pause()
    audio.value.currentTime = 0
  }

  const setVolume = (volume: number): void => {
    if (!audio.value) return
    audio.value.volume = Math.max(0, Math.min(1, volume))
  }

  return {
    audio: audio.value,
    play,
    stop,
    setVolume
  }
}
