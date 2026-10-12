# Open Library case study — migration audit (Phases A–C)

Audited 2026-10-11 from repo `/home/claude/portfolio` @ `ecaf45f` (clean tree, nothing modified). Local production build (`next build` + `next start -p 3123`), Playwright Chromium, `colorScheme: dark`, intro and companion greeting suppressed via sessionStorage (`intro-seen`, `greet-seen`). Framer was not touched.

Live Vercel URL: **blocked**. The agent proxy refuses the CONNECT to `portfolio-xi-lilac-73.vercel.app` (curl: `CONNECT tunnel failed, response 403`; Playwright: `net::ERR_TUNNEL_CONNECTION_FAILED`). Everything below comes from the local build of the same commit. Live parity is unverified.

---

## 1. Migration manifest

| Field | Value |
|---|---|
| Project | Open Library · Internet Archive (SI 500, team "In4mation") |
| Vercel URL | https://portfolio-xi-lilac-73.vercel.app/work/openlibrary (could not load from this sandbox) |
| GitHub | github.com/dhwanib-del/portfolio @ `ecaf45f` |
| Route | `src/app/work/[slug]/page.tsx` (SSG via `generateStaticParams`, slug `openlibrary`) + `src/app/work/[slug]/story.module.css` |
| Content sources | `src/content/cases.ts` (entry `slug: "openlibrary"`, lines 233–321), `src/content/caseStories.ts` (`openlibrary`, lines 49–62), `src/content/site.ts` (project order → next-case card; `brand`, `hint`) |
| Inline per-slug content in components | `page.tsx` (`methods`, `starts`, `snapshots.openlibrary`, hero SVG branch), `CaseStoryPlayer.tsx` (`decisionMethod`, `screenSlots.openlibrary`, scene-1 title), `CaseExperiment.tsx` (`openlibrary` config + caption) |
| Components rendered | `CaseStoryPlayer` → `StoryOpening`, `StoryGuide`/`DhwaniAvatar` (`StoryGuide.tsx`), `CaseExperiment`; `DecisionComments`. `CaseVideo` is imported but not rendered (no `video`). `BudgetStory`, `IntelHandoff`, `Claim`, `Decision`, `Stats`, `BeforeAfter` are **not** used on this page |
| Global chrome (layout.tsx, not part of the case body) | Aurora background, `Nav`, `Intro` (vibe picker, once per session), `Companion` (trailing "dhwani" cursor + "open to work · ann arbor <time> ET" pill), `Chat`, vibe chip (bottom-left), footer "Thanks for scrolling." |
| Target Framer page | Existing `/work/openlibrary` (page id `wqALJyWjk`) stays as is. Migration goes to a **new draft page** (not created in this phase) |
| Sections | 13 body sections (OPEN_LIBRARY_01 … 13), plus global nav/footer |
| Screens (real UI screenshots) | **0**. Two screen slots render "Screen placeholder · awaiting cleared media". `cases.ts` names two planned files (`public/media/openlibrary/affinity-map.jpg`, `public/media/openlibrary/recommendation.png`) that **do not exist** in `public/` |
| Assets | 0 raster/video/audio. 9 inline SVGs in the case body (8 distinct drawings), 6 font families requested (1 fails), 4 outbound links |
| Interactions | 14 (see §4) |
| Responsive layouts | 4 captured: 1440, 1280 (desktop, same layout), 768 (tablet, single column, bottom rail), 390 (phone). Breakpoints: 1239, 850, 809, 600 |
| Page height | 1440: 7446px · 1280: 7446px · 768: 7651px · 390: 8884px. No horizontal overflow at any width |
| Status | Audit complete (A–C). Build not started. Blockers in §7 |

---

## 2. Section inventory

Tokens (dark default, `globals.css`): `--bg #000`, `--surface #0d0d0e`, `--surface-2 #161618`, `--card rgba(255,255,255,.04)`, `--text #fff`, `--text-2 rgba(255,255,255,.64)`, `--line rgba(255,255,255,.1)`, `--line-strong rgba(255,255,255,.18)`, `--accent #f3500f` (vibe-dependent), `--on-accent #0a0a0a`, `--max 1104px`, `--gutter 20px`, `--radius-lg 24px`, `--radius-md 16px`. Light theme: `--bg #fff`, `--surface #f4f4f2`, `--text #0a0a0a`, `--accent #c23d08`, `--on-accent #fff`.

**Font note for every row below:** computed `font-family` reports `Satoshi`, but `/fonts/Satoshi-Variable.woff2` returns **404** (the file was never committed). What actually renders is the next fallback, **Plus Jakarta Sans Variable**. "Sans" below means Plus Jakarta Sans as rendered. "Mono" = `ui-monospace, monospace` (system mono; DejaVu Sans Mono in this Linux Chromium, SF Mono on macOS).

Widths: the header is an 820px column (container max 860 incl. gutters), centered (x=310 at 1440, x=230 at 1280). The story player is the full 1104px container (x=168 at 1440). The appendix is 880px content (920 incl. gutters).

