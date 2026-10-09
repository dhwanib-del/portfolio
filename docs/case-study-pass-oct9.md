# Case-study pass — started Oct 9, 2026

This doc tracks the case-study implementation brief (5 stories; Prime Video stays NDA-only).

## Status
- **BudgetCart:** first full integration is done on the staging page **/work/budgetcart-staging** (page qzO5xhyZz, Desktop cu9EkmOr_). Nothing is published. The live /work/budgetcart is untouched.
- **Access:** case pages are readable through the MCP again (Open Library page read fine on Oct 9). Pages still can't be duplicated through the MCP.
- **Next:** Dhwani previews the staging page. Then Open Library, Convoy/GM, BRIEFS and Intel get the same treatment, each with its own structure.

## Shared components (all cases)
- **CaseStudySidebar (KhuNepX), the chapter rail.**
  - It finds layers named "§ Label" as chapters.
  - A layer named "§article" sets the progress scope.
  - Anything inside a layer whose name starts "§deep" counts as deeper read in the reading-time estimate.
  - Progress is labelled "Story progress" and ends with "End of case study". Reading time is calculated at 220 wpm.
  - Below 1100px it becomes a sticky "On this page" button.
- **AnnotatedScreen (mfZpsH_).** Pins and highlights on a screen.
  - New on Oct 9:
    - `layout` "side" puts the notes beside the screen (stacked below on narrow widths).
    - `mediaMax` sets a maximum width for the screen.
    - An Enlarge dialog closes with Esc and returns focus to the button.
    - Alt text field.
    - `src` (image URL used when Image is empty).
    - `notesJson` (a JSON notes list, may start with "json:"; it overrides the Notes list).
  - Tested in a local harness: guided steps, phone stacking, light/dark, enlarge plus Esc with focus returning.

## BudgetCart — what changed on staging
**Opening (renamed "§ Overview", q36CDbhF4)**
- Headline nr10M9BzP is now "The cheapest item isn't the cheapest grocery trip." It was "Designing the moment before checkout."
- NXuC1Nyle now holds the brief's opening copy. It was "A 0→1 grocery decision-support app that helps shoppers compare price, SNAP/WIC eligibility, dietary safety, AI recommendations, and store options before checkout."
- nlA0hswBu now reads "Status: a mobile prototype from UMSI SI 582, built by a team of three. Not a live shopping service or a benefits integration." It was "Turned a broad grocery app concept into a tested decision-support prototype focused on affordability, eligibility, dietary safety, and trust."
- Role pQfmVBqET now reads "AI interaction · Budget Calendar · team research and usability testing". It was "UX Research · Interaction Design · AI Flow · Budget Tracking · Testing + Iteration".

**Quick facts card (G7a78gAaY)**
- The role line VWzMlasiU was rewritten with the ownership split.
- Hidden (not deleted): q1VkjftiI (Core problem), SKB8iz8NV (Prototype tested), and the old jump links Cj14jbIwo.
- Added the chapter rail instance GeZzJG6Wl.

**Article (detleqyxe, renamed "§article", height changed from fixed 8188px to fit-content)**
- New main-story sections, in order:
  1. **§ Cart comparison (Fz9dcMq6b).** The store-comparison screen (lu71YRiZS) in guided mode, with 4 highlights shown one at a time: individual prices, full cart totals, dietary/eligibility labels, separate Select buttons. Followed by the evidence-boundary note.
  2. **§ What testing exposed (vQ0OV09uv).** The item-first browse screen (TzISxU_3a), attributed to the team, with Anne leading the buying flow.
  3. **§ My contribution (ECcDNc2oF).** AI interaction (bTwqte2Lb) and Budget Calendar (XgAws7_yl), each enlargeable.
  4. **§ What's next (QyehINyFn).**
- **"§deep · earlier write-up" (FAgm5cMH4)** holds:
  - a new "§ Deeper read" block (KkP7Khos9) with 5 trade-offs
  - every original section, moved in its original order: dEiaCHY3b, UeL_ZUZH0, lWlB3le4C, QYrEET7py, kf2H6Qa_5, q58L4zG9i, O18N8iE1h, pRQXGPv7C, OOLgu521s, GDptEbo67

**Theme fixes**
- Hard-coded rgb(13,13,13) panels changed to /DB/Panel: FFZhBsgYp, eg2kDjssN, BnnUxBr0N, r5B9jJnne.
- White-alpha cards changed to /DB/Surface: coZ5zM7Sh, G7a78gAaY, j7hvZ_yhJ, c9zkvj2Qp, hecDjRjhr, xj5qu1tjs, DcfqJJO0O, FLpS3i9EN, bafDkKYLz, z8Er9YlPM, gARxkS7hY.

