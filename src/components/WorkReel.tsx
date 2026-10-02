"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import type { Project } from "@/content/site"
import { BrandMark } from "@/components/BrandMark"

function ProjectArtwork({ slug }: { slug: string }) {
  if (slug === "briefs") return (
    <div className="project-art project-art-briefs" aria-hidden="true">
      <div className="art-window"><span className="art-dot" /><span className="art-dot" /><span className="art-dot" /><b>BRIEFS</b><i>illustrative interface</i></div>
      <div className="art-search"><span>⌕</span> Search building information <kbd>⌘ K</kbd></div>
      <div className="art-workspace"><div className="art-sidebar"><i /><i /><i /><i /></div><div className="art-record"><small>BUILDING RECORD</small><strong>North Campus · Overview</strong><div className="art-lines"><i /><i /><i /></div><div className="art-pills"><em>Contacts</em><em>Maps</em><em>Resources</em></div></div></div>
    </div>
  )
  if (slug === "intel") return (
    <div className="project-art project-art-intel" aria-hidden="true">
      <div className="art-topline"><b>CASEWORK</b><i>illustrative interface</i></div>
      <div className="art-dash"><strong>Requests</strong><span>Search cases <b>⌕</b></span></div>
      <div className="art-case"><div className="art-avatar">01</div><p><b>Case review</b><small>Follow-up requested · Today</small></p><em>OPEN</em></div>
      <div className="art-case"><div className="art-avatar">02</div><p><b>New submission</b><small>Assigned to your team</small></p><em>NEW</em></div>
    </div>
  )
  if (slug === "general-motors") return (
    <div className="project-art project-art-gm" aria-hidden="true">
      <div className="art-topline"><b>TRIP TOGETHER</b><i>concept prototype</i></div>
      <div className="art-map"><div className="art-route" /><span className="art-pin art-pin-a">A</span><span className="art-pin art-pin-you">YOU</span><span className="art-pin art-pin-b">B</span><div className="art-map-label">Convoy synced <b>●</b></div></div>
      <div className="art-controls"><span>Climate</span><b>68°</b><span>Cabin · Auto</span></div>
    </div>
  )
  if (slug === "openlibrary") return (
    <div className="project-art project-art-library" aria-hidden="true">
      <div className="art-topline"><b>OPEN LIBRARY</b><i>reading concept</i></div>
      <div className="art-book"><small>CHAPTER 04</small><strong>Reading should keep its rhythm.</strong><div className="art-lines"><i /><i /><i /><i /></div><div className="art-translate"><b>A</b><span>Translate · Define · Listen</span><span>↗</span></div></div>
      <div className="art-page">34 <span>of 208</span></div>
    </div>
  )
  return (
    <div className="project-art project-art-budget" aria-hidden="true">
      <div className="art-topline"><b>BUDGETCART</b><i>concept prototype</i></div>
      <div className="art-budget-head"><strong>Good deals, in budget.</strong><span>Weekly plan · $60</span></div>
      <div className="art-grocery"><span>🥬</span><p><b>Fresh greens</b><small>SNAP eligible</small></p><strong>$3.49</strong></div>
      <div className="art-grocery"><span>🥣</span><p><b>Oat yogurt</b><small>Buy 1, get 1</small></p><strong>$4.20</strong></div>
      <div className="art-total"><span>Cart total</span><b>$7.69 <i>fits your plan</i></b></div>
    </div>
  )
}

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
      <ProjectArtwork slug={project.slug} />
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
