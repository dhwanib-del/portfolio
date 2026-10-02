"use client"
// "The Journey" (rebuilt from Dhwani's Framer FilmTimeline/GlassTimeline): glass chapter cards in a
// row; the active one is sharp, the rest dim. Arrows, ←/→ keys, drag or click a card to move.
// Accessible: real buttons, aria-current on the active chapter, counter as text, reduced motion.
import { motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

export type Chapter = { year: string; label: string; title: string; text: string; place: string; image?: string }

export const CHAPTERS: Chapter[] = [
  { year: "2021", label: "The beginning", title: "Psychology changed how I see.", text: "I got obsessed with behavior, motivation, and the invisible forces behind everyday decisions.", place: "Michigan State University" },
  { year: "2024", label: "The shift", title: "Research became a design tool.", text: "Interviews, experiments and eye-tracking studies slowly turned into product questions.", place: "Research + human behavior" },
  { year: "2025", label: "A new lens", title: "Bangalore to Ann Arbor.", text: "I moved deeper into UX research and interaction design at the University of Michigan.", place: "University of Michigan" },
  { year: "2026", label: "Current frame", title: "Designing for high-stakes work.", text: "Tools for people working under pressure, with incomplete information, inside complex systems.", place: "U-M DPSS · GM · Prime Video" },
]

export function Journey({ chapters = CHAPTERS }: { chapters?: Chapter[] }) {
  const [i, setI] = useState(0)
  const reduce = useReducedMotion()
  const go = (n: number) => setI(Math.max(0, Math.min(chapters.length - 1, n)))
  const W = 460, GAP = 32

  return (
    <section className="journey" aria-labelledby="journey-h"
      onKeyDown={(e) => { if (e.key === "ArrowRight") { go(i + 1); e.preventDefault() } if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault() } }}>
      <div className="container journey-head">
        <div>
          <p className="eyebrow">selected moments · still becoming</p>
          <h2 id="journey-h" className="journey-h">The Journey</h2>
        </div>
        <div className="reel-ctrl">
          <span className="reel-count" aria-live="polite">{String(i + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</span>
          <button type="button" className="reel-arrow" aria-label="Previous chapter" disabled={i === 0} onClick={() => go(i - 1)}>←</button>
          <button type="button" className="reel-arrow" aria-label="Next chapter" disabled={i === chapters.length - 1} onClick={() => go(i + 1)}>→</button>
        </div>
      </div>
      <div className="journey-stage">
        <motion.ol className="journey-track"
          drag={reduce ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15}
          onDragEnd={(_, info) => { if (Math.abs(info.offset.x) > 60) go(i + (info.offset.x < 0 ? 1 : -1)) }}
          animate={{ x: -i * (W + GAP) }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 150, damping: 25 }}
          style={{ gap: GAP, left: `calc(50% - min(${W / 2}px, 42vw))` }}>
          {chapters.map((c, k) => (
            <li key={c.year + k}>
              <button type="button" className="journey-card" aria-current={k === i ? "step" : undefined} onClick={() => go(k)}
                style={{ transform: `scale(${k === i ? 1 : 0.92})` }}>
                <div className="journey-img">
                  {c.image ? <img src={c.image} alt="" /> : <div className="journey-ph" />}
                  <span className="journey-label">{c.label}</span>
                  <span className="journey-year">{c.year}</span>
                </div>
                <span className="journey-ch">Chapter {String(k + 1).padStart(2, "0")}</span>
                <span className="journey-title">{c.title}</span>
                <span className="journey-text">{c.text}</span>
                <span className="journey-place">{c.place}</span>
              </button>
            </li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
