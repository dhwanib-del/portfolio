"use client"
import {useState} from "react"
import Image from "next/image"
import styles from "./ScreenStory.module.css"

export type StoryScreen={src?:string;alt:string;caption:string;chapter:string;reviewRequired?:boolean}
export function ScreenStory({title,screens}:{title:string;screens:StoryScreen[]}){
 const [active,setActive]=useState(0)
 if(!screens.length)return null
 const current=screens[Math.min(active,screens.length-1)]
 return <section className={styles.wrap} aria-label={title}>
  <div className={styles.heading}><span>THE PRODUCT / SCREEN EXPLORER</span><h2>{title}</h2><p>Explore the screens, one product decision at a time.</p></div>
  <div className={styles.layout}>
   <div className={styles.stage}>
    {current.src?<a href={current.src} target="_blank" rel="noopener noreferrer" aria-label={"Open full-size screen: "+current.alt}><Image src={current.src} alt={current.alt} width={1600} height={1000} sizes="(max-width:900px) 100vw, 900px" style={{width:"100%",height:"auto"}}/></a>:<div className={styles.empty}><span>SCREEN SLOT / {String(active+1).padStart(2,"0")}</span><strong>{current.alt}</strong><p>Original Figma export pending. This slot is ready for a real screen; no fabricated interface is shown.</p></div>}
    {current.reviewRequired&&<span className={styles.review}>Internal-work asset · publication clearance required</span>}
   </div>
   <div className={styles.details}><span className={styles.counter}>{String(active+1).padStart(2,"0")} / {String(screens.length).padStart(2,"0")}</span><h3>{current.chapter}</h3><p>{current.caption}</p><div className={styles.options}>{screens.map((s,i)=><button key={s.alt+i} aria-pressed={active===i} className={active===i?styles.active:styles.option} onClick={()=>setActive(i)}><span>{String(i+1).padStart(2,"0")}</span><strong>{s.chapter}</strong></button>)}</div></div>
  </div>
 </section>
}
