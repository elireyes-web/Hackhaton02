import { useCallback } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate, type NavigateOptions, type To } from 'react-router-dom'
import { prefersReducedMotion } from './useReducedMotion'

type StartViewTransition = (update: () => void) => unknown

function getStartViewTransition(): StartViewTransition | null {
  const candidate = (document as unknown as { startViewTransition?: StartViewTransition }).startViewTransition
  return typeof candidate === 'function' ? candidate.bind(document) : null
}

/**
 * View Transition API entre el resumen y la historia.
 * - Con soporte y sin reduced-motion: document.startViewTransition + flushSync.
 * - Sin soporte (o con reduced-motion): navegación normal.
 */
export function useViewTransitionNavigate(): (to: To, options?: NavigateOptions) => void {
  const navigate = useNavigate()
  return useCallback(
    (to: To, options?: NavigateOptions) => {
      const start = getStartViewTransition()
      if (!start || prefersReducedMotion()) {
        navigate(to, options)
        return
      }
      start(() => {
        flushSync(() => navigate(to, options))
      })
    },
    [navigate],
  )
}
