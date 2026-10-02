"use client"
// Work reel (brandonux.design-style). Desktop + motion allowed: section pins and vertical scroll
// slides the cards sideways, with 01/06 and ← →. Reduced motion: sideways scroller with arrows.
// Phones: vertical stack. Each card is one real link; tabbing to an off-screen card brings it in.
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import type { Project } from "@/content/site"

const pad = (n: number) => (n < 10 ? "0" + n : String(n))

export function WorkReel({ projects, eyebrow, heading }: { projects: Project[]; eyebrow: string; heading: string }) {
  const outer = useRef<HTMLDivElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLOListElement>(null)
  const [mode, setMode] = useState<"pin" | "row" | "stack">("stack")
  const [dist, setDist] = useState(0)
  const [x, setX] = useState(0)
  const [index, setIndex] = useState(0)
  const n = projects.length

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)")
    const wide = window.matchMedia("(min-width: 900px)")
    const pick = () => setMode(!wide.matches ? "stack" : rm.matches ? "row" : "pin")
    pick()
    rm.addEventListener("change", pick)
    wide.addEventListener("change", pick)
    return () => { rm.removeEventListener("change", pick); wide.removeEventListener("change", pick) }
  }, [])

  useEffect(() => {
    if (mode !== "pin") return
    const measure = () => { if (track.current && view.current) setDist(Math.max(0, track.current.scrollWidth - view.current.clientWidth)) }
    measure()
    const ro = new ResizeObserver(measure)
    if (track.current) ro.observe(track.current)
    return () => ro.disconnect()
  }, [mode])

  useEffect(() => {
    if (mode !== "pin") return
    let raf = 0
    const run = () => {
      raf = 0
      if (!outer.current) return
      const p = Math.min(1, Math.max(0, -outer.current.getBoundingClientRect().top / Math.max(1, dist)))
      setX(p * dist)
      setIndex(Math.min(n - 1, Math.round(p * (n - 1))))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    window.addEventListener("scroll", on, { passive: true })
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf) }
  }, [mode, dist, n])

  const goTo = useCallback((i: number) => {
    const k = Math.max(0, Math.min(n - 1, i))
    if (mode === "pin" && outer.current) {
      const top = outer.current.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: top + (k / Math.max(1, n - 1)) * dist, behavior: "smooth" })
    } else if (mode === "row") {
      (track.current?.children[k] as HTMLElement | undefined)?.scrollIntoView({ block: "nearest", inline: "start" })
    }
  }, [mode, dist, n])

  const onRowScroll = () => {
    const v = view.current
    if (!v) return
    setIndex(Math.round((v.scrollLeft / Math.max(1, v.scrollWidth - v.clientWidth)) * (n - 1)))
  }

  const cards = projects.map((p, i) => {
    const media = p.nda ? (
      <div className="reel-ph"><span>Under NDA</span></div>
    ) : p.video ? (
      <video src={p.video} poster={p.poster} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" />
    ) : (
      <div className="reel-ph"><span>{p.title.split(" · ")[0]}</span></div>
    )
    const inner = (
      <>
        <div className="reel-media">{media}</div>
        <div className="reel-body">
          <p className="reel-title">{p.title}</p>
          <h3 className="reel-result">{p.result}</h3>
          <ul className="reel-tags" aria-label="Topics">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="reel-text">{p.body}</p>
          <span className="reel-cta" aria-hidden="true">{p.nda ? "Ask me about it →" : "Read the study →"}</span>
        </div>
      </>
    )
    const label = `${p.title}. ${p.result}.${p.nda ? " Under NDA." : " Read the case study."}`
    return (
      <li key={p.slug} className="reel-card" data-nda={p.nda ? "" : undefined}>
        {p.nda ? (
          <article className="reel-link" tabIndex={0} aria-label={label} onFocus={() => mode !== "stack" && goTo(i)}>{inner}</article>
        ) : (
          <Link className="reel-link" href={`/work/${p.slug}`} aria-label={label} onFocus={() => mode !== "stack" && goTo(i)}>{inner}</Link>
        )}
      </li>
    )
  })

  const head = (
    <div className="reel-head container">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="h2">{heading}</h2>
      </div>
      {mode !== "stack" && (
        <div className="reel-ctrl">
          <span className="reel-count" aria-hidden="true">{pad(index + 1)} / {pad(n)}</span>
          <button type="button" className="reel-arrow" aria-label="Previous project" disabled={index === 0} onClick={() => goTo(index - 1)}>←</button>
          <button type="button" className="reel-arrow" aria-label="Next project" disabled={index === n - 1} onClick={() => goTo(index + 1)}>→</button>
        </div>
      )}
    </div>
  )

  if (mode === "pin") {
    return (
      <section id="work" className="reel" aria-labelledby="work-h">
        <span id="work-h" className="sr-only">{eyebrow}</span>
        <div ref={outer} style={{ position: "relative", height: `calc(100vh + ${dist}px)` }}>
          <div className="reel-sticky">
            {head}
            <div ref={view} style={{ overflow: "hidden" }}>
              <ol ref={track} className="reel-track" style={{ transform: `translate3d(${-x}px,0,0)` }}>{cards}</ol>
            </div>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section id="work" className={`reel section ${mode === "row" ? "reel-row" : "reel-stack"}`} aria-labelledby="work-h">
      <span id="work-h" className="sr-only">{eyebrow}</span>
      {head}
      <div ref={view} className="reel-view" onScroll={mode === "row" ? onRowScroll : undefined}>
        <ol ref={track} className="reel-track">{cards}</ol>
      </div>
    </section>
  )
}
