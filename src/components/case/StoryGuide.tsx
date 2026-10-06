"use client"
import { useState } from "react"
import type { Story } from "@/content/caseStories"
import styles from "./CaseExperience.module.css"

export function StoryOpening({ story }: { story: Story }) {
 return <aside className={styles.opening} aria-label="The person’s task">
  <span className={styles.roleTag}>{story.role}</span><p>{story.question}</p><small>Illustrative task prompt · not a participant quote</small>
 </aside>
}
export function StoryGuide({ story }: { story: Story }) {
 const [active,setActive]=useState(0)
 const [show,setShow]=useState(false)
 return <aside className={styles.guide} aria-label="Dhwani’s commentary">
  <div className={styles.guideTop}>
   <svg viewBox="0 0 64 76" width="48" height="56" aria-hidden="true"><path d="M12 68V34C12 7 52 7 52 34v34" fill="currentColor"/><ellipse cx="32" cy="35" rx="15" ry="19" fill="#edbd9b"/><path d="M16 28c0-19 32-20 32 0-10-1-15-8-16-10-4 7-11 9-16 10" fill="currentColor"/><circle cx="26" cy="34" r="1.5"/><circle cx="38" cy="34" r="1.5"/><path d="M27 43q5 5 10 0" fill="none" stroke="#713e36" strokeWidth="2"/><path d="M8 76q0-23 24-23t24 23" fill="var(--accent)"/></svg>
   <div><strong>A note from me</strong><small>Dhwani · authored portfolio narration</small></div>
   <button type="button" onClick={()=>setShow(!show)} aria-expanded={show}>{show?"Skip commentary":"Hear my reasoning ↗"}</button>
  </div>
  {show && <><div className={styles.guideTabs} role="group" aria-label="Explore Dhwani’s reasoning">{["My doubt","The finding","My call"].map((label,i)=><button type="button" key={label} aria-pressed={active===i} onClick={()=>setActive(i)} data-cursor={i===0?"Questioning the brief":i===1?"Research synthesis":"Design decisions"}>{label}</button>)}</div><p key={active} className={styles.guideSpeech} aria-live="polite">{[story.doubt,story.finding,story.call][active]}</p></>}
 </aside>
}
