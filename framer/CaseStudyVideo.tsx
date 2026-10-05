// Dhwani: "give me media player placeholders for my videos that play automatically"
// CaseStudyVideo — drop-in autoplaying clip for case studies.
// Pick the file in the right panel (Video). Plays muted + looped + inline, pauses when
// scrolled out of view, and respects "reduce motion" (shows controls instead of autoplay).
// Until a file is picked it renders a clearly visible glass frame with the label.
// Oct 5: "fix my screens to FIT MY VIDEOS" + "remove the white/dark background, it can just be the screens".
//  • Ratio "auto" (default) reads the video's own size and sizes the frame to match — nothing cut off,
//    no letterbox bars. Fixed ratios are still there (16:9, 4:3, 3:2, 1:1, 9:16).
//  • Fit: cover fills the frame (default), contain shows the whole video inside a fixed ratio.
//  • Frame: none (default, just the video with rounded corners), subtle (thin theme line), dark (old frame).
//  • Max height (0 = off) keeps tall phone recordings from taking over the page; the frame narrows to keep its shape.
//  • Fills whatever width its parent gives it.
import * as React from "react"
import { startTransition } from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"

type Props = {
    video: string
    label: string
    caption: string
    radius: number
    accent: string
    fit: "cover" | "contain"
    ratio: "auto" | "16:9" | "4:3" | "3:2" | "1:1" | "9:16"
    frame: "none" | "subtle" | "dark"
    maxHeight: number
    style?: React.CSSProperties
}

const RATIOS: Record<string, number> = { "16:9": 16 / 9, "4:3": 4 / 3, "3:2": 3 / 2, "1:1": 1, "9:16": 9 / 16 }

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function CaseStudyVideo(props: Props) {
    const { video, label, caption, radius, accent, style } = props
    const fit = props.fit || "cover"
    const ratio = props.ratio || "auto"
    const frameKind = props.frame || "none"
    const maxHeight = props.maxHeight || 0
    const ref = React.useRef<HTMLVideoElement | null>(null)
    const isStatic = useIsStaticRenderer()
    const [reduced, setReduced] = React.useState(false)
    const [natural, setNatural] = React.useState<number | null>(null)

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        startTransition(() => setReduced(mq.matches))
    }, [])

    React.useEffect(() => {
        const el = ref.current
        if (!el || typeof IntersectionObserver === "undefined" || reduced) return
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.play().catch(() => {})
                } else {
                    el.pause()
                }
            },
            { threshold: 0.25 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [video, reduced])

    // Intrinsic size: metadata may already be loaded before React attaches the handler.
    const readNatural = React.useCallback(() => {
        const el = ref.current
        if (el && el.videoWidth > 0 && el.videoHeight > 0) {
            const r = el.videoWidth / el.videoHeight
            startTransition(() => setNatural(r))
        }
    }, [])

    React.useEffect(() => {
        setNatural(null)
        const el = ref.current
        if (el && el.readyState >= 1) readNatural()
    }, [video, readNatural])

    const ar = ratio === "auto" ? natural || 16 / 9 : RATIOS[ratio] || 16 / 9

    const isPlaceholder = !video
    const look: React.CSSProperties = isPlaceholder
        ? {
              background: "linear-gradient(160deg, rgba(0,39,76,0.85) 0%, rgba(12,14,20,0.95) 100%)",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
          }
        : frameKind === "dark"
          ? {
                background: "#0A0A0A",
                border: "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 24px 60px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)",
            }
          : frameKind === "subtle"
            ? { background: "transparent", border: "1px solid var(--db-line, rgba(127,127,127,0.25))" }
            : { background: "transparent", border: "none", boxShadow: "none" }

    const frame: React.CSSProperties = {
        position: "relative",
        width: maxHeight > 0 ? `min(100%, ${Math.round(maxHeight * ar)}px)` : "100%",
        margin: "0 auto",
        aspectRatio: String(ar),
        borderRadius: radius,
        overflow: "hidden",
        zIndex: 1,
        boxSizing: "border-box",
        ...look,
    }

    // The dark frame and the placeholder stay dark in light mode; "none"/"subtle" have no fill to protect.
    const keep = isPlaceholder || frameKind === "dark" ? { "data-db-keep": "" } : {}

    return (
        <figure style={{ ...style, position: "relative", width: "100%", minWidth: 0, margin: 0, zIndex: 1 }}>
            <div {...keep} style={frame}>
                {video ? (
                    <video
                        ref={ref}
                        src={video}
                        muted
                        loop
                        playsInline
                        autoPlay={!reduced && !isStatic}
                        controls={reduced}
                        preload="metadata"
                        aria-label={caption || label}
                        onLoadedMetadata={readNatural}
                        style={{ width: "100%", height: "100%", objectFit: fit, display: "block", borderRadius: "inherit" }}
                    />
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 14,
                            background: `radial-gradient(circle at 50% 42%, ${accent}22 0%, rgba(0,0,0,0) 55%)`,
                        }}
                    >
                        <div
                            style={{
                                width: 60,
                                height: 60,
                                borderRadius: "50%",
                                background: accent,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: `0 0 0 8px ${accent}26, 0 10px 30px rgba(0,0,0,0.5)`,
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
                                <path d="M6 3.5 L15 9 L6 14.5 Z" fill="#0A0A0A" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                color: "#FAFAFA",
                                textAlign: "center",
                                padding: "0 16px",
                            }}
                        >
                            {label}
                        </span>
                    </div>
                )}
            </div>
            {caption ? (
                <figcaption
                    style={{
                        marginTop: 12,
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: 15,
                        lineHeight: 1.5,
                        color: "color-mix(in srgb, var(--db-text, #FAFAFA) 84%, transparent)",
                    }}
                >
                    {caption}
                </figcaption>
            ) : null}
        </figure>
    )
}

