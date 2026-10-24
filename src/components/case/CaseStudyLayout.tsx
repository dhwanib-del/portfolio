import Link from "next/link"
import type { CaseStudy } from "@/content/caseStudies"
import { AnnotatedScreen } from "./AnnotatedScreen"
import { AssetSlot } from "./AssetSlot"
import { BeforeAfter } from "./BeforeAfter"
import { OwnerTag } from "./OwnerTag"
import { PrototypeEmbed } from "./PrototypeEmbed"
import { CinematicDeviceReveal } from "./CinematicDeviceReveal"
import { DecisionStudio } from "./DecisionStudio"
import { CaseChapterRail } from "./CaseChapterRail"
import { EvidenceTurntable } from "./EvidenceTurntable"
import { caseSignals } from "@/content/caseSignals"
import { ScreenViewer } from "./ScreenViewer"
import s from "./CaseStudyLayout.module.css"

const OPENING_LINES: Record<string,string> = {
  "general-motors": "One conversation changed the entire concept.",
  briefs: "A single building lookup crossed ten tools.",
  intel: "The case history was split across systems.",
  budgetcart: "A cleaner browse screen hid the clues shoppers needed.",
  openlibrary: "The problem wasn’t missing tools. It was switching between them.",
}

function estimatedReadingTime(study: CaseStudy) {
  const text = [
    study.product, study.challenge, study.context.join(" "),
    ...study.decisions.flatMap(d=>[d.title,d.chose,d.over,d.because,d.evidence]),
    ...study.contributions.mine, ...study.evaluation.learned,
    study.outcome.confirmed, study.outcome.limitation,
  ].filter(Boolean).join(" ")
  return Math.max(2,Math.ceil(text.trim().split(/\\s+/).length/200))
}

/**
 * One framework for every case study:
 * intro → hero → my part → context → decisions → product → iteration → evaluation → outcome.
 * Sections without real material are omitted rather than padded.
 */
export function CaseStudyLayout({ study, next }: { study: CaseStudy; next?: { slug: string; name: string; product: string } }) {
  const sections: { id: string; title: string; body: React.ReactNode }[] = []

  sections.push({
    id: "context",
    title: study.slug === "general-motors" ? "From the vehicle to the idea" : "The problem and the setting",
    body: <div className={s.prose}>{study.context.map((p) => <p key={p}>{p}</p>)}</div>,
  })

  sections.push({
    id: "decisions",
    title: study.slug === "general-motors" ? "The interface choices" : "Decisions that shaped the work",
    body: <DecisionStudio project={study.name} decisions={study.decisions} />,
  })

  const hasProduct = study.experience || study.prototype || study.slots?.length
  if (hasProduct) {
    sections.push({
      id: "product",
      title: study.experience?.heading ?? (study.slug === "general-motors" ? "From layouts to a shared design library" : "The experience"),
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
    title: "What testing could tell us",
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
    title: "Where the work landed",
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
        <div className={s.projectLine}><p className={s.org}>{study.org}</p><span className={s.readTime}>About {estimatedReadingTime(study)} min · a project story</span></div>
        <h1 className={s.name}>{study.name}<span className={s.dot} aria-hidden="true">.</span></h1>
        <p className={s.storyHook}>{OPENING_LINES[study.slug] ?? study.challenge ?? study.product}</p>
        <p className={s.product}>{study.product}</p>
        <dl className={s.meta}>
          <div><dt>My role</dt><dd>{study.role}</dd></div>
          <div><dt>Team</dt><dd>{study.team}</dd></div>
          <div><dt>Timeline</dt><dd>{study.timeline}</dd></div>
          <div><dt>Status</dt><dd>{study.status}</dd></div>
        </dl>
      </header>

      <section className={s.atGlance} aria-label="Case study at a glance">
        <div className={s.glanceHeading}><span className={s.kicker}>The short version</span><span className={s.glanceHint}>30-second read <span aria-hidden="true">↘</span></span></div>
        <ol className={s.glanceItems}>
          <li><span>01 / The challenge</span><strong>{study.challenge ?? study.context[0]}</strong></li>
          <li><span>02 / The decision</span><strong>{study.decisions[0]?.chose}</strong></li>
          <li><span>03 / Where it landed</span><strong>{study.outcome.confirmed}</strong></li>
        </ol>
      </section>

      {study.hero.type === "screens" ? (
        <section className={s.hero} aria-label="Actual project screens">
          <ScreenViewer screens={study.hero.screens} label={`${study.name} screens`} />
          <p className={s.heroCaption}>{study.hero.caption}</p>
        </section>
      ) : (
        <div className={s.artifactNotice}>
          <span className={s.artifactSymbol} aria-hidden="true">↗</span>
          <div><strong>{study.hero.slot.reason === "clearance" ? "Visuals are not cleared for publication." : "Original project visuals are being sourced."}</strong><p>{study.hero.slot.note}</p></div>
        </div>
      )}
      {caseSignals[study.slug] && <div className={s.receipt}><EvidenceTurntable project={study.name} signals={caseSignals[study.slug]} /></div>}

      {study.slug === "general-motors" && study.prototype?.url && <CinematicDeviceReveal initialUrl={study.prototype.url} />}

      <section className={s.part} aria-labelledby="my-part">
        <h2 id="my-part" className={s.kicker}>My part</h2>
        <div className={s.partGrid}>
          <div><h3>What I did</h3><ul>{study.contributions.mine.map((c) => <li key={c}>{c}</li>)}</ul></div>
          {study.contributions.team?.length ? <div><h3>What the team did</h3><ul>{study.contributions.team.map((c) => <li key={c}>{c}</li>)}</ul></div> : null}
        </div>
      </section>

      <CaseChapterRail chapters={sections.map(sec=>({id:sec.id,label:sec.title}))} />

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
