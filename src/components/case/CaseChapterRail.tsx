"use client"

import { useEffect, useState } from "react"
import s from "./CaseChapterRail.module.css"

export type Chapter = { id: string; label: string }

export function CaseChapterRail({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const targets=chapters.map(c=>document.getElementById(c.id)).filter((el):el is HTMLElement=>!!el)
    if(!targets.length || typeof IntersectionObserver==="undefined")return
    const observer = new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)
      if(!visible.length)return
      const id=visible[0].target.id
      const next=chapters.findIndex(c=>c.id===id)
      if(next!==-1)setActive(next)
    },{rootMargin:"-12% 0px -63% 0px",threshold:0})
    targets.forEach(el=>observer.observe(el))
    return ()=>observer.disconnect()
  },[chapters])
  if(!chapters.length)return null
  return <nav className={s.rail} aria-label="Case study chapters">
    <div className={s.top}>ON THIS PAGE <span aria-hidden="true">↘</span></div>
    <ol>
      {chapters.map((c,index)=><li key={c.id}><a href={`#${c.id}`} aria-current={active===index?"location":undefined} title={c.label}>
        <span className={s.indicator} aria-hidden="true"/>
        <span className={s.num}>{String(index+1).padStart(2,"0")}</span>
        <span className={s.label}>{c.label}</span>
      </a></li>)}
    </ol>
    <span className={s.bottom}>{String(active+1).padStart(2,"0")} <span>/</span> {String(chapters.length).padStart(2,"0")}</span>
  </nav>
}
