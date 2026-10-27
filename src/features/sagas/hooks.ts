import { useCallback, useEffect, useState } from 'react'
import { fetchSagas, fetchSagaStory } from './api'
import type { SagaStory, SagaSummary } from './types'

interface Result<T> {
  key: string
  data: T | null
  error: unknown
}

export interface Remote<T> {
  data: T | null
  /** null = sin error. Es el error original para poder distinguir el 423 (sin Log Pose). */
  error: unknown
  loading: boolean
  retry: () => void
}

/**
 * Carga un recurso identificado por `key`:
 * - cancela la request anterior al cambiar `key` (AbortController en el cleanup),
 * - ignora respuestas de una key que ya no es la actual.
 */
function useRemote<T>(key: string, load: (signal: AbortSignal) => Promise<T>): Remote<T> {
  const [result, setResult] = useState<Result<T> | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data, error: null })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, data: null, error })
      })
    return () => controller.abort()
    // `load` depende solo de `key`.
  }, [key, attempt])

  const current = result !== null && result.key === key ? result : null
  const retry = useCallback(() => {
    setResult(null)
    setAttempt((n) => n + 1)
  }, [])

  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null, retry }
}

export function useSagas(): Remote<SagaSummary[]> {
  return useRemote('sagas', (signal) => fetchSagas(signal))
}

export function useSagaStory(id: string): Remote<SagaStory> {
  return useRemote(`story:${id}`, (signal) => fetchSagaStory(id, signal))
}