### OPEN_LIBRARY_01_HERO
- **Source:** `page.tsx` header (`.case-head`, `.storyHead`)
- **Copy (verbatim):**
  - Back link: `← Selected work` → `/#work`
  - Eyebrow: `Open Library · Internet Archive` (CSS uppercase → "OPEN LIBRARY · INTERNET ARCHIVE")
  - H1: `Readers needed help without leaving the book.`
  - Reading time: [clock icon] `30 sec skim` `·` `~2 min read`
- **Background:** transparent over `--bg` #000 + fixed aurora gradient (orange blobs, blur 80px)
- **Width/alignment:** 820px column, left-aligned text, column centered. `.case` padding-top 140px
- **Typography (1440 → 390):**
  - Back link: Sans 12/18, `--text-2`, margin-bottom 26
  - Eyebrow: Sans 13/19.5, 400, tracking .08em (1.04px), uppercase, `--text-2`
  - H1: Sans **56px → 34px** (clamp(34px,5vw,56px); 38.4 at 768), weight 700, line-height 1.05, tracking -0.03em, max 22ch, balance
  - Reading time: Mono 11/16.5, `--text-2`, 16×16 clock SVG (stroke 1.5)
- **Images:** clock SVG only
- **Interactions:** back link
- **Desktop vs mobile:** H1 wraps to 2 lines at 1440 and 3 at 390. On phones the fixed nav bar overlaps the back link at scroll 0 (top 12, height 52)

### OPEN_LIBRARY_02_STORY_IN_30_SECONDS
- **Source:** `page.tsx` `.fastStory` + `snapshots.openlibrary`
- **Copy (verbatim):**
  - Label: `THE STORY IN 30 SECONDS`
  - `01 / The problem` — `Language help interrupted the book.`
  - `02 / The discovery` — `Readers switched tools and questioned translations.`
  - `03 / My decision` — `Bring language support into the reading flow.` (accent highlight `<mark>`)
  - Diagram: `BEFORE` → cards `Book`, `Separate language tools` → arrow `→` → `THE DESIGN DIRECTION` → card `Book + nearby support` / `Keep the page in view`
  - Caption: `Illustrative workflow · proposal, not a shipped interface`
- **Background:** card `--surface` #0d0d0e, 1px `--line-strong`, radius 20, overflow hidden. Diagram band `--bg` #000 with a 1px `--line` top border
- **Layout:** top band is a 3-column grid (gap 24, padding 20/24/24). Diagram band is a grid `1fr 40px 1fr` (345/40/345 at 1440), padding 24, gap 20. Before cards are 2 dashed cards (174×153, radius 12) rotated -3° and +3°. The direction card is solid with an accent border on `--surface`, 345×144
- **Typography:** label Mono 11/16.5. Beat labels Mono 10/14 `--text-2`. Beat text Sans **22px → 17px** (clamp(17px,2vw,22px)), 400, lh 1.4, tracking -0.02em, margin-top 12. Mark: `--accent` bg, `--on-accent` text, padding 1px 4px, box-decoration clone. Diagram labels Mono 10/14. Card titles Sans 14/19.6, 700. Direction subline 11px `--text-2`. Caption Sans 10/15 `--text-2`
- **Images:** 3 inline SVGs (open-book icon 80×58 viewBox; generic doc + circle icon; connected two-panel + arrow 160×65 viewBox, accent stroke), stroke 2, no fill
- **Interactions:** none
- **Desktop vs mobile (≤600):** beats stack to 1 column (gap 18, padding 18). The diagram stacks to 1 column and the arrow rotates 90° (points down). Cards min-height 120. Card height 465 → 786

### OPEN_LIBRARY_03_QUICK_SCAN_META
- **Source:** `page.tsx` `.quickScan` + `.case-meta` + `.readCue`
- **Copy (verbatim):**
  - `My role` — `Client calls, interviews, first affinity map, synthesis`
  - `Where it stands` — `Research + recommendations delivered; no live reader test.`
  - `Team` — `Five-person SI 500 team · In4mation`
  - Cue: `Got the gist? Scroll for the evidence, or try the slide view.`
- **Layout:** quickScan is a 2-column grid (1.2fr/1fr → 434/362) at max-width 860, gap 24, margin 18/0. case-meta is an auto-fit minmax(170px,1fr) grid with border-top 1px `--line`, padding-top 20, margin-top 36. Only "Team" survives the filter (Status/Read/Role/My part are removed)
- **Typography:** quickScan dt Mono 10/14, tracking .08em, uppercase, `--text-2`. dd Sans 14/22.4. case-meta dt Sans 13/19.5, tracking .08em, uppercase. dd Sans 15/22.5. Cue Sans 12/18 `--text-2`, margin-top 24
- **Interactions:** none
- **Mobile (≤600):** quickScan collapses to 1 column, gap 18

