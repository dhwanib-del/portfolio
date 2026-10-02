"use client"

import { useState } from "react"

const photos = [
  { src: "https://framerusercontent.com/images/hv3L3bWYTundZJIkU5PtmHOvQ.webp?height=700&width=700", alt: "" },
  { src: "https://framerusercontent.com/images/gJHvNtldI6tyEVhuinUXMHXlU.webp?height=800&width=1000", alt: "" },
  { src: "https://framerusercontent.com/images/UCYyLPlXjj3vh1rcpUsCjJ3F48.jpeg?height=500&width=500", alt: "" },
  { src: "https://framerusercontent.com/images/M5GlIOctDy88BZJWPlHYasb1WMM.jpeg?height=500&width=500", alt: "" },
  { src: "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg", alt: "" },
]

function PhotoTile({ photo, index }: { photo: typeof photos[number]; index: number }) {
  const [missing, setMissing] = useState(false)
  return (
    <figure className={"gallery-tile tile-" + (index + 1)}>
      {!missing
        ? <img src={photo.src} alt={photo.alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setMissing(true)} />
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
