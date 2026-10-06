"use client"
import { useRef, useState, useSyncExternalStore } from "react"
import type { Case } from "@/content/cases"
import type { Story } from "@/content/caseStories"
import { CaseExperiment } from "./CaseExperiment"
import { BudgetStory } from "./BudgetStory"
import { IntelHandoff } from "./StoryInteractions"
import { StoryOpening, StoryGuide } from "./StoryGuide"
import styles from "./CaseStoryPlayer.module.css"

const subscribeReady = () => () => {}
const clientReady = () => true
const serverReady = () => false
const chapters=["The task","The friction","What changed","My decision","The behavior","My contribution","The outcome"]

export function CaseStoryPlayer({ project, story }: { project: Case; story: Story }) {
 const [step,setStep]=useState(0)
 const [view,setView]=useState<"scroll"|"slides">("scroll")
 const ready=useSyncExternalStore(subscribeReady,clientReady,serverReady)
 const frame=useRef<HTMLDivElement>(null)
 const go=(next:number)=>{setStep(Math.max(0,Math.min(chapters.length-1,next)));if(view==="scroll"){document.getElementById(`story-scene-${next+1}`)?.scrollIntoView({behavior:"auto",block:"start"})}else{frame.current?.focus({preventScroll:true});frame.current?.scrollIntoView({behavior:"auto",block:"start"})}}
 const decisionMethod: Record<string,string>={briefs:"Information architecture",intel:"Apps Script prototype","general-motors":"Figma prototyping",openlibrary:"Research recommendations",budgetcart:"Figma components"}
 const titles=[({briefs:"A building contact, mid-call.",intel:"A case reaches the next analyst.","general-motors":"A trip involves more than one driver.",openlibrary:"An unfamiliar term interrupts the page.",budgetcart:"One item. Several things to weigh."} as Record<string,string>)[project.slug],project.sections[0].heading,project.sections[1].heading,project.decision?.decision||story.move,story.lens,project.sections[2].heading,"What happened next."]
 return <section id="story" className={styles.player} aria-label="Interactive case story">
  <div className={styles.mode}><span>Read at your pace</span><div role="group" aria-label="Reading mode"><button disabled={!ready} aria-pressed={view==="scroll"} onClick={()=>setView("scroll")}>Scroll story ↓</button><button disabled={!ready} aria-pressed={view==="slides"} onClick={()=>setView("slides")}>Slide view →</button></div></div>
  <div className={styles.toolbar}><span>the story / {project.org.split(" · ")[0]}</span><span>{view==="scroll"?"7 scenes · scroll freely":`${String(step+1).padStart(2,"0")} / 07`}</span></div>
  <div className={styles.chapterTabs} role="group" aria-label="Choose a story chapter">
   {chapters.map((label,i)=><button type="button" key={label} disabled={!ready} aria-pressed={view==="slides"?step===i:undefined} aria-controls={view==="scroll"?`story-scene-${i+1}`:"story-frame"} onClick={()=>go(i)} data-cursor={i<3?"Research synthesis":i===3?decisionMethod[project.slug]:"Explaining the decision"}><span aria-hidden="true">{String(i+1).padStart(2,"0")}</span>{label}</button>)}
  </div>
  {(view==="scroll"?chapters.map((_,i)=>i):[step]).map(scene=>{const step=scene;return <div key={scene} id={view==="scroll"?`story-scene-${scene+1}`:"story-frame"} ref={view==="slides"?frame:undefined} className={`${styles.frame} ${![0,2,3].includes(step)?styles.wide:""}`} tabIndex={0} onKeyDown={e=>{if(view!=="slides"||e.target!==e.currentTarget)return;if(e.key==="ArrowRight"){e.preventDefault();go(step+1)}if(e.key==="ArrowLeft"){e.preventDefault();go(step-1)}}} aria-label={`Chapter ${step+1}: ${chapters[step]}${view==="slides"?". Use left and right arrows to navigate.":""}`}>
   <div className={styles.content} key={step}>
    <p className={styles.beat}>{String(step+1).padStart(2,"0")} / {chapters[step]}</p>
    <h2>{titles[step]}</h2>
    {step===0 && <><StoryOpening story={story}/><p className={styles.lead}>{project.hook}</p><p className={styles.invitation}>Follow the task, then inspect the choice.</p></>}
    {step===1 && project.sections[0].body.map(p=><p key={p}>{p}</p>)}
    {step===2 && project.sections[1].body.map(p=><p key={p}>{p}</p>)}
    {step===3 && <>
      <p>{project.decision?.why}</p>
      <details className={styles.margin}><summary>What I chose against ↗</summary><p>{project.decision?.rejected}</p></details>
      <div className={styles.signature}>{project.slug==="intel"?<IntelHandoff/>:project.slug==="budgetcart"?<BudgetStory/>:<CaseExperiment slug={project.slug}/>}</div>
    </>}
    {step===4 && <><p className={styles.lead}>{story.theory}</p><p>{story.interpretation}</p><div className={styles.source}><span>Behavioral lens · interpretation, not a measured effect</span><a href={story.sourceUrl || "https://www.nngroup.com/articles/ten-usability-heuristics/"} target="_blank" rel="noreferrer">{story.sourceLabel || `Jakob Nielsen · heuristic ${story.source}`} ↗</a></div></>}
    {step===5 && project.sections[2].body.map(p=><p key={p}>{p}</p>)}
    {step===6 && <><div className={styles.outcome}><span>DELIVERED / OBSERVED</span><p>{project.status}</p></div>
     {project.stats && <dl className={styles.evidenceNumbers}>{project.stats.map(s=><div key={s.label}><dt>{s.label}</dt><dd>{s.prefix}{s.value}{s.suffix}</dd></div>)}</dl>}
     <div className={styles.nextQuestion}><strong>The next question</strong><p>{project.next}</p></div>
     {!!project.links?.length && <nav className={styles.resources} aria-label="Project resources">{project.links.map(l=><a key={l.href} href={l.href} target="_blank" rel="noreferrer">{l.label} ↗</a>)}</nav>}
    </>}
   </div>
   {[0,2,3].includes(step) && <aside className={styles.sideNote}><span className={styles.paperClip} aria-hidden="true">⌇</span><span className={styles.noteLabel}>in my notebook</span><p>{step<=1?story.doubt:step===2?story.finding:story.call}</p><small>Dhwani · authored narration</small></aside>}
  </div>})}
  {view==="slides" && <><label className={styles.scrubber}>Jump through the story<input type="range" min={0} max={6} value={step} disabled={!ready} aria-label="Story chapter" aria-valuetext={chapters[step]} onChange={e=>setStep(Number(e.target.value))}/></label>
  <div className={styles.navigation}><button type="button" disabled={!ready || step===0} onClick={()=>go(step-1)}>← Back</button><p role="status" aria-live="polite">Chapter {step+1} of 7 · {chapters[step]}</p><button type="button" disabled={!ready} onClick={()=>go(step===6?0:step+1)} data-cursor="Story time">{step===6?"Read again ↻":`Next: ${chapters[step+1]} →`}</button></div>
  <p className={styles.keyboardHint}>Focus the story card to use ← →, or drag the slider to jump.</p></>}
  <StoryGuide story={story} ready={ready}/>
 </section>
}
