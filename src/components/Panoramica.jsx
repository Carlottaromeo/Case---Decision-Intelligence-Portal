import { useState } from "react"
import {
  ResponsiveContainer, ComposedChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts"
import { useMeasuredData } from "../context/DashboardDataContext"
import { C, CHART, LOCALE } from "../theme"
import { Card, SH, ChartTooltip, PillToggle, ExecutiveInsight } from "./UI"
import CardActionBar from "./CardActionBar"
import { ACTION_BAR_OFFSET } from "./cardActions"
import { UnmappedProvisionedHint } from "./AttentionPoint"
import GeminiEstimatedCosts from "./GeminiEstimatedCosts"

export default function Panoramica({ onOpenInsights, onNavigate }) {
  const { WEEKLY, DEPT, KPIs, TOOL_DATA, TOOL_TIER_CREDITS, DEPT_TOOL_TIER_CREDITS } = useMeasuredData()
  const [metric, setMetric] = useState("credits")

  const metricCfg = {
    credits:  { label: "Credits used", color: CHART.primary },
    sessions: { label: "Sessions", color: CHART.secondary },
  }

  const sortedDept = [...DEPT].sort((a, b) => a.prov_rate - b.prov_rate)
  const outsidePct = (100 - KPIs.provisioning_rate).toFixed(1)
  const toolChartData = TOOL_DATA.map((t, i) => ({
    name: t.tool,
    value: t.credits,
    fill: CHART.fills[i % CHART.fills.length],
  }))
  const weakestDept = sortedDept[0]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ExecutiveInsight
        see={`${KPIs.provisioning_rate}% of employees have AI access. Usage grew ${KPIs.growth_pct}% over 13 weeks among provisioned users.`}
        matter={`Adoption is improving inside the rollout, but ${outsidePct}% of the workforce is still outside it — the main constraint is coverage, not engagement.`}
        action={`Prioritise expanding access in departments with the lowest provisioning rates, starting with ${weakestDept?.d ?? "under-served areas"}.`}
      />

      <div className="glass-panel" style={{ position: "relative", padding: "20px 24px" }}>
        <CardActionBar
          info={{
            title: "Metric definitions",
            items: [
              "Outside rollout: employees with no AI usage recorded.",
              "Provisioned: employees with AI access.",
              "Credits consumed: total over 13 weeks.",
            ],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["gap-is-access-not-motivation"],
            title: "Rollout coverage",
            subtitle: "Headline metrics",
          }) : null}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, paddingRight: ACTION_BAR_OFFSET }}>
          <div>
            <div style={{ fontSize: 10, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Outside rollout</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.red, letterSpacing: "-0.02em" }}>
              {KPIs.outside_rollout.toLocaleString(LOCALE)}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{outsidePct}% of workforce</div>
          </div>
          <div style={{ borderLeft: `1px solid ${C.glassBorder}`, paddingLeft: 24 }}>
            <div style={{ fontSize: 10, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Provisioned</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.accent, letterSpacing: "-0.02em" }}>
              {KPIs.provisioned.toLocaleString(LOCALE)}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{KPIs.provisioning_rate}% with AI access</div>
            <UnmappedProvisionedHint onNavigate={onNavigate} />
          </div>
          <div style={{ borderLeft: `1px solid ${C.glassBorder}`, paddingLeft: 24 }}>
            <div style={{ fontSize: 10, color: C.subtle, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Credits consumed</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: CHART.secondary, letterSpacing: "-0.02em" }}>
              {KPIs.total_credits.toLocaleString(LOCALE)}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              <span style={{ color: CHART.primary, fontWeight: 600 }}>+{KPIs.growth_pct}%</span> week 1→13
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardActionBar
          info={{
            title: "Chart guide",
            items: ["Toggle Credits used or Sessions.", "Hover for exact weekly values."],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["consistent-growth"],
            title: "Weekly usage trend",
            subtitle: "13 weeks of usage data",
          }) : null}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12, paddingRight: ACTION_BAR_OFFSET }}>
          <SH title="Weekly usage trend" />
          <PillToggle
            options={Object.entries(metricCfg).map(([k, v]) => [k, v.label])}
            value={metric}
            onChange={setMetric}
          />
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={WEEKLY} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="week" tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false} width={55}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey={metric} name={metricCfg[metric].label}
              stroke={metricCfg[metric].color} fill={`${metricCfg[metric].color}22`}
              strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardActionBar
          info={{
            title: "How to read this chart",
            items: [
              "Horizontal bars show total credits consumed per tool over the period.",
              "Compare share of Chat vs Excel vs Coding IDE at company level.",
              "Department-level tool mix may differ — see Adoption Analytics.",
            ],
          }}
          insights={onOpenInsights ? () => onOpenInsights({
            insightIds: ["tool-mix-coherence"],
            title: "Credits by tool",
            subtitle: "Company-wide tool distribution",
          }) : null}
        />
        <div style={{ paddingRight: ACTION_BAR_OFFSET }}>
          <SH title="Credits by tool" />
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={toolChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
            <XAxis type="number" tick={{ fill: C.subtle, fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fill: C.textSub, fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Credits used" radius={[0, 6, 6, 0]}>
              {toolChartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <GeminiEstimatedCosts
        toolTierCredits={TOOL_TIER_CREDITS}
        deptToolTierCredits={DEPT_TOOL_TIER_CREDITS}
        deptRows={DEPT}
        onOpenInsights={onOpenInsights}
      />
    </div>
  )
}
