// PortfolioNav v14 (Oct 11). Dhwani's site nav + site-wide theme layer, placed directly on each page.
// v14 — reviewer: "the red yellow green browser vibe is cool but looks out of the theme" → her call:
// go deeper. The nav is now a small browser window: muted traffic lights (accent-tinted on hover),
// lowercase tabs with the active tab joined to the toolbar, an address bar showing the current path
// (dhwanibagrecha.com/work/briefs), and vibe / theme / ask as toolbar icons. Phone: dots + address
// bar + menu. Solid surfaces, no backdrop blur, no running animations.
// v14 — reviewer: "when I dark mode it made the screen buggy". The old theme layer rewrote inline
// styles on every Framer layer (computed-style scan with read/write interleaving, two full
// stylesheet walks and a re-broadcast to every component on each toggle and 4× on load) and put the
// saved "original" inline colors back when switching to dark, which overwrote newer values React
// had written since. Now the theme is ONE attribute on <html> (data-db-theme) + CSS variables:
// • Framer color styles (--token-*) are read once per stylesheet change and pinned for BOTH themes,
//   each scoped under its data-db-theme value, so a toggle never rewrites a stylesheet.
// • Hand-colored Framer layers get a theme-independent marker attribute (data-db-bg / -tx / -ln)
//   from their own inline color; CSS applies the light value only under data-db-theme="light".
//   Dark mode needs no DOM writes and nothing is ever "restored". Code components are skipped.
// • The base theme CSS lives in a persistent <head> tag (no flash when pages swap navs).
// Earlier: v13 AI Lab tab, connect → Home hiring band; v12 one visible copy per breakpoint;
// Oct 4 light-mode logo darkening; follows the OS until the visitor picks (localStorage "db_theme").
import * as React from "react"
import {
    startTransition,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
} from "react"
import { createPortal } from "react-dom"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

type Tab = { label: string; href: string }
type Theme = "light" | "dark"

interface Props {
    tabs: Tab[]
    breakpoint: number
    showLights: boolean
    showAsk: boolean
    showTheme: boolean
    brand: string
    vibeGlow: boolean
    fontSize: number
    tabHeight: number
    tabPadding: number
    style?: CSSProperties
}

