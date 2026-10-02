// Terminal-window experiment card (rebuilt from Dhwani's Framer LabCard). Theme tokens, one link.
import Link from "next/link"

const STATUS: Record<string, string> = { Concept: "var(--text-2)", PRD: "#7B5CFF", Prototype: "#0891b2", "In build": "var(--accent)", Live: "var(--ok)" }

export type LabItem = { title: string; line: string; file: string; status: keyof typeof STATUS | string; tags: string[]; href?: string }

export function LabCard({ item }: { item: LabItem }) {
  const slug = item.title.toLowerCase().replace(/\s+/g, "-")
  const body = (
    <>
      <div className="lab-bar">
        <span aria-hidden className="nav-lights"><i style={{ background: "#FF5F57" }} /><i style={{ background: "#FFBD2E" }} /><i style={{ background: "#28CA41" }} /></span>
        <span className="lab-file">{item.file}</span>
        <span className="lab-status"><i aria-hidden style={{ background: STATUS[item.status] || "var(--text-2)" }} />{item.status}</span>
      </div>
      <div className="lab-body">
        <h2>{item.title}</h2>
        <p>{item.line}</p>
        <ul className="reel-tags" aria-label="Topics">{item.tags.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="lab-foot" aria-hidden="true"><span>$</span> open {slug} <span>→</span></div>
    </>
  )
  return item.href ? <Link href={item.href} className="lab-card">{body}</Link> : <article className="lab-card" tabIndex={0}>{body}</article>
}
