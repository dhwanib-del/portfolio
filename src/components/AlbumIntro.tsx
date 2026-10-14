"use client"

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import styles from "./AlbumIntro.module.css"

// Intro stays compact: the case is a photo, the CD is the interaction.
// No made-up album image, no photo replacement, and no layout reflow when notes open.
const tracks = [
  { number: "01", name: "The designer", note: "AI-native product design, research, and a love for figuring things out." },
  { number: "02", name: "Behind the lens", note: "Photography, light, and collecting little moments." },
  { number: "03", name: "Frequent flyer", note: "Places, people, and the ones I’m still dreaming about." },
  { number: "04", name: "After hours", note: "Learning to DJ and making things just because." },
]

export function AlbumIntro() {
  const [open, setOpen] = useState(false)
  const [track, setTrack] = useState(0)
  const root = useRef<HTMLElement>(null)
  const [scrubAngle, setScrubAngle] = useState(0)
  const drag = useRef<{ startX: number; startAngle: number } | null>(null)

  function startScrub(event: ReactPointerEvent<HTMLDivElement>) {
    if (!open || event.pointerType === "mouse" && event.button !== 0) return
    drag.current = { startX: event.clientX, startAngle: scrubAngle }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  function moveScrub(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    setScrubAngle(drag.current.startAngle + (event.clientX - drag.current.startX) * 1.15)
  }
  function stopScrub() { drag.current = null }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      if (root.current && event.target instanceof Node && !root.current.contains(event.target)) setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onPointer)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  return (
    <aside ref={root} className={styles.root} aria-label="Dhwani's personal debut album">
      <div className={styles.stage} data-open={open}>
        <div className={styles.disc} aria-hidden="true" style={{ "--scrub-angle": `${scrubAngle}deg` } as CSSProperties} onPointerDown={startScrub} onPointerMove={moveScrub} onPointerUp={stopScrub} onPointerCancel={stopScrub}>
          <div className={styles.discTracks}/>
          <div className={styles.discCenter}><strong>db.</strong><span>side a · 01</span></div>
        </div>
        <button type="button" className={styles.case} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="album-liner-notes" aria-label={open ? "Close Dhwani's album notes" : "Open Dhwani's album"}>
          <span className={styles.cover}>
            {/* Local photo is the complete artwork: no graphics or text overlays. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/photobooth/1.svg" alt="" draggable={false} width={500} height={500}/>
          </span>
          <span className={styles.edge} aria-hidden="true"/>
          <span className={styles.hairline} aria-hidden="true"/>
        </button>
      </div>
      <div className={styles.meta}>
        <span>dhwani · vol. 01</span>
        <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls="album-liner-notes">
          {open ? "Close ↖" : "Read the liner notes"}
        </button>
      </div>
      <div id="album-liner-notes" className={styles.notes} data-open={open} aria-hidden={!open}>
        <div className={styles.notesHead}><span>Inside the sleeve</span><button type="button" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} aria-label="Close liner notes">×</button></div>
        <div className={styles.tracklist} role="group" aria-label="A few things about me">
          {tracks.map((item,index) => <button type="button" disabled={!open} tabIndex={open ? 0 : -1} aria-pressed={index===track} data-current={index===track} key={item.number} onClick={() => setTrack(index)}>
            <span>{item.number}</span><strong>{item.name}</strong><span>{index===track ? "●" : "↗"}</span>
          </button>)}
        </div>
        <p aria-live="polite">{tracks[track].note}</p>
        <a href="#work" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>Okay, show me the work ↓</a>
      </div>
    </aside>
  )
}
