"use client"
import { useEffect, useRef, useState } from "react"
import { figmaEmbed } from "@/lib/case-ui"
import s from "./CinematicDeviceReveal.module.css"

const stages = ["SCROLL", "ROTATE", "REVEAL", "INTERACT"]
const clamp = (x: number) => Math.max(0, Math.min(1, x))
const ease = (x: number) => { const p = clamp(x); return p*p*(3-2*p) }

export function CinematicDeviceReveal({ initialUrl = "" }: { initialUrl?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [url, setUrl] = useState(initialUrl)
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
        <span className={s.eyebrow}>GENERAL MOTORS / CONVOY</span>
        <h2>Take Convoy<br/>for a <em>spin.</em></h2>
        <p>Explore the interaction design behind a road-trip experience for groups traveling together.</p>
        <div className={s.actions}>
          {!launched ? <button type="button" disabled={!parsed || !canOpen} onClick={()=>setLaunched(true)}>{parsed ? canOpen ? "Explore prototype ↗" : "Scroll to reveal ↓" : "Add a Figma URL below ↓"}</button> : <><button onClick={()=>setExpanded(true)}>Expand prototype ↗</button><button onClick={()=>setLaunched(false)}>Replay ↺</button></>}
          {parsed&&<a href={parsed.openUrl} target="_blank" rel="noopener noreferrer">Open in Figma ↗</a>}
        </div>
      </div>
      <div className={s.scene} style={{transform: `translateY(${(1-motion)*42}px) scale(${.9+.1*motion})`}}>
        <div className={s.tablet} style={{transform:`rotateY(${(1-motion)*-43}deg) rotateX(${(1-motion)*19}deg) rotateZ(${(1-motion)*-5}deg)`}}>
          <div className={s.glass}>
            {launched && parsed ? <iframe src={parsed.embedUrl} title="GM Convoy Figma prototype" allowFullScreen /> : <div className={s.preview}><div className={s.ring}>↗</div><strong>Your real prototype,<br/>in the driver’s seat.</strong><span>The interactive Figma experience opens here after the reveal.</span></div>}
          </div>
          <span className={s.camera}/>
        </div>
        <div className={s.shadow}/>
      </div>
      <div className={s.bottom}>
        <div className={s.linkForm}>
          <label htmlFor="convoy-figma-url">FIGMA PROTOTYPE LINK</label>
          <input id="convoy-figma-url" type="url" value={url} placeholder="https://www.figma.com/proto/..." onChange={e=>{setUrl(e.target.value);setLaunched(false)}} />
          <span>Paste a public prototype link to try it. Your input isn’t saved to the site.</span>
        </div>
        <div className={s.steps}>{stages.map((stage,i)=><div key={stage}><div className={s.track}><i style={{width:`${clamp(motion*4-i)*100}%`}}/></div><span>{String(i+1).padStart(2,"0")} &nbsp;{stage}</span></div>)}</div>
      </div>
    </div>
    {expanded && parsed && <div className={s.modal} role="dialog" aria-modal="true" aria-label="Expanded Convoy prototype"><div className={s.modalTop}><span>CONVOY / LIVE PROTOTYPE</span><button onClick={()=>setExpanded(false)}>Close ✕</button></div><iframe title="Expanded GM Convoy Figma prototype" src={parsed.embedUrl} allowFullScreen /></div>}
  </section>
}
