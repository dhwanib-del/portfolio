import type { CSSProperties } from "react"
import styles from "./HeroSparkles.module.css"

type Speck = { x: number; y: number; size: number; duration: number; delay: number; alpha: number; star?: boolean }

// Hand-placed points instead of random numbers: the composition doesn't jump on hydration.
const specks: Speck[] = [
  { x: 8, y: 11, size: 4, duration: 11, delay: 3.2, alpha: .26 },
  { x: 17, y: 25, size: 2, duration: 8.5, delay: 1, alpha: .24 },
  { x: 21, y: 69, size: 6, duration: 10.5, delay: 5, alpha: .32 },
  { x: 28, y: 6, size: 3, duration: 9, delay: 1, alpha: .19 },
  { x: 34, y: 81, size: 4, duration: 12, delay: 4.7, alpha: .3 },
  { x: 39, y: 18, size: 2, duration: 12, delay: 2.1, alpha: .32 },
  { x: 46, y: 12, size: 5, duration: 10, delay: 5.3, alpha: .19 },
  { x: 55, y: 28, size: 3, duration: 8, delay: 2.4, alpha: .26 },
  { x: 64, y: 19, size: 3, duration: 12, delay: 2.5, alpha: .29 },
  { x: 72, y: 38, size: 6, duration: 14, delay: 6, alpha: .31 },
  { x: 82, y: 15, size: 2, duration: 8, delay: 4.5, alpha: .26 },
  { x: 91, y: 30, size: 5, duration: 11, delay: 3.2, alpha: .23 },
  { x: 96, y: 8, size: 4, duration: 13, delay: .8, alpha: .22 },
  { x: 9, y: 43, size: 6, duration: 14, delay: 4.3, alpha: .38 },
  { x: 14, y: 83, size: 2, duration: 13, delay: 1.9, alpha: .31 },
  { x: 26, y: 36, size: 3, duration: 9, delay: 7.3, alpha: .24 },
  { x: 36, y: 62, size: 5, duration: 11, delay: 4, alpha: .16 },
  { x: 50, y: 77, size: 3, duration: 10, delay: 1.1, alpha: .25 },
  { x: 60, y: 91, size: 6, duration: 14, delay: 6.4, alpha: .19 },
  { x: 68, y: 70, size: 2, duration: 9, delay: 1.4, alpha: .32 },
  { x: 78, y: 61, size: 3, duration: 12, delay: 4.5, alpha: .28 },
  { x: 88, y: 83, size: 5, duration: 11, delay: 4.8, alpha: .25 },
  { x: 95, y: 70, size: 2, duration: 8, delay: 2.5, alpha: .31 },
  { x: 7, y: 88, size: 3, duration: 9, delay: 3.7, alpha: .29 },
  { x: 19, y: 13, size: 2, duration: 14, delay: 5.7, alpha: .22 },
  { x: 31, y: 91, size: 4, duration: 11, delay: 2.8, alpha: .25 },
  { x: 58, y: 9, size: 3, duration: 13, delay: 2.3, alpha: .17 },
  { x: 85, y: 52, size: 4, duration: 10, delay: .9, alpha: .32 },
  { x: 3, y: 58, size: 4, duration: 12, delay: 2.2, alpha: .23 },
  { x: 75, y: 90, size: 4, duration: 12, delay: 1, alpha: .24 },
  { x: 42, y: 90, size: 3, duration: 8, delay: 4, alpha: .19 },
  { x: 48, y: 38, size: 2, duration: 9, delay: 1.9, alpha: .22 },
  { x: 12, y: 64, size: 8, duration: 12, delay: 3, alpha: .35, star: true },
  { x: 88, y: 24, size: 10, duration: 15, delay: 6.2, alpha: .38, star: true },
  { x: 81, y: 76, size: 7, duration: 14, delay: 2.2, alpha: .28, star: true },
  { x: 29, y: 25, size: 7, duration: 13, delay: 4.1, alpha: .33, star: true },
]

export function HeroSparkles() {
  return (
    <div className={styles.field} aria-hidden="true">
      <div className={styles.glow} />
      <div className={styles.luminary} />
      {specks.map((speck, index) => {
        const style = {
          left: speck.x + "%",
          top: speck.y + "%",
          width: speck.size,
          height: speck.size,
          "--speck-alpha": speck.alpha,
          animationDelay: "-" + speck.delay + "s",
          animationDuration: speck.duration + "s",
        } as CSSProperties
        return <i key={index} className={speck.star ? styles.star : styles.speck} style={style} />
      })}
      <span className={styles.guideLeft} />
      <span className={styles.guideRight} />
    </div>
  )
}
