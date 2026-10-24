import type { EvidenceSignal } from "@/components/case/EvidenceTurntable"

/**
 * Each field-note signal must trace to a concrete statement in caseStudies.ts.
 * These numbers describe research, process or status—not manufactured product impact.
 */
export const caseSignals: Record<string, EvidenceSignal[]> = {
  "general-motors": [
    { value: "01", label: "Driver interview", detail: "One conversation about traveling in groups informed the team's change in direction." },
    { value: "03", label: "Physical mockup tests", detail: "The team evaluated the concept three times in a vehicle mockup, not on the road." },
    { value: "Concept", label: "Where it landed", detail: "A design prototype—not a launched vehicle feature or a validated driving-safety outcome." },
  ],
  briefs: [
    { value: "07", label: "Screens on one workstation", detail: "Observed during contextual inquiry with U-M dispatchers; not a staffing benchmark." },
    { value: "10+", label: "Tools in a lookup", detail: "One lookup moved across more than ten resources. We did not run a timed comparison." },
    { value: "PRD", label: "Delivered with prototype", detail: "Handoff completed. The proposed workflow has not been tested with dispatchers." },
  ],
  intel: [
    { value: "Pilot", label: "Internal evaluation", detail: "I co-led an internal pilot of the case workspace, not a public launch." },
    { value: "Roles", label: "Navigation principle", detail: "Different users needed different views of a shared case history." },
    { value: "Private", label: "Screen publication", detail: "Operational screenshots stay internal until DPSS approves them for public use." },
  ],
  budgetcart: [
    { value: "02", label: "Flows I owned", detail: "The AI cart builder and Budget Calendar were my own design contributions." },
    { value: "Tasks", label: "Prototype evaluation", detail: "Task tests informed revisions; the revised screens were not retested." },
    { value: "Concept", label: "Product status", detail: "Not a live shopping service. No spending outcomes were measured." },
  ],
  openlibrary: [
    { value: "08", label: "Interviews", detail: "The team interviewed people about reading in a second language." },
    { value: "330", label: "Mapped data points", detail: "Team affinity mapping—not 330 participants or 330 usability tests." },
    { value: "Report", label: "Final deliverable", detail: "Recommendations were delivered; the interface was not built or tested." },
  ],
}
