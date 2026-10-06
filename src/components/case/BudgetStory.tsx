"use client"
import { useState } from "react"
import styles from "./CaseExperience.module.css"

export function BudgetStory() {
 const [visible,setVisible]=useState(false)
 return <section className={styles.experiment} aria-label="Compare BudgetCart decision cues">
  <div className={styles.experimentHead}><div><p className="eyebrow">Try the design choice</p><h3>What do you need to judge the item?</h3></div><span className={styles.stamp}>schematic / prototype finding</span></div>
  <div className={styles.controls} role="group" aria-label="Compare information visibility">
   <button type="button" aria-pressed={!visible} onClick={()=>setVisible(false)} data-cursor="Prototype testing">Hide the details</button>
   <button type="button" aria-pressed={visible} onClick={()=>setVisible(true)} data-cursor="Figma components">Bring them back</button>
  </div>
  <div className={styles.stage} aria-live="polite"><div className={styles.grocery}>
   <div className={styles.groceryArt} aria-hidden="true"><span>item</span></div>
   <div><span className={styles.tag}>{visible?"REVISED DIRECTION":"INITIAL DIRECTION"}</span><h4>A grocery item</h4><dl className={styles.cues}><div><dt>Brand</dt><dd>{visible?"Identified":"Hidden"}</dd></div><div><dt>Price</dt><dd>{visible?"Lowest price visible":"Hidden"}</dd></div><div><dt>Store</dt><dd>{visible?"Comparison available":"Hidden"}</dd></div></dl></div>
   <div className={styles.budgetStrip}>{visible?"Budget context stays in the shopping flow.":"The screen is cleaner. The choice is harder to judge."}</div>
  </div></div>
  <p className={styles.stageCaption}>A schematic of information visibility, not a project screenshot. No invented prices, benefit eligibility or spending results.</p>
 </section>
}
