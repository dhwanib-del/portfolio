// DeviceStudio v3 (Oct 22) — a laptop that opens as you scroll to it and closes as you leave.
// Dhwani: "make some laptop screens… my direct websites so a user can interact with it directly,
// and when they scroll a laptop opening and closing."
//  • Scroll-linked lid: closed below the fold, opens as it reaches the middle of the screen, folds
//    shut again as it scrolls away. An IntersectionObserver turns a passive scroll listener on only
//    while the laptop is on screen; each frame writes transforms straight to the DOM (no React
//    re-render). Reduced motion or "Open on: Always" → open and static.
//  • The screen runs the real thing: any https site, or a Figma prototype link (turned into Figma's
//    embed). The iframe mounts only when the laptop is near the viewport, is sandboxed, and renders
//    at a desktop width scaled into the screen (a narrower width on phones so text stays readable).
//  • "Click to try it" veil takes the first click so page scroll isn't trapped; "Done" hands scroll
//    back. Full screen dialog + "Open in a new tab ↗" are always there.
//  • Many sites refuse to be framed (X-Frame-Options / CSP). Browsers don't tell the page (a blocked
//    frame still fires "load", tested), so: with a poster set, the poster stays up until the visitor
//    clicks in (a blocked site never shows as a blank screen by default); once live, a "Blank? Open in
//    a new tab" link sits next to Done; a frame that never loads falls back to the poster + "Open live
//    site" after a few seconds; and "Live in screen: Off" skips the iframe for sites known to block.
//    No poster → the live site shows as soon as it loads.
//  • Screen media: Live URL, else Poster video, else Poster image (upload or URL). No media at all →
//    nothing renders on the live site (a hint shows on the canvas only).
//  • Light/dark: silver body on light, graphite on dark (data-db-theme on <html>, else OS setting).
// Props from v1/v2 are kept (figmaUrl, image, video, scrollLid, …) so existing instances keep working.
import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Props = {
    device: "macbook" | "ipad"
    url: string
    figmaUrl: string
    embed: boolean
    image: any
    imageUrl: string
    src: string
    video: string
    alt: string
    title: string
    description: string
    caption: string
    showHeader: boolean
    openOn: "scroll" | "always"
    scrollLid: boolean
    lidClosed: number
    lidOpen: number
    maxWidth: number
    virtualWidth: number
    phoneSiteWidth: number
    failAfter: number
    tryLabel: string
    followVibe: boolean
    accent: string
    style?: React.CSSProperties
}

