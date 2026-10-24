"use client"

import { useEffect, useId, useState } from "react"
import type { StoryBeat } from "@/content/caseNarratives"
import type { CaseMediaItem } from "@/content/caseMedia"
import s from "./CaseStory.module.css"

export function CaseStory({ opening, beats, media = [] }: { opening: string; beats: StoryBeat[]; media?: CaseMediaItem[] }) {
  const [index, setIndex] = useState(0)
  const [reduce, setReduce] = useState(true)
  const id = useId().replace(/:/g, "")
  useEffect(() => {
    const mq=window.matchMedia("(prefers-reduced-motion: reduce)")
    const update=()=>setReduce(mq.matches)
    update()
    mq.addEventListener("change", update)
    return ()=>mq.removeEventListener("change", update)
  }, [])
  if (!beats.length) return null
  const beat = beats[index]
  const selected = beat.mediaIndex === undefined ? undefined : media[beat.mediaIndex]
  const photo = selected?.kind==="film" ? selected.poster : selected?.url
  const hasPhoto = selected && photo

  function keys(event: React.KeyboardEvent<HTMLButtonElement>, at: number) {
    if (event.key==="ArrowRight") { event.preventDefault(); activate((at+1)%beats.length) }
    if (event.key==="ArrowLeft") { event.preventDefault(); activate((at-1+beats.length)%beats.length) }
    if (event.key==="Home") { event.preventDefault(); activate(0) }
    if (event.key==="End") { event.preventDefault(); activate(beats.length-1) }
  }
  function activate(next: number) {
    setIndex(next)
    document.getElementById(id+"-beat-"+next)?.focus()
  }
  return <section className={s.story} aria-label="The story behind this project">
    <div className={s.topline}><span>THE STORY</span><span>{String(index+1).padStart(2,"0")} / {String(beats.length).padStart(2,"0")}</span></div>
    <div className={s.heading}>
      <p>How we got here</p>
      <h2>{opening}</h2>
    </div>
    <div className={s.frame}>
      <div className={s.narrative} key={index}>
        <span className={s.number}>CHAPTER {String(index+1).padStart(2,"0")}</span>
        <span className={s.kicker}>{beat.kicker}</span>
        <h3>{beat.title}</h3>
        <p>{beat.body}</p>
        <div className={s.next}>
          <button type="button" onClick={()=>setIndex(Math.max(0,index-1))} disabled={index===0} aria-label="Previous chapter">←</button>
          <button type="button" onClick={()=>setIndex(Math.min(beats.length-1,index+1))} disabled={index===beats.length-1} aria-label="Next chapter">→</button>
          <span>{index===beats.length-1 ? "That's where it landed." : "Keep reading"}</span>
        </div>
      </div>
      <div className={s.visual} key={selected?.url||"no-photo"}>
        {hasPhoto ? (
          // A story visual is always an existing project asset, never generated UI.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={selected.title} loading="lazy" />
        ) : selected?.kind==="film" ? (
          <video src={selected.url} controls muted playsInline preload="metadata" aria-label={selected.title} />
        ) : (
          <div className={s.typePanel}><span>THE PROCESS, NOT JUST THE PIXELS</span><strong>{String(index+1).padStart(2,"0")}<i>.</i></strong><span>Project notes</span></div>
        )}
        {selected && <div className={s.visualCaption}><span>{selected.title}</span><span>{selected.kind==="film"?"Clip in the gallery below ↘":"Project artifact ↘"}</span></div>}
      </div>
    </div>
    <nav className={s.steps} aria-label="Story chapters">
      {beats.map((b,i)=><button
        type="button" id={id+"-beat-"+i} key={b.title} onClick={()=>setIndex(i)}
        onKeyDown={event=>keys(event,i)} aria-current={index===i?"step":undefined}
        aria-label={"Chapter "+(i+1)+": "+b.title} className={s.step} data-current={index===i}
      ><span className={s.stepLine}/><span>{String(i+1).padStart(2,"0")} · {b.kicker}</span></button>)}
    </nav>
    {reduce && <span className={s.srOnly}>Animations reduced to respect your system setting.</span>}
  </section>
}
