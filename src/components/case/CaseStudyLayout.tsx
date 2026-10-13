import Link from "next/link"
import type { CaseStudy } from "@/content/caseStudies"
import { AnnotatedScreen } from "./AnnotatedScreen"
import { AssetSlot } from "./AssetSlot"
import { BeforeAfter } from "./BeforeAfter"
import { OwnerTag } from "./OwnerTag"
import { PrototypeEmbed } from "./PrototypeEmbed"
import { ScreenViewer } from "./ScreenViewer"
import s from "./CaseStudyLayout.module.css"

/**
 * One framework for every case study:
 * intro → hero → my part → context → decisions → product → iteration → evaluation → outcome.
 * Sections without real material are omitted rather than padded.
 */
export function CaseStudyLayout({ study, next }: { study: CaseStudy; next?: { slug: string; name: string; product: string } }) {
  const sections: { id: string; title: string; body: React.ReactNode }[] = []

  sections.push({
    id: "context",
    title: "Context",
    body: <div className={s.prose}>{study.context.map((p) => <p key={p}>{p}</p>)}</div>,
  })

  sections.push({
    id: "decisions",
    title: "Key decisions",
    body: (
      <ol className={s.decisions}>
        {study.decisions.map((d, i) => (
          <li key={d.title} className={s.decision}>
            <div className={s.decisionHead}>
              <span className={s.decisionNum}>{String(i + 1).padStart(2, "0")}</span>
              <h3>{d.title}</h3>
              <OwnerTag owner={d.owner} />
            </div>
            <dl className={s.decisionBody}>
              <div><dt>Chose</dt><dd>{d.chose}</dd></div>
              <div><dt>Over</dt><dd className={s.rejected}>{d.over}</dd></div>
              <div><dt>Because</dt><dd>{d.because}</dd></div>
              <div><dt>Evidence</dt><dd className={s.evidence}>{d.evidence}</dd></div>
            </dl>
          </li>
        ))}
      </ol>
    ),
  })

  const hasProduct = study.experience || study.prototype || study.slots?.length
  if (hasProduct) {
    sections.push({
      id: "product",
      title: study.experience?.heading ?? "Product experience",
      body: (
        <div className={s.stack}>
          {study.experience && (
            <>
              <p className={s.sectionIntro}>{study.experience.intro}</p>
              {study.experience.screens.map((screen) =>
                screen.annotations?.length ? <AnnotatedScreen key={screen.src} screen={screen} /> : <ScreenViewer key={screen.src} screens={[screen]} label={screen.caption} />,
              )}
            </>
          )}
          {study.prototype && <PrototypeEmbed url={study.prototype.url} title={study.prototype.title} note={study.prototype.note} />}
          {study.slots?.length ? (
            <div className={s.slotGrid}>{study.slots.map((slot) => <AssetSlot key={slot.label} slot={slot} />)}</div>
          ) : null}
        </div>
      ),
    })
  }

  if (study.beforeAfter) {
    const ba = study.beforeAfter
    sections.push({
      id: "iteration",
      title: ba.heading,
      body: <BeforeAfter before={ba.before} after={ba.after} changed={ba.changed} why={ba.why} evidence={ba.evidence} />,
    })
  }

  sections.push({
    id: "evaluation",
    title: "Evaluation",
    body: (
      <div className={s.evalGrid}>
        <div className={s.evalMethod}><h3>What we did</h3><p>{study.evaluation.method}</p></div>
        <div><h3>What we learned</h3><ul>{study.evaluation.learned.map((l) => <li key={l}>{l}</li>)}</ul></div>
        <div><h3>Not tested</h3><ul className={s.untested}>{study.evaluation.notTested.map((l) => <li key={l}>{l}</li>)}</ul></div>
      </div>
    ),
  })

  sections.push({
    id: "outcome",
    title: "Outcome",
    body: (
      <div className={s.outcome}>
        <div><h3>Confirmed</h3><p>{study.outcome.confirmed}</p></div>
        <div><h3>Limits</h3><p>{study.outcome.limitation}</p></div>
        <div className={s.nextQ}><h3>Next question</h3><p>{study.outcome.next}</p></div>
        {study.ai && <div className={s.aiNote}><h3>Where AI fits</h3><p>{study.ai}</p></div>}
        {study.links?.length ? (
          <p className={s.links}>{study.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">{l.label} ↗</a>)}</p>
        ) : null}
      </div>
    ),
  })

  return (
    <article className={s.page}>
      <header className={s.intro}>
        <Link href="/#work" className={s.back}>← All work</Link>
        <p className={s.org}>{study.org}</p>
        <h1 className={s.name}>{study.name}<span className={s.dot} aria-hidden="true">.</span></h1>
        <p className={s.product}>{study.product}</p>
        <dl className={s.meta}>
          <div><dt>My role</dt><dd>{study.role}</dd></div>
          <div><dt>Team</dt><dd>{study.team}</dd></div>
          <div><dt>Timeline</dt><dd>{study.timeline}</dd></div>
          <div><dt>Status</dt><dd>{study.status}</dd></div>
        </dl>
      </header>

      <section className={s.hero} aria-label="Project work">
        {study.hero.type === "screens" ? (
          <>
            <ScreenViewer screens={study.hero.screens} label={`${study.name} screens`} />
            <p className={s.heroCaption}>{study.hero.caption}</p>
          </>
        ) : (
          <AssetSlot slot={study.hero.slot} />
        )}
      </section>

      <section className={s.atGlance} aria-label="Case study at a glance">
        <span className={s.kicker}>The project in three points</span>
        <ol className={s.glanceItems}>
          <li><span>01 / The challenge</span><strong>{study.challenge ?? study.context[0]}</strong></li>
          <li><span>02 / What changed</span><strong>{study.decisions[0]?.chose}</strong></li>
          <li><span>03 / What we made</span><strong>{study.outcome.confirmed}</strong></li>
        </ol>
      </section>

      <section className={s.part} aria-labelledby="my-part">
        <h2 id="my-part" className={s.kicker}>My part</h2>
        <div className={s.partGrid}>
          <div><h3>What I did</h3><ul>{study.contributions.mine.map((c) => <li key={c}>{c}</li>)}</ul></div>
          {study.contributions.team?.length ? <div><h3>What the team did</h3><ul>{study.contributions.team.map((c) => <li key={c}>{c}</li>)}</ul></div> : null}
        </div>
      </section>

      <nav className={s.toc} aria-label="On this page">
        {sections.map((sec, i) => <a key={sec.id} href={`#${sec.id}`}><span>{String(i + 1).padStart(2, "0")}</span>{sec.title}</a>)}
      </nav>

      {sections.map((sec, i) => (
        <section key={sec.id} id={sec.id} className={s.section} aria-labelledby={`${sec.id}-h`}>
          <h2 id={`${sec.id}-h`} className={s.sectionTitle}><span>{String(i + 1).padStart(2, "0")}</span>{sec.title}</h2>
          {sec.body}
        </section>
      ))}

      {next && (
        <nav className={s.next} aria-label="Next case study">
          <Link href={`/work/${next.slug}`}>
            <span className={s.kicker}>Next case study</span>
            <span className={s.nextName}>{next.name} →</span>
            <span className={s.nextProduct}>{next.product}</span>
          </Link>
        </nav>
      )}
    </article>
  )
}
