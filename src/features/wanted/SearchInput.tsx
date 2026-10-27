import { useEffect, useState } from 'react'

const DEBOUNCE_MS = 400

interface Props {
  /** Valor actual en la URL. */
  value: string
  onCommit: (value: string) => void
}

/**
 * Campo de búsqueda con debounce: el usuario escribe libremente y a la URL
 * (y por tanto al backend) solo llega el valor cuando deja de teclear.
 */
export function SearchInput({ value, onCommit }: Props) {
  const [text, setText] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)

  // Si la URL cambia por fuera (atrás/adelante, limpiar filtros), el campo la sigue.
  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(value)
  }

  useEffect(() => {
    const next = text.trim()
    if (next === value) return
    const timer = window.setTimeout(() => {
      setSyncedValue(next)
      onCommit(next)
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [text, value, onCommit])

  return (
    <input
      type="search"
      value={text}
      maxLength={100}
      onChange={(e) => setText(e.target.value)}
      placeholder="Nombre o epíteto"
      aria-label="Buscar por nombre o epíteto"
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-700"
    />
  )
}
