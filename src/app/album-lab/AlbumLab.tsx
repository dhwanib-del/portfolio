"use client"

import { useState } from "react"
import styles from "./album-lab.module.css"

type Concept = "editorial" | "jewel" | "shelf"

const directions: { id: Concept; index: string; title: string; note: string; character: string }[] = [
  { id: "editorial", index: "01", title: "Editorial cover", note: "Portrait-led, minimal, quietly bold.", character: "the art direction" },
  { id: "jewel", index: "02", title: "The jewel case", note: "Silver, translucent, just a hint of nostalgia.", character: "the tactile object" },
  { id: "shelf", index: "03", title: "The little shelf", note: "A personal collection, not a mini-museum.", character: "the tiny details" },
]

function Editorial() {
  return <div className={styles.edPosition}>
    <div className={styles.edPaper} aria-label="Editorial album cover mockup with a portfolio photograph">
      <div className={styles.edTop}><span>DB / 001</span><span>INDEPENDENT RELEASE</span></div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.edPhoto} src="/photobooth/1.svg" alt="An existing photograph from Dhwani’s portfolio" draggable={false} />
      <div className={styles.edVignette} aria-hidden="true" />
      <div className={styles.edBottom}><span className={styles.edTitle}>dhwani<span>.</span></span><span className={styles.edCaption}>The debut edition<br/>A collection of curious things.</span></div>
    </div>
    <div className={styles.edSide} aria-hidden="true">SIDE A — INTRODUCTION</div>
  </div>
}

function Jewel() {
  return <div className={styles.jewelPosition}>
    <div className={styles.jewelDisc} aria-hidden="true"><div className={styles.jewelLabel}><span>DB–001</span><strong>dhwani.</strong><small>SIDE A / 2026</small></div></div>
    <div className={styles.jewelCase} aria-label="Minimal glass CD jewel case with an editorial photo sleeve">
      <div className={styles.jewelSpine}><span>DB—001</span></div>
      <div className={styles.jewelInner}>
        <div className={styles.jewelMeta}><span>PERSONAL COLLECTION</span><span>VOL. 01</span></div>
        <div className={styles.jewelPhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photobooth/1.svg" alt="An existing photograph from Dhwani’s portfolio" draggable={false}/>
        </div>
        <div className={styles.jewelTypography}><strong>dhwani.</strong><span>MADE OF MANY THINGS / 2026</span></div>
      </div>
    </div>
    <div className={styles.jewelLight} aria-hidden="true" />
  </div>
}

function Shelf() {
  return <div className={styles.shelfPosition} aria-label="Small curated shelf with an album sleeve, camera and keepsake ticket">
    <div className={styles.shelfWall} aria-hidden="true" />
    <div className={styles.shelfObjects}>
      <div className={styles.shelfTicket}><span>COLLECTED MOMENTS</span><strong>admit<br/>one</strong><small>GO SOMEWHERE / MAKE SOMETHING</small></div>
      <div className={styles.shelfAlbum}>
        <div className={styles.shelfAlbumMeta}>DHWANI · 001</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/photobooth/1.svg" alt="An existing photograph from Dhwani’s portfolio" draggable={false}/>
        <div className={styles.shelfAlbumType}>dhwani<span>.</span></div>
      </div>
      <div className={styles.shelfCamera} aria-hidden="true"><div className={styles.cameraTop}/><div className={styles.cameraBody}><span/><i/></div></div>
      <div className={styles.shelfCard}><span>side b</span><strong>outside<br/>of work</strong><small>photos / places / playlists</small></div>
    </div>
    <div className={styles.shelfPlank} aria-hidden="true"/>
    <div className={styles.shelfPlankShadow} aria-hidden="true"/>
  </div>
}

export function AlbumLab() {
  const [selected, setSelected] = useState<Concept>("editorial")
  const active = directions.find(d => d.id === selected)!
  return <div className={styles.lab}>
    <header className={styles.labHeader}>
      <div className={styles.labStamp}><span className={styles.stampCircle}>db.</span><div><strong>THE OPENING ACT</strong><span>HOMEPAGE ART DIRECTION · V1</span></div></div>
      <a className={styles.liveLink} href="/" aria-label="View the current portfolio homepage">Current homepage <span aria-hidden="true">↗</span></a>
    </header>
    <div className={styles.content}>
      <div className={styles.heading}>
        <div><p className={styles.kicker}><span className={styles.kickerDot}/> DESIGN STUDIES / THE INTRO</p><h1>Same idea.<br/><em>Different sleeves.</em></h1></div>
        <p>Three directions for a little album that introduces me. The work stays the main event. This is the artwork before we build the interaction.</p>
      </div>
      <div className={styles.choiceBar} role="group" aria-label="Compare album cover directions">
        {directions.map(d => <button type="button" key={d.id} className={styles.choice} data-active={selected === d.id} aria-pressed={selected === d.id} onClick={() => setSelected(d.id)}><span>{d.index} /</span> {d.title}</button>)}
        <span className={styles.choiceEnd}>PICK A DIRECTION ↗</span>
      </div>
      <section className={styles.preview} aria-label={`Homepage visual preview: ${active.title}`}>
        <div className={styles.introduction}>
          <span className={styles.introOverline}>INTRODUCING, VOL. 01</span>
          <p className={styles.sayHi}>hi, i'm</p>
          <h2>Dhwani<span>.</span></h2>
          <p className={styles.role}>AI-native product designer.</p>
          <p className={styles.pitch}>Making complex experiences a little more human. Exploring everything else along the way.</p>
          <a href="/#work" className={styles.workLink}>Explore selected work <span aria-hidden="true">↗</span></a>
        </div>
        <div className={styles.visualZone} data-concept={selected}>
          {selected === "editorial" ? <Editorial /> : selected === "jewel" ? <Jewel /> : <Shelf />}
          <div className={styles.visualIndex}>{active.index} / 03</div>
        </div>
        <div className={styles.workPeek}><span>NOW PLAYING / THE WORK</span><strong>Selected projects <span>↘</span></strong><span>GM · DPSS · OPEN LIBRARY · MORE</span></div>
      </section>
      <div className={styles.details}>
        <div className={styles.detailsIdentity}><span>SELECTED DIRECTION / {active.index}</span><h3>{active.title}<span>.</span></h3><p>{active.note}</p></div>
        <div className={styles.detailsRight}>
          <span>WHAT WE’RE TESTING</span>
          <p>{active.character}, how the photo sits, and whether the object makes the opening feel memorable without stealing focus from the projects.</p>
        </div>
      </div>
      <div className={styles.afterword}>
        <span>THE NEXT STEP IS NOT MORE ANIMATION.</span>
        <p>Choose the visual language first. Then we’ll finesse the crop, typography, material, hover, motion, and mobile behavior one detail at a time.</p>
        <a href="/#work">See the actual case studies ↗</a>
      </div>
    </div>
  </div>
}
