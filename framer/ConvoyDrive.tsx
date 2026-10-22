// ConvoyDrive v2 (Oct 22) — the GM Convoy story told from the driver's seat.
// As the reader scrolls past, they're behind the wheel: the road runs toward them (dashes and
// roadside posts move with scroll, never on their own), two convoy cars hold formation ahead, and
// the center display shows the group, or her real in-car screen when Display media is set.
// The navigation card walks through the project's real turns (beats come from props, so copy stays
// editable and honest). Presentation only: nothing here claims a road test.
//  • Scroll-linked, no sticky/pinning (safe inside Framer stacks with overflow clipping).
//  • An IntersectionObserver turns a passive scroll listener on only while the scene is on screen;
//    each frame writes CSS variables / SVG points directly (React only re-renders when the beat
//    changes).
//  • Light theme: daytime sky outside, the cabin stays dark. Dark theme: dusk.
//  • Reduced motion: a still frame with Previous / Next buttons.
//  • Phone: the cluster hides, the display and nav card stack and stay legible.
import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Beat = { step: string; title: string; detail: string }
type Props = {
    beats: Beat[]
    destination: string
    members: string
    media: any
    mediaUrl: string
    mediaVideo: string
    mediaAlt: string
    accent: string
    followVibe: boolean
    height: number
    style?: React.CSSProperties
}

const DEFAULT_BEATS: Beat[] = [
    {
        step: "Start",
        title: "One driver",
        detail: "Our first concept used biometrics to personalize the truck for a single driver.",
    },
    {
        step: "The interview",
        title: "From one driver to a group road trip",
        detail: "One truck driver talked about planning and staying together across cars. We changed direction.",
    },
    {
        step: "Decision",
        title: "Plan on the phone. Keep driving updates simple.",
        detail: "Trip planning happens on the phone. The truck screen shows where everyone is.",
    },
    {
        step: "Open question",
        title: "Who should organize the trip?",
        detail: "One person, the host, sets the plan. How much control the host should have is still open.",
    },
]

const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, n))
const imgSrc = (v: any): string => (!v ? "" : typeof v === "string" ? v : v.src || v.url || "")

