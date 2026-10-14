"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { Project } from "@/content/site"
import { BrandMark } from "@/components/BrandMark"

// Covers use real, cleared screens only. Projects without public screens get a typographic
// cover that says why, instead of a drawn interface that could be mistaken for the work.
function ProjectCover({ project }: { project: Project }) {
  if (project.coverScreens?.length) return (
    <div className="reel-cover-phones" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative cover, sized by CSS height */}
      {project.coverScreens.map((src) => <img key={src} src={src} alt="" loading="lazy" />)}
    </div>
  )
  const name = project.title.split(" · ")[0]
  return (
    <div className="reel-cover-type" aria-hidden="true">
      <div className="reel-cover-overline"><span>SELECTED PROJECT / {project.tags[0]}</span></div>
      <strong>{name}<span>.</span></strong>
      <div className="reel-cover-bottom"><span>{project.result}</span><small>{project.coverNote ?? "Project overview"}</small></div>
    </div>
  )
}

export function WorkReel({ projects, eyebrow, heading }: { projects: Project[]; eyebrow: string; heading: string }) {
  const grid = useRef<HTMLOListElement>(null)
  const [revealed, setRevealed] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  function move(direction: -1 | 1) {
    const list = grid.current
    if (!list) return
    const next = Math.min(projects.length - 1, Math.max(0, activeIndex + direction))
    list.children[next]?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest", inline: "start" })
    setActiveIndex(next)
  }

  // Extras start hidden only once JS confirms it can reveal them (data-reveal-ready is set on the
  // DOM, not in state). With reduced motion or no IntersectionObserver, everything stays visible.
  useEffect(() => {
    const list = grid.current
    const cards = list?.querySelectorAll<HTMLElement>("[data-project]")
    if (!list || !cards) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion || !("IntersectionObserver" in window)) return
    list.dataset.revealReady = "true"
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const slug = (entry.target as HTMLElement).dataset.project
        if (slug) setRevealed((current) => current.includes(slug) ? current : [...current, slug])
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.28, rootMargin: "0px 0px -6% 0px" })
    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  const cards = projects.map((project, index) => {
    const media = project.nda ? (
      <div className="reel-ph reel-ph-nda"><span>Under NDA</span><small>Ask me about the work</small></div>
    ) : project.video ? (
      <video src={project.video} poster={project.poster} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" />
    ) : project.image ? (
      // eslint-disable-next-line @next/next/no-img-element -- decorative cover
      <img className="reel-cover-image" src={project.image} alt="" loading="lazy" />
    ) : (
      <ProjectCover project={project} />
    )
    const visible = revealed.includes(project.slug)
    const inside = (
      <>
        <div className="reel-media">
          {media}
          <span className="reel-media-label">{String(index + 1).padStart(2, "0")} / {project.tags[0]}</span>
        </div>
        <div className="reel-body">
          <div className="reel-title-row"><p className="reel-title">{project.title}</p>{project.brand && <BrandMark brand={project.brand} />}</div>
          <h3 className="reel-result">{project.result}</h3>
          <div className="reel-extra">
            <ul className="reel-tags" aria-label="Topics">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            <p className="reel-text">{project.body}</p>
            <span className="reel-cta" aria-hidden="true">{project.nda ? "Current work" : "Explore the case study"}</span>
          </div>
        </div>
      </>
    )
    const label = `${project.title}. ${project.result}. ${project.nda ? "Under NDA." : "View case study."}`
    return (
      <li key={project.slug} data-project={project.slug} className={`reel-card project-${project.slug} ${index === 0 ? "reel-featured" : ""} ${visible ? "is-revealed" : ""}`}>
        {project.nda ? (
          <article className="reel-link" tabIndex={0} aria-label={label} onFocus={() => setRevealed((current) => current.includes(project.slug) ? current : [...current, project.slug])}>{inside}</article>
        ) : (
          <Link className="reel-link" href={`/work/${project.slug}`} aria-label={label} onFocus={() => setRevealed((current) => current.includes(project.slug) ? current : [...current, project.slug])}>{inside}</Link>
        )}
      </li>
    )
  })

  return (
    <section id="work" className="reel section reel-editorial" aria-labelledby="work-heading">
      <div className="reel-head container">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="work-heading" className="h2">{heading}</h2>
        </div>
        <div className="reel-ctrl"><span className="reel-count">{String(activeIndex + 1).padStart(2,"0")} / {String(projects.length).padStart(2,"0")}</span><button type="button" className="reel-arrow" onClick={() => move(-1)} disabled={activeIndex === 0} aria-label="Previous project">←</button><button type="button" className="reel-arrow" onClick={() => move(1)} disabled={activeIndex === projects.length-1} aria-label="Next project">→</button></div>
      </div>
      <ol ref={grid} className="reel-grid" data-reveal-ready="false" onScroll={(e) => { const el = e.currentTarget; const items = Array.from(el.children) as HTMLElement[]; if (!items.length) return; const nearest = items.reduce((best, item, i) => Math.abs(item.offsetLeft - el.scrollLeft) < Math.abs(items[best].offsetLeft - el.scrollLeft) ? i : best, 0); setActiveIndex(nearest) }}>
        {cards}
      </ol>
    </section>
  )
}
