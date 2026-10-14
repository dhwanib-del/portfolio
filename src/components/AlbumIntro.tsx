"use client"

import { useState } from "react"
import styles from "./AlbumIntro.module.css"

const tracks = [
  { n: "01", title: "The designer", note: "AI-native product design, research, and a love for figuring things out." },
  { n: "02", title: "Behind the lens", note: "Photography, light, and collecting little moments." },
  { n: "03", title: "Frequent flyer", note: "Places, people, and a very long list of places still to visit." },
  { n: "04", title: "After hours", note: "Learning to DJ and finding new things to make." },
]

export function AlbumIntro() {
  const [opened, setOpened] = useState(false)
  const [selected, setSelected] = useState(0)
  return (
    <aside className={styles.root} aria-label="A little more about Dhwani">
      <div className={styles.recordStage} data-open={opened}>
        <div className={styles.disc} aria-hidden="true">
          <div className={styles.discLabel}><span>DHWANI</span><small>VOL. 01</small></div>
        </div>
        <button type="button" className={styles.jewel} aria-label={opened ? "Close the album" : "Open the album and meet Dhwani"} aria-expanded={opened} onClick={() => setOpened(v => !v)}>
          <div className={styles.cover}>
            <div className={styles.coverTop}><span>DB RECORDS</span><span>01 / 04</span></div>
            <div className={styles.artwork}>
              <div className={styles.artHalo} aria-hidden="true" />
              <div className={styles.photoStack}>
                {/* Original portfolio photos, not AI-generated portraits. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/photobooth/1.svg" alt="" draggable={false} />
              </div>
            </div>
            <div className={styles.coverType}><strong>dhwani<span>.</span></strong><span>THE DEBUT EDITION</span></div>
          </div>
          <span className={styles.caseEdge} aria-hidden="true"/>
        </button>
      </div>
      <div className={styles.below}>
        <span>THE DEBUT ALBUM / SIDE A</span>
        <button type="button" onClick={() => setOpened(v => !v)} aria-expanded={opened}>
          {opened ? "Put it back ↙" : "Open the album ↗"}
        </button>
      </div>
      <div className={styles.trackPanel} data-open={opened} aria-hidden={!opened}>
        <div className={styles.panelTitle}><span>LINER NOTES</span><span>VOL. 01 · 2026</span></div>
        <div className={styles.tracks}>
          {tracks.map((track, i) => <button key={track.n} type="button" className={styles.track} data-active={selected === i} onClick={() => setSelected(i)} tabIndex={opened ? 0 : -1} disabled={!opened}>
            <span>{track.n}</span><strong>{track.title}</strong><span>{selected === i ? "●" : "↗"}</span>
          </button>)}
        </div>
        <p className={styles.trackDetail}>{tracks[selected].note}</p>
        <a href="#work" tabIndex={opened ? 0 : -1}>Enough about me. See the work ↓</a>
      </div>
    </aside>
  )
}
