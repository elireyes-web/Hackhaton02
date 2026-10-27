import type { CSSProperties } from 'react'
import { ApiError } from '../../lib/api'
import type { Palette, StageMetric } from './types'

const numberFormatter = new Intl.NumberFormat('es-PE')

/** "berries" -> "฿ 76,700,000" · "%" -> "74 %" · "/10" -> "3/10" · "mn" -> "335 mn" */
export function formatMetric(metric: StageMetric): string {
  const n = numberFormatter.format(metric.value)
  switch (metric.unit) {
    case 'berries':
      return `฿ ${n}`
    case '%':
      return `${n} %`
    case '/10':
      return `${n}/10`
    default:
      return `${n} ${metric.unit}`
  }
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

/** La paleta de la etapa activa se pasa como variables CSS (y se transiciona con @property). */
export function paletteVars(palette: Palette): CSSProperties {
  return {
    '--saga-bg': palette.background,
    '--saga-surface': palette.surface,
    '--saga-accent': palette.primary,
    '--saga-highlight': palette.accent,
    '--saga-text': palette.text,
    color: palette.text,
  } as CSSProperties
}

/** Nombre de View Transition compartido entre la tarjeta del resumen y la cabecera de la historia. */
export function sagaTransitionName(id: string): string {
  return `saga-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

/** 423 LOG_POSE_REQUIRED: el Grand Line sigue bloqueado hasta aprobar el CP3. */
export function isLogPoseLocked(error: unknown): boolean {
  return error instanceof ApiError && error.status === 423
}

export function errorText(error: unknown): string {
  if (isLogPoseLocked(error)) return 'El Grand Line sigue bloqueado: necesitan el Log Pose (aprobar la inspección del CP3).'
  if (error instanceof Error && error.message) return error.message
  return 'No pudimos conectar con la Guild. Intenta de nuevo.'
}
