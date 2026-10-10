// PortfolioNav v13 (Oct 10: AI Lab tab, connect → Home hiring band with header offset). v12: Dhwani's site nav + site-wide theme layer. Placed directly on each page (no
// NavBar wrapper) — Oct 2: "make the navbar component completely separate… don't overlap it".
// Light mode (Oct 2–3: "make all components RESPOND to light and dark mode, every single element
// must"): follows the visitor's OS; the sun/moon button overrides it and remembers the choice
// (localStorage "db_theme").
// v9: ONE source of truth. The nav reads Framer's own light/dark values for every color style
// (--token-*) from the page's stylesheets and pins the chosen set with !important, so every frame,
// text style and component that uses a color style flips together with the code components
// (which read --db-*).
// v10: inline hand-colored white text flips to the theme text colors in light mode; MapGame follows.
// v11 (Oct 3): auto-theme for layers colored by hand inside Framer (frames, text, borders, design
// components). In light mode the nav scans Framer's generated layer CSS and remaps near-black
// backgrounds to the theme background/surface, white text to the theme text, and translucent
// white fills/borders to translucent black. Images and accent colors are left alone.
// v12 (Oct 3): "all the font still doesnt change". Stylesheet reading can miss Framer's color
// styles (page background stayed black). Light mode now also checks what the browser actually
// paints: any element whose computed background is near-black, or whose text is near-white, is
// flipped inline (marked data-db-flip so dark mode puts it back). Re-runs when the page changes.
// Only the copy for the visible breakpoint draws (Framer mounts all breakpoints → was a double nav).
// On the Framer canvas it draws inline. "work" stays highlighted on case pages (/work/*, /projects/*).
// Sections are found by layer name OR heading text ("connect" finds "Send a signal.").
// Oct 4: light mode also darkens very light, low-saturation logo images (layer or alt named
// "logo", e.g. the white GM mark) so they don't vanish on the light background.
import * as React from "react"
import { startTransition, useEffect, useRef, useState, type CSSProperties } from "react"
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
const DEFAULT_TABS: Tab[] = [
    { label: "home", href: "/" },
    { label: "about me", href: "/about-me" },
    { label: "work", href: "/#work" },
    { label: "AI Lab", href: "/lab" },
    { label: "connect", href: "/#hiring" },
]
// Oct 10 ("move my game to ai lab and make the play section ai lab — connect needs to take people to
// hiring for product section"): "play" is now "AI Lab" (/lab) and "connect" lands on Home's hiring band
// (ConnectBand, wrapped in a layer named "hiring"). Instances that still carry the old links in their
// Links list are upgraded here too, so every page's nav agrees without re-editing each instance.
function upgradeTab(t: Tab): Tab {
    const label = String((t && t.label) || "").trim()
    const href = String((t && t.href) || "").trim()
    if (/^play$/i.test(label)) return { label: "AI Lab", href: "/lab" }
    if (/^connect$/i.test(label) && (href === "" || /^\/?#contact$/.test(href))) return { label, href: "/#hiring" }
    return t
}
// Scroll targets sit under the fixed nav pill: leave room for it.
const HEADER_OFFSET = { wide: 96, narrow: 80 }
const SECTION_TEXT: Record<string, string[]> = {
    contact: ["send a signal.", "send a signal"],
    hiring: ["hiring for product, ux or experience design"],
    work: ["selected work"],
}

const LIGHT = `--db-bg:#FFFFFF;--db-surface:#EEEEEE;--db-surface-2:#E0E0E0;--db-text:#0A0A0A;--db-text-2:rgba(0,0,0,0.62);--db-line:rgba(0,0,0,0.12);--db-glass:rgba(255,255,255,0.86);--db-glass-line:rgba(0,0,0,0.10);--db-shadow:0 18px 40px -22px rgba(0,0,0,0.35);--db-accent:#C23D08;--db-on-accent:#FFFFFF;--db-glow-blend:multiply;--db-glow-opacity:0.22;--db-aurora-opacity:0.55;color-scheme:light;`
const DARK = `--db-bg:#000000;--db-surface:#111111;--db-surface-2:#1F1F1F;--db-text:#FFFFFF;--db-text-2:rgba(255,255,255,0.6);--db-line:rgba(255,255,255,0.1);--db-glass:rgba(18,18,18,0.82);--db-glass-line:rgba(255,255,255,0.10);--db-shadow:0 18px 40px -18px rgba(0,0,0,0.9);--db-accent:var(--vibe-accent,#F3500F);--db-on-accent:#0A0A0A;--db-glow-blend:screen;--db-glow-opacity:0.55;--db-aurora-opacity:1;color-scheme:dark;`
const LIGHT_VIBES = `[data-vibe="goblue"]{--db-accent:#0369A1}[data-vibe="nightshift"]{--db-accent:#5B3FD6}[data-vibe="afterhours"]{--db-accent:#C2185B}[data-vibe="greenroom"]{--db-accent:#854D0E}`
const L = `:root[data-db-theme="light"]`
const whiteSel = ["rgb(255, 255, 255)", "rgb(250, 250, 250)", "rgb(245, 245, 245)", "rgb(245, 245, 243)"]
    .flatMap((c) => [`${L} [style*="--framer-text-color:${c}"]`, `${L} [style*="--framer-text-color: ${c}"]`])
    .join(",")
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
:root[data-db-theme="light"]${LIGHT_VIBES.replace(/\}\[/g, "}:root[data-db-theme=\"light\"][")}
${FIXES}
`
const ACCENT = "var(--db-accent, #F3500F)"

function systemTheme(): Theme {
    if (typeof window === "undefined") return "dark"
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}
function savedTheme(): Theme | null {
    try {
        const t = localStorage.getItem("db_theme")
        return t === "light" || t === "dark" ? t : null
    } catch {
        return null
    }
}

// ---- Framer color styles: read both value sets from the page CSS, pin the chosen one ----
type TokenSet = { sel: Set<string>; light: Record<string, string>; dark: Record<string, string> }
const OWN = ["db-theme-pin", "db-auto-theme"]
function eachRule(fn: (rule: CSSStyleRule, mode: Theme | null) => void) {
    if (typeof document === "undefined") return
    const walk = (rules: CSSRuleList, mode: Theme | null) => {
        for (let i = 0; i < rules.length; i++) {
            const r = rules[i] as any
            if (r.type === 1) fn(r as CSSStyleRule, mode)
            else if (r.type === 4) {
                const c = String(r.conditionText || (r.media && r.media.mediaText) || "")
                const m: Theme | null = /prefers-color-scheme:\s*dark/.test(c) ? "dark" : /prefers-color-scheme:\s*light/.test(c) ? "light" : mode
                walk(r.cssRules, m)
            } else if (r.cssRules) walk(r.cssRules, mode)
        }
    }
    const sheets = document.styleSheets
    for (let i = 0; i < sheets.length; i++) {
        const sh = sheets[i]
        const id = sh.ownerNode && (sh.ownerNode as HTMLElement).id
        if (id && OWN.indexOf(id) !== -1) continue
        try {
            walk(sh.cssRules, null)
        } catch {}
    }
}
function readTokens(): TokenSet {
    const out: TokenSet = { sel: new Set(), light: {}, dark: {} }
    eachRule((rule, mode) => {
        const st = rule.style
        let has = false
        for (let i = 0; i < st.length; i++) {
            const p = st[i]
            if (!p.startsWith("--token-")) continue
            has = true
            const v = st.getPropertyValue(p).trim()
            const sel = rule.selectorText || ""
            const m: Theme = mode || (/dark/.test(sel) ? "dark" : "light")
            if (m === "dark") out.dark[p] = v
            else if (!(p in out.light) || mode === "light") out.light[p] = v
        }
        if (has) {
            const base = (rule.selectorText || "body").replace(/:not\([^)]*\)/g, "").replace(/\[data-framer-theme[^\]]*\]/g, "").trim()
            base.split(",").forEach((s) => { const t = s.trim(); if (t) out.sel.add(t) })
        }
    })
    return out
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
function pinTokens(theme: Theme) {
    if (typeof document === "undefined") return
    const t = readTokens()
    const vals = theme === "dark" ? { ...t.light, ...t.dark } : t.light
    const keys = Object.keys(vals)
    if (!keys.length) return
    const body = keys.map((k) => `${k}:${vals[k]} !important;`).join("")
    const sels = Array.from(t.sel)
    if (!sels.includes("body")) sels.push("body")
    styleTag("db-theme-pin", `${sels.join(",")}{${body}}`)
}

// ---- Auto-theme: remap hand-picked dark-mode colors on Framer layers for light mode ----
type RGBA = { r: number; g: number; b: number; a: number }
function parseColor(v: string): RGBA | null {
    const m = v.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/)
    if (m) {
        const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4])
        return { r: +m[1], g: +m[2], b: +m[3], a }
    }
    const h = v.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    if (h) {
        const s = h[1].length === 3 ? h[1].split("").map((c) => c + c).join("") : h[1]
        const n = parseInt(s, 16)
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
    }
    if (/^\s*(white)\s*$/i.test(v)) return { r: 255, g: 255, b: 255, a: 1 }
    if (/^\s*(black)\s*$/i.test(v)) return { r: 0, g: 0, b: 0, a: 1 }
    return null
}
const isWhiteish = (c: RGBA) => Math.min(c.r, c.g, c.b) >= 225 && Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 20
const isBlackish = (c: RGBA, lim: number) => Math.max(c.r, c.g, c.b) <= lim && Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b) < 16
function mapBg(c: RGBA): string | null {
    if (c.a >= 0.5 && isBlackish(c, 14)) return "var(--db-bg)"
    if (c.a >= 0.5 && isBlackish(c, 30)) return "var(--db-surface)"
    if (c.a >= 0.5 && isBlackish(c, 56)) return "var(--db-surface-2)"
    if (c.a > 0 && c.a < 0.35 && isWhiteish(c)) return `rgba(0,0,0,${Math.min(0.12, c.a * 1.2).toFixed(3)})`
    if (c.a > 0 && c.a < 0.5 && isBlackish(c, 30)) return `rgba(255,255,255,${c.a.toFixed(3)})`
    return null
}
function mapText(c: RGBA): string | null {
    if (!isWhiteish(c)) return null
    return c.a >= 0.85 ? "var(--db-text)" : `rgba(10,10,10,${Math.max(0.62, c.a).toFixed(3)})`
}
function mapLine(c: RGBA): string | null {
    if (isWhiteish(c) && c.a < 0.6) return `rgba(0,0,0,${Math.max(0.1, c.a).toFixed(3)})`
    if (isWhiteish(c)) return "var(--db-text)"
    return null
}
const BG_PROPS = ["background-color"]
const TEXT_PROPS = ["color", "--framer-text-color", "fill", "stroke"]
const LINE_PROPS = ["border-color", "border-top-color", "border-right-color", "border-bottom-color", "border-left-color", "--border-color", "outline-color"]
let autoCache = ""
function autoTheme() {
    if (typeof document === "undefined") return
    const out: string[] = []
    eachRule((rule) => {
        const sel = rule.selectorText || ""
        if (sel.indexOf("framer-") === -1 || /data-db|dbnav|data-csnav/.test(sel)) return
        const st = rule.style
        const decls: string[] = []
        const handle = (props: string[], map: (c: RGBA) => string | null) => {
            for (const p of props) {
                const v = st.getPropertyValue(p)
                if (!v || v.indexOf("var(") !== -1) continue
                const c = parseColor(v)
                if (!c) continue
                const m = map(c)
                if (m) decls.push(`${p}:${m} !important`)
            }
        }
        handle(BG_PROPS, mapBg)
        handle(TEXT_PROPS, mapText)
        handle(LINE_PROPS, mapLine)
        if (!decls.length) return
        const scoped = sel.split(",").map((s) => `${L} ${s.trim()}`).join(",")
        out.push(`${scoped}{${decls.join(";")}}`)
    })
    const css = out.join("\n")
    if (css === autoCache) return
    autoCache = css
    styleTag("db-auto-theme", css)
}

// ---- v12 DOM pass: flip what is actually painted, independent of stylesheet access ----
const SKIP = "img,video,canvas,svg,picture,iframe,[data-dbnav],[data-dbnav] *,[data-db-keep],[data-db-keep] *"
function rgbaOf(v: string): RGBA | null {
    if (!v || v === "transparent") return null
    return parseColor(v)
}
function unflip() {
    if (typeof document === "undefined") return
    document.querySelectorAll<HTMLElement>("[data-db-flip]").forEach((el) => {
        const k = el.getAttribute("data-db-flip") || ""
        if (k.indexOf("b") !== -1) el.style.removeProperty("background-color")
        if (k.indexOf("t") !== -1) {
            el.style.removeProperty("color")
            el.style.removeProperty("--framer-text-color")
        }
        el.removeAttribute("data-db-flip")
    })
}
function domFlip() {
    if (typeof document === "undefined") return
    if (document.documentElement.getAttribute("data-db-theme") !== "light") return
    const root = document.getElementById("main") || document.body
    const all = root.querySelectorAll<HTMLElement>("*")
    for (let i = 0; i < all.length; i++) {
        const el = all[i]
        if (el.hasAttribute("data-db-flip") || el.matches(SKIP)) continue
        const cs = getComputedStyle(el)
        let k = ""
        const bg = rgbaOf(cs.backgroundColor)
        if (bg) {
            const m = mapBg(bg)
            if (m) {
                el.style.setProperty("background-color", m, "important")
                k += "b"
            }
        }
        const tc = rgbaOf(cs.color)
        if (tc && isWhiteish(tc) && el.childNodes.length) {
            let hasText = false
            for (let j = 0; j < el.childNodes.length; j++) if (el.childNodes[j].nodeType === 3 && (el.childNodes[j].textContent || "").trim()) hasText = true
            if (hasText || /^(H[1-6]|P|SPAN|A|LI|BUTTON|LABEL)$/.test(el.tagName)) {
                const m = mapText(tc)
                if (m) {
                    el.style.setProperty("color", m, "important")
                    el.style.setProperty("--framer-text-color", m, "important")
                    k += "t"
                }
            }
        }
        if (k) el.setAttribute("data-db-flip", k)
    }
}
let flipObs: MutationObserver | null = null
let flipTimer = 0
function watchFlip(on: boolean) {
    if (typeof window === "undefined") return
    if (!on) {
        if (flipObs) flipObs.disconnect()
        flipObs = null
        return
    }
    if (flipObs) return
    flipObs = new MutationObserver(() => {
        if (flipTimer) return
        flipTimer = window.setTimeout(() => {
            flipTimer = 0
            domFlip()
            logoFix()
        }, 400)
    })
    flipObs.observe(document.getElementById("main") || document.body, { childList: true, subtree: true })
}

// ---- Oct 4: light-mode logo fix ----
// White logos (e.g. the GM mark on case-study heroes) vanish on the light background. In light
// mode, <img>s (and background-image layers) whose nearest named Framer layer contains "logo", or
// whose alt contains "logo", are sampled once via an offscreen canvas. Very light (mean luminance
// > 0.82), low-saturation (< 0.18) marks with some transparency get darkened with a filter; dark
// mode puts them back. Results are cached per src; tainted or failed samples are skipped. Never throws.
const LOGO_ATTR = "data-db-logo"
const logoCache: Record<string, boolean | "pending"> = {}
function isLogoEl(el: HTMLElement): boolean {
    if (/logo/i.test(el.getAttribute("alt") || "")) return true
    const named = el.closest("[data-framer-name]")
    return !!named && /logo/i.test(named.getAttribute("data-framer-name") || "")
}
function bgUrlOf(el: HTMLElement): string {
    const v = getComputedStyle(el).backgroundImage || ""
    const m = v.match(/url\(["']?([^"')]+)["']?\)/)
    return m ? m[1] : ""
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
                    const d = ctx.getImageData(0, 0, w, h).data // throws if the canvas is tainted
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
                    // needs some transparency, so an opaque white photo/box is never blacked out
                    if (n > 0 && clear / (n + clear) > 0.03) light = lum / n > 0.82 && sat / n < 0.18
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
function logoOn(el: HTMLElement, src: string) {
    if (el.getAttribute(LOGO_ATTR) === src) return
    if (!el.hasAttribute(LOGO_ATTR)) {
        el.setAttribute("data-db-logo-f", el.style.getPropertyValue("filter"))
        el.setAttribute("data-db-logo-o", el.style.getPropertyValue("opacity"))
    }
    el.setAttribute(LOGO_ATTR, src)
    el.style.setProperty("filter", "brightness(0) saturate(100%)", "important")
    el.style.setProperty("opacity", "0.86", "important")
}
function logoOff(el: HTMLElement) {
    const f = el.getAttribute("data-db-logo-f") || ""
    const o = el.getAttribute("data-db-logo-o") || ""
    if (f) el.style.setProperty("filter", f)
    else el.style.removeProperty("filter")
    if (o) el.style.setProperty("opacity", o)
    else el.style.removeProperty("opacity")
    el.removeAttribute(LOGO_ATTR)
    el.removeAttribute("data-db-logo-f")
    el.removeAttribute("data-db-logo-o")
}
function logoUnfix() {
    if (typeof document === "undefined") return
    try {
        document.querySelectorAll<HTMLElement>(`[${LOGO_ATTR}]`).forEach(logoOff)
    } catch {}
}
function logoFix() {
    if (typeof document === "undefined") return
    try {
        if (document.documentElement.getAttribute("data-db-theme") !== "light") return
        const root = document.getElementById("main") || document.body
        const found: Array<[HTMLElement, string]> = []
        root.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
            if (img.closest("[data-dbnav]") || !isLogoEl(img)) return
            const src = img.currentSrc || img.src
            if (src) found.push([img, src])
        })
        root.querySelectorAll<HTMLElement>("[data-framer-name]").forEach((named) => {
            if (!/logo/i.test(named.getAttribute("data-framer-name") || "")) return
            const els = [named, ...Array.from(named.querySelectorAll<HTMLElement>("div, span, a, figure")).slice(0, 24)]
            els.forEach((el) => {
                const src = bgUrlOf(el)
                if (src) found.push([el, src])
            })
        })
        found.forEach(([el, src]) => {
            const hit = logoCache[src]
            if (hit === true) return logoOn(el, src)
            if (el.hasAttribute(LOGO_ATTR) && el.getAttribute(LOGO_ATTR) !== src) logoOff(el)
            if (hit === false || hit === "pending") return
            logoCache[src] = "pending"
            sampleLogo(src, (light) => {
                logoCache[src] = light
                if (light) logoFix()
            })
        })
    } catch {}
}

function applyTheme(t: Theme | null) {
    if (typeof document === "undefined") return
    const resolved: Theme = t || systemTheme()
    const html = document.documentElement
    html.setAttribute("data-db-theme", resolved)
    document.body.setAttribute("data-framer-theme", resolved)
    html.style.colorScheme = resolved
    pinTokens(resolved)
    autoTheme()
    if (resolved === "light") {
        window.requestAnimationFrame(() => {
            domFlip()
            logoFix()
        })
        watchFlip(true)
    } else {
        watchFlip(false)
        unflip()
        logoUnfix()
    }
    try {
        window.dispatchEvent(new CustomEvent("db-theme", { detail: { theme: resolved } }))
    } catch {}
}

function splitHref(href: string) {
    const i = href.indexOf("#")
    if (i === -1) return { page: href.replace(/\/$/, "") || "/", hash: "" }
    return { page: href.slice(0, i).replace(/\/$/, "") || "/", hash: href.slice(i + 1) }
}
function isCurrent(href: string, path: string, activeHash: string) {
    const { page, hash } = splitHref(href)
    if (hash) {
        if (hash === "work" && (path.startsWith("/work") || path.startsWith("/projects"))) return true
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
        if ((named[i].getAttribute("data-framer-name") || "").toLowerCase() === want && isVisible(named[i])) return named[i]
    }
    const texts = SECTION_TEXT[want]
    if (texts) {
        const nodes = document.querySelectorAll<HTMLElement>("h1, h2, h3, p")
        for (let i = 0; i < nodes.length; i++) {
            const t = (nodes[i].textContent || "").trim().toLowerCase()
            if (texts.some((x) => t === x || t.startsWith(x)) && isVisible(nodes[i])) {
                let el: HTMLElement | null = nodes[i]
                while (el && el.parentElement && el.getBoundingClientRect().width < window.innerWidth * 0.5) el = el.parentElement
                return el || nodes[i]
            }
        }
    }
    return null
}

let OWNER: symbol | null = null

function Lights() {
    return (
        <span aria-hidden style={{ display: "inline-flex", gap: 6, padding: "0 4px" }}>
            {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c }} />
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

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function PortfolioNav(props: Props) {
    const { tabs = DEFAULT_TABS, breakpoint = 810, showLights = true, showAsk = true, showTheme = true, brand = "dhwani", vibeGlow = true, fontSize = 15, tabHeight = 40, tabPadding = 16 } = props
    const list = React.useMemo(() => (tabs && tabs.length ? tabs : DEFAULT_TABS).map(upgradeTab), [tabs])
    const onCanvas = RenderTarget.current() === RenderTarget.canvas
    const me = useRef(Symbol("nav")).current
    const [mounted, setMounted] = useState(false)
    const [active, setActive] = useState(false)
    const [narrow, setNarrow] = useState(false)
    const [open, setOpen] = useState(false)
    const [path, setPath] = useState("/")
    const [activeHash, setActiveHash] = useState("")
    const [chatReady, setChatReady] = useState(false)
    const [reduced, setReduced] = useState(false)
    const [theme, setTheme] = useState<Theme>("dark")
    const hostRef = useRef<HTMLDivElement | null>(null)
    const btnRef = useRef<HTMLButtonElement | null>(null)
    const sheetRef = useRef<HTMLDivElement | null>(null)
    const barRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (typeof window === "undefined" || onCanvas) return
        const check = () => {
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
        check()
        const t = window.setTimeout(check, 50)
        window.addEventListener("resize", check)
        return () => {
            window.clearTimeout(t)
            window.removeEventListener("resize", check)
            if (OWNER === me) OWNER = null
        }
    }, [onCanvas, me])

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
        const on = () => startTransition(() => setNarrow(mq.matches))
        on()
        mq.addEventListener("change", on)
        const saved = savedTheme()
        const timers: number[] = []
        if (!onCanvas) {
            applyTheme(saved)
            // Framer adds stylesheets as the page loads; pin again once they're in.
            ;[250, 1200, 3000].forEach((ms) => timers.push(window.setTimeout(() => applyTheme(savedTheme()), ms)))
        }
        const onReady = () => {
            if (!onCanvas) applyTheme(savedTheme())
            startTransition(() => setChatReady((window as any).__dbChatReady === true))
        }
        window.addEventListener("db-chat-ready", onReady)
        const sys = window.matchMedia("(prefers-color-scheme: light)")
        const onSys = () => {
            if (savedTheme()) return
            if (!onCanvas) applyTheme(null)
            startTransition(() => setTheme(systemTheme()))
        }
        sys.addEventListener("change", onSys)
        startTransition(() => {
            setMounted(true)
            setTheme(saved || systemTheme())
            setPath(window.location.pathname.replace(/\/$/, "") || "/")
            setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
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
        if (!onCanvas) {
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
    }, [breakpoint, onCanvas])

    useEffect(() => {
        if (!mounted || !active || typeof window === "undefined") return
        const hashes = list.map((t) => splitHref(t.href)).filter((h) => h.hash && h.page === path).map((h) => h.hash)
        if (!hashes.length) return
        let raf = 0
        const check = () => {
            raf = 0
            const line = window.innerHeight * 0.4
            let found = ""
            for (const h of hashes) {
                const s = findSection(h)
                if (!s) continue
                const r = s.getBoundingClientRect()
                if (r.top <= line && r.bottom > line) found = h
            }
            if (!found && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
                for (const h of hashes) if (findSection(h)) found = h
            }
            startTransition(() => setActiveHash(found))
        }
        const onScroll = () => {
            if (!raf) raf = window.requestAnimationFrame(check)
        }
        check()
        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("resize", onScroll)
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("resize", onScroll)
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
        setTimeout(() => first?.focus(), 20)
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") return close(true)
            if (e.key !== "Tab") return
            const nodes = [...Array.from(barRef.current?.querySelectorAll<HTMLElement>("a, button") || []), ...Array.from(sheetRef.current?.querySelectorAll<HTMLElement>("a, button") || [])]
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
            document.documentElement.style.overflow = prev
            window.removeEventListener("keydown", onKey)
        }
    }, [open]) // eslint-disable-line

    const scrollToSection = (el: HTMLElement, smooth: boolean) => {
        const off = narrow ? HEADER_OFFSET.narrow : HEADER_OFFSET.wide
        const top = el.getBoundingClientRect().top + window.scrollY - off
        window.scrollTo({ top: Math.max(0, top), behavior: smooth ? "smooth" : "auto" })
    }
    const close = (refocus = false) => {
        startTransition(() => setOpen(false))
        if (refocus) setTimeout(() => btnRef.current?.focus(), 0)
    }
    const toggleTheme = () => {
        const next: Theme = theme === "light" ? "dark" : "light"
        try {
            localStorage.setItem("db_theme", next)
        } catch {}
        applyTheme(next)
        startTransition(() => setTheme(next))
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
    }, [mounted, active])
    const skipToContent = (e: React.MouseEvent) => {
        e.preventDefault()
        const target = document.querySelector<HTMLElement>("main, h1, h2")
        if (!target) return
        target.setAttribute("tabindex", "-1")
        target.focus()
        target.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" })
    }
    const askChat = () => {
        close()
        try {
            window.dispatchEvent(new CustomEvent("db-chat-open", { detail: {} }))
        } catch {}
    }

    const glass: CSSProperties = { background: "var(--db-glass)", backdropFilter: "blur(18px) saturate(140%)", WebkitBackdropFilter: "blur(18px) saturate(140%)", border: "1px solid var(--db-glass-line)", boxShadow: "var(--db-shadow)" }
    const ease = reduced ? "none" : "background .2s, color .2s"
    const themeLabel = theme === "light" ? "Switch to dark mode" : "Switch to light mode"

    const css = (
        <style>{`
            ${THEME_CSS}
            [data-dbnav] a:focus-visible, [data-dbnav] button:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
            [data-dbnav] .dbnav-tab:hover, [data-dbnav] .dbnav-icon:hover { color: var(--db-text); background: var(--db-line); }
            [data-dbnav] .dbnav-skip { position: fixed; left: 12px; top: -80px; z-index: 2147483001; padding: 12px 16px; border-radius: 12px; background: var(--db-text); color: var(--db-bg); font: 600 14px ${FONT}; text-decoration: none; }
            [data-dbnav] .dbnav-skip:focus { top: 12px; }
            @keyframes dbnav-breathe { 0%,100% { transform: scale(1); opacity: .35 } 50% { transform: scale(1.12); opacity: .55 } }
            @keyframes dbnav-in { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
        `}</style>
    )

    const themeBtn = (size: number) =>
        showTheme && (
            <button type="button" className="dbnav-icon" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: 999, border: "none", background: "transparent", color: "var(--db-text-2)", cursor: "pointer", transition: ease, flexShrink: 0 }}>
                <ThemeIcon theme={theme} />
            </button>
        )

    const pill = (
        <nav aria-label="Main" style={{ ...glass, display: "flex", alignItems: "center", gap: 6, padding: "6px 8px 6px 14px", borderRadius: 999, fontFamily: FONT }}>
            {showLights && <Lights />}
            {showLights && <span aria-hidden style={{ width: 1, height: 18, background: "var(--db-line)", margin: "0 6px" }} />}
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 2 }}>
                {list.map((t) => {
                    const cur = isCurrent(t.href, path, activeHash)
                    return (
                        <li key={t.href + t.label}>
                            <a className="dbnav-tab" href={t.href} onClick={onTabClick(t.href)} aria-current={cur ? "page" : undefined} style={{ position: "relative", display: "inline-flex", alignItems: "center", minHeight: tabHeight, padding: `0 ${tabPadding}px`, borderRadius: 999, color: cur ? "var(--db-text)" : "var(--db-text-2)", background: cur ? "var(--db-line)" : "transparent", textDecoration: "none", fontSize, fontWeight: cur ? 500 : 400, letterSpacing: "0.01em", transition: ease, whiteSpace: "nowrap" }}>
                                {t.label}
                                {cur && <span aria-hidden style={{ position: "absolute", left: "50%", bottom: 5, width: 4, height: 4, marginLeft: -2, borderRadius: 2, background: ACCENT }} />}
                            </a>
                        </li>
                    )
                })}
            </ul>
            {showTheme && <span aria-hidden style={{ width: 1, height: 18, background: "var(--db-line)", margin: "0 2px" }} />}
            {themeBtn(tabHeight)}
        </nav>
    )

    if (onCanvas) {
        return (
            <div data-dbnav="" style={{ display: "inline-block" }}>
                {css}
                {pill}
            </div>
        )
    }

    const desktop = (
        <div data-dbnav="" style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 2147480000 }}>
            {pill}
        </div>
    )

    const phone = (
        <div data-dbnav="" style={{ position: "fixed", top: 12, left: 12, right: 12, zIndex: 2147480000, fontFamily: FONT }}>
            {open && <div aria-hidden onClick={() => close()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: -1 }} />}
            <div ref={barRef} style={{ ...glass, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 52, padding: "4px 4px 4px 16px", borderRadius: 999 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    {showLights && <Lights />}
                    <a href="/" style={{ color: "var(--db-text)", textDecoration: "none", fontSize: 15, fontWeight: 500, whiteSpace: "nowrap", padding: "10px 4px" }}>
                        {brand}
                    </a>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    {themeBtn(44)}
                    <button ref={btnRef} type="button" aria-expanded={open} aria-controls="dbnav-sheet" onClick={() => (open ? close(true) : startTransition(() => setOpen(true)))} style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, minWidth: 44, padding: "0 16px", borderRadius: 999, border: "1px solid var(--db-glass-line)", background: open ? "var(--db-line)" : "transparent", color: "var(--db-text)", fontFamily: FONT, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                        <span aria-hidden style={{ display: "inline-flex", flexDirection: "column", gap: 3 }}>
                            <span style={{ width: 14, height: 1.5, background: "currentColor", transform: open ? "translateY(2.25px) rotate(45deg)" : "none", transition: reduced ? "none" : "transform .2s" }} />
                            <span style={{ width: 14, height: 1.5, background: "currentColor", transform: open ? "translateY(-2.25px) rotate(-45deg)" : "none", transition: reduced ? "none" : "transform .2s" }} />
                        </span>
                        {open ? "close" : "menu"}
                    </button>
                </span>
            </div>
            {open && (
                <div id="dbnav-sheet" ref={sheetRef} style={{ ...glass, marginTop: 8, borderRadius: 24, padding: 8, maxHeight: "calc(100vh - 92px)", overflowY: "auto", animation: reduced ? "none" : "dbnav-in .22s ease both" }}>
                    <nav aria-label="Main">
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {list.map((t) => {
                                const cur = isCurrent(t.href, path, activeHash)
                                return (
                                    <li key={t.href + t.label}>
                                        <a href={t.href} onClick={(e) => { onTabClick(t.href)(e); close() }} aria-current={cur ? "page" : undefined} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 56, padding: "0 16px", borderRadius: 16, color: cur ? "var(--db-text)" : "var(--db-text-2)", background: cur ? "var(--db-line)" : "transparent", textDecoration: "none", fontSize: 22, fontWeight: cur ? 500 : 400 }}>
                                            {t.label}
                                            {cur ? <span aria-hidden style={{ width: 8, height: 8, borderRadius: 4, background: ACCENT }} /> : <span aria-hidden style={{ color: "var(--db-text-2)", fontSize: 18 }}>→</span>}
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                    {showAsk && chatReady && (
                        <button type="button" onClick={askChat} style={{ marginTop: 6, width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 56, padding: "0 16px", borderRadius: 16, border: `1px solid ${ACCENT}`, background: "transparent", color: "var(--db-text)", fontFamily: FONT, fontSize: 16, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>
                            <span aria-hidden style={{ width: 10, height: 10, borderRadius: 5, background: ACCENT }} />
                            ask about Dhwani
                        </button>
                    )}
                </div>
            )}
        </div>
    )

    const tree = (
        <>
            {vibeGlow && (
                <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2147479000, mixBlendMode: "var(--db-glow-blend)" as any, opacity: "var(--db-glow-opacity)" as any }}>
                    <div style={{ position: "absolute", left: "-15vw", top: "-25vh", width: "60vw", height: "60vh", borderRadius: "50%", background: "radial-gradient(closest-side, var(--vibe-b, rgba(243,80,15,.5)), transparent)", filter: "blur(60px)", opacity: 0.45, animation: reduced ? "none" : "dbnav-breathe 9s ease-in-out infinite" }} />
                    <div style={{ position: "absolute", right: "-20vw", bottom: "-30vh", width: "65vw", height: "65vh", borderRadius: "50%", background: "radial-gradient(closest-side, var(--vibe-a, rgba(255,140,60,.38)), transparent)", filter: "blur(70px)", opacity: 0.35, animation: reduced ? "none" : "dbnav-breathe 11s ease-in-out -4s infinite" }} />
                </div>
            )}
            <div data-dbnav="">
                {css}
                <a href="#" className="dbnav-skip" onClick={skipToContent}>
                    skip to content
                </a>
            </div>
            {narrow ? phone : desktop}
        </>
    )
    return <div ref={hostRef} style={{ width: 1, height: 1 }}>{mounted && active && typeof document !== "undefined" ? createPortal(tree, document.body) : null}</div>
}

addPropertyControls(PortfolioNav, {
    tabs: {
        type: ControlType.Array,
        title: "Links",
        control: { type: ControlType.Object, controls: { label: { type: ControlType.String, title: "Label", defaultValue: "link" }, href: { type: ControlType.String, title: "Link", defaultValue: "/" } } },
        defaultValue: DEFAULT_TABS,
    },
    fontSize: { type: ControlType.Number, title: "Text size", min: 12, max: 20, step: 1, defaultValue: 15, unit: "px" },
    tabHeight: { type: ControlType.Number, title: "Tab height", min: 28, max: 52, step: 2, defaultValue: 40, unit: "px" },
    tabPadding: { type: ControlType.Number, title: "Tab padding", min: 6, max: 24, step: 1, defaultValue: 16, unit: "px" },
    showTheme: { type: ControlType.Boolean, title: "Light/dark button", defaultValue: true },
    brand: { type: ControlType.String, title: "Phone title", defaultValue: "dhwani" },
    breakpoint: { type: ControlType.Number, title: "Phone below", min: 480, max: 1200, step: 10, defaultValue: 810, unit: "px" },
    showLights: { type: ControlType.Boolean, title: "Traffic lights", defaultValue: true },
    showAsk: { type: ControlType.Boolean, title: "Ask row (phone)", defaultValue: true },
    vibeGlow: { type: ControlType.Boolean, title: "Vibe glow", defaultValue: true },
})
