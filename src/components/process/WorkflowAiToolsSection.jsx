import { useState } from "react"
import { CHART } from "../../theme"
import { IconSparkles } from "./ProcessIcons"
import {
  PREDEFINED_AI_TOOLS,
  buildAiToolsPatch,
  normalizeAiTools,
} from "../../utils/workflowAiTools"

function toolColor(label) {
  return CHART.tools[label] ?? "#6229FF"
}

export default function WorkflowAiToolsSection({ card, onUpdate }) {
  const [customDraft, setCustomDraft] = useState("")
  const tools = normalizeAiTools(card.aiTools)
  const isActive = tools.length > 0

  const applyTools = (nextTools) => {
    onUpdate(buildAiToolsPatch(nextTools, card))
  }

  const togglePredefined = (label) => {
    const key = label.toLowerCase()
    const has = tools.some((t) => t.toLowerCase() === key)
    applyTools(has ? tools.filter((t) => t.toLowerCase() !== key) : [...tools, label])
  }

  const removeTool = (label) => {
    const key = label.toLowerCase()
    applyTools(tools.filter((t) => t.toLowerCase() !== key))
  }

  const addCustom = (e) => {
    e.preventDefault()
    const trimmed = customDraft.trim()
    if (!trimmed) return
    const exists = tools.some((t) => t.toLowerCase() === trimmed.toLowerCase())
    if (exists) {
      setCustomDraft("")
      return
    }
    applyTools([...tools, trimmed])
    setCustomDraft("")
  }

  const customTools = tools.filter(
    (t) => !PREDEFINED_AI_TOOLS.some((p) => p.toLowerCase() === t.toLowerCase())
  )

  return (
    <section className="wf-ai-tools">
      <div className="wf-ai-tools__head">
        <h3 className="wf-ai-tools__title">
          <IconSparkles size={14} color="#30a46c" />
          Add AI tool
        </h3>
        <span className={`wf-ai-tools__status wf-ai-tools__status--${isActive ? "active" : "opportunity"}`}>
          {isActive ? "AI in use" : "Opportunity"}
        </span>
      </div>

      <p className="wf-ai-tools__desc">
        Select tools already in use on this step, or add a custom one.
        {isActive
          ? " The activity card is shown in green."
          : " With no tools selected, the card stays in the opportunity lane."}
      </p>

      <div className="wf-ai-tools__presets">
        {PREDEFINED_AI_TOOLS.map((label) => {
          const selected = tools.some((t) => t.toLowerCase() === label.toLowerCase())
          const color = toolColor(label)
          return (
            <button
              key={label}
              type="button"
              className={`wf-ai-tools__preset${selected ? " wf-ai-tools__preset--selected" : ""}`}
              style={{
                "--tool-color": color,
                borderColor: selected ? color : undefined,
                background: selected ? `${color}18` : undefined,
                color: selected ? color : undefined,
              }}
              onClick={() => togglePredefined(label)}
              aria-pressed={selected}
            >
              {label}
            </button>
          )
        })}
      </div>

      {customTools.length > 0 && (
        <ul className="wf-ai-tools__custom-list">
          {customTools.map((label) => (
            <li key={label} className="wf-ai-tools__custom-chip">
              <span>{label}</span>
              <button type="button" onClick={() => removeTool(label)} aria-label={`Remove ${label}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="wf-ai-tools__add-form" onSubmit={addCustom}>
        <input
          type="text"
          value={customDraft}
          onChange={(e) => setCustomDraft(e.target.value)}
          placeholder="Add a new AI tool…"
          aria-label="Custom AI tool name"
        />
        <button
          type="submit"
          className="wf-builder__btn wf-builder__btn--ghost"
          disabled={!customDraft.trim()}
        >
          Add tool
        </button>
      </form>
    </section>
  )
}
