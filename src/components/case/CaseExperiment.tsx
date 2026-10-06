"use client"
import { useState } from "react"
import styles from "./CaseExperience.module.css"

export function CaseExperiment({ slug }: { slug: string }) {
 const [revised, setRevised] = useState(false)
 const [planning, setPlanning] = useState(true)
 const [help, setHelp] = useState(false)
 if (!["briefs","openlibrary","general-motors"].includes(slug)) return null
 const config = slug==="briefs"
  ? {title:"Trace the lookup.",before:"Observed lookup",after:"Proposed profile",method:"Information architecture"}
  : slug==="openlibrary"
  ? {title:"Keep the book in view.",before:"Separate tools",after:"Support in context",method:"Reading-flow concept"}
  : {title:"Change who the concept serves.",before:"One driver",after:"The whole group",method:"Figma prototyping"}
 return <section className={styles.experiment} aria-label={config.title}>
  <div className={styles.experimentHead}><div><p className="eyebrow">Try the design choice</p><h3>{config.title}</h3></div><span className={styles.stamp}>illustrative / interactive</span></div>
  <div className={styles.controls} role="group" aria-label="Compare directions">
   <button type="button" aria-pressed={!revised} onClick={()=>{setRevised(false);setHelp(false)}} data-cursor={config.method}>{config.before}</button>
   <button type="button" aria-pressed={revised} onClick={()=>setRevised(true)} data-cursor={config.method}>{config.after}</button>
  </div>
  <div className={styles.stage} aria-live="polite">
   {slug==="briefs" && (revised ? <div className={styles.profile}>
    <div className={styles.profileTop}><strong>Building profile</strong><span>proposed structure</span></div>
    <div className={styles.pinned}><span aria-hidden="true">↗</span><div><small>PINNED IN VIEW</small><strong>Urgent contact details</strong></div></div>
    <div className={styles.document}><span className={styles.tag}>approved source</span><h4>One predictable place</h4><p>Building information · source reference · missing information flagged</p></div>
    <p className={styles.unresolved}>Still to resolve: who verifies and maintains the record?</p>
   </div> : <div className={styles.lookup}>
    <div className={styles.document}><span className={styles.tag}>01 / retrieve</span><h4>Building PDF</h4><p>Find the listed contact.</p><div className={styles.paperLines} aria-hidden="true"><i/><i/><i/></div></div>
    <span className={styles.arrow} aria-hidden="true">→</span>
    <div className={styles.document}><span className={styles.tag}>02 / verify</span><h4>Staff directory</h4><p>Check current employment.</p><span className={styles.smallNote}>The lookup continues here.</span></div>
   </div>)}
   {slug==="openlibrary" && <div className={`${styles.reading} ${revised?styles.integrated:""}`}>
    <div className={styles.book}><span className={styles.bookmark} aria-hidden="true"/><small>THE BOOK</small><h4>Keep your place.</h4><div className={styles.paperLines} aria-hidden="true"><i/><i/><i/><i className={styles.selected}/><i/><i/></div>
     {revised && <button className={styles.helpButton} type="button" aria-expanded={help} onClick={()=>setHelp(!help)} data-cursor="Language support">{help?"Close language support":"Open language support"} ↗</button>}
    </div>
    {revised ? <div className={`${styles.support} ${help?styles.open:""}`}><span className={styles.tag}>proposed / beside the book</span><h4>{help?"Language support":"Help belongs here."}</h4><p>{help?"Translation and comprehension options, grouped together.":"Open the support panel. The reading context stays in view."}</p>{help && <div className={styles.toolChips}><span>Translation</span><span>Comprehension</span></div>}</div>
     : <div className={styles.separate}><div className={styles.document}><span className={styles.tag}>elsewhere</span><h4>Dictionary</h4><p>Look up a term.</p></div><div className={styles.document}><span className={styles.tag}>elsewhere</span><h4>Translation tool</h4><p>Cross-check the meaning.</p></div></div>}
   </div>}
   {slug==="general-motors" && <div className={styles.convoy}>
    <div className={styles.road} aria-hidden="true">{(revised?[0,1,2]:[0]).map(i=><div key={i} className={styles.car}><span/><i/><b/></div>)}</div>
    {revised ? <><div className={styles.controls} role="group" aria-label="Choose a screen’s job"><button type="button" aria-pressed={planning} onClick={()=>setPlanning(true)} data-cursor="Phone planning">Before the trip</button><button type="button" aria-pressed={!planning} onClick={()=>setPlanning(false)} data-cursor="In-car concept">In the car</button></div><div key={String(planning)} className={styles.device}><span className={styles.tag}>{planning?"PHONE / PLAN":"DASHBOARD / COORDINATE"}</span><h4>{planning?"Organize the group.":"See the group."}</h4><div className={styles.toolChips}>{(planning?["Trip planning","Host coordination"]:["Position","Spacing","Group status"]).map(x=><span key={x}>{x}</span>)}</div><p>{planning?"Planning stays on the phone.":"The in-car concept has a narrower task."}</p></div></>
     : <div className={styles.device}><span className={styles.tag}>ORIGINAL DIRECTION</span><h4>Personalize one driver.</h4><p>A biometric concept before the interview-led pivot.</p></div>}
   </div>}
  </div>
  <p className={styles.stageCaption}>{slug==="briefs"?(revised?"Proposed information architecture. Verification and maintenance remain open questions.":"Workflow summarized from field notes. No real building or contact data."):slug==="openlibrary"?"A schematic of the research recommendation, not the live Open Library interface.": "Cleared concept at workflow level. Vehicles are illustrative, not the usability-test setup."}</p>
 </section>
}
