import { STATUS_OPTIONS } from './constants'
import type { WantedPoster } from './types'

const bountyFormatter = new Intl.NumberFormat('es-PE')
const dateFormatter = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

export function formatBounty(value: number): string {
  return `฿ ${bountyFormatter.format(value)}`
}

export function statusLabel(value: string): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function crewNameOf(poster: WantedPoster): string | null {
  return poster.crew?.name ?? null
}

/** "FIRST_MATE" -> "First mate" */
export function humanize(value: string): string {
  const text = value.replace(/_/g, ' ').toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date)
}
