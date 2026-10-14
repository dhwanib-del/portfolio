import styles from "./EditorialHello.module.css"

/** The introduction is intentionally quiet. The CD beside it owns the interaction. */
export function EditorialHello({ name }: { name: string }) {
  return (
    <div className={styles.root}>
      <p className={styles.hello}>hi, i&apos;m</p>
      <h1 id="hero-name" className={styles.name}>
        {name}<span className={styles.period} aria-hidden="true">.</span>
      </h1>
    </div>
  )
}
