import Link from "next/link"
import { person } from "@/content/site"
import { Journey } from "@/components/play/Journey"
import { Kolam } from "@/components/play/Kolam"
import { Polaroids } from "@/components/play/Polaroids"

// Add your photos here (files go in /public/media/about/). Nothing shows until there's at least one.
const photos: { src: string; alt: string; caption: string }[] = []

export const metadata = { title: "About · Dhwani Bagrecha" }

export default function About() {
  return (
    <>
    <article className="case container">
      <p className="eyebrow">about me</p>
      <h1 className="case-h1">I started in psychology. I stayed for the moment people decide.</h1>
      <div className="case-body" style={{ padding: 0 }}>
        <section className="case-sec">
          <p>I finished a psychology degree at Michigan State in three years, including eye-tracking research on split-second decisions. Now I&apos;m a master&apos;s student at the University of Michigan School of Information, graduating {person.grad}.</p>
          <p>This year I designed tools for campus dispatch and intelligence analysts at U-M DPSS, prototyped in-cab controls with General Motors, and I&apos;m on a capstone with Prime Video. The thread: people making a call with little time and a lot at stake.</p>
          <p>I work AI-first where it helps. I prototype with it, build with it (the DPSS Intel workspace started in Apps Script), and design AI features that show their sources and say when they don&apos;t know.</p>
        </section>
        <section className="case-sec">
          <h2>Looking for</h2>
          <p>Product, UX or experience design roles starting after May 2027. Based in Ann Arbor, happy to move.</p>
          <p><Link className="btn" href="/#contact">Get in touch</Link></p>
        </section>
      </div>
    </article>
    <Kolam />
    <Journey />
    <Polaroids photos={photos} />
    </>
  )
}
