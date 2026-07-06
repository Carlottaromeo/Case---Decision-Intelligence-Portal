import { useMemo, useState } from "react"
import { C } from "../theme"
import { SH, Callout } from "./UI"
import {
  MANAGEMENT_QUESTIONS,
  loadManagementContext,
  answerManagementQuestion,
} from "../data/managementQuestions"
import ManagementAnswerPanel from "./management/ManagementAnswerPanel"

export default function ManagementQuestions() {
  const [selectedId, setSelectedId] = useState(MANAGEMENT_QUESTIONS[0].id)

  const ctx = useMemo(() => loadManagementContext(), [])
  const selected = MANAGEMENT_QUESTIONS.find((q) => q.id === selectedId)
  const answer = useMemo(
    () => answerManagementQuestion(selectedId, ctx),
    [selectedId, ctx]
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Callout color={C.cyan}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65 }}>
          Strategic questions this MVP can help answer. Each response separates Measured evidence, Simulated interpretation, and Future-ready context.
          Answers respect filters shared with AI Opportunity Process Maps, Investment Planner, and Action Plan Tracker.
        </p>
      </Callout>

      <div className="glass-panel" style={{ borderRadius: 20, padding: "20px 24px" }}>
        <SH
          title="Management Questions"
          sub="Concise answers from existing dashboard data — no new metrics"
        />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}>
          {MANAGEMENT_QUESTIONS.map((q) => {
            const active = q.id === selectedId
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedId(q.id)}
                className="glass-panel"
                style={{
                  textAlign: "left",
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: active ? `1px solid ${C.accent}88` : `1px solid ${C.glassBorder}`,
                  background: active ? C.accentDim : undefined,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? C.accent : C.text, lineHeight: 1.4, marginBottom: 6 }}>
                  {q.title}
                </div>
                <div style={{ fontSize: 11, color: C.muted }}>{q.hint}</div>
              </button>
            )
          })}
        </div>

        <ManagementAnswerPanel question={selected} answer={answer} />
      </div>
    </div>
  )
}
