"use client"

import Image from "next/image"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { nextZoom, viewerKey, wrapIndex } from "@/lib/case-ui"
import type { Screen } from "@/content/caseStudies"
import { OwnerTag } from "./OwnerTag"
import s from "./caseUi.module.css"

type Props = {
  screens: Screen[]
  /** "row" lays screens side by side at their own proportions; "stack" gives each the full width */
  layout?: "row" | "stack"
  label: string
}

/**
 * Screens shown at their real proportions; click any to open a zoomable viewer.
 * Keyboard: ←/→ previous/next, + / − zoom, 0 fit, Esc close (native dialog).
 */
export function ScreenViewer({ screens, layout = "row", label }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
  const many = screens.length > 1
  const current = screens[index]

  const open = (i: number, el: HTMLButtonElement) => {
    opener.current = el
    setIndex(i)
    setZoom(1)
    dialog.current?.showModal()
  }
  const close = () => dialog.current?.close()
  const go = (dir: 1 | -1) => {
    setIndex((i) => wrapIndex(i + dir, screens.length))
    setZoom(1)
  }

  // Return focus to the thumbnail that opened the viewer.
  useEffect(() => {
    const d = dialog.current
    if (!d) return
    const onClose = () => opener.current?.focus()
    d.addEventListener("close", onClose)
    return () => d.removeEventListener("close", onClose)
  }, [])

  useLayoutEffect(() => {
    const el = stage.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(([e]) => setStageSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const action = viewerKey(e.key)
    if (!action) return
    e.preventDefault()
    if (action === "prev" && many) go(-1)
    else if (action === "next" && many) go(1)
    else if (action === "zoomIn") setZoom((z) => nextZoom(z, 1))
    else if (action === "zoomOut") setZoom((z) => nextZoom(z, -1))
    else if (action === "reset") setZoom(1)
  }

  // Fit inside the stage without upscaling past 2× the export's native size.
  const fit = current && stageSize.w ? Math.min(stageSize.w / current.width, stageSize.h / current.height, 2) : 1
  const shownW = current ? Math.round(current.width * fit * zoom) : 0

  return (
    <>
      <ul className={layout === "row" ? s.screenRow : s.screenStack} aria-label={label}>
        {screens.map((screen, i) => (
          <li key={screen.src} style={layout === "row" ? { flexBasis: screen.width, maxWidth: screen.width } : undefined}>
            <figure className={s.screen}>
              <button type="button" className={s.screenButton} onClick={(e) => open(i, e.currentTarget)} aria-label={`Enlarge: ${screen.caption}`}>
                <Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes={layout === "row" ? `${screen.width}px` : "(max-width: 760px) 100vw, 1104px"} className={s.screenImg} />
                <span className={s.enlargeHint} aria-hidden="true">⤢</span>
              </button>
              <figcaption className={s.screenCaption}>
                <span>{screen.caption}</span>
                <OwnerTag owner={screen.owner} note={screen.ownerNote} />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} className={s.viewer} aria-label={`${label}: screen viewer`} onKeyDown={onKeyDown} onClick={(e) => { if (e.target === e.currentTarget) close() }}>
        {current && (
          <div className={s.viewerInner}>
            <div className={s.viewerBar}>
              <p className={s.viewerTitle} aria-live="polite">
                {many && <span className={s.viewerCount}>{index + 1} / {screens.length}</span>}
                {current.caption}
              </p>
              <div className={s.viewerControls}>
                <button type="button" onClick={() => setZoom((z) => nextZoom(z, -1))} disabled={zoom <= 1} aria-label="Zoom out">−</button>
                <span className={s.zoomValue} aria-live="polite">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((z) => nextZoom(z, 1))} disabled={zoom >= 3} aria-label="Zoom in">+</button>
                <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} className={s.textBtn}>Fit</button>
                <button type="button" onClick={close} className={s.textBtn} autoFocus>Close</button>
              </div>
            </div>
            <div ref={stage} className={s.viewerStage} data-zoomed={zoom > 1 ? "true" : "false"}>
              {/* eslint-disable-next-line @next/next/no-img-element -- explicit pixel width for zoom; next/image would resample */}
              <img src={current.src} alt={current.alt} width={current.width} height={current.height} style={{ width: shownW || undefined }} className={s.viewerImg} />
            </div>
            {many && (
              <div className={s.viewerNav}>
                <button type="button" onClick={() => go(-1)} aria-label="Previous screen">← Previous</button>
                <button type="button" onClick={() => go(1)} aria-label="Next screen">Next →</button>
              </div>
            )}
            <p className={s.viewerHelp}>{many ? "← → to move · " : ""}+ − to zoom · Esc to close</p>
          </div>
        )}
      </dialog>
    </>
  )
}
