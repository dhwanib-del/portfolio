"use client"
// Polaroid scroll (rebuilt from Dhwani's Framer PolaroidScroll + PhotoColumn): her own photos drift
// across a pinned stage as you scroll, each with a handwritten caption. Shows nothing until real
// photos are added (no stock images). Reduced motion: a simple tilted grid.
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { useRef } from "react"

export type Photo = { src: string; alt: string; caption: string }

const PATHS = [[-70, 20, 75, -18], [55, 65, -45, -70], [78, -16, -78, 20], [-48, -68, 54, 70], [-54, 66, 45, -68], [48, -70, -55, 70]]

function Card({ p, tilt }: { p: Photo; tilt: number }) {
  return (
    <figure className="polaroid" style={{ transform: `rotate(${tilt}deg)` }}>
      <img src={p.src} alt={p.alt} loading="lazy" />
      <figcaption>{p.caption}</figcaption>
    </figure>
  )
}

function Moving({ p, k, n, progress }: { p: Photo; k: number; n: number; progress: MotionValue<number> }) {
  const c = n <= 1 ? 0.5 : 0.1 + (0.8 * k) / (n - 1)
  const s = Math.max(0.001, c - 0.2), e = Math.min(0.999, c + 0.2)
  const [fx, fy, tx, ty] = PATHS[k % PATHS.length]
  const x = useTransform(progress, [s, c, e], [`${fx}vw`, "0vw", `${tx}vw`])
  const y = useTransform(progress, [s, c, e], [`${fy}vh`, "0vh", `${ty}vh`])
  const opacity = useTransform(progress, [s, s + 0.08, e - 0.08, e], [0, 1, 1, 0])
  return (
    <motion.div className="polaroid-move" style={{ x, y, opacity, zIndex: k + 1 }}>
      <div style={{ transform: "translate(-50%,-50%)" }}><Card p={p} tilt={k % 2 ? 5 : -5} /></div>
    </motion.div>
  )
}

export function Polaroids({ photos, title = "Off the clock" }: { photos: Photo[]; title?: string }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  if (!photos.length) return null

  if (reduce) {
    return (
      <section className="section container" aria-label={title}>
        <h2 className="h2">{title}</h2>
        <div className="polaroid-grid">{photos.map((p, k) => <Card key={p.src} p={p} tilt={k % 2 ? 3 : -3} />)}</div>
      </section>
    )
  }
  return (
    <section ref={ref} className="polaroid-scroll" style={{ height: `${120 + photos.length * 60}vh` }} aria-label={title}>
      <div className="polaroid-stage">
        <h2 className="h2 polaroid-title">{title}</h2>
        {photos.map((p, k) => <Moving key={p.src} p={p} k={k} n={photos.length} progress={scrollYProgress} />)}
      </div>
    </section>
  )
}
