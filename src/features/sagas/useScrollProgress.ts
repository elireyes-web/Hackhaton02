import { useEffect, useState, type RefObject } from 'react'

/**
 * Progreso del recorrido (0..1) dentro del contenedor de la historia.
 * Es el fallback de la barra cuando no hay CSS Scroll-driven Animations
 * y también alimenta el texto "Recorrido NN%".
 */
export function useScrollProgress(trackRef: RefObject<HTMLElement | null>, enabled: boolean): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let frame = 0
    const measure = () => {
      frame = 0
      const node = trackRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      const scrollable = rect.height - window.innerHeight
      const value = scrollable > 0 ? -rect.top / scrollable : 1
      setProgress(Math.min(1, Math.max(0, value)))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [trackRef, enabled])

  return progress
}
