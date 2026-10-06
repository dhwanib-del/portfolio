"use client"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import Image from "next/image"
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

export function CaseStoryPlayer({ project, story, readMinutes }: { project: Case; story: Story; readMinutes: number }) {
 const [step,setStep]=useState(0)
 const [navOpen,setNavOpen]=useState(false)
 const [view,setView]=useState<"scroll"|"slides">("scroll")
 const ready=useSyncExternalStore(subscribeReady,clientReady,serverReady)
 const frame=useRef<HTMLDivElement>(null)
 const root=useRef<HTMLElement>(null)
 useEffect(()=>{
  if(view!=="scroll" || !ready)return
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)
   if(visible[0])setStep(Number((visible[0].target as HTMLElement).dataset.scene))
  },{rootMargin:"-110px 0px -55% 0px",threshold:0})
  root.current?.querySelectorAll("[data-scene]").forEach(scene=>observer.observe(scene))
  return ()=>observer.disconnect()
 },[view,ready])
 const go=(next:number)=>{setNavOpen(false);setStep(Math.max(0,Math.min(chapters.length-1,next)));if(view==="scroll"){document.getElementById(`story-scene-${next+1}`)?.scrollIntoView({behavior:"auto",block:"start"})}else{frame.current?.focus({preventScroll:true});frame.current?.scrollIntoView({behavior:"auto",block:"start"})}}
 const decisionMethod: Record<string,string>={briefs:"Information architecture",intel:"Apps Script prototype","general-motors":"Figma prototyping",openlibrary:"Research recommendations",budgetcart:"Figma components"}
 const screenSlots:Record<string,{title:string;focus:string}[]>={
 briefs:[{title:"The original lookup",focus:"Show the building record beside the separate employment check. Use fictional contact details."},{title:"The proposed building profile",focus:"Annotate the pinned urgent details and source check; show where ownership is still unresolved."}],
 intel:[{title:"Keep the request with the case",focus:"The fictional Overview demo keeps the request, status and assigned team together."},{title:"Move into the workup",focus:"The fictional Workup demo changes the view while keeping the same case context."}],
 "general-motors":[{title:"From one driver to the group",focus:"Use a cleared, workflow-level concept frame to show the pivot. Keep restricted client interface details private."},{title:"Planning versus in-car coordination",focus:"Pair cleared phone and dashboard concept frames. Annotate what belongs before the trip versus during it."}],
 openlibrary:[{title:"Where reading gets interrupted",focus:"Show a cleared reading-flow artifact with the switch to language tools marked."},{title:"Help beside the book",focus:"Show a recommendation frame with language support near the page. Label it as a proposal."}],
 budgetcart:[{title:"The cues we hid",focus:"Show the earlier prototype with the missing price, brand and store cues marked."},{title:"The cues we brought back",focus:"Pair the revised prototype with visible decision cues and budget context. Label it as a prototype."}]
 }
 const titles=[({briefs:"A building emergency. Details needed now.",intel:"A case reaches the next analyst.","general-motors":"A trip involves more than one driver.",openlibrary:"An unfamiliar term interrupts the page.",budgetcart:"One item. Several things to weigh."} as Record<string,string>)[project.slug],project.sections[0].heading,project.sections[1].heading,project.decision?.decision||story.move,story.lens,project.sections[2].heading,"What happened next."]
 return <section id="story" data-view={view} ref={root} className={styles.player} aria-label="Interactive case story">
  <div className={styles.mode}><span>30 sec skim · ~{readMinutes} min read</span><div role="group" aria-label="Reading mode"><button disabled={!ready} aria-pressed={view==="scroll"} onClick={()=>setView("scroll")}>Scroll story ↓</button><button disabled={!ready} aria-pressed={view==="slides"} onClick={()=>setView("slides")}>Slide view →</button></div></div>
  <div className={styles.toolbar}><span>the story / {project.org.split(" · ")[0]}</span><span>{view==="scroll"?"7 scenes · scroll freely":`${String(step+1).padStart(2,"0")} / 07`}</span></div>
  <div className={styles.storyLayout}><nav className={`${styles.chapterTabs} ${navOpen?styles.railExpanded:""}`} aria-label="Story chapters" onKeyDown={e=>{if(e.key==="Escape"){setNavOpen(false);e.currentTarget.querySelector<HTMLButtonElement>("button")?.focus()}}}><button className={styles.railToggle} aria-expanded={navOpen} aria-controls="story-chapter-list" aria-label={navOpen?"Close story sections":"Open story sections"} onClick={()=>setNavOpen(!navOpen)}><span aria-hidden="true">☰</span></button><span className={styles.railTime}>~{readMinutes}m</span><div id="story-chapter-list" className={styles.railList}>
   {chapters.map((label,i)=><button type="button" key={label} disabled={!ready} aria-current={step===i?"step":undefined} aria-controls={view==="scroll"?`story-scene-${i+1}`:"story-frame"} onClick={()=>go(i)} data-cursor={i<3?"Research synthesis":i===3?decisionMethod[project.slug]:"Explaining the decision"}><span className={styles.railDot} aria-hidden="true"/><span className={styles.chapterLabel}>{String(i+1).padStart(2,"0")} · {label}</span></button>)}
  </div><div className={styles.railStatus} aria-hidden="true">{String(step+1).padStart(2,"0")}<span>/07</span></div></nav><div className={styles.scenes}>
  {(view==="scroll"?chapters.map((_,i)=>i):[step]).map(scene=>{const step=scene;const screen=project.figures[step===1?0:1];return <div key={scene} data-scene={scene} id={view==="scroll"?`story-scene-${scene+1}`:"story-frame"} ref={view==="slides"?frame:undefined} className={`${styles.frame} ${![0,2,3].includes(step)?styles.wide:""}`} tabIndex={0} onKeyDown={e=>{if(view!=="slides"||e.target!==e.currentTarget)return;if(e.key==="ArrowRight"){e.preventDefault();go(step+1)}if(e.key==="ArrowLeft"){e.preventDefault();go(step-1)}}} aria-label={`Chapter ${step+1}: ${chapters[step]}${view==="slides"?". Use left and right arrows to navigate.":""}`}>
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
    {[1,3].includes(step) && <figure className={styles.screenSlot}>
     <div className={styles.screenBar}><span aria-hidden="true">● ● ●</span><span>{step===1?"01 / FRICTION":"02 / DESIGN DIRECTION"}</span></div>
     {screen?.src?(screen.video?<video src={screen.src} controls playsInline aria-label={screen.alt}/>:<Image src={screen.src} alt={screen.alt} width={1600} height={1000} sizes="(max-width:900px) 100vw,720px"/>):project.slug==="intel"?<Image src={step===1?"/case-shots/intel/05-case-detail.jpg":"/case-shots/intel/06-case-workup.jpg"} alt={screenSlots[project.slug][step===1?0:1].focus} width={1600} height={1000} sizes="(max-width:900px) 100vw,720px"/>:<div className={styles.screenBlank}><svg viewBox="0 0 80 64" aria-hidden="true"><rect x="8" y="6" width="64" height="44" rx="5"/><path d="M28 58h24M40 50v8M20 38l13-13 9 8 10-15 10 20"/><circle cx="24" cy="18" r="3"/></svg><strong>{screenSlots[project.slug][step===1?0:1].title}</strong><span>Screen placeholder · awaiting cleared media</span></div>}
     <figcaption><strong>{screen?.src?screen.caption:project.slug==="intel"?"Fictional portfolio demo":"Planned screen focus"}</strong>{!screen?.src && <details><summary>What to look for ↗</summary><p>{screenSlots[project.slug][step===1?0:1].focus}</p></details>}</figcaption>
    </figure>}
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
  </div></div>
  {view==="slides" && <><label className={styles.scrubber}>Jump through the story<input type="range" min={0} max={6} value={step} disabled={!ready} aria-label="Story chapter" aria-valuetext={chapters[step]} onChange={e=>setStep(Number(e.target.value))}/></label>
  <div className={styles.navigation}><button type="button" disabled={!ready || step===0} onClick={()=>go(step-1)}>← Back</button><p role="status" aria-live="polite">Chapter {step+1} of 7 · {chapters[step]}</p><button type="button" disabled={!ready} onClick={()=>go(step===6?0:step+1)} data-cursor="Story time">{step===6?"Read again ↻":`Next: ${chapters[step+1]} →`}</button></div>
  <p className={styles.keyboardHint}>Focus the story card to use ← →, or drag the slider to jump.</p></>}
  <StoryGuide story={story} ready={ready}/>
 </section>
}
