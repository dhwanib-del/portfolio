// About + Lab content, copied from the live Framer About and Lab pages. Edit words here.
// Photos/covers: drop files in /public/media/about/ (or /public/media/lab/) and set `src` / `cover`.

export const who = [
  { label: "Professionally", text: "A UX researcher and designer who likes messy, operational problems. Right now that means leading end-to-end UX projects at the University of Michigan's Division of Public Safety & Security, everything from intelligence platforms to fleet systems." },
  { label: "Academically", text: "Master's in UX Research & Design at the University of Michigan School of Information. Before that: a psychology degree at Michigan State, finished in three years, with eye-tracking research on high-stakes decision-making along the way." },
  { label: "Personally", text: "Singing, campus events, celebrating every festival from home, and planning trips with too many museum stops. Community-oriented to the core. I like making people feel seen." },
]

export const principles = [
  { n: "01", title: "Psychology first", text: "I design from how people actually think and decide, not how we wish they did. The psych degree wasn't a detour. It's the foundation." },
  { n: "02", title: "Workflow before interface", text: "The biggest design decisions happen before any screen exists: in how work, information, and responsibility move through an organization." },
  { n: "03", title: "Honest tradeoffs", text: "Every decision costs something. I'd rather name the tradeoff out loud than pretend there isn't one." },
  { n: "04", title: "Prototype early", text: "A working prototype in front of a real user beats a perfect deck. I build fast so honest feedback arrives early." },
]

export const lore = [
  { place: "Bangalore", tag: "origin file", text: "Learned that context is everything." },
  { place: "MSU Psychology", tag: "behavior lab", text: "Got obsessed with the gap between what people say, what they do, and what systems make possible." },
  { place: "Community + HR roles", tag: "people systems", text: "Learned that people problems are usually design problems wearing a cardigan." },
  { place: "UMSI", tag: "current build", text: "Turning psychology, research, and product thinking into actual interfaces." },
  { place: "DPSS Tech Ops", tag: "field notes", text: "Realized I love messy, high-pressure workflows where \"just make it pretty\" is not a strategy." },
]

export const opinions = [
  "Tiny gray text is not a personality.",
  "\"Intuitive\" means nothing unless someone tested it.",
  "Chai is a valid research method.",
  "Internal tools deserve good design too.",
  "Cute things should still be functional.",
  "A good empty state can save someone's whole mood.",
  "A playlist order is information architecture.",
  "If the user has to guess the system's logic, the system is being rude.",
]

// "A look into my playlist" orbit. `spotify` is optional; without it the button opens a Spotify search.
// `cover` is optional (square image in /public/media/about/); without it the record gets a colored label.
export const playlist = [
  { title: "Something About Us", artist: "Daft Punk", hue: 18 },
  { title: "fukumean", artist: "Gunna", hue: 265 },
  { title: "Escapism.", artist: "RAYE", hue: 340 },
  { title: "Creepin'", artist: "Metro Boomin", hue: 200 },
  { title: "Golden Hour", artist: "JVKE", hue: 42 },
] as { title: string; artist: string; hue: number; cover?: string; spotify?: string }[]

export const offClock = [
  { title: "DJ-ish mode", text: "Currently in the \"Spotify playlists as preparation\" era." },
  { title: "Vegetarian food investigator", text: "Will find the good vegetarian option. This is a public service." },
  { title: "Microinteraction goblin", text: "Notices hover states, loading screens, and the exact animation that makes something feel expensive." },
  { title: "Cute robot defender", text: "Mascots are only acceptable if they do real work." },
  { title: "International student lens", text: "Deeply aware that institutions are giant UX tests with paperwork." },
  { title: "Chaos-to-structure reflex", text: "Give me messy notes and contradictory opinions. I will produce a framework against everyone's will." },
]

export const brainOS = [
  { k: "Inputs", v: "Messy notes, interviews, screenshots, rituals, group chats, broken workflows, weird user behavior." },
  { k: "Processing", v: "Psychology, pattern recognition, IA, prototyping, spicy opinions, \"wait this makes no sense\" energy." },
  { k: "Outputs", v: "Systems maps, sharper questions, clean workflows, prototypes, tiny interactions, useful chaos." },
  { k: "Error state", v: "\"Can you just make it prettier?\"" },
]

