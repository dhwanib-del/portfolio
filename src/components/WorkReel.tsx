"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { Project } from "@/content/site"
import { BrandMark } from "@/components/BrandMark"

export function WorkReel({ projects, eyebrow, heading }: { projects: Project[]; eyebrow: string; heading: string }) {
  const grid = useRef<HTMLOListElement>(null)
  const [revealReady, setRevealReady] = useState(false)
  const [revealed, setRevealed] = useState<string[]>([])

  useEffect(() => {
    setRevealReady(true)
    const cards = grid.current?.querySelectorAll<HTMLElement>("[data-project]")
    if (!cards) return
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion || !("IntersectionObserver" in window)) {
      setRevealed(Array.from(cards).map((card) => card.dataset.project || ""))
      return
    }
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

  const cards = projects.map((project) => {
    const media = project.nda ? (
      <div className="reel-ph reel-ph-nda"><span>Under NDA</span><small>Ask me about the work</small></div>
    ) : project.video ? (
      <video src={project.video} poster={project.poster} muted loop playsInline autoPlay preload="metadata" aria-hidden="true" />
    ) : project.image ? (
      <img className="reel-cover-image" src={project.image} alt="" loading="lazy" />
    ) : (
      <div className="reel-ph">
        <span>{project.title.split(" · ")[0]}</span>
        <small>Project preview</small>
        <code>public/work/{project.slug}/cover.jpg</code>
      </div>
    )
    const visible = revealed.includes(project.slug)
    const inside = (
      <>
        <div className="reel-media">
          {media}
          <span className="reel-media-label">{project.tags[0]}</span>
        </div>
        <div className="reel-body">
          <div className="reel-title-row"><p className="reel-title">{project.title}</p>{project.brand && <BrandMark brand={project.brand} />}</div>
          <h3 className="reel-result">{project.result}</h3>
          <div className="reel-extra" aria-hidden={!visible}>
            <ul className="reel-tags" aria-label="Topics">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            <p className="reel-text">{project.body}</p>
            <span className="reel-cta" aria-hidden="true">{project.nda ? "Ask me about it →" : "View case study →"}</span>
          </div>
        </div>
      </>
    )
    const label = `${project.title}. ${project.result}. ${project.nda ? "Under NDA." : "View case study."}`
    return (
      <li key={project.slug} data-project={project.slug} className={`reel-card project-${project.slug} ${visible ? "is-revealed" : ""}`}>
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
        <p className="reel-scroll-note">Keep scrolling for the details <span aria-hidden="true">↓</span></p>
      </div>
      <ol ref={grid} className="reel-grid" data-reveal-ready={revealReady ? "true" : "false"}>
        {cards}
      </ol>
    </section>
  )
}
