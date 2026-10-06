"use client"

import { useState } from "react"
import styles from "./PhotoBooth.module.css"

const photos = [
  { src: "/photobooth/1.svg", alt: "Dhwani smiling by a window overlooking the city" },
  { src: "/photobooth/2.svg", alt: "Dhwani with her family" },
  { src: "/photobooth/3.svg", alt: "Dhwani posing by the city window" },
]

export function PhotoBooth() {
  const [print, setPrint] = useState(0)
  const [printing, setPrinting] = useState(false)

  return (
    <aside className={styles.booth} aria-label="Dhwani’s photo-strip printer">
      <div className={styles.machine}>
        <div className={styles.top}>
          <span className={styles.screw} aria-hidden="true" />
          <div className={styles.controls}><span className={styles.light} aria-hidden="true" /><button type="button" className={styles.button} aria-label="Print again" onClick={() => { setPrint((p) => p + 1); setPrinting(true) }}>↻</button></div>
          <span className={styles.brand} aria-hidden="true">PHOTO / 03</span>
          <span className={styles.screw} aria-hidden="true" />
        </div>
        <div className={styles.slot} aria-hidden="true" />
        <div className={styles.feed}>
          <div key={print} className={`${styles.strip} ${printing ? styles.printing : ""}`} onAnimationEnd={() => setPrinting(false)}>
            {photos.map((photo) => (
              // Local SVGs contain optimized copies of the existing live-site photographs.
              // eslint-disable-next-line @next/next/no-img-element
              <img key={photo.src} src={photo.src} alt={photo.alt} width={280} height={210} draggable={false} />
            ))}
            <span className={styles.caption}>DHWANI · VOL. 01</span>
          </div>
        </div>
      </div>
      <span className={styles.note} aria-hidden="true">fresh off the press ↗</span>
      <span className={styles.status} role="status">{print > 0 ? "Another little strip, coming right up." : "Three moments. One strip."}</span>
    </aside>
  )
}
