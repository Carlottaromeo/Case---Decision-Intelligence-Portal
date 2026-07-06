import { SOURCE_FILES } from "../../data/sourceFilesMeta"
import { Card, SH } from "../UI"

export default function UpdateLogPanel({ log, formatTime }) {
  return (
    <Card>
      <SH title="Update log" sub="All edits, uploads and AI changes in this session" />
      {!log.length ? (
        <p className="dq-log-empty">No changes yet.</p>
      ) : (
        <ul className="dq-log-list">
          {log.map((entry) => {
            const fileLabel = entry.fileId === "both"
              ? "Both files"
              : SOURCE_FILES[entry.fileId]?.label ?? entry.fileId
            return (
              <li key={entry.id ?? entry.timestamp} className="dq-log-item">
                <div className="dq-log-item__time">{formatTime(entry.timestamp)}</div>
                <div className="dq-log-item__file">{fileLabel}</div>
                <div className="dq-log-item__summary">{entry.summary}</div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
