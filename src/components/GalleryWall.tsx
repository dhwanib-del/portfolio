"use client"

import { useState } from "react"

type Moment = { caption: string; year: string; tone: string }

const moments: Moment[] = [
  { caption: "Out exploring", year: "2023", tone: "sand" },
  { caption: "Love fashion!", year: "2025", tone: "rose" },
  { caption: "I love food!", year: "2026", tone: "citrus" },
  { caption: "DJ", year: "2024", tone: "violet" },
  { caption: "Music", year: "2026", tone: "coral" },
  { caption: "Mexico", year: "2026", tone: "blue" },
  { caption: "Frida Kahlo, Mexico", year: "2026", tone: "sage" },
  { caption: "Cappadocia", year: "2024", tone: "sky" },
  { caption: "Machu Picchu, Peru", year: "2025", tone: "moss" },
  { caption: "Michigan State grad", year: "2025", tone: "green" },
  { caption: "I love working out", year: "2022", tone: "lilac" },
  { caption: "Costa Rica", year: "2026", tone: "ocean" },
  { caption: "Twelve Apostles, Australia", year: "2018", tone: "clay" },
  { caption: "A little fashion moment", year: "2018", tone: "rose" },
  { caption: "On the road", year: "2024", tone: "sunset" },
  { caption: "A good day outside", year: "2025", tone: "leaf" },
  { caption: "I love food!", year: "2026", tone: "citrus" },
  { caption: "DJ", year: "2024", tone: "violet" },
  { caption: "Mexico", year: "2026", tone: "blue" },
  { caption: "Machu Picchu, Peru", year: "2025", tone: "moss" },
  { caption: "Music", year: "2026", tone: "coral" },
  { caption: "Costa Rica", year: "2026", tone: "ocean" },
  { caption: "Love fashion!", year: "2025", tone: "rose" },
  { caption: "Cappadocia", year: "2024", tone: "sky" },
]

function GalleryTile({ moment, index }: { moment: Moment; index: number }) {
  const [loaded, setLoaded] = useState(false)
  const imageNumber = String((index % 16) + 1).padStart(2, "0")
  const src = `/gallery/moment-${imageNumber}.jpg`

  return (
    <figure className={`gallery-tile tile-${index % 8} tone-${moment.tone}`}>
      <div className="gallery-photo">
        <div className="gallery-placeholder" aria-hidden="true">
          <span className="gallery-placeholder-mark">{imageNumber}</span>
          <span className="gallery-placeholder-caption">{moment.caption}</span>
        </div>
        <img
          className={loaded ? "is-loaded" : ""}
          src={src}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
        />
      </div>
      <figcaption><span>{moment.caption}</span><time>{moment.year}</time></figcaption>
    </figure>
  )
}

export function GalleryWall() {
  return (
    <section className="gallery-wall section" aria-labelledby="gallery-title">
      <div className="container gallery-heading">
        <div>
          <p className="eyebrow">off the clock</p>
          <h2 id="gallery-title" className="h2">A few frames from my world.</h2>
        </div>
        <p className="gallery-scroll-hint">Hover to wander <span aria-hidden="true">✳</span> · scroll to explore</p>
      </div>
      <div className="gallery-window">
        <div className="gallery-grid" tabIndex={0} aria-label="Scrollable photo gallery">
          {moments.map((moment, index) => <GalleryTile key={`${moment.caption}-${index}`} moment={moment} index={index} />)}
        </div>
        <div className="gallery-vignette gallery-vignette-left" aria-hidden="true" />
        <div className="gallery-vignette gallery-vignette-right" aria-hidden="true" />
      </div>
    </section>
  )
}