### OPEN_LIBRARY_04_STORY_PLAYER_CHROME
- **Source:** `CaseStoryPlayer.tsx` (`.mode`, `.toolbar`, `.chapterTabs` rail)
- **Copy (verbatim):** `30 sec skim · ~2 min read` · buttons `Scroll story ↓` / `Slide view →` · toolbar `the story / Open Library` and `7 scenes · scroll freely` (slide view: `01 / 07` …) · rail: `☰`, `~2m`, items `01 · The task`, `02 · The friction`, `03 · What changed`, `04 · My decision`, `05 · The behavior`, `06 · My contribution`, `07 · The outcome`, status `01/07`
- **Layout:** full 1104 container, margin 32/0/48. The mode row is flex space-between. Buttons are 44px tall, padding 10/14, radius 8, 1px `--line-strong`, bg `--bg`. The pressed button is accent-filled. Toolbar Mono 11/16.5, tracking .03em
- **Chapter rail (≥1240):** `position:fixed`, left 16, vertically centered, 54px wide, `--surface`, radius 28, dots 6px (active: accent, scale 1.6, 4px `--line` halo). Labels are visually hidden until ☰ expands it to 210px with labels. Esc closes
- **Chapter rail (≤1239):** fixed bottom-center pill (bottom 84), shows only `☰ ~2m`. The expanded sheet is up to 300px wide with the list scrollable (max 40dvh)
- **Active chapter:** IntersectionObserver (rootMargin -110px top / -55% bottom)
- **Mobile (≤600):** the mode row stacks and the two buttons split the width (172px each)

### OPEN_LIBRARY_05_SCENE_01_TASK
- **Source:** `CaseStoryPlayer` step 0 + `StoryOpening` + side note
- **Copy (verbatim):**
  - Beat: `01 / The task`
  - H2: `An unfamiliar term interrupts the page.`
  - Opening card: role tag `Multilingual reader`, prompt `Can I get help with this term and keep reading?`, small `Illustrative task prompt · not a participant quote`
  - Lead: `All five of us were international students, so language access felt familiar. Interviews challenged our initial framing: readers had translation tools, but using them could interrupt the book. I helped turn those observations into a shared affinity map and recommendations.`
  - Invitation (Patrick Hand): `Follow the task, then inspect the choice.`
  - Sticky note: label `in my notebook`, text `Language access was familiar to us. I still needed the interviews to tell us what was actually getting in the way.`, sign-off `Dhwani · authored narration`
- **Layout:** scene frame is a grid `minmax(0,1fr) 190px` (866/190 at 1440), gap clamp(24px,4vw,48px), padding 48/0, border-top 1px `--line`
- **Typography:** beat Mono 11/15.4, tracking .08em, uppercase. H2 Sans **44px → 27px** (clamp(27px,3.5vw,44px)), 700, lh 1.12, tracking -0.045em, max 25ch. Opening card: 620 max, padding 22/28, radius 18 18 18 3, `--surface`. Prompt Sans 30 → 22, lh 1.3, tracking -0.03em. Role tag Sans 600 12. Lead Sans 18/30.6 (17/28.9 mobile). Invitation Patrick Hand 16/28 `--text-2`
- **Sticky note:** 197px wide, padding 28/22/38, yellow-accent gradient `linear-gradient(175deg, color-mix(accent 24%, #fff7d6), color-mix(accent 38%, #fff0bd))`, text #242017, rotate -1.5°, layered shadows, folded corner (::after), top gloss (::before). Hover: rotate +1° and lift -6px. Text Patrick Hand 16/25.6. Label Mono 10 #514632
- **Mobile (≤850):** single column, the note drops under the content (max 420, no rotation, Patrick Hand 15/24)

### OPEN_LIBRARY_06_SCENE_02_FRICTION
- **Source:** step 1 (`.wide`, no side note) + screen slot
- **Copy (verbatim):**
  - Beat: `02 / The friction`
  - H2: `Our own experience was a starting point.`
  - P1: `We studied multilingual readers in the U-M community. The team conducted eight semi-structured interviews with students, academic-support staff and subject-matter experts, then organized 330 data points.`
  - P2: `I contributed to interviews, client calls and my first affinity map. We looked beyond our own experience before choosing a direction.`
  - Screen slot: bar `● ● ●` / `01 / FRICTION`; placeholder `Where reading gets interrupted` / `Screen placeholder · awaiting cleared media`; caption `Planned screen focus`; disclosure `What to look for ↗` → `Show a cleared reading-flow artifact with the switch to language tools marked.`
- **Layout:** single column 1104. Body Sans 17/29.75 (lh 1.75), max 60ch. Screen slot is a full-width card (1104×367), radius 14, `--surface`, 1px `--line-strong`. The 9px Mono browser bar has a bottom border. The placeholder is min-height 230 (190 at ≤1239) with a radial `--surface`→`--bg` fill, a 72×58 SVG, a title Sans 24/31.2 700 (18 on mobile) and a Mono 10 note. Caption padding 16, Mono 10 label
- **Interactions:** "What to look for" disclosure. Mouse-move accent spotlight on hover (radial 180px, opacity .1). The placeholder icon lifts and rotates on hover
- **Mobile:** same structure, 350 wide

