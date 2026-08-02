import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  totalCount: number
  pageSize: number
  onGoToPage: (p: number) => void
}

function getPageNumbers(page: number, totalPages: number): (number | string)[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
  if (page <= 3) return [1, 2, 3, 4, '...', totalPages]
  if (page >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, '...', page - 1, page, page + 1, '...', totalPages]
}

export default function BillsPagination({ page, totalPages, totalCount, pageSize, onGoToPage }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-slate-500">
        Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)} of {totalCount}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onGoToPage(page - 1)}
          disabled={page === 1}
          className="btn btn-sm w-8 h-8 p-0 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={i} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">...</span>
          ) : (
            <button
              key={i}
              onClick={() => onGoToPage(p as number)}
              className={`btn btn-sm w-8 h-8 p-0 justify-center ${page === p ? 'btn-primary' : ''}`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onGoToPage(page + 1)}
          disabled={page === totalPages}
          className="btn btn-sm w-8 h-8 p-0 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
