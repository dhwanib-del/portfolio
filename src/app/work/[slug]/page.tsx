import Link from "next/link"
import { IntelHandoff, MarginalDecision } from "@/components/case/StoryInteractions"
import styles from "./story.module.css"
import { notFound } from "next/navigation"
import { cases } from "@/content/cases"
import { projects } from "@/content/site"
import { CaseVideo, Claim, Stats } from "@/components/case/Scenes"
import { BriefsBeforeAfter } from "@/components/case/BeforeAfter"

export function generateStaticParams() {
  return [...cases.map((c) => ({ slug: c.slug })), { slug: "prime-video" }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = cases.find((x) => x.slug === slug)
  return { title: c ? `${c.org.split(" · ")[0]} · Dhwani Bagrecha` : "Prime Video · Dhwani Bagrecha" }
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === "prime-video") {
    return (
      <article className="case container">
        <p className="eyebrow">Prime Video · Capstone</p>
        <h1 className="case-h1">Under NDA.</h1>
        <p className="case-hook">This is my current capstone with Prime Video. Nothing goes on the site until it&apos;s cleared, but I&apos;m happy to walk you through the process in a conversation.</p>
        <p><Link className="btn" href="/#contact">Get in touch</Link></p>
      </article>
    )
  }
  const c = cases.find((x) => x.slug === slug)
  if (!c) notFound()
  const order = projects.filter((p) => !p.nda)
  const i = order.findIndex((p) => p.slug === slug)
  const next = order[(i + 1) % order.length]

  const figures = c.figures.filter((f) => f.src)

  return (
    <article className="case">
      <header className="container case-head">
        <p className="eyebrow">{c.org}</p>
        <h1 className="case-h1">{c.headline}</h1>
        <p className="case-hook">{c.hook}</p>
        <dl className="case-meta">
          {c.meta.map((m) => (
            <div key={m.label}>
              <dt>{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <nav className={`container ${styles.chapters}`} aria-label="Story chapters">
        <a href="#scene-1"><span>01</span> The friction</a>
        {c.decision && <a href="#story-decision"><span>02</span> The decision</a>}
        <a href="#story-evidence"><span>03</span> The evidence</a>
      </nav>
      {(c.video || figures[0] || c.stats) && <div className="container case-media">
        {c.video ? <CaseVideo src={c.video} label="Project walkthrough video" /> :
          figures[0] ? <Figure f={figures[0]} /> : null}
        {c.stats && <Stats items={c.stats} />}
      </div>}

      {c.claim && <div className="container"><Claim {...c.claim} /></div>}

      <div className="container case-body">
        {c.sections.slice(0, 1).map((s) => <Sec key={s.heading} s={s} index={0} />)}
      </div>
      {c.scene === "briefs" && <BriefsBeforeAfter />}
      <div className="container case-body">
        {c.decision && <div id="story-decision" className={styles.turn}><p className="eyebrow">The choice that changed the direction</p><MarginalDecision {...c.decision} /></div>}
      </div>
      {c.slug === "intel" && <IntelHandoff />}
      <div className="container case-body">
        {c.sections.slice(1).map((s, index) => <Sec key={s.heading} s={s} index={index + 1} />)}
        {c.ai && (
          <aside className="case-ai" aria-label="Where AI fit">
            <p className="eyebrow">where AI fit</p>
            <p>{c.ai}</p>
          </aside>
        )}
      </div>

      {figures.slice(c.video ? 0 : 1).map((f) => <Figure key={f.src} f={f} />)}

      <div className="container case-body">
        <section id="story-evidence" className={`case-sec case-result ${styles.evidence}`}>
          <p className="eyebrow">The evidence · and its limits</p>
          <h2>Where it stands</h2>
          <p>{c.status}</p>
          <p><strong>Next question:</strong> {c.next}</p>
          {!!c.links?.length && <nav className="case-resources" aria-label="Project resources">
            {c.links.map((link) => <a className="btn" key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>)}
          </nav>}
        </section>
        <nav className="case-next" aria-label="Next case study">
          <Link href={`/work/${next.slug}`}>
            <span className="eyebrow">next</span>
            <span className="case-next-t">{next.title}</span>
            <span className="case-next-r">{next.result} →</span>
          </Link>
        </nav>
      </div>
    </article>
  )
}

function Figure({ f }: { f: { src?: string; alt: string; caption: string; video?: boolean } }) {
  return (
    <figure className="case-fig container">
      {f.video ? <video src={f.src} muted loop playsInline controls aria-label={f.alt} /> : <img src={f.src} alt={f.alt} loading="lazy" />}
      <figcaption>{f.caption}</figcaption>
    </figure>
  )
}

function Sec({ s, index }: { s: { heading: string; body: string[] }; index: number }) {
  return (
    <section id={`scene-${index + 1}`} className={`case-sec ${styles.scene}`}>
      <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <div>
        <p className="eyebrow">{["The friction", "What changed", "What I learned"][index] || "The next beat"}</p>
        <h2>{s.heading}</h2>
        {s.body.map((p) => <p key={p}>{p}</p>)}
      </div>
    </section>
  )
}