export const openTabs = [
  { key: "forms_are_suspicious", text: "Every required field is a tiny interrogation. I've spent two internships asking why forms collect things nobody reads. No one has answered yet." },
  { key: "ai_but_make_it_useful", text: "I design AI features for people who don't care about AI: dispatchers, analysts, drivers. If it doesn't shorten their day, it's decoration." },
  { key: "public_safety_workflows", text: "My current obsession: the software behind dispatch, threat intake, and fleet ops. High stakes, ancient tools, enormous design debt. Heaven." },
  { key: "vegetarian_food_maps", text: "I maintain mental maps of the good vegetarian option in every city I've visited. Consulting fees: one chai." },
  { key: "spotify_as_information_architecture", text: "My playlists have a taxonomy, an ontology, and the occasional governance crisis. Sorting music is just IA with feelings." },
  { key: "cute_robots_with_jobs", text: "Mascots must earn their place. If the robot doesn't reduce support tickets, the robot is fired." },
  { key: "why_is_this_button_like_that", text: "A running field journal of buttons that lie, hover states that ghost, and modals that appear out of spite." },
  { key: "job_search_is_emotional_damage", text: "Currently building a gamified job tracker, because the default experience is 47 tabs and despair. UX-ing my own coping mechanism." },
]

export const hiring = [
  { key: "What I'm looking for", text: "UX research and design roles where the problems are messy and operational. I do my best work turning fragmented workflows into systems people actually adopt." },
  { key: "What I'm like to work with", text: "Direct, organized, and genuinely invested in the people around me. I ask a lot of questions early so the build goes fast later." },
]

// Infinite gallery (About). Add `src: "/media/about/dj.jpg"` to show a real photo.
export const moments = [
  { title: "dj set @ btb · 1am", year: 2024, category: "hobbies" },
  { title: "matcha run (always)", year: 2024, category: "hobbies" },
  { title: "psych degree speedrun", year: 2024, category: "hobbies" },
  { title: "late night study hall", year: 2023, category: "hobbies" },
  { title: "research lab hrs", year: 2024, category: "hobbies" },
  { title: "overthinker (certified)", year: 2024, category: "hobbies" },
  { title: "angell hall basement", year: 2023, category: "hobbies" },
  { title: "east lansing era", year: 2021, category: "hobbies" },
  { title: "the diag in october", year: 2023, category: "places" },
  { title: "bangalore, india", year: 2001, category: "places" },
  { title: "ann arbor, mi", year: 2022, category: "places" },
  { title: "game day chaos", year: 2023, category: "places" },
  { title: "east lansing, mi", year: 2021, category: "places" },
  { title: "chicago layover", year: 2023, category: "places" },
  { title: "random road trip", year: 2024, category: "places" },
] as { title: string; year: number; category: string; src?: string }[]

// Lab drag canvas ("Tidbits of my work"). x/y are % of the board; `cover` optional.
export const tidbits = [
  { title: "Nani's Kitchen", cta: "View Nani's Kitchen", href: "https://dhwanib-del.github.io/nani-s-kitchen/", x: 39, y: 43, w: 188, h: 280, tilt: -3, hue: 24 },
  { title: "Gesture PhotoBooth", cta: "Gesture PhotoBooth", x: 63, y: 40, w: 357, h: 267, tilt: 4, hue: 200 },
  { title: "Glimmer", cta: "View Glimmer", href: "https://www.figma.com/proto/ZNkhMhxdhgOELUVfqhbtE7/Glimmer-%E2%80%94-Reverse-Brain-Hack-App?node-id=10-502&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1", x: 61, y: 57, w: 188, h: 194, tilt: 2, hue: 280 },
  { title: "Luma", cta: "View Luma", href: "https://temporary-sonic-plateau-49oy5cr.vercel.app/", x: 42, y: 56, w: 188, h: 246, tilt: -3, hue: 150 },
] as { title: string; cta: string; href?: string; x: number; y: number; w: number; h: number; tilt: number; hue: number; cover?: string }[]

export const builtWithAI = "These experiments, and the interactive pieces they're made of, come out of directed AI sessions, not one-shot generation. I specify the intent in plain language, correct the output when it drifts from the brief, and reject what doesn't earn its place. This is what AI fluency looks like as a design skill: knowing exactly what to ask for, and what to throw away."
