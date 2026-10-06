"use client"
import { useState } from "react"
import type { Story } from "@/content/caseStories"
import styles from "./CaseExperience.module.css"

export function DhwaniAvatar(){return <span className={styles.guideAvatar}><svg viewBox="0 0 88 96" width="64" height="70" aria-hidden="true"><path d="M17 77V40C17 8 71 8 71 40v37" fill="#302329"/><path d="M21 77q23-15 46 0" fill="#302329"/><ellipse cx="44" cy="43" rx="22" ry="26" fill="#edbd9b"/><path d="M21 34C18 4 70 6 68 35 55 34 46 22 42 18c-5 10-12 14-21 16" fill="#302329"/><path d="M29 42q4-4 8 0m14 0q4-4 8 0" fill="none" stroke="#302329" strokeWidth="2.5" strokeLinecap="round"/><ellipse cx="30" cy="51" rx="5" ry="3" fill="#df8692" opacity=".6"/><ellipse cx="58" cy="51" rx="5" ry="3" fill="#df8692" opacity=".6"/><path d="M39 54q5 5 10 0" fill="none" stroke="#924a53" strokeWidth="2" strokeLinecap="round"/><circle cx="22" cy="53" r="3" fill="#ebbe67"/><circle cx="66" cy="53" r="3" fill="#ebbe67"/><path d="M14 96q1-27 30-27t30 27" fill="var(--accent)"/><path d="M34 70q10 14 20 0" fill="none" stroke="var(--on-accent)" strokeWidth="3"/><path d="M59 17q-12-12-13 0 6 7 13 0 14-7 13 2-7 7-13-2" fill="var(--accent)"/><path d="m7 24 2-6 2 6 6 2-6 2-2 6-2-6-6-2zM77 55l2-4 2 4 4 2-4 2-2 4-2-4-4-2z" fill="var(--accent)"/></svg></span>}

export function StoryOpening({ story }: { story: Story }) {
 return <aside className={styles.opening} aria-label="The person’s task">
  <span className={styles.roleTag}>{story.role}</span><p>{story.question}</p><small>Illustrative task prompt · not a participant quote</small>
 </aside>
}
export function StoryGuide({ story, ready }: { story: Story; ready: boolean }) {
 const [active,setActive]=useState(0)
 const [show,setShow]=useState(false)
 return <aside className={styles.guide} aria-label="Dhwani’s commentary">
  <div className={styles.guideTop}>
   <DhwaniAvatar/>
   <div><strong>A note from me</strong><small>Dhwani · authored portfolio narration</small></div>
   <button type="button" disabled={!ready} onClick={()=>setShow(!show)} aria-expanded={show}>{show?"Skip commentary":"Hear my reasoning ↗"}</button>
  </div>
  {show && <><div className={styles.guideTabs} role="group" aria-label="Explore Dhwani’s reasoning">{["My doubt","The finding","My call"].map((label,i)=><button type="button" key={label} aria-pressed={active===i} onClick={()=>setActive(i)} data-cursor={i===0?"Questioning the brief":i===1?"Research synthesis":"Design decisions"}>{label}</button>)}</div><p key={active} className={styles.guideSpeech} aria-live="polite">{[story.doubt,story.finding,story.call][active]}</p></>}
 </aside>
}
