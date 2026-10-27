import type { SagaStage } from './types'

interface Props {
  map: { width: number; height: number }
  stages: SagaStage[]
  activeIndex: number
}

/**
 * Mapa persistente del Grand Line (un solo <svg> que nunca se desmonta).
 * - Las islas salen de la API (island.x / island.y en la escala de map.width x map.height).
 * - La ruta recorrida se dibuja hasta la isla activa con stroke-dashoffset (transición CSS).
 * - El barco se traslada a la isla activa (transición CSS sobre transform).
 */
export function SagaMap({ map, stages, activeIndex }: Props) {
  const islands = stages.map((stage) => stage.island)
  const first = islands[0]
  if (!first) return null

  // Longitud acumulada de la ruta hasta cada isla: así la línea llega exactamente a la isla activa.
  const cumulative = islands.reduce<number[]>((acc, island, i) => {
    const prev = i > 0 ? islands[i - 1] : undefined
    const segment = prev ? Math.hypot(island.x - prev.x, island.y - prev.y) : 0
    acc.push((acc[i - 1] ?? 0) + segment)
    return acc
  }, [])
  const total = cumulative[cumulative.length - 1] ?? 0
  const travelled = cumulative[activeIndex] ?? 0
  const active = islands[activeIndex] ?? first
  const route = islands.map((island) => `${island.x},${island.y}`).join(' ')

  const anchorFor = (x: number) => (x < map.width * 0.15 ? 'start' : x > map.width * 0.85 ? 'end' : 'middle')

  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      role="img"
      aria-label={`Mapa del Grand Line: el barco está en ${active.name}, etapa ${activeIndex + 1} de ${stages.length}`}
      className="h-auto w-full rounded-xl"
      style={{ background: 'var(--saga-surface)' }}
    >
      {/* Ruta completa (punteada) y ruta recorrida (sólida, hasta la isla activa). */}
      <polyline points={route} fill="none" stroke="currentColor" strokeOpacity={0.3} strokeWidth={4} strokeDasharray="10 14" />
      <polyline
        className="saga-route"
        points={route}
        fill="none"
        stroke="var(--saga-accent)"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={total > 0 ? total : undefined}
        strokeDashoffset={total > 0 ? total - travelled : undefined}
      />

      {islands.map((island, i) => {
        const visited = i <= activeIndex
        const isActive = i === activeIndex
        return (
          <g key={island.id}>
            <circle
              cx={island.x}
              cy={island.y}
              r={isActive ? 16 : 11}
              fill={visited ? 'var(--saga-accent)' : 'var(--saga-surface)'}
              stroke="currentColor"
              strokeOpacity={visited ? 1 : 0.5}
              strokeWidth={3}
            />
            <text
              x={island.x}
              y={island.y + 42}
              textAnchor={anchorFor(island.x)}
              fontSize={22}
              fontWeight={isActive ? 700 : 400}
              fill="currentColor"
              fillOpacity={isActive ? 1 : 0.7}
            >
              {island.name}
            </text>
          </g>
        )
      })}

      {/* Barco: figura propia (sin imágenes oficiales). */}
      <g className="saga-ship" style={{ transform: `translate(${active.x}px, ${active.y - 34}px)` }} aria-hidden="true">
        <path d="M-26 4 L26 4 L16 18 L-16 18 Z" fill="var(--saga-highlight)" stroke="currentColor" strokeWidth={2} />
        <line x1={0} y1={4} x2={0} y2={-30} stroke="currentColor" strokeWidth={3} />
        <path d="M2 -28 L2 0 L22 0 Z" fill="currentColor" />
      </g>
    </svg>
  )
}
