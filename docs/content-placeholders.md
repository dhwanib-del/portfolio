# Content placeholders (internal)

Internal list of placeholder copy found during the Oct 22 writing pass. Nothing here is shown on the site.

## Rewritten so the public page reads complete

| Where | Was (visible) | Now |
|---|---|---|
| `src/content/site.ts` GM card `coverNote` | "Original GM screens awaiting approved exports" | "Concept prototype · three cab tests" |
| `src/content/site.ts` Intel card `coverNote` | "Screens pending DPSS approval" | "Internal pilot · co-led" |
| `src/content/site.ts` BRIEFS card `coverNote` | "Screens pending DPSS approval" | "Field research → prototype + PRD" |
| `src/content/site.ts` Open Library card `coverNote` | "Research artifacts awaiting review" | "8 interviews · 330 data points" |
| `src/components/case/AssetSlot.tsx` badge | "Withheld pending publication approval" / "Original designs coming soon" | "Private work · walkthrough on request" / "Walkthrough on request" |
| `src/content/caseStudies.ts` Intel `outcome.limitation` | "Screens withheld pending clearance." | "the screens stay internal to DPSS." |

## Slots still empty (kept, not deleted)

These AssetSlot frames still render as labeled empty boxes until the file is dropped in. Removing them from the page needs a code change (filter empty slots in `CaseStudyLayout`), which this copy-only pass did not make.

- GM hero: `case-shots/gm/in-drive.png`
- GM slots: `display-iterations.png`, `component-library.png`, `biometric-early.png`, `phone-planning.png`, `cab-test.jpg` (needs team + sponsor permission, no faces)
- BRIEFS hero: `case-shots/briefs/building-profile.png` (DPSS clearance, synthetic building only)
- Intel hero: `case-shots/intel/case-detail-synthetic.png` (DPSS clearance)
- BudgetCart before/after "before": `case-shots/budgetcart/browse-before.png` (team Figma file)
- Open Library hero: `case-shots/openlibrary/affinity-map.jpg`; slot `recommendation.png`

## Empty strings / hidden values (not shown to users)

- `site.ts` `person.email: ""` and `person.linkedin: ""`: buttons hidden while empty. Do not add her email (standing rule).
- BudgetCart `timeline: "UMSI course project"` repeats the org line; no semester confirmed in the repo, so it was left as is rather than guessed.

## Not in use

- `src/components/case/FigmaListeningRoom.tsx` "AWAITING PROTOTYPE": component isn't mounted on any page.
