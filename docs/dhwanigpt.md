# DhwaniGPT backend

The DhwaniGPT chat on the Framer site (`framer/DhwaniGPT.tsx`, Framer code file `y4qriPw`) works offline by default with canned answers. To give it a real Claude backend:

1. **Deploy this repo to Vercel** (import `dhwanib-del/portfolio`, framework: Next.js).
2. **Set environment variables** in Vercel → Project → Settings → Environment Variables:
   - `ANTHROPIC_API_KEY` (required) — your Anthropic API key. Never commit it.
   - `DHWANIGPT_MODEL` (optional) — defaults to `claude-haiku-4-5-20251001`.
   Redeploy after adding them.
3. **Check it:** `curl -X POST https://<your-app>.vercel.app/api/dhwanigpt -H 'content-type: application/json' -d '{"messages":[{"role":"user","content":"Tell me about BRIEFS"}]}'` should return `{"reply": "...", "followUps": [...]}`. A `503 {"error":"not configured"}` means the key isn't set.
4. **Switch it on in Framer:** select the DhwaniGPT component, paste `https://<your-app>.vercel.app/api/dhwanigpt` into the **API URL** prop, and publish.

## How it behaves

- Route: `src/app/api/dhwanigpt/route.ts`. `POST { messages: [{ role, content }] }` → `{ reply, followUps? }`.
- Grounded only in `src/content/site.ts`, `cases.ts`, `caseStories.ts` and `about.ts`, plus the BudgetCart contribution split (Dhwani: AI interaction + Budget Calendar; Anne: buying/checkout; Tunisia: onboarding/account). Prime Video is NDA and excluded from the facts. Replies cite case links as `/work/<slug>`, which the component turns into clickable links.
- CORS allows dhwanibagrecha.com, www.dhwanibagrecha.com, `*.framer.app`, `*.framercanvas.com`, `framer.website` and localhost.
- Limits: last 12 messages, 2,000 characters each (longer is rejected with 413).
- If the key is missing, the API errors, or it takes over 15s, the component quietly falls back to its canned answer and shows "Offline mode".

## Offline mode (no API URL)

The component answers from its own copy of the same reviewed facts (`CASES` in `framer/DhwaniGPT.tsx`). Matching is fuzzy (typos, plurals, aliases such as Trip Together = GM Convoy, Casework = Intel, budget card = BudgetCart) and remembers the last project, so "what was her role?" or "did it ship?" refers to it. Each project answer links its case study under the Framer prop **Case pages live at** (default `/work/`). Unknowns (salary, visa, start date, anything not on the site) get an honest "not on the portfolio, ask Dhwani". When the case copy changes, update both `CASES` in the component and `src/content/*`.
