type Brand = "dpss" | "gm" | "openlibrary" | "primevideo"

export function BrandMark({ brand }: { brand: Brand }) {
  if (brand === "dpss") {
    return <span className="brand-mark brand-dpss" aria-label="University of Michigan DPSS"><b aria-hidden="true">M</b><small>DPSS</small></span>
  }
  if (brand === "gm") {
    return <span className="brand-mark brand-gm" aria-label="General Motors"><b aria-hidden="true">gm</b></span>
  }
  if (brand === "openlibrary") {
    return <span className="brand-mark brand-openlibrary" aria-label="Open Library"><svg aria-hidden="true" viewBox="0 0 32 26"><path d="M16 7C12 3 7 3 2 4v18c5-1 10-1 14 3 4-4 9-4 14-3V4c-5-1-10-1-14 3Zm0 0v18M6 8c3-.4 6 0 8 2m12-2c-3-.4-6 0-8 2" /></svg><small>open library</small></span>
  }
  return <span className="brand-mark brand-prime" aria-label="Prime Video"><svg aria-hidden="true" viewBox="0 0 32 26"><path d="m11 5 14 8-14 8zM5 21c5 4 17 4 22 0" /></svg><small>prime video</small></span>
}
