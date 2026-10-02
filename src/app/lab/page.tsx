import { DragCanvas } from "@/components/play/DragCanvas"
import { tidbits, builtWithAI } from "@/content/about"

export const metadata = { title: "Play · Dhwani Bagrecha" }

export default function Lab() {
  return (
    <div className="case">
      <div className="container">
        <p className="eyebrow">play</p>
        <h1 className="case-h1">Things I build when nobody asked.</h1>
        <p className="case-hook">Side projects and AI experiments. Each one taught me something I used in real work.</p>
      </div>
      <div className="container"><DragCanvas items={tidbits} /></div>
      <div className="container">
        <aside className="ai-note" aria-labelledby="ai-note-h">
          <p className="eyebrow" id="ai-note-h">how the lab is built</p>
          <p>{builtWithAI}</p>
        </aside>
      </div>
    </div>
  )
}
