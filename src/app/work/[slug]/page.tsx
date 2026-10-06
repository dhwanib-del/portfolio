import Link from "next/link"
import { DecisionComments } from "@/components/case/DecisionComments"
import { BudgetStory } from "@/components/case/BudgetStory"
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
  const decisionNotes = {"briefs":[{"label":"Observation","method":"Contextual inquiry","title":"Retrieval and verification were separate tasks.","body":"The field notes describe a PDF lookup followed by a separate contact check. A search improvement could leave that second task unresolved."},{"label":"Finding","method":"Contextual inquiry","title":"What changed our understanding","body":"The field notes show a PDF lookup followed by a separate check that the contact was current. Outdated records made ownership a design question too."},{"label":"Decision","method":"Information architecture","title":"Keep urgent information in view.","body":"Stable information areas and a pinned strip gave the profile a predictable structure. Proposed assistant answers point back to approved records. The prototype does not establish record ownership or prove faster lookups. I would test retrieval and verification, then check how corrections reach the underlying records."}],"intel":[{"label":"Observation","method":"Stakeholder interviews","title":"The next person needed context.","body":"Six analyst interviews informed the workflow around case history, current status and ownership. My facilitation made room for quieter voices."},{"label":"Finding","method":"Stakeholder interviews","title":"What changed our understanding","body":"Interviews with six analysts revealed intake across email, phone and spreadsheets. The shared workflow needed to preserve context for the next analyst."},{"label":"Decision","method":"Workflow design","title":"Connect the work before replacing the tools.","body":"I focused the workspace on continuity across handoffs while retaining the monitoring tools the team already used. The team uses the first workspace and is building a server version. I can report that follow-through; I cannot turn it into an unmeasured time-saving claim."}],"general-motors":[{"label":"Turning point","method":"Interview synthesis","title":"One driver was too narrow a starting point.","body":"The driver interview led me to challenge biometrics and advocate for a group-trip direction. We set aside four weeks of work."},{"label":"Finding","method":"Interview synthesis","title":"What changed our understanding","body":"A group interview redirected the project toward convoy coordination. Dhwani challenged the initial direction after four weeks of work."},{"label":"Decision","method":"Figma prototyping","title":"Give the phone and car different jobs.","body":"Planning stayed on the phone. The in-car concept focused on coordination. I built advanced interactions and reusable components for the prototype. The team conducted three tests in a physical cab setup. Group autonomy and driver distraction remain questions for further validation, not proven outcomes."}],"openlibrary":[{"label":"Finding","method":"Affinity mapping","title":"Language support was also a continuity problem.","body":"Across eight team interviews and 330 mapped data points, the report identifies tool switching, lost context and mistrust of technical translations."},{"label":"Finding","method":"Affinity mapping","title":"What changed our understanding","body":"Eight interviews and 330 affinity points showed fragmented reading workflows and distrust of technical translation. Adding translation alone would not resolve those problems."},{"label":"Decision","method":"Research synthesis","title":"Bring existing help into the reading flow.","body":"We recommended more visible translation access, grouped comprehension tools and contextual prompts. These were proposals, not a tested redesign. Technical, copyright and privacy constraints required stakeholder review. The reading-flow recommendations were not implemented or tested with readers."}],"budgetcart":[{"label":"Finding","method":"Prototype testing","title":"Simplification removed decision cues.","body":"Testing the early concept showed difficulty finding items and judging the cart when brands, stores and prices were hidden."},{"label":"Finding","method":"Prototype testing","title":"What changed our understanding","body":"Prototype testing showed that hiding brands, stores and prices made recommendations harder to judge. The revised direction restored those decision cues."},{"label":"Decision","method":"Figma components","title":"Show the detail at the choice.","body":"The revised direction kept price and budget context visible and clarified store selection. My work included interviews, paper prototypes and teaching myself Figma components. This remains a student prototype. I would test whether shoppers can explain a recommendation, adjust it, and judge whether it fits their budget and needs."}]}
  const timelines = {"briefs":{"planned":"Make the building lookup easier.","learned":"The field notes show a PDF lookup followed by a separate check that the contact was current. Outdated records made ownership a design question too."},"intel":{"planned":"Connect a fragmented case history.","learned":"Interviews with six analysts revealed intake across email, phone and spreadsheets. The shared workflow needed to preserve context for the next analyst."},"general-motors":{"planned":"Explore biometrics for one driver.","learned":"A group interview redirected the project toward convoy coordination. Dhwani challenged the initial direction after four weeks of work."},"openlibrary":{"planned":"Understand language support for international students.","learned":"Eight interviews and 330 affinity points showed fragmented reading workflows and distrust of technical translation. Adding translation alone would not resolve those problems."},"budgetcart":{"planned":"Simplify grocery choices under budget constraints.","learned":"Prototype testing showed that hiding brands, stores and prices made recommendations harder to judge. The revised direction restored those decision cues."}}
  const notes = decisionNotes[c.slug as keyof typeof decisionNotes]


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
      {(c.video || figures[0]) && <div className="container case-media">
        {c.video ? <CaseVideo src={c.video} label="Project walkthrough video" /> :
          figures[0] ? <Figure f={figures[0]} /> : null}
      </div>}


      <div className="container case-body">
        {c.slug !== "budgetcart" && c.sections.slice(0, 2).map((s, index) => <Sec key={s.heading} s={s} index={index} />)}
      </div>
      {c.scene === "briefs" && <BriefsBeforeAfter />}
      {c.slug === "budgetcart" && <BudgetStory />}
      <div className="container case-body">
        {c.slug !== "budgetcart" && c.decision && <div id="story-decision" className={styles.turn}><p className="eyebrow">The choice that changed the direction</p><MarginalDecision {...c.decision} /></div>}
      </div>
      {notes && <div className="container case-body"><DecisionComments notes={notes} timeline={timelines[c.slug as keyof typeof timelines]} /></div>}
      {c.slug === "intel" && <IntelHandoff />}
      <div className="container case-body">
        {c.sections.slice(2).map((s, index) => <Sec key={s.heading} s={s} index={index + 2} />)}
        {c.ai && (
          <aside className="case-ai" aria-label="Where AI fit">
            <p className="eyebrow">where AI fit</p>
            <p>{c.ai}</p>
          </aside>
        )}
      </div>

      {c.claim && <div className="container"><Claim {...c.claim} /></div>}
      {c.stats && <div className="container case-media"><Stats items={c.stats} /></div>}

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
