"use client"

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import styles from "./AlbumIntro.module.css"

// Keep the original photo, liner notes, and record artwork.
// The selection handles are decorative: the real interactions are the sleeve button and record drag.
const tracks = [
  { number: "01", name: "The designer", note: "AI-native product design, research, and a love for figuring things out." },
  { number: "02", name: "Behind the lens", note: "Photography, light, and collecting little moments." },
  { number: "03", name: "Frequent flyer", note: "Places, people, and the ones I’m still dreaming about." },
  { number: "04", name: "After hours", note: "Learning to DJ and making things just because." },
]

type DiscDrag = {
  startX: number
  startAngle: number
  lastX: number
  lastTime: number
  velocity: number
}

export function AlbumIntro() {
  const [open, setOpen] = useState(false)
  const [track, setTrack] = useState(0)
  const [scrubAngle, setScrubAngle] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [constructionRun, setConstructionRun] = useState(0)
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const drag = useRef<DiscDrag | null>(null)

  function drawSelectionFrame() {
    // Only a one-shot overlay is remounted, never the photo or CD.
    setConstructionRun(run => run + 1)
  }

  function toggleAlbum() {
    setOpen(value => !value)
    drawSelectionFrame()
  }

  function moveArtwork(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || drag.current || !stage.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const r = stage.current.getBoundingClientRect()
    const x = Math.max(-1, Math.min(1, (event.clientX - r.left) / r.width * 2 - 1))
    const y = Math.max(-1, Math.min(1, (event.clientY - r.top) / r.height * 2 - 1))
    stage.current.style.setProperty("--album-shift-x", `${x * 6}px`)
    stage.current.style.setProperty("--album-shift-y", `${y * 5}px`)
  }

  function resetArtwork() {
    stage.current?.style.setProperty("--album-shift-x", "0px")
    stage.current?.style.setProperty("--album-shift-y", "0px")
  }

  function startScrub(event: ReactPointerEvent<HTMLDivElement>) {
    if (!open || (event.pointerType === "mouse" && event.button !== 0)) return
    drag.current = {
      startX: event.clientX,
      startAngle: scrubAngle,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
    }
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveScrub(event: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    const elapsed = Math.max(12, event.timeStamp - d.lastTime)
    const instant = (event.clientX - d.lastX) / elapsed
    d.velocity = d.velocity * .65 + instant * .35
    d.lastX = event.clientX
    d.lastTime = event.timeStamp
    setScrubAngle(d.startAngle + (event.clientX - d.startX) * 1.15)
  }

  function stopScrub(event: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d) return
    drag.current = null
    setDragging(false)
    if (event.type !== "pointercancel" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const momentum = Math.max(-90, Math.min(90, d.velocity * 150))
      setScrubAngle(value => value + momentum)
    }
  }

  useEffect(() => {
    const node = stage.current
    if (!node || typeof IntersectionObserver === "undefined") return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        drawSelectionFrame()
        observer.disconnect()
      }
    }, { threshold: .55 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      if (root.current && event.target instanceof Node && !root.current.contains(event.target)) {
        setOpen(false)
      }
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
      <div
        ref={stage}
        className={styles.stage}
        data-open={open}
        data-dragging={dragging}
        onPointerEnter={drawSelectionFrame}
        onPointerMove={moveArtwork}
        onPointerLeave={resetArtwork}
        onFocusCapture={event => {
          if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
            drawSelectionFrame()
          }
        }}
      >
        <div
          className={styles.disc}
          aria-hidden="true"
          style={{ "--scrub-angle": `${scrubAngle}deg` } as CSSProperties}
          onPointerDown={startScrub}
          onPointerMove={moveScrub}
          onPointerUp={stopScrub}
          onPointerCancel={stopScrub}
        >
          <div className={styles.discTracks} />
          <div className={styles.discCenter}>
            <strong>db.</strong>
            <span>side a · 01</span>
          </div>
        </div>

        <div className={styles.artwork}>
          <button
            type="button"
            className={styles.case}
            onClick={toggleAlbum}
            aria-expanded={open}
            aria-controls="album-liner-notes"
            aria-label={open ? "Close Dhwani's album notes" : "Open Dhwani's album"}
          >
            <span className={styles.cover}>
              {/* The existing image is the cover. Preserve the actual artwork. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/photobooth/1.svg" alt="" draggable={false} width={500} height={500} />
            </span>
            <span className={styles.edge} aria-hidden="true" />
            <span className={styles.hairline} aria-hidden="true" />
          </button>

          {constructionRun > 0 && (
            <div key={constructionRun} className={styles.selectionFrame} aria-hidden="true">
              <span className={styles.selectionTop} />
              <span className={styles.selectionRight} />
              <span className={styles.selectionBottom} />
              <span className={styles.selectionLeft} />
              <span className={styles.selectionGuideX} />
              <span className={styles.selectionGuideY} />
              <span className={styles.selectionHandleTopLeft} />
              <span className={styles.selectionHandleTopRight} />
              <span className={styles.selectionHandleBottomLeft} />
              <span className={styles.selectionHandleBottomRight} />
              <span className={styles.selectionLabel}>frame / 01 · sleeve</span>
              <span className={styles.selectionCursor}>
                <svg viewBox="0 0 18 23" width="18" height="23" focusable="false">
                  <path d="M1 1v17l4.8-4.2 4 7.5 3.2-1.6-4-7.3H16Z" fill="currentColor" stroke="#000" strokeWidth="1.25" />
                </svg>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.meta}>
        <span>dhwani · vol. 01</span>
        <button type="button" onClick={toggleAlbum} aria-expanded={open} aria-controls="album-liner-notes">
          {open ? "Close liner notes" : "Read the liner notes"}
        </button>
      </div>

      <div id="album-liner-notes" className={styles.notes} data-open={open} aria-hidden={!open}>
        <div className={styles.notesHead}>
          <span>Inside the sleeve</span>
          <button type="button" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} aria-label="Close liner notes">×</button>
        </div>
        <div className={styles.tracklist} role="group" aria-label="A few things about me">
          {tracks.map((item, index) => (
            <button
              key={item.number}
              type="button"
              disabled={!open}
              tabIndex={open ? 0 : -1}
              aria-pressed={index === track}
              data-current={index === track}
              onClick={() => setTrack(index)}
            >
              <span>{item.number}</span>
              <strong>{item.name}</strong>
              <span>{index === track ? "●" : "↗"}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite">{tracks[track].note}</p>
        <a href="#work" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)}>
          Okay, show me the work ↓
        </a>
      </div>
    </aside>
  )
}
