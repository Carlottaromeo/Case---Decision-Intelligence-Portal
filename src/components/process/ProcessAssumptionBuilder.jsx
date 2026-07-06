import { useEffect, useMemo, useState } from "react"
import { C } from "../../theme"
import {
  TIME_SAVING_OPTIONS,
  TIMEFRAME_OPTIONS,
  INVESTMENT_TYPES,
  LEVEL_OPTIONS,
  buildDefaultAssumptions,
  loadSavedAssumptions,
  saveAssumptions,
  clearSavedAssumptions,
  deriveScenarioOutcome,
} from "../../data/processAssumptions"
import { ACTION_COLORS } from "../../data/processMapsMeta"
import { tierSectionNote } from "../../data/dashboardCopy"

const inputStyle = {
  padding: "8px 12px",
  borderRadius: 12,
  border: `1px solid ${C.glassBorder}`,
  background: C.inputBg,
  color: C.text,
  fontSize: 12,
  fontWeight: 500,
  width: "100%",
  boxSizing: "border-box",
}

const readOnlyStyle = {
  ...inputStyle,
  color: C.muted,
  cursor: "default",
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, flex: "1 1 200px", minWidth: 160 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function Select({ value, onChange, options, disabled }) {
  return (
    <select
      style={disabled ? readOnlyStyle : inputStyle}
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  )
}

export default function ProcessAssumptionBuilder({ map, onScenarioChange }) {
  const defaults = useMemo(() => buildDefaultAssumptions(map), [map])
  const [draft, setDraft] = useState(defaults)
  const [savedSnapshot, setSavedSnapshot] = useState(null)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const stored = loadSavedAssumptions(map.department)
    const initial = stored || defaults
    setDraft(initial)
    setSavedSnapshot(stored ? JSON.stringify(stored) : null)
    setStatus(null)
  }, [map.department, defaults])

  const scenario = useMemo(() => deriveScenarioOutcome(map, draft), [map, draft])

  useEffect(() => {
    onScenarioChange?.(scenario)
  }, [scenario, onScenarioChange])

  const isDirty = savedSnapshot !== null
    ? JSON.stringify(draft) !== savedSnapshot
    : JSON.stringify(draft) !== JSON.stringify(defaults)

  function update(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setStatus(null)
  }

  function handleSave() {
    saveAssumptions(map.department, draft)
    setSavedSnapshot(JSON.stringify(draft))
    setStatus("saved")
  }

  function handleReset() {
    clearSavedAssumptions(map.department)
    setDraft(defaults)
    setSavedSnapshot(null)
    setStatus("reset")
  }

  const actionColor = ACTION_COLORS[scenario.management_action] || C.muted

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
        Assumption Builder
      </div>

      <div className="glass-panel" style={{ borderRadius: 16, padding: "16px 18px" }}>
        <p style={{
          margin: "0 0 16px",
          fontSize: 12,
          color: C.textSub,
          lineHeight: 1.6,
          borderLeft: `3px solid ${C.cyan}`,
          paddingLeft: 12,
        }}>
          {tierSectionNote("simulated")} These assumptions are editable and used to simulate future AI adoption and investment scenarios. They do not reflect measured process performance or ROI.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
          <Field label="Related department">
            <input style={readOnlyStyle} value={draft.department} readOnly />
          </Field>
          <Field label="Representative process">
            <input style={readOnlyStyle} value={draft.process_name} readOnly />
          </Field>
          <Field label="AI potential">
            <Select
              value={draft.ai_potential}
              onChange={(e) => update("ai_potential", e.target.value)}
              options={LEVEL_OPTIONS}
            />
          </Field>
          <Field label="Expected time saving range">
            <Select
              value={draft.time_saving_range}
              onChange={(e) => update("time_saving_range", e.target.value)}
              options={TIME_SAVING_OPTIONS}
            />
          </Field>
          <Field label="Adoption target (%)">
            <input
              style={inputStyle}
              type="number"
              min={0}
              max={100}
              step={5}
              value={draft.adoption_target}
              onChange={(e) => update("adoption_target", Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
            />
          </Field>
          <Field label="Target timeframe">
            <Select
              value={draft.target_timeframe}
              onChange={(e) => update("target_timeframe", e.target.value)}
              options={TIMEFRAME_OPTIONS}
            />
          </Field>
          <Field label="Investment type">
            <Select
              value={draft.investment_type}
              onChange={(e) => update("investment_type", e.target.value)}
              options={INVESTMENT_TYPES}
            />
          </Field>
          <Field label="Confidence level">
            <Select
              value={draft.confidence_level}
              onChange={(e) => update("confidence_level", e.target.value)}
              options={LEVEL_OPTIONS}
            />
          </Field>
        </div>

        <Field label="Notes">
          <textarea
            style={{ ...inputStyle, minHeight: 72, resize: "vertical", fontFamily: "inherit" }}
            value={draft.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Optional context, constraints, or stakeholder inputs…"
          />
        </Field>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 16,
          paddingTop: 16,
          borderTop: `1px solid ${C.glassBorder}`,
        }}>
          <div style={{ fontSize: 12, color: C.muted }}>
            Simulated priority:{" "}
            <span style={{ fontWeight: 700, color: actionColor }}>{scenario.management_action}</span>
            {isDirty && <span style={{ marginLeft: 8, color: C.amber }}>· unsaved changes</span>}
            {status === "saved" && <span style={{ marginLeft: 8, color: C.accent }}>· saved</span>}
            {status === "reset" && <span style={{ marginLeft: 8, color: C.muted }}>· reset to defaults</span>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                border: `1px solid ${C.glassBorder}`,
                background: C.surface2,
                color: C.muted,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty}
              style={{
                padding: "8px 14px",
                borderRadius: 12,
                border: `1px solid ${isDirty ? C.accent : C.glassBorder}`,
                background: isDirty ? C.accentDim : C.surface2,
                color: isDirty ? C.accent : C.subtle,
                fontSize: 12,
                fontWeight: 600,
                cursor: isDirty ? "pointer" : "default",
                opacity: isDirty ? 1 : 0.6,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
