import Link from "next/link"
import { notFound } from "next/navigation"
import { cases } from "@/content/cases"
import { projects } from "@/content/site"
import { CaseVideo, Claim, Decision, Stats } from "@/components/case/Scenes"
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

      <div className="container case-media">
        <CaseVideo src={c.video} label="Screen recording coming soon" />
        {c.stats && <Stats items={c.stats} />}
      </div>
      {c.figures[0] && <Figure f={c.figures[0]} />}

      {c.claim && <div className="container"><Claim {...c.claim} /></div>}

      <div className="container case-body">
        {c.sections.slice(0, 1).map((s) => <Sec key={s.heading} s={s} />)}
      </div>
      {c.scene === "briefs" && <BriefsBeforeAfter />}
      <div className="container case-body">
        {c.sections.slice(1).map((s) => <Sec key={s.heading} s={s} />)}
        {c.decision && <Decision {...c.decision} />}
        {c.ai && (
          <aside className="case-ai" aria-label="Where AI fit">
            <p className="eyebrow">where AI fit</p>
            <p>{c.ai}</p>
          </aside>
        )}
      </div>

      {c.figures.slice(1).map((f) => <Figure key={f.src} f={f} />)}

      <div className="container case-body">
        <section className="case-sec case-result">
          <h2>Where it stands</h2>
          <p>{c.status}</p>
          <p><strong>Next question:</strong> {c.next}</p>
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

function Figure({ f }: { f: { src: string; alt: string; caption: string; video?: boolean } }) {
  return (
    <figure className="case-fig container">
      {f.video ? <video src={f.src} muted loop playsInline autoPlay controls aria-label={f.alt} /> : <img src={f.src} alt={f.alt} loading="lazy" />}
      <figcaption>{f.caption}</figcaption>
    </figure>
  )
}

function Sec({ s }: { s: { heading: string; body: string[] } }) {
  return (
    <section className="case-sec">
      <h2>{s.heading}</h2>
      {s.body.map((p) => <p key={p}>{p}</p>)}
    </section>
  )
}
