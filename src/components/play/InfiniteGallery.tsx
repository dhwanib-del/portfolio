"use client"
// Infinite gallery (rebuilt from Dhwani's Framer PhantomInfiniteGallery). An endless grid of tiles
// that drifts, curves at the edges, and can be dragged or thrown. Rebuilt lighter and accessible:
//  • Only the tiles on screen are rendered.
//  • Drift pauses on hover, focus and drag, has a Pause button (WCAG 2.2.2), and is off for reduced motion.
//  • Arrow keys pan when the gallery has focus; every item is also in a screen-reader list.
import { useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type Moment = { title: string; year: number; category: string; src?: string }

const ARC = (28 * Math.PI) / 180

export function InfiniteGallery({ items, label = "Gallery of moments" }: { items: Moment[]; label?: string }) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState({ w: 1000, h: 640 })
  const [cat, setCat] = useState("all")
  const [paused, setPaused] = useState(false)
  const [, force] = useState(0)
  const off = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const hover = useRef(false)
  const press = useRef<{ x: number; y: number; ox: number; oy: number; t: number; lx: number; ly: number } | null>(null)

  const cats = ["all", ...Array.from(new Set(items.map((i) => i.category)))]
  const list = cat === "all" ? items : items.filter((i) => i.category === cat)
  const cell = vp.w < 640 ? 150 : 200

  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setVp({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let raf = 0, last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      let moved = false
      if (!press.current && (Math.abs(vel.current.x) > 2 || Math.abs(vel.current.y) > 2)) {
        off.current.x += vel.current.x * dt; off.current.y += vel.current.y * dt
        const f = Math.pow(0.88, dt * 60)
        vel.current.x *= f; vel.current.y *= f
        moved = true
      } else if (!reduce && !paused && !hover.current && !press.current) {
        off.current.x -= 25 * dt; off.current.y -= 10 * dt
        moved = true
      }
      if (moved) force((n) => (n + 1) % 1e6)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce, paused])

  const pan = (dx: number, dy: number) => { off.current.x += dx; off.current.y += dy; vel.current = { x: 0, y: 0 }; force((n) => n + 1) }

  const tiles = []
  const ox = off.current.x, oy = off.current.y
  const c0 = Math.floor(-ox / cell) - 1, r0 = Math.floor(-oy / cell) - 1
  const cols = Math.ceil(vp.w / cell) + 3, rows = Math.ceil(vp.h / cell) + 3
  for (let r = r0; r < r0 + rows; r++) {
    for (let c = c0; c < c0 + cols; c++) {
      const it = list[(((c + r * 3) % list.length) + list.length) % list.length]
      const left = c * cell + ox, top = r * cell + oy
      const dx = Math.max(-1, Math.min(1, (left + cell / 2 - vp.w / 2) / (vp.w / 2)))
      const ang = dx * ARC
      const radius = vp.w / (2 * Math.sin(ARC))
      const z = -radius * (1 - Math.cos(ang))
      const idx = (((c + r * 3) % list.length) + list.length) % list.length
      tiles.push(
        <div key={`${c}:${r}`} className="ig-tile" style={{ width: cell, height: cell, transform: `translate3d(${left}px, ${top}px, ${z}px) rotateY(${(-ang * 180) / Math.PI}deg)` }}>
          <div className="ig-img" style={it.src ? { backgroundImage: `url(${it.src})` } : { background: `radial-gradient(circle at ${30 + (idx * 17) % 50}% ${35 + (idx * 23) % 40}%, hsl(${(idx * 47) % 360} 80% 55% / .55), transparent 55%), linear-gradient(160deg, hsl(${(idx * 47 + 40) % 360} 40% 18%), #0b0b0c)` }} />
          <div className="ig-cap"><span>{it.title}</span><span>{it.year}</span></div>
        </div>,
      )
    }
  }

  return (
    <section className="ig" aria-label={label}>
      <div className="ig-bar">
        <div className="ig-cats" role="group" aria-label="Filter">
          {cats.map((k) => <button key={k} type="button" className="ig-cat" aria-pressed={cat === k} onClick={() => setCat(k)}>{k}</button>)}
        </div>
        {!reduce && <button type="button" className="ig-cat" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>{paused ? "Play drift" : "Pause drift"}</button>}
      </div>
      <div ref={box} className="ig-view" tabIndex={0} role="group" aria-label={`${label}. Drag, or use the arrow keys, to explore.`}
        onPointerEnter={() => { hover.current = true }} onPointerLeave={() => { hover.current = false }}
        onFocus={() => { hover.current = true }} onBlur={() => { hover.current = false }}
        onKeyDown={(e) => {
          const m: Record<string, [number, number]> = { ArrowLeft: [cell, 0], ArrowRight: [-cell, 0], ArrowUp: [0, cell], ArrowDown: [0, -cell] }
          if (m[e.key]) { pan(...m[e.key]); e.preventDefault() }
        }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
          press.current = { x: e.clientX, y: e.clientY, ox: off.current.x, oy: off.current.y, t: performance.now(), lx: e.clientX, ly: e.clientY }
          vel.current = { x: 0, y: 0 }
        }}
        onPointerMove={(e) => {
          const p = press.current
          if (!p) return
          const now = performance.now(), dt = Math.max(0.001, (now - p.t) / 1000)
          vel.current = { x: Math.max(-2500, Math.min(2500, (e.clientX - p.lx) / dt)), y: Math.max(-2500, Math.min(2500, (e.clientY - p.ly) / dt)) }
          p.t = now; p.lx = e.clientX; p.ly = e.clientY
          off.current = { x: p.ox + e.clientX - p.x, y: p.oy + e.clientY - p.y }
          force((n) => n + 1)
        }}
        onPointerUp={() => { press.current = null; if (reduce) vel.current = { x: 0, y: 0 } }}
        onPointerCancel={() => { press.current = null }}>
        <div className="ig-stage">{tiles}</div>
        <div className="ig-vignette" aria-hidden="true" />
      </div>
      <ul className="sr-only">{items.map((i) => <li key={i.title}>{i.title}, {i.year}</li>)}</ul>
    </section>
  )
}
