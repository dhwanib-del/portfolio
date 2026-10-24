"use client"

import Image from "next/image"
import { useId, useState } from "react"
import { normalizeAnnotations } from "@/lib/case-ui"
import type { Screen } from "@/content/caseStudies"
import { OwnerTag } from "./OwnerTag"
import s from "./caseUi.module.css"

/**
 * A screen with numbered pins and a numbered list of the same notes beside it (below on phones).
 * Every note is always readable in the list — pins only point; nothing is hover-only.
 */
export function AnnotatedScreen({ screen }: { screen: Screen }) {
  const notes = normalizeAnnotations(screen.annotations)
  const [active, setActive] = useState<number | null>(null)
  const id = useId()

  return (
    <figure className={s.annotated}>
      <div className={s.annotatedMedia} style={{ maxWidth: screen.width }}>
        <Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes={`${screen.width}px`} className={s.screenImg} />
        {notes.map((n, i) => (
          <button
            key={n.title}
            type="button"
            className={s.pin}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            data-active={active === i ? "true" : "false"}
            aria-label={`Note ${i + 1}: ${n.title}`}
            aria-describedby={`${id}-n${i}`}
            // Select, don't toggle: focus already fires before click, so a toggle would undo itself.
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <figcaption className={s.annotatedText}>
        <p className={s.annotatedTitle}>
          {screen.caption} <OwnerTag owner={screen.owner} note={screen.ownerNote} />
        </p>
        <ol className={s.noteList}>
          {notes.map((n, i) => (
            <li key={n.title} id={`${id}-n${i}`} data-active={active === i ? "true" : "false"}>
              <button type="button" onClick={() => setActive(active === i ? null : i)} aria-pressed={active === i}>
                <span className={s.noteNum} aria-hidden="true">{i + 1}</span>
                <span>
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}
