import Link from "next/link"
import { InfiniteGallery } from "@/components/play/InfiniteGallery"
import { Orbit } from "@/components/play/Orbit"
import { who, principles, lore, opinions, playlist, offClock, brainOS, openTabs, hiring, moments } from "@/content/about"

export const metadata = { title: "About · Dhwani Bagrecha" }

const Tabs = ({ items, open }: { items: { key: string; text: string }[]; open?: number }) => (
  <div className="tabs">
    {items.map((t, i) => (
      <details key={t.key} className="tab" open={i === open}>
        <summary><span className="tab-key">{t.key}</span><span className="tab-icon" aria-hidden="true">+</span></summary>
        <p>{t.text}</p>
      </details>
    ))}
  </div>
)

export default function About() {
  return (
    <div className="case about">
      <div className="container">
        <p className="eyebrow">about me</p>
        <h1 className="case-h1">Who is Dhwani</h1>
        <p className="case-hook">I&apos;m interested in the weird little systems people build to survive their lives: workflows, playlists, food maps, group chats, rituals, shortcuts, dashboards, and forms that absolutely should not exist.</p>
      </div>

      <div className="container"><InfiniteGallery items={moments} label="Moments from my life" /></div>

      <section className="container about-sec" aria-labelledby="who-h">
        <p className="eyebrow">01 · who i am</p>
        <h2 id="who-h" className="h2">So, who is Dhwani?</h2>
        <dl className="who">{who.map((w) => <div key={w.label}><dt>{w.label}</dt><dd>{w.text}</dd></div>)}</dl>
      </section>

      <section className="container about-sec" aria-labelledby="how-h">
        <p className="eyebrow">02 · how i work</p>
        <h2 id="how-h" className="h2">Four things I bring to every project.</h2>
        <ol className="principles">{principles.map((p) => <li key={p.n}><span className="pr-n">{p.n}</span><h3>{p.title}</h3><p>{p.text}</p></li>)}</ol>
      </section>

      <section className="container about-sec" aria-labelledby="lore-h">
        <p className="eyebrow">03 · the lore</p>
        <h2 id="lore-h" className="h2">The lore.</h2>
        <ol className="lore">{lore.map((l) => <li key={l.place}><p className="lore-k">{l.place} <span>· {l.tag}</span></p><p>{l.text}</p></li>)}</ol>
      </section>

      <section className="container about-sec" aria-labelledby="op-h">
        <p className="eyebrow">04 · strong opinions</p>
        <h2 id="op-h" className="h2">Things I have strong opinions about.</h2>
        <ul className="exhibits">{opinions.map((o, i) => <li key={o}><span>Exhibit {String.fromCharCode(65 + i)}</span>{o}</li>)}</ul>
      </section>

      <div className="container"><Orbit tracks={playlist} /></div>

      <section className="container about-sec" aria-labelledby="off-h">
        <p className="eyebrow">05 · off the clock</p>
        <h2 id="off-h" className="h2">Outside the Figma file.</h2>
        <ul className="offclock">{offClock.map((o) => <li key={o.title}><h3>{o.title}</h3><p>{o.text}</p></li>)}</ul>
      </section>

      <section className="container about-sec" aria-labelledby="os-h">
        <p className="eyebrow">06 · how my brain runs</p>
        <h2 id="os-h" className="h2">Personal operating system.</h2>
        <dl className="brainos">{brainOS.map((b) => <div key={b.k}><dt>{b.k}</dt><dd>{b.v}</dd></div>)}</dl>
      </section>

      <section className="container about-sec" aria-labelledby="tabs-h">
        <p className="eyebrow">07 · open tabs</p>
        <h2 id="tabs-h" className="h2">Open tabs in my brain.</h2>
        <Tabs items={openTabs} open={0} />
      </section>

      <section className="container about-sec" aria-labelledby="hire-h">
        <p className="eyebrow">08 · if you&apos;re hiring</p>
        <h2 id="hire-h" className="h2">Product, UX or experience design roles after May 2027.</h2>
        <Tabs items={hiring} open={0} />
      </section>

      <section className="container about-sec" aria-labelledby="hi-h">
        <p className="eyebrow">09 · say hi</p>
        <h2 id="hi-h" className="h2">Send a signal.</h2>
        <p className="lede">For research, design, weird systems, or vegetarian food recommendations.</p>
        <p className="signal">hey, internet wanderer. thanks for scrolling all the way down here. one thing i believe: the best work happens when people feel seen enough to speak up, in research sessions, in teams, everywhere. if that sounds like how you build things, we should talk.</p>
        <p><Link className="btn btn-primary" href="/#contact">Get in touch</Link></p>
      </section>
    </div>
  )
}
