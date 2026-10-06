import Link from "next/link"
import Image from "next/image"
import { PhotoArchive } from "@/components/PhotoArchive"
import { PersonalPlay } from "@/components/PersonalPlay"
import styles from "./about.module.css"

export const metadata = { title: "About · Dhwani Bagrecha" }

const ways = [
 {title:"Watch what people actually do.",project:"BRIEFS",href:"/work/briefs",body:"My first contextual inquiry meant observing dispatchers at work. I mapped the building lookup across documents and tools before shaping the information architecture."},
 {title:"Make sense of it together.",project:"Open Library",href:"/work/openlibrary",body:"I contributed to interviews, my first affinity map and organizing the final report. The work moved from individual observations to shared recommendations."},
 {title:"Question it. Then make it tangible.",project:"GM Convoy",href:"/work/general-motors",body:"I challenged the biometric direction and helped pivot toward group coordination. I learned advanced Figma prototyping, built reusable components and worked on our first shared team design system."}
]
export default function About() {
 return <div className="about">
  <section className={`container ${styles.hero}`} aria-labelledby="about-title">
   <div><p className="eyebrow">the person behind the work</p><h1 id="about-title">Hi, I’m Dhwani.<br/>Here’s how I <em>think.</em></h1>
   <p className={styles.intro}>I’m a graduate student studying UX research and design at the University of Michigan. My projects span emergency dispatch, reading access and in-vehicle experiences.</p>
   <div className={styles.heroLinks}><a href="#how-i-work">How I work ↓</a><Link href="/#work">Explore my projects ↗</Link><Link href="/#contact">Say hi ↗</Link></div></div>
   <figure className={styles.portrait}><Image src="/photobooth/1.svg" alt="Dhwani by a city window" width={600} height={450} sizes="(max-width:750px) 340px,400px" unoptimized/><figcaption>Dhwani, away from the canvas.</figcaption><details className={styles.portraitNote}><summary>off the clock ↗</summary><p>I’m learning to DJ. You’ll find a little of that in my playlist.</p></details></figure>
  </section>
  <section id="how-i-work" className={`container ${styles.working}`} aria-labelledby="working-title" style={{scrollMarginTop:110}}>
   <p className="eyebrow">how I work</p><h2 id="working-title">Three ways you’ll see me work.</h2><p className={styles.hint}>Open a note. Each one connects to a project.</p><div className={styles.cards}>{ways.map((way,i)=><details key={way.project} className={styles.card}><summary><span className={styles.number}>{String(i+1).padStart(2,"0")} / {way.project}</span><strong>{way.title}</strong><span>See the example ↗</span></summary><p>{way.body}</p><Link href={way.href}>See it in {way.project} ↗</Link></details>)}</div>
  </section>
  <PhotoArchive/>
  <PersonalPlay/>
  <section className="container map-game-link-section"><a className="map-game-link-card" href="/map-game"><span className="eyebrow">take a little detour</span><strong>Where in my world is this?</strong><span>Play my local map game <b>↗</b></span><span className="map-link-spark" aria-hidden="true">✳</span></a></section>
  <section className={`container ${styles.close}`}><Link href="/#work">See how these choices play out in my work ↗</Link></section>
 </div>
}
