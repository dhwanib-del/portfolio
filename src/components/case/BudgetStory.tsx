"use client"
import { useState } from "react"
import styles from "./BudgetStory.module.css"

function Dialogue({ who, children }: { who: "Shopper" | "Dhwani"; children: React.ReactNode }) {
  return <div className={`${styles.dialogue} ${who === "Dhwani" ? styles.narrator : ""}`}>
    <span className={styles.speaker} aria-hidden="true">{who === "Dhwani" ? "D" : "S"}</span>
    <div className={styles.bubble}><strong>{who}</strong><p>{children}</p></div>
  </div>
}

export function BudgetStory() {
  const [visible, setVisible] = useState(false)
  return <div className={`container ${styles.story}`}>
    <p className={styles.label}>Illustrative shopper dialogue based on documented prototype findings—not participant quotations. Interactive card is a schematic, not a project screenshot.</p>
    <section id="scene-1">
      <p className="eyebrow">01 · The moment of choice</p>
      <h2>One item. Several decisions.</h2>
      <Dialogue who="Shopper">Can I afford this—and does it meet my needs?</Dialogue>
      <Dialogue who="Dhwani">We were designing for shoppers balancing a budget, benefits eligibility, and dietary needs. Our first direction hid brands, stores, and prices to simplify browsing.</Dialogue>
      <Dialogue who="Shopper">But what am I choosing between?</Dialogue>
      <p className={styles.label}>Try removing the decision cues, then bring them back.</p>
      <div className={styles.controls} role="group" aria-label="Compare information visibility">
        <button type="button" aria-pressed={!visible} aria-controls="shopping-card" onClick={() => setVisible(false)}>Hide the details</button>
        <button type="button" aria-pressed={visible} aria-controls="shopping-card" onClick={() => setVisible(true)}>Bring them back</button>
      </div>
      <div id="shopping-card" className={styles.card} aria-live="polite">
        <h3>A grocery item</h3>
        <dl><dt>Brand</dt><dd>{visible ? "Brand identified" : "Hidden"}</dd><dt>Price</dt><dd>{visible ? "Lowest price visible" : "Hidden"}</dd><dt>Store</dt><dd>{visible ? "Comparison available" : "Hidden"}</dd></dl>
      </div>
      <p className={styles.finding}><strong>What testing actually showed:</strong> people struggled to find items and trusted their choices less when those details were hidden. A cleaner screen had made the decision harder.</p>
    </section>
    <section id="story-decision">
      <p className="eyebrow">02 · The change in direction</p>
      <h2>Less information wasn’t the same as less work.</h2>
      <Dialogue who="Dhwani">We brought the lowest price into item-first browsing and moved store comparisons to the point where shoppers weigh that tradeoff.</Dialogue>
      <Dialogue who="Shopper">Let me judge the item before I commit to it.</Dialogue>
      <p className={styles.finding}>Budget context stays visible while shopping. Eligibility and dietary information appear before checkout. These are the documented design changes; the schematic above isolates only the information-visibility tradeoff.</p>
      <aside className={styles.lens} aria-label="Psychology and HCI interpretation">
        <p className="eyebrow">The behavioral lens</p>
        <h3>Recognition rather than recall</h3>
        <p>Nielsen’s heuristic recommends keeping needed information available, so people don’t have to carry it in memory between views. Here, visible prices and budget context offer a way to judge an item in the shopping flow.</p>
        <h3>Minimalism needs a task</h3>
        <p>The aesthetic-and-minimalist-design heuristic asks us to remove irrelevant information. Our testing showed that price was relevant. I use these principles to interpret the design decision—not as proof of improved spending or trust in the revised prototype.</p>
        <a href="https://www.nngroup.com/articles/ten-usability-heuristics/" target="_blank" rel="noreferrer">Source: Jakob Nielsen · heuristics 6 and 8 ↗</a>
      </aside>
    </section>
  </div>
}
