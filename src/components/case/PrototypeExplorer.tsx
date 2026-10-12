"use client"
import { useEffect, useState } from "react"
import Image from "next/image"
import styles from "./PrototypeExplorer.module.css"

type Screen = { src:string; alt:string; caption:string }
type Props = { title:string; screens?:Screen[]; prototypeUrl?:string; note?:string }
export function PrototypeExplorer({title,screens=[],prototypeUrl,note}:Props){
 const [mode,setMode]=useState<"screens"|"prototype">("screens")
 const [selected,setSelected]=useState(0)
 const [zoom,setZoom]=useState(false)
 const [scale,setScale]=useState(1)
 const [embed,setEmbed]=useState(false)
 const screen=screens[selected]
 useEffect(()=>{
  if(!zoom)return
  const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setZoom(false);if(e.key==="ArrowRight")setSelected(i=>(i+1)%screens.length);if(e.key==="ArrowLeft")setSelected(i=>(i+screens.length-1)%screens.length)}
  document.addEventListener("keydown",key)
  const prev=document.body.style.overflow
  document.body.style.overflow="hidden"
  return()=>{document.removeEventListener("keydown",key);document.body.style.overflow=prev}
 },[zoom,screens.length])
 const safePrototype=prototypeUrl&&/^https:\/\/(www\.)?figma\.com\/(proto|design)\//.test(prototypeUrl)?prototypeUrl:undefined
 const embedUrl=safePrototype?"https://www.figma.com/embed?embed_host=share&url="+encodeURIComponent(safePrototype):undefined
 return <section className={styles.wrap} aria-label={title}>
  <div className={styles.top}><div><span className={styles.kicker}>THE EXPERIENCE / INTERACTIVE WALKTHROUGH</span><h2>{title}</h2><p>{note||"Explore original screens, zoom into the details, or try the clickable prototype."}</p></div><div className={styles.tabs} aria-label="Viewer mode">{screens.length>0&&<button aria-pressed={mode==="screens"} onClick={()=>setMode("screens")}>Inspect screens</button>}{safePrototype&&<button aria-pressed={mode==="prototype"} onClick={()=>{setMode("prototype");setEmbed(false)}}>Try prototype ↗</button>}</div></div>
  {mode==="screens"&&screen&&<div className={styles.viewer}><div className={styles.screen}><button type="button" className={styles.zoomTrigger} onClick={()=>{setZoom(true);setScale(1)}} aria-label={"Zoom into "+screen.alt}><Image src={screen.src} alt={screen.alt} width={1600} height={1000} sizes="(max-width:800px) 100vw, 920px" style={{width:"100%",height:"auto"}}/><span>＋ Zoom into screen</span></button></div><aside className={styles.side}><span className={styles.count}>{String(selected+1).padStart(2,"0")} / {String(screens.length).padStart(2,"0")}</span><h3>{screen.alt}</h3><p>{screen.caption}</p><div className={styles.picks}>{screens.map((item,i)=><button key={item.src} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{String(i+1).padStart(2,"0")}</span>{item.alt}</button>)}</div><span className={styles.hint}>Click the screen to enlarge. Use arrow keys in zoom mode.</span></aside></div>}
  {mode==="prototype"&&safePrototype&&<div className={styles.prototype}><div className={styles.bar}><span><i/> INTERACTIVE FIGMA PROTOTYPE</span><a href={safePrototype} target="_blank" rel="noopener noreferrer">Open in Figma ↗</a></div>{embed?<iframe src={embedUrl} title={title+" interactive Figma prototype"} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:<div className={styles.start}><span>YOUR TURN</span><h3>Try the experience yourself.</h3><p>Follow the clickable flow to understand the navigation and interaction decisions. If the embed can't load, open the original prototype instead.</p><button onClick={()=>setEmbed(true)}>Launch prototype →</button></div>}</div>}
  {zoom&&screen&&<div className={styles.overlay} role="dialog" aria-modal="true" aria-label={"Inspect "+screen.alt}><div className={styles.overlayBar}><span>{screen.alt}</span><div><button onClick={()=>setScale(s=>Math.max(1,Math.round((s-.25)*100)/100))} aria-label="Zoom out">−</button><span>{Math.round(scale*100)}%</span><button onClick={()=>setScale(s=>Math.min(3,Math.round((s+.25)*100)/100))} aria-label="Zoom in">＋</button><button onClick={()=>setZoom(false)} aria-label="Close zoom viewer">✕</button></div></div><div className={styles.zoomCanvas}><img src={screen.src} alt={screen.alt} style={{transform:`scale(${scale})`}}/></div><div className={styles.overlayFooter}><button onClick={()=>{setSelected(i=>(i+screens.length-1)%screens.length);setScale(1)}}>← Previous</button><span>{selected+1} of {screens.length}</span><button onClick={()=>{setSelected(i=>(i+1)%screens.length);setScale(1)}}>Next →</button></div></div>}
 </section>
}