**New media**
- Exported from the Final Presentation slides (OuQ0jvYIsDrDHQz6OJGLoU): 28:3973 store comparison, 28:3978 item-first browse, 28:232 Smart AI, 28:227 Budget Schedule.
- Stored in the repo at public/case-shots/budgetcart/*.png (339×750, 1x) and served from raw.githubusercontent.

**Preservation count**
- Before: 8 image layers (3 one-sentence-case screens, 3 "existing apps" images, 2 persona stickers), plus the hero slideshow component (z27OY1D_f, 5 phone slots), ChatSequence, HoverHighlightText, 4 PrincipleCards and 2 MetricAccordions.
- After: all of the above are still present and visible, moved into the deeper read in their original order.
- Added: 4 original screens.
- Hidden: 2 quick-facts lines and the old jump-link list.
- Deleted: nothing.

## BudgetCart — still open
- **Tablet/Phone:** the new sections inherit from Desktop. CaseStudyStory is a horizontal row with a 280px sidebar. On Tablet/Phone it should stack vertically, and the Quick facts card probably should hide (the rail turns into the "On this page" button below 1100px). Breakpoint overrides can't be set through the MCP.
- **Alt text** on the original image layers (8 image fills) can't be set through the MCP. Add it in Framer.
- **Exports are 1x** (339px wide). Replace them with 2x exports in the AnnotatedScreen Image control for sharper screens.
- **Existing deeper-read copy with unverified claims** (kept, needs Dhwani's call):
  - Personas Jade and James: research-backed or proto-personas?
  - ChatSequence lines framed like user thoughts: not participant quotes.
  - PrincipleCards 02/03 ("SNAP/WIC uncertainty creates stress", "added upload/camera cues and starter prompts").
  - "Signature decision: price transparency during substitutions": no substitution screen was found in the final slides.
  - Quick facts "5 weeks" against the timeline "Aug–Dec 2025".
  - "Prototype tested: onboarding, ordering milk, AI cart builder" (hidden for now).
- **Not done:** an "All screens" section. All existing screens already sit in context on the page, so a gallery would only duplicate them.
- **Prototype embed:** not added. Figma file UUNYyLmIxrEFfMTnM3u2e6 still needs edit access to be read.

## BudgetCart — claim ledger
| Claim | Source | Status | Ownership |
|---|---|---|---|
| Compares complete carts across stores; dietary fit and eligibility shown with prices; shopper chooses | Final presentation 28:3970 "End-of-cart store comparison" (screen 28:3973) | Verified | Team |
| Dhwani: AI interaction and Budget Calendar. Anne: buying/checkout. Tunisia: onboarding/account | Project Management doc; Dhwani | Verified | Personal/team |
| Confusion between choosing groceries and choosing a market; nested choices required recall | SI 582 User Testing Report, Tasks 2–3 | Verified | Team |
| Uncertainty when brand/price were hidden | Final presentation (per story doc) | Verified | Team |
| Item-first + visible price direction | Final presentation 28:3975 "Product-type shopping" | Verified as direction; no measured improvement | Team / Anne's area |
| AI: unclear upload/progress feedback and unclear answer-to-cart handoff | InspectionReport1 (Dhwani's entries) | Verified, no aggregate count | Personal |
| AI screen: upload/type invitation, paperclip, generating state with stop | Final presentation 28:232 | Verified (screen only, not a working integration) | Personal |
| Calendar: remaining budget, monthly expense, avg spend, dated expenses | Final presentation 28:227 | Verified (screen) | Personal |
| Shoppers enter or link benefits | Dhwani | User-confirmed; linkage unverified | — |
| Costco $46.50 / Aldi $47.50 | Prototype comparison screen | Prototype example values only (caption says so) | — |
| Navy and green on white across actions/nav/wordmark | Final screens | Observed; no rationale claimed | Team |
| Team of three | Responsibilities doc | Verified | Team |

## BudgetCart — final main-story copy (staging)
- **Overview:** The cheapest item isn't the cheapest grocery trip. / [brief's opening copy] / Status: a mobile prototype from UMSI SI 582, built by a team of three. Not a live shopping service or a benefits integration.
- **Cart comparison:** Compare the cart. Keep the choice theirs.
  - Body: A cheaper tomato doesn't decide the whole trip. One cheaper product doesn't tell you which store has the lower total for the entire list. So BudgetCart compares complete carts: each store's item prices, its full cart total, dietary-fit and WIC/SNAP labels, and its own Select button.
  - Boundary note: the totals don't show benefit deductions or an out-of-pocket amount; linkage and the eligibility calculation were not built or verified.
- **What testing exposed:** First, people needed to understand the groceries.
  - Category-first flow; testing showed confusion between choosing groceries and choosing a market, plus nested choices that relied on memory; hidden brand/price left people unsure.
  - The team moved to item-first browsing with visible prices. Anne led it. No measured improvement.
- **My contribution:** My work supported the choice before and after shopping.
  - AI interaction: two gaps from inspection; final screen features; a prototype, not proof of a working integration.
  - Budget Calendar: remaining budget, spending, dated expenses.
- **What's next:** a prototype, not a validated service. Next tests: same list compared across stores, totals vs eligibility, choosing without prompting, AI list to comparison without losing choices.
- **Deeper read, five trade-offs:**
  - simplicity vs missing information
  - recommendation vs choice (interface reasoning, not a measured effect)
  - benefits vs payable total
  - AI output vs a finished task
  - colour and hierarchy (no rationale claimed)
