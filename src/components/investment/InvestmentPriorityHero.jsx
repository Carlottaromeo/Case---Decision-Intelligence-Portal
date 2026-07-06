import { C, LOCALE } from "../../theme"
import { Badge } from "../UI"
import AiSummarySection from "../AiSummarySection"
import { EmphasizedText } from "../../utils/emphasizeAiText"
import { ACTION_COLORS } from "../../data/processMapsMeta"
import { DATA_TIERS } from "../../data/dashboardCopy"

export default function InvestmentPriorityHero({ topItems, onSelect, onNavigate }) {
  if (!topItems?.length) return null

  return (
    <section className="investment-hero">
      <div className="investment-hero__header">
        <h2 className="investment-hero__title">Where to invest first</h2>
        <p className="investment-hero__sub">Top 3 departments by combined score (measured adoption + simulated priority + live workflow boost)</p>
      </div>
      <div className="investment-hero__grid">
        {topItems.map((item, i) => (
          <article
            key={item.id}
            className={`investment-hero__card${i === 0 ? " investment-hero__card--lead" : ""}`}
          >
            <div className="investment-hero__rank">#{i + 1}</div>
            <div className="investment-hero__dept">{item.department}</div>
            <div className="investment-hero__process">{item.process_name}</div>
            <div className="investment-hero__badges">
              <Badge label={item.investment_priority} color={ACTION_COLORS[item.investment_priority]} />
              <Badge
                label={`${item.adoption_rate.toLocaleString(LOCALE)}% adozione`}
                color={DATA_TIERS.measured.color}
              />
              {item.live_workflow_boost > 0 && (
                <Badge label="Workflow live" color="#6229FF" />
              )}
            </div>
            <AiSummarySection className="investment-hero__ai-summary" title="AI summary">
              <EmphasizedText
                text={item.heroSnippet ?? item.coach?.perche?.split(". ")[0]}
                className="investment-hero__snippet"
              />
            </AiSummarySection>
            <div className="investment-hero__actions">
              <button
                type="button"
                className="investment-btn investment-btn--ghost"
                onClick={() => onSelect?.(item)}
              >
                Coach detail
              </button>
              <button
                type="button"
                className="investment-btn investment-btn--primary"
                onClick={() =>
                  onNavigate?.({
                    sectionId: "process",
                    pageId: "portfolio",
                    processNav: { view: "bu", dept: item.department, workflowId: null },
                  })
                }
              >
                View workflow
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
