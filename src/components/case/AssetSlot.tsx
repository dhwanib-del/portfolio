import type { AssetSlot as Slot } from "@/content/caseStudies"
import s from "./caseUi.module.css"

// Vercel sets NEXT_PUBLIC_VERCEL_ENV automatically. Internal notes (file paths, where the
// export lives) show on preview and local builds only; production shows the public label.
const internal = process.env.NEXT_PUBLIC_VERCEL_ENV !== "production"

/**
 * A clearly labeled space for a real artifact that isn't available yet.
 * Never fill this with a recreated interface — the point is to show what's missing.
 */
export function AssetSlot({ slot, compact = false }: { slot: Slot; compact?: boolean }) {
  return (
    <figure className={s.slot} data-reason={slot.reason} data-compact={compact ? "true" : "false"} style={{ aspectRatio: compact ? undefined : slot.aspect }}>
      <div className={s.slotBody}>
        <span className={s.slotBadge}>{slot.reason === "clearance" ? "Withheld pending publication approval" : "Original designs coming soon"}</span>
        <p className={s.slotLabel}>{slot.label}</p>
        {internal && <p className={s.slotNote}>{slot.note}</p>}
      </div>
      {internal && (
        <figcaption className={s.slotFile}>
          <span>Preview only · drop file at</span>
          {slot.expected.map((f) => <code key={f}>/public/{f}</code>)}
        </figcaption>
      )}
    </figure>
  )
}
