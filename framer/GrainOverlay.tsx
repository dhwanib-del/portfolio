import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { useEffect, useMemo, useRef } from "react"

/**
 * GrainOverlay — sitewide film-grain noise layer.
 * Uses position:fixed so it covers the full viewport no matter where it's placed.
 * Drag onto any page once → grain appears everywhere on that page.
 * Set to non-interactive, zIndex 9999.
 * Oct 5 (click-through audit): the Framer wrapper around the grain is made pointer-events:none too,
 * so a large or high-z instance can never sit on top of the page's links.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function GrainOverlay(props: any) {
    const { opacity, blend, scale, fixed } = props
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (typeof window === "undefined" || RenderTarget.current() === RenderTarget.canvas) return
        let el: HTMLElement | null = ref.current
        for (let i = 0; el && i < 5; i++) {
            el.style.pointerEvents = "none"
            const up: HTMLElement | null = el.parentElement
            if (!up || up === document.body || up.id === "main") break
            if (Array.from(up.children).filter((c) => !/^(STYLE|LINK|SCRIPT|TEMPLATE)$/.test(c.tagName)).length !== 1) break
            el = up
        }
    }, [])

    const bg = useMemo(() => {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${scale}' height='${scale}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
        return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/%23/g, "%23")}")`
    }, [scale])

    return (
        <div
            ref={ref}
            aria-hidden="true"
            style={{
                position: fixed ? "fixed" : "absolute",
                inset: 0,
                width: fixed ? "100vw" : "100%",
                height: fixed ? "100vh" : "100%",
                pointerEvents: "none",
                backgroundImage: bg,
                backgroundRepeat: "repeat",
                opacity: opacity,
                mixBlendMode: blend,
                zIndex: 9999,
                top: 0,
                left: 0,
            }}
        />
    )
}

GrainOverlay.defaultProps = {
    opacity: 0.045,
    blend: "overlay",
    scale: 180,
    fixed: true,
}

addPropertyControls(GrainOverlay, {
    opacity: {
        type: ControlType.Number,
        min: 0,
        max: 0.2,
        step: 0.005,
        defaultValue: 0.045,
        title: "Opacity",
    },
    blend: {
        type: ControlType.Enum,
        options: ["overlay", "soft-light", "screen", "normal"],
        defaultValue: "overlay",
        title: "Blend",
    },
    scale: {
        type: ControlType.Number,
        min: 80,
        max: 400,
        step: 10,
        defaultValue: 180,
        title: "Grain Size",
    },
    fixed: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Fixed (sitewide)",
    },
})
