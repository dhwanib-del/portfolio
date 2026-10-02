type Brand = "dpss" | "gm" | "openlibrary" | "primevideo"

export function BrandMark({ brand }: { brand: Brand }) {
  if (brand === "dpss") {
    return <span className="brand-mark brand-dpss" aria-label="University of Michigan DPSS"><b aria-hidden="true">M</b><small>DPSS</small></span>
  }
  if (brand === "gm") {
    return <span className="brand-mark brand-gm" aria-label="General Motors"><span className="gm-roundel" aria-hidden="true">gm</span><small>GM</small></span>
  }
  if (brand === "openlibrary") {
    return <span className="brand-mark brand-openlibrary" aria-label="Open Library"><svg aria-hidden="true" viewBox="0 0 32 26" width="24" height="20"><path d="M16 5C12 2 7 2 2 3v18c5-1 10-1 14 3 4-4 9-4 14-3V3c-5-1-10-1-14 2Zm0 0v19M6 7c3-.4 6 0 8 2m12-2c-3-.4-6 0-8 2" /></svg><small>Open Library</small></span>
  }
  return <span className="brand-mark brand-prime" aria-label="Prime Video"><svg aria-hidden="true" viewBox="0 0 32 26" width="22" height="20"><path d="m11 4 14 9-14 9zM5 21c5 4 17 4 22 0" /></svg><small>Prime Video</small></span>
}
