import { LabCard, type LabItem } from "@/components/play/LabCard"
import { GalleryWall } from "@/components/play/GalleryWall"
import { Kolam } from "@/components/play/Kolam"

export const metadata = { title: "Play · Dhwani Bagrecha" }

// Add an experiment: copy a line, change the words. `href` is optional.
const items: LabItem[] = [
  { title: "Hoshi", file: "hoshi.crx", status: "In build", line: "A Chrome extension that turns job applications into a game you want to keep playing.", tags: ["Chrome extension", "Gamification"] },
  { title: "Luma", file: "luma.sheet", status: "Prototype", line: "A budgeting tracker on Google Sheets with bank sync and quick phone entry.", tags: ["Google Sheets", "Personal finance"] },
  { title: "DhwaniGPT", file: "dhwanigpt.ai", status: "In build", line: "The assistant on this site. It answers only from my portfolio and says when it doesn't know.", tags: ["AI", "Claude API"] },
  { title: "Wellness app", file: "wellness.prd", status: "PRD", line: "Wearable data, food logging and guidance in one place. Taken to PRD and prototype.", tags: ["Health", "AI"] },
]

export default function Lab() {
  return (
    <div className="case">
      <div className="container">
        <p className="eyebrow">play</p>
        <h1 className="case-h1">Things I build when nobody asked.</h1>
        <p className="case-hook">Side projects and AI experiments. Each one taught me something I used in real work.</p>
        <ul className="lab">{items.map((it) => <li key={it.title}><LabCard item={it} /></li>)}</ul>
      </div>
      <Kolam />
      <div className="container"><GalleryWall /></div>
    </div>
  )
}