### OPEN_LIBRARY_07_SCENE_03_WHAT_CHANGED
- **Copy (verbatim):**
  - Beat: `03 / What changed`
  - H2: `The gaps between tools mattered.`
  - P1: `The report describes readers switching between books, dictionaries and translation tools. Academic and technical language made some readers cross-check terms or create personal glossaries.`
  - P2: `The problem combined continuity and confidence in translation. Adding a separate tool would leave the switching problem unresolved.`
  - Sticky note: `in my notebook` / `The affinity map connected translation confidence with interruptions between tools. The recommendation had to address both.` / `Dhwani · authored narration`
- **Layout/typography:** same as 05 (content + 190px note)

### OPEN_LIBRARY_08_SCENE_04_DECISION
- **Copy (verbatim):**
  - Beat: `04 / My decision`
  - H2: `Make existing language support easier to find in the reading flow.`
  - P: `Readers already had tools; switching between them cost context.`
  - Disclosure: `What I chose against ↗` → `Adding one more separate translation tool`
  - Experiment (see 09)
  - Screen slot 2: `● ● ●` / `02 / DESIGN DIRECTION`; placeholder `Help beside the book` / `Screen placeholder · awaiting cleared media`; caption `Planned screen focus`; `What to look for ↗` → `Show a recommendation frame with language support near the page. Label it as a proposal.`
  - Sticky note: `in my notebook` / `I helped organize the report and next steps. The recommendations still need technical and legal review.` / `Dhwani · authored narration`
- **Layout:** content + 190 note grid. The disclosure has dashed top and bottom borders `--line-strong`, padding 10/0, 13px summary, 14/1.6 body
- **Mobile:** stacked. The note sits under all of it (experiment + slot)

### OPEN_LIBRARY_09_TRY_THE_DESIGN_CHOICE (nested in 08)
- **Source:** `CaseExperiment.tsx` (slug `openlibrary`), `CaseExperience.module.css`
- **Copy (verbatim):**
  - Eyebrow: `Try the design choice` · H3: `Keep the book in view.` · stamp `illustrative / interactive`
  - Toggle: `Separate tools` (default) / `Support in context`
  - Book card: `THE BOOK` · `Keep your place.` · 6 paper lines (one accent "selected" line)
  - State A (Separate tools): two tilted cards `elsewhere` / `Dictionary` / `Look up a term.` and `elsewhere` / `Translation tool` / `Cross-check the meaning.`
  - State B (Support in context): button in the book card `Open language support ↗`. Dashed panel `proposed / beside the book` · `Help belongs here.` · `Open the support panel. The reading context stays in view.`
  - State C (panel open): button `Close language support ↗`. Solid accent panel `Language support` · `Translation and comprehension options, grouped together.` · chips `Translation` `Comprehension`
  - Caption: `A schematic of the research recommendation, not the live Open Library interface.`
- **Layout:** card 890×638 at 1440 (margin -12 side bleed), padding 24, radius 24, `--surface`, 1px `--line-strong`. The stage is `--bg`, radius 16, padding clamp(16px,4vw,32px), min-height 290. The reading grid is 2 columns (gap 28). The book card has radius 3 14 14 3, an inset spine shadow and an accent bookmark ribbon (15×35 clip-path). Stamp: dashed, Mono 10, rotate 3°
- **Typography:** H3 Sans 34 → 24 (clamp(24px,3vw,34px)), 700, tracking -0.04em. H4 Sans 28 → 20, 700. Body 14/1.6. Tags Mono 10, uppercase, tracking .08em. Buttons 13px, 44 tall, radius 10, pressed = accent fill
- **Interactions:** 2-state toggle + nested panel toggle (`aria-expanded`). Content appears with a .25s "appear" fade. Hover lift -2px on buttons
- **Mobile:** grid collapses (book over support), card 350 wide, padding 16

### OPEN_LIBRARY_10_SCENE_05_BEHAVIOR
- **Copy (verbatim):**
  - Beat: `05 / The behavior`
  - H2: `Help in context`
  - Lead: `Make help easy to find and focused on the user’s task.`
  - P: `Grouping translation and comprehension support near the book addresses the switching described in the report. The proposed reading flow has not been validated.`
  - Source block: `Behavioral lens · interpretation, not a measured effect` + link `Jakob Nielsen · heuristic 10 ↗` → https://www.nngroup.com/articles/ten-usability-heuristics/
- **Layout:** wide single column. Source block has a dashed top border, padding-top 20, 12/19.2

### OPEN_LIBRARY_11_SCENE_06_CONTRIBUTION
- **Copy (verbatim):**
  - Beat: `06 / My contribution`
  - H2: `I helped make the recommendation—and the team’s progress—clear.`
  - P1: `We recommended making translation more visible, grouping comprehension tools and prompting readers when the book and system languages differ. Copyright, privacy and technical feasibility remained constraints.`
  - P2: `Collaboration was uneven. I helped organize the final report, summarize progress and clarify next steps. Open Library later improved its feedback process and increased project investment, as I confirmed. That partner response is separate from a validated reader outcome.`
- **Layout:** wide single column, body 17/1.75, max 60ch

