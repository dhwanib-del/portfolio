import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 120
 * @framerIntrinsicHeight 120
 */

// Oct 4 (light-mode sweep): in light mode the badge uses the site theme tokens (surface, text,
// text-2, a text-tinted track) instead of the instance's dark colours; a warm progress colour
// follows the visitor's vibe accent. Dark mode keeps the instance colours. Strokes are set via
// style so CSS variables work.

function isWarm(c: string): boolean {
    const s = String(c || "").trim().toLowerCase()
    let r = 0
    let g = 0
    let b = 0
    const m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/)
    if (m) {
        r = +m[1]
        g = +m[2]
        b = +m[3]
    } else {
        const h = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})\b/)
        if (!h) return false
        const x = h[1].length === 3 ? h[1].split("").map((ch) => ch + ch).join("") : h[1]
        const n = parseInt(x, 16)
        r = (n >> 16) & 255
        g = (n >> 8) & 255
        b = n & 255
    }
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    if (max < 120 || d < 90) return false
    let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    hue *= 60
    if (hue < 0) hue += 360
    return hue >= 8 && hue <= 62
}

function useDbLight(): boolean {
    const [light, setLight] = useState(false)
    useEffect(() => {
        if (typeof document === "undefined") return
        const html = document.documentElement
        const read = () => setLight(html.getAttribute("data-db-theme") === "light")
        read()
        window.addEventListener("db-theme", read)
        let mo: MutationObserver | null = null
        if (typeof MutationObserver !== "undefined") {
            mo = new MutationObserver(read)
            mo.observe(html, { attributes: true, attributeFilter: ["data-db-theme"] })
        }
        return () => {
            window.removeEventListener("db-theme", read)
            if (mo) mo.disconnect()
        }
    }, [])
    return light
}

