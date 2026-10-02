"use client"

import { useState, type CSSProperties } from "react"

type Track = { title: string; artist: string; cover?: string; spotifyUrl?: string; tint: string }

// Add a track here; use its Spotify link and cover art URL (or put a cover in public/playlist/).
const records: Track[] = [
  { title: "Naksha", artist: "Seedhe Maut", cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e029750614dd177fa9137726f07", spotifyUrl: "https://open.spotify.com/track/3syqe1nnZ4eHjhsc0qM5UW", tint: "#f2ab48" },
  { title: "Hit the Wall", artist: "Gracie Abrams", cover: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e021f4ba58b0e4dcef24a8df0cf", spotifyUrl: "https://open.spotify.com/track/1U90UBmMrQTx9GNweUA4LZ", tint: "#cb7e93" },
  { title: "CTRL ESCAPE", artist: "A saved album", cover: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02edd455c68b4f20c12a76c8c6", spotifyUrl: "https://open.spotify.com/album/3M5cmrMP6IkqcrpHKOwO6e", tint: "#e9a933" },
  { title: "Comfort In Chaos", artist: "A saved album", cover: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02ac2be70b09319ac92b074fde", spotifyUrl: "https://open.spotify.com/album/2pHm3ZP2R3phzCYi7ilGN2", tint: "#5d87be" },
  { title: "Add a favorite", artist: "Your next repeat", tint: "var(--accent)" },
  { title: "One more song", artist: "Your side B", tint: "var(--accent)" },
]

const positions = [
  { x: "14%", y: "28%", size: "clamp(86px, 12vw, 168px)" },
  { x: "35%", y: "12%", size: "clamp(90px, 13vw, 180px)" },
  { x: "78%", y: "24%", size: "clamp(88px, 12vw, 166px)" },
  { x: "86%", y: "67%", size: "clamp(84px, 11vw, 154px)" },
  { x: "26%", y: "77%", size: "clamp(78px, 10vw, 138px)" },
  { x: "58%", y: "86%", size: "clamp(74px, 9vw, 126px)" },
]

export function PersonalPlay() {
  const [active, setActive] = useState(0)
  const track = records[active]

  return (
    <section className="record-player section" aria-labelledby="playlist-title">
      <div className="record-player-heading container">
        <p className="eyebrow">a little off the clock</p>
      </div>
      <div className="record-orbit" aria-label="Pick a record to see what's playing">
        <h2 id="playlist-title" className="record-orbit-title">Look into my <em>playlist</em></h2>
        <div className="record-orbit-stars" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div>
        {records.map((record, index) => {
          const pos = positions[index]
          return (
            <button
              key={record.title}
              type="button"
              className={`orbit-cover orbit-cover-${index} ${active === index ? "is-active" : ""}`}
              style={{ "--orbit-x": pos.x, "--orbit-y": pos.y, "--orbit-size": pos.size, "--orbit-tint": record.tint } as CSSProperties & { "--orbit-x": string; "--orbit-y": string; "--orbit-size": string; "--orbit-tint": string }}
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              aria-label={`Play ${record.title} by ${record.artist}`}
            >
              {record.cover ? <img src={record.cover} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = "none" }} /> : null}
              {!record.cover && <span className="orbit-cover-placeholder"><small>add a track</small><b>{record.title}</b></span>}
              <span className="orbit-cover-caption">{record.title}<small>{record.artist}</small></span>
            </button>
          )
        })}
        <div className="orbit-center">
          <div className="orbit-center-kicker">now spinning</div>
          <button type="button" className="orbit-vinyl" onClick={() => setActive((active + 1) % records.length)} aria-label="Spin to the next track">
            <span className="orbit-vinyl-grooves" />
            <span className="orbit-vinyl-label" style={{ "--orbit-tint": track.tint } as CSSProperties & { "--orbit-tint": string }}>
              <strong>{track.title}</strong><small>{track.artist}</small>
            </span>
            <span className="orbit-vinyl-glint" />
          </button>
          {track.spotifyUrl && <a className="orbit-spotify" href={track.spotifyUrl} target="_blank" rel="noreferrer">open in Spotify ↗</a>}
        </div>
        <p className="record-orbit-hint">choose a cover · spin the record</p>
      </div>
    </section>
  )
}
