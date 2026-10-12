# Open Library migration: build report (Oct 11, 2026)

This draft page migrates the Vercel Open Library case study into Framer. It follows `docs/migration/open-library-manifest.md` (sections OPEN_LIBRARY_01–13 and the decisions in §9). Nothing is published. The live `/work/openlibrary` page (wqALJyWjk) was only read.

- **Page:** `/work/openlibrary-draft`, page id `CuC4LOUni`, Desktop `dz321F4pW`. Framer has since added Tablet (`IReeXh9nb`) and Phone (`l8l0Wz4Z6`) breakpoints. Both inherit from Desktop and have no overrides.
- **Layout:** the Desktop holds `Case body` (`EjwI9n0sH`). It's a horizontal stack with wrap, max 1200, padding 140/60/96. Inside it:
  - a sticky rail column (`lL_emCQgh`, 200px, top 110)
  - the `§article` column (`VBT9ioKyB`, 1fr, min 300, max 880, gap 48)
- **Background:** `/DB/Bg`.
- **Text styles:** her text styles only (`/Body/P16 Regular/Medium`, `P18 Regular/Medium`, `P24 Medium`, `P32 Medium`, `P50 Medium`). Colours come from her theme tokens (`/DB/*`, `/Mono white/*`, `/Primary Orange`), so light and dark both resolve.

## Section to node mapping

| # | Vercel section | Framer node (name) | id |
|---|---|---|---|
| 01 | Hero | Hero | x10R4nuvm |
| 02 | Story in 30 seconds | The story in 30 seconds | tgFThTmsO |
| 03 | Quick scan + meta | Quick scan + meta | EpwX5CX4O |
| 04 | Story player chrome + chapter rail | Story player chrome / CaseStudySidebar in rail column | ZkQvEZ1Ma / oQ97TIK8S |
| 05 | Scene 01 · The task | § 01 · The task | i8bBPN2uK |
| 06 | Scene 02 · The friction | § 02 · The friction | dY9mVeTwR |
| 07 | Scene 03 · What changed | § 03 · What changed | uSJqJ9EPA |
| 08 | Scene 04 · My decision | § 04 · My decision | o1DaNSJ02 |
| 09 | Try the design choice (nested in 08) | Design choice · two panels (in experiment card YcJ13Rbsd) | z2E4UoGKQ |
| 10 | Scene 05 · The behavior | § 05 · The behavior | p4yCT73m6 |
| 11 | Scene 06 · My contribution | § 06 · My contribution | YCg_Prb2B |
| 12 | Scene 07 · The outcome (+ StoryGuide) | § 07 · The outcome | RVQZzSooe |
| 13 | Appendix + next | §deep · appendix and next | ieogEuqQT |

The scene names match the Vercel rail labels ("01 · The task" … "07 · The outcome"), so CaseStudySidebar (auto mode) picks up 7 chapters.

**Global instances on Desktop.** All three are fixed, with the same props as on the live page:

| Instance | Component | id |
|---|---|---|
| PortfolioNav | BJ3E0ua | jk1oFGqku |
| WorldIntro | e0LZGLD | D6UH2dHfQ |
| DhwaniGPT | y4qriPw | GmqnRDtHU |

Framer chose its own canvas pins for these three. They aren't the live page's pin values, but the components render their own fixed UI.

**Chapter rail.** CaseStudySidebar settings: `mode="auto"`, `surface="none"`, `headerOffset="110"`, `breakpoint="1100"`, progress and reading time on.

## Reconciliation

| Item | Vercel | Framer draft | Notes |
|---|---|---|---|
| Body sections | 13 | 13 | Same order |
| Chapters (§ frames) | 7 | 7 | Plus `§article` and `§deep · appendix and next` |
| Visible text blocks | — | 140 text nodes | Copy is verbatim from the manifest; the exceptions are listed below |
| Outbound links (4) | report, deck, NN/g, Growth.Design | all 4 present, `linkOpenInNewTab` | The NN/g link is on the visible Behavior link and again inside the hidden text-only frame |
| Internal links | `← Selected work` → `/#work`, next card → `/work/budgetcart` | both present | |
| Real screens | 0 (2 placeholders) | 2 (her live-page screens) | Participants image in the friction slot; library-workspace image in the decision slot |
| Hidden screen slots | — | 3 | `Screen slot · friction (planned reading-flow artifact)`, `Screen slot · decision (planned recommendation frame)`, `Screen slot · outcome (optional cleared report page)`. Each is an empty frame with a caption |
| Numbers 8 / 330 | static rows | StatMoment (QDekCS7) `8|team interviews; 330|data points mapped as a team` | Counts up on scroll (Vercel numbers are static) |
| Decision scene | H2 + P + "What I chose against" disclosure | native text, disclosure shown open | DecisionCard not used. It needs a "tension" lead that scene 4 doesn't show, so using it would add copy |

### Interactions

