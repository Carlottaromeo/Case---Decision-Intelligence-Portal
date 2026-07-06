import { useState, useEffect, useRef, useMemo } from "react"
import { formatEmployeeOwner } from "../../utils/workflowOwnerOptions"
import {
  employeeDisplayName,
  filterEmployeesForSearch,
  getEmployeeInitials,
} from "../../utils/workflowOwnerSearch"

export default function OwnerSearchField({
  employees = [],
  selectedEmployeeId,
  ownerLabel,
  department,
  onSelect,
  onClear,
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef(null)

  const selected = useMemo(
    () => employees.find((e) => e.employee_id === selectedEmployeeId) ?? null,
    [employees, selectedEmployeeId]
  )

  const results = useMemo(
    () => filterEmployeesForSearch(employees, query),
    [employees, query]
  )

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setQuery(selected ? employeeDisplayName(selected) : "")
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open, selected])

  useEffect(() => {
    setHighlight(0)
  }, [query])

  const displayValue = open
    ? query
    : (selected ? employeeDisplayName(selected) : (ownerLabel || ""))

  const pick = (emp) => {
    onSelect(emp)
    setQuery(employeeDisplayName(emp))
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true)
      return
    }
    if (!open || !results.length) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      pick(results[highlight])
    } else if (e.key === "Escape") {
      setOpen(false)
      setQuery(selected ? employeeDisplayName(selected) : "")
    }
  }

  return (
    <div className="wf-owner-search" ref={wrapRef}>
      <label className="wf-field">
        <span>Assignment</span>
        <div className="wf-owner-search__input-wrap">
          {selected && !open && (
            <span className="wf-owner-search__avatar">{getEmployeeInitials(selected)}</span>
          )}
          <input
            type="text"
            className="wf-owner-search__input"
            value={displayValue}
            placeholder={department ? `Search by initials or name (${department})…` : "Search by initials or name…"}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => {
              setOpen(true)
              setQuery(selected ? "" : query)
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          {(selected || ownerLabel) && (
            <button
              type="button"
              className="wf-owner-search__clear"
              onClick={() => {
                onClear?.()
                setQuery("")
                setOpen(false)
              }}
              aria-label="Clear assignment"
            >
              ×
            </button>
          )}
        </div>
      </label>

      <p className="wf-owner-search__hint">
        Type initials (e.g. <kbd>HD</kbd>) or a name to select a person.
      </p>

      {open && query.trim() && (
        <ul className="wf-owner-search__results" role="listbox">
          {results.length === 0 ? (
            <li className="wf-owner-search__empty">No people found</li>
          ) : (
            results.map((emp, idx) => (
              <li key={emp.employee_id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={idx === highlight}
                  className={`wf-owner-search__option${idx === highlight ? " wf-owner-search__option--active" : ""}${selectedEmployeeId === emp.employee_id ? " wf-owner-search__option--selected" : ""}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => pick(emp)}
                >
                  <span className="wf-owner-search__option-avatar">{getEmployeeInitials(emp)}</span>
                  <span className="wf-owner-search__option-body">
                    <span className="wf-owner-search__option-name">
                      {employeeDisplayName(emp)}
                    </span>
                    <span className="wf-owner-search__option-meta">
                      {formatEmployeeOwner(emp)}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
