import AIPenButton from "./AIPenButton"
import CardInfoButton from "./CardInfoButton"
import { actionBarStyle } from "./cardActions"

export default function CardActionBar({ overlay = true, info, insights, insightTitle }) {
  const hasInfo = Boolean(info?.items?.length)
  const hasInsights = Boolean(insights)

  if (!hasInfo && !hasInsights) return null

  return (
    <div
      style={{
        ...(overlay
          ? { position: "absolute", top: 14, right: 14, zIndex: 6 }
          : { position: "relative", flexShrink: 0 }),
        ...actionBarStyle,
      }}
    >
      {hasInsights && (
        <AIPenButton
          onClick={insights}
          title={insightTitle}
        />
      )}
      {hasInfo && (
        <CardInfoButton
          overlay={false}
          title={info.title}
          items={info.items}
        />
      )}
    </div>
  )
}
