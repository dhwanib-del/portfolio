# Case-study assets: inventory, gaps and clearance

Audited October 12, 2026 against `public/case-shots/`, `src/content/caseStudies.ts`, the published
Framer site, and the old `WorkReel` / `cases.ts` / `screenStories.ts` references.

## What exists in the repo

| Files | Size | What it is | Status on the site |
|---|---|---|---|
| `budgetcart/smart-ai.png`, `budget-calendar.png` | 339×750 each | Genuine hi-fi Figma screens. **Dhwani's flows** (AI cart builder, Budget Calendar). | Published, labeled "My work". |
| `budgetcart/item-first-browse.png`, `store-comparison.png` | 339×750 each | Genuine hi-fi Figma screens. **Anne's flows** (buying/checkout). | Published, labeled "Team work · Anne's flow". |
| `briefs/01–07-*.jpg` | 2000×1250 each | Polished screens with a "Portfolio demo · fictional sample data" badge. They show an operations dashboard (command center, cases, events, notes, Briefs Bot) — **not** the building profile with the pinned critical strip that the case study is about. Real U-M building names and street addresses appear with fictional records. | **Not published.** Waiting on DPSS clearance, and they don't support the case study's key decision anyway. |
| `intel/01–13-*.jpg` | 2000×1250 each | Screens of the Intelligence Group workspace: U-M DPSS logo, build stamp `2026.08.24-R3`, pages for POI Registry, Link board, Security reviews, OSINT case notes, Admin console, Public reporter. Records are fictional. | **Not published.** Even with fictional data, these show the structure and capabilities of an operational intelligence tool. Needs explicit DPSS approval. |

## Removed

- `WorkReel` drew five CSS "interfaces" (BRIEFS window, Intel casework, GM map, Open Library book, BudgetCart list) labeled "illustrative" or "concept prototype". None were Dhwani's designs. Replaced with real screens (BudgetCart) or a typographic cover that states why screens are missing.
- The case page's "30-second story" SVG schematics and the GM "The work belongs here" panel. Replaced by `AssetSlot`.

## Missing assets to export

Drop files at these paths; the slot is defined in `caseStudies.ts` and the page picks them up when
you switch the slot to a `Screen`. Export at **2× or higher** — the BudgetCart exports at 339px wide
are the current floor and look soft when enlarged.

| Project | File | What | Source | Notes |
|---|---|---|---|---|
| GM Convoy | `case-shots/gm/in-drive.png` | Final in-drive screen (hero) | Team Figma file; also on the Framer GM page | Under NDA in part — cleared screens only |
| GM Convoy | `case-shots/gm/phone-planning.png` | Phone trip-planning screen | Team Figma file | |
| GM Convoy | `case-shots/gm/biometric-early.png` | Early biometric exploration | Team Figma file | Shows the direction you moved away from |
| GM Convoy | `case-shots/gm/cab-test.jpg` | 3D-printed cab test photo | Team | Team + sponsor clearance; no participant faces |
| BRIEFS | `case-shots/briefs/building-profile.png` | Building profile with pinned critical strip (hero) | Your prototype | Synthetic building, fictional contacts/hazards; DPSS clearance |
| Intelligence Hub | `case-shots/intel/case-detail-synthetic.png` | Case workspace with synthetic data (hero) | Your Apps Script build | Remove DPSS logo/build stamp or get approval |
| Open Library | `case-shots/openlibrary/affinity-map.jpg` | Team affinity map (hero) | Report / Framer Open Library page | Crop to legible clusters; no participant names |
| Open Library | `case-shots/openlibrary/recommendation.png` | Recommendation visual | Report / Framer page | Label as a proposal |
| BudgetCart | `case-shots/budgetcart/browse-before.png` | Earlier simplified browse (the version that hid brand/store/price) | Team Figma file | Makes the before/after real |
| BudgetCart | higher-res exports of all four screens | ≥ 678×1500 | Team Figma file | Figma MCP couldn't read the file — no edit access on this account |

## Publication clearance concerns

1. **Intelligence Hub screens** — keep withheld until DPSS approves. Even fictional records reveal what an intelligence unit tracks (POI registry, link analysis, OSINT notes). The case study now states only that the workspace was piloted internally, which you've described as fact; confirm that's publishable.
2. **BRIEFS screens** — real U-M building names and addresses next to fictional incidents ("water sensor alert in mechanical room") could read as real operational data. Use fictional building names if you publish any.
3. **GM** — the old copy says some details are under NDA. Check each export with the team before adding.
4. **Figma prototype embed (BudgetCart)** — the file belongs to a teammate's account. If it isn't set to "anyone with the link can view", visitors will see a Figma sign-in wall inside the embed. The component's "Open in Figma" fallback covers this, but the file setting is the real fix.
5. **Resume link** — `/resume` redirects to a Google Doc `/edit` URL. If the doc isn't shared publicly, recruiters get "request access". Consider a PDF in `/public` or a `/preview` link.
6. **Open Library report link** — same Google Docs sharing check.