const FONT = "'Poppins', 'Inter', sans-serif"
const SITE_HOST = "dhwanibagrecha.com"
const DEFAULT_TABS: Tab[] = [
    { label: "home", href: "/" },
    { label: "about me", href: "/about-me" },
    { label: "work", href: "/#work" },
    { label: "ai lab", href: "/lab" },
    { label: "connect", href: "/#hiring" },
]
// Oct 10: "play" is now "AI Lab" (/lab) and "connect" lands on Home's hiring band (ConnectBand, in a
// layer named "hiring"). Instances that still carry the old links are upgraded here.
function upgradeTab(t: Tab): Tab {
    const label = String((t && t.label) || "").trim()
    const href = String((t && t.href) || "").trim()
    if (/^(play|ai lab)$/i.test(label)) return { label: "ai lab", href: "/lab" }
    if (/^connect$/i.test(label) && (href === "" || /^\/?#contact$/.test(href)))
        return { label, href: "/#hiring" }
    return t
}
// Scroll targets sit under the fixed browser bar: leave room for it.
const HEADER_OFFSET = { wide: 108, narrow: 76 }
const SECTION_TEXT: Record<string, string[]> = {
    contact: ["send a signal.", "send a signal"],
    hiring: ["hiring for product, ux or experience design"],
    work: ["selected work"],
}

// ---------------------------------------------------------------- theme tokens + static CSS
const LIGHT = `--db-bg:#FFFFFF;--db-surface:#EEEEEE;--db-surface-2:#E0E0E0;--db-text:#0A0A0A;--db-text-2:rgba(0,0,0,0.62);--db-line:rgba(0,0,0,0.12);--db-glass:rgba(255,255,255,0.86);--db-glass-line:rgba(0,0,0,0.10);--db-shadow:0 18px 40px -22px rgba(0,0,0,0.35);--db-accent:#C23D08;--db-on-accent:#FFFFFF;--db-glow-blend:multiply;--db-glow-opacity:0.22;--db-aurora-opacity:0.55;color-scheme:light;`
const DARK = `--db-bg:#000000;--db-surface:#111111;--db-surface-2:#1F1F1F;--db-text:#FFFFFF;--db-text-2:rgba(255,255,255,0.6);--db-line:rgba(255,255,255,0.1);--db-glass:rgba(18,18,18,0.82);--db-glass-line:rgba(255,255,255,0.10);--db-shadow:0 18px 40px -18px rgba(0,0,0,0.9);--db-accent:var(--vibe-accent,#F3500F);--db-on-accent:#0A0A0A;--db-glow-blend:screen;--db-glow-opacity:0.55;--db-aurora-opacity:1;color-scheme:dark;`
const LIGHT_VIBES = `[data-vibe="goblue"]{--db-accent:#0369A1}[data-vibe="nightshift"]{--db-accent:#5B3FD6}[data-vibe="afterhours"]{--db-accent:#C2185B}[data-vibe="greenroom"]{--db-accent:#854D0E}`
const L = `:root[data-db-theme="light"]`
const whiteSel = [
    "rgb(255, 255, 255)",
    "rgb(250, 250, 250)",
    "rgb(245, 245, 245)",
    "rgb(245, 245, 243)",
]
    .flatMap((c) => [
        `${L} [style*="--framer-text-color:${c}"]`,
        `${L} [style*="--framer-text-color: ${c}"]`,
    ])
    .join(",")
// Marker attributes are written once per layer from its own (dark-mode) inline color and only take
// effect in light mode, so switching themes never touches the DOM.
const MARKS = `
${L} [data-db-bg="0"],${L} [data-db-bg="c0"]{background-color:var(--db-bg) !important}
${L} [data-db-bg="1"],${L} [data-db-bg="c1"]{background-color:var(--db-surface) !important}
${L} [data-db-bg="2"],${L} [data-db-bg="c2"]{background-color:var(--db-surface-2) !important}
${L} [data-db-bg="w1"]{background-color:rgba(0,0,0,0.04) !important}
${L} [data-db-bg="w2"]{background-color:rgba(0,0,0,0.08) !important}
${L} [data-db-bg="w3"]{background-color:rgba(0,0,0,0.12) !important}
${L} [data-db-bg="k1"]{background-color:rgba(255,255,255,0.15) !important}
${L} [data-db-bg="k2"]{background-color:rgba(255,255,255,0.3) !important}
${L} [data-db-bg="k3"]{background-color:rgba(255,255,255,0.45) !important}
${L} [data-db-tx="1"]{color:var(--db-text) !important;--framer-text-color:var(--db-text) !important}
${L} [data-db-tx="2"]{color:var(--db-text-2) !important;--framer-text-color:var(--db-text-2) !important}
${L} [data-db-ln="1"]{border-color:var(--db-line) !important}
${L} [data-db-ln="2"]{border-color:var(--db-text) !important}
${L} [data-db-logo]{filter:brightness(0) saturate(100%) !important;opacity:0.86 !important}
`
const FIXES = `
${whiteSel}{--framer-text-color:var(--db-text) !important}
${L} [style*="--framer-text-color:rgba(255, 255, 255"],${L} [style*="--framer-text-color: rgba(255, 255, 255"]{--framer-text-color:var(--db-text-2) !important}
section:has(> .sp-shell){--sp-text:var(--db-text) !important;--sp-map-line:var(--db-text) !important;color:var(--db-text) !important}
${L} .sp-feedback.tone-warm > span{color:#B23A0F !important}
${L} .sp-feedback.tone-cold > span{color:#2D52CC !important}
`
const THEME_CSS = `
:root{${DARK}}
${L}, ${L} body, ${L} #main{background:var(--db-bg) !important}
:root[data-db-theme="light"]{${LIGHT}}
:root[data-db-theme="light"]${LIGHT_VIBES.replace(/\}\[/g, '}:root[data-db-theme="light"][')}
${FIXES}
${MARKS}
`
const ACCENT = "var(--db-accent, #F3500F)"

// Browser-chrome look. Local surface vars derive from the --db-* tokens.
const NAV_CSS = `
[data-dbnav]{--dbn-strip:color-mix(in srgb, var(--db-surface) 55%, var(--db-bg));--dbn-bar:color-mix(in srgb, var(--db-surface) 45%, var(--db-surface-2));--dbn-field:var(--db-bg);--dbn-hover:var(--db-line)}
${L} [data-dbnav]{--dbn-strip:var(--db-surface);--dbn-bar:var(--db-bg);--dbn-field:var(--db-surface)}
[data-dbnav] a:focus-visible,[data-dbnav] button:focus-visible{outline:2px solid ${ACCENT};outline-offset:2px}
[data-dbnav] .dbnav-tab:not([aria-current]):hover{color:var(--db-text);background:var(--dbn-hover)}
[data-dbnav] .dbnav-tab[aria-current]::before,[data-dbnav] .dbnav-tab[aria-current]::after{content:"";position:absolute;bottom:0;width:10px;height:10px;pointer-events:none}
[data-dbnav] .dbnav-tab[aria-current]::before{left:-10px;background:radial-gradient(circle at 0 0,transparent 9.5px,var(--dbn-bar) 10px)}
[data-dbnav] .dbnav-tab[aria-current]::after{right:-10px;background:radial-gradient(circle at 100% 0,transparent 9.5px,var(--dbn-bar) 10px)}
[data-dbnav] .dbnav-icon:hover{color:var(--db-text);background:var(--dbn-hover)}
[data-dbnav] .dbnav-dot{background:var(--c);opacity:.78;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.18)}
${L} [data-dbnav] .dbnav-dot{opacity:.92}
[data-dbnav] .dbnav-dots:hover .dbnav-dot{opacity:1;background:color-mix(in srgb, var(--c) 58%, var(--db-accent))}
[data-dbnav] .dbnav-skip{position:fixed;left:12px;top:-80px;z-index:2147483001;padding:12px 16px;border-radius:12px;background:var(--db-text);color:var(--db-bg);font:600 14px ${FONT};text-decoration:none}
[data-dbnav] .dbnav-skip:focus{top:12px}
@keyframes dbnav-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion: reduce){[data-dbnav] *{transition:none !important;animation:none !important}}
`

function systemTheme(): Theme {
    if (typeof window === "undefined") return "dark"
    return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
}
function savedTheme(): Theme | null {
    try {
        const t = localStorage.getItem("db_theme")
        return t === "light" || t === "dark" ? t : null
    } catch {
        return null
    }
}
function styleTag(id: string, css: string) {
    let el = document.getElementById(id) as HTMLStyleElement | null
    if (!el) {
        el = document.createElement("style")
        el.id = id
        document.head.appendChild(el)
    }
    if (el.textContent !== css) el.textContent = css
}

// Counters for the test harness (cheap, never read by the site).
type Stats = {
    applies: number
    sheetWalks: number
    passes: number
    marked: number
    events: number
}
function stats(): Stats {
    const w = window as any
    if (!w.__dbNavStats)
        w.__dbNavStats = {
            applies: 0,
            sheetWalks: 0,
            passes: 0,
            marked: 0,
            events: 0,
        }
    return w.__dbNavStats
}

// ---------------------------------------------------------------- color helpers
type RGBA = { r: number; g: number; b: number; a: number }
function parseColor(v: string): RGBA | null {
    if (!v || v === "transparent") return null
    const m = v.match(
        /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/
    )
    if (m) {
        const a =
            m[4] === undefined
                ? 1
                : m[4].endsWith("%")
                  ? parseFloat(m[4]) / 100
                  : parseFloat(m[4])
        return { r: +m[1], g: +m[2], b: +m[3], a }
    }
    const h = v.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    if (h) {
        const s =
            h[1].length === 3
                ? h[1]
                      .split("")
                      .map((c) => c + c)
                      .join("")
                : h[1]
        const n = parseInt(s, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
    }
    if (/^\s*white\s*$/i.test(v)) return { r: 255, g: 255, b: 255, a: 1 }
    if (/^\s*black\s*$/i.test(v)) return { r: 0, g: 0, b: 0, a: 1 }
    return null
}
const isWhiteish = (c: RGBA) =>
    Math.min(c.r, c.g, c.b) >= 225 &&
    Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 20
const isBlackish = (c: RGBA, lim: number) =>
    Math.max(c.r, c.g, c.b) <= lim &&
    Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 16
function mapBg(c: RGBA): string | null {
    if (c.a >= 0.5 && isBlackish(c, 14)) return "var(--db-bg)"
    if (c.a >= 0.5 && isBlackish(c, 30)) return "var(--db-surface)"
    if (c.a >= 0.5 && isBlackish(c, 56)) return "var(--db-surface-2)"
    if (c.a > 0 && c.a < 0.35 && isWhiteish(c))
        return `rgba(0,0,0,${Math.min(0.12, c.a * 1.2).toFixed(3)})`
    if (c.a > 0 && c.a < 0.5 && isBlackish(c, 30))
        return `rgba(255,255,255,${c.a.toFixed(3)})`
    return null
}
// Same buckets as mapBg, as marker values for the MARKS CSS.
function bgMark(c: RGBA): string {
    if (c.a >= 0.5 && isBlackish(c, 14)) return "0"
    if (c.a >= 0.5 && isBlackish(c, 30)) return "1"
    if (c.a >= 0.5 && isBlackish(c, 56)) return "2"
    if (c.a > 0 && c.a < 0.35 && isWhiteish(c))
        return c.a < 0.05 ? "w1" : c.a < 0.09 ? "w2" : "w3"
    if (c.a > 0 && c.a < 0.5 && isBlackish(c, 30))
        return c.a < 0.2 ? "k1" : c.a < 0.37 ? "k2" : "k3"
    return ""
}
function mapText(c: RGBA): string | null {
    if (!isWhiteish(c)) return null
    return c.a >= 0.85
        ? "var(--db-text)"
        : `rgba(10,10,10,${Math.max(0.62, c.a).toFixed(3)})`
}
function mapLine(c: RGBA): string | null {
    if (isWhiteish(c) && c.a < 0.6)
        return `rgba(0,0,0,${Math.max(0.1, c.a).toFixed(3)})`
    if (isWhiteish(c)) return "var(--db-text)"
    return null
}

// ---------------------------------------------------------------- stylesheet layer (once per change)
const OWN = ["db-theme-base", "db-nav-css", "db-theme-pin", "db-auto-theme"]
function ownSheet(sh: CSSStyleSheet) {
    const id = sh.ownerNode && (sh.ownerNode as HTMLElement).id
    return !!id && OWN.indexOf(id) !== -1
}
// Cheap fingerprint of the page's CSS: sheet count + rule counts. No rule text is read.
function sheetSig(): string {
    const sheets = document.styleSheets
    let n = 0
    let rules = 0
    for (let i = 0; i < sheets.length; i++) {
        const sh = sheets[i]
        if (ownSheet(sh)) continue
        n++
        try {
            rules += sh.cssRules.length
        } catch {}
    }
    return n + ":" + rules
}
function eachRule(fn: (rule: CSSStyleRule, mode: Theme | null) => void) {
    const walk = (rules: CSSRuleList, mode: Theme | null) => {
        for (let i = 0; i < rules.length; i++) {
            const r = rules[i] as any
            if (r.type === 1) fn(r as CSSStyleRule, mode)
            else if (r.type === 4) {
                const c = String(
                    r.conditionText || (r.media && r.media.mediaText) || ""
                )
                const m: Theme | null = /prefers-color-scheme:\s*dark/.test(c)
                    ? "dark"
                    : /prefers-color-scheme:\s*light/.test(c)
                      ? "light"
                      : mode
                walk(r.cssRules, m)
            } else if (r.cssRules) walk(r.cssRules, mode)
        }
    }
    const sheets = document.styleSheets
    for (let i = 0; i < sheets.length; i++) {
        const sh = sheets[i]
        if (ownSheet(sh)) continue
        try {
            walk(sh.cssRules, null)
        } catch {}
    }
}
const BG_PROPS = ["background-color"]
const TEXT_PROPS = ["color", "--framer-text-color", "fill", "stroke"]
const LINE_PROPS = [
    "border-color",
    "border-top-color",
    "border-right-color",
    "border-bottom-color",
    "border-left-color",
    "--border-color",
    "outline-color",
]
function scopeTo(theme: Theme, sel: string) {
    const root = `:root[data-db-theme="${theme}"]`
    if (/^(html|:root)\b/.test(sel))
        return sel.replace(/^(html|:root)/, root)
    return `${root} ${sel}`
}
let sigCache = ""
// One walk collects both the Framer color-style values and the hand-colored layer rules.
function refreshSheets(force = false) {
    if (typeof document === "undefined") return
    const sig = sheetSig()
    if (!force && sig === sigCache) return
    sigCache = sig
    stats().sheetWalks++
    const sel = new Set<string>(["body"])
    const light: Record<string, string> = {}
    const dark: Record<string, string> = {}
    const auto: string[] = []
    eachRule((rule, mode) => {
        const st = rule.style
        const selText = rule.selectorText || ""
        let has = false
        for (let i = 0; i < st.length; i++) {
            const p = st[i]
            if (!p.startsWith("--token-")) continue
            has = true
            const v = st.getPropertyValue(p).trim()
            const m: Theme = mode || (/dark/.test(selText) ? "dark" : "light")
            if (m === "dark") dark[p] = v
            else if (!(p in light) || mode === "light") light[p] = v
        }
        if (has) {
            const base = (selText || "body")
                .replace(/:not\([^)]*\)/g, "")
                .replace(/\[data-framer-theme[^\]]*\]/g, "")
                .trim()
            base.split(",").forEach((s) => {
                const t = s.trim()
                if (t) sel.add(t)
            })
        }
        if (
            selText.indexOf("framer-") === -1 ||
            /data-db|dbnav|data-csnav/.test(selText)
        )
            return
        const decls: string[] = []
        const handle = (props: string[], map: (c: RGBA) => string | null) => {
            for (const p of props) {
                const v = st.getPropertyValue(p)
                if (!v || v.indexOf("var(") !== -1) continue
                const c = parseColor(v)
                if (!c) continue
                const out = map(c)
                if (out) decls.push(`${p}:${out} !important`)
            }
        }
        handle(BG_PROPS, mapBg)
        handle(TEXT_PROPS, mapText)
        handle(LINE_PROPS, mapLine)
        if (!decls.length) return
        auto.push(
            `${selText
                .split(",")
                .map((s) => `${L} ${s.trim()}`)
                .join(",")}{${decls.join(";")}}`
        )
    })
    const sels = Array.from(sel)
    const block = (theme: Theme, vals: Record<string, string>) => {
        const keys = Object.keys(vals)
        if (!keys.length) return ""
        return `${sels.map((s) => scopeTo(theme, s)).join(",")}{${keys
            .map((k) => `${k}:${vals[k]} !important;`)
            .join("")}}`
    }
    styleTag(
        "db-theme-pin",
        block("light", light) + "\n" + block("dark", { ...light, ...dark })
    )
    styleTag("db-auto-theme", auto.join("\n"))
}

// ---------------------------------------------------------------- marker pass (light mode only)
const SKIP_TAGS = /^(IMG|VIDEO|CANVAS|SVG|PICTURE|IFRAME|PATH|G|SOURCE)$/i
const KEEP = '[data-dbnav],[data-db-keep],[style*="var(--db-"],[style*="var(--vibe-"]'
function setMark(el: Element, attr: string, val: string) {
    const cur = el.getAttribute(attr)
    if (val) {
        if (cur === val) return
        el.setAttribute(attr, val)
        stats().marked++
    } else if (cur !== null && !/^c/.test(cur)) el.removeAttribute(attr)
}
// Classify a layer from its OWN inline colors (authored dark values; unaffected by our CSS).
function markInline(el: HTMLElement) {
    if (SKIP_TAGS.test(el.tagName)) return
    const s = el.style
    const hasFramerText = s.getPropertyValue("--framer-text-color") !== ""
    const cls = typeof el.className === "string" ? el.className : ""
    // Code components draw without Framer layer classes: leave them alone.
    if (cls.indexOf("framer-") === -1 && !hasFramerText) return
    if (el.closest(KEEP)) return
    let bg = ""
    const bv = s.backgroundColor
    if (bv && bv.indexOf("var(") === -1) {
        const c = parseColor(bv)
        if (c) bg = bgMark(c)
    }
    if (!/^c/.test(el.getAttribute("data-db-bg") || "")) setMark(el, "data-db-bg", bg)
    let tx = ""
    const tv = s.color || s.getPropertyValue("--framer-text-color")
    if (tv && tv.indexOf("var(") === -1) {
        const c = parseColor(tv)
        if (c && isWhiteish(c)) tx = c.a >= 0.85 ? "1" : "2"
    }
    setMark(el, "data-db-tx", tx)
    let ln = ""
    const lv = s.borderColor || s.borderTopColor
    if (lv && lv.indexOf("var(") === -1) {
        const c = parseColor(lv)
        if (c && isWhiteish(c)) ln = c.a < 0.6 ? "1" : "2"
    }
    setMark(el, "data-db-ln", ln)
}

// Oct 4 logo fix: very light, low-saturation logo images get darkened in light mode.
const logoCache: Record<string, boolean | "pending"> = {}
function isLogoEl(el: HTMLElement): boolean {
    if (/logo/i.test(el.getAttribute("alt") || "")) return true
    const named = el.closest("[data-framer-name]")
    return !!named && /logo/i.test(named.getAttribute("data-framer-name") || "")
}
function sampleLogo(src: string, done: (light: boolean) => void) {
    try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.decoding = "async"
        img.onload = () => {
            let light = false
            try {
                const w = Math.max(1, Math.min(64, img.naturalWidth || 64))
                const h = Math.max(1, Math.min(64, img.naturalHeight || 64))
                const c = document.createElement("canvas")
                c.width = w
                c.height = h
                const ctx = c.getContext("2d")
                if (ctx) {
                    ctx.drawImage(img, 0, 0, w, h)
                    const d = ctx.getImageData(0, 0, w, h).data
                    let n = 0
                    let clear = 0
                    let lum = 0
                    let sat = 0
                    for (let i = 0; i < d.length; i += 4) {
                        if (d[i + 3] < 32) {
                            clear++
                            continue
                        }
                        const r = d[i] / 255
                        const g = d[i + 1] / 255
                        const b = d[i + 2] / 255
                        const mx = Math.max(r, g, b)
                        const mn = Math.min(r, g, b)
                        lum += 0.2126 * r + 0.7152 * g + 0.0722 * b
                        sat += mx === 0 ? 0 : (mx - mn) / mx
                        n++
                    }
                    if (n > 0 && clear / (n + clear) > 0.03)
                        light = lum / n > 0.82 && sat / n < 0.18
                }
            } catch {}
            done(light)
        }
        img.onerror = () => done(false)
        img.src = src
    } catch {
        done(false)
    }
}
function markLogo(img: HTMLImageElement) {
    if (img.closest("[data-dbnav]") || !isLogoEl(img)) return
    const src = img.currentSrc || img.src
    if (!src) return
    const hit = logoCache[src]
    if (hit === true) return setMark(img, "data-db-logo", "1")
    if (img.hasAttribute("data-db-logo")) img.removeAttribute("data-db-logo")
    if (hit === false || hit === "pending") return
    logoCache[src] = "pending"
    sampleLogo(src, (light) => {
        logoCache[src] = light
        if (light && img.isConnected && (img.currentSrc || img.src) === src)
            setMark(img, "data-db-logo", "1")
    })
}

