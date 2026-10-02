"use client"
// Case-study scenes, rebuilt from Dhwani's Framer ClaimScene, DecisionCard, StatMoment and
// CaseStudyVideo. Same look, smaller code, theme tokens (light + dark), reduced-motion safe.
import { useEffect, useRef, useState } from "react"

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(true)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, shown] as const
}

/** One sentence at display size. `emphasis` renders in the accent color. */
export function Claim({ pre = "", emphasis, post = "" }: { pre?: string; emphasis: string; post?: string }) {
  const [ref, shown] = useReveal<HTMLParagraphElement>()
  return (
    <p ref={ref} className={`claim reveal${shown ? " in" : ""}`}>
      {pre}<span className="claim-em">{emphasis}</span>{post}
    </p>
  )
}

/** Tension → decision → why → the alternative I rejected. */
export function Decision({ tension, decision, why, rejected }: { tension: string; decision: string; why: string; rejected?: string }) {
  const [ref, shown] = useReveal<HTMLElement>()
  return (
    <section ref={ref} className={`decision reveal${shown ? " in" : ""}`}>
      <p className="decision-t">{tension}</p>
      <h3 className="decision-d">{decision}</h3>
      <p className="decision-w">{why}</p>
      {rejected && (
        <p className="decision-r"><span>Rejected</span> <s>{rejected}</s></p>
      )}
    </section>
  )
}

/** Big numbers that count up once when scrolled into view. Only use real numbers. */
export function Stats({ items }: { items: { value: number; prefix?: string; suffix?: string; label: string }[] }) {
  const [ref, shown] = useReveal<HTMLDListElement>()
  return (
    <dl ref={ref} className="stats">
      {items.map((s) => <Stat key={s.label} {...s} run={shown} />)}
    </dl>
  )
}
function Stat({ value, prefix = "", suffix = "", label, run }: { value: number; prefix?: string; suffix?: string; label: string; run: boolean }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!run) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(value)
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 1400)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [run, value])
  return (
    <div className="stat">
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="stat-n" aria-hidden="true"><em>{prefix}</em>{n.toLocaleString()}<em>{suffix}</em></span>
        <span className="sr-only">{prefix}{value.toLocaleString()}{suffix}</span>
        <span className="stat-l" aria-hidden="true">{label}</span>
      </dd>
    </div>
  )
}

/** Autoplaying clip: muted, loops, plays only while on screen; controls under reduced motion. */
export function CaseVideo({ src, caption, label = "Video coming soon" }: { src?: string; caption?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reduced, setReduced] = useState(false)
  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), [])
  useEffect(() => {
    const v = ref.current
    if (!v || reduced) return
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 })
    io.observe(v)
    return () => io.disconnect()
  }, [src, reduced])
  return (
    <figure className="cvideo">
      <div className="cvideo-frame">
        {src ? (
          <video ref={ref} src={src} muted loop playsInline controls={reduced} preload="metadata" aria-label={caption || label} />
        ) : (
          <div className="cvideo-ph"><span aria-hidden className="cvideo-play">▶</span><span>{label}</span></div>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
