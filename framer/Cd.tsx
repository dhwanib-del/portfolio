// DhwaniEditorialCD v4 — the album CD in the home hero.
// The sleeve is still her photo (no made-up artwork, no overlays on the photo itself).
//  • Things to press: the sleeve (opens the notes), the disc (play / pause the spin), the heart
//    (a little burst, stays filled), the sticker (flips side A / side B), "Inside the sleeve", and
//    each track (opens its own note, the disc label shows the track number).
//  • Notes open in the page flow under the sleeve, never over the next section.
//  • Each track note links to the matching part of the site (work, about, AI lab).
//  • Responsive by container width. Reduced motion: no spin, no bursts, no tilt.
import {
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type PointerEvent as RPointerEvent,
} from "react"
import { addPropertyControls, ControlType } from "framer"

const defaultTracks = [
    {
        number: "01",
        name: "The designer",
        note: "AI-native product design, research, and a love for figuring things out.",
        href: "/#work",
        cta: "See the work",
    },
    {
        number: "02",
        name: "Behind the lens",
        note: "Photography, light, and collecting little moments.",
        href: "/about-me",
        cta: "More about me",
    },
    {
        number: "03",
        name: "Frequent flyer",
        note: "Places, people, and the ones I’m still dreaming about.",
        href: "/about-me",
        cta: "More about me",
    },
    {
        number: "04",
        name: "After hours",
        note: "Learning to DJ and making things just because.",
        href: "/lab",
        cta: "Visit the AI lab",
    },
]

type Props = {
    photo?: string
    photoAlt?: string
    photoX?: number
    photoY?: number
    artist?: string
    volume?: string
    maxWidth?: number
    workLink?: string
    showLinerNotes?: boolean
    followVibe?: boolean
    accent?: string
    tracks?: { title: string; detail: string; link?: string; linkLabel?: string }[]
    style?: CSSProperties
}

