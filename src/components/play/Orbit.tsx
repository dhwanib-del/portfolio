"use client"
// "A look into my playlist" (rebuilt from Dhwani's Framer Orbit_Showcase / Vinyl). Records sit on an
// ellipse; the one at the front grows and the center shows what's playing, with a Spotify link.
// No scroll-jacking: drag the ring, click a record, use the arrows, or ←/→ when the ring has focus.
import { animate, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type Track = { title: string; artist: string; hue: number; cover?: string; spotify?: string }

const FRONT = Math.PI // front position: left side, like the Framer version

export function Orbit({ tracks, heading = "A look into my playlist" }: { tracks: Track[]; heading?: string }) {
  const n = tracks.length
  const wrap = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 900, h: 640 })
  const [pos, setPos] = useState(0) // float index at the front
  const posRef = useRef(0)
  const reduce = useReducedMotion()
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null)
  const dragged = useRef(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const set = (v: number) => { posRef.current = v; setPos(v) }
  const goTo = (target: number) => {
    if (reduce) return set(target)
    animate(posRef.current, target, { type: "spring", stiffness: 140, damping: 22, onUpdate: set })
  }
  const step = (d: number) => goTo(Math.round(posRef.current) + d)
  const active = ((Math.round(pos) % n) + n) % n
  const t = tracks[active]
  const link = t.spotify || `https://open.spotify.com/search/${encodeURIComponent(`${t.title} ${t.artist}`)}`

  const small = size.w < 640
  const disc = small ? Math.max(76, size.w * 0.2) : Math.min(180, size.w * 0.17)
  const rx = Math.max(110, size.w / 2 - disc * 0.75)
  const ry = Math.max(90, size.h / 2 - disc * 0.7)
  const tiltRad = (small ? 0 : -18) * (Math.PI / 180)

  return (
    <section className="orbit" aria-labelledby="orbit-h">
      <div ref={wrap} className="orbit-ring" tabIndex={0} role="group" aria-roledescription="carousel" aria-label={`${heading}. Use left and right arrow keys to change track.`}
        onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowDown") { step(1); e.preventDefault() } if (e.key === "ArrowLeft" || e.key === "ArrowUp") { step(-1); e.preventDefault() } }}
        onPointerDown={(e) => { dragged.current = false; drag.current = { x: e.clientX, start: posRef.current, moved: false } }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d) return
          const dx = e.clientX - d.x
          if (Math.abs(dx) > 4) { d.moved = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
          if (d.moved) set(d.start - dx / (rx * 0.9))
        }}
        onPointerUp={() => { const d = drag.current; drag.current = null; dragged.current = !!d?.moved; if (d?.moved) goTo(Math.round(posRef.current)) }}
        onPointerCancel={() => { drag.current = null; goTo(Math.round(posRef.current)) }}>
        {tracks.map((tr, i) => {
          const a = FRONT + ((i - pos) / n) * Math.PI * 2
          const x0 = Math.cos(a) * rx, y0 = Math.sin(a) * ry
          const x = x0 * Math.cos(tiltRad) - y0 * Math.sin(tiltRad)
          const y = x0 * Math.sin(tiltRad) + y0 * Math.cos(tiltRad)
          const dist = Math.abs(((a - FRONT + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI) // 0 at front
          const s = 1 + 0.32 * Math.max(0, 1 - dist / 0.6)
          return (
            <button key={tr.title} type="button" tabIndex={-1} className="orbit-disc" aria-hidden="true"
              onClick={() => { if (!dragged.current) goTo(Math.round(posRef.current) + ((((i - Math.round(posRef.current)) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2)) }}
              style={{ width: disc, height: disc, transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${s})`, zIndex: Math.round(s * 10), "--h": tr.hue } as React.CSSProperties}>
              {tr.cover ? <img src={tr.cover} alt="" /> : <span className="orbit-label"><b>{tr.title}</b></span>}
            </button>
          )
        })}
        <div className="orbit-center">
          <h2 id="orbit-h" className="orbit-h">{heading}</h2>
          <p className="orbit-now" aria-live="polite"><span className="orbit-eq" aria-hidden="true"><i /><i /><i /><i /></span><span className="sr-only">Now showing: </span><b>{t.title}</b> · {t.artist}</p>
          <a className="orbit-spotify" href={link} target="_blank" rel="noopener noreferrer">Open in Spotify<span className="sr-only"> (opens in new tab)</span></a>
        </div>
      </div>
      <div className="orbit-ctrl">
        <span className="reel-count">{String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
        <button type="button" className="reel-arrow" aria-label="Previous track" onClick={() => step(-1)}>←</button>
        <button type="button" className="reel-arrow" aria-label="Next track" onClick={() => step(1)}>→</button>
        <span className="orbit-hint" aria-hidden="true">drag the ring or tap a record</span>
      </div>
      <ol className="sr-only" aria-label="Tracks">{tracks.map((tr) => <li key={tr.title}>{tr.title} by {tr.artist}</li>)}</ol>
    </section>
  )
}