function rootEl(): HTMLElement {
    return document.getElementById("main") || document.body
}
function isLight() {
    return document.documentElement.getAttribute("data-db-theme") === "light"
}
let flipObs: MutationObserver | null = null
let pendingRoots: Element[] = []
let pendingFull = false
let passTimer = 0
function runPass() {
    passTimer = 0
    if (!isLight()) {
        pendingRoots = []
        pendingFull = false
        return
    }
    stats().passes++
    refreshSheets()
    const root = rootEl()
    const roots = pendingFull ? [root] : pendingRoots.filter((r) => r.isConnected)
    const full = pendingFull
    pendingRoots = []
    pendingFull = false
    if (flipObs) flipObs.disconnect() // never observe our own writes
    try {
        // Page containers whose painted background is still near-black after the token pin
        // (Framer color styles the stylesheet read missed). Reads first, then writes.
        if (full) {
            const shells = Array.from(
                root.querySelectorAll<HTMLElement>(
                    ":scope > *, :scope > * > *, :scope > * > * > *"
                )
            ).filter(
                (el) =>
                    !el.hasAttribute("data-db-bg") &&
                    !el.closest(KEEP) &&
                    !SKIP_TAGS.test(el.tagName)
            )
            shells.unshift(root)
            const hits: Array<[HTMLElement, string]> = []
            for (const el of shells) {
                const c = parseColor(getComputedStyle(el).backgroundColor)
                if (!c || c.a < 0.5) continue
                const m = bgMark(c)
                if (m === "0" || m === "1" || m === "2") hits.push([el, "c" + m])
            }
            hits.forEach(([el, m]) => setMark(el, "data-db-bg", m))
        }
        for (const r of roots) {
            if (r instanceof HTMLElement && r.hasAttribute("style")) markInline(r)
            r.querySelectorAll<HTMLElement>("[style]").forEach(markInline)
            if (r instanceof HTMLImageElement) markLogo(r)
            r.querySelectorAll<HTMLImageElement>("img").forEach(markLogo)
        }
    } finally {
        if (flipObs) {
            flipObs.takeRecords()
            flipObs.observe(rootEl(), { childList: true, subtree: true })
        }
    }
}
function schedulePass(full: boolean, roots?: Element[], delay = 250) {
    if (typeof window === "undefined") return
    if (full) pendingFull = true
    if (roots) pendingRoots.push(...roots)
    if (pendingRoots.length > 300) {
        pendingFull = true
        pendingRoots = []
    }
    if (passTimer) return
    passTimer = window.setTimeout(runPass, delay)
}
function watchMarks(on: boolean) {
    if (typeof window === "undefined") return
    if (!on) {
        if (flipObs) flipObs.disconnect()
        flipObs = null
        if (passTimer) window.clearTimeout(passTimer)
        passTimer = 0
        pendingRoots = []
        pendingFull = false
        return
    }
    if (flipObs) return
    flipObs = new MutationObserver((records) => {
        const added: Element[] = []
        for (const r of records)
            r.addedNodes.forEach((n) => {
                if (n.nodeType === 1) added.push(n as Element)
            })
        if (added.length) schedulePass(false, added, 300)
    })
    flipObs.observe(rootEl(), { childList: true, subtree: true })
}

