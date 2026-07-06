import { useState } from "react"
import { PillToggle } from "./UI"
import NotificationBanner from "./NotificationBanner"
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
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PillToggle options={VIEWS} value={view} onChange={setView} />
      </div>

      {sourceData.error && (
        <NotificationBanner
          type="error"
          message={sourceData.error}
          className="dq-error dq-error-banner"
        />
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
