# Rules for agents editing Dhwani's Framer portfolio (Oct 10)

Live site dhwanibagrecha.com (Framer). Framer MCP tools deferred: load via ToolSearch (`select:mcp__Framer__getNodeXml,...`).

## Never break these
- NEVER delete her layers, screens, images, videos, component instances. Hide (`visible="false"`) or move. Hidden nodes absent from getNodeXml output — normal.
- Every existing screen stays reachable on its page.
- No publishing Framer site.
- No invented metrics, users, quotes, research, outcomes. Prototype ≠ shipped. "I" only for her work, "we/the team" for shared.
- Prime Video stays NDA: no expansion.
- DPSS/BRIEFS/Intel: fictional or cleared demo data only. No real names or incidents.
- Never add her email anywhere new.
- Reuse her existing components before new code components.
- Light/dark must work. Theme tokens: `/DB/Bg`, `/DB/Surface`, `/DB/Panel`, `/DB/Maize Ink`, text styles under `/Body/...` (P16 Regular/Medium, P18 Regular, P24 Medium, P32 Medium, P50 Medium exist), CSS vars in code: `--db-text`, `--db-text-2`, `--db-line`, `--db-surface`, `--db-glass`, `--db-accent`, `--db-on-accent`.
- Desktop, Tablet, Phone must all work.

## Framer MCP gotchas (learned the hard way)
- **New nodes default to `position="absolute"`.** Pass `position="relative"` on every new node inside stacks.
- **Nest nodes under correct parent in update XML.** Existing node listed under different parent MOVES there. Attribute-only change: updateXmlForNode with nodeId = that node, XML = just that node.
- **Code-component string props starting with "[" get parsed as JSON, silently dropped.** AnnotatedScreen `notesJson` accepts "json:" prefix for this. Escape quotes as &quot;.
- **ResponsiveImage props not settable via XML.** AnnotatedScreen has `src` string prop instead. Image into Framer: create Frame with `backgroundImage="<url>"` — Framer uploads, returns framerusercontent URL. Figma MCP asset URLs work. Sandbox can't download framerusercontent or figma.com itself.
- **Color-style paths fail as code-component color props.** Use rgb values or defaults.
- **Big getNodeXml results saved to file.** Parse with python.
- **Code files:** before updateCodeFile, read Framer copy, diff against git copy in `framer/*.tsx`. Edited in Framer → merge, not overwrite. Keep local backup synced, commit:
  - `git -C /home/claude/portfolio pull --rebase` first; other sessions push too
  - commit messages end with:
    `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
    `Claude-Session: https://claude.ai/code/session_01L8k3N31uhTrqEp6SWd1qNR`

## Case-study system (built Oct 9–10, see BudgetCart staging page qzO5xhyZz)
- **Chapters:** main section frames named "§ Label". Article column "§article". Old long-form content wrapped in frame "§deep · earlier write-up", "§ Deeper read" section first.
- **CaseStudySidebar (KhuNepX)**, insert URL from getComponentInsertUrlAndTypes: chapter rail. Put in existing sticky sidebar card with `surface="none"`, `headerOffset="110"`, `breakpoint="1100"`.
- **AnnotatedScreen (mfZpsH_):** `layout="side"`, `mediaMax` ~300–340 for phone screens (wider or 0 for desktop/in-car), `mode="guided"` for one-at-a-time story or `mode="hover"`. Notes via `notesJson="json:[...]"`, image via `src`. Box highlights: x/y = centre %, boxW/boxH = %.
- **Text sections:** eyebrow P16 Medium opacity 0.55, heading P32 Medium, body P18 Regular maxWidth 680px.
