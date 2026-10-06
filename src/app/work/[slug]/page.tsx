import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { cases } from "@/content/cases"
import { caseStories } from "@/content/caseStories"
import { projects } from "@/content/site"
import { CaseStoryPlayer } from "@/components/case/CaseStoryPlayer"
import { DecisionComments } from "@/components/case/DecisionComments"
import { CaseVideo } from "@/components/case/Scenes"
import styles from "./story.module.css"

export function generateStaticParams() {
 return [...cases.map(c=>({slug:c.slug})),{slug:"prime-video"}]
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params
 const c=cases.find(x=>x.slug===slug)
 return {title:c?`${c.org.split(" · ")[0]} · Dhwani Bagrecha`:"Prime Video · Dhwani Bagrecha",description:c?.hook}
}
export default async function CasePage({params}:{params:Promise<{slug:string}>}) {
 const {slug}=await params
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

 const c=cases.find(x=>x.slug===slug)
 if(!c) notFound()
 const story=caseStories[slug]
 const order=projects.filter(p=>!p.nda)
 const next=order[(order.findIndex(p=>p.slug===slug)+1)%order.length]
 const methods:Record<string,string>={briefs:"Contextual inquiry",intel:"Stakeholder interviews","general-motors":"Figma prototyping",openlibrary:"Affinity mapping",budgetcart:"Prototype testing"}
 const notes=[
  {label:"Problem",method:methods[slug],title:"The question I started with",body:story.doubt},
  {label:"Finding",method:"Research synthesis",title:"What changed my understanding",body:story.finding},
  {label:"Decision",method:slug==="general-motors"||slug==="budgetcart"?"Figma components":"Information architecture",title:"The call I made",body:story.call}
 ]
 const starts:Record<string,string>={briefs:"Make building information easier to retrieve.",intel:"Connect a case history fragmented across intake and spreadsheets.","general-motors":"Explore biometrics for one driver.",openlibrary:"Understand language support for multilingual readers.",budgetcart:"Simplify grocery choices under budget and eligibility constraints."}
 return <article className="case">
  <header className={`container case-head ${styles.storyHead}`}>
   <Link href="/#work" className={styles.back}>← Selected work</Link>
   <p className="eyebrow">{c.org}</p>
   <h1 className="case-h1">{c.headline}</h1>
   <dl className={styles.quickScan}><div><dt>My decision</dt><dd>{story.move}</dd></div><div><dt>Where it stands</dt><dd>{story.result}</dd></div></dl>
   <dl className="case-meta">{c.meta.filter(m=>m.label!=="Status"&&m.label!=="Read").map(m=><div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}</dl>
   <p className={styles.readCue}>A short story in seven scenes. Skim the summary, or follow the decisions.</p>
  </header>
  <div className="container"><CaseStoryPlayer project={c} story={story}/></div>
  {c.video && <div className="container case-media"><CaseVideo src={c.video} label="Project walkthrough video"/></div>}
  {c.figures.filter(f=>f.src).map(f=><figure className="case-fig container" key={f.src}>{f.video?<video src={f.src} controls muted playsInline aria-label={f.alt}/>:<Image src={f.src!} alt={f.alt} width={1600} height={1000} sizes="(max-width:1104px) 100vw,1104px" style={{width:"100%",height:"auto"}}/>}<figcaption>{f.caption}</figcaption></figure>)}
  <div className={`container ${styles.appendix}`}>
   <details className={styles.fullRead}><summary>Read the whole story on one page <span>↗</span></summary><div className={styles.readingCopy}>
    <p>{c.hook}</p>{c.sections.map(s=><section key={s.heading}><h2>{s.heading}</h2>{s.body.map(p=><p key={p}>{p}</p>)}</section>)}
    <section><h2>The decision</h2><p>{c.decision?.decision}</p><p>{c.decision?.why}</p></section>
    <section><h2>{story.lens}</h2><p>{story.theory} {story.interpretation}</p><a href="https://www.nngroup.com/articles/ten-usability-heuristics/" target="_blank" rel="noreferrer">Nielsen · heuristic {story.source} ↗</a></section>
    {c.ai && <section><h2>Where AI fit</h2><p>{c.ai}</p></section>}
    <section><h2>Where it stands</h2><p>{c.status}</p><p><strong>Next question:</strong> {c.next}</p></section>
   </div></details>
   <details className={styles.fullRead}><summary>Open my working folder <span>3 notes · plan vs learning ↗</span></summary><DecisionComments notes={notes} timeline={{planned:starts[slug],learned:story.finding}}/></details>
   <p className={styles.credit}>Story pacing inspired by <a href="https://growth.design/case-studies/apple-sleep-notification" target="_blank" rel="noreferrer">Growth.Design’s Apple sleep story</a>. Project facts and authored narration are Dhwani’s; interactive schematics are labeled.</p>
   <nav className="case-next" aria-label="Next case study"><Link href={`/work/${next.slug}`}><span className="eyebrow">next story</span><span className="case-next-t">{next.title}</span><span className="case-next-r">{next.result} →</span></Link></nav>
  </div>
 </article>
}
