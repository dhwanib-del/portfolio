"use client"

import { useEffect, useRef, useState } from "react"
import { figmaEmbed } from "@/lib/case-ui"
import s from "./caseUi.module.css"

type Props = {
  url: string
  title: string
  note?: string
  /** CSS aspect-ratio of the embed frame */
  aspect?: string
  /** ms before we assume the embed is blocked (private file, network, CSP) */
  timeout?: number
}

type State = "idle" | "loading" | "ready" | "failed"

/**
 * Click-to-load Figma prototype. Loading is opt-in so a recruiter isn't made to download Figma's
 * player just by scrolling past. Always offers "Open in Figma" as the fallback.
 */
export function PrototypeEmbed({ url, title, note, aspect = "16 / 10", timeout = 15000 }: Props) {
  const link = figmaEmbed(url)
  const [state, setState] = useState<State>(link ? "idle" : "failed")
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state !== "loading") return
    const t = window.setTimeout(() => setState((cur) => (cur === "loading" ? "failed" : cur)), timeout)
    return () => window.clearTimeout(t)
  }, [state, timeout])

  const fullscreen = () => {
    const el = frame.current
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => window.open(link?.openUrl, "_blank", "noopener"))
    else if (link) window.open(link.openUrl, "_blank", "noopener")
  }

  return (
    <figure className={s.proto}>
      <div ref={frame} className={s.protoFrame} style={{ aspectRatio: aspect }} data-state={state}>
        {state === "idle" && (
          <div className={s.protoCover}>
            <p className={s.protoTitle}>{title}</p>
            {note && <p className={s.protoNote}>{note}</p>}
            <button type="button" className={s.primaryBtn} onClick={() => setState("loading")}>Load interactive prototype</button>
            <p className={s.protoHint}>Loads Figma&apos;s player (about 5–10 MB).</p>
          </div>
        )}
        {(state === "loading" || state === "ready") && link && (
          <iframe
            src={link.embedUrl}
            title={`${title} (interactive Figma prototype)`}
            allowFullScreen
            loading="lazy"
            onLoad={() => setState("ready")}
            className={s.protoIframe}
          />
        )}
        {state === "loading" && <p className={s.protoStatus} role="status">Loading prototype…</p>}
        {state === "failed" && (
          <div className={s.protoCover} role="alert">
            <p className={s.protoTitle}>The prototype couldn&apos;t load here.</p>
            <p className={s.protoNote}>{link ? "The file may be private or blocked on this network." : "This prototype link isn't a valid Figma URL."}</p>
            {link && <button type="button" className={s.textBtn} onClick={() => setState("loading")}>Try again</button>}
          </div>
        )}
      </div>
      <figcaption className={s.protoBar}>
        <span>{state === "ready" ? "Click inside to interact. Some prototypes need a Figma sign-in." : title}</span>
        <span className={s.protoActions}>
          {state === "ready" && <button type="button" className={s.textBtn} onClick={fullscreen}>Full screen</button>}
          {link && <a className={s.textBtn} href={link.openUrl} target="_blank" rel="noopener noreferrer">Open in Figma ↗</a>}
        </span>
      </figcaption>
    </figure>
  )
}
