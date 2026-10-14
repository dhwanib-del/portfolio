"use client"

import { useEffect, useRef, useState } from "react"
import { figmaEmbed } from "@/lib/case-ui"
import styles from "./ScrollLaptop.module.css"

type Props = {
  title: string
  url: string
  note?: string
  poster?: string
}

/** Reversible scroll-linked laptop; interactive embed loads only on visitor request. */
export function ScrollLaptop({ title, url, note, poster }: Props) {
  const root = useRef<HTMLElement>(null)
  const [progress, setProgress] = useState(0)
  const [reduced, setReduced] = useState(false)
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const figma = figmaEmbed(url)
  let external = ""
  try {
    const target = new URL(url)
    if (target.protocol === "https:" || target.protocol === "http:") external = target.href
  } catch {}
  const embed = figma?.embedUrl || external
  const openUrl = figma?.openUrl || external

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener?.("change", sync)
    return () => mq.removeEventListener?.("change", sync)
  }, [])
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const node = root.current
      if (!node) return
      const r = node.getBoundingClientRect()
      const range = Math.max(1, r.height - window.innerHeight)
      setProgress(Math.max(0, Math.min(1, -r.top / range)))
    }
    const request = () => { if (!frame) frame = requestAnimationFrame(update) }
    request()
    window.addEventListener("scroll", request, { passive: true })
    window.addEventListener("resize", request)
    return () => {
      window.removeEventListener("scroll", request)
      window.removeEventListener("resize", request)
      cancelAnimationFrame(frame)
    }
  }, [])
  useEffect(() => {
    if (!open || loaded) return
    const timer = window.setTimeout(() => setFailed(true), 15000)
    return () => window.clearTimeout(timer)
  }, [open, loaded])

  const amount = reduced ? 1 : Math.max(0, Math.min(1, (progress - .05) / .8))
  const angle = (1 - amount) * 69

  return (
    <section className={styles.sequence} ref={root} aria-label={title + " interactive laptop prototype"}>
      <div className={styles.sticky}>
        <div className={styles.caption}>
          <span>On the screen / interactive prototype</span>
          <p>{note || title}</p>
        </div>
        <div className={styles.laptop}>
          <div className={styles.lid} style={{ transform: `perspective(1350px) rotateX(${angle}deg)` }}>
            <div className={styles.screen}>
              {open && embed ? (
                <iframe
                  src={embed}
                  title={title + " embedded prototype"}
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => { setLoaded(true); setFailed(false) }}
                />
              ) : poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster} alt={title + " preview screen"} loading="lazy" />
              ) : (
                <div className={styles.blank}>
                  <span>Live preview</span>
                  <strong>{title}</strong>
                </div>
              )}
              {!open && <div className={styles.screenOverlay} aria-hidden="true" />}
            </div>
            <i className={styles.camera} aria-hidden="true" />
          </div>
          <div className={styles.base} aria-hidden="true"><i className={styles.keyboard}/></div>
        </div>
        <div className={styles.controls}>
          {external ? (
            <>
              <button type="button" onClick={() => { setOpen(true); setLoaded(false); setFailed(false) }} disabled={open && !failed}>
                {open ? failed ? "Try loading again" : "Prototype opened" : "Load interactive prototype"}
              </button>
              <a href={openUrl} target="_blank" rel="noopener noreferrer">Open original prototype</a>
            </>
          ) : <span>Prototype link not available.</span>}
        </div>
        {open && !loaded && !failed && <p role="status" className={styles.status}>Loading the interactive screen…</p>}
        {failed && <p role="status" className={styles.status}>The embedded site may be blocked or private. Use the original prototype link above.</p>}
        <span className={styles.scrollHint}>Scroll to open · scroll back to close</span>
      </div>
    </section>
  )
}