/** @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto */
export default function DhwaniEditorialCD({
    photo,
    photoAlt = "Dhwani's photograph on the album sleeve",
    photoX = 50,
    photoY = 50,
    artist = "dhwani",
    volume = "vol. 01",
    maxWidth = 330,
    workLink = "/#work",
    showLinerNotes = true,
    followVibe = true,
    accent = "#F3500F",
    tracks: items,
    style,
}: Props) {
    const tracks = items?.length
        ? items.map((t, i) => ({
              number: String(i + 1).padStart(2, "0"),
              name: t.title,
              note: t.detail,
              href: t.link || "",
              cta: t.linkLabel || "Take me there",
          }))
        : defaultTracks
    const notesId = useId()
    const coverButton = useRef<HTMLButtonElement>(null)
    const root = useRef<HTMLElement>(null)
    const [open, setOpen] = useState(false)
    const [track, setTrack] = useState(0)
    const [paused, setPaused] = useState(false)
    const [liked, setLiked] = useState(false)
    const [burst, setBurst] = useState(0)
    const [side, setSide] = useState<"A" | "B">("A")

    useEffect(() => {
        if (!open) return
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false)
                coverButton.current?.focus()
            }
        }
        const onPointer = (event: PointerEvent) => {
            const el = root.current
            if (!el) return
            const path = event.composedPath ? event.composedPath() : []
            if (path.includes(el)) return
            if (event.target instanceof Node && el.contains(event.target)) return
            setOpen(false)
        }
        window.addEventListener("keydown", onKey)
        window.addEventListener("pointerdown", onPointer)
        return () => {
            window.removeEventListener("keydown", onKey)
            window.removeEventListener("pointerdown", onPointer)
        }
    }, [open])

    const tilt = (e: RPointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== "mouse") return
        const r = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        e.currentTarget.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`)
        e.currentTarget.style.setProperty("--ry", `${(x * 10).toFixed(2)}deg`)
        e.currentTarget.style.setProperty("--sheen", `${Math.round((x + 0.5) * 360)}deg`)
    }
    const untilt = (e: RPointerEvent<HTMLDivElement>) => {
        e.currentTarget.style.setProperty("--rx", "0deg")
        e.currentTarget.style.setProperty("--ry", "0deg")
    }

    const current = tracks[Math.min(track, tracks.length - 1)]

    return (
        <aside
            ref={root}
            className="cd2"
            aria-label="Dhwani's personal debut album"
            data-open={open}
            style={
                {
                    ...style,
                    "--cd-w": `${maxWidth}px`,
                    ...(!followVibe ? { "--db-accent": accent } : {}),
                } as CSSProperties
            }
        >
            <style>{CSS}</style>
            <div className="cd2-stage" onPointerMove={tilt} onPointerLeave={untilt}>
                <button
                    type="button"
                    className="cd2-disc"
                    data-paused={paused}
                    onClick={() => (open ? setPaused((v) => !v) : setOpen(true))}
                    aria-label={
                        !open ? "Play Dhwani's album" : paused ? "Play the record" : "Pause the record"
                    }
                >
                    <div className="cd2-spin" aria-hidden="true">
                        <span className="cd2-rings" />
                        <span className="cd2-label">
                            <em>{artist}</em>
                            <b>{open ? `track ${current?.number || "01"}` : volume}</b>
                        </span>
                    </div>
                </button>
                <span className="cd2-notes" aria-hidden="true">
                    <i>♪</i>
                    <i>♫</i>
                    <i>♪</i>
                </span>
                <div className="cd2-sleeve">
                    <button
                        ref={coverButton}
                        type="button"
                        className="cd2-case"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls={showLinerNotes ? notesId : undefined}
                        aria-label={open ? "Close Dhwani's album notes" : "Open Dhwani's album"}
                    >
                        <span className="cd2-cover">
                            <img
                                src={
                                    photo ||
                                    "https://framerusercontent.com/images/E2as8iF40Zhd1SMdlgjNjbeao.jpg"
                                }
                                alt={photoAlt}
                                style={{ objectPosition: `${photoX}% ${photoY}%` }}
                                draggable={false}
                                width={500}
                                height={500}
                            />
                        </span>
                        <span className="cd2-hinge" aria-hidden="true" />
                        <span className="cd2-shine" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="cd2-sticker"
                        data-side={side}
                        onClick={() => setSide((v) => (v === "A" ? "B" : "A"))}
                        aria-label={`Flip to side ${side === "A" ? "B" : "A"}`}
                    >
                        <span key={side}>{side === "A" ? volume : "side b"}</span>
                    </button>
                    <button
                        type="button"
                        className="cd2-heart"
                        aria-pressed={liked}
                        aria-label={liked ? "Liked" : "Like this album"}
                        onClick={() => {
                            setLiked(true)
                            setBurst((b) => b + 1)
                        }}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
                        </svg>
                        {burst > 0 && (
                            <span className="cd2-burst" key={burst} aria-hidden="true">
                                <i />
                                <i />
                                <i />
                                <i />
                                <i />
                                <i />
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="cd2-meta">
                <span className="cd2-artist">
                    <em>{artist}</em> · {volume}
                </span>
                <button
                    type="button"
                    className="cd2-play"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls={showLinerNotes ? notesId : undefined}
                >
                    <span className="cd2-play-icon" aria-hidden="true">
                        {open ? (
                            <svg viewBox="0 0 24 24">
                                <rect x="6" y="5" width="4" height="14" rx="1" />
                                <rect x="14" y="5" width="4" height="14" rx="1" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24">
                                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5z" />
                            </svg>
                        )}
                    </span>
                    {open ? "Close notes" : "Inside the sleeve"}
                </button>
            </div>

            {showLinerNotes && (
                <div
                    id={notesId}
                    className="cd2-liner"
                    data-open={open}
                    aria-hidden={!open}
                >
                    <div className="cd2-liner-head">
                        <span>Inside the sleeve</span>
                        <button
                            type="button"
                            tabIndex={open ? 0 : -1}
                            onClick={() => {
                                setOpen(false)
                                coverButton.current?.focus()
                            }}
                            aria-label="Close notes"
                        >
                            ×
                        </button>
                    </div>
                    <ul className="cd2-tracks" aria-label="A few things about me">
                        {tracks.map((item, index) => {
                            const on = index === track
                            const panel = `${notesId}-t${index}`
                            return (
                                <li key={item.number + index} data-on={on}>
                                    <button
                                        type="button"
                                        tabIndex={open ? 0 : -1}
                                        aria-expanded={on}
                                        aria-controls={panel}
                                        onClick={() => setTrack(index)}
                                    >
                                        <span className="cd2-no">
                                            {on ? (
                                                <span className="cd2-eq" aria-hidden="true">
                                                    <i />
                                                    <i />
                                                    <i />
                                                </span>
                                            ) : (
                                                item.number
                                            )}
                                        </span>
                                        <strong>{item.name}</strong>
                                        <span className="cd2-chev" aria-hidden="true">
                                            <svg viewBox="0 0 24 24">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div id={panel} className="cd2-note" hidden={!on}>
                                        <p>{item.note}</p>
                                        {item.href && (
                                            <a
                                                className="cd2-go"
                                                href={item.href}
                                                tabIndex={open && on ? 0 : -1}
                                                onClick={() => setOpen(false)}
                                            >
                                                {item.cta}
                                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M4 12h15M13 6l6 6-6 6" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                    <a
                        href={workLink}
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                    >
                        Show me the work
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M4 12h15M13 6l6 6-6 6" />
                        </svg>
                    </a>
                </div>
            )}
        </aside>
    )
}

const CSS = `
.cd2,.cd2 *{box-sizing:border-box}
.cd2{--acc:var(--db-accent,#F3500F);position:relative;z-index:5;pointer-events:auto;container-type:inline-size;width:100%;max-width:var(--cd-w,330px);min-width:0;margin-inline:auto;color:var(--db-text,#fff);font-family:'Poppins',sans-serif}
.cd2 button{font-family:inherit;cursor:pointer}
.cd2 :is(button,a):focus-visible{outline:2px solid var(--acc);outline-offset:4px}
.cd2-stage{--slide:30%;--rx:0deg;--ry:0deg;--sheen:200deg;position:relative;width:100%;aspect-ratio:1.12;perspective:900px}
.cd2-sleeve{position:absolute;z-index:3;left:2%;top:6%;width:76%;aspect-ratio:1;transform:rotate(-4deg) rotateX(var(--rx)) rotateY(var(--ry));transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 22px 26px rgba(0,0,0,.35))}
.cd2-sleeve:hover{transform:rotate(-3deg) translateY(-4px) rotateX(var(--rx)) rotateY(var(--ry))}
.cd2[data-open=true] .cd2-sleeve{transform:rotate(-6deg) translateX(-4%)}
.cd2-case{position:absolute;inset:0;padding:0;border:0;background:none;border-radius:6px}
.cd2-cover{position:absolute;inset:0 0 0 7%;overflow:hidden;border-radius:3px 6px 6px 3px;background:#17171b}
.cd2-cover img{width:100%;height:100%;object-fit:cover;display:block}
.cd2-hinge{position:absolute;left:0;top:0;bottom:0;width:7%;border-radius:6px 0 0 6px;background:linear-gradient(90deg,#e9e9ee,#b9bac2 40%,#7d7f88);box-shadow:inset -1px 0 0 #ffffff80}
.cd2-hinge::after{content:"";position:absolute;inset:8% 30%;border-radius:2px;background:repeating-linear-gradient(#ffffff70 0 2px,transparent 2px 6px)}
.cd2-shine{position:absolute;inset:0 0 0 7%;border-radius:3px 6px 6px 3px;pointer-events:none;background:linear-gradient(125deg,rgba(255,255,255,.34),rgba(255,255,255,.04) 28%,transparent 60%,rgba(255,255,255,.12));box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}
.cd2-sticker{position:absolute;z-index:2;right:-6%;top:-5%;min-height:30px;padding:6px 10px;border:0;border-radius:999px;background:#fff8e8;color:#16151a;font:600 clamp(9px,3.3cqw,12px)/1 'Poppins',sans-serif;letter-spacing:.06em;text-transform:uppercase;transform:rotate(9deg);box-shadow:0 4px 10px rgba(0,0,0,.25);transition:transform .35s cubic-bezier(.2,.8,.2,1),background .3s}
.cd2-sticker:hover{transform:rotate(14deg) scale(1.06)}
.cd2-sticker[data-side=B]{background:var(--acc);color:var(--db-on-accent,#0a0a0a)}
.cd2-sticker span{display:inline-block;animation:cd2-flip .4s cubic-bezier(.2,.8,.2,1)}
@keyframes cd2-flip{from{transform:rotateX(90deg);opacity:0}}
.cd2-heart{position:absolute;z-index:2;left:4%;bottom:-6%;width:clamp(36px,12cqw,44px);aspect-ratio:1;padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:var(--acc);transform:rotate(-12deg);box-shadow:0 4px 12px rgba(0,0,0,.3);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.cd2-heart:hover{transform:rotate(-4deg) scale(1.08)}
.cd2-heart:active{transform:scale(.9)}
.cd2-heart svg{width:52%;height:52%;fill:none;stroke:#fff;stroke-width:2.2;transition:fill .2s}
.cd2-heart[aria-pressed=true] svg{fill:#fff}
.cd2[data-open=true] .cd2-heart{transform:rotate(8deg) scale(1.1)}
.cd2-burst{position:absolute;inset:0;pointer-events:none}
.cd2-burst i{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px;border-radius:50%;background:var(--acc);animation:cd2-burst .7s ease-out forwards}
.cd2-burst i:nth-child(1){--bx:0px;--by:-30px}.cd2-burst i:nth-child(2){--bx:26px;--by:-15px}.cd2-burst i:nth-child(3){--bx:26px;--by:15px}.cd2-burst i:nth-child(4){--bx:0px;--by:30px}.cd2-burst i:nth-child(5){--bx:-26px;--by:15px}.cd2-burst i:nth-child(6){--bx:-26px;--by:-15px}
@keyframes cd2-burst{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--bx),var(--by)) scale(.3);opacity:0}}
.cd2-disc{position:absolute;z-index:1;left:22%;top:9%;width:70%;aspect-ratio:1;padding:0;border:0;background:none;border-radius:50%;overflow:hidden;transition:transform .7s cubic-bezier(.2,.8,.2,1);box-shadow:0 14px 30px rgba(0,0,0,.32)}
.cd2-spin{position:absolute;inset:0;border-radius:50%;transition:transform .7s cubic-bezier(.2,.8,.2,1);background:radial-gradient(circle,transparent 0 15%,rgba(255,255,255,.55) 15.5% 16%,transparent 16.5%),conic-gradient(from var(--sheen),#f6d6e6,#cfe3ff,#d8f5e8,#fff1c9,#f3c9d9,#d4d0ff,#c9f0ff,#f6d6e6);box-shadow:inset 0 0 0 1px rgba(255,255,255,.75)}
.cd2:not([data-open=true]) .cd2-stage:hover .cd2-disc{transform:translateX(12%)}
.cd2-stage:hover .cd2-spin{transform:rotate(20deg)}
.cd2[data-open=true] .cd2-disc{transform:translateX(var(--slide))}
.cd2[data-open=true] .cd2-spin{animation:cd2-spin 3.6s linear infinite}
.cd2[data-open=true] .cd2-disc[data-paused=true] .cd2-spin{animation-play-state:paused}
.cd2-rings{position:absolute;inset:4%;border-radius:50%;background:repeating-radial-gradient(circle,transparent 0 3px,rgba(255,255,255,.18) 3px 4px);mix-blend-mode:soft-light}
.cd2-label{position:absolute;inset:31%;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:radial-gradient(circle,#111 0 13%,#fffaf2 14%);box-shadow:inset 0 0 0 1px #d8d3cb;color:#16151a}
.cd2-label em{font:400 clamp(16px,7cqw,26px)/1 'Pinyon Script',cursive;margin-top:22%}
.cd2-label b{font:600 clamp(6px,2.2cqw,8px) 'Poppins',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--acc)}
.cd2-notes{position:absolute;z-index:4;right:4%;top:6%;pointer-events:none}
.cd2-notes i{position:absolute;font-style:normal;font-size:clamp(14px,6cqw,22px);color:var(--acc);opacity:0}
.cd2[data-open=true] .cd2-notes i{animation:cd2-note 2.6s ease-out infinite}
.cd2-notes i:nth-child(2){right:22px;animation-delay:.8s !important}
.cd2-notes i:nth-child(3){right:-12px;animation-delay:1.6s !important}
.cd2-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:6px;padding:0 2%}
.cd2-artist{font-size:12px;color:var(--db-text-2,#aaa);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cd2-artist em{font:400 18px/1 'Pinyon Script',cursive;color:var(--db-text,#fff)}
.cd2-play{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 16px 0 6px;border-radius:999px;border:.5px solid var(--sp-edge,var(--db-line,#ffffff26));background:var(--sp-glass,var(--db-surface,#111));-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);color:var(--db-text,#fff);font-size:12px;font-weight:500;white-space:nowrap}
.cd2-play-icon{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--acc)}
.cd2-play-icon svg{width:14px;height:14px;fill:var(--db-on-accent,#0a0a0a)}
.cd2-liner{position:relative;z-index:9;pointer-events:auto;margin-top:12px;width:100%;padding:14px;border-radius:18px;background:var(--db-surface,#111);border:1px solid var(--db-line,#ffffff1f);box-shadow:var(--db-shadow,0 20px 40px -20px #000);display:none}
.cd2-liner[data-open=true]{display:block;animation:cd2-in .3s cubic-bezier(.2,.8,.2,1) both}
.cd2-liner-head{display:flex;align-items:center;justify-content:space-between;padding:0 2px 8px;border-bottom:1px solid var(--db-line,#ffffff1f);font:600 12px 'Poppins',sans-serif}
.cd2-liner-head button{width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:inherit;font-size:22px}
.cd2-tracks{list-style:none;margin:0;padding:8px 0 10px;display:grid;gap:2px}
.cd2-tracks li{border-radius:12px;transition:background .2s}
.cd2-tracks li[data-on=true]{background:color-mix(in srgb,var(--acc) 14%,transparent)}
.cd2-tracks button{width:100%;display:grid;grid-template-columns:26px 1fr 20px;align-items:center;gap:8px;min-height:44px;padding:6px 8px;border:0;border-radius:12px;background:transparent;color:var(--db-text,#fff);text-align:left;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.cd2-tracks li:not([data-on=true]) button:hover{background:var(--db-line,#ffffff10)}
.cd2-tracks strong{font-size:13px;font-weight:500}
.cd2-chev{display:grid;place-items:center;opacity:.6;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.cd2-chev svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cd2-tracks li[data-on=true] .cd2-chev{transform:rotate(180deg);opacity:1;color:var(--acc)}
.cd2-note{padding:0 10px 12px 42px;animation:cd2-in .3s cubic-bezier(.2,.8,.2,1) both}
.cd2-note[hidden]{display:none}
.cd2-note p{margin:0;font-size:13px;line-height:1.6;color:var(--db-text-2,#bbb)}
.cd2-liner .cd2-go{display:inline-flex;align-items:center;gap:6px;min-height:36px;margin-top:6px;padding:0 12px;border-radius:999px;background:color-mix(in srgb,var(--acc) 16%,transparent);color:var(--db-text,#fff);font-size:12px;font-weight:600}
.cd2-liner .cd2-go:hover{background:var(--acc);color:var(--db-on-accent,#0a0a0a)}
.cd2-no{font-size:11px;color:var(--db-text-2,#aaa);font-variant-numeric:tabular-nums;display:grid;place-items:center}
.cd2-eq{display:inline-flex;align-items:flex-end;gap:2px;height:12px}
.cd2-eq i{width:3px;height:100%;border-radius:1px;background:var(--acc);transform-origin:bottom;animation:cd2-eq .9s ease-in-out infinite alternate}
.cd2-eq i:nth-child(2){animation-delay:-.3s}.cd2-eq i:nth-child(3){animation-delay:-.6s}
.cd2-liner a{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 4px;color:var(--acc);font-size:13px;font-weight:600;text-decoration:none}
.cd2-liner a svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;transition:transform .3s cubic-bezier(.16,1,.3,1)}
.cd2-liner a:hover svg{transform:translateX(3px)}
@keyframes cd2-in{from{opacity:0;transform:translateY(-6px)}}
@keyframes cd2-spin{to{transform:rotate(360deg)}}
@keyframes cd2-eq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}
@keyframes cd2-note{0%{opacity:0;transform:translate(0,10px) rotate(-10deg)}20%{opacity:1}100%{opacity:0;transform:translate(-14px,-46px) rotate(14deg)}}
@container (max-width:380px){.cd2-stage{--slide:14%}}
@container (max-width:260px){.cd2-meta{flex-direction:column;align-items:stretch}.cd2-play{justify-content:center}}
@media (prefers-reduced-motion:reduce){.cd2-sleeve,.cd2-disc,.cd2-heart,.cd2-sticker{transition:none}.cd2-burst{display:none}.cd2-sticker span{animation:none}.cd2-liner{animation:none !important}.cd2[data-open=true] .cd2-spin{animation:none}.cd2-spin{transition:none}.cd2-notes,.cd2-eq i{display:none}.cd2-note{animation:none}.cd2-stage{--rx:0deg !important;--ry:0deg !important}}
`

addPropertyControls(DhwaniEditorialCD, {
    photo: { type: ControlType.Image, title: "Cover photo" },
    photoAlt: {
        type: ControlType.String,
        title: "Photo alt",
        defaultValue: "Dhwani's photograph on the album sleeve",
    },
    photoX: { type: ControlType.Number, title: "Crop X", min: 0, max: 100, defaultValue: 50 },
    photoY: { type: ControlType.Number, title: "Crop Y", min: 0, max: 100, defaultValue: 50 },
    artist: { type: ControlType.String, title: "Artist", defaultValue: "dhwani" },
    volume: { type: ControlType.String, title: "Volume", defaultValue: "vol. 01" },
    maxWidth: { type: ControlType.Number, title: "Max width", min: 220, max: 480, defaultValue: 330 },
    workLink: { type: ControlType.Link, title: "View work", defaultValue: "/#work" },
    showLinerNotes: { type: ControlType.Boolean, title: "Liner notes", defaultValue: true },
    followVibe: { type: ControlType.Boolean, title: "Use site vibe", defaultValue: true },
    accent: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#F3500F",
        hidden: (p: any) => !!p.followVibe,
    },
    tracks: {
        type: ControlType.Array,
        title: "Tracks",
        maxCount: 6,
        control: {
            type: ControlType.Object,
            controls: {
                title: { type: ControlType.String, title: "Title" },
                detail: { type: ControlType.String, title: "Description", displayTextArea: true },
                link: { type: ControlType.Link, title: "Link" },
                linkLabel: { type: ControlType.String, title: "Link text", defaultValue: "Take me there" },
            },
        },
    },
})