// Road geometry (SVG 1200×600, vanishing point at top centre). World depth z ≥ 1 maps to y = 600/z.
const DASHES = 9
const POSTS = 7
const quad = (cx: number, hw: number, z1: number, z2: number) => {
    const y1 = 600 / z1
    const y2 = 600 / z2
    const a = hw / z1
    const b = hw / z2
    return `${cx - a},${y1} ${cx + a},${y1} ${cx + b},${y2} ${cx - b},${y2}`
}
function drawRoad(dashes: SVGPolygonElement[], posts: SVGPolygonElement[], travel: number) {
    const period = 3.2
    const off = ((travel % period) + period) % period
    dashes.forEach((el, k) => {
        const z1 = Math.max(0.55, 1 + k * period - off)
        el.setAttribute("points", quad(600, 9, z1, z1 + 1.3))
    })
    const pp = 6
    const po = ((travel % pp) + pp) % pp
    posts.forEach((el, k) => {
        const side = k % 2 ? 1 : -1
        const z = Math.max(0.6, 1 + Math.floor(k / 2) * pp - po + (k % 2) * (pp / 2))
        const x = 600 + side * (1030 / z)
        const y = 600 / z
        const w = 11 / z
        const h = 120 / z
        el.setAttribute("points", `${x - w},${y} ${x + w},${y} ${x + w},${y - h} ${x - w},${y - h}`)
    })
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function ConvoyDrive({
    beats = DEFAULT_BEATS,
    destination = "Road trip",
    members = "Lead car, Car 2, You",
    media = "",
    mediaUrl = "",
    mediaVideo = "",
    mediaAlt = "Convoy in-car screen",
    accent = "#F3500F",
    followVibe = true,
    height = 760,
    style,
}: Partial<Props>) {
    const list = beats && beats.length ? beats : DEFAULT_BEATS
    const root = React.useRef<HTMLElement>(null)
    const speedRef = React.useRef<HTMLSpanElement>(null)
    const dashRefs = React.useRef<SVGPolygonElement[]>([])
    const postRefs = React.useRef<SVGPolygonElement[]>([])
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const canvas = RenderTarget.current() === RenderTarget.canvas
    const [reduced, setReduced] = React.useState(false)
    const [manual, setManual] = React.useState(0)
    const [auto, setAuto] = React.useState(0)
    const [inView, setInView] = React.useState(false)
    const screenSrc = imgSrc(media) || mediaUrl
    const hasMedia = !!(screenSrc || mediaVideo)
    const people = (members || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 4)

    React.useEffect(() => {
        const m = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(m.matches)
        sync()
        m.addEventListener("change", sync)
        return () => m.removeEventListener("change", sync)
    }, [])

    React.useEffect(() => {
        const el = root.current
        if (!el) return
        const n = list.length
        const apply = (p: number) => {
            const sp = clamp((p - 0.18) / 0.64)
            const sway = Math.sin(p * Math.PI * 3) * 1.2
            el.style.setProperty("--p", p.toFixed(4))
            el.style.setProperty("--sp", sp.toFixed(4))
            el.style.setProperty("--sway", sway.toFixed(3))
            el.style.setProperty("--car1", (Math.sin(p * 9) * 6).toFixed(2) + "px")
            el.style.setProperty("--car2", (Math.sin(p * 7 + 1) * 10).toFixed(2) + "px")
            drawRoad(dashRefs.current, postRefs.current, p * 46)
            if (speedRef.current) speedRef.current.textContent = String(Math.round(clamp(sp * 1.6) * 62))
            setAuto(Math.min(n - 1, Math.floor(sp * n)))
        }
        if (canvas || reduced) {
            apply(canvas ? 0.45 : 0.5)
            if (speedRef.current && reduced) speedRef.current.textContent = "55"
            return
        }
        let raf = 0
        let on = false
        const update = () => {
            raf = 0
            const r = el.getBoundingClientRect()
            const vh = window.innerHeight || 800
            apply(clamp((vh - r.top) / (vh + r.height)))
        }
        const req = () => {
            if (!raf) raf = requestAnimationFrame(update)
        }
        const start = () => {
            if (on) return
            on = true
            window.addEventListener("scroll", req, { passive: true })
            window.addEventListener("resize", req)
            req()
        }
        const stop = () => {
            if (!on) return
            on = false
            window.removeEventListener("scroll", req)
            window.removeEventListener("resize", req)
            cancelAnimationFrame(raf)
            raf = 0
        }
        update()
        let io: IntersectionObserver | null = null
        if (typeof IntersectionObserver !== "undefined") {
            io = new IntersectionObserver(([e]) => {
                setInView(e.isIntersecting)
                e.isIntersecting ? start() : stop()
            })
            io.observe(el)
        } else start()
        return () => {
            io?.disconnect()
            stop()
        }
    }, [canvas, reduced, list.length])

    React.useEffect(() => {
        const v = videoRef.current
        if (!v) return
        if (inView && !reduced && !canvas) v.play().catch(() => {})
        else v.pause()
    }, [inView, reduced, canvas, mediaVideo])

    const idx = reduced ? Math.min(manual, list.length - 1) : auto
    const beat = list[idx]
    const tint = followVibe ? `var(--db-accent, ${accent})` : accent

    return (
        <section
            ref={root}
            className="cd-drive"
            aria-label="The Convoy story from the driver's seat"
            data-db-keep=""
            data-media={hasMedia}
            style={
                {
                    ...style,
                    "--cd-accent": tint,
                    "--cd-h": `${Math.max(480, height)}px`,
                } as React.CSSProperties
            }
        >
            <style>{CSS}</style>
            <div className="cd-world" aria-hidden="true">
                <div className="cd-sky" />
                <div className="cd-ground" />
                <svg className="cd-hills" viewBox="0 0 1200 200" preserveAspectRatio="none">
                    <path d="M0 140 C140 90 260 120 380 96 S640 60 760 92 S1010 70 1200 110 V200 H0Z" />
                    <path
                        className="cd-hills2"
                        d="M0 168 C200 140 320 150 470 136 S760 120 900 140 S1100 130 1200 146 V200 H0Z"
                    />
                </svg>
                <svg className="cd-road" viewBox="0 0 1200 600" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="cdRoad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" className="cd-road-far" />
                            <stop offset="1" className="cd-road-near" />
                        </linearGradient>
                    </defs>
                    <polygon points="594,0 606,0 1500,600 -300,600" fill="url(#cdRoad)" />
                    <polyline points="596,0 -210,600" className="cd-edge" />
                    <polyline points="604,0 1410,600" className="cd-edge" />
                    {Array.from({ length: DASHES }, (_, k) => (
                        <polygon
                            key={"d" + k}
                            className="cd-dash"
                            ref={(n) => {
                                if (n) dashRefs.current[k] = n
                            }}
                        />
                    ))}
                    {Array.from({ length: POSTS * 2 }, (_, k) => (
                        <polygon
                            key={"p" + k}
                            className="cd-post"
                            ref={(n) => {
                                if (n) postRefs.current[k] = n
                            }}
                        />
                    ))}
                </svg>
                <div className="cd-car cd-car-far">
                    <i />
                    <i />
                </div>
                <div className="cd-car cd-car-near">
                    <i />
                    <i />
                </div>
            </div>

            <div className="cd-glass" aria-hidden="true" />
            <div className="cd-mirror" aria-hidden="true">
                <span />
            </div>

            <div className="cd-nav" aria-live="polite">
                <span className="cd-turn" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        {idx === 0 && <path d="M12 20V5M6 11l6-6 6 6" />}
                        {idx === 1 && <path d="M8 20v-7a4 4 0 0 1 4-4h7M15 5l4 4-4 4" />}
                        {idx === 2 && <path d="M16 20v-7a4 4 0 0 0-4-4H5M9 5 5 9l4 4" />}
                        {idx >= 3 && (
                            <>
                                <circle cx="12" cy="10" r="4" />
                                <path d="M12 14v6" />
                            </>
                        )}
                    </svg>
                </span>
                <span className="cd-nav-text">
                    <span className="cd-step">
                        {String(idx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")} · {beat.step}
                    </span>
                    <strong>{beat.title}</strong>
                    <span className="cd-detail">{beat.detail}</span>
                    {reduced && (
                        <span className="cd-steps">
                            <button type="button" disabled={idx === 0} onClick={() => setManual(Math.max(0, idx - 1))}>
                                Previous
                            </button>
                            <button
                                type="button"
                                disabled={idx === list.length - 1}
                                onClick={() => setManual(Math.min(list.length - 1, idx + 1))}
                            >
                                Next
                            </button>
                        </span>
                    )}
                </span>
            </div>

            <div className="cd-dash-panel">
                <div className="cd-cluster" aria-hidden="true">
                    <span className="cd-speed" ref={speedRef}>
                        0
                    </span>
                    <span className="cd-unit">mph</span>
                    <span className="cd-gear">D</span>
                </div>
                {hasMedia ? (
                    <figure className="cd-screen cd-screen-media">
                        {mediaVideo ? (
                            <video
                                ref={videoRef}
                                src={mediaVideo}
                                poster={screenSrc || undefined}
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                aria-label={mediaAlt}
                            />
                        ) : (
                            <img src={screenSrc} alt={mediaAlt} loading="lazy" />
                        )}
                        <span className="cd-screen-glare" aria-hidden="true" />
                    </figure>
                ) : (
                    <div className="cd-screen">
                        <div className="cd-screen-head">
                            <span className="cd-badge">Convoy</span>
                            <span className="cd-dest">{destination}</span>
                        </div>
                        <div className="cd-map" aria-hidden="true">
                            <svg viewBox="0 0 300 60" preserveAspectRatio="none">
                                <path d="M6 44 C60 10 110 54 160 30 S250 12 294 22" className="cd-route" />
                                <path d="M6 44 C60 10 110 54 160 30 S250 12 294 22" className="cd-route-done" />
                            </svg>
                            {people.map((name, i) => (
                                <span
                                    key={name + i}
                                    className="cd-pin"
                                    data-you={i === people.length - 1}
                                    style={{ "--o": (people.length - 1 - i) * 0.05 } as React.CSSProperties}
                                />
                            ))}
                        </div>
                        <ul className="cd-members">
                            {people.map((name, i) => (
                                <li key={name + i} data-you={i === people.length - 1}>
                                    <i />
                                    {name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="cd-wheel" aria-hidden="true" />
            </div>

            <ol className="cd-sr">
                {list.map((b, i) => (
                    <li key={i}>
                        {b.step}: {b.title}. {b.detail}
                    </li>
                ))}
            </ol>
        </section>
    )
}

const CSS = `
.cd-drive{--p:0;--sp:0;--sway:0;--car1:0px;--car2:0px;--sky1:color-mix(in srgb,var(--cd-accent) 80%,#2a120a);--sky2:color-mix(in srgb,var(--cd-accent) 25%,#1b1424);--sky3:#120f1a;--sky4:#07070a;--hill1:#0d0b12;--hill2:#09080c;--gnd1:#09080c;--gnd2:#121016;--road1:#2a2a30;--road2:#0f0f12;--edge:#ffffff55;--lane:#f5f1e6;--post:#ffffff;position:relative;width:100%;height:var(--cd-h);min-height:480px;max-height:92vh;overflow:hidden;border-radius:clamp(16px,2.4vw,32px);background:#07070a;color:#fff;font-family:'Poppins',sans-serif;isolation:isolate;box-sizing:border-box}
html[data-db-theme=light] .cd-drive{--sky1:color-mix(in srgb,var(--cd-accent) 30%,#fff3e6);--sky2:#cfe0ee;--sky3:#a9c4dc;--sky4:#8fb0cc;--hill1:#7d93a6;--hill2:#5f7487;--gnd1:#55606a;--gnd2:#6b7680;--road1:#5d6168;--road2:#33363b;--edge:#ffffffaa;--lane:#ffffff;--post:#f4f4f4}
@media (prefers-color-scheme:light){html:not([data-db-theme]) .cd-drive{--sky1:color-mix(in srgb,var(--cd-accent) 30%,#fff3e6);--sky2:#cfe0ee;--sky3:#a9c4dc;--sky4:#8fb0cc;--hill1:#7d93a6;--hill2:#5f7487;--gnd1:#55606a;--gnd2:#6b7680;--road1:#5d6168;--road2:#33363b;--edge:#ffffffaa;--lane:#ffffff;--post:#f4f4f4}}
.cd-drive *{box-sizing:border-box}
.cd-world{position:absolute;inset:0 0 30% 0;overflow:hidden}
.cd-sky{position:absolute;inset:-4% 0 0;background:radial-gradient(80% 46% at 50% 47%,var(--sky1) 0%,var(--sky2) 30%,var(--sky3) 60%,var(--sky4) 100%);transform:translateY(calc(var(--p) * -14px))}
.cd-ground{position:absolute;left:0;right:0;bottom:0;height:53.5%;background:linear-gradient(var(--gnd1),var(--gnd2) 30%,var(--gnd1))}
.cd-hills{position:absolute;left:-3%;width:106%;bottom:52%;height:22%;fill:var(--hill1);transform:translateX(calc(var(--sway) * -0.4%)) translateY(calc(var(--p) * 6px))}
.cd-hills .cd-hills2{fill:var(--hill2)}
.cd-road{position:absolute;left:-10%;right:-10%;width:120%;bottom:0;height:53%;transform:translateX(calc(var(--sway) * 1%))}
.cd-road-far{stop-color:var(--road1)}
.cd-road-near{stop-color:var(--road2)}
.cd-edge{fill:none;stroke:var(--edge);stroke-width:3;vector-effect:non-scaling-stroke}
.cd-dash{fill:var(--lane);opacity:.85}
.cd-post{fill:var(--post);opacity:.55}
.cd-car{position:absolute;left:50%;display:flex;justify-content:space-between;border-radius:4px 4px 2px 2px;background:#111116;box-shadow:0 0 0 1px #ffffff12}
.cd-car i{display:block;border-radius:2px;background:#ff3b30;box-shadow:0 0 10px 2px #ff3b30aa,0 0 24px 6px #ff3b3033}
.cd-car-far{bottom:47%;width:3.2%;min-width:20px;height:12px;padding:3px 3px;transform:translate(-50%,0) translateX(var(--car1))}
.cd-car-far i{width:4px;height:3px}
.cd-car-near{bottom:34%;width:7%;min-width:40px;height:24px;padding:6px 5px;transform:translate(-50%,0) translateX(var(--car2))}
.cd-car-near i{width:9px;height:5px}
.cd-glass{position:absolute;inset:0;pointer-events:none;border-radius:inherit;box-shadow:inset 0 0 0 clamp(10px,2vw,22px) #050507,inset 0 60px 80px -40px #000;background:linear-gradient(105deg,#ffffff0a 0 18%,transparent 30% 70%,#ffffff06 82%)}
.cd-mirror{position:absolute;top:clamp(10px,2vw,22px);left:50%;transform:translateX(-50%);width:clamp(110px,18%,200px);height:clamp(26px,4.4vw,44px);border-radius:0 0 18px 18px;background:#0b0b0f;box-shadow:0 6px 18px #0009;padding:4px}
.cd-mirror span{display:block;width:100%;height:100%;border-radius:0 0 14px 14px;background:linear-gradient(180deg,#26202a,#3a2a24)}
.cd-nav{position:absolute;top:clamp(48px,8vw,84px);left:50%;transform:translateX(-50%);width:min(560px,calc(100% - 32px));display:flex;gap:14px;align-items:flex-start;padding:14px 18px 14px 14px;border-radius:18px;background:rgba(18,18,22,.62);-webkit-backdrop-filter:blur(20px) saturate(180%);backdrop-filter:blur(20px) saturate(180%);border:.5px solid #ffffff26;box-shadow:inset 0 1px 0 #ffffff1f,0 18px 40px -18px #000;z-index:3}
.cd-turn{flex-shrink:0;width:48px;height:48px;border-radius:12px;display:grid;place-items:center;background:var(--cd-accent)}
.cd-turn svg{width:26px;height:26px;fill:none;stroke:#0a0a0a;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.cd-nav-text{display:flex;flex-direction:column;gap:3px;min-width:0}
.cd-step{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#ffffffa0}
.cd-nav-text strong{font-size:clamp(17px,2vw,22px);font-weight:600;line-height:1.25}
.cd-detail{font-size:clamp(13px,1.3vw,15px);line-height:1.5;color:#ffffffc8}
.cd-dash-panel{position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(#141418,#0a0a0d);border-top:1px solid #ffffff14;border-radius:50% 50% 0 0/14% 14% 0 0;z-index:2}
.cd-cluster{position:absolute;left:27%;top:22%;transform:translateX(-50%);z-index:2;display:flex;align-items:baseline;gap:6px;justify-content:center;font-variant-numeric:tabular-nums}
.cd-speed{font-size:clamp(34px,4.6vw,56px);font-weight:300;line-height:1;min-width:2ch;text-align:right}
.cd-unit{font-size:12px;color:#ffffff88}
.cd-gear{margin-left:10px;font-size:13px;font-weight:600;color:var(--cd-accent)}
.cd-screen{position:absolute;left:64%;top:10%;transform:translateX(-50%);z-index:2;width:min(440px,44%);height:auto;display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-radius:14px;background:#050507;box-shadow:inset 0 0 0 1px #ffffff1a,0 0 40px -10px color-mix(in srgb,var(--cd-accent) 40%,transparent)}
.cd-screen-media{margin:0;padding:0;top:auto;bottom:22%;width:min(460px,42%);aspect-ratio:16/9;overflow:hidden;border:clamp(4px,.6vw,7px) solid #0b0b0e;border-radius:clamp(10px,1.4vw,16px);box-shadow:0 0 0 1px #ffffff1c,0 24px 50px -18px #000,0 0 50px -16px color-mix(in srgb,var(--cd-accent) 45%,transparent);transform:translateX(-50%) translateY(calc(var(--sway) * 1.5px))}
.cd-screen-media img,.cd-screen-media video{display:block;width:100%;height:100%;object-fit:cover;object-position:center;border-radius:clamp(6px,.9vw,10px);background:#050507}
.cd-screen-glare{position:absolute;inset:0;pointer-events:none;background:linear-gradient(120deg,#ffffff14,transparent 34%)}
.cd-screen-head{display:flex;align-items:center;gap:8px;font-size:12px}
.cd-badge{padding:2px 8px;border-radius:999px;background:var(--cd-accent);color:#0a0a0a;font-weight:600;font-size:11px}
.cd-dest{color:#ffffffb0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cd-map{position:relative;height:34%;min-height:28px;border-radius:8px;background:#101015}
.cd-map svg{position:absolute;inset:0;width:100%;height:100%}
.cd-route{fill:none;stroke:#ffffff26;stroke-width:3;vector-effect:non-scaling-stroke}
.cd-route-done{fill:none;stroke:var(--cd-accent);stroke-width:3;stroke-dasharray:340;stroke-dashoffset:calc(340 - var(--sp) * 340);vector-effect:non-scaling-stroke}
.cd-pin{position:absolute;top:50%;left:calc(min(97%, (0.06 + var(--sp) * 0.8 + var(--o)) * 100%));width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #050507}
.cd-pin[data-you=true]{background:var(--cd-accent);box-shadow:0 0 0 2px #050507,0 0 10px var(--cd-accent)}
.cd-members{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:4px 14px;font-size:12px}
.cd-members li{display:flex;align-items:center;gap:6px;white-space:nowrap}
.cd-members i{width:7px;height:7px;border-radius:50%;background:#fff}
.cd-members li[data-you=true] i{background:var(--cd-accent)}
.cd-wheel{position:absolute;left:27%;bottom:-62%;width:min(40%,440px);aspect-ratio:1;border-radius:50%;border:clamp(14px,2.2vw,26px) solid #121216;box-shadow:inset 0 0 0 1px #ffffff10,0 -10px 30px #0008;z-index:1;pointer-events:none;transform:translateX(-50%) rotate(calc(var(--sway) * 4deg))}
.cd-steps{display:flex;gap:8px;margin-top:8px}
.cd-steps button{min-height:36px;padding:0 14px;border-radius:999px;border:1px solid #ffffff33;background:transparent;color:#fff;font:500 13px 'Poppins',sans-serif;cursor:pointer}
.cd-steps button:disabled{opacity:.4;cursor:default}
.cd-drive :focus-visible{outline:2px solid var(--cd-accent);outline-offset:3px}
.cd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0;padding:0}
@media (max-width:700px){
.cd-drive{height:auto;min-height:0;max-height:none;display:flex;flex-direction:column}
.cd-world{position:relative;inset:auto;height:62vw;min-height:280px}
.cd-glass{bottom:auto;height:62vw;min-height:280px}
.cd-nav{position:relative;top:auto;left:auto;transform:none;width:calc(100% - 24px);margin:-64px 12px 0;z-index:3}
.cd-dash-panel{position:relative;height:auto;border-radius:0;padding:16px 12px 18px}
.cd-screen,.cd-screen-media{position:relative;left:auto;top:auto;bottom:auto;transform:none;width:100%;max-height:none}
.cd-screen{height:auto}
.cd-cluster,.cd-wheel{display:none}
.cd-map{height:36px}
}
`

addPropertyControls(ConvoyDrive, {
    beats: {
        type: ControlType.Array,
        title: "Beats",
        maxCount: 6,
        control: {
            type: ControlType.Object,
            controls: {
                step: { type: ControlType.String, title: "Step" },
                title: { type: ControlType.String, title: "Title" },
                detail: { type: ControlType.String, title: "Detail", displayTextArea: true },
            },
        },
        defaultValue: DEFAULT_BEATS,
    },
    media: {
        type: ControlType.Image,
        title: "Display image",
        description: "Her real in-car screen. Replaces the drawn Convoy display.",
    },
    mediaUrl: {
        type: ControlType.String,
        title: "Display URL",
        defaultValue: "",
        hidden: (p: any) => !!p.media,
    },
    mediaVideo: {
        type: ControlType.File,
        title: "Display video",
        allowedFileTypes: ["mp4", "webm", "mov"],
    },
    mediaAlt: {
        type: ControlType.String,
        title: "Display alt",
        defaultValue: "Convoy in-car screen",
    },
    destination: {
        type: ControlType.String,
        title: "Destination",
        defaultValue: "Road trip",
        hidden: (p: any) => !!(p.media || p.mediaUrl || p.mediaVideo),
    },
    members: {
        type: ControlType.String,
        title: "Convoy",
        defaultValue: "Lead car, Car 2, You",
        description: "Comma-separated. The last one is the reader.",
        hidden: (p: any) => !!(p.media || p.mediaUrl || p.mediaVideo),
    },
    followVibe: { type: ControlType.Boolean, title: "Use site vibe", defaultValue: true },
    accent: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#F3500F",
        hidden: (p: any) => !!p.followVibe,
    },
    height: {
        type: ControlType.Number,
        title: "Height",
        min: 480,
        max: 1000,
        step: 10,
        defaultValue: 760,
        unit: "px",
    },
})