CaseStudyVideo.defaultProps = {
    video: "",
    label: "Pick a video in the right panel",
    caption: "",
    radius: 16,
    accent: "#FFCB05",
    fit: "cover",
    ratio: "auto",
    frame: "none",
    maxHeight: 0,
}

addPropertyControls(CaseStudyVideo, {
    video: {
        type: ControlType.File,
        title: "Video",
        allowedFileTypes: ["mp4", "webm", "mov"],
    },
    label: { type: ControlType.String, title: "Placeholder", defaultValue: "Pick a video in the right panel" },
    caption: { type: ControlType.String, title: "Caption", defaultValue: "", displayTextArea: true },
    ratio: {
        type: ControlType.Enum,
        title: "Ratio",
        options: ["auto", "16:9", "4:3", "3:2", "1:1", "9:16"],
        optionTitles: ["Auto (match video)", "16:9", "4:3", "3:2", "1:1", "9:16"],
        defaultValue: "auto",
    },
    fit: {
        type: ControlType.Enum,
        title: "Fit",
        options: ["cover", "contain"],
        optionTitles: ["Cover", "Contain"],
        displaySegmentedControl: true,
        defaultValue: "cover",
    },
    frame: {
        type: ControlType.Enum,
        title: "Frame",
        options: ["none", "subtle", "dark"],
        optionTitles: ["None", "Subtle", "Dark"],
        displaySegmentedControl: true,
        defaultValue: "none",
    },
    maxHeight: {
        type: ControlType.Number,
        title: "Max height",
        min: 0,
        max: 1600,
        step: 10,
        unit: "px",
        defaultValue: 0,
        description: "0 = no limit. Useful for tall phone recordings.",
    },
    radius: { type: ControlType.Number, title: "Radius", min: 0, max: 40, step: 1, defaultValue: 16 },
    accent: { type: ControlType.Color, title: "Accent", defaultValue: "#FFCB05" },
})
