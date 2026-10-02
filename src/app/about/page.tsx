import Link from "next/link"
import { GalleryWall } from "@/components/GalleryWall"
import { PersonalPlay } from "@/components/PersonalPlay"

export const metadata = { title: "About · Dhwani Bagrecha" }

export default function About() {
  return (
    <div className="about">
      <section className="container about-intro" aria-labelledby="about-title">
        <p className="eyebrow">about me</p>
        <h1 id="about-title" className="case-h1">Hi, I&apos;m Dhwani.</h1>
        <p className="case-hook">
          I&apos;m a UX designer and researcher at U-M. I bring psychology, curiosity, and a collaborative spirit to complicated product problems.
        </p>
        <p className="about-now">Right now: exploring physical interaction in IoT and building my next case study.</p>
        <Link className="btn btn-primary" href="/#contact">Let&apos;s talk ↗</Link>
      </section>

      <GalleryWall />
      <PersonalPlay />

      <section className="container about-close" aria-label="A note about how I work">
        <p>I want people to feel comfortable asking the question everyone else is holding back.</p>
      </section>
    </div>
  )
}
