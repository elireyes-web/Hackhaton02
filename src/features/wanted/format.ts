import { STATUS_OPTIONS } from './constants'
import type { WantedPoster } from './types'

const bountyFormatter = new Intl.NumberFormat('es-PE')

export function formatBounty(value: unknown): string {
  return typeof value === 'number' ? `฿ ${bountyFormatter.format(value)}` : 'Sin recompensa'
}

export function statusLabel(value: string | null | undefined): string {
  if (!value) return 'Sin estado'
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function crewNameOf(poster: WantedPoster): string | null {
  if (typeof poster.crewName === 'string') return poster.crewName
  const crew = poster.crew
  if (typeof crew === 'object' && crew !== null && 'name' in crew && typeof crew.name === 'string') {
    return crew.name
  }
  return null
}

export function humanizeKey(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
