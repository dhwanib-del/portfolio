# Editing Dhwani's portfolio media & stories

The public case studies are designed to be media-first. Text explains one decision at a time, and real screenshots or clips carry the feature story. **Never use fake product UI or invented impact metrics.**

## 1. Preview new images or video

Open `/media-studio` on the Vercel preview deployment. Choose a project.

- **Upload files** to preview screenshots, photographs, video clips, or exported Figma frames without modifying the public site.
- Or paste a `https://` media URL (Framer-hosted media is fine), or an existing local `/case-shots/...` path.
- Set the format to **Phone screen**, **Photo / other screen**, or **Video**; edit title, factual caption and contribution credit.
- Reorder with the **↑ ↓** buttons, or remove an asset from the draft with **×**.
- Use **Export media manifest ↓** when the draft looks right.

Uploads are browser-local and are **not published** or stored on our server. Only URL-based entries can persist in the browser's local draft. Uploads must also be added to GitHub under `public/case-shots/<slug>/`; then apply the exported JSON's `projects` arrays to `src/content/caseMedia.ts` and commit. The export's `filesToUpload` list shows expected paths. Never put client-private or personally identifiable material in the public repository. For clearing and publishing university DPSS screens, seek explicit DPSS approval first.

For direct help, you can also upload the media in a ChatGPT conversation and request an update to the **preview branch**; review the result before merging.

## 2. Where each text and feature lives

| Edit | File |
|---|---|
| Full visual gallery; images, clips, titles, captions and order | `src/content/caseMedia.ts` |
| Five-beat (or shorter) interactive storytelling and personal takeaways | `src/content/caseNarratives.ts` |
| Big phone/video feature cards; labels and mediaIndex | `src/content/caseFeatures.ts` |
| Facts: role, ownership, dates, results, limits | `src/content/caseStudies.ts` |
| Smaller presentations/class projects | `src/content/sideQuests.ts` |
| Homepage project card titles and previews | `src/content/site.ts` |

For a new feature card, add a `caseFeatures[slug]` entry with a `mediaIndex` pointing to the item in `caseMedia[slug]`. For new smaller work, add a new object to `sideQuests` with a verified presentation or prototype link.

## 3. Story style

1. **Open with the problem or turning point.** A short line, not a buzzword-laden introduction.
2. **Show what made you change course.** Tie claims to interviews, usability notes, observations or project evidence.
3. **Let the artifact explain the feature.** In feature cards: 1 headline, 1 supporting paragraph, 1 actual screen or video.
4. **Close on an evidenced outcome plus one personal learning.** Separate what was shipped, tested or proposed. Avoid invented uplift or glowing testimonials.
5. Keep full methods, iteration details and edge cases behind the optional **The longer version** disclosure.

Open Library: keep research inputs (8 interviews, 330 mapped points) distinct from measured product outcomes. The Figma pitch deck contains stronger percentage/quote/role claims that have **not** been independently verified; don't promote those to the public story without checking the underlying report.

## 4. Current related design sources

- [Portfolio case-story working boards](https://www.figma.com/design/MiY6DwZ3NfAFvWSrZhA8w6/Dhwani-Case-stories---working-boards?node-id=2-7)
- [Open Library presentation boards](https://www.figma.com/design/5AjVejCj7Sop89BgPiFsmo/Dhwani-Project-Pitch-Decks?node-id=0-1)
- [Pokémon GO class critique](https://www.figma.com/slides/zuAmDXXHP1IHbAqvJjBLhT/Pokemon-GO?node-id=1-43)

For video formats prefer `.mp4` (H.264 for widest browser compatibility) to `.mov`. If using an externally hosted `.mov`, include a still `poster`, a fallback source or a companion screenshot.
