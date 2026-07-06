import { useEffect, useMemo, useState, useCallback } from "react"
import { C } from "../../theme"
import { getEnrichedProcessFlow, flowAdoptionSummary } from "../../data/enrichProcessSteps"
import { useMeasuredData } from "../../context/DashboardDataContext"
import { deriveScenarioOutcome, buildDefaultAssumptions, loadSavedAssumptions } from "../../data/processAssumptions"
import { generateProcessRecommendation } from "../../data/generateProcessRecommendation"
import { deptColor } from "../../data/processMapsMeta"
import ProcessHeader from "./ProcessHeader"
import ProcessKpiPanel from "./ProcessKpiPanel"
import ProcessFlowStep, { ProcessFlowOverlay } from "./ProcessFlowStep"
import ProcessWeeklyTrends from "./ProcessWeeklyTrends"
import ProcessAssumptionBuilder from "./ProcessAssumptionBuilder"
import ProcessAiRecommendations from "./ProcessAiRecommendations"
import { FLOW_DISCLAIMER } from "../../data/processFlows"

function initialScenario(map) {
  const saved = loadSavedAssumptions(map.department)
  const assumptions = saved || buildDefaultAssumptions(map)
  return deriveScenarioOutcome(map, assumptions)
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      color: C.subtle,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

export default function ProcessDetail({ map, onClose }) {
  const { DEPT } = useMeasuredData()
  const open = Boolean(map)
  const col = map ? deptColor(map.color) : C.accent
  const dept = map ? DEPT.find((d) => d.d === map.department) : null

  const steps = useMemo(
    () => (map && dept ? getEnrichedProcessFlow(map, dept) : []),
    [map, dept]
  )
  const overlay = useMemo(() => flowAdoptionSummary(steps), [steps])

  const [scenario, setScenario] = useState(() => (map ? initialScenario(map) : null))

  useEffect(() => {
    if (map) setScenario(initialScenario(map))
  }, [map?.department])

  const handleScenarioChange = useCallback((next) => {
    setScenario(next)
  }, [])

  const aiRecommendation = useMemo(
    () => (map && scenario ? generateProcessRecommendation(map, scenario) : null),
    [map, scenario]
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open || !scenario || !aiRecommendation) return null

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: C.overlay,
          backdropFilter: "blur(4px)",
          zIndex: 300,
        }}
      />
      <aside
        role="dialog"
        aria-label={`${map.process_name} details`}
        className="glass-panel-strong"
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          bottom: 16,
          width: "min(720px, calc(100vw - 32px))",
          zIndex: 301,
          borderRadius: 24,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{
          padding: "20px 44px 20px 24px",
          borderBottom: `1px solid ${C.glassBorder}`,
          position: "relative",
          flexShrink: 0,
        }}>
          <ProcessHeader map={map} scenario={scenario} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 36,
              height: 36,
              borderRadius: 12,
              border: `1px solid ${C.glassBorder}`,
              background: C.glassHover,
              color: C.muted,
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 28px" }}>
          <div className="glass-panel" style={{
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 20,
            borderLeft: `3px solid ${C.cyan}`,
            fontSize: 12,
            color: C.textSub,
            lineHeight: 1.6,
          }}>
            {FLOW_DISCLAIMER}
          </div>

          <ProcessKpiPanel map={map} />

          <ProcessWeeklyTrends map={map} />

          <SectionTitle>Simulated process flow</SectionTitle>
          <ProcessFlowOverlay summary={overlay} accent={col} />
          <div style={{ marginBottom: 28 }}>
            {steps.map((step, i) => (
              <ProcessFlowStep
                key={step.step}
                step={step}
                index={i}
                total={steps.length}
                accent={col}
              />
            ))}
          </div>

          <ProcessAssumptionBuilder map={map} onScenarioChange={handleScenarioChange} />

          <ProcessAiRecommendations recommendation={aiRecommendation} />
        </div>
      </aside>
    </>
  )
}
