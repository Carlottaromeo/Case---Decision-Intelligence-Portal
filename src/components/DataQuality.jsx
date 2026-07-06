import { useState } from "react"
import { PillToggle, SH } from "./UI"
import { useDashboardData } from "../context/DashboardDataContext"
import DataQualityOverview from "./dataQuality/DataQualityOverview"
import SourceDataWorkspace from "./dataQuality/SourceDataWorkspace"

const VIEWS = [
  ["overview", "Overview"],
  ["sources", "Source files"],
]

export default function DataQuality() {
  const [view, setView] = useState("overview")
  const sourceData = useDashboardData()

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <SH
          title="Data Quality"
          sub="Measured data from employee directory + usage export — live processing, no static bundle"
        />
        <PillToggle options={VIEWS} value={view} onChange={setView} />
      </div>

      {sourceData.error && (
        <div className="dq-error">{sourceData.error}</div>
      )}

      {view === "overview" ? (
        <DataQualityOverview
          onGoToFiles={() => setView("sources")}
        />
      ) : (
        <SourceDataWorkspace sourceData={sourceData} />
      )}
    </div>
  )
}
