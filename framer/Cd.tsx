// DhwaniEditorialCD v5 (Oct 22) — the album CD in the home hero, cuter + sturdier.
// Dhwani: "make the fun cd component but make it cuter and better in framer and more responsive".
// The sleeve is still her photo (no made-up artwork on the photo itself).
//  • Jewel case: clear plastic over the photo, ridged hinge, bevel + soft reflection, a round
//    peel-shine sticker (flips side A / side B) and a heart (little burst, stays filled).
//  • Disc: iridescent data ring (subtle conic sheen), clear hub ring with a real hole, and a printed
//    label in her accent / vibe colours (--db-accent, --vibe-a/b/c) with her name in Pinyon Script.
//  • Click the case (or "Inside the sleeve") to eject: the disc slides out and the liner notes open.
//    Click the disc to play / pause. Drag the disc to scratch-spin it (arrow keys do the same).
//  • Motion only when asked: a slow spin on hover, a steady spin while playing, nothing otherwise.
//    The spin loop stops when the CD is off screen or the tab is hidden. Reduced motion: static.
//  • A tiny sparkle where you click. Liner notes open in the page flow, never over the next section.
//  • Responsive by container width (CSS container units), 320–1440px, no fixed pixel widths.
//    "Max width" still caps it (0 = fill the parent). Theme tokens (--db-*) for light and dark.
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent as RKeyboardEvent,
    type MouseEvent as RMouseEvent,
    type PointerEvent as RPointerEvent,
} from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

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
    scriptNote?: string
    sparkles?: boolean
    spinOnHover?: boolean
    tracks?: { title: string; detail: string; link?: string; linkLabel?: string }[]
    style?: CSSProperties
}

const isExternal = (href: string) => /^https?:\/\//i.test(href || "")

