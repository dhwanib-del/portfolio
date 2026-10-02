"use client"
// "The set so far": newest first, 6 shown + "Show N earlier roles".
import { useState } from "react"
import type { Role } from "@/content/site"

export function Experience({ roles, show = 6 }: { roles: Role[]; show?: number }) {
  const [all, setAll] = useState(false)
  const list = all ? roles : roles.slice(0, show)
  const hidden = roles.length - show
  return (
    <section className="section" aria-labelledby="exp-h">
      <div className="container">
        <p className="eyebrow">experience</p>
        <h2 id="exp-h" className="h2">The set so far</h2>
        <p className="lede">Research, design and leading teams. Newest first.</p>
        <ol id="exp-list" className="exp">
          {list.map((r) => (
            <li key={r.org + r.role} className="exp-row">
              <p className="exp-dates">
                {r.current && <span aria-hidden className="status-dot" />}
                {r.dates}
                {r.current && <span className="sr-only"> (current)</span>}
              </p>
              <div>
                <h3 className="exp-org">{r.org}</h3>
                <p className="exp-role">{r.role}</p>
                <p className="exp-sum">{r.summary}</p>
              </div>
            </li>
          ))}
        </ol>
        {hidden > 0 && (
          <button type="button" className="btn" style={{ marginTop: 20 }} aria-expanded={all} aria-controls="exp-list" onClick={() => setAll((a) => !a)}>
            {all ? "Show fewer" : `Show ${hidden} earlier roles`}
          </button>
        )}
      </div>
    </section>
  )
}
