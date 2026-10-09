import Link from "next/link"
import { AboutWorld } from "@/components/AboutWorld"
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
  <AboutWorld/>
  <section id="how-i-work" className={`container ${styles.working}`} aria-labelledby="working-title" style={{scrollMarginTop:110}}>
   <p className="eyebrow">how I work</p><h2 id="working-title">Observe. Connect. Question.</h2><p className={styles.hint}>Three habits, with real projects behind them.</p><div className={styles.cards}>{ways.map((way,i)=><details key={way.project} className={styles.card}><summary><span className={styles.number}>{String(i+1).padStart(2,"0")} / {way.project}</span><strong>{way.title}</strong><span>See the example ↗</span></summary><p>{way.body}</p><Link href={way.href}>See it in {way.project} ↗</Link></details>)}</div>
  </section>
  <details id="playlist" className={`container ${styles.playlist}`} style={{scrollMarginTop:110}}><summary>A little off the clock: my playlist ↗</summary><PersonalPlay/></details>
  <details className={`container ${styles.playlist}`}><summary>The little photo archive + printer ↗</summary><PhotoArchive/></details>
  <section className={`container ${styles.close}`}><Link href="/lab">Want to play? Explore my AI Lab ↗</Link></section>
  <section className={`container ${styles.close}`}><Link href="/#work">See how these choices play out in my work ↗</Link></section>
 </div>
}
