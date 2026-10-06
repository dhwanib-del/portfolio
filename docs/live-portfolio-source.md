# Live portfolio replication source
Captured October 5, 2026 evening from https://dhwanibagrecha.com/ in the cloud browser.

## Requested direction
Replicate the current live portfolio design while retaining the new verified case narratives. The latest instruction ends with “but”; the remaining condition is not supplied. Full visual replacement is pending that condition.

## Observed homepage
- First-visit vibe entry: script Dhwani name, Orange / Sky Blue / Pink / Yellow, custom gradient, skip and Escape.
- Floating pill navigation: traffic-light dots, home / about me / work / play / connect, theme toggle.
- Hero: script Dhwani Bagrecha name, cycling speech bubble, mechanical photo-strip printer on the right.
- Selected work: horizontal scroll-driven reel, project videos, outline numbers, topic chips, previous/next controls. Links point to the five public case routes. Prime Video points to contact and shows an NDA cover.
- Experience: “The set so far” two-deck mixer with role selectors, crossfader, skill blend, expandable role rows, and earlier-role disclosure.
- AI process note and centered contact footer: “Thank you for scrolling.”, LinkedIn, email, Go Home.
- Persistent vibe, DhwaniGPT, and availability controls.

## Existing source implementation references
The repository already contains Framer source components for SelectedWork, ExperienceFormats (TheSet v4 mixer), PortfolioNav, WorldIntro, BuiltWithAI, and other live-site patterns. Prefer adapting these authored components over inventing new layouts. The current Next.js homepage is simpler and lacks the photo-strip printer and mixer.

## Observed assets
Hero strip:
- https://framerusercontent.com/images/E2as8iF40Zhd1SMdlgjNjbeao.jpg
- https://framerusercontent.com/images/MZUGq5APQwJyIITeTm2nnvTWnA.png
- https://framerusercontent.com/images/aQDX4ovwp42WKxofLSlKjsOpik.png
- https://framerusercontent.com/images/U2dVPq25qkQGwylQSYhezz2FZg.png

Project reel:
- GM: https://framerusercontent.com/assets/sfn3avAaYlxL3pmdfJK7CEglBQ.mp4
- Intel: https://framerusercontent.com/assets/JYQdmQz9sqwbQzgD1GBEPskU8o.mp4
- BRIEFS: https://framerusercontent.com/assets/EBRPlHDW8BmGHN0QbDwh3WvSCE.mov
- Open Library: https://framerusercontent.com/assets/RJtQzxfrsLVRsXkPPVUBkHPWsU.mp4
- BudgetCart: https://framerusercontent.com/assets/cx0D4ZhkGUqw7r8jLa004T2mXg.mp4

Asset availability is observed, not clearance of every operational detail. Review sensitive screens before copying them. Prime Video remains excluded. Download permitted assets locally before final implementation; avoid hotlinks.

## Verification and access
- New Intel visual sequence is deployed and browser verified at https://portfolio-xi-lilac-73.vercel.app/work/intel.
- The live custom domain responds with Framer headers. Vercel lists the domain as external, using clint.ns.cloudflare.com and stella.ns.cloudflare.com. Cloudflare access is not connected; no DNS changes were made.
- Desktop source capture covers the homepage. Mobile capture, About/Play capture, all interaction states, and source/prototype comparison remain incomplete. The exposed browser controls do not provide viewport resizing.
- Do not claim full replication or mobile fidelity until those checks are complete.
