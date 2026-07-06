import ProcessPortfolioCard from "../process/ProcessPortfolioCard"

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
          <ProcessPortfolioCard
            key={item.id}
            item={{ ...item, rank: i + 1 }}
            featured={i === 0}
            showRank
            showCoachDetail
            onCoachDetail={onSelect}
            onViewWorkflows={() =>
              onNavigate?.({
                sectionId: "process",
                pageId: "portfolio",
                processNav: { view: "bu", dept: item.department, workflowId: null },
              })
            }
          />
        ))}
      </div>
    </section>
  )
}
