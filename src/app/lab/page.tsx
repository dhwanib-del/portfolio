import { DragCanvas } from "@/components/play/DragCanvas"
import { tidbits, builtWithAI } from "@/content/about"

export const metadata = { title: "AI Lab · Dhwani Bagrecha" }

export default function Lab() {
  return (
    <div className="case">
      <div className="container">
        <p className="eyebrow">AI Lab</p>
        <h1 className="case-h1 tidbits-title">Made to <em>play.</em></h1>
        <p className="case-hook">Small experiments in interaction, code and AI. Pick something up. See what happens.</p>
      </div>
      <div className="container"><DragCanvas items={tidbits} /></div>
      <section className="container map-game-link-section"><a className="map-game-link-card" href="/map-game"><span className="eyebrow">a playable detour</span><strong>Where in my world is this?</strong><span>Try the map game <b>↗</b></span><span className="map-link-spark" aria-hidden="true">✳</span></a><p className="case-hook">A little geography game, alongside the lab experiments.</p></section>
      <div className="container">
        <aside className="ai-note" aria-labelledby="ai-note-h">
          <p className="eyebrow" id="ai-note-h">how the lab is built</p>
          <p>{builtWithAI}</p>
        </aside>
      </div>
    </div>
  )
}
