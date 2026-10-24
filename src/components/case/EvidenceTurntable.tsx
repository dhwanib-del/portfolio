"use client"

import { useState } from "react"
import s from "./EvidenceTurntable.module.css"

export type EvidenceSignal = { value: string; label: string; detail: string }
export function EvidenceTurntable({ project, signals }: { project: string; signals: EvidenceSignal[] }) {
  const [current, setCurrent] = useState(0)
  if (!signals.length) return null
  const active=signals[current]
  return <section className={s.wrap} aria-label={project+" research and delivery evidence"}>
    <div className={s.heading}><span>Field notes / the record</span><span>NOT IMPACT METRICS</span></div>
    <div className={s.body}>
      <div className={s.controls} role="group" aria-label="Choose a project fact">
        {signals.map((signal,index)=><button type="button" key={signal.label} aria-pressed={current===index} data-current={current===index} onClick={()=>setCurrent(index)} className={s.tab}>
          <span className={s.tabIndex}>{String(index+1).padStart(2,"0")}</span>
          <span>{signal.label}</span>
          <span className={s.tabArrow} aria-hidden="true">↗</span>
        </button>)}
      </div>
      <div className={s.stage} aria-live="polite">
        <div className={s.rim} aria-hidden="true"><span/><span/><span/><span/><span/></div>
        <div className={s.display}>
          <span className={s.now}>RESEARCH RECEIPT · {String(current+1).padStart(2,"0")}</span>
          <strong>{active.value}</strong>
          <span className={s.valueLabel}>{active.label}</span>
        </div>
        <div className={s.bottom}>
          <p>{active.detail}</p>
          <div className={s.counter}>{String(current+1).padStart(2,"0")} <span>/</span> {String(signals.length).padStart(2,"0")}</div>
        </div>
      </div>
    </div>
  </section>
}
