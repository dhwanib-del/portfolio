"use client"
import { useState } from "react"
import { PhotoBooth } from "./PhotoBooth"
import styles from "./PhotoArchive.module.css"
const photos = [
 {src:"/photobooth/1.svg",caption:"A window, a city, a little pause.",alt:"Dhwani by a city window"},
 {src:"/photobooth/2.svg",caption:"A frame with my family.",alt:"Dhwani with her family"},
 {src:"/photobooth/3.svg",caption:"One more for the strip.",alt:"Dhwani posing by the window"},
]
export function PhotoArchive() {
 const [picked,setPicked]=useState<number|null>(null)
 return <section className={`container ${styles.archive}`} aria-labelledby="archive-title">
 <div className={styles.heading}><div><p className="eyebrow">the photo archive</p><h2 id="archive-title" className="h2">A little paper trail.</h2></div><button type="button" onClick={()=>setPicked(null)} data-cursor="Tidying the archive">Tidy up ↻</button></div>
 <p className={styles.hint}>Pick up a photo to read its caption.</p>
 <div className={styles.desk}><div className={styles.printer}><PhotoBooth /></div>
 <div className={styles.stack}>{photos.map((photo,i)=><button key={photo.src} type="button" className={`${styles.photo} ${picked===i?styles.picked:""}`} aria-pressed={picked===i} aria-label={`Pick up photo: ${photo.alt}`} onClick={()=>setPicked(picked===i?null:i)} data-cursor="Photo archive"><span className={styles.clip} aria-hidden="true">⌇</span>
 {/* Existing live-site photos, locally embedded in SVG. */}
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src={photo.src} alt={photo.alt} width="280" height="210" draggable={false}/><span>{picked===i?photo.caption:"pick me up ↗"}</span></button>)}</div></div>
 <p className={styles.hint} role="status">{picked===null?"Three moments, back in place.":photos[picked].caption}</p>
 </section>
}
