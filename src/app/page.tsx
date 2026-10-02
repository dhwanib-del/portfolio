import { Bubble } from "@/components/Bubble"
import { WorkReel } from "@/components/WorkReel"
import { Experience } from "@/components/Experience"
import { bubbleLines, experience, person, projects } from "@/content/site"

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-name">
        <div>
          <p className="hero-hi">hi, i&apos;m</p>
          <h1 id="hero-name" className="hero-name">{person.name}</h1>
          <p className="hero-line">I design for people making decisions under pressure.</p>
          <ul className="hero-meta" aria-label="At a glance">
            <li>{person.roles}</li>
            <li>UMSI · May 2027</li>
            <li>Ann Arbor · open to relocate</li>
          </ul>
          <Bubble lines={bubbleLines} />
        </div>
      </section>

      <WorkReel projects={projects} eyebrow="selected work" heading="Six projects. Real outcomes, or an honest status." />

      <Experience roles={experience} />

      <section id="contact" className="section contact" aria-labelledby="contact-h">
        <div className="container">
          <p className="eyebrow">connect</p>
          <h2 id="contact-h" className="h2">Hiring for product, UX or experience design? Let&apos;s talk.</h2>
          <div className="contact-actions">
            {person.email && <a className="btn btn-primary" href={`mailto:${person.email}`}>Email me</a>}
            {person.linkedin && <a className="btn" href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}
            {person.resume && <a className="btn" href={person.resume}>Résumé (PDF)</a>}
          </div>
        </div>
      </section>
    </>
  )
}