// ---------------------------------------------------------------- apply
function ensureBaseCss() {
    styleTag("db-theme-base", THEME_CSS)
    styleTag("db-nav-css", NAV_CSS)
}
function applyTheme(t: Theme | null, announce = true) {
    if (typeof document === "undefined") return
    stats().applies++
    ensureBaseCss()
    refreshSheets()
    const resolved: Theme = t || systemTheme()
    const html = document.documentElement
    const changed = html.getAttribute("data-db-theme") !== resolved
    if (changed) html.setAttribute("data-db-theme", resolved)
    if (document.body.getAttribute("data-framer-theme") !== resolved)
        document.body.setAttribute("data-framer-theme", resolved)
    if (html.style.colorScheme !== resolved) html.style.colorScheme = resolved
    if (resolved === "light") {
        watchMarks(true)
        schedulePass(true, undefined, changed ? 0 : 250)
    } else watchMarks(false)
    if (changed && announce) {
        stats().events++
        try {
            window.dispatchEvent(
                new CustomEvent("db-theme", { detail: { theme: resolved } })
            )
        } catch {}
    }
}

// ---------------------------------------------------------------- vibe (fallback when the page has no vibe chip)
type Vibe = { id: string; name: string; a: string; b: string; c: string; accent: string }
const VIBES: Vibe[] = [
    { id: "ember", name: "Orange", a: "rgba(255,140,60,0.38)", b: "rgba(243,80,15,0.50)", c: "rgba(255,203,5,0.16)", accent: "#F3500F" },
    { id: "goblue", name: "Sky Blue", a: "rgba(125,211,252,0.32)", b: "rgba(56,189,248,0.50)", c: "rgba(2,132,199,0.22)", accent: "#38BDF8" },
    { id: "afterhours", name: "Pink", a: "rgba(255,177,153,0.32)", b: "rgba(255,77,141,0.46)", c: "rgba(123,92,255,0.20)", accent: "#FF4D8D" },
    { id: "greenroom", name: "Yellow", a: "rgba(254,240,138,0.35)", b: "rgba(250,204,21,0.48)", c: "rgba(234,179,8,0.22)", accent: "#FACC15" },
]
function lum(r: number, g: number, b: number) {
    const ch = (x: number) => {
        const s = x / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}
// Same rule as WorldIntro: darken until ≥4.5:1 on white for the light-mode accent.
function inkOnWhite(hex: string): string {
    const n = parseInt(hex.replace("#", ""), 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    for (let t = 0; t <= 1.0001; t += 0.02) {
        const k = 1 - t
        const rr = Math.round(r * k)
        const gg = Math.round(g * k)
        const bb = Math.round(b * k)
        if (1.05 / (lum(rr, gg, bb) + 0.05) >= 4.5)
            return (
                "#" +
                [rr, gg, bb]
                    .map((x) => x.toString(16).padStart(2, "0"))
                    .join("")
                    .toUpperCase()
            )
    }
    return "#000000"
}
function applyVibe(v: Vibe) {
    const root = document.documentElement
    root.style.setProperty("--vibe-a", v.a)
    root.style.setProperty("--vibe-b", v.b)
    root.style.setProperty("--vibe-c", v.c)
    root.style.setProperty("--vibe-accent", v.accent)
    root.style.setProperty("--vibe-accent-ink", inkOnWhite(v.accent))
    root.setAttribute("data-vibe", v.id)
    styleTag(
        "db-vibe-ink",
        `:root[data-db-theme="light"]{--db-accent: var(--vibe-accent-ink) !important}`
    )
    try {
        localStorage.setItem(
            "db_vibe",
            JSON.stringify({ id: v.id, a: v.a, b: v.b, c: v.c, accent: v.accent })
        )
    } catch {}
    try {
        window.dispatchEvent(
            new CustomEvent("db-vibe", {
                detail: { id: v.id, a: v.a, b: v.b, c: v.c, accent: v.accent, preview: false },
            })
        )
    } catch {}
}
// Her WorldIntro corner chip is the one vibe picker; the toolbar icon opens it when it's on the page.
function vibeChip(): HTMLButtonElement | null {
    const b = document.querySelector<HTMLButtonElement>(
        'button[aria-controls="vibe-menu"]'
    )
    return b && b.getClientRects().length ? b : null
}

// ---------------------------------------------------------------- routing helpers
function splitHref(href: string) {
    const i = href.indexOf("#")
    if (i === -1) return { page: href.replace(/\/$/, "") || "/", hash: "" }
    return {
        page: href.slice(0, i).replace(/\/$/, "") || "/",
        hash: href.slice(i + 1),
    }
}
function isCurrent(href: string, path: string, activeHash: string) {
    const { page, hash } = splitHref(href)
    if (hash) {
        if (
            hash === "work" &&
            (path.startsWith("/work") || path.startsWith("/projects"))
        )
            return true
        return page === path && activeHash === hash
    }
    if (page === "/") return path === "/" && !activeHash
    return path === page || path.startsWith(page + "/")
}
function isVisible(el: HTMLElement) {
    return el.getClientRects().length > 0
}
function findSection(id: string): HTMLElement | null {
    if (typeof document === "undefined" || !id) return null
    const byId = document.getElementById(id)
    if (byId && isVisible(byId)) return byId
    const want = id.toLowerCase()
    const named = document.querySelectorAll<HTMLElement>("[data-framer-name]")
    for (let i = 0; i < named.length; i++) {
        if (
            (named[i].getAttribute("data-framer-name") || "").toLowerCase() ===
                want &&
            isVisible(named[i])
        )
            return named[i]
    }
    const texts = SECTION_TEXT[want]
    if (texts) {
        const nodes = document.querySelectorAll<HTMLElement>("h1, h2, h3, p")
        for (let i = 0; i < nodes.length; i++) {
            const t = (nodes[i].textContent || "").trim().toLowerCase()
            if (
                texts.some((x) => t === x || t.startsWith(x)) &&
                isVisible(nodes[i])
            ) {
                let el: HTMLElement | null = nodes[i]
                while (
                    el &&
                    el.parentElement &&
                    el.getBoundingClientRect().width < window.innerWidth * 0.5
                )
                    el = el.parentElement
                return el || nodes[i]
            }
        }
    }
    return null
}
function readPath() {
    return window.location.pathname.replace(/\/$/, "") || "/"
}

let OWNER: symbol | null = null

// ---------------------------------------------------------------- small parts
const DOTS = ["#D9645C", "#D8A94A", "#5EA965"]
function Lights({ size = 11, gap = 7 }: { size?: number; gap?: number }) {
    return (
        <span
            aria-hidden
            className="dbnav-dots"
            style={{ display: "inline-flex", gap, padding: "0 2px", flexShrink: 0 }}
        >
            {DOTS.map((c) => (
                <span
                    key={c}
                    className="dbnav-dot"
                    style={
                        {
                            "--c": c,
                            width: size,
                            height: size,
                            borderRadius: size,
                            transition: "background .18s, opacity .18s",
                        } as CSSProperties
                    }
                />
            ))}
        </span>
    )
}
function ThemeIcon({ theme }: { theme: Theme }) {
    return theme === "light" ? (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
    ) : (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
    )
}
function AskIcon() {
    return (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
    )
}
function VibeIcon() {
    return (
        <span
            aria-hidden
            style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: ACCENT,
                boxShadow: "0 0 0 2px var(--dbn-bar), 0 0 0 3px var(--db-line)",
            }}
        />
    )
}
function LockIcon() {
    return (
        <svg aria-hidden width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.7 }}>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
    )
}
function Address({ path, hash, size }: { path: string; hash: string; size: number }) {
    const rest = (path === "/" ? "" : path) + (hash ? (path === "/" ? "/#" : "#") + hash : "")
    const full = SITE_HOST + rest
    return (
        <div
            title={full}
            style={{
                flex: "1 1 auto",
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 7,
                height: size,
                padding: "0 12px",
                borderRadius: 999,
                background: "var(--dbn-field)",
                border: "1px solid var(--db-line)",
                color: "var(--db-text-2)",
                fontSize: 12.5,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
            }}
        >
            <LockIcon />
            <span style={{ display: "flex", minWidth: 0 }}>
                <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", flexShrink: 1 }}>
                    {SITE_HOST}
                </span>
                {rest && (
                    <span
                        style={{
                            color: "var(--db-text)",
                            flexShrink: 0,
                            maxWidth: "70%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {rest}
                    </span>
                )}
            </span>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function PortfolioNav(props: Props) {
    const {
        tabs = DEFAULT_TABS,
        breakpoint = 810,
        showAsk = true,
        showTheme = true,
        fontSize = 15,
        tabHeight = 40,
        tabPadding = 16,
    } = props
    const list = React.useMemo(
        () => (tabs && tabs.length ? tabs : DEFAULT_TABS).map(upgradeTab),
        [tabs]
    )
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const me = useRef(Symbol("nav")).current
    const [mounted, setMounted] = useState(false)
    const [active, setActive] = useState(false)
    const [narrow, setNarrow] = useState(false)
    const [open, setOpen] = useState(false)
    const [vibeOpen, setVibeOpen] = useState(false)
    const [path, setPath] = useState("/")
    const [activeHash, setActiveHash] = useState("")
    const [chatReady, setChatReady] = useState(false)
    const [reduced, setReduced] = useState(false)
    const [theme, setTheme] = useState<Theme>("dark")
    const hostRef = useRef<HTMLDivElement | null>(null)
    const btnRef = useRef<HTMLButtonElement | null>(null)
    const sheetRef = useRef<HTMLDivElement | null>(null)
    const barRef = useRef<HTMLDivElement | null>(null)
    const vibeRef = useRef<HTMLDivElement | null>(null)

    // Only the copy for the visible breakpoint draws (Framer mounts every breakpoint).
    useEffect(() => {
        if (typeof window === "undefined" || onCanvas) return
        let raf = 0
        const check = () => {
            raf = 0
            const el = hostRef.current
            const visible = !!el && el.getClientRects().length > 0
            if (visible && (!OWNER || OWNER === me)) {
                OWNER = me
                startTransition(() => setActive(true))
            } else {
                if (OWNER === me) OWNER = null
                startTransition(() => setActive(false))
            }
        }
        const onResize = () => {
            if (!raf) raf = window.requestAnimationFrame(check)
        }
        check()
        const t = window.setTimeout(check, 50)
        window.addEventListener("resize", onResize, { passive: true })
        return () => {
            window.clearTimeout(t)
            if (raf) window.cancelAnimationFrame(raf)
            window.removeEventListener("resize", onResize)
            if (OWNER === me) OWNER = null
        }
    }, [onCanvas, me])

    // Theme + environment. The theme is applied once; later timers only re-read page CSS if it grew.
    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
        const on = () => startTransition(() => setNarrow(mq.matches))
        on()
        mq.addEventListener("change", on)
        const saved = savedTheme()
        const timers: number[] = []
        const live = !onCanvas && active
        if (live) {
            applyTheme(saved)
            // Framer adds stylesheets as the page loads: re-pin only if the CSS actually changed.
            ;[400, 1500, 4000].forEach((ms) =>
                timers.push(
                    window.setTimeout(() => {
                        const before = sigCache
                        refreshSheets()
                        if (sigCache !== before && isLight()) schedulePass(true)
                    }, ms)
                )
            )
        }
        const onReady = () =>
            startTransition(() =>
                setChatReady((window as any).__dbChatReady === true)
            )
        window.addEventListener("db-chat-ready", onReady)
        const sys = window.matchMedia("(prefers-color-scheme: light)")
        const onSys = () => {
            if (savedTheme()) return
            if (live) applyTheme(null)
            startTransition(() => setTheme(systemTheme()))
        }
        sys.addEventListener("change", onSys)
        startTransition(() => {
            setMounted(true)
            setTheme(
                (document.documentElement.getAttribute("data-db-theme") as Theme) ||
                    saved ||
                    systemTheme()
            )
            setReduced(
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            )
            setChatReady((window as any).__dbChatReady === true)
        })
        try {
            const v = JSON.parse(localStorage.getItem("db_vibe") || "null")
            const r = document.documentElement
            if (v && v.accent && !r.style.getPropertyValue("--vibe-accent")) {
                r.style.setProperty("--vibe-a", v.a)
                r.style.setProperty("--vibe-b", v.b)
                r.style.setProperty("--vibe-c", v.c)
                r.style.setProperty("--vibe-accent", v.accent)
                r.setAttribute("data-vibe", v.id || "")
            }
        } catch {}
        if (live) {
            let el: HTMLElement | null = hostRef.current
            for (let i = 0; el && i < 4; i++) {
                el.style.pointerEvents = "none"
                const up: HTMLElement | null = el.parentElement
                if (!up || up.childElementCount !== 1) break
                el = up
            }
        }
        return () => {
            timers.forEach((t) => window.clearTimeout(t))
            mq.removeEventListener("change", on)
            sys.removeEventListener("change", onSys)
            window.removeEventListener("db-chat-ready", onReady)
        }
    }, [breakpoint, onCanvas, active])

    // Current path for the address bar: popstate/hashchange, plus a cheap 1s check while the tab is
    // visible (Framer's client-side navigation uses pushState, which fires no event).
    useEffect(() => {
        if (typeof window === "undefined" || onCanvas) return
        const read = () => setPath(readPath())
        read()
        const tick = window.setInterval(() => {
            if (!document.hidden) read()
        }, 1000)
        window.addEventListener("popstate", read)
        window.addEventListener("hashchange", read)
        return () => {
            window.clearInterval(tick)
            window.removeEventListener("popstate", read)
            window.removeEventListener("hashchange", read)
        }
    }, [onCanvas])

    // Section highlight for hash tabs. Sections are looked up once and cached; a scroll frame only
    // measures them.
    useEffect(() => {
        if (!mounted || !active || typeof window === "undefined") return
        const hashes = list
            .map((t) => splitHref(t.href))
            .filter((h) => h.hash && h.page === path)
            .map((h) => h.hash)
        if (!hashes.length) {
            startTransition(() => setActiveHash(""))
            return
        }
        const cache = new Map<string, HTMLElement>()
        const missAt = new Map<string, number>()
        const get = (h: string) => {
            const c = cache.get(h)
            if (c && c.isConnected) return c
            const now = Date.now()
            if (now - (missAt.get(h) || 0) < 1000) return null
            const el = findSection(h)
            if (el) cache.set(h, el)
            else missAt.set(h, now)
            return el
        }
        let raf = 0
        const check = () => {
            raf = 0
            const line = window.innerHeight * 0.4
            let found = ""
            for (const h of hashes) {
                const s = get(h)
                if (!s) continue
                const r = s.getBoundingClientRect()
                if (r.top <= line && r.bottom > line) found = h
            }
            if (
                !found &&
                window.innerHeight + window.scrollY >=
                    document.documentElement.scrollHeight - 4
            ) {
                for (const h of hashes) if (get(h)) found = h
            }
            startTransition(() => setActiveHash(found))
        }
        const onScroll = () => {
            if (!raf) raf = window.requestAnimationFrame(check)
        }
        const onResize = () => {
            cache.clear()
            missAt.clear()
            onScroll()
        }
        check()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onResize, { passive: true })
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onResize)
            if (raf) window.cancelAnimationFrame(raf)
        }
    }, [mounted, active, path, list])

    useEffect(() => {
        if (!narrow && open) startTransition(() => setOpen(false))
    }, [narrow, open])

    useEffect(() => {
        if (!open || typeof document === "undefined") return
        const prev = document.documentElement.style.overflow
        document.documentElement.style.overflow = "hidden"
        const first = sheetRef.current?.querySelector<HTMLElement>("a, button")
        const ft = window.setTimeout(() => first?.focus(), 20)
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") return close(true)
            if (e.key !== "Tab") return
            const nodes = [
                ...Array.from(
                    barRef.current?.querySelectorAll<HTMLElement>("a, button") || []
                ),
                ...Array.from(
                    sheetRef.current?.querySelectorAll<HTMLElement>("a, button") || []
                ),
            ]
            if (!nodes.length) return
            const i = nodes.indexOf(document.activeElement as HTMLElement)
            if (e.shiftKey && i <= 0) {
                e.preventDefault()
                nodes[nodes.length - 1].focus()
            } else if (!e.shiftKey && i === nodes.length - 1) {
                e.preventDefault()
                nodes[0].focus()
            }
        }
        window.addEventListener("keydown", onKey)
        return () => {
            window.clearTimeout(ft)
            document.documentElement.style.overflow = prev
            window.removeEventListener("keydown", onKey)
        }
    }, [open]) // eslint-disable-line

    // Vibe popover (only used when the page has no vibe chip): outside click / Escape closes.
    useEffect(() => {
        if (!vibeOpen) return
        const onDown = (e: PointerEvent) => {
            if (vibeRef.current && !vibeRef.current.contains(e.target as Node))
                setVibeOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setVibeOpen(false)
        }
        document.addEventListener("pointerdown", onDown, { passive: true })
        window.addEventListener("keydown", onKey)
        return () => {
            document.removeEventListener("pointerdown", onDown)
            window.removeEventListener("keydown", onKey)
        }
    }, [vibeOpen])

    useEffect(() => {
        const sync = (event: Event) => {
            const next = (event as CustomEvent).detail?.theme
            if (next === "light" || next === "dark") setTheme(next)
        }
        window.addEventListener("db-theme", sync)
        return () => window.removeEventListener("db-theme", sync)
    }, [])

    const scrollToSection = (el: HTMLElement, smooth: boolean) => {
        const off = narrow ? HEADER_OFFSET.narrow : HEADER_OFFSET.wide
        const top = el.getBoundingClientRect().top + window.scrollY - off
        window.scrollTo({
            top: Math.max(0, top),
            behavior: smooth ? "smooth" : "auto",
        })
    }
    const close = (refocus = false) => {
        startTransition(() => setOpen(false))
        if (refocus) setTimeout(() => btnRef.current?.focus(), 0)
    }
    const toggleTheme = () => {
        const current =
            (document.documentElement.getAttribute("data-db-theme") as Theme) ||
            theme
        const next: Theme = current === "light" ? "dark" : "light"
        try {
            localStorage.setItem("db_theme", next)
        } catch {}
        applyTheme(next)
        setTheme(next)
    }
    const onVibe = () => {
        const chip = vibeChip()
        if (chip) {
            close()
            setVibeOpen(false)
            chip.click()
            return
        }
        setVibeOpen((v) => !v)
    }
    const pickVibe = (v: Vibe) => {
        applyVibe(v)
        setVibeOpen(false)
    }
    const onTabClick = (href: string) => (e: React.MouseEvent) => {
        const { page, hash } = splitHref(href)
        if (!hash || page !== path) return
        const target = findSection(hash)
        if (!target) return
        e.preventDefault()
        close()
        scrollToSection(target, !reduced)
        try {
            window.history.replaceState(null, "", "#" + hash)
        } catch {}
        startTransition(() => setActiveHash(hash))
    }
    useEffect(() => {
        if (!mounted || !active || typeof window === "undefined") return
        const hash = window.location.hash.slice(1)
        if (!hash) return
        const t = window.setTimeout(() => {
            const target = findSection(hash)
            if (target) scrollToSection(target, false)
        }, 300)
        return () => window.clearTimeout(t)
    }, [mounted, active]) // eslint-disable-line
    const skipToContent = (e: React.MouseEvent) => {
        e.preventDefault()
        const target = document.querySelector<HTMLElement>("main, h1, h2")
        if (!target) return
        target.setAttribute("tabindex", "-1")
        target.focus()
        target.scrollIntoView({
            block: "start",
            behavior: reduced ? "auto" : "smooth",
        })
    }
    const askChat = () => {
        close()
        try {
            window.dispatchEvent(new CustomEvent("db-chat-open", { detail: {} }))
        } catch {}
    }

    const ease = reduced ? "none" : "background .15s, color .15s"
    const themeLabel =
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"
    const askOn = showAsk && chatReady
    const tabFont = Math.max(12, fontSize - 1)
    const tabH = Math.max(26, tabHeight - 10)
    const tabPad = Math.max(8, tabPadding - 2)

    const iconBtn = (
        label: string,
        onClick: () => void,
        child: React.ReactNode,
        size = 32,
        extra?: Record<string, any>
    ) => (
        <button
            type="button"
            className="dbnav-icon"
            onClick={onClick}
            aria-label={label}
            title={label}
            {...extra}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: size,
                height: size,
                borderRadius: 9,
                border: "none",
                background: "transparent",
                color: "var(--db-text-2)",
                cursor: "pointer",
                transition: ease,
                flexShrink: 0,
                padding: 0,
            }}
        >
            {child}
        </button>
    )

    const swatches = (
        <div role="group" aria-label="Color vibe" style={{ display: "flex", gap: 8 }}>
            {VIBES.map((v) => (
                <button
                    key={v.id}
                    type="button"
                    onClick={() => pickVibe(v)}
                    aria-label={`${v.name} vibe`}
                    title={v.name}
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        border: "2px solid var(--dbn-bar)",
                        boxShadow: "0 0 0 1px var(--db-line)",
                        background: v.accent,
                        cursor: "pointer",
                        padding: 0,
                    }}
                />
            ))}
        </div>
    )

    const vibeControl = (
        <div ref={vibeRef} style={{ position: "relative", display: "inline-flex" }}>
            {iconBtn("Change color vibe", onVibe, <VibeIcon />, 32, {
                "aria-expanded": vibeOpen,
            })}
            {vibeOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        padding: 10,
                        borderRadius: 14,
                        background: "var(--dbn-bar)",
                        border: "1px solid var(--db-glass-line)",
                        boxShadow: "var(--db-shadow)",
                        animation: reduced ? "none" : "dbnav-in .18s ease both",
                    }}
                >
                    {swatches}
                </div>
            )}
        </div>
    )

    const tools = (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            {vibeControl}
            {showTheme && iconBtn(themeLabel, toggleTheme, <ThemeIcon theme={theme} />)}
            {askOn && iconBtn("Ask about Dhwani", askChat, <AskIcon />)}
        </span>
    )

    const tabStrip = (
        <ul
            style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                alignItems: "flex-end",
                gap: 2,
                alignSelf: "stretch",
            }}
        >
            {list.map((t) => {
                const cur = isCurrent(t.href, path, activeHash)
                return (
                    <li key={t.href + t.label} style={{ display: "flex", alignItems: "flex-end" }}>
                        <a
                            className="dbnav-tab"
                            href={t.href}
                            onClick={onTabClick(t.href)}
                            aria-current={cur ? "page" : undefined}
                            style={{
                                position: "relative",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                                height: cur ? tabH + 4 : tabH,
                                marginBottom: cur ? 0 : 4,
                                padding: `0 ${tabPad}px`,
                                borderRadius: cur ? "10px 10px 0 0" : 8,
                                color: cur ? "var(--db-text)" : "var(--db-text-2)",
                                background: cur ? "var(--dbn-bar)" : "transparent",
                                textDecoration: "none",
                                fontSize: tabFont,
                                fontWeight: cur ? 500 : 400,
                                letterSpacing: "0.01em",
                                transition: ease,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {cur && (
                                <span
                                    aria-hidden
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: 3,
                                        background: ACCENT,
                                        flexShrink: 0,
                                    }}
                                />
                            )}
                            {t.label}
                        </a>
                    </li>
                )
            })}
        </ul>
    )

    const windowFrame: CSSProperties = {
        fontFamily: FONT,
        borderRadius: 14,
        overflow: "visible",
        background: "var(--dbn-strip)",
        border: "1px solid var(--db-glass-line)",
        boxShadow: "var(--db-shadow)",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
    }

    const browser = (
        <nav aria-label="Main" style={{ ...windowFrame, minWidth: 560 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    gap: 14,
                    height: tabH + 10,
                    padding: "0 12px 0 14px",
                }}
            >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                    <Lights />
                </span>
                {tabStrip}
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 44,
                    padding: "0 8px 0 10px",
                    background: "var(--dbn-bar)",
                    borderRadius: "0 0 13px 13px",
                }}
            >
                <Address path={path} hash={activeHash} size={30} />
                {tools}
            </div>
        </nav>
    )

    if (onCanvas) {
        return (
            <div data-dbnav="" style={{ display: "inline-block" }}>
                <style>{THEME_CSS + NAV_CSS}</style>
                {browser}
            </div>
        )
    }

    const desktop = (
        <div
            data-dbnav=""
            style={{
                position: "fixed",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2147480000,
            }}
        >
            {browser}
        </div>
    )

    const sheetRow: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 10,
        minHeight: 52,
        padding: "0 14px",
        borderRadius: 12,
        border: "none",
        background: "transparent",
        color: "var(--db-text)",
        fontFamily: FONT,
        fontSize: 16,
        fontWeight: 500,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
    }

    const phone = (
        <div
            data-dbnav=""
            style={{
                position: "fixed",
                top: 10,
                left: 12,
                right: 12,
                zIndex: 2147480000,
                fontFamily: FONT,
            }}
        >
            {open && (
                <div
                    aria-hidden
                    onClick={() => close()}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        zIndex: -1,
                    }}
                />
            )}
            <div
                ref={barRef}
                style={{
                    ...windowFrame,
                    background: "var(--dbn-bar)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    height: 48,
                    padding: "0 6px 0 12px",
                }}
            >
                <Lights size={9} gap={5} />
                <Address path={path} hash={activeHash} size={32} />
                <button
                    ref={btnRef}
                    type="button"
                    aria-expanded={open}
                    aria-controls="dbnav-sheet"
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() =>
                        open ? close(true) : startTransition(() => setOpen(true))
                    }
                    className="dbnav-icon"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        height: 38,
                        minWidth: 44,
                        padding: "0 10px",
                        borderRadius: 10,
                        border: "none",
                        background: open ? "var(--dbn-hover)" : "transparent",
                        color: "var(--db-text)",
                        fontFamily: FONT,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    <span aria-hidden style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
                        <span
                            style={{
                                width: 14,
                                height: 1.5,
                                background: "currentColor",
                                transform: open ? "translateY(2.25px) rotate(45deg)" : "none",
                                transition: reduced ? "none" : "transform .2s",
                            }}
                        />
                        <span
                            style={{
                                width: 14,
                                height: 1.5,
                                background: "currentColor",
                                transform: open ? "translateY(-2.25px) rotate(-45deg)" : "none",
                                transition: reduced ? "none" : "transform .2s",
                            }}
                        />
                    </span>
                    {open ? "close" : "menu"}
                </button>
            </div>
            {open && (
                <div
                    id="dbnav-sheet"
                    ref={sheetRef}
                    style={{
                        ...windowFrame,
                        background: "var(--dbn-bar)",
                        marginTop: 8,
                        borderRadius: 18,
                        padding: 8,
                        maxHeight: "calc(100vh - 80px)",
                        overflowY: "auto",
                        animation: reduced ? "none" : "dbnav-in .2s ease both",
                    }}
                >
                    <nav aria-label="Main">
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {list.map((t) => {
                                const cur = isCurrent(t.href, path, activeHash)
                                return (
                                    <li key={t.href + t.label}>
                                        <a
                                            href={t.href}
                                            onClick={(e) => {
                                                onTabClick(t.href)(e)
                                                close()
                                            }}
                                            aria-current={cur ? "page" : undefined}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                minHeight: 54,
                                                padding: "0 14px",
                                                borderRadius: 12,
                                                color: cur ? "var(--db-text)" : "var(--db-text-2)",
                                                background: cur ? "var(--db-line)" : "transparent",
                                                textDecoration: "none",
                                                fontSize: 21,
                                                fontWeight: cur ? 500 : 400,
                                            }}
                                        >
                                            {t.label}
                                            {cur ? (
                                                <span aria-hidden style={{ width: 8, height: 8, borderRadius: 4, background: ACCENT }} />
                                            ) : (
                                                <span aria-hidden style={{ color: "var(--db-text-2)", fontSize: 18 }}>→</span>
                                            )}
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                    <div
                        style={{
                            marginTop: 6,
                            paddingTop: 6,
                            borderTop: "1px solid var(--db-line)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        {showTheme && (
                            <button type="button" className="dbnav-icon" onClick={toggleTheme} style={sheetRow}>
                                <ThemeIcon theme={theme} />
                                {theme === "light" ? "dark mode" : "light mode"}
                            </button>
                        )}
                        <button
                            type="button"
                            className="dbnav-icon"
                            onClick={onVibe}
                            aria-expanded={vibeOpen}
                            style={sheetRow}
                        >
                            <VibeIcon />
                            change vibe
                        </button>
                        {vibeOpen && <div style={{ padding: "6px 14px 10px" }}>{swatches}</div>}
                        {askOn && (
                            <button
                                type="button"
                                onClick={askChat}
                                style={{ ...sheetRow, border: `1px solid ${ACCENT}`, marginTop: 4 }}
                            >
                                <span aria-hidden style={{ width: 10, height: 10, borderRadius: 5, background: ACCENT }} />
                                ask about Dhwani
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )

    const tree = (
        <>
            <div data-dbnav="">
                <a href="#" className="dbnav-skip" onClick={skipToContent}>
                    skip to content
                </a>
            </div>
            {narrow ? phone : desktop}
        </>
    )
    return (
        <div ref={hostRef} style={{ width: 1, height: 1 }}>
            {mounted && active && typeof document !== "undefined"
                ? createPortal(tree, document.body)
                : null}
        </div>
    )
}

addPropertyControls(PortfolioNav, {
    tabs: {
        type: ControlType.Array,
        title: "Links",
        control: {
            type: ControlType.Object,
            controls: {
                label: {
                    type: ControlType.String,
                    title: "Label",
                    defaultValue: "link",
                },
                href: {
                    type: ControlType.String,
                    title: "Link",
                    defaultValue: "/",
                },
            },
        },
        defaultValue: DEFAULT_TABS,
    },
    fontSize: {
        type: ControlType.Number,
        title: "Text size",
        min: 12,
        max: 20,
        step: 1,
        defaultValue: 15,
        unit: "px",
    },
    tabHeight: {
        type: ControlType.Number,
        title: "Tab height",
        min: 28,
        max: 52,
        step: 2,
        defaultValue: 40,
        unit: "px",
    },
    tabPadding: {
        type: ControlType.Number,
        title: "Tab padding",
        min: 6,
        max: 24,
        step: 1,
        defaultValue: 16,
        unit: "px",
    },
    showTheme: {
        type: ControlType.Boolean,
        title: "Light/dark button",
        defaultValue: true,
    },
    brand: {
        type: ControlType.String,
        title: "Phone title",
        defaultValue: "dhwani",
        hidden: () => true,
    },
    breakpoint: {
        type: ControlType.Number,
        title: "Phone below",
        min: 480,
        max: 1200,
        step: 10,
        defaultValue: 810,
        unit: "px",
    },
    showLights: {
        type: ControlType.Boolean,
        title: "Traffic lights",
        defaultValue: true,
        hidden: () => true,
    },
    showAsk: {
        type: ControlType.Boolean,
        title: "Ask button",
        defaultValue: true,
    },
    vibeGlow: {
        type: ControlType.Boolean,
        title: "Vibe glow",
        defaultValue: false,
        hidden: () => true,
    },
})
