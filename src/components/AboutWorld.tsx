"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import photos from "@/content/gallery.json"
import styles from "./AboutWorld.module.css"

type Side = "designer" | "dj" | "off"
type Photo = (typeof photos)[number]
const sides: {id: Side; label: string}[] = [
  {id:"designer",label:"designer"},
  {id:"dj",label:"DJ in progress"},
  {id:"off",label:"off the clock"},
]
function SideIcon({side}:{side:Side}) {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{side==="designer"?<><path d="m15 4 5 5-11 11-6 1 1-6Z"/><path d="m13 6 5 5"/></>:side==="dj"?<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 6a6 6 0 0 1 6 6M6 12a6 6 0 0 0 6 6"/></>:<><path d="M3 7h4l2-3h6l2 3h4v13H3Z"/><circle cx="12" cy="13" r="4"/></>}</svg>
}
const notes = {
  designer: {title:"Observe. Connect. Question.",body:"I look at the task, make sense of the evidence, then prototype the choices worth testing.",href:"#how-i-work",link:"See the project examples ↓"},
  dj: {title:"Still learning this one.",body:"I’m learning to DJ. My playlist is another place I like to experiment.",href:"#playlist",link:"Open my playlist ↓"},
  off: {title:"A few frames from my world.",body:"Travel, music, food and the little things outside the canvas.",href:"/lab",link:"Take a detour through AI Lab ↗"},
}

export function AboutWorld() {
  const [side,setSide] = useState<Side>("off")
  const [order,setOrder] = useState(photos)
  const [opened,setOpened] = useState<Photo | "world" | null>(null)
  const [announcement,setAnnouncement] = useState("")
  const rail = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const drag = useRef<{x:number;left:number;moved:boolean} | null>(null)
  const note = notes[side]

  useEffect(()=>{
    if(opened && !dialog.current?.open) dialog.current?.showModal()
  },[opened])

  function shuffle() {
    setOrder(current=>{
      const next=[...current]
      for(let i=next.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[next[i],next[j]]=[next[j],next[i]]}
      return next
    })
    rail.current?.scrollTo({left:0})
    setAnnouncement("Wall shuffled. All 15 photos are still here.")
  }

  function tile(photo: Photo) {
    const spot = side==="dj" && (photo.title==="DJ" || photo.title==="Music") || side==="designer" && photo.title.includes("Graduated")
    return <button type="button" key={photo.src} className={`${styles.tile} ${spot?styles.spotlight:""}`} onClick={()=>setOpened(photo)} aria-label={`Enlarge photo: ${photo.title}`}>
      {/* Original cleared public gallery assets, downloaded from Dhwani's live About page. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt={photo.title} width={300} height={240} loading="lazy" draggable={false}/>
      <span className={styles.caption}><span>{photo.title}</span><span>{photo.year}</span></span>
      <span className={styles.enlarge} aria-hidden="true">↗</span>
    </button>
  }

  return <section className={styles.hero} aria-labelledby="about-title">
    <div className={styles.intro}>
      <p className="eyebrow">about, but make it personal</p>
      <h1 id="about-title">Designer.<br/><em>Dhwani.</em></h1>
      <p className={styles.bio}>I study UX research and design at the University of Michigan. I turn complicated workflows into clearer choices.</p>
      <p className={styles.meta}>UMSI · May 2027</p>
      <p className={styles.pick}>Pick a side of me</p>
      <div className={styles.sides} role="group" aria-label="Explore a side of Dhwani">{sides.map(s=><button type="button" key={s.id} aria-pressed={side===s.id} onClick={()=>{
        setSide(s.id)
        const title=s.id==="dj"?"DJ":s.id==="designer"?"Graduated from Michigan State University":null
        const target=title?rail.current?.querySelector<HTMLButtonElement>(`button[aria-label="Enlarge photo: ${title}"]`):null
        if(target && rail.current) rail.current.scrollTo({left:Math.max(0,target.offsetLeft-rail.current.clientWidth/2+target.clientWidth/2),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})
      }}><span><SideIcon side={s.id}/></span>{s.label}</button>)}</div>
      <div className={styles.note} aria-live="polite"><h2>{note.title}</h2><p>{note.body}</p><a href={note.href} onClick={()=>{if(side==="dj"){const playlist=document.getElementById("playlist");if(playlist instanceof HTMLDetailsElement)playlist.open=true}}}>{note.link}</a></div>
      <div className={styles.links}><Link href="/#work">Explore my work ↗</Link><Link href="/#contact">Say hi ↗</Link></div>
    </div>
    <div className={styles.wall}>
      <div ref={rail} className={styles.rail} tabIndex={0} aria-label="Photo wall. Swipe, drag with a mouse, or use arrow keys to explore. Select a photo to enlarge."
        onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==="ArrowRight" || e.key==="ArrowLeft"){e.preventDefault();e.currentTarget.scrollLeft+=e.key==="ArrowRight"?220:-220}}}
        onPointerDown={e=>{if(e.pointerType!=="mouse"||e.button!==0)return;drag.current={x:e.clientX,left:e.currentTarget.scrollLeft,moved:false}}}
        onPointerMove={e=>{const d=drag.current;if(!d)return;const dx=e.clientX-d.x;if(Math.abs(dx)>8){d.moved=true;e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.scrollLeft=d.left-dx}}}
        onPointerUp={()=>{if(drag.current && !drag.current.moved)drag.current=null}}
        onPointerCancel={()=>{drag.current=null}}
        onClickCapture={e=>{if(drag.current?.moved){e.preventDefault();e.stopPropagation()}drag.current=null}}
        ><div className={styles.grid}>{order.map(tile)}</div></div>
      <div className={styles.controls}><span>Drag to wander · tap to look closer</span><div><button type="button" onClick={shuffle}>Shuffle the wall ↻</button><button type="button" onClick={()=>setOpened("world")}>Open my world ↗</button></div></div>
      <span className="sr-only" role="status">{announcement}</span>
    </div>
    <dialog ref={dialog} className={styles.dialog} onClose={()=>setOpened(null)} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}} aria-labelledby="world-dialog-title">
      <div className={styles.dialogHeader}><h2 id="world-dialog-title">{opened==="world"?"A few frames from my world":opened?.title}</h2><button type="button" onClick={()=>dialog.current?.close()} aria-label="Close gallery">Close ×</button></div>
      {opened==="world"?<div className={styles.fullGrid}>{order.map(tile)}</div>:opened?<figure className={styles.fullPhoto}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={opened.src} alt={opened.title}/><figcaption>{opened.title} · {opened.year}</figcaption>
      </figure>:null}
    </dialog>
  </section>
}
