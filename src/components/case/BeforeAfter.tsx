import Image from "next/image"
import { EVIDENCE_LABEL, type IterationEvidence } from "@/lib/case-ui"
import type { AssetSlot as Slot, Screen } from "@/content/caseStudies"
import { AssetSlot } from "./AssetSlot"
import { OwnerTag } from "./OwnerTag"
import s from "./caseUi.module.css"

type Side = Screen | Slot
const isScreen = (x: Side): x is Screen => "src" in x

function Panel({ side, label }: { side: Side; label: string }) {
  return (
    <div className={s.baPanel}>
      <span className={s.baLabel}>{label}</span>
      {isScreen(side) ? (
        <figure className={s.screen} style={{ maxWidth: side.width }}>
          <Image src={side.src} alt={side.alt} width={side.width} height={side.height} sizes={`${side.width}px`} className={s.screenImg} />
          <figcaption className={s.screenCaption}><span>{side.caption}</span><OwnerTag owner={side.owner} note={side.ownerNote} /></figcaption>
        </figure>
      ) : (
        <AssetSlot slot={side} />
      )}
    </div>
  )
}

/**
 * Two versions side by side, with what changed, why, and an evidence label that
 * makes it impossible to read an untested revision as a proven improvement.
 */
export function BeforeAfter({ before, after, changed, why, evidence }: { before: Side; after: Side; changed: string; why: string; evidence: IterationEvidence }) {
  return (
    <div className={s.ba}>
      <div className={s.baPanels}>
        <Panel side={before} label="Before" />
        <span className={s.baArrow} aria-hidden="true">→</span>
        <Panel side={after} label="After" />
      </div>
      <dl className={s.baNotes}>
        <div><dt>What changed</dt><dd>{changed}</dd></div>
        <div><dt>Why</dt><dd>{why}</dd></div>
        <div><dt>Evidence</dt><dd><span className={s.evidence} data-evidence={evidence}>{EVIDENCE_LABEL[evidence]}</span></dd></div>
      </dl>
    </div>
  )
}
