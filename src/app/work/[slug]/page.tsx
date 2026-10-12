import Link from "next/link"
import { notFound } from "next/navigation"
import { caseStudies } from "@/content/caseStudies"
import { CaseStudyLayout } from "@/components/case/CaseStudyLayout"

export function generateStaticParams() {
  return [...caseStudies.map((c) => ({ slug: c.slug })), { slug: "prime-video" }]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = caseStudies.find((x) => x.slug === slug)
  return c
    ? { title: `${c.name} · Dhwani Bagrecha`, description: c.product }
    : { title: "Prime Video · Dhwani Bagrecha" }
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (slug === "prime-video") {
    return (
      <article className="case container">
        <p className="eyebrow">Prime Video · Capstone</p>
        <h1 className="case-h1">Under NDA.</h1>
        <p className="case-hook">This is my current capstone with Prime Video. Nothing goes on the site until it&apos;s cleared, but I&apos;m happy to walk you through the process in a conversation.</p>
        <p><Link className="btn" href="/#contact">Get in touch</Link></p>
      </article>
    )
  }

  const i = caseStudies.findIndex((x) => x.slug === slug)
  if (i === -1) notFound()
  const n = caseStudies[(i + 1) % caseStudies.length]
  return <CaseStudyLayout study={caseStudies[i]} next={{ slug: n.slug, name: n.name, product: n.product }} />
}