| # | Interaction | Status |
|---|---|---|
| I01 | Back link | Reproduced |
| I02/I03 | Reading-mode toggle, slide view and navigation | **Dropped** (per decision). "Scroll story ↓ / Slide view →" buttons not built. The cue "Got the gist? Scroll for the evidence, or try the slide view." is kept **hidden**, because it points to the dropped slide view |
| I04 | Chapter rail / scroll-spy | Reproduced with CaseStudySidebar (left sticky column ≥1100px, "On this page" button below) |
| I05 | Scene entrance fade | Not reproduced (no native appear effect set) |
| I06 | Sticky-note hover | Not reproduced. Notes are static, rotated −1.5° |
| I07 | Screen-slot spotlight | Not reproduced. AnnotatedScreen gives an Enlarge button instead |
| I08 | "What to look for" disclosure | Its copy moved into the hidden screen-slot captions, because the slots now show her real screens |
| I09 | "What I chose against" disclosure | Simplified: shown open as a dashed-border block |
| I10/I11 | Design-choice toggle + support panel | **Simplified**: two panels side by side ("Separate tools" vs "Support in context" with the open language-support panel). The intermediate dashed "proposed / beside the book" state is kept hidden. The "Open/Close language support ↗" button labels are dropped |
| I12 | StoryGuide commentary | Simplified: the 3 tabs are shown as 3 static cards. The "Hear my reasoning ↗ / Skip commentary" button and the avatar SVG are dropped |
| I13 | Text-only version | All copy kept in a **hidden** frame in §deep (a Framer page is already real text) |
| I14 | Working folder | **Simplified**: header + 3 cards (Problem / Finding / Decision, each with method, title, body and guide line) + a "What we planned / What we learned" pair + footnote. Tabs, pins, "Follow the thread", guide skip and the avatar are dropped |

## Not reproduced / deviations (Dhwani to review)

1. **SVG drawings.** These were not built: the clock, the book / tools / connected-panel icons in "Story in 30 seconds", the screen-placeholder glyphs, and both avatars. SVG node creation fails silently through the MCP. The clock is a native 14px ring.
   - **Possible stray layers:** four SVG attempts may have left invisible layers at the Desktop root. The tool reports 4 unlisted children before `Case body`. Please check the Desktop layer list for stray SVG / "Clock icon" layers and delete them.
2. **Sticky notes.** These are theme-aware (`/DB/Accent Tint` fill, orange border, rotated). They are not the fixed yellow-paper gradient: Framer text colour comes from text styles, and dark text on fixed yellow would break in one of the two themes. Patrick Hand is not used. Her body styles are used instead.
3. **Eyebrow font.** `Inter-SemiBold` (the live eyebrow's font) is not addressable through the MCP, and `GF;Inter-600` text can't take a theme colour. The eyebrow uses `/Body/P16 Medium` at 0.64 opacity.
4. **Uppercase labels.** These are typed as the manifest lists them (e.g. "THE STORY IN 30 SECONDS", "DELIVERED / OBSERVED"). Strings that are CSS-uppercased on Vercel (the eyebrow, "next story") keep their source case.
5. **Screen captions.** These use her existing live-page captions, not Vercel copy:
   - "Research participants: multilingual students and the staff who support them."
   - "Open Library · Multilingual reading research"

   The second screen (`zNzA2ATDyn0…`, the live hero image) sits in the decision slot without the "02 / DESIGN DIRECTION" label, because I couldn't view the image to confirm it shows the design direction. Confirm, or move it.
6. **Images.** Both are shown through AnnotatedScreen `src` (no notes, no legend, Enlarge on), not plain image frames. Image fills with framerusercontent URLs are silently refused by the MCP on create and on update. The originals on the live page are untouched.
7. **Merged strings.** The Problem card's method line merges two source strings: "Affinity mapping · Problem · evidence summary". The hidden text-only frame joins each section's paragraphs into one block.
8. **Global footer** (`Thanks for scrolling.` etc.) is not migrated. The manifest marks it as global chrome.
9. **Tablet/Phone.** The breakpoints have no overrides. Rows use wrap with min widths, so the sticky notes, panels and cards stack on narrow screens. The rail column also wraps above the article on narrow screens and the rail switches to its button. Check this visually at 810 and 390.

## MCP gotchas found this session (add to framer-agent-rules)
- Passing `name="…"` while creating a node forces `position="absolute"`. Create without `name`, then rename in a separate update.
- To fix a node stuck at absolute: update to `position="sticky" top="1px"`, then to `position="relative"`. A direct `relative` update reports "No changes".
- Text nodes created in the same call as a component instance, or under a wrapper that lists existing siblings both before and after, can land in the wrong parent, unstyled. Check the diff after every call and move them.
- Reorders count hidden children, so give the full child list when reordering.
- SVG nodes and framerusercontent `backgroundImage` don't work through the MCP. Use AnnotatedScreen `src` for images.
- The project went read-only for about 8 minutes mid-session. Calls failed or timed out, then recovered.