// Shared link arrow (same look across Dhwani's components): 14px, 1.5px stroke, round caps,
// currentColor. "ne" (↗) for links that leave the site, "e" (→) for links inside it.
function DbArrow({ external = false }: { external?: boolean }) {
    return (
        <svg
            className="db-arrow"
            data-dir={external ? "ne" : "e"}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {external ? <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
        </svg>
    )
}

type Sparkle = { id: number; x: number; y: number }

// deg per millisecond
const PLAY_SPEED = 0.12
const HOVER_SPEED = 0.035

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
    scriptNote = "thanks for listening",
    sparkles = true,
    spinOnHover = true,
    tracks: items,
    style,
}: Props) {
    const isStatic = useIsStaticRenderer()
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
    const rotEl = useRef<HTMLSpanElement>(null)
    const [open, setOpen] = useState(false)
    const [track, setTrack] = useState(0)
    const [paused, setPaused] = useState(false)
    const [liked, setLiked] = useState(false)
    const [burst, setBurst] = useState(0)
    const [side, setSide] = useState<"A" | "B">("A")
    const [visible, setVisible] = useState(true)
    const [reduced, setReduced] = useState(false)
    const [spark, setSpark] = useState<Sparkle[]>([])
    const playing = open && !paused

    // ---- spin engine: one rAF loop that only runs while something is moving ----
    const angle = useRef(0)
    const vel = useRef(0)
    const raf = useRef(0)
    const last = useRef(0)
    const want = useRef({ play: false, hover: false, drag: false, vis: true, reduced: false })
    const drag = useRef({ on: false, id: -1, a: 0, t: 0, moved: 0, suppress: false })

    const paint = () => {
        if (rotEl.current) rotEl.current.style.transform = `rotate(${angle.current.toFixed(2)}deg)`
    }
    const loop = useCallback((t: number) => {
        const s = want.current
        const dt = Math.min(48, Math.max(0, t - (last.current || t)))
        last.current = t
        const target = s.reduced || !s.vis ? 0 : s.play ? PLAY_SPEED : s.hover ? HOVER_SPEED : 0
        if (!s.drag) {
            vel.current += (target - vel.current) * Math.min(1, dt / 380)
            angle.current = (angle.current + vel.current * dt) % 360
        }
        paint()
        const moving = s.drag || target > 0 || Math.abs(vel.current) > 0.002
        raf.current = moving && s.vis && !s.reduced ? requestAnimationFrame(loop) : 0
        if (!raf.current) vel.current = moving ? vel.current : 0
    }, [])
    const kick = useCallback(() => {
        const s = want.current
        if (raf.current || s.reduced || !s.vis || typeof window === "undefined") return
        last.current = performance.now()
        raf.current = requestAnimationFrame(loop)
    }, [loop])

    useEffect(() => {
        want.current.play = playing
        if (playing) kick()
    }, [playing, kick])

    useEffect(() => {
        if (isStatic || typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const read = () => {
            want.current.reduced = mq.matches
            setReduced(mq.matches)
            if (!mq.matches) kick()
        }
        read()
        mq.addEventListener("change", read)
        const el = root.current
        let near = true
        const sync = () => {
            const v = near && !document.hidden
            want.current.vis = v
            setVisible(v)
            if (v) kick()
            else if (raf.current) {
                cancelAnimationFrame(raf.current)
                raf.current = 0
            }
        }
        const io =
            el && typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      ([e]) => {
                          near = !!e?.isIntersecting
                          sync()
                      },
                      { rootMargin: "80px" }
                  )
                : null
        if (io && el) io.observe(el)
        document.addEventListener("visibilitychange", sync)
        return () => {
            mq.removeEventListener("change", read)
            io?.disconnect()
            document.removeEventListener("visibilitychange", sync)
            if (raf.current) cancelAnimationFrame(raf.current)
            raf.current = 0
        }
    }, [isStatic, kick])

    // ---- close on Escape / outside press ----
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

    // ---- case tilt (mouse only) ----
    const tilt = (e: RPointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== "mouse" || want.current.reduced) return
        const r = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        e.currentTarget.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`)
        e.currentTarget.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`)
        e.currentTarget.style.setProperty("--glint", `${Math.round((x + 0.5) * 100)}%`)
    }
    const untilt = (e: RPointerEvent<HTMLDivElement>) => {
        e.currentTarget.style.setProperty("--rx", "0deg")
        e.currentTarget.style.setProperty("--ry", "0deg")
        want.current.hover = false
    }
    const onStageEnter = (e: RPointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== "mouse" || !spinOnHover) return
        want.current.hover = true
        kick()
    }

    // ---- sparkle where you click ----
    const sparkleAt = (e: RMouseEvent<HTMLDivElement>) => {
        if (!sparkles || want.current.reduced || isStatic) return
        const r = e.currentTarget.getBoundingClientRect()
        if (!r.width) return
        const x = e.clientX ? ((e.clientX - r.left) / r.width) * 100 : 50
        const y = e.clientY ? ((e.clientY - r.top) / r.height) * 100 : 50
        const id = Date.now() + Math.random()
        setSpark((s) => [...s.slice(-2), { id, x, y }])
        window.setTimeout(() => setSpark((s) => s.filter((p) => p.id !== id)), 900)
    }

    // ---- drag to scratch-spin ----
    const centerAngle = (e: RPointerEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect()
        return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI
    }
    const onDiscDown = (e: RPointerEvent<HTMLButtonElement>) => {
        if (e.button !== 0) return
        drag.current = { on: true, id: e.pointerId, a: centerAngle(e), t: performance.now(), moved: 0, suppress: false }
    }
    const onDiscMove = (e: RPointerEvent<HTMLButtonElement>) => {
        const d = drag.current
        if (!d.on || d.id !== e.pointerId) return
        const a = centerAngle(e)
        let delta = a - d.a
        if (delta > 180) delta -= 360
        if (delta < -180) delta += 360
        const now = performance.now()
        d.moved += Math.abs(delta)
        if (d.moved > 8 && !want.current.drag) {
            want.current.drag = true
            try {
                e.currentTarget.setPointerCapture(e.pointerId)
            } catch {}
            e.currentTarget.setAttribute("data-dragging", "true")
            kick()
        }
        if (want.current.drag) {
            angle.current += delta
            vel.current = delta / Math.max(8, now - d.t)
            paint()
        }
        d.a = a
        d.t = now
    }
    const onDiscUp = (e: RPointerEvent<HTMLButtonElement>) => {
        const d = drag.current
        if (!d.on) return
        d.on = false
        if (want.current.drag) {
            d.suppress = true
            want.current.drag = false
            vel.current = Math.max(-1.2, Math.min(1.2, vel.current))
            e.currentTarget.removeAttribute("data-dragging")
            kick()
        }
    }
    const onDiscClick = () => {
        if (drag.current.suppress) {
            drag.current.suppress = false
            return
        }
        if (!open) {
            setPaused(false)
            setOpen(true)
        } else setPaused((v) => !v)
    }
    const onDiscKey = (e: RKeyboardEvent<HTMLButtonElement>) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
        e.preventDefault()
        angle.current += e.key === "ArrowRight" ? 24 : -24
        paint()
    }

    const current = tracks[Math.min(track, tracks.length - 1)]
    const cap = Number(maxWidth) > 0 ? `${maxWidth}px` : "none"

    return (
        <aside
            ref={root}
            className="cd3"
            aria-label="Dhwani's personal debut album"
            data-open={open}
            data-playing={playing}
            data-vis={visible}
            data-reduced={reduced || isStatic}
            style={
                {
                    ...style,
                    "--cd-w": cap,
                    ...(!followVibe ? { "--db-accent": accent } : {}),
                } as CSSProperties
            }
        >
            <style>{CSS}</style>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap" />
            <div
                className="cd3-stage"
                onPointerMove={tilt}
                onPointerEnter={onStageEnter}
                onPointerLeave={untilt}
                onClickCapture={sparkleAt}
            >
                <div className="cd3-tray">
                    <button
                        type="button"
                        className="cd3-disc"
                        onClick={onDiscClick}
                        onKeyDown={onDiscKey}
                        onPointerDown={onDiscDown}
                        onPointerMove={onDiscMove}
                        onPointerUp={onDiscUp}
                        onPointerCancel={onDiscUp}
                        aria-label={
                            !open
                                ? "Eject and play Dhwani's album"
                                : paused
                                  ? "Play the record. Drag or use arrow keys to spin it."
                                  : "Pause the record. Drag or use arrow keys to spin it."
                        }
                    >
                        <span className="cd3-rot" ref={rotEl} aria-hidden="true">
                            <span className="cd3-iri" />
                            <span className="cd3-grooves" />
                            <span className="cd3-print">
                                <span className="cd3-print-art" />
                                <em>{artist}</em>
                                <b>{open ? `track ${current?.number || "01"}` : volume}</b>
                                <i className="cd3-heart-dot">♡</i>
                            </span>
                            <span className="cd3-hub" />
                        </span>
                        <span className="cd3-glint" aria-hidden="true" />
                    </button>
                </div>
                <span className="cd3-notes" aria-hidden="true">
                    <i>♪</i>
                    <i>♫</i>
                    <i>♪</i>
                </span>
                <div className="cd3-case">
                    <button
                        ref={coverButton}
                        type="button"
                        className="cd3-cover"
                        onClick={() => {
                            if (!open) setPaused(false)
                            setOpen((v) => !v)
                        }}
                        aria-expanded={open}
                        aria-controls={showLinerNotes ? notesId : undefined}
                        aria-label={open ? "Close Dhwani's album notes" : "Open Dhwani's album"}
                    >
                        <span className="cd3-photo">
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
                        <span className="cd3-plastic" aria-hidden="true" />
                        <span className="cd3-hinge" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="cd3-sticker"
                        data-side={side}
                        onClick={() => setSide((v) => (v === "A" ? "B" : "A"))}
                        aria-label={`Flip to side ${side === "A" ? "B" : "A"}`}
                    >
                        <span key={side}>
                            <small>side</small>
                            {side === "A" ? "a" : "b"}
                        </span>
                    </button>
                    <button
                        type="button"
                        className="cd3-heart"
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
                            <span className="cd3-burst" key={burst} aria-hidden="true">
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
                {spark.map((s) => (
                    <span
                        key={s.id}
                        className="cd3-spark"
                        aria-hidden="true"
                        style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    >
                        {[0, 1, 2, 3, 4].map((k) => (
                            <svg key={k} viewBox="0 0 10 10" style={{ "--k": k } as CSSProperties}>
                                <path d="M5 0C5.4 3.2 6.8 4.6 10 5 6.8 5.4 5.4 6.8 5 10 4.6 6.8 3.2 5.4 0 5 3.2 4.6 4.6 3.2 5 0z" />
                            </svg>
                        ))}
                    </span>
                ))}
            </div>

            <div className="cd3-meta">
                <span className="cd3-artist">
                    <em>{artist}</em>
                    <span> · {volume}</span>
                </span>
                <button
                    type="button"
                    className="cd3-play"
                    onClick={() => {
                        if (!open) setPaused(false)
                        setOpen((v) => !v)
                    }}
                    aria-expanded={open}
                    aria-controls={showLinerNotes ? notesId : undefined}
                >
                    <span className="cd3-play-icon" aria-hidden="true">
                        {open ? (
                            <svg viewBox="0 0 24 24">
                                <rect x="6" y="5" width="4" height="14" rx="1.5" />
                                <rect x="14" y="5" width="4" height="14" rx="1.5" />
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
                <div id={notesId} className="cd3-liner" data-open={open} aria-hidden={!open}>
                    <div className="cd3-liner-head">
                        <span className="cd3-liner-title">
                            Inside the sleeve
                            {scriptNote ? <em>{scriptNote}</em> : null}
                        </span>
                        <button
                            type="button"
                            tabIndex={open ? 0 : -1}
                            onClick={() => {
                                setOpen(false)
                                coverButton.current?.focus()
                            }}
                            aria-label="Close notes"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                        </button>
                    </div>
                    <ul className="cd3-tracks" aria-label="A few things about me">
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
                                        <span className="cd3-no">
                                            {on ? (
                                                <span className="cd3-eq" aria-hidden="true">
                                                    <i />
                                                    <i />
                                                    <i />
                                                </span>
                                            ) : (
                                                item.number
                                            )}
                                        </span>
                                        <strong>{item.name}</strong>
                                        <span className="cd3-chev" aria-hidden="true">
                                            <svg viewBox="0 0 24 24">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div id={panel} className="cd3-note" hidden={!on}>
                                        <p>{item.note}</p>
                                        {item.href && (
                                            <a
                                                className="cd3-go"
                                                href={item.href}
                                                tabIndex={open && on ? 0 : -1}
                                                onClick={() => setOpen(false)}
                                                {...(isExternal(item.href)
                                                    ? { target: "_blank", rel: "noopener noreferrer" }
                                                    : {})}
                                            >
                                                {item.cta}
                                                <DbArrow external={isExternal(item.href)} />
                                            </a>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                    <a
                        className="cd3-all"
                        href={workLink}
                        tabIndex={open ? 0 : -1}
                        onClick={() => setOpen(false)}
                    >
                        Show me the work
                        <DbArrow external={isExternal(workLink)} />
                    </a>
                </div>
            )}
        </aside>
    )
}

const CSS = `
.cd3,.cd3 *{box-sizing:border-box}
.cd3{--acc:var(--db-accent,#F3500F);--va:var(--vibe-a,color-mix(in srgb,var(--acc) 70%,#ffd1e8));--vb:var(--vibe-b,color-mix(in srgb,var(--acc) 35%,#b9d7ff));--vc:var(--vibe-c,color-mix(in srgb,var(--acc) 25%,#fff2b8));--tx:var(--db-text,#fff);--tx2:var(--db-text-2,rgba(255,255,255,.62));--ln:var(--db-line,rgba(255,255,255,.12));--shadow:rgba(0,0,0,.42);position:relative;z-index:5;pointer-events:auto;container-type:inline-size;width:100%;max-width:var(--cd-w,none);min-width:0;margin-inline:auto;color:var(--tx);font-family:'Poppins',sans-serif;-webkit-tap-highlight-color:transparent}
:root[data-db-theme="light"] .cd3{--shadow:rgba(40,30,20,.22)}
.cd3 button{font-family:inherit;cursor:pointer;color:var(--tx)}
.cd3 :is(button,a):focus-visible{outline:2px solid var(--acc);outline-offset:4px}
.cd3-stage{--rx:0deg;--ry:0deg;--glint:30%;position:relative;width:100%;height:76cqw;perspective:900px;touch-action:manipulation}

/* jewel case */
.cd3-case{position:absolute;z-index:3;left:3cqw;top:7cqw;width:62cqw;height:62cqw;transform:rotate(-4deg) rotateX(var(--rx)) rotateY(var(--ry));transform-style:preserve-3d;transition:transform .55s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 4cqw 5cqw var(--shadow))}
.cd3-stage:hover .cd3-case{transform:rotate(-3deg) translateY(-1cqw) rotateX(var(--rx)) rotateY(var(--ry))}
.cd3[data-open=true] .cd3-case{transform:rotate(-7deg) translateX(-1.5cqw)}
.cd3-cover{position:absolute;inset:0;padding:0;border:0;background:none;border-radius:2cqw}
.cd3-photo{position:absolute;inset:0 0 0 8%;overflow:hidden;border-radius:.8cqw 2cqw 2cqw .8cqw;background:#17171b}
.cd3-photo img{width:100%;height:100%;object-fit:cover;display:block}
.cd3-plastic{position:absolute;inset:0 0 0 8%;border-radius:.8cqw 2cqw 2cqw .8cqw;pointer-events:none;background:linear-gradient(118deg,rgba(255,255,255,.42) 0%,rgba(255,255,255,.08) 22%,transparent 46%),linear-gradient(118deg,transparent 58%,rgba(255,255,255,.14) 64%,transparent 70%),radial-gradient(120% 60% at var(--glint) -10%,rgba(255,255,255,.18),transparent 60%);box-shadow:inset 0 0 0 1px rgba(255,255,255,.38),inset 0 0 0 .9cqw rgba(255,255,255,.06),inset 0 -1.2cqw 2cqw rgba(0,0,0,.18)}
.cd3-hinge{position:absolute;left:0;top:0;bottom:0;width:8%;border-radius:2cqw 0 0 2cqw;background:linear-gradient(90deg,#f4f4f8,#c9cad2 38%,#8d8f99 80%,#6f717b);box-shadow:inset -1px 0 0 rgba(255,255,255,.6),inset 1px 0 0 rgba(255,255,255,.7)}
.cd3-hinge::after{content:"";position:absolute;inset:7% 28%;border-radius:2px;background:repeating-linear-gradient(rgba(255,255,255,.75) 0 1.5px,transparent 1.5px 5px)}
.cd3-sticker{position:absolute;z-index:2;right:-5cqw;top:-5cqw;width:clamp(40px,16cqw,64px);height:clamp(40px,16cqw,64px);padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 32% 28%,#fff 0 18%,#fff8e6 40%,#ffeec7);font:600 clamp(13px,5.4cqw,21px)/1 'Poppins',sans-serif;transform:rotate(12deg);box-shadow:0 1.2cqw 2.4cqw rgba(0,0,0,.28),inset 0 0 0 2px rgba(255,255,255,.9);transition:transform .4s cubic-bezier(.2,.8,.2,1),background .3s}
.cd3-sticker::before{content:"";position:absolute;inset:-6px;border-radius:50%}
.cd3-sticker::after{content:"";position:absolute;right:8%;bottom:10%;width:30%;height:30%;border-radius:0 0 50% 0;background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,.08) 50%,rgba(255,255,255,.95) 62%);opacity:.9}
.cd3 .cd3-sticker{color:#1a1720}
.cd3 .cd3-sticker[data-side=B]{color:var(--db-on-accent,#0a0a0a)}
.cd3-sticker small{display:block;font-size:.42em;font-weight:600;letter-spacing:.18em;text-transform:uppercase;opacity:.7;margin-bottom:.12em}
.cd3-sticker span{display:inline-flex;flex-direction:column;align-items:center;animation:cd3-flip .45s cubic-bezier(.2,.8,.2,1)}
.cd3-sticker:hover{transform:rotate(20deg) scale(1.07)}
.cd3-sticker[data-side=B]{background:radial-gradient(circle at 32% 28%,color-mix(in srgb,var(--acc) 55%,#fff) 0 18%,var(--acc) 60%);color:var(--db-on-accent,#0a0a0a)}
@keyframes cd3-flip{from{transform:rotateY(90deg);opacity:0}}
.cd3-heart{position:absolute;z-index:2;left:2cqw;bottom:-5cqw;width:clamp(34px,12cqw,48px);height:clamp(34px,12cqw,48px);padding:0;border:0;border-radius:50%;display:grid;place-items:center;background:var(--acc);transform:rotate(-12deg);box-shadow:0 1cqw 2.6cqw rgba(0,0,0,.3);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.cd3-heart::before{content:"";position:absolute;inset:-6px;border-radius:50%}
.cd3-heart:hover{transform:rotate(-4deg) scale(1.08)}
.cd3-heart:active{transform:scale(.9)}
.cd3-heart svg{width:52%;height:52%;fill:none;stroke:var(--db-on-accent,#fff);stroke-width:2.2;stroke-linejoin:round;transition:fill .2s}
.cd3-heart[aria-pressed=true] svg{fill:var(--db-on-accent,#fff)}
.cd3-burst{position:absolute;inset:0;pointer-events:none}
.cd3-burst i{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px;border-radius:50%;background:var(--acc);animation:cd3-burst .7s ease-out forwards}
.cd3-burst i:nth-child(1){--bx:0px;--by:-30px}.cd3-burst i:nth-child(2){--bx:26px;--by:-15px}.cd3-burst i:nth-child(3){--bx:26px;--by:15px}.cd3-burst i:nth-child(4){--bx:0px;--by:30px}.cd3-burst i:nth-child(5){--bx:-26px;--by:15px}.cd3-burst i:nth-child(6){--bx:-26px;--by:-15px}
@keyframes cd3-burst{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--bx),var(--by)) scale(.3);opacity:0}}

/* disc */
.cd3-tray{position:absolute;z-index:1;left:7cqw;top:9cqw;width:58cqw;height:58cqw;transform:translateX(5cqw);transition:transform .8s cubic-bezier(.2,.85,.25,1)}
.cd3:not([data-open=true]) .cd3-stage:hover .cd3-tray{transform:translateX(15cqw) rotate(6deg)}
.cd3[data-open=true] .cd3-tray{transform:translateX(34cqw)}
.cd3-disc{position:absolute;inset:0;padding:0;border:0;background:none;border-radius:50%;overflow:hidden;touch-action:pan-y;-webkit-mask:radial-gradient(circle closest-side,transparent 0 14%,#000 15%);mask:radial-gradient(circle closest-side,transparent 0 14%,#000 15%);filter:drop-shadow(0 2.4cqw 3.2cqw var(--shadow))}
.cd3-disc[data-dragging=true]{cursor:grabbing}
.cd3[data-open=true] .cd3-disc{cursor:grab}
.cd3-rot{position:absolute;inset:0;border-radius:50%;will-change:transform}
.cd3-iri{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 20deg,#e9edf4,#f6d9ea 9%,#d9e7ff 18%,#e3f7ee 27%,#fff3d1 36%,#eef0f6 45%,#f4d6e6 55%,#dcd8ff 64%,#d2f2ff 73%,#f7f1d8 82%,#e9edf4);box-shadow:inset 0 0 0 1px rgba(255,255,255,.85),inset 0 0 0 2px rgba(0,0,0,.06)}
.cd3-grooves{position:absolute;inset:1.5%;border-radius:50%;background:repeating-radial-gradient(circle closest-side,transparent 0 2px,rgba(255,255,255,.22) 2px 2.6px,transparent 2.6px 4px);mix-blend-mode:soft-light;opacity:.9}
.cd3-print{position:absolute;inset:10%;border-radius:50%;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.6cqw;color:#1a1720;background:radial-gradient(circle closest-side,transparent 0 76%,rgba(0,0,0,.07) 76.5% 77.5%,transparent 78%),#fffaf3;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08),0 0 0 1px rgba(255,255,255,.5)}
.cd3-print-art{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 50% 50%,transparent 0 33%,transparent 33%),repeating-conic-gradient(from 0deg,var(--va) 0 7.5deg,#fffaf3 7.5deg 15deg,var(--vb) 15deg 22.5deg,#fffaf3 22.5deg 30deg,var(--vc) 30deg 37.5deg,#fffaf3 37.5deg 45deg);-webkit-mask:radial-gradient(circle closest-side,transparent 0 74%,#000 75% 97%,transparent 98%);mask:radial-gradient(circle closest-side,transparent 0 80%,#000 81% 96%,transparent 97%);opacity:.8}
.cd3-print::after{content:"";position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 30% 24%,color-mix(in srgb,var(--acc) 22%,transparent) 0 2.2%,transparent 2.6%),radial-gradient(circle at 74% 70%,color-mix(in srgb,var(--vb) 70%,transparent) 0 1.8%,transparent 2.2%),radial-gradient(circle at 70% 26%,color-mix(in srgb,var(--va) 80%,transparent) 0 1.4%,transparent 1.8%);pointer-events:none}
.cd3-print em{position:relative;z-index:1;font:400 clamp(15px,7.4cqw,30px)/1 'Pinyon Script',cursive;color:#1a1720;margin-top:-13%;transform:translateY(-20%)}
.cd3-print b{position:relative;z-index:1;margin-top:20%;font:600 clamp(6px,2.1cqw,9px)/1 'Poppins',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:color-mix(in srgb,var(--acc) 80%,#1a1720)}
.cd3-heart-dot{position:absolute;z-index:1;left:22%;bottom:24%;font-style:normal;font-size:clamp(8px,3cqw,12px);color:var(--acc);transform:rotate(-14deg)}
.cd3-hub{position:absolute;inset:36%;border-radius:50%;background:radial-gradient(circle closest-side,transparent 0 50%,rgba(255,255,255,.7) 51% 55%,rgba(222,228,238,.5) 56% 86%,rgba(255,255,255,.85) 87% 91%,rgba(205,210,220,.45) 92% 100%);box-shadow:0 0 0 1px rgba(0,0,0,.06),inset 0 0 0 1px rgba(255,255,255,.6);-webkit-backdrop-filter:blur(1px);backdrop-filter:blur(1px)}
.cd3-glint{position:absolute;inset:0;border-radius:50%;pointer-events:none;background:conic-gradient(from 300deg,transparent 0 6%,rgba(255,255,255,.55) 9%,transparent 14%,transparent 50%,rgba(255,255,255,.32) 55%,transparent 61%);-webkit-mask:radial-gradient(circle closest-side,transparent 0 80%,#000 82%);mask:radial-gradient(circle closest-side,transparent 0 80%,#000 82%);mix-blend-mode:screen}

/* notes + sparkles */
.cd3-notes{position:absolute;z-index:4;right:6cqw;top:8cqw;pointer-events:none}
.cd3-notes i{position:absolute;font-style:normal;font-size:clamp(14px,6cqw,24px);color:var(--acc);opacity:0}
.cd3[data-playing=true][data-vis=true] .cd3-notes i{animation:cd3-note 2.8s ease-out infinite}
.cd3-notes i:nth-child(2){right:6cqw;animation-delay:.9s !important}
.cd3-notes i:nth-child(3){right:0;animation-delay:1.8s !important}
@keyframes cd3-note{0%{opacity:0;transform:translate(0,10px) rotate(-10deg)}20%{opacity:1}100%{opacity:0;transform:translate(-14px,-46px) rotate(14deg)}}
.cd3-spark{position:absolute;z-index:6;width:0;height:0;pointer-events:none}
.cd3-spark svg{position:absolute;left:-6px;top:-6px;width:12px;height:12px;fill:var(--acc);opacity:0;--a:calc(var(--k) * 72deg - 90deg);animation:cd3-spark .8s cubic-bezier(.2,.8,.2,1) forwards}
.cd3-spark svg:nth-child(2n){fill:var(--vb);width:9px;height:9px}
.cd3-spark svg:nth-child(3){fill:var(--va)}
@keyframes cd3-spark{0%{opacity:1;transform:rotate(var(--a)) translateX(0) scale(.4)}60%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateX(26px) scale(1) rotate(90deg)}}

/* meta row */
.cd3-meta{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:2cqw;padding:0 1cqw}
.cd3-artist{min-width:0;font-size:clamp(11px,3.6cqw,13px);color:var(--tx2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cd3-artist em{font:400 clamp(18px,6.4cqw,24px)/1 'Pinyon Script',cursive;color:var(--tx)}
.cd3-play{display:inline-flex;flex-shrink:0;align-items:center;gap:8px;min-height:44px;padding:0 16px 0 6px;border-radius:999px;border:1px solid var(--sp-edge,var(--ln));background:var(--sp-glass,var(--db-surface,rgba(255,255,255,.05)));-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);font-size:clamp(11px,3.6cqw,13px);font-weight:500;white-space:nowrap;transition:border-color .2s,transform .2s}
.cd3-play:hover{border-color:color-mix(in srgb,var(--acc) 50%,var(--ln));transform:translateY(-1px)}
.cd3-play-icon{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--acc)}
.cd3-play-icon svg{width:14px;height:14px;fill:var(--db-on-accent,#0a0a0a)}

/* liner notes */
.cd3-liner{position:relative;z-index:9;margin-top:12px;width:100%;padding:clamp(10px,4cqw,16px);border-radius:18px;background:var(--db-surface,rgba(255,255,255,.04));border:1px solid var(--ln);box-shadow:var(--db-shadow,0 20px 40px -24px rgba(0,0,0,.6));display:none}
.cd3-liner[data-open=true]{display:block;animation:cd3-in .32s cubic-bezier(.2,.8,.2,1) both}
.cd3-liner-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 2px 8px;border-bottom:1px dashed var(--ln)}
.cd3-liner-title{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;font:600 12px 'Poppins',sans-serif;letter-spacing:.04em}
.cd3-liner-title em{font:400 clamp(18px,6cqw,22px)/1 'Pinyon Script',cursive;letter-spacing:0;color:var(--acc);transform:rotate(-3deg);display:inline-block}
.cd3-liner-head button{flex-shrink:0;width:40px;height:40px;display:grid;place-items:center;border:0;border-radius:50%;background:transparent;transition:background .2s}
.cd3-liner-head button:hover{background:var(--ln)}
.cd3-liner-head svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round}
.cd3-tracks{list-style:none;margin:0;padding:8px 0 10px;display:grid;gap:2px}
.cd3-tracks li{border-radius:12px;transition:background .2s}
.cd3-tracks li[data-on=true]{background:color-mix(in srgb,var(--acc) 13%,transparent)}
.cd3-tracks button{width:100%;display:grid;grid-template-columns:26px 1fr 20px;align-items:center;gap:8px;min-height:44px;padding:6px 8px;border:0;border-radius:12px;background:transparent;text-align:left;touch-action:manipulation}
.cd3-tracks li:not([data-on=true]) button:hover{background:var(--ln)}
.cd3-tracks strong{font-size:clamp(12px,3.9cqw,14px);font-weight:500}
.cd3-chev{display:grid;place-items:center;opacity:.6;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.cd3-chev svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.cd3-tracks li[data-on=true] .cd3-chev{transform:rotate(180deg);opacity:1;color:var(--acc)}
.cd3-note{padding:0 10px 12px 42px;animation:cd3-in .3s cubic-bezier(.2,.8,.2,1) both}
.cd3-note[hidden]{display:none}
.cd3-note p{margin:0;font-size:clamp(12px,3.9cqw,14px);line-height:1.6;color:var(--tx2)}
.cd3-no{font-size:11px;color:var(--tx2);font-variant-numeric:tabular-nums;display:grid;place-items:center}
.cd3-eq{display:inline-flex;align-items:flex-end;gap:2px;height:12px}
.cd3-eq i{width:3px;height:100%;border-radius:1px;background:var(--acc);transform-origin:bottom;transform:scaleY(.45)}
.cd3-eq i:nth-child(2){transform:scaleY(.85)}.cd3-eq i:nth-child(3){transform:scaleY(.6)}
.cd3[data-playing=true][data-vis=true] .cd3-eq i{animation:cd3-eq .9s ease-in-out infinite alternate}
.cd3-eq i:nth-child(2){animation-delay:-.3s}.cd3-eq i:nth-child(3){animation-delay:-.6s}
.cd3-go{display:inline-flex;align-items:center;gap:6px;min-height:36px;margin-top:8px;padding:0 13px;border-radius:999px;background:color-mix(in srgb,var(--acc) 16%,transparent);color:var(--tx);font-size:12px;font-weight:600;text-decoration:none;transition:background .2s,color .2s}
.cd3-go:hover{background:var(--acc);color:var(--db-on-accent,#0a0a0a)}
.cd3-all{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 4px;color:var(--acc);font-size:13px;font-weight:600;text-decoration:none}
.db-arrow{flex-shrink:0;display:inline-block;vertical-align:-.125em;transition:transform .2s cubic-bezier(.2,.8,.2,1)}
a:hover .db-arrow[data-dir=e],a:focus-visible .db-arrow[data-dir=e]{transform:translateX(2px)}
a:hover .db-arrow[data-dir=ne],a:focus-visible .db-arrow[data-dir=ne]{transform:translate(2px,-2px)}
@media (prefers-reduced-motion:reduce){.db-arrow{transition:none !important;transform:none !important}}
@keyframes cd3-in{from{opacity:0;transform:translateY(-6px)}}
@keyframes cd3-eq{from{transform:scaleY(.25)}to{transform:scaleY(1)}}

@container (max-width:300px){.cd3-meta{flex-direction:column;align-items:stretch}.cd3-play{justify-content:center}.cd3-note{padding-left:12px}}
@media (prefers-reduced-motion:reduce){.cd3 *{animation:none !important;transition:none !important}.cd3-burst,.cd3-spark,.cd3-notes{display:none}.cd3-stage{--rx:0deg !important;--ry:0deg !important}.cd3-stage:hover .cd3-case{transform:rotate(-4deg)}.cd3[data-open=true] .cd3-stage:hover .cd3-case{transform:rotate(-7deg) translateX(-1.5cqw)}.cd3:not([data-open=true]) .cd3-stage:hover .cd3-tray{transform:translateX(5cqw)}}
.cd3[data-reduced=true] *{animation:none !important}
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
    maxWidth: {
        type: ControlType.Number,
        title: "Max width",
        min: 0,
        max: 720,
        defaultValue: 330,
        description: "0 = fill the parent.",
    },
    workLink: { type: ControlType.Link, title: "View work", defaultValue: "/#work" },
    showLinerNotes: { type: ControlType.Boolean, title: "Liner notes", defaultValue: true },
    scriptNote: {
        type: ControlType.String,
        title: "Script note",
        defaultValue: "thanks for listening",
        description: "Handwritten line in the liner notes. Empty hides it.",
    },
    spinOnHover: { type: ControlType.Boolean, title: "Spin on hover", defaultValue: true },
    sparkles: { type: ControlType.Boolean, title: "Click sparkles", defaultValue: true },
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
