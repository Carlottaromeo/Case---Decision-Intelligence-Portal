import { useState } from "react"
import { getBuIllustration, getBuInitials } from "../../data/businessUnitIllustrations"

export default function BusinessUnitIllustration({ department, accentColor, variant = "thumb" }) {
  const meta = getBuIllustration(department)
  const [failed, setFailed] = useState(false)
  const isHero = variant === "hero"
  const className = isHero
    ? "process-bu-card__hero"
    : "process-bu-card__illustration"

  if (!meta || failed) {
    return (
      <div
        className={`${className} process-bu-card__illustration--fallback`}
        style={{ "--bu-accent": accentColor, height: isHero ? "100%" : undefined }}
        aria-hidden="true"
      >
        {getBuInitials(department)}
      </div>
    )
  }

  return (
    <img
      className={className}
      src={meta.src}
      alt={meta.alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
