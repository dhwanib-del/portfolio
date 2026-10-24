"use client"

import { useState } from "react"
import type { Decision } from "@/content/caseStudies"
import { OwnerTag } from "./OwnerTag"
import s from "./DecisionStudio.module.css"

type Props = { decisions: Decision[]; project: string }

/**
 * Editorial decision player: one real tradeoff at a time.
 * No auto-advance or fabricated metrics. Every panel comes from caseStudies.ts.
 * Tabs follow WAI-ARIA semantics, keyboard arrows/Home/End.
 */
export function DecisionStudio({ decisions, project }: Props) {
  const [active, setActive] = useState(0)
  if (!decisions.length) return null
  const choice = decisions[active]
  const tabs = decisions.map((d, index) => ({
    id: `decision-tab-${index}`,
    panel: `decision-panel-${index}`,
    title: d.title,
  }))
  function activate(index: number) {
    const next = (index + decisions.length) % decisions.length
    setActive(next)
    document.getElementById(tabs[next].id)?.focus()
  }
  function onKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); activate(index + 1) }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); activate(index - 1) }
    if (event.key === "Home") { event.preventDefault(); activate(0) }
    if (event.key === "End") { event.preventDefault(); activate(decisions.length - 1) }
  }

  return <div className={s.studio}>
    <div className={s.topline}><span>Inside the decision</span><span>{project} / DESIGN RECORD {String(active + 1).padStart(2,"0")}</span></div>
    <div className={s.shell}>
      <div className={s.index} role="tablist" aria-label="Explore design decisions" aria-orientation="vertical">
        {tabs.map((tab, index) => <button
          key={tab.id}
          id={tab.id}
          type="button"
          role="tab"
          aria-controls={tab.panel}
          aria-selected={active === index}
          tabIndex={active === index ? 0 : -1}
          onKeyDown={event => onKey(event,index)}
          className={s.choice}
          data-active={active === index}
          onClick={() => setActive(index)}
        >
          <span className={s.number}>{String(index + 1).padStart(2,"0")}</span>
          <span className={s.choiceTitle}>{tab.title}</span>
          <span className={s.arrow} aria-hidden="true">↗</span>
        </button>)}
      </div>
      <div className={s.player} id={tabs[active].panel} role="tabpanel" aria-labelledby={tabs[active].id} tabIndex={0} key={active}>
        <div className={s.playerTop}>
          <span className={s.smallLabel}>The tradeoff / {String(active + 1).padStart(2, "0")}</span>
          <OwnerTag owner={choice.owner}/>
        </div>
        <h3 className={s.headline}>{choice.title}</h3>
        <div className={s.compare}>
          <div className={s.rejected}><span className={s.micro}>The alternative</span><p>{choice.over}</p></div>
          <div className={s.selected}><span className={s.micro}>What we chose <span aria-hidden="true">↗</span></span><p>{choice.chose}</p></div>
        </div>
        <div className={s.reason}>
          <span className={s.micro}>Why that choice</span>
          <p>{choice.because}</p>
        </div>
        <div className={s.evidence}>
          <span className={s.proofDot} aria-hidden="true"/>
          <div><span className={s.micro}>The evidence / its limits</span><p>{choice.evidence}</p></div>
        </div>
      </div>
    </div>
    <div className={s.foot}>
      <span>REAL DECISIONS · NO FICTIONAL OUTCOMES</span>
      <span>{String(active + 1).padStart(2,"0")} <i aria-hidden="true">/</i> {String(decisions.length).padStart(2,"0")}</span>
    </div>
  </div>
}
