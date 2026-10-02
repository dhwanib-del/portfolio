"use client"
// "Tidbits of my work" drag canvas (rebuilt from the live Framer Lab page). A big board you pan
// around; project cards are scattered on it. Accessible: cards are real links in tab order, and
// focusing one pans the board to it. "Recenter" resets. Dragging is optional.
import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type Tidbit = { title: string; cta: string; href?: string; x: number; y: number; w: number; h: number; tilt: number; hue: number; cover?: string }

const BOARD = 3000

export function DragCanvas({ items, title = "Tidbits of my Work", tagline = "DESIGN WITH INTENTION" }: { items: Tidbit[]; title?: string; tagline?: string }) {
  const view = useRef<HTMLDivElement>(null)
  const [vp, setVp] = useState({ w: 1200, h: 720 })
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const reduce = useReducedMotion()
  const dragged = useRef(false)
  const scale = vp.w < 640 ? 0.7 : 1

  const centerOn = (px: number, py: number, instant = false) => {
    const tx = Math.min(0, Math.max(vp.w - BOARD * scale, vp.w / 2 - px * scale))
    const ty = Math.min(0, Math.max(vp.h - BOARD * scale, vp.h / 2 - py * scale))
    if (instant || reduce) { x.set(tx); y.set(ty); return }
    animate(x, tx, { type: "spring", stiffness: 120, damping: 22 })
    animate(y, ty, { type: "spring", stiffness: 120, damping: 22 })
  }

  useEffect(() => {
    const el = view.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setVp({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { centerOn(BOARD * 0.5, BOARD * 0.48, true) }, [vp.w, vp.h])

  return (
    <section className="dc" aria-labelledby="dc-h">
      <div className="dc-bar">
        <p className="eyebrow" id="dc-h">{title}</p>
        <button type="button" className="btn" onClick={() => centerOn(BOARD * 0.5, BOARD * 0.48)}>Recenter</button>
      </div>
      <div ref={view} className="dc-view">
        <motion.div className="dc-board" drag dragMomentum={!reduce}
          onDragStart={() => { dragged.current = true }} onDragEnd={() => { setTimeout(() => { dragged.current = false }, 60) }}
          onClickCapture={(e) => { if (dragged.current) { e.preventDefault(); e.stopPropagation() } }}
          dragConstraints={{ left: vp.w - BOARD * scale, right: 0, top: vp.h - BOARD * scale, bottom: 0 }}
          style={{ x, y, width: BOARD, height: BOARD, scale, transformOrigin: "0 0" }}>
          <div className="dc-center" aria-hidden="true" style={{ left: "50%", top: "50%" }}>
            <div className="dc-sticky" />
            <p className="dc-title">{title}</p>
            <p className="dc-tag">{tagline}</p>
          </div>
          {items.map((it) => {
            const Tag = it.href ? "a" : "div"
            const ext = it.href?.startsWith("http")
            return (
              <Tag key={it.title} className="dc-card" {...(it.href ? { href: it.href, ...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {}) } : { tabIndex: 0 })}
                onFocus={() => centerOn((it.x / 100) * BOARD, (it.y / 100) * BOARD)}
                onDragStart={(e: React.DragEvent) => e.preventDefault()}
                style={{ left: `${it.x}%`, top: `${it.y}%`, width: it.w, height: it.h, transform: `translate(-50%, -50%) rotate(${it.tilt}deg)`, "--h": it.hue } as React.CSSProperties}>
                {it.cover ? <img src={it.cover} alt="" draggable={false} /> : <span className="dc-ph" aria-hidden="true" />}
                <span className="dc-cta">{it.cta}{ext && <span className="sr-only"> (opens in new tab)</span>}</span>
              </Tag>
            )
          })}
        </motion.div>
      </div>
      <p className="dc-hint">Drag the board to look around, or tab through the projects.</p>
    </section>
  )
}
