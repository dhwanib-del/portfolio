import { Bubble } from "@/components/Bubble"
import { WelcomeChat } from "@/components/WelcomeChat"
import { WorkReel } from "@/components/WorkReel"
import TheSet from "@/components/ExperienceMixer"
import { bubbleLines, experience, person, projects } from "@/content/site"

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-name">
        <div>
          <p className="hero-hi">hi, i&apos;m</p>
          <h1 id="hero-name" className="hero-name">{person.name}</h1>
          <p className="hero-line">I design thoughtful products for complicated, real-world workflows.</p>
          <WelcomeChat />
          <ul className="hero-meta" aria-label="At a glance">
            <li>{person.roles}</li>
            <li>UMSI · May 2027</li>
            <li>Ann Arbor · open to relocate</li>
          </ul>
          <Bubble lines={bubbleLines} />
        </div>
      </section>


      <WorkReel projects={projects} eyebrow="selected work" heading="Complex work, made clearer." />

      <section className="section"><div className="container"><TheSet roles={experience.map((r) => ({ ...r, skills: ({
            "Adobe": "workshops, content, campus events",
            "U-M Division of Public Safety & Security": "contextual inquiry, workflow mapping, prototyping, PRDs, stakeholder interviews",
            "General Motors": "prototyping, usability testing, Figma",
            "Iska Press for African Perspectives": "research, project management",
            "SOCHI, University of Michigan": "product strategy, research, project management",
            "U-M Global Scholars Program": "team leadership, community programming",
            "Open Library": "interviews, affinity mapping, research synthesis",
            "MSU College of Social Science": "eye-tracking data, analysis",
            "Miller Johnson": "internal systems, operations",
            "DDB Mudra Group": "accessibility research, representation"
          } as Record<string, string>)[r.org] || "" }))} eyebrow="experience" title="The *set* so far" intro="Research, design and leading teams. Newest first." visibleCount={6} /></div></section>



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
