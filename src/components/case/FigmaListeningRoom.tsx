"use client"

import { useState } from "react"
import { figmaEmbed } from "@/lib/case-ui"
import s from "./FigmaListeningRoom.module.css"

export function FigmaListeningRoom() {
  const [draft, setDraft] = useState("")
  const [active, setActive] = useState("")
  const [loaded, setLoaded] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const parsed = figmaEmbed(active)
  const isPrototype = parsed && /figma\.com\/proto\//.test(parsed.openUrl)
  const validDraft = figmaEmbed(draft)
  function openPrototype() {
    const result = figmaEmbed(draft)
    if (!result) return
    setActive(draft.trim())
    setLoaded(false)
  }
  return <section className={s.wrap} aria-label="Interactive Figma prototype player">
    <div className={s.heading}>
      <div><span className={s.eyebrow}>INTERACTIVE / GM CONVOY</span><h2>Take it for a spin<span className={s.accent}>.</span></h2><p>Explore the actual Figma prototype, right here on the page.</p></div>
      <span className={s.tag}>FIGMA PLAYER ↗</span>
    </div>
    <form className={s.urlForm} onSubmit={(e)=>{e.preventDefault();openPrototype()}}>
      <label htmlFor="gm-figma-link">Paste a Figma prototype link</label>
      <div className={s.inputRow}><input id="gm-figma-link" value={draft} onChange={e=>setDraft(e.target.value)} placeholder="https://www.figma.com/proto/..." type="url" aria-describedby="gm-link-help" /><button type="submit" disabled={!validDraft}>Load prototype <span aria-hidden="true">↗</span></button></div>
      <p id="gm-link-help">Your link stays in this browser session. For public visitors, add the approved prototype URL to the project configuration.</p>
    </form>
    <div className={s.player}>
      <div className={s.chrome}><span className={s.lights}><i/><i/><i/></span><span>{parsed ? "CONVOY · INTERACTIVE PROTOTYPE" : "CONVOY · PREVIEW DECK"}</span><span>GM / 2026</span></div>
      {parsed ? <div className={s.stage}>
        <iframe key={active} title="GM Convoy interactive Figma prototype" src={parsed.embedUrl} loading="lazy" onLoad={()=>setLoaded(true)} allowFullScreen />
        {!loaded&&<div className={s.loading} role="status">Opening the prototype…</div>}
      </div> : <div className={s.empty}>
        <span className={s.orbit}>↗</span>
        <div><span className={s.emptyKicker}>YOUR PROTOTYPE GOES HERE</span><strong>No screenshots. No mock player.</strong><p>Paste the real Figma link above to make this an interactive part of the case study.</p></div>
      </div>}
      <footer className={s.controls}><div><span className={s.pulse}/> {parsed ? isPrototype ? "PROTOTYPE CONNECTED" : "FIGMA DESIGN LINK" : "AWAITING PROTOTYPE"}</div><div className={s.actions}>{parsed&&<><button type="button" onClick={()=>setExpanded(true)}>Expand ↗</button><a href={parsed.openUrl} target="_blank" rel="noreferrer">Open in Figma ↗</a></>}</div></footer>
    </div>
    {expanded&&parsed&&<div className={s.modal} role="dialog" aria-modal="true" aria-label="Expanded Figma prototype"><div className={s.modalTop}><span>CONVOY / FIGMA PROTOTYPE</span><button type="button" onClick={()=>setExpanded(false)}>Close ✕</button></div><iframe title="Expanded GM Convoy prototype" src={parsed.embedUrl} allowFullScreen/></div>}
  </section>
}
