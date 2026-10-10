# Rules for agents editing Dhwani's Framer portfolio (Oct 10)

The live site is dhwanibagrecha.com (Framer). The Framer MCP tools are deferred: load them with ToolSearch (`select:mcp__Framer__getNodeXml,...`).

## Never break these
- NEVER delete her layers, screens, images, videos or component instances. Hide them (`visible="false"`) or move them. Hidden nodes don't appear in getNodeXml output; that's normal.
- Keep every existing screen reachable on its page.
- Don't publish the Framer site.
- No invented metrics, users, quotes, research or outcomes. Prototype ≠ shipped. Use "I" only for her work and "we/the team" for shared work.
- Prime Video stays NDA: no expansion.
- DPSS/BRIEFS/Intel: only fictional or cleared demo data. No real names or incidents.
- Never put her email anywhere new.
- Prefer reusing her existing components over creating new code components.
- Light/dark mode must work. Use the theme tokens: `/DB/Bg`, `/DB/Surface`, `/DB/Panel`, `/DB/Maize Ink`, text styles under `/Body/...` (P16 Regular/Medium, P18 Regular, P24 Medium, P32 Medium, P50 Medium exist), and CSS vars `--db-text`, `--db-text-2`, `--db-line`, `--db-surface`, `--db-glass`, `--db-accent`, `--db-on-accent` in code.
- Desktop, Tablet and Phone must all work.

## Framer MCP gotchas (learned the hard way)
- **New nodes default to `position="absolute"`.** Always pass `position="relative"` on every new node inside stacks.
- **Nest nodes under their correct parent in update XML.** If you list an existing node under a different parent, it MOVES there. To change only attributes, call updateXmlForNode with nodeId = that node and XML = just that node.
- **Code-component string props whose value starts with "[" are parsed as JSON and silently dropped.** AnnotatedScreen's `notesJson` accepts a "json:" prefix for this reason. Escape quotes as &quot;.
- **ResponsiveImage props can't be set via XML.** AnnotatedScreen has a `src` string prop for that. To get an image into Framer, create a Frame with `backgroundImage="<url>"`. Framer uploads it and returns a framerusercontent URL; Figma MCP asset URLs work for this. The sandbox can't download framerusercontent or figma.com itself.
- **Color-style paths don't work as code-component color props.** Use rgb values or leave defaults.
- **Big getNodeXml results get saved to a file.** Parse them with python.
- **Code files:** before updateCodeFile, read the Framer copy and diff it against the git copy in `framer/*.tsx`. If someone edited it in Framer, merge rather than overwrite. Keep the local backup in sync and commit:
  - `git -C /home/claude/portfolio pull --rebase` first; other sessions push too
  - commit messages end with:
    `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
    `Claude-Session: https://claude.ai/code/session_01L8k3N31uhTrqEp6SWd1qNR`

## Case-study system (built Oct 9–10, see BudgetCart staging page qzO5xhyZz)
- **Chapters:** name each main section frame "§ Label". Name the article column "§article". Wrap the old long-form content in a frame named "§deep · earlier write-up" with a "§ Deeper read" section first.
- **CaseStudySidebar (KhuNepX)**, insert URL from getComponentInsertUrlAndTypes: the chapter rail. Put it in the existing sticky sidebar card with `surface="none"`, `headerOffset="110"`, `breakpoint="1100"`.
- **AnnotatedScreen (mfZpsH_):** use `layout="side"`, `mediaMax` around 300–340 for phone screens (wider or 0 for desktop/in-car screens), `mode="guided"` for a one-at-a-time story, or `mode="hover"`. Set notes with `notesJson="json:[...]"` and the image with `src`. Box highlights: x/y = centre %, boxW/boxH = %.
- **Text sections:** eyebrow P16 Medium at opacity 0.55, heading P32 Medium, body P18 Regular with maxWidth 680px.
