import { useState } from "react"
import { C } from "../../theme"

export default function SourceFileTable({ headers, rows, rowOffset, onEdit }) {
  const [editing, setEditing] = useState(null)

  if (!headers.length) {
    return <p style={{ color: C.muted, fontSize: 13 }}>No data to display.</p>
  }

  return (
    <div className="dq-table-wrap">
      <table className="dq-table">
        <thead>
          <tr>
            <th className="dq-table__row-num">#</th>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const absIndex = rowOffset + i
            return (
              <tr key={absIndex}>
                <td className="dq-table__row-num">{absIndex + 1}</td>
                {headers.map((h) => {
                  const key = `${absIndex}-${h}`
                  const isEditing = editing === key
                  const val = row[h] ?? ""
                  const display = String(val).length > 80 ? `${String(val).slice(0, 77)}…` : val
                  return (
                    <td
                      key={h}
                      className={isEditing ? "dq-table__cell--editing" : "dq-table__cell"}
                      onClick={() => setEditing(key)}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          className="dq-table__input"
                          defaultValue={val}
                          onBlur={(e) => {
                            setEditing(null)
                            if (e.target.value !== String(val)) {
                              onEdit(absIndex, h, e.target.value)
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") e.target.blur()
                            if (e.key === "Escape") setEditing(null)
                          }}
                        />
                      ) : (
                        display
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
