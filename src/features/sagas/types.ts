/** Paleta de colores de una saga o de una etapa (hex). */
export interface Palette {
  background: string
  surface: string
  primary: string
  accent: string
  text: string
}

/** Un elemento de GET /sagas. */
export interface SagaSummary {
  id: string
  order: number
  title: string
  subtitle: string
  synopsis: string
  stageCount: number
  totalDistanceNm: number
  firstIsland: string
  lastIsland: string
  palette: Palette
}

export interface Island {
  id: string
  name: string
  /** Posición en el mapa, en la escala de map.width x map.height. */
  x: number
  y: number
}

export interface StageMetric {
  key: string
  label: string
  value: number
  unit: string
}

export interface SagaStage {
  id: string
  order: number
  slug: string
  title: string
  narrative: string[]
  island: Island
  palette: Palette
  metrics: StageMetric[]
}

/** Respuesta de GET /sagas/{id}/story. */
export interface SagaStory {
  saga: SagaSummary & { intro: string }
  map: { width: number; height: number }
  stages: SagaStage[]
}
