"use client"

import { useState } from "react"

const photos = [
  { src: "/gallery/moment-01.jpg", alt: "" },
  { src: "/gallery/moment-02.jpg", alt: "" },
  { src: "/gallery/moment-03.jpg", alt: "" },
  { src: "/gallery/moment-04.jpg", alt: "" },
  { src: "/gallery/moment-05.jpg", alt: "" },
  { src: "/gallery/moment-06.jpg", alt: "" },
  { src: "/gallery/moment-07.jpg", alt: "" },
  { src: "/gallery/moment-08.jpg", alt: "" },
]

function PhotoTile({ photo, index }: { photo: typeof photos[number]; index: number }) {
  const [missing, setMissing] = useState(false)
  return (
    <figure className={"gallery-tile tile-" + (index + 1)}>
      {!missing
        ? <img src={photo.src} alt={photo.alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setMissing(true)} />
        : <div className="gallery-placeholder" title={"Add your photo at " + photo.src}>
            <span aria-hidden="true">＋</span><small>Add photo</small>
          </div>}
    </figure>
  )
}

export function GalleryWall() {
  return (
    <section className="gallery-wall section" aria-labelledby="gallery-title">
      <div className="container gallery-heading">
        <p className="eyebrow">a little beyond the work</p>
        <h2 id="gallery-title" className="h2">The rest of the picture.</h2>
      </div>
      <div className="gallery-grid container">
        {photos.map((photo, index) => <PhotoTile key={photo.src} photo={photo} index={index} />)}
      </div>
    </section>
  )
}
