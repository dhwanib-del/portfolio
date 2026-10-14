import type { Owner } from "@/content/caseStudies"
import s from "./caseUi.module.css"

const LABEL: Record<Owner, string> = { mine: "My work", team: "Team work", shared: "Shared" }

/** Says whose work a screen or decision is, so team output is never read as solo work. */
export function OwnerTag({ owner, note }: { owner: Owner; note?: string }) {
  return <span className={s.owner} data-owner={owner}>{note ? `${LABEL[owner]} · ${note}` : LABEL[owner]}</span>
}
