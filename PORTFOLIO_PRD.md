# Portfolio rebuild brief

## Goal
A concise, distinctive portfolio that lets a senior UX reviewer understand Dhwani's craft, judgment, personal contribution, and impact in about one minute per case study.

## Product principles
- Lead with the decision, contribution, and outcome; keep process detail only when it proves a skill.
- Use short sections, strong visuals, and clear media placeholders.
- Separate personal contribution from team output. Link to final reports and project presentations where available.
- Never invent metrics. Mark unknown outcomes as unmeasured and gather evidence before making claims.
- Keep Prime Video private until NDA restrictions are cleared.
- Make the voice warm, direct, and specific. Preserve the user's playful personality without hobby-list clutter.
- Respect motion preferences, keyboard access, readable contrast, and responsive layouts.

## Project story checklist
- [x] **Open Library:** uneven team collaboration; first affinity mapping; client calls; international-student language needs; partner adopted feedback-process improvements and increased project investment. The case page states the recommendations were not implemented or tested with readers; no reader outcome is claimed. Evidence: final report plus Dhwani-confirmed partner follow-through.
- [ ] **GM:** user's critical pushback on biometrics; pivot to a community convoy; advanced prototyping, components, first team design system, and enterprise trade-offs.
- [ ] **BRIEFS:** high-stakes supporting case; first contextual inquiry; no existing Figma files; built the concept and design foundation; Apps Script + Sheets prototype and server/deployment work; explain the sensitive-data discovery without exposing real information. Verify any time-saved claim first.
- [ ] **Intel / Intelligence Hub:** keep separate from BRIEFS; six analysts; email/phone intake and spreadsheets made case history hard to retrieve; case-management database; stakeholder interviews and inclusive facilitation; explain navigation choices with usability evidence and HCI principles.
- [ ] **BudgetCart:** SNAP/WIC-aware grocery budgeting; interviews and paper prototypes; first Figma project; self-taught components and visual language; make the concept's value clear without implying later DoorDash features were shipped by this project.
- [ ] **Prime Video:** family-plan concept, but remain hidden or labeled under NDA until cleared.
- [ ] **Lab / About:** concise personal introduction, tasteful photo wall, concise learning note (IoT/automotive UX), distinctive details, no long hobby list.

## Experience and content
- [ ] About gallery: seamless image wall, graceful missing-photo placeholders, subtle hover motion, reduced-motion support, and clear instructions for replacing images in public/gallery/.
- [ ] Project pages: provide media slots for images/video and working “View final report” / “View final project” links where source materials exist.
- [ ] Add an accessible theme picker with Go Blue, Go Green, pink, orange, and a custom two-color gradient. Keep text contrast safe and persist the user's choice.
- [ ] Footer: preserve the user's preferred footer voice and connect “How can I help?” to the actual chat UI. Clearly indicate when the AI service is unavailable; do not pretend it is live.
- [ ] Keep animations purposeful, fast, and optional for reduced-motion users.

## Daily iteration loop
1. Review this checklist and current deployed site.
2. Pick the highest-impact incomplete item that can be completed with available evidence.
3. Make the change, run the relevant build/check, and verify the deployed preview when available.
4. Update this checklist with what changed, evidence used, and any blockers.
5. Do not publish sensitive/NDA material or unsupported outcome claims.

## Current evidence gates
- No confirmed measured time reduction for BRIEFS or Intel: do not state a number.
- Sensitive BRIEFS example must be fictionalized or generalized.
- Prime Video remains confidential.
- Gallery assets require the user's photos; keep friendly image placeholders until supplied.


## Current iteration · October 2
- [x] The four presets (Orange, Go Blue, Pink, Go Green) and custom gradients recolor gallery placeholders, map-game art and pin, playlist background, and track-placeholder discs. Original album art keeps its real colors; the open-to-work indicator stays green because it signals availability.
- [x] Add a first-visit typewriter greeting with a direct Ask DhwaniGPT action.
- [x] Make DhwaniGPT answer from portfolio facts without an external model key; link project answers to case studies, protect Prime Video details, and say when a fact is not verified.
- [x] Do not store chat history. Do not connect the portfolio to the unrelated Luma or Glimmer Supabase databases.
- [x] Vercel production build is READY. Verified Cherry pink and an editable blue-to-orange gradient across the About gallery and playlist; verified map art and pin inherit Cherry pink after fixing their hard-coded mint/orange colors.
- [x] DhwaniGPT `/api/ask` GET reports portfolio mode; the BRIEFS suggestion POST returned HTTP 200 in Vercel logs.
- [ ] Verify a visible chatbot reply and an unknown-question fallback in a normal browser session. The cloud preview returned a browser-level “This page couldn’t load” after the successful POST, so the rendered reply still needs a clean session check.
- [ ] Optional: enable free-form model responses only after configuring a server-side model API key in Vercel. The grounded FAQ remains available without it.


## Palette follow-up · October 2
- [x] Cherry’s accent was separated from Pink, then merged into Pink after the palette was simplified.

- [x] Simplify palette to Orange, Sky Blue, Pink, Yellow, plus the custom gradient. Legacy Cherry selections map to Pink; the renamed Sky Blue and Yellow retain their saved theme IDs.

- [x] Add the Hindi `ध्वनि?` wordmark to desktop and mobile navigation.


## Deployment verification · October 3
- [x] Vercel has a READY production deployment on commit `5db0743` (`Add Hindi Dhwani question wordmark`). The preview's `/api/ask` GET returns HTTP 200 in portfolio mode, and `/work/openlibrary` returns HTTP 200.
- [ ] Production is behind GitHub `main` (which has advanced beyond `f7e316a`, including this checklist update). Do not treat changes after `5db0743` as live until Vercel deploys a commit that includes them.
- [ ] Verify a visible chatbot reply and unknown-question fallback in a normal browser session. The preview redirects this browser to Vercel login, so the read-only API and rendered page response do not confirm the interactive chat.
- [ ] `dhwanibagrecha.com` still renders the older Framer portfolio as of October 3; the Vercel preview is not serving the custom domain.
