import {sideQuests} from "@/content/sideQuests"
import s from "./SideQuests.module.css"

export function SideQuests(){
 return <section className={s.section} aria-labelledby="side-quests-heading">
  <div className={s.header}><div><span className={s.eyebrow}>THE B-SIDES / LITTLE PROJECTS</span><h2 id="side-quests-heading">Side quests<span>.</span></h2></div><p>Class projects, quick critiques and experiments. Some things are just fun to figure out.</p></div>
  <div className={s.grid}>{sideQuests.map((q,i)=><a key={q.id} className={s.card} href={q.url} target="_blank" rel="noopener noreferrer" aria-label={q.title+" — "+q.action}>
    <div className={s.cardMeta}><span>{String(i+1).padStart(2,"0")}. {q.eyebrow}</span><span aria-hidden="true">↗</span></div>
    <div className={s.art} aria-hidden="true"><div className={s.walk}><span>WALK</span><i>→</i><span>FIND</span><i>→</i><span>CATCH</span></div><strong>GO<span>.</span></strong><div className={s.orbit}><b/><b/><b/></div></div>
    <div className={s.cardContent}><span className={s.category}>{q.tag}</span><h3>{q.title}</h3><p>{q.learning}</p><span className={s.link}>{q.action} <span>↗</span></span></div>
  </a>)}</div>
 </section>
}