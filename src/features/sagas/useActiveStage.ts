import { useCallback, useEffect, useRef, useState } from 'react'

/** Fracción del alto de la pantalla donde se "activa" una etapa (debe coincidir con rootMargin).
 *  65% (y no 50%) para que en celular quede DEBAJO del mapa fijo. */
export const ACTIVATION_LINE = 0.65

/**
 * Etapa activa según el scroll: la que cruza una línea al 65% del alto de la pantalla.
 * Funciona igual en desktop y mobile porque solo mira la posición vertical.
 */
export function useActiveStage(count: number, initialIndex: number) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const nodesRef = useRef<(HTMLElement | null)[]>([])

  const registerStage = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      nodesRef.current[index] = node
    },
    [],
  )

  useEffect(() => {
    if (count === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = Number((entry.target as HTMLElement).dataset.index)
          if (Number.isInteger(index)) setActiveIndex(index)
        }
      },
      { rootMargin: '-64% 0px -34% 0px', threshold: 0 },
    )
    nodesRef.current.slice(0, count).forEach((node) => {
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [count])

  /** Lleva la etapa a la línea de activación (instantáneo con reduced-motion). */
  const scrollToStage = useCallback((index: number, smooth: boolean) => {
    const node = nodesRef.current[index]
    if (!node) return
    const rect = node.getBoundingClientRect()
    const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight * ACTIVATION_LINE
    window.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' })
    setActiveIndex(index)
  }, [])

  return { activeIndex, registerStage, scrollToStage, nodesRef }
}
