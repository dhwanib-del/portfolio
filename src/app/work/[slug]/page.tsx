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
 const snapshots:Record<string,{problem:string;finding:string;decision:string;before:string[];after:string[]}>={
 briefs:{problem:"A name in a PDF was not enough.",finding:"Dispatchers checked employment elsewhere.",decision:"Make urgent details visible—and checkable.",before:["Building PDF","Staff directory"],after:["Building profile","Urgent details + source"]},
 intel:{problem:"The next analyst inherited scattered context.",finding:"Request, owner and history needed to stay together.",decision:"Connect the case without replacing monitoring tools.",before:["Intake","Spreadsheets"],after:["Case workspace","Request + owner + history"]},
 "general-motors":{problem:"The brief focused on one driver.",finding:"The interview surfaced a group coordination task.",decision:"Design for the convoy, with planning separate from driving.",before:["One driver","Personalization"],after:["Whole group","Plan → coordinate"]},
 openlibrary:{problem:"Language help interrupted the book.",finding:"Readers switched tools and questioned translations.",decision:"Bring language support into the reading flow.",before:["Book","Separate language tools"],after:["Book + nearby support","Keep the page in view"]},
 budgetcart:{problem:"A simpler screen hid useful information.",finding:"Testing exposed missing price, brand and store cues.",decision:"Restore the cues people use to choose.",before:["Item","Hidden decision cues"],after:["Item + price / brand / store","Budget stays visible"]}
 }
 const snapshot=snapshots[slug]
 return <article className="case">
  <header className={`container case-head ${styles.storyHead}`}>
   <Link href="/#work" className={styles.back}>← Selected work</Link>
   <p className="eyebrow">{c.org}</p>
   <h1 className="case-h1">{c.headline}</h1>
   <section className={styles.fastStory} aria-label="The case in 30 seconds"><p className={styles.scanLabel}>THE STORY IN 30 SECONDS</p><div className={styles.plot}>{[{label:"The problem",text:snapshot.problem},{label:"The discovery",text:snapshot.finding},{label:"My decision",text:snapshot.decision}].map((beat,i)=><div key={beat.label}><span>{String(i+1).padStart(2,"0")} / {beat.label}</span><p>{i===2?<mark>{beat.text}</mark>:beat.text}</p></div>)}</div><figure className={styles.visualShift}><div><span className={styles.diagramLabel}>BEFORE</span><div className={styles.diagramCards}>{snapshot.before.map((label,i)=><div key={label}><svg viewBox="0 0 80 58" aria-hidden="true">{slug==="general-motors"?<><path d="M12 38h54v-15H48l-8-12H23l-9 12z"/><circle cx="24" cy="40" r="7"/><circle cx="55" cy="40" r="7"/>{i===1&&<path d="M48 11h18M57 4v14"/>}</>:slug==="openlibrary"&&i===0?<><path d="M40 12c-12-7-24-5-30-2v36c12-5 22-3 30 3 8-6 18-8 30-3V10c-6-3-18-5-30 2zM40 12v37"/><path d="M18 20h14M18 28h14M48 20h14M48 28h14"/></>:slug==="budgetcart"&&i===0?<><path d="M18 15h40l-3 30H23zM26 15V8h24v7M30 25h17M30 33h12"/><path d="M61 21v16" strokeDasharray="3 3"/></>:<><rect x="12" y="5" width="48" height="44" rx="5"/><path d="M22 18h28M22 27h19M22 36h25"/>{i===1&&<circle cx="61" cy="44" r="10"/>}</>}</svg><strong>{label}</strong></div>)}</div></div><span className={styles.shiftArrow} aria-hidden="true">→</span><div><span className={styles.diagramLabel}>THE DESIGN DIRECTION</span><div className={styles.connectedCard}><svg viewBox="0 0 160 65" aria-hidden="true"><rect x="8" y="8" width="56" height="48" rx="5"/><rect x="94" y="8" width="56" height="48" rx="5"/><path d="M18 22h35M18 32h25M18 42h30M104 22h35M104 32h25M104 42h30M65 32h28m-7-6 7 6-7 6"/></svg><strong>{snapshot.after[0]}</strong><span>{snapshot.after[1]}</span></div></div><figcaption>Illustrative workflow · {slug==="openlibrary"||slug==="briefs"?"proposal, not a shipped interface":slug==="intel"?"fictional demo context":"concept schematic"}</figcaption></figure></section>
   <dl className={styles.quickScan}><div><dt>My role</dt><dd>{c.meta.find(m=>m.label==="Role")?.value || "Design + research"}</dd></div><div><dt>Where it stands</dt><dd>{story.result}</dd></div></dl>
   <dl className="case-meta">{c.meta.filter(m=>m.label!=="Status"&&m.label!=="Read").map(m=><div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}</dl>
   <p className={styles.readCue}>Got the gist? Scroll for the evidence, or try the slide view.</p>
  </header>
  <div className="container"><CaseStoryPlayer project={c} story={story}/></div>
  {c.video && <div className="container case-media"><CaseVideo src={c.video} label="Project walkthrough video"/></div>}
  {c.figures.filter(f=>f.src).map(f=><figure className="case-fig container" key={f.src}>{f.video?<video src={f.src} controls muted playsInline aria-label={f.alt}/>:<Image src={f.src!} alt={f.alt} width={1600} height={1000} sizes="(max-width:1104px) 100vw,1104px" style={{width:"100%",height:"auto"}}/>}<figcaption>{f.caption}</figcaption></figure>)}
  <div className={`container ${styles.appendix}`}>
   <details className={styles.fullRead}><summary>Text-only version <span>↗</span></summary><div className={styles.readingCopy}>
    <p>{c.hook}</p>{c.sections.map(s=><section key={s.heading}><h2>{s.heading}</h2>{s.body.map(p=><p key={p}>{p}</p>)}</section>)}
    <section><h2>The decision</h2><p>{c.decision?.decision}</p><p>{c.decision?.why}</p></section>
    <section><h2>{story.lens}</h2><p>{story.theory} {story.interpretation}</p><a href={story.sourceUrl || "https://www.nngroup.com/articles/ten-usability-heuristics/"} target="_blank" rel="noreferrer">{story.sourceLabel || `Nielsen · heuristic ${story.source}`} ↗</a></section>
    {c.ai && <section><h2>Where AI fit</h2><p>{c.ai}</p></section>}
    <section><h2>Where it stands</h2><p>{c.status}</p><p><strong>Next question:</strong> {c.next}</p></section>
   </div></details>
   <details className={styles.fullRead}><summary>Open my working folder <span>3 notes · plan vs learning ↗</span></summary><DecisionComments notes={notes} timeline={{planned:starts[slug],learned:story.finding}}/></details>
   <p className={styles.credit}>Story pacing inspired by <a href="https://growth.design/case-studies/apple-sleep-notification" target="_blank" rel="noreferrer">Growth.Design’s Apple sleep story</a>. Project facts and authored narration are Dhwani’s; interactive schematics are labeled.</p>
   <nav className="case-next" aria-label="Next case study"><Link href={`/work/${next.slug}`}><span className="eyebrow">next story</span><span className="case-next-t">{next.title}</span><span className="case-next-r">{next.result} →</span></Link></nav>
  </div>
 </article>
}