function resolve(input: string) {
    const raw = (input || "").trim()
    if (!raw) return null
    try {
        const u = new URL(raw)
        const local = u.hostname === "localhost" || u.hostname === "127.0.0.1"
        if (u.protocol !== "https:" && !(local && u.protocol === "http:")) return null
        const figma = ["figma.com", "www.figma.com", "embed.figma.com"].includes(u.hostname)
        if (figma && /^\/(proto|design|file)\//.test(u.pathname)) {
            const original = new URL(u)
            original.hostname = "www.figma.com"
            u.hostname = "embed.figma.com"
            u.searchParams.set("embed-host", "portfolio")
            u.searchParams.set("scaling", "scale-down")
            u.searchParams.set("hide-ui", "1")
            return { original: original.toString(), embed: u.toString(), figma: true, host: "figma.com" }
        }
        return { original: u.toString(), embed: u.toString(), figma: false, host: u.host.replace(/^www\./, "") }
    } catch {
        return null
    }
}
const imgSrc = (v: any): string => (!v ? "" : typeof v === "string" ? v : v.src || v.url || "")
const clamp = (n: number) => Math.max(0, Math.min(1, n))
const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function DeviceStudio({
    device = "macbook",
    url = "",
    figmaUrl = "",
    embed = true,
    image = "",
    imageUrl = "",
    src = "",
    video = "",
    alt = "Prototype screen",
    title = "Try it yourself",
    description = "",
    caption = "",
    showHeader = true,
    openOn = "scroll",
    scrollLid = true,
    lidClosed = 92,
    lidOpen = 0,
    maxWidth = 1040,
    virtualWidth = 1280,
    phoneSiteWidth = 820,
    failAfter = 8,
    tryLabel = "Click to try it",
    followVibe = true,
    accent = "#F3500F",
    style,
}: Partial<Props>) {
    const root = React.useRef<HTMLElement>(null)
    const stageRef = React.useRef<HTMLDivElement>(null)
    const lidRef = React.useRef<HTMLDivElement>(null)
    const shellRef = React.useRef<HTMLSpanElement>(null)
    const shadowRef = React.useRef<HTMLDivElement>(null)
    const screenRef = React.useRef<HTMLDivElement>(null)
    const frameRef = React.useRef<HTMLIFrameElement>(null)
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const dialog = React.useRef<HTMLDialogElement>(null)
    const fsBtn = React.useRef<HTMLButtonElement>(null)
    const canvas = RenderTarget.current() === RenderTarget.canvas
    const link = React.useMemo(() => resolve(url || figmaUrl), [url, figmaUrl])
    const mac = device === "macbook"
    const poster = imgSrc(image) || imageUrl || src
    const hasMedia = !!(link || poster || video)
    const useFrame = !!link && embed !== false
    const always = openOn === "always" || scrollLid === false

    const [reduced, setReduced] = React.useState(false)
    const [near, setNear] = React.useState(false) // within ~1 viewport: iframe may mount
    const [inView, setInView] = React.useState(false)
    const [live, setLive] = React.useState(false) // visitor clicked "try it"
    const [loaded, setLoaded] = React.useState(false)
    const [failed, setFailed] = React.useState(false)
    const [boxW, setBoxW] = React.useState(0) // screen width in px
    const [rootW, setRootW] = React.useState(1040)
    const narrow = rootW < 600
    const liveRef = React.useRef(false)
    liveRef.current = live

    React.useEffect(() => {
        const m = window.matchMedia("(prefers-reduced-motion: reduce)")
        const sync = () => setReduced(m.matches)
        sync()
        m.addEventListener("change", sync)
        return () => m.removeEventListener("change", sync)
    }, [])

    // Sizes: container (phone layout) + screen (iframe scale)
    React.useEffect(() => {
        const r = root.current
        const s = screenRef.current
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => {
            if (r) setRootW(r.clientWidth || 1040)
            if (s) setBoxW(s.clientWidth || 0)
        })
        if (r) ro.observe(r)
        if (s) ro.observe(s)
        return () => ro.disconnect()
    }, [hasMedia])

    // Near-viewport gate for the iframe and video
    React.useEffect(() => {
        const el = root.current
        if (!el || canvas || typeof IntersectionObserver === "undefined") {
            setNear(true)
            return
        }
        const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), {
            rootMargin: "80% 0px",
        })
        io.observe(el)
        const vis = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 })
        vis.observe(el)
        return () => {
            io.disconnect()
            vis.disconnect()
        }
    }, [canvas, hasMedia])

    // Scroll-linked lid: rAF writes styles, only while on screen
    const closedDeg = narrow ? Math.min(lidClosed, 84) : lidClosed
    React.useEffect(() => {
        const stage = stageRef.current
        if (!stage) return
        const apply = (o: number) => {
            const lid = lidRef.current
            if (lid) {
                lid.style.transform = mac
                    ? `rotateX(${(-closedDeg * (1 - o) + lidOpen * o).toFixed(2)}deg)`
                    : `rotateY(${(-24 * (1 - o)).toFixed(2)}deg) rotateX(${(-8 * (1 - o)).toFixed(2)}deg)`
            }
            if (shellRef.current) shellRef.current.style.opacity = String(mac ? clamp((0.14 - o) / 0.14) : 0)
            if (shadowRef.current) shadowRef.current.style.opacity = String(0.3 + o * 0.5)
            stage.style.setProperty("--ds-o", o.toFixed(3))
            if (o < 0.15 && liveRef.current) setLive(false)
        }
        if (canvas || always || reduced) {
            apply(1)
            return
        }
        let raf = 0
        let on = false
        const update = () => {
            raf = 0
            // Track the hinge (bottom of the untransformed lid box): the closed laptop sits on screen
            // while the hinge is in the bottom ~15% of the viewport, it is fully open once the hinge
            // reaches ~62%, and it folds shut again as the hinge rises into the top third.
            const lid = lidRef.current
            const r = stage.getBoundingClientRect()
            const hinge = r.top + (lid ? lid.offsetTop + lid.offsetHeight : r.height)
            const vh = window.innerHeight || 800
            const opening = clamp((vh * 0.86 - hinge) / (vh * 0.24))
            const closing = clamp((hinge - vh * 0.05) / (vh * 0.25))
            apply(smooth(Math.min(opening, closing)))
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
            update() // settle the final pose once
        }
        apply(0)
        let io: IntersectionObserver | null = null
        if (typeof IntersectionObserver !== "undefined") {
            io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
            io.observe(stage)
        } else start()
        return () => {
            io?.disconnect()
            stop()
        }
    }, [canvas, always, reduced, mac, closedDeg, lidOpen, narrow, hasMedia])

    // Blocked / slow embed → poster + open-live-site fallback
    const mounted = useFrame && near && !canvas
    React.useEffect(() => {
        if (!mounted || loaded || failed) return
        const t = setTimeout(() => setFailed(true), Math.max(2, failAfter) * 1000)
        return () => clearTimeout(t)
    }, [mounted, loaded, failed, failAfter])

    // Poster video plays only while on screen
    React.useEffect(() => {
        const v = videoRef.current
        if (!v) return
        if (inView && !reduced && !canvas) v.play().catch(() => {})
        else v.pause()
    }, [inView, reduced, canvas, video, failed])

    if (!hasMedia && !canvas) return null

    const embedW = Math.max(320, narrow ? phoneSiteWidth : virtualWidth)
    const ratio = mac ? 10 / 16 : 3 / 4
    const scale = boxW ? boxW / embedW : 0
    const tint = followVibe ? `var(--db-accent, ${accent})` : accent
    const showFrame = mounted && !failed
    const posterEl = video ? (
        <video ref={videoRef} src={video} poster={poster || undefined} muted loop playsInline preload="metadata" aria-label={alt} />
    ) : poster ? (
        <img src={poster} alt={alt} loading="lazy" />
    ) : null
    const openLabel = link?.figma ? "Open in Figma" : "Open in a new tab"

    return (
        <section
            ref={root}
            className="ds-studio"
            data-db-keep=""
            data-narrow={narrow}
            aria-label={title || "Live site in a laptop"}
            style={
                {
                    ...style,
                    width: "100%",
                    maxWidth: Math.max(320, maxWidth),
                    marginInline: "auto",
                    "--ds-accent": tint,
                } as React.CSSProperties
            }
        >
            <style>{CSS}</style>
            {showHeader && (title || description) && (
                <header className="ds-header">
                    {title && <h2>{title}</h2>}
                    {description && <p>{description}</p>}
                </header>
            )}
            <div ref={stageRef} className="ds-stage" data-mac={mac}>
                <div ref={lidRef} className="ds-lid">
                    <div className="ds-front">
                        <div ref={screenRef} className="ds-screen">
                            {useFrame && !canvas ? (
                                <>
                                    {(!loaded || !live || failed) && posterEl && <div className="ds-poster">{posterEl}</div>}
                                    {(!posterEl || failed) && (!loaded || failed) && (
                                        <div className="ds-blank" aria-hidden={!failed}>
                                            <span>{link!.host}</span>
                                        </div>
                                    )}
                                    {showFrame && (
                                        <div
                                            className="ds-fit"
                                            style={
                                                link!.figma
                                                    ? { inset: 0 }
                                                    : {
                                                          width: embedW,
                                                          height: embedW * ratio,
                                                          transform: `scale(${scale})`,
                                                          visibility: scale ? "visible" : "hidden",
                                                      }
                                            }
                                        >
                                            <iframe
                                                ref={frameRef}
                                                title={`${title}: live ${link!.figma ? "prototype" : "site"}`}
                                                src={link!.embed}
                                                loading="lazy"
                                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                                allow="fullscreen; clipboard-write"
                                                allowFullScreen
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                onLoad={() => setLoaded(true)}
                                                tabIndex={live ? 0 : -1}
                                            />
                                        </div>
                                    )}
                                    {failed ? (
                                        <div className="ds-fallback">
                                            <a href={link!.original} target="_blank" rel="noopener noreferrer" className="ds-pill">
                                                Open live site
                                                <Arrow />
                                            </a>
                                            <span>This site can't be shown inside the page.</span>
                                        </div>
                                    ) : !live ? (
                                        <button
                                            type="button"
                                            className="ds-veil"
                                            onClick={() => {
                                                setNear(true)
                                                setLive(true)
                                                requestAnimationFrame(() => frameRef.current?.focus())
                                            }}
                                            aria-label={`${tryLabel}: ${title}`}
                                        >
                                            <span className="ds-pill">
                                                <span className="ds-dot" aria-hidden="true" />
                                                {mounted && !loaded ? `Loading ${link!.host}…` : tryLabel}
                                            </span>
                                        </button>
                                    ) : (
                                        <div className="ds-livebar">
                                            <a href={link!.original} target="_blank" rel="noopener noreferrer">
                                                Blank? Open in a new tab
                                                <Arrow />
                                            </a>
                                            <button type="button" onClick={() => setLive(false)}>
                                                Done
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : posterEl ? (
                                <>
                                    {posterEl}
                                    {link && !canvas && (
                                        <div className="ds-fallback ds-fallback-soft">
                                            <a href={link.original} target="_blank" rel="noopener noreferrer" className="ds-pill">
                                                Open live site
                                                <Arrow />
                                            </a>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="ds-hint">
                                    {link
                                        ? `Live site: ${link.host}. It loads on the published site; add a poster image for the canvas.`
                                        : "Add a live site URL, a Figma prototype link, a poster image or a video in the properties."}
                                </div>
                            )}
                            <span className="ds-glare" aria-hidden="true" />
                        </div>
                        {mac && <span className="ds-cam" aria-hidden="true" />}
                        {mac && (
                            <span ref={shellRef} className="ds-shell" aria-hidden="true" style={{ opacity: 0 }} />
                        )}
                    </div>
                </div>
                {mac && (
                    <div className="ds-base" aria-hidden="true">
                        <span className="ds-notch" />
                    </div>
                )}
                <div ref={shadowRef} className="ds-shadow" aria-hidden="true" />
            </div>
            {caption && <p className="ds-caption">{caption}</p>}
            {link && (
                <div className="ds-actions">
                    <span className="ds-url" title={link.original}>
                        <span className="ds-lock" aria-hidden="true" />
                        {link.host}
                    </span>
                    {useFrame && !failed && (
                        <button
                            ref={fsBtn}
                            type="button"
                            onClick={() => {
                                setNear(true)
                                dialog.current?.showModal()
                            }}
                        >
                            Full screen
                        </button>
                    )}
                    <a href={link.original} target="_blank" rel="noopener noreferrer" className="ds-primary">
                        {openLabel}
                        <Arrow />
                    </a>
                </div>
            )}
            {useFrame && (
                <dialog ref={dialog} className="ds-dialog" aria-label={title} onClose={() => fsBtn.current?.focus()}>
                    <header>
                        <span>{title}</span>
                        <button type="button" onClick={() => dialog.current?.close()}>
                            Close
                        </button>
                    </header>
                    {mounted && (
                        <iframe
                            title={`${title}: full screen`}
                            src={link!.embed}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            allow="fullscreen; clipboard-write"
                            allowFullScreen
                        />
                    )}
                </dialog>
            )}
        </section>
    )
}

function Arrow() {
    return (
        <svg className="ds-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17 17 7" />
            <path d="M8 7h9v9" />
        </svg>
    )
}

const CSS = `
.ds-studio{--ds-ink:var(--db-text,#fff);--ds-muted:var(--db-text-2,#c5c5c5);--ds-panel:var(--db-surface,#171717);--ds-al1:#4a4c53;--ds-al2:#2a2b30;--ds-al3:#1a1b1f;--ds-rim:#6a6c73;--ds-shell1:#3c3e45;--ds-shell2:#24252a;font-family:'Poppins',sans-serif;color:var(--ds-ink);box-sizing:border-box;padding:40px 0;min-width:0}
html[data-db-theme=light] .ds-studio{--ds-al1:#e6e7ea;--ds-al2:#c4c6cb;--ds-al3:#9a9ca2;--ds-rim:#b5b7bd;--ds-shell1:#dfe0e4;--ds-shell2:#b2b4ba}
@media (prefers-color-scheme:light){html:not([data-db-theme]) .ds-studio{--ds-al1:#e6e7ea;--ds-al2:#c4c6cb;--ds-al3:#9a9ca2;--ds-rim:#b5b7bd;--ds-shell1:#dfe0e4;--ds-shell2:#b2b4ba}}
.ds-studio *{box-sizing:border-box}
.ds-header{display:flex;flex-direction:column;gap:12px;margin:0 auto 28px;max-width:880px}
.ds-header h2{font:600 clamp(26px,3.6vw,42px)/1.18 'Poppins',sans-serif;letter-spacing:-.03em;margin:0;color:var(--ds-ink)}
.ds-header p{font:400 clamp(16px,1.5vw,19px)/1.65 'Poppins',sans-serif;margin:0;max-width:62ch;color:var(--ds-muted)}

.ds-stage{position:relative;width:100%;overflow-x:clip;perspective:2800px;perspective-origin:50% calc(100% - 40px - 7%);padding:8px 0 40px}
.ds-stage[data-mac=false]{perspective-origin:50% 40%}
.ds-lid{position:relative;width:86%;margin-inline:auto;transform-origin:50% 100%;will-change:transform}
.ds-stage[data-mac=false] .ds-lid{width:min(86%,720px);transform-origin:50% 50%}
.ds-front{position:relative;padding:1.5% 1.5% 2.2%;border-radius:clamp(10px,1.6vw,20px) clamp(10px,1.6vw,20px) 6px 6px;background:linear-gradient(#18191c,#0b0b0d);box-shadow:inset 0 0 0 1px #2c2d32,0 0 0 1.5px var(--ds-rim),0 0 0 2.5px #00000030}
.ds-stage[data-mac=false] .ds-front{padding:3%;border-radius:clamp(18px,3vw,34px);background:linear-gradient(145deg,var(--ds-al2),var(--ds-al3))}
.ds-shell{position:absolute;inset:-1.5px;z-index:5;border-radius:inherit;background:linear-gradient(170deg,var(--ds-shell1),var(--ds-shell2));display:grid;place-items:center;pointer-events:none;box-shadow:inset 0 1px 0 #ffffff40,inset 0 0 0 1px #00000020}
.ds-screen{position:relative;width:100%;aspect-ratio:16/10;background:#050506;border-radius:clamp(3px,.5vw,7px);overflow:hidden;isolation:isolate}
.ds-stage[data-mac=false] .ds-screen{aspect-ratio:4/3;border-radius:clamp(8px,1.6vw,18px)}
.ds-screen>img,.ds-screen>video,.ds-poster img,.ds-poster video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.ds-poster{position:absolute;inset:0;z-index:1}
.ds-blank{position:absolute;inset:0;z-index:0;display:grid;place-items:center;background:radial-gradient(120% 90% at 50% 0%,color-mix(in srgb,var(--ds-accent) 22%,#101013),#08080a 70%);color:#ffffff80;font:500 clamp(12px,1.4vw,15px) 'Poppins',sans-serif;letter-spacing:.02em}
.ds-fit{position:absolute;left:0;top:0;transform-origin:0 0;z-index:0}
.ds-fit iframe{width:100%;height:100%;border:0;display:block;background:#fff}
.ds-cam{position:absolute;top:.5%;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:#1f2a33;box-shadow:inset 0 0 0 1px #33404b}
.ds-glare{position:absolute;inset:0;z-index:3;pointer-events:none;background:linear-gradient(115deg,#ffffff12 0%,transparent 30%)}
.ds-veil{position:absolute;inset:0;z-index:2;display:grid;place-items:end center;padding:0 0 5%;border:0;margin:0;background:linear-gradient(transparent 55%,#00000059);cursor:pointer;font:inherit;color:#fff}
.ds-pill{display:inline-flex;align-items:center;gap:10px;min-height:44px;padding:0 18px;border-radius:999px;background:rgba(20,20,22,.6);-webkit-backdrop-filter:blur(18px) saturate(180%);backdrop-filter:blur(18px) saturate(180%);border:.5px solid #ffffff2e;box-shadow:inset 0 1px 0 #ffffff26,0 8px 24px -10px #000;font:500 14px 'Poppins',sans-serif;color:#fff;text-decoration:none;transition:transform .25s cubic-bezier(.16,1,.3,1)}
.ds-veil:hover .ds-pill,.ds-veil:focus-visible .ds-pill,a.ds-pill:hover{transform:translateY(-2px)}
.ds-dot{width:8px;height:8px;border-radius:50%;background:var(--ds-accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--ds-accent) 28%,transparent)}
.ds-livebar{position:absolute;top:10px;right:10px;z-index:4;display:flex;gap:6px}
.ds-livebar :is(a,button){display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border-radius:999px;border:.5px solid #ffffff38;background:rgba(20,20,22,.72);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#fff;font:500 12px 'Poppins',sans-serif;text-decoration:none;cursor:pointer}
.ds-livebar .ds-arrow{width:13px;height:13px}
.ds-studio[data-narrow=true] .ds-livebar a{display:none}
.ds-fallback{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;padding:0 16px 5%;background:linear-gradient(transparent 45%,#000000a0);text-align:center}
.ds-fallback span{font:400 12px 'Poppins',sans-serif;color:#ffffffc0}
.ds-fallback-soft{background:linear-gradient(transparent 60%,#00000066)}
.ds-hint{position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;font:400 14px/1.6 'Poppins',sans-serif;color:#9a9aa0}
.ds-base{position:relative;width:100%;height:clamp(9px,1.5vw,17px);margin-top:-1px;border-radius:2px 2px 50% 50%/2px 2px 100% 100%;background:linear-gradient(var(--ds-al1),var(--ds-al2) 55%,var(--ds-al3));box-shadow:inset 0 1px 0 #ffffff66,0 1px 0 #00000040}
.ds-notch{position:absolute;left:50%;top:0;width:13%;height:42%;transform:translateX(-50%);border-radius:0 0 10px 10px;background:linear-gradient(var(--ds-al3),var(--ds-al2))}
.ds-shadow{position:absolute;left:6%;right:6%;bottom:16px;height:26px;border-radius:50%;background:radial-gradient(closest-side,#000a,transparent);filter:blur(10px);z-index:-1;opacity:.3}
.ds-caption{margin:2px auto 14px;max-width:70ch;text-align:center;font:400 14px/1.55 'Poppins',sans-serif;color:var(--ds-muted)}

.ds-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;margin-top:4px}
.ds-url{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px;border-radius:999px;background:var(--ds-panel);color:var(--ds-muted);font:400 13px 'Poppins',sans-serif;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ds-lock{width:9px;height:11px;border:1.5px solid currentColor;border-radius:2px;position:relative;margin-top:3px;flex-shrink:0}
.ds-lock::before{content:"";position:absolute;left:50%;top:-6px;width:7px;height:6px;margin-left:-3.5px;border:1.5px solid currentColor;border-bottom:0;border-radius:4px 4px 0 0}
.ds-actions :is(a,button),.ds-dialog button{font:500 14px 'Poppins',sans-serif;min-height:44px;padding:0 18px;display:inline-flex;align-items:center;gap:8px;border-radius:999px;border:1px solid var(--db-line,#ffffff30);color:var(--ds-ink);background:transparent;text-decoration:none;cursor:pointer}
.ds-actions .ds-primary{background:var(--ds-ink);color:var(--db-bg,#000);border-color:transparent}
.ds-arrow{width:16px;height:16px;flex-shrink:0;transition:transform .3s cubic-bezier(.16,1,.3,1)}
a:hover>.ds-arrow{transform:translate(2px,-2px)}
.ds-studio :is(a,button):focus-visible,.ds-dialog button:focus-visible{outline:3px solid var(--ds-accent);outline-offset:4px}
.ds-dialog{padding:0;width:min(1400px,96vw);height:92dvh;max-height:94dvh;border:1px solid var(--db-line,#777);border-radius:20px;background:var(--db-bg,#000);color:var(--db-text,#fff);overflow:hidden}
.ds-dialog::backdrop{background:#000c;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.ds-dialog header{display:flex;gap:16px;justify-content:space-between;align-items:center;padding:12px 12px 12px 20px;font:600 16px 'Poppins',sans-serif}
.ds-dialog iframe{border:0;width:100%;height:calc(100% - 68px);background:#fff}

.ds-studio[data-narrow=true]{padding:24px 0}
.ds-studio[data-narrow=true] .ds-stage{perspective:1600px;padding-bottom:28px;perspective-origin:50% calc(100% - 28px - 7%)}
.ds-studio[data-narrow=true] .ds-lid{width:96%}
.ds-studio[data-narrow=true] .ds-pill{font-size:13px;min-height:40px;padding:0 14px}
.ds-studio[data-narrow=true] .ds-fallback span{display:none}
.ds-studio[data-narrow=true] .ds-actions{gap:8px}
.ds-studio[data-narrow=true] .ds-actions :is(a,button){flex:1 1 auto;justify-content:center}
.ds-studio[data-narrow=true] .ds-url{flex:1 1 100%;justify-content:center}
@media(prefers-reduced-motion:reduce){.ds-lid{transform:none !important}.ds-arrow,.ds-pill{transition:none}}
`

addPropertyControls(DeviceStudio, {
    device: {
        type: ControlType.Enum,
        title: "Device",
        options: ["macbook", "ipad"],
        optionTitles: ["Laptop", "Tablet"],
        defaultValue: "macbook",
    },
    url: {
        type: ControlType.String,
        title: "Live site URL",
        defaultValue: "",
        placeholder: "https://…",
        description: "Any https site, or a Figma prototype link.",
    },
    embed: {
        type: ControlType.Boolean,
        title: "Live in screen",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
        description: "Off for sites that refuse to be framed: shows the poster + an Open live site button.",
        hidden: (p: any) => !p.url && !p.figmaUrl,
    },
    figmaUrl: {
        type: ControlType.String,
        title: "Figma URL (old)",
        defaultValue: "",
        hidden: (p: any) => !!p.url,
    },
    image: { type: ControlType.Image, title: "Poster image" },
    imageUrl: {
        type: ControlType.String,
        title: "Poster URL",
        defaultValue: "",
        description: "Used when no poster image is uploaded.",
        hidden: (p: any) => !!p.image,
    },
    video: {
        type: ControlType.File,
        title: "Poster video",
        allowedFileTypes: ["mp4", "webm", "mov"],
    },
    alt: { type: ControlType.String, title: "Media description", defaultValue: "Prototype screen" },
    title: { type: ControlType.String, title: "Headline", defaultValue: "Try it yourself" },
    description: { type: ControlType.String, title: "Description", displayTextArea: true, defaultValue: "" },
    showHeader: { type: ControlType.Boolean, title: "Show heading", defaultValue: true },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "", description: "Small line under the laptop." },
    tryLabel: { type: ControlType.String, title: "Try label", defaultValue: "Click to try it" },
    openOn: {
        type: ControlType.Enum,
        title: "Open on",
        options: ["scroll", "always"],
        optionTitles: ["Scroll", "Always"],
        defaultValue: "scroll",
        displaySegmentedControl: true,
    },
    lidClosed: {
        type: ControlType.Number,
        title: "Closed angle",
        min: 40,
        max: 100,
        step: 1,
        unit: "°",
        defaultValue: 92,
        hidden: (p: any) => p.openOn === "always" || p.device === "ipad",
    },
    lidOpen: {
        type: ControlType.Number,
        title: "Open tilt",
        min: -10,
        max: 20,
        step: 1,
        unit: "°",
        defaultValue: 0,
        description: "0 = upright. Positive leans the screen back.",
        hidden: (p: any) => p.device === "ipad",
    },
    followVibe: { type: ControlType.Boolean, title: "Use site vibe", defaultValue: true },
    accent: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#F3500F",
        hidden: (p: any) => !!p.followVibe,
    },
    virtualWidth: {
        type: ControlType.Number,
        title: "Site width",
        min: 360,
        max: 1920,
        step: 20,
        defaultValue: 1280,
        unit: "px",
    },
    phoneSiteWidth: {
        type: ControlType.Number,
        title: "Site width (phone)",
        min: 360,
        max: 1280,
        step: 20,
        defaultValue: 820,
        unit: "px",
    },
    failAfter: {
        type: ControlType.Number,
        title: "Give up after",
        min: 2,
        max: 30,
        step: 1,
        unit: "s",
        defaultValue: 8,
    },
    maxWidth: { type: ControlType.Number, title: "Max width", min: 320, max: 1400, step: 20, defaultValue: 1040 },
})
