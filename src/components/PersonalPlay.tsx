"use client"

import { useState, type CSSProperties } from "react"

// Edit this list to add records. Add cover art to public/playlist/ and set cover to its path.
const records = [
  { title: "On repeat", artist: "Current rotation", cover: "/playlist/record-01.jpg", color: "#f4a7bb" },
  { title: "Side A", artist: "A song for the drive", cover: "/playlist/record-02.jpg", color: "#f2a15a" },
  { title: "Side B", artist: "One more listen", cover: "/playlist/record-03.jpg", color: "#83a6e8" },
  { title: "Deep cut", artist: "A new favorite", cover: "/playlist/record-04.jpg", color: "#a7c99d" },
]

function Record({ record, index, active, onSelect }: { record: typeof records[number]; index: number; active: boolean; onSelect: () => void }) {
  const [missing, setMissing] = useState(false)
  return (
    <button
      className={"record-sleeve sleeve-" + index + (active ? " is-active" : "")}
      style={{ "--record-color": record.color } as CSSProperties & { "--record-color": string }}
      onClick={onSelect}
      aria-pressed={active}
      aria-label={record.title + " by " + record.artist}
    >
      <span className="record-cover">
        {!missing && <img src={record.cover} alt="" onError={() => setMissing(true)} />}
        {missing && <span className="record-cover-placeholder" aria-hidden="true">✳</span>}
      </span>
      <span className="record-label"><strong>{record.title}</strong><small>{record.artist}</small></span>
    </button>
  )
}

export function PersonalPlay() {
  const [active, setActive] = useState(0)
  return (
    <section className="record-player section" aria-labelledby="playlist-title">
      <div className="record-player-inner container">
        <p className="eyebrow">a little off the clock</p>
        <h2 id="playlist-title" className="record-player-title">Look into my <em>playlist</em></h2>
        <p className="record-player-note">A few things in rotation. Pick a record to flip the side.</p>
        <div className="record-stage">
          <div className="record-shelves" aria-label="Choose a record">
            {records.map((record, index) => <Record key={record.title} record={record} index={index} active={index === active} onSelect={() => setActive(index)} />)}
          </div>
          <button className={"vinyl-disc" + (active >= 0 ? " playing" : "")} onClick={() => setActive((active + 1) % records.length)} aria-label="Play next record">
            <span className="vinyl-grooves" />
            <span className="vinyl-center" style={{ "--record-color": records[active].color } as React.CSSProperties}>
              <span className="vinyl-center-copy"><strong>{records[active].title}</strong><small>{records[active].artist}</small></span>
            </span>
            <span className="vinyl-shine" />
          </button>
          <p className="record-player-current" aria-live="polite"><span>now spinning</span> {records[active].title} · {records[active].artist}</p>
        </div>
      </div>
    </section>
  )
}
