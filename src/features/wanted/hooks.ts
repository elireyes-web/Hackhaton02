import { useCallback, useEffect, useState } from 'react'
import { fetchCrews, fetchWanted, fetchWantedById } from './api'
import type { Crew, WantedPage, WantedPoster } from './types'

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'No pudimos conectar con la Guild. Intenta de nuevo.'
}

interface Result<T> {
  key: string
  data: T | null
  error: string | null
}

interface Remote<T> {
  data: T | null
  error: string | null
  loading: boolean
  retry: () => void
}

/**
 * Carga un recurso identificado por `key`.
 * - Cancela la request anterior al cambiar `key` (AbortController).
 * - Ignora cualquier respuesta cuya key ya no sea la actual (respuestas antiguas).
 * - Nunca devuelve datos de otra key: si la key cambió, `loading` es true y `data` es null.
 */
function useRemote<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
): Remote<T> {
  const [result, setResult] = useState<Result<T> | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data, error: null })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setResult({ key, data: null, error: errorMessage(error) })
      })
    return () => controller.abort()
    // `load` depende solo de `key`, por eso no se incluye.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const current = result !== null && result.key === key ? result : null
  const retry = useCallback(() => {
    setResult(null)
    setAttempt((n) => n + 1)
  }, [])

  return { data: current?.data ?? null, error: current?.error ?? null, loading: current === null, retry }
}

export function useWantedList(queryString: string): Remote<WantedPage> {
  return useRemote(queryString, (signal) => fetchWanted(queryString, signal))
}

export function useWantedDetail(id: string): Remote<WantedPoster> {
  return useRemote(id, (signal) => fetchWantedById(id, signal))
}

export function useCrews(): Crew[] {
  const [crews, setCrews] = useState<Crew[]>([])
  useEffect(() => {
    const controller = new AbortController()
    fetchCrews(controller.signal)
      .then((list) => {
        if (!controller.signal.aborted) setCrews(list)
      })
      .catch(() => {
        // Si falla, el filtro queda solo con "Todas": el resto de la vista sigue funcionando.
      })
    return () => controller.abort()
  }, [])
  return crews
}
