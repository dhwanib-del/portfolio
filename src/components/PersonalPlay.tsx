const cover = [
  { src: "https://framerusercontent.com/images/gJHvNtldI6tyEVhuinUXMHXlU.webp?height=700&width=1000", title: "So Close To What", artist: "currently on repeat" },
  { src: "https://framerusercontent.com/images/UCYyLPlXjj3vh1rcpUsCjJ3F48.jpeg?height=600&width=600", title: "Lunch Break", artist: "a good side A" },
  { src: "https://framerusercontent.com/images/M5GlIOctDy88BZJWPlHYasb1WMM.jpeg?height=600&width=600", title: "Sabrina", artist: "a good side B" },
  { src: "https://framerusercontent.com/images/hv3L3bWYTundZJIkU5PtmHOvQ.webp?height=600&width=600", title: "The next mix", artist: "still digging" },
]

export function PersonalPlay() {
  return (
    <section className="personal-play section" aria-labelledby="playlist-title">
      <div className="container playlist-layout">
        <div className="playlist-copy">
          <p className="eyebrow">side b · outside the work</p>
          <h2 id="playlist-title">Look into my <em>playlist.</em></h2>
          <p>Music theory brain, four instruments, beginner DJ energy. I organize playlists like tiny information systems.</p>
          <a className="playlist-link" href="https://dhwanibagrecha.com/" target="_blank" rel="noreferrer">Open the interactive DJ set ↗</a>
          <span className="playlist-spark" aria-hidden="true">✦</span>
        </div>
        <div className="playlist-stage">
          <p className="playlist-hint"><span className="equalizer" aria-hidden="true"><i/><i/><i/><i/></span> scroll to dig · hover to shine</p>
          <div className="playlist-scroll" tabIndex={0} aria-label="Scrollable album art gallery">
            {cover.map((item, i) => (
              <article className={"album-card album-" + (i + 1)} key={item.title}>
                <img src={item.src} alt="" loading="lazy" referrerPolicy="no-referrer" />
                <div><strong>{item.title}</strong><span>{item.artist}</span></div>
                <span className="album-spark" aria-hidden="true">✦</span>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="container map-game-wrap">
        <a className="map-game-card" href="https://dhwanibagrecha.com/about-me" target="_blank" rel="noreferrer">
          <span className="eyebrow">a tiny game about a big world</span>
          <strong>Where in my world is this?</strong>
          <span>Guess a place from my life. Every wrong answer gives you a direction. <b>Play the map game ↗</b></span>
          <span className="map-game-globe" aria-hidden="true">◎</span>
        </a>
      </div>
    </section>
  )
}