### OPEN_LIBRARY_12_SCENE_07_OUTCOME
- **Copy (verbatim):**
  - Beat: `07 / The outcome`
  - H2: `What happened next.`
  - Outcome card: `DELIVERED / OBSERVED` · `Research report and recommendations delivered; no live product test or measured reader impact.`
  - Numbers: `team interviews` **8** · `data points mapped as a team` **330** (static, no count-up in this component)
  - `The next question` · `Test whether readers can find help without losing their place—and whether the support earns their trust.`
  - Links: `View final report ↗` → https://docs.google.com/document/d/1A3DYPNe7f7799FZ6WSzoFFgkkHUHTBwmLgYzPkPPsjs/edit · `View final project ↗` → https://docs.google.com/presentation/d/1HDW0dLSZCc09ewu0dh__M0BJS2c-ByhvlvdnQMwyYZs
- **Layout:** outcome card padding 20, radius 14, 1px accent border, `--surface`, text 18/28.8. Number rows are flex space-between with a 1px `--line` bottom border; dt 12px `--text-2`, dd Sans 24/24 600, tracking -0.03em. Next question 14/22.4. Links 13px, gap 16, underline offset 5
- **Followed by StoryGuide (still inside the player):** `DhwaniAvatar` SVG (64×70) · `A note from me` (15px bold) · `Dhwani · authored portfolio narration` (10px) · button `Hear my reasoning ↗` / `Skip commentary`. Expanded: tabs `My doubt` / `The finding` / `My call` and a speech bubble showing `story.doubt` / `story.finding` / `story.call` (same three sentences as the sticky notes). Dashed top and bottom borders, padding 20/0

