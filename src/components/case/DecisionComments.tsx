"use client"
import { useState } from "react"
import styles from "./DecisionComments.module.css"
type Note = { label: string; method: string; title: string; body: string }
export function DecisionComments({ notes, timeline }: { notes: Note[]; timeline: { planned: string; learned: string } }) {
  const [active, setActive] = useState(0)
  const [view, setView] = useState("board")
  const [learned, setLearned] = useState(false)
  const [guide, setGuide] = useState(true)
  const note = notes[active]
  return <section className={styles.board} aria-label="Explore Dhwani’s decisions">
    <div className={styles.top}><span>the working folder / 03 notes</span><span>click to explore ↗</span></div>
    <div className={styles.views} role="group" aria-label="Story interaction">
      {[["board","Evidence board"],["thread","Connected story"],["calendar","Behind the scenes"]].map(([id,label]) => <button type="button" key={id} aria-pressed={view===id} onClick={()=>setView(id)} data-cursor={id==="calendar"?"Reflection":"Story mapping"}>{label}</button>)}
    </div>
    {view==="calendar" ? <div className={styles.calendar}>
      <div className={styles.binding} aria-hidden="true">○ ○ ○ ○ ○ ○</div>
      <p className={styles.caption}>Project sequence · not a dated calendar</p>
      <div className={styles.views} role="group" aria-label="Compare intent and learning">
        <button type="button" aria-pressed={!learned} onClick={()=>setLearned(false)}>What we planned</button>
        <button type="button" aria-pressed={learned} onClick={()=>setLearned(true)}>What we learned</button>
      </div>
      <div className={styles.comment} aria-live="polite"><p className="eyebrow">{learned?"Learning → next question":"Starting direction"}</p><h3>{learned?"The turning point":"Our starting direction"}</h3><p>{learned?timeline.learned:timeline.planned}</p></div>
    </div> : <>
      <div className={`${styles.thread} ${view==="thread"?styles.connected:""}`} role="group" aria-label="Explore the reasoning">
        {notes.map((n, i) => <button key={n.label} type="button" aria-pressed={active === i} aria-controls="decision-comment" data-cursor={n.method} onClick={() => setActive(i)}>
          <span className={styles.pin} aria-hidden="true">{i + 1}</span>{["Problem","Finding","Decision"][i]}
        </button>)}
      </div>
      <div id="decision-comment" className={styles.comment} aria-live="polite">
        <div className={styles.author}><span className={styles.avatar} aria-hidden="true">D</span><strong>Dhwani</strong><span>{note.method}</span></div>
        <div key={active} className={styles.reveal}><p className={styles.caption}>{["Problem","Finding","Decision"][active]} · evidence summary</p><h3>{note.title}</h3><p>{note.body}</p></div>
        {view==="thread" && <button className={styles.next} type="button" onClick={()=>setActive((active+1)%notes.length)} data-cursor="Connecting the dots">{active===2?"Trace it again ↻":"Follow the thread →"}</button>}
      </div>
    </>}
    {guide ? <aside className={styles.guide} aria-label="Meet your guide">
      <svg viewBox="0 0 64 76" width="52" height="64" aria-hidden="true"><path d="M12 68V34C12 7 52 7 52 34v34" fill="currentColor"/><ellipse cx="32" cy="35" rx="15" ry="19" fill="#edbd9b"/><path d="M16 28c0-19 32-20 32 0-10-1-15-8-16-10-4 7-11 9-16 10" fill="currentColor"/><circle cx="26" cy="34" r="1.5"/><circle cx="38" cy="34" r="1.5"/><path d="M27 43q5 5 10 0" fill="none" stroke="#713e36" strokeWidth="2"/><path d="M8 76q0-23 24-23t24 23" fill="var(--accent)"/></svg>
      <div><strong>Dhwani, your guide</strong><p>{active===0?"Start with the friction. The interesting part is what it made us question.":active===1?"This finding changed the story. It gave us a reason to reconsider the starting direction.":"Here’s where I draw the line between the work we delivered and what still needs testing."}</p><span className={styles.caption}>Authored portfolio narration</span></div>
      <button type="button" className={styles.skip} onClick={()=>setGuide(false)}>Skip guide</button>
    </aside> : <button type="button" className={styles.next} onClick={()=>setGuide(true)}>Meet your guide ↗</button>}
    <p className={styles.caption}>Reconstructed notes from project evidence, not original Figma comments, screenshots or participant quotations.</p>
  </section>
}
