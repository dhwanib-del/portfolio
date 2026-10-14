"use client"
import { useEffect, useRef, useState } from "react"
import { figmaEmbed } from "@/lib/case-ui"
import s from "./CinematicDeviceReveal.module.css"

const stages = ["Context", "Perspective", "Interface", "Explore"]
const clamp = (x: number) => Math.max(0, Math.min(1, x))
const ease = (x: number) => { const p = clamp(x); return p*p*(3-2*p) }

export function CinematicDeviceReveal({ initialUrl = "" }: { initialUrl?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const url = initialUrl
  const [launched, setLaunched] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [reduce, setReduce] = useState(false)
  const parsed = figmaEmbed(url)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduce(query.matches)
    sync(); query.addEventListener("change",sync)
    return () => query.removeEventListener("change",sync)
  },[])
  useEffect(() => {
    if (launched) return
    let raf = 0
    const update = () => {
      raf = 0
      if(!host.current) return
      const rect = host.current.getBoundingClientRect()
      setProgress(clamp(-rect.top / Math.max(1, rect.height - window.innerHeight)))
    }
    const schedule = () => {if(!raf) raf = requestAnimationFrame(update)}
    update()
    window.addEventListener("scroll",schedule,{passive:true})
    window.addEventListener("resize",schedule)
    return () => {window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);cancelAnimationFrame(raf)}
  },[launched])
  useEffect(() => {
    if(!expanded) return
    const esc=(e:KeyboardEvent)=>{if(e.key==="Escape")setExpanded(false)}
    document.addEventListener("keydown",esc)
    return ()=>document.removeEventListener("keydown",esc)
  },[expanded])
  const motion = reduce || launched ? 1 : ease((progress-.07)/.79)
  const canOpen = motion > .87
  return <section ref={host} className={s.section} data-live={launched}>
    <div className={s.sticky}>
      <div className={s.copy}>
        <span className={s.eyebrow}>General Motors / Convoy</span>
        <h2>In the<br/><em>driver’s seat.</em></h2>
        <p>A concept for group road trips, developed as a shared phone-and-vehicle experience and evaluated in a physical vehicle mockup.</p>
        <div className={s.actions}>
          {parsed ? (!launched ? <button type="button" disabled={!canOpen} onClick={()=>setLaunched(true)}>{canOpen ? "Explore the prototype" : "Scroll to reveal"}</button> : <><button type="button" onClick={()=>setExpanded(true)}>Expand prototype</button><button type="button" onClick={()=>setLaunched(false)}>Replay</button></>) : <a href="#decisions">Explore the interface decisions</a>}
          {parsed&&<a href={parsed.openUrl} target="_blank" rel="noopener noreferrer">Open in Figma</a>}
        </div>
      </div>
      <div className={s.cabin} aria-hidden="true"><div className={s.windshield}/><div className={s.steering}/><div className={s.dash}/></div>
      <div className={s.scene} style={{transform: `translateY(${(1-motion)*42}px) scale(${.9+.1*motion})`}}>
        <div className={s.tablet} style={{transform:`rotateY(${(1-motion)*-43}deg) rotateX(${(1-motion)*19}deg) rotateZ(${(1-motion)*-5}deg)`}}>
          <div className={s.glass}>
            {launched && parsed ? <iframe src={parsed.embedUrl} title="GM Convoy Figma prototype" allowFullScreen /> : <div className={s.preview}><div className={s.ring}>●</div><strong>Convoy.</strong><span>Interface concept for connected group travel. {parsed ? "Scroll to explore the interactive team prototype." : "The team prototype is not publicly embedded here."}</span></div>}
          </div>
          <span className={s.camera}/>
        </div>
        <div className={s.shadow}/>
      </div>
      <div className={s.bottom}>
        <p className={s.availabilityNote}>{parsed ? "Prototype available to explore above." : "Concept design · evaluated in three usability sessions using a physical vehicle mockup. Approved prototype access is not available on this page."}</p>
        <div className={s.steps}>{stages.map((stage,i)=><div key={stage}><div className={s.track}><i style={{width:`${clamp(motion*4-i)*100}%`}}/></div><span>{String(i+1).padStart(2,"0")} &nbsp;{stage}</span></div>)}</div>
      </div>
    </div>
    {expanded && parsed && <div className={s.modal} role="dialog" aria-modal="true" aria-label="Expanded Convoy prototype"><div className={s.modalTop}><span>CONVOY / LIVE PROTOTYPE</span><button onClick={()=>setExpanded(false)}>Close ✕</button></div><iframe title="Expanded GM Convoy Figma prototype" src={parsed.embedUrl} allowFullScreen /></div>}
  </section>
}
