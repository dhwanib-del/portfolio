import styles from "./EditorialHello.module.css"

/** Quiet, centered personal signature. Everything interactive lives in Side A below. */
export function EditorialHello({ name }: { name: string }) {
  const [first, ...rest] = name.trim().split(/\s+/)
  const surname = rest.join(" ")
  return (
    <div className={styles.root}>
      <p className={styles.hello}>hi, i&apos;m</p>
      <h1 id="hero-name" className={styles.name}>
        <span className={styles.first}>{first}</span>
        {surname && <>{" "}<span className={styles.last}>{surname}</span></>}
      </h1>
    </div>
  )
}
