import { C } from "../../theme"
import { Badge } from "../UI"
import { deptColor, LEVEL_COLORS, ACTION_COLORS } from "../../data/processMapsMeta"

export default function ProcessHeader({ map, scenario }) {
  const col = deptColor(map.color)
  const aiPotential = scenario?.ai_potential ?? map.ai_potential
  const investmentPriority = scenario?.management_action ?? map.management_action
  const customized = Boolean(scenario?.isCustomized)

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: col, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
        Department owner · {map.department}
      </div>
      <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
        {map.process_name}
      </h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <Badge label={map.mapping_status} color={C.muted} />
        <Badge label={`Dept. adoption: ${map.adoption_level}`} color={LEVEL_COLORS[map.adoption_level]} />
        <Badge label={`AI potential: ${aiPotential}`} color={LEVEL_COLORS[aiPotential]} />
        <Badge
          label={`Investment priority: ${investmentPriority}${customized ? " (scenario)" : ""}`}
          color={ACTION_COLORS[investmentPriority]}
        />
      </div>
    </div>
  )
}
