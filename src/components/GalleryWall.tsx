"use client"

import { useState } from "react"

const photos = [
  { src: "/gallery/moment-01.jpg", alt: "Dhwani, photo one" },
  { src: "/gallery/moment-02.jpg", alt: "Dhwani, photo two" },
  { src: "/gallery/moment-03.jpg", alt: "Dhwani, photo three" },
  { src: "/gallery/moment-04.jpg", alt: "Dhwani, photo four" },
  { src: "/gallery/moment-05.jpg", alt: "Dhwani, photo five" },
  { src: "/gallery/moment-06.jpg", alt: "Dhwani, photo six" },
  { src: "/gallery/moment-07.jpg", alt: "Dhwani, photo seven" },
  { src: "/gallery/moment-08.jpg", alt: "Dhwani, photo eight" },
]

function PhotoTile({ photo, index }: { photo: typeof photos[number]; index: number }) {
  const [missing, setMissing] = useState(false)
  return (
    <figure className={"gallery-tile tile-" + (index + 1)}>
      {!missing
        ? <img src={photo.src} alt={photo.alt} loading="lazy" onError={() => setMissing(true)} />
        : <div className="gallery-placeholder" title={"Add " + photo.src + " to the public folder"}>
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
