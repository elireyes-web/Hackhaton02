interface Props {
  page: number
  totalPages: number
  loading: boolean
  onChange: (page: number) => void
}

const btn =
  'h-10 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-700'

export function Pagination({ page, totalPages, loading, onChange }: Props) {
  const lastPage = Math.max(totalPages - 1, 0)
  const disabled = loading || totalPages === 0

  return (
    <nav aria-label="Paginación" className="flex h-10 items-center justify-between gap-2">
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={disabled || page <= 0} onClick={() => onChange(0)}>
          Primera
        </button>
        <button type="button" className={btn} disabled={disabled || page <= 0} onClick={() => onChange(page - 1)}>
          Anterior
        </button>
      </div>
      <p className="text-sm text-slate-600" aria-live="polite">
        {totalPages === 0 ? 'Página 0 de 0' : `Página ${page + 1} de ${totalPages}`}
      </p>
      <div className="flex gap-2">
        <button type="button" className={btn} disabled={disabled || page >= lastPage} onClick={() => onChange(page + 1)}>
          Siguiente
        </button>
        <button type="button" className={btn} disabled={disabled || page >= lastPage} onClick={() => onChange(lastPage)}>
          Última
        </button>
      </div>
    </nav>
  )
}
