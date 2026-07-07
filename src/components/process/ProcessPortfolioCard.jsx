import { LOCALE, ACID } from "../../theme"
import { Badge } from "../UI"
import AiSummarySection from "../AiSummarySection"
import { EmphasizedText } from "../../utils/emphasizeAiText"

function adoptionColor(rate) {
  if (rate < 35) return ACID.red
  if (rate <= 65) return ACID.yellow
  return ACID.green
}

export default function ProcessPortfolioCard({
  item,
  featured = false,
  showRank = false,
  showCoachDetail = false,
  onCoachDetail,
  onViewWorkflows,
}) {
  const snippet = item.heroSnippet ?? item.coach?.perche?.split(". ")[0]

  return (
    <article
      className={`investment-hero__card${featured ? " investment-hero__card--lead" : ""}`}
    >
      {showRank && item.rank != null && (
        <div className="investment-hero__rank">#{item.rank}</div>
      )}
      <div className="investment-hero__dept">{item.department}</div>
      <div className="investment-hero__process">{item.process_name}</div>
      <div className="investment-hero__badges">
        <Badge
          label={`${item.adoption_rate.toLocaleString(LOCALE)}% adoption`}
          color={adoptionColor(item.adoption_rate)}
        />
      </div>
      <AiSummarySection className="investment-hero__ai-summary" title="AI summary">
        <EmphasizedText text={snippet} className="investment-hero__snippet" />
      </AiSummarySection>
      <div className={`investment-hero__actions${!showCoachDetail ? " investment-hero__actions--single" : ""}`}>
        {showCoachDetail && (
          <button
            type="button"
            className="investment-btn investment-btn--ghost"
            onClick={() => onCoachDetail?.(item)}
          >
            Coach detail
          </button>
        )}
        <button
          type="button"
          className="investment-btn investment-btn--primary"
          onClick={() => onViewWorkflows?.(item)}
        >
          View active workflows
        </button>
      </div>
    </article>
  )
}
