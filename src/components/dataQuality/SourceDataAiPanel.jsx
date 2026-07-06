import { useState } from "react"
import { getAiSuggestions } from "../../data/sourceDataAi"
import { Card, SH } from "../UI"
import { DATA_TIERS } from "../../data/dashboardCopy"

export default function SourceDataAiPanel({ onRun, message, loading }) {
  const [prompt, setPrompt] = useState("")
  const suggestions = getAiSuggestions()

  return (
    <Card>
      <SH
        title="AI data assistant"
        sub={`${DATA_TIERS.measured.label} edits — describe a change or pick a suggestion`}
      />
      <div className="dq-ai-suggestions">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            className="dq-ai-chip"
            onClick={() => setPrompt(s.label)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <textarea
        className="dq-ai-input"
        rows={3}
        placeholder="e.g. Fix department typos and list unmapped users…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        type="button"
        className="dq-ai-submit"
        disabled={loading || !prompt.trim()}
        onClick={() => onRun(prompt)}
      >
        {loading ? "Applying…" : "Apply with AI"}
      </button>
      {message && (
        <div className="dq-ai-result" role="status">
          {message}
        </div>
      )}
    </Card>
  )
}
