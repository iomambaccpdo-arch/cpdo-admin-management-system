import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api, { errorMessage } from '../api'
import { FilterIcon } from '../components/Icons'
import { PageHead } from '../components/Shell'
import Shell from '../components/Shell'
import { recordDateLabel } from '../format'

const MONTHS = [
  ['1', 'January'],
  ['2', 'February'],
  ['3', 'March'],
  ['4', 'April'],
  ['5', 'May'],
  ['6', 'June'],
  ['7', 'July'],
  ['8', 'August'],
  ['9', 'September'],
  ['10', 'October'],
  ['11', 'November'],
  ['12', 'December'],
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 12 }, (_, index) => String(currentYear - index))

function queryFor(nextMonth, nextYear, nextPage) {
  const next = {}
  if (nextMonth) next.month = nextMonth
  if (nextYear) next.year = nextYear
  if (nextPage > 1) next.page = String(nextPage)
  return next
}

export default function Documents() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const month = params.get('month') || ''
  const year = params.get('year') || ''
  const page = Math.max(1, Number(params.get('page') || 1) || 1)
  const [dates, setDates] = useState([])
  const [meta, setMeta] = useState({ current_page: page, last_page: 1, per_page: 31, total: 0 })
  const [filterOpen, setFilterOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api.get('/records/history', {
      params: {
        month: month || undefined,
        year: year || undefined,
        page,
      },
    }).then(({ data }) => {
      if (cancelled) return
      const rows = Array.isArray(data?.data) ? data.data : []
      setDates(rows)
      setMeta(data.meta || {
        current_page: page,
        last_page: 1,
        per_page: 31,
        total: rows.length,
      })
      setError('')
    }).catch((err) => {
      if (!cancelled) setError(errorMessage(err, 'Could not load documents.'))
    })
    return () => {
      cancelled = true
    }
  }, [month, year, page])

  function showPage(nextMonth, nextYear, nextPage) {
    setParams(queryFor(nextMonth, nextYear, nextPage))
  }

  const rangeStart = meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1
  const rangeEnd = Math.min(meta.current_page * meta.per_page, meta.total)
  const filtered = Boolean(month || year)

  return (
    <Shell>
      <PageHead title="Documents" />
      <div className="toolbar">
        <div className="toolbar-right">
          <div className="pop-wrap">
            <button
              className="btn-filter"
              type="button"
              onClick={() => setFilterOpen((open) => !open)}
            >
              <FilterIcon /> Filter
            </button>
            {filterOpen ? (
              <div className="popover">
                <label>
                  Month
                  <select
                    value={month}
                    onChange={(event) => showPage(event.target.value, year, 1)}
                  >
                    <option value="">All</option>
                    {MONTHS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Year
                  <select
                    value={year}
                    onChange={(event) => showPage(month, event.target.value, 1)}
                  >
                    <option value="">All</option>
                    {YEARS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <section className="block">
        {dates.length === 0 ? (
          <p className="empty-copy">
            {filtered ? 'No recorded documents for this month and year.' : 'No documents recorded yet.'}
          </p>
        ) : (
          <div className="date-grid">
            {dates.map((item) => (
              <button
                key={item.date}
                type="button"
                className="date-card"
                onClick={() => navigate(`/records/${item.date}`, { state: { from: `/documents${window.location.search}` } })}
              >
                <span>
                  {recordDateLabel(item.date)}
                  <small className="date-count">
                    {item.total === 1 ? '1 record' : `${item.total} records`}
                  </small>
                </span>
                <span className="date-thumb" />
              </button>
            ))}
          </div>
        )}
      </section>

      {meta.last_page > 1 ? (
        <div className="doc-pager">
          <button
            className="btn-light"
            type="button"
            disabled={meta.current_page <= 1}
            onClick={() => showPage(month, year, meta.current_page - 1)}
          >
            Previous
          </button>
          <span>{`${rangeStart}–${rangeEnd} of ${meta.total}`}</span>
          <button
            className="btn-light"
            type="button"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => showPage(month, year, meta.current_page + 1)}
          >
            Next
          </button>
        </div>
      ) : null}
    </Shell>
  )
}
