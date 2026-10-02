"use client"

import { useState } from "react"

const places = ["Bengaluru", "Ann Arbor", "Mexico City", "Cappadocia"]

export function MapGame() {
  const [guess, setGuess] = useState("")
  const [revealed, setRevealed] = useState(false)
  const correct = guess === "Bengaluru"

  function choose(place: string) {
    setGuess(place)
    setRevealed(place === "Bengaluru")
  }

  return (
    <main className="map-game-page container">
      <a className="map-game-back" href="/about">← back to about</a>
      <p className="eyebrow">a tiny game about a big world</p>
      <h1>Where in my world is this?</h1>
      <p className="map-game-intro">One clue. Four places. Take a guess.</p>
      <section className="map-game-board" aria-labelledby="map-clue">
        <div className="map-game-art" aria-hidden="true">
          <div className="map-orbit orbit-one" /><div className="map-orbit orbit-two" />
          <span className="map-pin">✦</span><span className="map-coord">12°58′ N · 77°35′ E</span>
        </div>
        <div className="map-game-prompt">
          <p className="eyebrow">chapter 01 · home</p>
          <h2 id="map-clue">Which city is known as the Garden City of India?</h2>
          <div className="map-choices">
            {places.map(place => <button key={place} onClick={() => choose(place)} className={guess === place ? (place === "Bengaluru" ? "correct" : "incorrect") : ""}>{place}</button>)}
          </div>
          <p className="map-feedback" aria-live="polite">{revealed ? "You got it — Bengaluru. A place I call home." : guess ? "Not quite. Try another place." : "Choose a place to reveal the story."}</p>
        </div>
      </section>
      <p className="map-game-footnote">More chapters coming as I add the stories.</p>
    </main>
  )
}
