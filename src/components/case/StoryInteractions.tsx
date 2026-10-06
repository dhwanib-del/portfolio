"use client"
import { useState } from "react"
import Image from "next/image"
import styles from "./StoryInteractions.module.css"

export function MarginNote({ label, children }: { label: string; children: React.ReactNode }) {
  return <details className={styles.note}><summary>{label}</summary><p>{children}</p></details>
}

const views = [
  { label: "01 · Overview", src: "/case-shots/intel/05-case-detail.jpg", title: "Start with the original request.", caption: "The overview brings the request, current status, and assigned team into the same case.", alt: "Fictional Intel case overview showing the original request, status, and assigned team." },
  { label: "02 · Workup", src: "/case-shots/intel/06-case-workup.jpg", title: "Continue the work. Keep the request.", caption: "The Workup view keeps the same case header and states that the original request remains preserved.", alt: "Fictional Intel Workup view showing the persistent case header and guidance to preserve the request before secondary review." }
]

export function IntelHandoff() {
  const [active, setActive] = useState(0)
  const view = views[active]
  return <section className={`container ${styles.handoff}`} aria-labelledby="handoff-title">
    <p className="eyebrow">Try the handoff</p>
    <h2 id="handoff-title">The view changes. The case stays with you.</h2>
    <p className={styles.disclaimer}>Portfolio demo with fictional records. These screens illustrate the workflow; they do not measure its impact.</p>
    <div className={styles.context}><strong>Same case, next step</strong><span>Original request · current status · assigned team</span></div>
    <div className={styles.controls} role="group" aria-label="Choose a case view">
      {views.map((v, i) => <button key={v.src} type="button" aria-pressed={active === i} aria-controls="handoff-panel" onClick={() => setActive(i)}>{v.label}</button>)}
    </div>
    <figure id="handoff-panel" className={styles.panel}>
      {views.map((v, i) => <Image key={v.src} src={v.src} alt={v.alt} hidden={active !== i} loading="eager" width={2000} height={1250} sizes="(max-width: 1104px) 100vw, 1104px" />)}
      <figcaption aria-live="polite"><strong>{view.title}</strong>{view.caption}</figcaption>
      <a className={styles.full} href={view.src} target="_blank" rel="noreferrer">Open this screen at full size ↗</a>
    </figure>
  </section>
}

export function MarginalDecision({ tension, decision, why, rejected }: { tension: string; decision: string; why: string; rejected?: string }) {
  return <section className="decision">
    <p className="decision-t">{tension}</p>
    <h3 className="decision-d">{decision}</h3>
    {rejected && <p className="decision-r"><span>Rejected</span> <s>{rejected}</s></p>}
    <MarginNote label="why this choice?">{why}</MarginNote>
  </section>
}
