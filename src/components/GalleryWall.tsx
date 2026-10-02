"use client"

import { useState } from "react"

const moments = [
  { src: "/gallery/dj-set.jpg", alt: "Dhwani DJing", label: "DJing", year: "2026" },
  { src: "/gallery/travel-peru.jpg", alt: "A travel moment in Peru", label: "Somewhere new", year: "2025" },
  { src: "/gallery/instruments.jpg", alt: "Instruments Dhwani plays", label: "Four instruments, one playlist", year: "always" },
  { src: "/gallery/music-theory.jpg", alt: "A music theory notebook", label: "Music theory rabbit hole", year: "2026" },
  { src: "/gallery/workout.jpg", alt: "Dhwani at the gym", label: "Gym, then maybe a run", year: "2026" },
  { src: "/gallery/campus.jpg", alt: "A University of Michigan campus moment", label: "Ann Arbor days", year: "2026" },
  { src: "/gallery/book.jpg", alt: "A book Dhwani is reading", label: "On my nightstand", year: "now" },
  { src: "/gallery/friends.jpg", alt: "A day out with friends", label: "Always say yes to the plan", year: "2026" },
]

function GalleryTile({ item }: { item: typeof moments[number] }) {
  const [missing, setMissing] = useState(false)
  return (
    <figure className={"gallery-tile" + (missing ? " is-empty" : "")}>
      {!missing && <img src={item.src} alt={item.alt} loading="lazy" onError={() => setMissing(true)} />}
      {missing && <div className="gallery-placeholder"><span>Add photo</span><code>{item.src}</code></div>}
      <figcaption><span>{item.label}</span><small>{item.year}</small></figcaption>
    </figure>
  )
}

export function GalleryWall() {
  return (
    <section className="gallery-wall section" aria-labelledby="gallery-title">
      <div className="container gallery-heading">
        <p className="eyebrow">off the clock</p>
        <h2 id="gallery-title" className="h2">A few things that make me, me.</h2>
        <p>Music, movement, new places, and whatever I’m currently curious about.</p>
      </div>
      <div className="gallery-grid container">
        {moments.map((item) => <GalleryTile item={item} key={item.src} />)}
      </div>
    </section>
  )
}
