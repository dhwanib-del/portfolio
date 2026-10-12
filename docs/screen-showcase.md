# ScreenShowcase: how to use it

One code component (`ScreenShowcase.tsx` in Framer, backup at `framer/ScreenShowcase.tsx`) for showing real product screens in a case study. Pick a layout and a frame, then add screens. You never need to edit code.

Demo instances of every layout are on the Framer design page **Screen components**. Copy one onto a case study page when you're ready. It isn't on any web page yet.

## Add, replace, reorder, remove screens

Select the instance, then use the right panel → **Screens**.

- **Add:** click **+**, then either pick an **Image** or paste an **Image URL**. The image wins when both are set.
- **Replace:** click the screen row and pick a new image (or change the URL).
- **Reorder:** drag rows in the list. The order on the page is the list order.
- **Remove:** hover a row and click the trash/minus icon.
- **Video:** set **Video** (mp4 or webm) on a row. It replaces that row's image. The image becomes the poster frame.
- Per row, also fill in **Alt text** (what the screen shows, for screen readers), **Step label** (short, e.g. `01 · Onboarding`) and **Caption** (one sentence).

### Screens JSON (alternative)

If **Screens JSON** has anything in it, it replaces the Screens list. Clear it to go back to the list. Agents use it because Framer's MCP can't set lists. Format:

```
json:[{"src":"https://framerusercontent.com/images/….png","label":"01 · Browse","caption":"…","alt":"…"},
      {"src":"…","video":"https://….mp4"}]
```

Keys: `src`, `video`, `alt`, `label`, `caption`. Keep the `json:` prefix (Framer silently drops a string that starts with `[`). If the JSON is broken, the canvas says so.

## Properties

| Property | What it does |
|---|---|
| **Layout** | `Spotlight`: one big screen. With 2+ screens a row of chips switches between them. `Duo` / `Trio`: 2 or 3 side by side, extra screens wrap to a new row. `Filmstrip`: horizontal sequence with swipe/drag, arrows, dots. `Deck`: overlapping stack; click, swipe or arrow keys bring the next one forward. `Compare`: before/after slider over the first 2 screens (screen 1 = before, screen 2 = after). |
| **Frame** | `None` (rounded corners only), `Phone` (clean bezel that matches light/dark), `Browser` (minimal top bar), `Soft card` (border + soft shadow). |
| **Browser URL** | Only with the Browser frame. Optional text in the address bar. |
| **Fit** | `Contain` shows the whole screen; `Cover` fills the box and may crop the edges. Only matters with a fixed Ratio. Screens are never stretched. |
| **Ratio** | `Auto` uses each file's real shape (recommended). The fixed ratios (9:19.5 phone, 4:3, 16:10, 16:9, 1:1) make mismatched screenshots line up. |
| **Screen max** | Max width of each screen in px. `0` = auto: phones about 300px (340 in Spotlight/Compare), desktop screens fill the space. |
| **Gap** | Space between screens. On phones it's capped at 16px. |
| **Align** | Left / center / right for the screens and controls. |
| **Background** | `None`, `Surface` (subtle panel), `Accent tint` (faint tint of the site accent). Both follow light/dark. |
| **Captions** | `Below` (label + caption under each screen), `Overlay` (on a dark gradient at the bottom of the screen), `None`. |
| **Enlarge** | Adds a small expand button to each screen (shows on hover with a mouse, always on touch). It opens a full-screen viewer: arrow keys move, Esc closes, focus goes back where it was. |
| **Counter** | `01 / 04` next to the controls (Spotlight, Filmstrip, Deck). |
| **Autoplay video** | Videos play muted and looped only while on screen. Turned off automatically when the visitor prefers reduced motion; they get controls instead. |
| **A11y label** | What screen readers call the whole group, e.g. "BudgetCart checkout flow". |

## Behaviour to know

- **Phones / narrow columns (under ~640px of component width):** Duo/Trio with the phone frame become a filmstrip; with other frames they stack vertically. Spotlight, Filmstrip, Deck and Compare scale down.
- **Empty component:** on the canvas it shows a dashed placeholder telling you to add screens. On the live site it renders nothing, so there's no gap.
- **Compare with one screen:** shows that screen as a Spotlight (the canvas notes that it needs 2).
- **Hiding a showcase:** set the instance's visibility off in Framer. Nothing else needed.
- Only use real screens. Label prototypes as prototypes in the caption.
