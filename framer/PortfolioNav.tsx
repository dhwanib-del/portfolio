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
// v15 (Oct 22): same v13 look and structure, slimmer (14px text, 34px tabs, tighter padding) with
// the Apple-style glass back on the bar only (translucent theme tint + blur(20px) saturate(180%),
// hairline border, soft inner highlight). Theme switching is attribute-based: Framer token values,
// hand-colored layer fixes and the logo fix are stylesheet rules scoped to data-db-theme on <html>,
// so a toggle flips one attribute (no inline color restore, no full-page rescan per toggle).
// Also adds Tablet/Phone sizes for every project text style (see typeScale).
import * as React from "react"
import CaseStudyNav from "https://framer.com/m/CaseStudyNav-l846rG.js"
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
    responsiveType: boolean
    style?: CSSProperties
}

const FONT = "'Poppins', 'Inter', sans-serif"
const DEFAULT_TABS: Tab[] = [
    { label: "home", href: "/" },
    { label: "about me", href: "/about-me" },
    { label: "work", href: "/#work" },
    { label: "ai lab", href: "/lab" },
    { label: "connect", href: "/#hiring" },
]
// Oct 10 ("move my game to ai lab and make the play section ai lab — connect needs to take people to
// hiring for product section"): "play" is now "AI Lab" (/lab) and "connect" lands on Home's hiring band
// (ConnectBand, wrapped in a layer named "hiring"). Instances that still carry the old links in their
// Links list are upgraded here too, so every page's nav agrees without re-editing each instance.
function upgradeTab(t: Tab): Tab {
    const label = String((t && t.label) || "").trim()
    const href = String((t && t.href) || "").trim()
    if (/^(play|ai lab)$/i.test(label)) return { label: "ai lab", href: "/lab" }
    if (/^connect$/i.test(label) && (href === "" || /^\/?#contact$/.test(href)))
        return { label, href: "/#hiring" }
    return t
}
// Scroll targets sit under the fixed nav pill: leave room for it.
const HEADER_OFFSET = { wide: 96, narrow: 96 }
const SECTION_TEXT: Record<string, string[]> = {
    contact: ["send a signal.", "send a signal"],
    hiring: ["hiring for product, ux or experience design"],
    work: ["selected work"],
}

const LIGHT = `--db-bg:#FFFFFF;--db-surface:#EEEEEE;--db-surface-2:#E0E0E0;--db-text:#0A0A0A;--db-text-2:#4A4A4A;--db-line:rgba(0,0,0,0.12);--db-glass:rgba(255,255,255,0.86);--db-glass-line:rgba(0,0,0,0.10);--db-shadow:0 18px 40px -22px rgba(0,0,0,0.35);--db-accent:#C23D08;--db-on-accent:#FFFFFF;--db-glow-blend:multiply;--db-glow-opacity:0.22;--db-aurora-opacity:0.55;--db-nav-glass:rgba(255,255,255,0.6);--db-nav-line:rgba(0,0,0,0.08);--db-nav-shadow:0 8px 24px -16px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.75);color-scheme:light;`
const DARK = `--db-bg:#000000;--db-surface:#111111;--db-surface-2:#1F1F1F;--db-text:#FFFFFF;--db-text-2:#C5C5C5;--db-line:rgba(255,255,255,0.1);--db-glass:rgba(18,18,18,0.82);--db-glass-line:rgba(255,255,255,0.10);--db-shadow:0 18px 40px -18px rgba(0,0,0,0.9);--db-accent:var(--vibe-accent,#F3500F);--db-on-accent:#0A0A0A;--db-glow-blend:screen;--db-glow-opacity:0.55;--db-aurora-opacity:0.65;--db-nav-glass:rgba(18,18,20,0.55);--db-nav-line:rgba(255,255,255,0.12);--db-nav-shadow:0 8px 24px -14px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08);color-scheme:dark;`
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
const FIXES = `
${whiteSel}{--framer-text-color:var(--db-text) !important}
${L} [style*="--framer-text-color:rgba(255, 255, 255"],${L} [style*="--framer-text-color: rgba(255, 255, 255"]{--framer-text-color:var(--db-text-2) !important}
section:has(> .sp-shell){--sp-text:var(--db-text) !important;--sp-map-line:var(--db-text) !important;color:var(--db-text) !important}
${L} .sp-feedback.tone-warm > span{color:#B23A0F !important}
${L} .sp-feedback.tone-cold > span{color:#2D52CC !important}
`
// Light-mode logo fix (keyed by attribute, so dark mode just stops matching).
const LOGO_CSS = `${L} [data-db-logo]{filter:brightness(0) saturate(100%) !important;opacity:.86 !important}`
const THEME_CSS = `
:root{${DARK}}
${L}, ${L} body, ${L} #main{background:var(--db-bg) !important}
:root[data-db-theme="light"]{${LIGHT}}
:root[data-db-theme="light"]${LIGHT_VIBES.replace(/\}\[/g, '}:root[data-db-theme="light"][')}
${FIXES}
${LOGO_CSS}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){[data-dbnav]{--db-nav-glass:var(--db-glass)}}
`
const ACCENT = "var(--db-accent, #F3500F)"

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

// ---- Framer color styles: read both value sets from the page CSS, pin the chosen one ----
type TokenSet = {
    sel: Set<string>
    light: Record<string, string>
    dark: Record<string, string>
}
const OWN = ["db-theme-pin", "db-auto-theme", "db-flip-css", "db-type-scale"]
function eachRule(fn: (rule: CSSStyleRule, mode: Theme | null) => void) {
    if (typeof document === "undefined") return
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
            const base = (rule.selectorText || "body")
                .replace(/:not\([^)]*\)/g, "")
                .replace(/\[data-framer-theme[^\]]*\]/g, "")
                .trim()
            base.split(",").forEach((s) => {
                const t = s.trim()
                if (t) out.sel.add(t)
            })
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
// v15: both value sets are pinned once, scoped by the <html data-db-theme> attribute, so a toggle
// only flips that attribute. The stylesheets are re-read only when Framer adds or removes CSS.
function scopeSel(sel: string, mode: Theme) {
    const root = `:root[data-db-theme="${mode}"]`
    if (sel === ":root" || sel === "html") return root
    if (/^(:root|html)\b/.test(sel)) return sel.replace(/^(:root|html)/, root)
    return `${root} ${sel}`
}
function pinTokens() {
    if (typeof document === "undefined") return
    const t = readTokens()
    const dark = { ...t.light, ...t.dark }
    const decl = (vals: Record<string, string>) =>
        Object.keys(vals)
            .map((k) => `${k}:${vals[k]} !important;`)
            .join("")
    if (!Object.keys(dark).length) return
    const sels = Array.from(t.sel)
    if (!sels.includes("body")) sels.push("body")
    const block = (mode: Theme, vals: Record<string, string>) =>
        `${sels.map((s) => scopeSel(s, mode)).join(",")}{${decl(vals)}}`
    styleTag(
        "db-theme-pin",
        `${block("light", t.light)}\n${block("dark", dark)}`
    )
}
function sheetSignature(): string {
    if (typeof document === "undefined") return ""
    const sheets = document.styleSheets
    let n = 0
    for (let i = 0; i < sheets.length; i++) {
        const sh = sheets[i]
        const id = sh.ownerNode && (sh.ownerNode as HTMLElement).id
        if (id && OWN.indexOf(id) !== -1) continue
        try {
            n += sh.cssRules.length
        } catch {}
    }
    return `${sheets.length}:${n}`
}
let sheetSig = ""
// Re-read Framer's CSS (token values, hand-colored layers, text presets) only when it changed.
function refreshThemeCss(force = false) {
    if (typeof document === "undefined") return
    const sig = sheetSignature()
    if (!force && sig === sheetSig) return
    sheetSig = sig
    pinTokens()
    autoTheme()
    typeScale()
}

// ---- Auto-theme: remap hand-picked dark-mode colors on Framer layers for light mode ----
type RGBA = { r: number; g: number; b: number; a: number }
function parseColor(v: string): RGBA | null {
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
    if (/^\s*(white)\s*$/i.test(v)) return { r: 255, g: 255, b: 255, a: 1 }
    if (/^\s*(black)\s*$/i.test(v)) return { r: 0, g: 0, b: 0, a: 1 }
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
let autoCache = ""
function autoTheme() {
    if (typeof document === "undefined") return
    const out: string[] = []
    eachRule((rule) => {
        const sel = rule.selectorText || ""
        if (
            sel.indexOf("framer-") === -1 ||
            /data-db|dbnav|data-csnav/.test(sel)
        )
            return
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
        const scoped = sel
            .split(",")
            .map((s) => `${L} ${s.trim()}`)
            .join(",")
        out.push(`${scoped}{${decls.join(";")}}`)
    })
    const css = out.join("\n")
    if (css === autoCache) return
    autoCache = css
    styleTag("db-auto-theme", css)
}

// ---- v15 responsive type: Tablet/Phone sizes for every project text style ----
// Framer's MCP can't set per-breakpoint sizes on text styles, so the nav (on every page) reads the
// text-style rules (framer-styles-preset-*) and adds Tablet (810–1199) and Phone (<810) sizes on one
// consistent scale. Desktop is untouched. Styles that already have their own breakpoint sizes, and
// per-layer overrides set in Framer, keep winning. Line height only scales when it is in px.
const TYPE_MAP: Record<number, [number, number]> = {
    50: [40, 32],
    48: [40, 32],
    32: [28, 24],
    24: [22, 20],
    18: [17, 16],
    16: [16, 15],
}
function scaleSize(px: number): [number, number] | null {
    if (px < 16) return null
    const m = TYPE_MAP[px]
    const tab = m ? m[0] : Math.round(px * 0.706 + 4.7)
    const ph = m ? m[1] : Math.round(px * 0.5 + 7)
    return [Math.min(px, tab), Math.min(px, ph)]
}
let typeOn = true
function typeScale() {
    if (typeof document === "undefined") return
    if (!typeOn) return styleTag("db-type-scale", "")
    const base: Array<{ sel: string; size: number; lh: number | null }> = []
    const responsive = new Set<string>()
    const presetOf = (sel: string) =>
        (sel.match(/framer-styles-preset-[\w-]+/) || [""])[0]
    const walk = (rules: CSSRuleList, inBp: boolean) => {
        for (let i = 0; i < rules.length; i++) {
            const r = rules[i] as any
            if (r.type === 1) {
                const sel: string = r.selectorText || ""
                const preset = presetOf(sel)
                if (!preset) continue
                const fs = String(r.style.getPropertyValue("--framer-font-size")).trim()
                if (!fs) continue
                if (inBp) {
                    responsive.add(preset)
                    continue
                }
                const m = fs.match(/^(\d+(?:\.\d+)?)px$/)
                if (!m) continue
                const lhv = String(r.style.getPropertyValue("--framer-line-height")).trim()
                const lm = lhv.match(/^(\d+(?:\.\d+)?)px$/)
                base.push({ sel, size: +m[1], lh: lm ? +lm[1] : null })
            } else if (r.type === 4) {
                const c = String(r.conditionText || (r.media && r.media.mediaText) || "")
                walk(r.cssRules, inBp || /(max|min)-width/.test(c))
            } else if (r.cssRules) walk(r.cssRules, inBp)
        }
    }
    const sheets = document.styleSheets
    for (let i = 0; i < sheets.length; i++) {
        const sh = sheets[i]
        const id = sh.ownerNode && (sh.ownerNode as HTMLElement).id
        if (id && OWN.indexOf(id) !== -1) continue
        try {
            walk(sh.cssRules, false)
        } catch {}
    }
    const tab: string[] = []
    const ph: string[] = []
    for (const b of base) {
        if (responsive.has(presetOf(b.sel))) continue
        const s = scaleSize(b.size)
        if (!s) continue
        // "html " lifts the rule over Framer's own preset rule without !important,
        // so inline per-layer sizes set in Framer still win.
        const sel = b.sel
            .split(",")
            .map((x) => `html ${x.trim()}`)
            .join(",")
        const rule = (size: number) => {
            let d = `--framer-font-size:${size}px;`
            if (b.lh) d += `--framer-line-height:${Math.round((b.lh * size) / b.size)}px;`
            return `${sel}{${d}}`
        }
        if (s[0] !== b.size) tab.push(rule(s[0]))
        if (s[1] !== b.size) ph.push(rule(s[1]))
    }
    styleTag(
        "db-type-scale",
        `@media (min-width:810px) and (max-width:1199.98px){${tab.join("")}}\n@media (max-width:809.98px){${ph.join("")}}`
    )
}

// ---- v12 DOM pass, v15 attribute-based: flip what is actually painted ----
// Light mode checks what the browser paints: near-black backgrounds and near-white text on Framer
// layers get a data-db-fb / data-db-ft key. The colors live in one stylesheet scoped to
// :root[data-db-theme="light"], so dark mode needs no restore step (v13 wrote inline !important
// colors and restored saved copies, which went stale and glitched on light→dark). Each element is
// flagged once; a toggle never rescans the page. New layers are picked up by a childList observer
// that only ever sees nodes Framer adds (this code writes attributes, never children).
const SKIP =
    "img,video,canvas,svg,picture,iframe,[data-dbnav],[data-dbnav] *,[data-db-keep],[data-db-keep] *"
function rgbaOf(v: string): RGBA | null {
    if (!v || v === "transparent") return null
    return parseColor(v)
}
const flipKeys: Record<string, string> = {}
const flipRules: string[] = []
function flipKey(kind: "b" | "t", value: string): string {
    const id = kind + "|" + value
    let k = flipKeys[id]
    if (!k) {
        k = kind + Object.keys(flipKeys).length.toString(36)
        flipKeys[id] = k
        flipRules.push(
            kind === "b"
                ? `${L} [data-db-fb="${k}"]{background-color:${value} !important}`
                : `${L} [data-db-ft="${k}"]{color:${value} !important;--framer-text-color:${value} !important}`
        )
        styleTag("db-flip-css", flipRules.join("\n"))
    }
    return k
}
const FLIP_SEL = '[class*="framer-"], [style*="--framer-text-color"]'
function flipOne(el: HTMLElement) {
    if (
        el.hasAttribute("data-db-fb") ||
        el.hasAttribute("data-db-ft") ||
        el.matches(SKIP)
    )
        return
    // Components already using theme variables must keep their reactive styles.
    if (/var\(--(?:db|g|vibe)-/.test(el.getAttribute("style") || "")) return
    const cs = getComputedStyle(el)
    const bg = rgbaOf(cs.backgroundColor)
    if (bg) {
        const m = mapBg(bg)
        if (m) el.setAttribute("data-db-fb", flipKey("b", m))
    }
    const tc = rgbaOf(cs.color)
    if (tc && isWhiteish(tc) && el.childNodes.length) {
        let hasText = false
        for (let j = 0; j < el.childNodes.length; j++)
            if (
                el.childNodes[j].nodeType === 3 &&
                (el.childNodes[j].textContent || "").trim()
            )
                hasText = true
        if (hasText || /^(H[1-6]|P|SPAN|A|LI|BUTTON|LABEL)$/.test(el.tagName)) {
            const m = mapText(tc)
            if (m) el.setAttribute("data-db-ft", flipKey("t", m))
        }
    }
}
function flipIn(root: Element) {
    if (root instanceof HTMLElement && root.matches(FLIP_SEL)) flipOne(root)
    const all = root.querySelectorAll<HTMLElement>(FLIP_SEL)
    for (let i = 0; i < all.length; i++) flipOne(all[i])
}
function isLight() {
    return document.documentElement.getAttribute("data-db-theme") === "light"
}
const pendingRoots = new Set<Element>()
let flipObs: MutationObserver | null = null
let flipTimer = 0
let fullPassAt = 0
// Whole-page pass: on the first light render and while Framer is still loading the page.
function flipPage() {
    if (typeof document === "undefined" || !isLight()) return
    pendingRoots.clear()
    const root = document.getElementById("main") || document.body
    flipIn(root)
    logoFix([root])
    fullPassAt = Date.now()
}
function flipPending() {
    flipTimer = 0
    if (!isLight() || !pendingRoots.size) return
    const roots = Array.from(pendingRoots).filter((r) => r.isConnected)
    pendingRoots.clear()
    roots.forEach(flipIn)
    logoFix(roots)
}
function watchFlip() {
    if (typeof window === "undefined" || flipObs) return
    flipObs = new MutationObserver((records) => {
        for (const r of records)
            r.addedNodes.forEach((n) => {
                if (n.nodeType === 1 && !(n as Element).closest("[data-dbnav]"))
                    pendingRoots.add(n as Element)
            })
        if (!pendingRoots.size || !isLight() || flipTimer) return
        flipTimer = window.setTimeout(flipPending, 300)
    })
    flipObs.observe(document.getElementById("main") || document.body, {
        childList: true,
        subtree: true,
    })
}

// ---- Oct 4: light-mode logo fix ----
// White logos (e.g. the GM mark on case-study heroes) vanish on the light background. In light
// mode, <img>s (and background-image layers) whose nearest named Framer layer contains "logo", or
// whose alt contains "logo", are sampled once via an offscreen canvas. Very light (mean luminance
// > 0.82), low-saturation (< 0.18) marks with some transparency get darkened with a filter; dark
// mode puts them back. Results are cached per src; tainted or failed samples are skipped. Never throws.
// v15: the darkening is a light-scoped CSS rule keyed on data-db-logo (no inline filter to restore).
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
function logoFix(roots: Element[]) {
    if (typeof document === "undefined") return
    try {
        if (!isLight()) return
        const found: Array<[HTMLElement, string]> = []
        const scan = (root: Element) => {
            const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"))
            if (root instanceof HTMLImageElement) imgs.push(root)
            imgs.forEach((img) => {
                if (img.closest("[data-dbnav]") || !isLogoEl(img)) return
                const src = img.currentSrc || img.src
                if (src) found.push([img, src])
            })
            const named = Array.from(
                root.querySelectorAll<HTMLElement>("[data-framer-name]")
            )
            if (root instanceof HTMLElement && root.hasAttribute("data-framer-name"))
                named.push(root)
            named.forEach((n) => {
                if (!/logo/i.test(n.getAttribute("data-framer-name") || ""))
                    return
                const els = [
                    n,
                    ...Array.from(
                        n.querySelectorAll<HTMLElement>("div, span, a, figure")
                    ).slice(0, 24),
                ]
                els.forEach((el) => {
                    const src = bgUrlOf(el)
                    if (src) found.push([el, src])
                })
            })
        }
        roots.forEach(scan)
        found.forEach(([el, src]) => {
            const hit = logoCache[src]
            if (hit === true) return el.setAttribute(LOGO_ATTR, src)
            if (el.hasAttribute(LOGO_ATTR) && el.getAttribute(LOGO_ATTR) !== src)
                el.removeAttribute(LOGO_ATTR)
            if (hit === false || hit === "pending") return
            logoCache[src] = "pending"
            sampleLogo(src, (light) => {
                logoCache[src] = light
                if (light && el.isConnected) el.setAttribute(LOGO_ATTR, src)
            })
        })
    } catch {}
}


function applyTheme(t: Theme | null) {
    if (typeof document === "undefined") return
    const resolved: Theme = t || systemTheme()
    const html = document.documentElement
    html.setAttribute("data-db-theme", resolved)
    if (document.body.getAttribute("data-framer-theme") !== resolved)
        document.body.setAttribute("data-framer-theme", resolved)
    html.style.colorScheme = resolved
    refreshThemeCss()
    watchFlip()
    if (resolved === "light") {
        // First light render (or while the page is still loading): one whole-page pass.
        // After that, only layers Framer added since are checked.
        if (!fullPassAt) window.requestAnimationFrame(flipPage)
        else if (pendingRoots.size) window.requestAnimationFrame(flipPending)
    }
    try {
        window.dispatchEvent(
            new CustomEvent("db-theme", { detail: { theme: resolved } })
        )
    } catch {}
}
// Framer adds stylesheets and layers as the page loads: re-apply the saved theme and catch up.
function settleTheme() {
    if (typeof document === "undefined") return
    applyTheme(savedTheme())
    if (isLight()) window.requestAnimationFrame(flipPage)
}

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

let OWNER: symbol | null = null

function Lights() {
    return (
        <span
            aria-hidden
            style={{ display: "inline-flex", gap: 6, padding: "0 4px" }}
        >
            {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
                <span
                    key={c}
                    style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        background: c,
                    }}
                />
            ))}
        </span>
    )
}
function ThemeIcon({ theme }: { theme: Theme }) {
    return theme === "light" ? (
        <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
    ) : (
        <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
        >
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
    const {
        tabs = DEFAULT_TABS,
        breakpoint = 810,
        showLights: _showLights = false,
        showAsk = true,
        showTheme = true,
        brand = "dhwani",
        vibeGlow: _vibeGlow = false,
        fontSize = 14,
        tabHeight = 34,
        tabPadding = 13,
        responsiveType = true,
    } = props
    const showLights = false
    const vibeGlow = false
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
    const [path, setPath] = useState("/")
    const [activeHash, setActiveHash] = useState("")
    const [chatReady, setChatReady] = useState(false)
    const [reduced, setReduced] = useState(false)
    const [theme, setTheme] = useState<Theme>("dark")
    const [isCasePage, setIsCasePage] = useState(false)
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
        if (!onCanvas && active) {
            if (typeOn !== responsiveType) {
                typeOn = responsiveType
                sheetSig = ""
            }
            applyTheme(saved)
            // Framer adds stylesheets and layers as the page loads; catch up once they're in.
            ;[250, 1200, 3000].forEach((ms) =>
                timers.push(window.setTimeout(settleTheme, ms))
            )
        }
        const onReady = () => {
            if (!onCanvas && active) applyTheme(savedTheme())
            startTransition(() =>
                setChatReady((window as any).__dbChatReady === true)
            )
        }
        window.addEventListener("db-chat-ready", onReady)
        const sys = window.matchMedia("(prefers-color-scheme: light)")
        const onSys = () => {
            if (savedTheme()) return
            if (!onCanvas && active) applyTheme(null)
            startTransition(() => setTheme(systemTheme()))
        }
        sys.addEventListener("change", onSys)
        startTransition(() => {
            setMounted(true)
            setTheme(saved || systemTheme())
            setPath(window.location.pathname.replace(/\/$/, "") || "/")
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
        if (!onCanvas && active) {
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
    }, [breakpoint, onCanvas, active, responsiveType])

    useEffect(() => {
        if (!mounted || !active || typeof window === "undefined") return
        const hashes = list
            .map((t) => splitHref(t.href))
            .filter((h) => h.hash && h.page === path)
            .map((h) => h.hash)
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
            if (
                !found &&
                window.innerHeight + window.scrollY >=
                    document.documentElement.scrollHeight - 4
            ) {
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
            const nodes = [
                ...Array.from(
                    barRef.current?.querySelectorAll<HTMLElement>(
                        "a, button"
                    ) || []
                ),
                ...Array.from(
                    sheetRef.current?.querySelectorAll<HTMLElement>(
                        "a, button"
                    ) || []
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
            document.documentElement.style.overflow = prev
            window.removeEventListener("keydown", onKey)
        }
    }, [open]) // eslint-disable-line

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
    useEffect(() => {
        const sync = (event: Event) => {
            const next = (event as CustomEvent).detail?.theme
            if (next === "light" || next === "dark") setTheme(next)
        }
        window.addEventListener("db-theme", sync)
        return () => window.removeEventListener("db-theme", sync)
    }, [])

    const toggleTheme = () => {
        const current =
            document.documentElement.getAttribute("data-db-theme") || theme
        const next: Theme = current === "light" ? "dark" : "light"
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
        target.scrollIntoView({
            block: "start",
            behavior: reduced ? "auto" : "smooth",
        })
    }
    const askChat = () => {
        close()
        try {
            window.dispatchEvent(
                new CustomEvent("db-chat-open", { detail: {} })
            )
        } catch {}
    }

    useEffect(() => {
        if (typeof document === "undefined" || onCanvas || !active) return
        const syncCase = () => {
            const title =
                document.querySelector("h1")?.textContent?.trim() || ""
            const isCase =
                /\/(work|projects)\/(briefs|intel|general-motors|openlibrary|budgetcart)/.test(
                    window.location.pathname
                ) ||
                /^(BRIEFS|Convoy|BudgetCart|Open Library|Intel workspace|Intelligence Hub)/i.test(
                    title
                )
            document.documentElement.toggleAttribute("data-db-case", isCase)
            setIsCasePage(isCase)
            if (!isCase) return
            document
                .querySelectorAll<HTMLParagraphElement>("p.framer-text")
                .forEach((p) => {
                    if (/^\d{2}\s*[·.]/.test(p.textContent?.trim() || "")) {
                        p.classList.add("db-section-label")
                        const wrap = p.closest(
                            '[data-framer-component-type="RichTextContainer"]'
                        )
                        const title =
                            wrap?.nextElementSibling?.querySelector(
                                "p.framer-text"
                            )
                        if (title && (title.textContent?.length || 0) < 180) {
                            title.classList.add("db-section-title")
                            title.setAttribute("role", "heading")
                            title.setAttribute("aria-level", "2")
                        }
                    }
                })
            document
                .querySelectorAll<HTMLAnchorElement>("a")
                .forEach((link) => {
                    if (link.closest("[data-dbnav]")) return
                    const text = link.textContent?.trim() || ""
                    if (
                        /^(Open the live prototype|Open the prototype|View prototype|Back to work|All projects)/i.test(
                            text
                        )
                    ) {
                        link.classList.add("db-case-cta")
                        link.querySelectorAll("p").forEach((p) => {
                            if (/[↗↖←→]/.test(p.textContent || ""))
                                p.textContent = (p.textContent || "")
                                    .replace(/[↗↖←→]/g, "")
                                    .trim()
                        })
                    }
                })
        }
        syncCase()
        const timer = window.setTimeout(syncCase, 800)
        return () => window.clearTimeout(timer)
    }, [active, onCanvas, path])

    // Apple-style glass on the bar itself only (never on big page layers, so scrolling stays fast).
    const glass: CSSProperties = {
        background: "var(--db-nav-glass)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "0.5px solid var(--db-nav-line)",
        boxShadow: "var(--db-nav-shadow)",
    }
    // The open phone menu reads over page text, so it keeps the denser glass tint.
    const sheetGlass: CSSProperties = {
        ...glass,
        background: "var(--db-glass)",
    }
    const ease = reduced ? "none" : "background .2s, color .2s"
    const themeLabel =
        theme === "light" ? "Switch to dark mode" : "Switch to light mode"

    const css = (
        <style>{`
            ${THEME_CSS}
:root[data-db-case] [data-framer-component-type="RichTextContainer"] {opacity:1 !important;}
:root[data-db-case],:root[data-db-case] body {overflow-x:clip !important;}
@media(max-width:809px){:root[data-db-case]{scroll-padding-top:96px;}}

:root[data-db-case] :is(h1,h2,h3).framer-text { font-family:'Poppins','Inter',sans-serif !important; --framer-font-family:'Poppins','Inter',sans-serif !important; }
:root[data-db-case] :is([data-framer-name="Case study story"],[data-framer-name="Revise Case Study Design"],[data-framer-name="§article"],[data-framer-name="Main case study narrative"]) { height:auto !important; flex:0 0 auto !important; }
:root[data-db-case] .db-section-label.framer-text { font-size:16px !important; font-weight:600 !important; letter-spacing:.08em !important; color:var(--db-accent) !important; }
:root[data-db-case] .db-section-title.framer-text { font-size:clamp(28px,3.3vw,42px) !important; font-weight:600 !important; line-height:1.22 !important; color:var(--db-text) !important; --framer-text-color:var(--db-text) !important; }

            
/* Case study system — shared with Framer stacks and code components. */
:root[data-db-case] { scroll-padding-top: 112px; }
:root[data-db-case] .framer-text { overflow-wrap: break-word; }
:root[data-db-case] h1.framer-text { font-size: clamp(40px,6vw,76px) !important; line-height: 1.08 !important; letter-spacing: -.045em !important; --framer-text-color:var(--db-text) !important; color:var(--db-text) !important; }
:root[data-db-case] h2.framer-text { font-size: clamp(28px,3.5vw,44px) !important; line-height:1.2 !important; --framer-text-color:var(--db-text) !important; color:var(--db-text) !important; }
:root[data-db-case] h3.framer-text { font-size:clamp(23px,2.5vw,30px) !important; line-height:1.3 !important; color:var(--db-text) !important; }
:root[data-db-case] :is([data-framer-name="Case study story"],[data-framer-name="Revise Case Study Design"],[data-framer-name="§article"]) { width:100% !important; max-width:1120px !important; min-width:0 !important; margin-inline:auto !important; display:flex !important; flex-direction:column !important; align-items:stretch !important; gap:64px !important; }
:root[data-db-case] [data-framer-name="Main case study narrative"] { width:100% !important; max-width:880px !important; min-width:0 !important; margin-inline:auto !important; }
:root[data-db-case] :is([data-framer-name="Quick facts sidebar"],[data-framer-name="Quick Facts"],[data-framer-name="Quick facts"],.cs-stats,.cs-meta) { display:none !important; }
:root[data-db-case] [data-framer-name^="§ "] { width:100% !important; max-width:880px !important; min-width:0 !important; margin-inline:auto !important; scroll-margin-top:112px !important; }
:root[data-db-case] :is(a,button,input,select,textarea):focus-visible { outline:3px solid var(--db-accent) !important; outline-offset:5px !important; }
:root[data-db-case] a { text-underline-offset:5px; }
:root[data-db-case] .db-case-cta { display:flex !important; flex-wrap:wrap !important; align-items:center !important; justify-content:space-between !important; gap:20px !important; min-height:64px !important; padding:16px 24px !important; width:100% !important; max-width:880px !important; color:var(--db-text) !important; background:var(--db-surface) !important; border:1px solid var(--db-glass-line) !important; border-radius:24px !important; text-decoration:none !important; }
:root[data-db-case] .db-case-cta p.framer-text { color:var(--db-text) !important; --framer-text-color:var(--db-text) !important; font-size:clamp(20px,2.5vw,28px) !important; }
:root[data-db-case] .db-case-cta svg { color:var(--db-text) !important; width:28px !important; height:28px !important; flex-shrink:0 !important; }
:root[data-db-case] img { max-width:100%; }
:root[data-db-case] video { max-width:100%; }
:root[data-db-case] [data-framer-name="StickyNote"] { max-width:100% !important; }
[data-dbnav] .dbnav-tab { color:var(--db-text) !important; }
@media(max-width:809px) { :root[data-db-case] :is([data-framer-name="Case study story"],[data-framer-name="§article"]) { gap:40px !important; } }
@media(prefers-reduced-motion:reduce) { :root[data-db-case] *, :root[data-db-case] *::before, :root[data-db-case] *::after { scroll-behavior:auto !important; } }

            [data-dbnav] a:focus-visible, [data-dbnav] button:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
            [data-dbnav] .dbnav-tab:hover, [data-dbnav] .dbnav-icon:hover { color: var(--db-text); background: var(--db-line); }
            [data-dbnav] .dbnav-skip { position: fixed; left: 12px; top: -80px; z-index: 2147483001; padding: 12px 16px; border-radius: 12px; background: var(--db-text); color: var(--db-bg); font: 600 14px ${FONT}; text-decoration: none; }
            [data-dbnav] .dbnav-skip:focus { top: 12px; }
            @keyframes dbnav-breathe { 0%,100% { transform: scale(1); opacity: .35 } 50% { transform: scale(1.12); opacity: .55 } }
            @keyframes dbnav-in { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }

/* Shared case-study reading layout: keep display typography outside the story intact. */
:root[data-db-case]{--db-page-gutter:clamp(24px,6vw,88px);scroll-padding-top:112px;}
:root[data-db-case] :is([data-framer-name="Case study story"],[data-framer-name="Revise Case Study Design"],[data-framer-name="§article"]){width:calc(100% - 2 * var(--db-page-gutter)) !important;max-width:1120px !important;box-sizing:border-box !important;}
:root[data-db-case] :is([data-framer-name="§article"],[data-framer-name="Main case study narrative"],[data-framer-name="Case study story"],[data-framer-name="Revise Case Study Design"]) p.framer-text:not(.db-section-title):not(.db-section-label){font-size:clamp(18px,1.7vw,21px) !important;line-height:1.65 !important;color:var(--db-text-2) !important;--framer-text-color:var(--db-text-2) !important;}
:root[data-db-case] .db-section-label.framer-text{font-size:16px !important;line-height:1.4 !important;color:var(--db-accent) !important;--framer-text-color:var(--db-accent) !important;}
:root[data-db-case] .db-section-title.framer-text{font-size:clamp(30px,3.4vw,44px) !important;line-height:1.2 !important;font-weight:600 !important;letter-spacing:-.025em !important;max-width:26ch !important;text-wrap:balance;}
:root[data-db-case] [data-framer-name="Start"]{padding-inline:var(--db-page-gutter) !important;padding-top:144px !important;box-sizing:border-box !important;}
:root[data-db-case] div:has(> .db-ipad-video){width:100% !important;height:auto !important;min-height:0 !important;flex:0 0 auto !important;}
:root[data-db-case] .db-ipad-video{width:100% !important;height:auto !important;max-width:100% !important;}
:root[data-db-case] :is(.framer-13d26mx,.framer-18698lh,.framer-1ltynz0,.framer-1xvnkh8,.framer-1eey8mo){height:auto !important;min-height:0 !important;box-sizing:border-box !important;padding:24px !important;border:1px solid var(--db-glass-line) !important;border-radius:32px !important;background:var(--db-glass) !important;}
:root[data-db-case] .framer-1eey8mo{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr)) !important;align-items:start !important;gap:24px !important;}
:root[data-db-case] :is(.framer-13d26mx,.framer-18698lh,.framer-1ltynz0,.framer-1xvnkh8,.framer-1eey8mo) > div{height:auto !important;min-height:0 !important;max-width:100% !important;}
:root[data-db-case] .framer-em3pas{width:100% !important;max-width:100% !important;padding:0 !important;gap:24px !important;}
:root[data-db-case] .framer-1pnfx6n{width:100% !important;height:auto !important;padding:24px !important;box-sizing:border-box !important;border:1px solid var(--db-glass-line) !important;border-radius:32px !important;background:var(--db-glass) !important;}
:root[data-db-case] .framer-1a78em4{display:grid !important;grid-template-columns:repeat(3,minmax(0,1fr)) !important;align-items:stretch !important;width:100% !important;height:auto !important;gap:24px !important;}
:root[data-db-case] :is(.framer-bz269q,.framer-hkx8wh,.framer-9adq4z){width:100% !important;height:auto !important;min-width:0 !important;align-self:stretch !important;padding:24px !important;box-sizing:border-box !important;border:1px solid var(--db-line) !important;border-radius:24px !important;background:var(--db-surface) !important;box-shadow:none !important;gap:16px !important;}
:root[data-db-case] :is(.framer-bz269q,.framer-hkx8wh,.framer-9adq4z) > div{width:100% !important;max-width:100% !important;}
:root[data-db-case] :is(.framer-bz269q,.framer-hkx8wh,.framer-9adq4z) > div[class$="-container"]{display:none !important;}
:root[data-db-case] :is(.framer-bz269q,.framer-hkx8wh,.framer-9adq4z) [data-framer-name="Header 2"]:first-child p{font-size:22px !important;font-weight:600 !important;color:var(--db-text) !important;--framer-text-color:var(--db-text) !important;}
@media(max-width:999px){:root[data-db-case] .framer-1a78em4{grid-template-columns:minmax(0,1fr) !important;}}
@media(max-width:809px){:root[data-db-case]{--db-page-gutter:24px;scroll-padding-top:104px;}:root[data-db-case] [data-framer-name="Start"]{padding-top:120px !important;}:root[data-db-case] .framer-1eey8mo{grid-template-columns:minmax(0,1fr) !important;}:root[data-db-case] :is(.framer-13d26mx,.framer-18698lh,.framer-1ltynz0,.framer-1xvnkh8,.framer-1eey8mo,.framer-1pnfx6n){padding:16px !important;border-radius:24px !important;}}


:root[data-db-case] .db-ipad-video{max-width:var(--db-media-max,100%) !important;margin-inline:auto !important;}
:root[data-db-case] :is(.framer-bz269q,.framer-hkx8wh,.framer-9adq4z)>[data-framer-name="Ellipse 2779"]{width:44px !important;height:44px !important;min-height:44px !important;flex:0 0 44px !important;border-radius:50% !important;background:var(--db-surface-2) !important;border:1px solid var(--db-line) !important;align-self:flex-start !important;}
:root[data-db-case] :is(.framer-bz269q,.framer-hkx8wh,.framer-9adq4z)>[data-framer-name="Ellipse 2779"] p{color:var(--db-text) !important;--framer-text-color:var(--db-text) !important;}


:root[data-db-case] nav[aria-label="On this page"], :root[data-db-case] div[class$="-container"]:has(nav[aria-label="On this page"]){display:none !important;}
:root[data-db-case] body{padding-bottom:104px !important;}

        `}</style>
    )

    const themeBtn = (size: number) =>
        showTheme && (
            <button
                type="button"
                className="dbnav-icon"
                onClick={toggleTheme}
                aria-label={themeLabel}
                title={themeLabel}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: size,
                    height: size,
                    borderRadius: 999,
                    border: "none",
                    background: "transparent",
                    color: "var(--db-text-2)",
                    cursor: "pointer",
                    transition: ease,
                    flexShrink: 0,
                }}
            >
                <ThemeIcon theme={theme} />
            </button>
        )

    const pill = (
        <nav
            aria-label="Main"
            style={{
                ...glass,
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: 4,
                borderRadius: 999,
                fontFamily: FONT,
            }}
        >
            {showLights && <Lights />}
            {showLights && (
                <span
                    aria-hidden
                    style={{
                        width: 1,
                        height: 18,
                        background: "var(--db-line)",
                        margin: "0 6px",
                    }}
                />
            )}
            <ul
                style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    gap: 2,
                }}
            >
                {list.map((t) => {
                    const cur = isCurrent(t.href, path, activeHash)
                    return (
                        <li key={t.href + t.label}>
                            <a
                                className="dbnav-tab"
                                href={t.href}
                                onClick={onTabClick(t.href)}
                                aria-current={cur ? "page" : undefined}
                                style={{
                                    position: "relative",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    minHeight: tabHeight,
                                    padding: `0 ${tabPadding}px`,
                                    borderRadius: 999,
                                    color: cur
                                        ? "var(--db-text)"
                                        : "var(--db-text-2)",
                                    background: cur
                                        ? "var(--db-line)"
                                        : "transparent",
                                    textDecoration: "none",
                                    fontSize,
                                    fontWeight: cur ? 500 : 400,
                                    letterSpacing: "0.01em",
                                    transition: ease,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {t.label}
                                {cur && (
                                    <span
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            bottom: 3,
                                            width: 4,
                                            height: 4,
                                            marginLeft: -2,
                                            borderRadius: 2,
                                            background: ACCENT,
                                        }}
                                    />
                                )}
                            </a>
                        </li>
                    )
                })}
            </ul>
            {showTheme && (
                <span
                    aria-hidden
                    style={{
                        width: 1,
                        height: 16,
                        background: "var(--db-line)",
                        margin: "0 2px",
                    }}
                />
            )}
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
        <div
            data-dbnav=""
            style={{
                position: "fixed",
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 2147480000,
            }}
        >
            {pill}
        </div>
    )

    const phone = (
        <div
            data-dbnav=""
            style={{
                position: "fixed",
                top: 10,
                left: 10,
                right: 10,
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
                    ...glass,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    boxSizing: "border-box",
                    minHeight: 48,
                    padding: "3px 3px 3px 14px",
                    borderRadius: 999,
                }}
            >
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 0,
                    }}
                >
                    {showLights && <Lights />}
                    <a
                        href="/"
                        style={{
                            color: "var(--db-text)",
                            textDecoration: "none",
                            fontSize: 14,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            padding: "10px 4px",
                        }}
                    >
                        {brand}
                    </a>
                </span>
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    {themeBtn(40)}
                    <button
                        ref={btnRef}
                        type="button"
                        aria-expanded={open}
                        aria-controls="dbnav-sheet"
                        onClick={() =>
                            open
                                ? close(true)
                                : startTransition(() => setOpen(true))
                        }
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            minHeight: 40,
                            minWidth: 40,
                            padding: "0 14px",
                            borderRadius: 999,
                            border: "1px solid var(--db-glass-line)",
                            background: open ? "var(--db-line)" : "transparent",
                            color: "var(--db-text)",
                            fontFamily: FONT,
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <span
                            aria-hidden
                            style={{
                                display: "inline-flex",
                                flexDirection: "column",
                                gap: 3,
                            }}
                        >
                            <span
                                style={{
                                    width: 14,
                                    height: 1.5,
                                    background: "currentColor",
                                    transform: open
                                        ? "translateY(2.25px) rotate(45deg)"
                                        : "none",
                                    transition: reduced
                                        ? "none"
                                        : "transform .2s",
                                }}
                            />
                            <span
                                style={{
                                    width: 14,
                                    height: 1.5,
                                    background: "currentColor",
                                    transform: open
                                        ? "translateY(-2.25px) rotate(-45deg)"
                                        : "none",
                                    transition: reduced
                                        ? "none"
                                        : "transform .2s",
                                }}
                            />
                        </span>
                        {open ? "close" : "menu"}
                    </button>
                </span>
            </div>
            {open && (
                <div
                    id="dbnav-sheet"
                    ref={sheetRef}
                    style={{
                        ...sheetGlass,
                        marginTop: 8,
                        borderRadius: 22,
                        padding: 6,
                        maxHeight: "calc(100vh - 84px)",
                        overflowY: "auto",
                        animation: reduced ? "none" : "dbnav-in .22s ease both",
                    }}
                >
                    <nav aria-label="Main">
                        <ul
                            style={{ listStyle: "none", margin: 0, padding: 0 }}
                        >
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
                                            aria-current={
                                                cur ? "page" : undefined
                                            }
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                minHeight: 50,
                                                padding: "0 16px",
                                                borderRadius: 16,
                                                color: cur
                                                    ? "var(--db-text)"
                                                    : "var(--db-text-2)",
                                                background: cur
                                                    ? "var(--db-line)"
                                                    : "transparent",
                                                textDecoration: "none",
                                                fontSize: 19,
                                                fontWeight: cur ? 500 : 400,
                                            }}
                                        >
                                            {t.label}
                                            {cur ? (
                                                <span
                                                    aria-hidden
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: 4,
                                                        background: ACCENT,
                                                    }}
                                                />
                                            ) : (
                                                <span
                                                    aria-hidden
                                                    style={{
                                                        color: "var(--db-text-2)",
                                                        fontSize: 18,
                                                    }}
                                                >
                                                    →
                                                </span>
                                            )}
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                    {showAsk && chatReady && (
                        <button
                            type="button"
                            onClick={askChat}
                            style={{
                                marginTop: 6,
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                minHeight: 50,
                                padding: "0 16px",
                                borderRadius: 16,
                                border: `1px solid ${ACCENT}`,
                                background: "transparent",
                                color: "var(--db-text)",
                                fontFamily: FONT,
                                fontSize: 16,
                                fontWeight: 500,
                                cursor: "pointer",
                                textAlign: "left",
                            }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    background: ACCENT,
                                }}
                            />
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
                <div
                    aria-hidden
                    style={{
                        position: "fixed",
                        inset: 0,
                        pointerEvents: "none",
                        zIndex: 2147479000,
                        mixBlendMode: "var(--db-glow-blend)" as any,
                        opacity: "var(--db-glow-opacity)" as any,
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            left: "-15vw",
                            top: "-25vh",
                            width: "60vw",
                            height: "60vh",
                            borderRadius: "50%",
                            background:
                                "radial-gradient(closest-side, var(--vibe-b, rgba(243,80,15,.5)), transparent)",
                            filter: "blur(60px)",
                            opacity: 0.45,
                            animation: reduced
                                ? "none"
                                : "dbnav-breathe 9s ease-in-out infinite",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            right: "-20vw",
                            bottom: "-30vh",
                            width: "65vw",
                            height: "65vh",
                            borderRadius: "50%",
                            background:
                                "radial-gradient(closest-side, var(--vibe-a, rgba(255,140,60,.38)), transparent)",
                            filter: "blur(70px)",
                            opacity: 0.35,
                            animation: reduced
                                ? "none"
                                : "dbnav-breathe 11s ease-in-out -4s infinite",
                        }}
                    />
                </div>
            )}
            <div data-dbnav="">
                {css}
                <a href="#" className="dbnav-skip" onClick={skipToContent}>
                    skip to content
                </a>
            </div>
            {isCasePage && (
                <CaseStudyNav
                    shared={true}
                    placement="responsive"
                    sideMinWidth={1100}
                    offsetX={16}
                    fluidType={false}
                    projectTitle="In this story"
                />
            )}
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
        defaultValue: 14,
        unit: "px",
    },
    tabHeight: {
        type: ControlType.Number,
        title: "Tab height",
        min: 28,
        max: 52,
        step: 2,
        defaultValue: 34,
        unit: "px",
    },
    tabPadding: {
        type: ControlType.Number,
        title: "Tab padding",
        min: 6,
        max: 24,
        step: 1,
        defaultValue: 13,
        unit: "px",
    },
    responsiveType: {
        type: ControlType.Boolean,
        title: "Responsive type",
        defaultValue: true,
        description: "Tablet/Phone sizes for all text styles. Desktop unchanged.",
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
        defaultValue: false,
        hidden: () => true,
    },
    showAsk: {
        type: ControlType.Boolean,
        title: "Ask row (phone)",
        defaultValue: true,
    },
    vibeGlow: {
        type: ControlType.Boolean,
        title: "Vibe glow",
        defaultValue: false,
        hidden: () => true,
    },
})
