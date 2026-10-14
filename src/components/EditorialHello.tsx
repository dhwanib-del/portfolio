"use client"

import { useState } from "react"
import styles from "./EditorialHello.module.css"

const MAX_LENGTH = 24

/** A live editorial byline, not a blocking intro or simulated design-tool UI. */
export function EditorialHello({ name }: { name: string }) {
  const [word, setWord] = useState("alive")
  const [focused, setFocused] = useState(false)
  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <span className={styles.hello}>hi, i&apos;m</span>
        <h1 id="hero-name" className={styles.name}>{name}<span aria-hidden="true" className={styles.period}>.</span></h1>
        <span className={styles.marginNote} aria-hidden="true">a work in progress, always</span>
        <span className={styles.cursorOne} aria-hidden="true">
          <svg viewBox="0 0 18 23" width="18" height="23"><path d="M1 1v17l4.8-4.2 4 7.5 3.2-1.6-4-7.3H16Z" fill="currentColor" stroke="#000" strokeWidth="1.25"/></svg>
        </span>
        <span className={styles.cursorTwo} aria-hidden="true">
          <svg viewBox="0 0 18 23" width="18" height="23"><path d="M1 1v17l4.8-4.2 4 7.5 3.2-1.6-4-7.3H16Z" fill="currentColor" stroke="#000" strokeWidth="1.25"/></svg>
        </span>
      </div>
      <div className={styles.finish}>
        <label htmlFor="hello-last-word" className={styles.prompt}>right now, i&apos;m making things that feel</label>
        <span className={styles.editor} data-focused={focused}>
          <input
            id="hello-last-word"
            aria-label="Finish the sentence: making things that feel"
            autoComplete="off"
            spellCheck={false}
            maxLength={MAX_LENGTH}
            value={word}
            onChange={event => setWord(event.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur() }}
          />
          <span className={styles.script} aria-hidden="true">{word || "…"}</span>
          <span className={styles.editMark} aria-hidden="true">✳</span>
        </span>
        <span className={styles.hint}>try your own word ↗</span>
      </div>
    </div>
  )
}