export default function ScrollProgressV1(props) {
    const {
        size,
        strokeWidth,
        progressColor,
        trackColor,
        backgroundColor,
        textColor,
        labelColor,
        showLabel,
        label,
        showPercentage,
        previewProgress,
        smoothness,
        shadow,
        radius,
        fixed,
        position,
        offsetX,
        offsetY,
        zIndex,
        style,
    } = props

    const [progress, setProgress] = useState(previewProgress)
    const ticking = useRef(false)
    const light = useDbLight()

    const bgColor = light ? "var(--db-surface, #EEEEEE)" : backgroundColor
    const numColor = light ? "var(--db-text, #0A0A0A)" : textColor
    const capColor = light ? "var(--db-text-2, rgba(0,0,0,0.62))" : labelColor
    const trkColor = light ? "color-mix(in srgb, var(--db-text, #0A0A0A) 12%, transparent)" : trackColor
    const progColor = isWarm(progressColor) ? `var(--db-accent, ${progressColor})` : progressColor

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max)
    }

    function getScrollProgress() {
        if (typeof window === "undefined" || typeof document === "undefined") {
            return previewProgress
        }

        const scrollTop =
            window.scrollY ||
            window.pageYOffset ||
            document.documentElement.scrollTop ||
            document.body.scrollTop ||
            0

        const scrollHeight = Math.max(
            document.documentElement.scrollHeight || 0,
            document.body.scrollHeight || 0
        )

        const viewportHeight =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight ||
            0

        const scrollableHeight = scrollHeight - viewportHeight

        if (scrollableHeight <= 0) {
            return previewProgress
        }

        return clamp((scrollTop / scrollableHeight) * 100, 0, 100)
    }

    function updateProgress() {
        setProgress(getScrollProgress())
    }

    useEffect(() => {
        updateProgress()

        if (typeof window === "undefined") return

        function handleScrollOrResize() {
            if (ticking.current) return

            ticking.current = true

            window.requestAnimationFrame(() => {
                updateProgress()
                ticking.current = false
            })
        }

        window.addEventListener("scroll", handleScrollOrResize, {
            passive: true,
        })

        window.addEventListener("resize", handleScrollOrResize)

        return () => {
            window.removeEventListener("scroll", handleScrollOrResize)
            window.removeEventListener("resize", handleScrollOrResize)
        }
    }, [previewProgress])

    const safeProgress = clamp(progress, 0, 100)
    const safeSize = Math.max(64, size)
    const safeStroke = Math.max(2, strokeWidth)
    const safeRadius = Math.max(0, radius)

    const center = safeSize / 2
    const circleRadius = (safeSize - safeStroke) / 2
    const circumference = 2 * Math.PI * circleRadius
    const dashOffset = circumference - (safeProgress / 100) * circumference

    const isTop = position === "top-left" || position === "top-right"
    const isBottom = position === "bottom-left" || position === "bottom-right"
    const isLeft = position === "top-left" || position === "bottom-left"
    const isRight = position === "top-right" || position === "bottom-right"

    const fixedStyles = fixed
        ? {
              position: "fixed",
              top: isTop ? offsetY : "auto",
              bottom: isBottom ? offsetY : "auto",
              left: isLeft ? offsetX : "auto",
              right: isRight ? offsetX : "auto",
              zIndex: zIndex,
          }
        : {
              position: "relative",
          }

    return (
        <div
            data-db-keep=""
            style={{
                ...style,
                ...fixedStyles,
                width: safeSize,
                height: safeSize,
                minWidth: safeSize,
                minHeight: safeSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "visible",
                pointerEvents: "none",
            }}
        >
            <div
                style={{
                    width: safeSize,
                    height: safeSize,
                    borderRadius: safeRadius,
                    backgroundColor: bgColor,
                    boxShadow: shadow
                        ? "0 16px 40px rgba(0, 0, 0, 0.18)"
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <svg
                    width={safeSize}
                    height={safeSize}
                    viewBox={`0 0 ${safeSize} ${safeSize}`}
                    style={{
                        position: "absolute",
                        inset: 0,
                        transform: "rotate(-90deg)",
                    }}
                >
                    <circle
                        cx={center}
                        cy={center}
                        r={circleRadius}
                        fill="none"
                        strokeWidth={safeStroke}
                        style={{ stroke: trkColor }}
                    />

                    <circle
                        cx={center}
                        cy={center}
                        r={circleRadius}
                        fill="none"
                        strokeWidth={safeStroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        style={{
                            stroke: progColor,
                            transition: `stroke-dashoffset ${smoothness}s ease`,
                        }}
                    />
                </svg>

                <div
                    style={{
                        position: "relative",
                        zIndex: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily:
                            "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                        textAlign: "center",
                        lineHeight: 1,
                    }}
                >
                    {showPercentage && (
                        <div
                            style={{
                                color: numColor,
                                fontSize: safeSize * 0.22,
                                fontWeight: 800,
                                letterSpacing: "-0.04em",
                            }}
                        >
                            {Math.round(safeProgress)}%
                        </div>
                    )}

                    {showLabel && (
                        <div
                            style={{
                                marginTop: 6,
                                color: capColor,
                                fontSize: safeSize * 0.09,
                                fontWeight: 600,
                                letterSpacing: "-0.01em",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {label}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

ScrollProgressV1.defaultProps = {
    width: 120,
    height: 120,
    size: 112,
    strokeWidth: 8,
    progressColor: "#0099FF",
    trackColor: "rgba(0, 0, 0, 0.12)",
    backgroundColor: "#FFFFFF",
    textColor: "#111111",
    labelColor: "rgba(17, 17, 17, 0.55)",
    showLabel: true,
    label: "Read",
    showPercentage: true,
    previewProgress: 64,
    smoothness: 0.18,
    shadow: true,
    radius: 999,
    fixed: true,
    position: "bottom-right",
    offsetX: 24,
    offsetY: 24,
    zIndex: 9999,
}

addPropertyControls(ScrollProgressV1, {
    size: {
        type: ControlType.Number,
        title: "Size",
        defaultValue: 112,
        min: 64,
        max: 240,
        step: 1,
    },
    strokeWidth: {
        type: ControlType.Number,
        title: "Stroke",
        defaultValue: 8,
        min: 2,
        max: 24,
        step: 1,
    },
    progressColor: {
        type: ControlType.Color,
        title: "Progress",
        defaultValue: "#0099FF",
    },
    trackColor: {
        type: ControlType.Color,
        title: "Track",
        defaultValue: "rgba(0, 0, 0, 0.12)",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text",
        defaultValue: "#111111",
        hidden: (props) => props.showPercentage === false,
    },
    labelColor: {
        type: ControlType.Color,
        title: "Label",
        defaultValue: "rgba(17, 17, 17, 0.55)",
        hidden: (props) => props.showLabel === false,
    },
    showPercentage: {
        type: ControlType.Boolean,
        title: "Percent",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    showLabel: {
        type: ControlType.Boolean,
        title: "Label",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    label: {
        type: ControlType.String,
        title: "Label Text",
        defaultValue: "Read",
        hidden: (props) => props.showLabel === false,
    },
    previewProgress: {
        type: ControlType.Number,
        title: "Preview",
        defaultValue: 64,
        min: 0,
        max: 100,
        step: 1,
    },
    smoothness: {
        type: ControlType.Number,
        title: "Smooth",
        defaultValue: 0.18,
        min: 0,
        max: 1,
        step: 0.01,
    },
    shadow: {
        type: ControlType.Boolean,
        title: "Shadow",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    radius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: 999,
        min: 0,
        max: 999,
        step: 1,
    },
    fixed: {
        type: ControlType.Boolean,
        title: "Fixed",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    position: {
        type: ControlType.Enum,
        title: "Position",
        defaultValue: "bottom-right",
        options: ["top-left", "top-right", "bottom-left", "bottom-right"],
        optionTitles: ["Top Left", "Top Right", "Bottom Left", "Bottom Right"],
        hidden: (props) => props.fixed === false,
    },
    offsetX: {
        type: ControlType.Number,
        title: "Offset X",
        defaultValue: 24,
        min: 0,
        max: 200,
        step: 1,
        hidden: (props) => props.fixed === false,
    },
    offsetY: {
        type: ControlType.Number,
        title: "Offset Y",
        defaultValue: 24,
        min: 0,
        max: 200,
        step: 1,
        hidden: (props) => props.fixed === false,
    },
    zIndex: {
        type: ControlType.Number,
        title: "Z Index",
        defaultValue: 9999,
        min: 1,
        max: 999999,
        step: 1,
        hidden: (props) => props.fixed === false,
    },
})