### OPEN_LIBRARY_13_APPENDIX_AND_NEXT
- **Source:** `page.tsx` `.appendix` + `DecisionComments`
- **Copy (verbatim):**
  - Disclosure 1 summary: `Text-only version` `↗`. Body: the hook (as in 05), then H2 + paragraphs for each of the 3 sections (06, 07, 11 headings and bodies), then `The decision` with `Make existing language support easier to find in the reading flow.` and `Readers already had tools; switching between them cost context.`, then `Help in context` with `Make help easy to find and focused on the user’s task. Grouping translation and comprehension support near the book addresses the switching described in the report. The proposed reading flow has not been validated.` and the link `Nielsen · heuristic 10 ↗`, then `Where it stands` with `Research report and recommendations delivered; no live product test or measured reader impact.` and `**Next question:** Test whether readers can find help without losing their place—and whether the support earns their trust.` (No "Where AI fit": `ai` is undefined for this case.)
  - Disclosure 2 summary: `Open my working folder` · `3 notes · plan vs learning ↗`. Body (DecisionComments):
    - Header `the working folder / 03 notes` · `click to explore ↗`
    - View tabs: `Evidence board` · `Connected story` · `Behind the scenes`
    - Board/thread pins: `1 Problem` · `2 Finding` · `3 Decision`
      - Problem — method `Affinity mapping`, `Problem · evidence summary`, title `The question I started with`, body `Language access was familiar to us. I still needed the interviews to tell us what was actually getting in the way.`
      - Finding — `Research synthesis`, `What changed my understanding`, `The affinity map connected translation confidence with interruptions between tools. The recommendation had to address both.`
      - Decision — `Information architecture`, `The call I made`, `I helped organize the report and next steps. The recommendations still need technical and legal review.`
    - Thread view adds a dashed accent connector and the button `Follow the thread →` / `Trace it again ↻`
    - Behind the scenes: `○ ○ ○ ○ ○ ○` binding, `Project sequence · not a dated calendar`, toggle `What we planned` / `What we learned`. Planned: `Starting direction` / `Our starting direction` / `Understand language support for multilingual readers.` Learned: `Learning → next question` / `The turning point` / `The affinity map connected translation confidence with interruptions between tools. The recommendation had to address both.`
    - Guide: avatar SVG 52×64 · `Dhwani, your guide` · per pin: `Start with the friction. The interesting part is what it made us question.` / `This finding changed the story. It gave us a reason to reconsider the starting direction.` / `Here’s where I draw the line between the work we delivered and what still needs testing.` · `Authored portfolio narration` · `Skip guide` (then `Meet your guide ↗`)
    - Footnote: `Reconstructed notes from project evidence, not original Figma comments, screenshots or participant quotations.`
  - Credit: `Story pacing inspired by Growth.Design’s Apple sleep story. Project facts and authored narration are Dhwani’s; interactive schematics are labeled.` (link → https://growth.design/case-studies/apple-sleep-notification)
  - Next card: `next story` (eyebrow, uppercase) · `BudgetCart · UMSI` · `Better grocery deals, built around SNAP/WIC →` → `/work/budgetcart`
- **Layout:** 880 content (920 max), centered. Disclosures have a 1px `--line-strong` top border, padding 16/0, 44px summary rows (16px; 14px mobile) with an 11px `--text-2` right meta. Reading copy 17/1.75, max 65ch, H2 clamp(22px,3vw,32px). Board: padding 24, radius 20, `--surface`. Comment card radius 14 14 14 3 on `--bg`. Pins are 23px accent teardrops. Credit 10/16 with a top border. Next card padding 24, radius 24, `--card` bg (hover `--card-hover`); title Sans 24/36 700 tracking -0.02em; org line 15px `--text-2`
- **Then global footer** (not migrated with the case): `that’s the scroll` / `Thanks for scrolling.` (72px → 36px, "scrolling." in Pinyon Script) / chat launcher / `Talk design, music, or the portfolio I’m probably editing again.` / `Get in touch ↗` / `LinkedIn` / `© 2026 Dhwani Bagrecha · Made with Claude, edited by Dhwani.`

---

## 3. Asset reconciliation

"Visible UI screens" = real product or interface screenshots shown. This case shows none.

| Asset ID | Source | Dimensions (rendered, 1440 / 390) | Section | Visible UI screens |
|---|---|---|---|---|
| OL_A01_CLOCK_ICON | inline SVG, `page.tsx` (`.readingTime`) | 16×16 / 16×16 | 01 | 0 |
| OL_A02_BOOK_ICON | inline SVG, `page.tsx` hero branch `slug==="openlibrary"&&i===0` (viewBox 80×58) | 139×65 / 123×64 | 02 | 0 |
| OL_A03_TOOLS_ICON | inline SVG, generic doc + circle (viewBox 80×58) | 139×65 / 123×64 | 02 | 0 |
| OL_A04_CONNECTED_ICON | inline SVG, two panels + arrow (viewBox 160×65), accent stroke | 160×58 / 160×58 | 02 | 0 |
| OL_A05_SCREEN_PLACEHOLDER_1 | inline SVG monitor glyph (viewBox 80×64) in `.screenBlank` ("Where reading gets interrupted") | 72×58 in 1104×367 slot / 72×58 in 350×327 | 06 | 0 (placeholder) |
| OL_A06_SCREEN_PLACEHOLDER_2 | same glyph ("Help beside the book") | 72×58 in a 1104-wide slot | 08 | 0 (placeholder) |
| OL_A07_READING_SCHEMATIC | CSS/HTML-drawn book + panels (no image file), `CaseExperiment.tsx` | 890×638 card / 350×748 | 09 | 0 (schematic, 3 states) |
| OL_A08_DHWANI_AVATAR | inline SVG `DhwaniAvatar` (viewBox 88×96), `StoryGuide.tsx` | 64×70 | 12 | 0 |
| OL_A09_GUIDE_AVATAR | inline SVG in `DecisionComments.tsx` (viewBox 64×76) | 52×64 | 13 (folder open) | 0 |
| OL_A10_STICKY_NOTE | CSS only (gradient, folded corner) | 197×~275 / 350×~194 | 05, 07, 08 | 0 |
| OL_P01_AFFINITY_MAP (planned) | `cases.ts` figures[0] placeholder `public/media/openlibrary/affinity-map.jpg`, caption `Team synthesis · add a cleared photo or screenshot`, alt `Open Library research affinity map` | **file missing**, no `src` | intended for 06 | 0 |
| OL_P02_RECOMMENDATION (planned) | `cases.ts` figures[1] placeholder `public/media/openlibrary/recommendation.png`, caption `Proposed reading-flow support · add final project screen`, alt `Open Library recommendation concept` | **file missing**, no `src` | intended for 08 | 0 |
| OL_L01_REPORT | https://docs.google.com/document/d/1A3DYPNe7f7799FZ6WSzoFFgkkHUHTBwmLgYzPkPPsjs/edit | link | 12 | — |
| OL_L02_DECK | https://docs.google.com/presentation/d/1HDW0dLSZCc09ewu0dh__M0BJS2c-ByhvlvdnQMwyYZs | link | 12 | — |
| OL_L03_NNG | https://www.nngroup.com/articles/ten-usability-heuristics/ | link | 10, 13 | — |
| OL_L04_GROWTH | https://growth.design/case-studies/apple-sleep-notification | link | 13 | — |

Totals: 0 raster images, 0 video, 0 audio, 0 real UI screens. 9 SVG instances (8 distinct drawings). 2 planned images missing. `figures.slice(2)` in `page.tsx` renders nothing (only 2 figures, neither has `src`). `c.video` is undefined, so no CaseVideo. No remote image URLs. The only remote request is Google Fonts CSS for Noto Sans Devanagari (nav wordmark only), which failed in the sandbox (`ERR_TUNNEL_CONNECTION_FAILED`).

---

## 4. Interaction inventory

| # | Interaction | Where | Behavior | States captured |
|---|---|---|---|---|
| I01 | Back link | 01 | `← Selected work` → `/#work` | — |
| I02 | Reading-mode toggle | 04 | `Scroll story ↓` / `Slide view →` (aria-pressed). Slides show one scene at a time | slides 01, 04, 07 |
| I03 | Slide navigation | 04 (slides) | `← Back`, `Next: <chapter> →` (`Read again ↻` on 7), live status `Chapter n of 7 · <name>`, range scrubber `Jump through the story` (0–6), ←/→ keys when the frame has focus, hint `Focus the story card to use ← →, or drag the slider to jump.` | yes |
| I04 | Chapter rail / scene navigator | fixed | Scroll-spy (IntersectionObserver) highlights the current scene. Clicking jumps (scrollIntoView). ☰ expands labels. Esc closes. Left vertical rail ≥1240, bottom pill ≤1239 | rail expanded 1440 + 390 |
| I05 | Scene entrance | all scenes | `.content` "arrive" .22s fade/rise (off under reduced motion) | — |
| I06 | Sticky-note hover | 05, 07, 08 | Rotate +1°, lift 6px, corner fold grows (hover devices only) | — |
| I07 | Screen-slot spotlight | 06, 08 | Pointer-tracked radial accent glow (mouse only), icon lifts | — |
| I08 | "What to look for ↗" disclosure | 06, 08 | `<details>` reveals the planned screen focus | 06 open |
| I09 | "What I chose against ↗" disclosure | 08 | `<details>` → `Adding one more separate translation tool` | open (in experiment-panel-open shot) |
| I10 | Design-choice toggle | 09 | `Separate tools` / `Support in context` (aria-pressed), aria-live stage | default, support |
| I11 | Language-support panel | 09 | `Open/Close language support ↗` (aria-expanded) turns the dashed placeholder into a solid panel with chips | panel open |
| I12 | StoryGuide commentary | 12 | `Hear my reasoning ↗` ↔ `Skip commentary`. 3 tabs swap the speech bubble (aria-live) | open |
| I13 | Text-only version | 13 | `<details>` with the full linear copy | open |
| I14 | Working folder / evidence board | 13 | `<details>` → 3 view tabs (Evidence board / Connected story / Behind the scenes), 3 pins, `Follow the thread →`, planned/learned toggle, guide skip/restore | board-problem, board-finding, thread, calendar planned, calendar learned |
| — | External links | 10, 12, 13 | 4 outbound (`target=_blank`) + next-case internal link | — |
| — | Audio | — | **None.** No audio or speech element exists. ("guideSpeech" is only a CSS class name for a text bubble) | — |
| — | Global (not case content) | layout | Intro vibe picker (once per session), vibe chip, theme toggle, Companion trailing cursor with `data-cursor` labels (e.g. "Research synthesis", "Language support", "Story time"), status pill + tour, chat | — |

---

## 5. Fonts

| Family | How it loads | Used for on this page | Actually renders? | In Framer / Google Fonts? |
|---|---|---|---|---|
| Satoshi (variable 300–900) | `@font-face` → `/fonts/Satoshi-Variable.woff2` | First family in `--font-sans` (everything) | **No. 404, the file is not in the repo and never was** | Not Google. Fontshare (ITF) font, would need a custom upload |
| Plus Jakarta Sans Variable (200–800) | `@fontsource-variable/plus-jakarta-sans` | Fallback for `--font-sans`. **This is the face users see** for all headings and body (weights 400, 600, 700) | Yes | Yes, Google Font "Plus Jakarta Sans" |
| Patrick Hand 400 | `@fontsource/patrick-hand` | Sticky notes, the "Follow the task…" invitation, the experiment small note | Yes | Yes, Google Font |
| Poppins 400/500 | `@fontsource/poppins` | `--font-nav` (nav pill/sheet only). **Not used in the case body** | Yes | Yes, Google Font. Existing Framer components (DecisionCard etc.) are "Poppins only" |
| Pinyon Script 400 | `@fontsource/pinyon-script` | Footer "scrolling." (global) | Yes | Yes, Google Font |
| Noto Sans Devanagari 500–700 | Google Fonts `@import` in globals.css | Nav wordmark "ध्वनि" (global) | Request blocked in the sandbox | Yes, Google Font |
| ui-monospace, monospace | system | Beat labels, toolbar, tags, dt labels, reading time (10–11px) | System mono (varies by OS) | No direct equivalent. Pick a Google mono (e.g. JetBrains Mono / IBM Plex Mono / DM Mono) or Framer's system mono |

Not verified against the live Framer font picker: `searchFonts` was not called because this phase was told not to touch Framer.

Decision needed: the code site *declares* Satoshi but *renders* Plus Jakarta Sans. The Framer site uses Poppins (per the component headers). Dhwani has to decide which family the migrated page uses before the build starts.

---

## 6. Proposed Framer implementation (new draft page)

Principle: native stacks, text and images first. Reuse her existing components (backups in `/home/claude/portfolio/framer/`). A new code component is only proposed where nothing she owns can do the job, and each one is flagged.

| Section | Native build | Reuse existing component | New code needed? |
|---|---|---|---|
| 01 Hero | Vertical stack 820 max, centered. Text: link, eyebrow, H1, reading-time row (icon + text) | — | No |
| 02 Story in 30 seconds | Card stack → 3-column horizontal stack (wraps to vertical below 600). Highlight via a text background fill on `<mark>` or an accent frame behind the text. Diagram: 2 rotated dashed frames + arrow + accent frame, SVGs exported as images/vectors | — | No |
| 03 Quick scan + meta | 2-column grid → 1 column. Text styles | — | No |
| 04 Player chrome + chapter rail | Mode row and toolbar as text/buttons. "Slide view" can be dropped or done as a Framer variant/overlay | **CaseStudySidebar** (v2 chapter rail: auto-finds layers named `§ …`, has progress + reading time + breakpoint). Name the 7 scene frames `§ The task` … `§ The outcome` | No for the rail. **Slide view would need a new component** (flagged; recommend dropping it or deferring) |
| 05–08, 10–12 Scenes | Each scene is a frame (`§` name) with a 2-col horizontal stack: content + 190 sticky note; becomes vertical below 850. Beat (mono), H2, paragraphs as text styles | Sticky note: no matching component in the backups (closest is FridgeBoard, which is a board, not a single note). Build it natively as a rotated frame with a gradient fill + shadow. Hover rotate/lift via a Framer hover state | No |
| 06 / 08 Screen slots | Image frame with a browser-bar strip, or a placeholder until cleared media exists | **AnnotatedScreen** (pin callouts, legend, enlarge, caption) is the right home for the real affinity-map and recommendation screens once supplied. **CaseStudyVideo** if a clip is supplied | No (blocked on assets) |
| 08 Decision line | — | **DecisionCard** (tension → decision → why → rejected) matches `decision` data exactly: tension `The turning point`, decision, why, rejected `Adding one more separate translation tool`. It replaces the "What I chose against" disclosure | No |
| 09 Try the design choice | Could be done natively as a 3-variant component (Separate / Support / Panel open) with click transitions | — | Native variants preferred. A code component only if aria-pressed/aria-live accessibility parity is required (flag) |
| 12 Outcome numbers | Native rows, or… | **StatMoment** ("4\|weeks; …" text mode) for 8 / 330 with count-up | No |
| 12 StoryGuide | Native: avatar image + text + a button that toggles a variant with 3 tabs | — | No (variants) |
| 13 Text-only version | Optional in Framer: it exists for accessibility/skim parity, and Framer text is already real text. Could be a native accordion (variant open/closed) | — | No |
| 13 Working folder / evidence board | Native multi-variant component (3 tabs × 3 pins + planned/learned) is possible but large | — | Probably the one place where a **new code component** would be justified (flag). Recommend cutting or reducing it to a static 3-note strip |
| 13 Next case + credit | Native link card | Existing next-case pattern in **CaseStudy** / SelectedWork | No |
| Global | — | PortfolioNav, AuroraBackground, TalkingCursor/FigmaCursorFollower, ConnectBand on the existing site template | No |

---

## 7. Blockers / open decisions

1. **No real screens exist.** 0 UI screenshots. The 2 planned images (`affinity-map.jpg`, `recommendation.png`) are missing from the repo. AnnotatedScreen and the screen slots have nothing to show until Dhwani supplies cleared media.
2. **Font mismatch.** Satoshi is declared but returns 404, so the code site renders Plus Jakarta Sans. Framer components use Poppins. Pick one before building.
3. **Live Vercel not reachable** from this sandbox (proxy 403), so parity between the deployed build and `ecaf45f` is unverified.
4. **Interaction-heavy pieces** (slide view, working folder, design-choice toggle) don't map cleanly to native Framer. Decide whether to cut them, simplify them, or approve new code components.
5. **Copy duplication.** The three narration sentences appear 3 times (sticky notes, StoryGuide, working folder) and the hook appears twice. Worth deciding which surface keeps them in Framer.
6. Screenshot caveat: element screenshots include fixed overlays where they intersect (the chapter pill, the "open to work" pill, the companion cursor label). These are global chrome, not case content.

---

## 8. Screenshots

Folder: `/tmp/claude-0/-home-claude-portfolio/2819916a-e1f2-5932-b267-155fe6f1871e/scratchpad/ol-audit/screens/`

Full page (local build):
- `local-full-1440x900.png`, `local-full-1280x800.png`, `local-full-768x1024.png`, `local-full-390x844.png`

Interactive and section states (each at 1440 and 390, prefix `local-1440-` / `local-390-`):
- `hero-30sec`, `scene1-task`, `scene2-friction-placeholder`, `scene2-whattolookfor-open`, `scene4-decision-default`, `scene4-experiment-support`, `scene4-experiment-panel-open` (also shows "What I chose against" open), `scene5-behavior`, `scene6-contribution`, `scene7-outcome`, `storyguide-open`, `chapter-rail-expanded` (viewport shot), `textonly-open`, `folder-board-problem`, `folder-board-finding`, `folder-thread`, `folder-calendar-planned`, `folder-calendar-learned`, `next-case-footer`, `slides-01`, `slides-04`, `slides-07`

Total 48 PNGs. Live Vercel screenshot: none (blocked).

Raw data: `audit-local.json` (computed styles for ~65 selectors × 4 viewports, DOM text outline, media list, font load status, network log). Scripts: `audit.js`, `slides.js`, `live.js`.
