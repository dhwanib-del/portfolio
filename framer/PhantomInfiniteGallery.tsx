// Phantom-Inspired Draggable Infinite Gallery
// UPDATED:
// • Keeps ALL existing photos
// • Removes category/filter pill UI only
// • Categories can remain in item data — they no longer filter anything
// • Click/tap image → full-screen lightbox
// • Click enlarged image → detail zoom
// • Click backdrop / × / Escape → close
// • Dragging does NOT accidentally open photos
// • Keeps inertia, parallax, arc, auto-drift + theme token behavior
// Oct 11 (perf pass, same look and props):
// • The animation loop only runs while the gallery is on screen and the tab is visible.
// • Idle auto-drift commits at ~30fps (sub-pixel steps, invisible) and parallax stops
//   re-rendering once it has settled.
// • Tiles move with transform instead of left/top, and only the tiles that can be seen
//   (plus a 3-tile buffer) are built, instead of a fixed 20×20 = 400.
// • The small ↗ badge on each tile no longer uses backdrop-filter (one blur per tile per frame).
// • Reduced motion: no auto-drift.

import React, {
    useRef,
    useState,
    useEffect,
    useCallback,
    startTransition,
} from "react"
import { addPropertyControls, ControlType } from "framer"

interface GalleryItem {
    title: string
    image: { src: string; alt: string }
    year: number
    category: string
}

interface Vec2 {
    x: number
    y: number
}

interface InfiniteGalleryProps {
    items: GalleryItem[]
    cellSize: number
    backgroundColor: string
    textColor: string
    cellPadding: number
    gap: number
    zoomValue: number

    arcAmount: number
    arcMaxAngleDeg: number
    arcAxis: "horizontal" | "vertical"
    edgeFade: number

    hoverColor: string

    border: {
        width: number
        style: string
        color: string
        showTop: boolean
        showBottom: boolean
        showLeft: boolean
        showRight: boolean
    }

    parallaxEnabled: boolean
    parallaxStrength: number
    parallaxEase: number
    parallaxWhileDragging: boolean

    inertiaEnabled: boolean
    throwFriction: number
    throwVelocityScale: number
    throwMinSpeed: number
    throwMaxSpeed: number

    autoDrift: boolean
    autoDriftSpeedX: number
    autoDriftSpeedY: number

    showHeader: boolean
    headerText: string
    headerSubtext: string

    style?: React.CSSProperties
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function computePinnedOffset(
    prevSize: number,
    nextSize: number,
    pivot: Vec2,
    prevOffset: Vec2
): Vec2 {
    const worldX = (pivot.x - prevOffset.x) / prevSize
    const worldY = (pivot.y - prevOffset.y) / prevSize

    return {
        x: pivot.x - worldX * nextSize,
        y: pivot.y - worldY * nextSize,
    }
}

function toRadians(deg: number) {
    return (deg * Math.PI) / 180
}

function calcArcTransform(opts: {
    cellCenterX: number
    cellCenterY: number
    viewportW: number
    viewportH: number
    arcAxis: "horizontal" | "vertical"
    arcMaxAngleDeg: number
    arcAmount: number
}) {
    const {
        cellCenterX,
        cellCenterY,
        viewportW,
        viewportH,
        arcAxis,
        arcMaxAngleDeg,
        arcAmount,
    } = opts

    const maxAngle =
        toRadians(arcMaxAngleDeg) * Math.max(0, Math.min(1, arcAmount))

    if (maxAngle === 0) {
        return {
            z: 0,
            yawDeg: 0,
            pitchDeg: 0,
            edgeFactor: 0,
        }
    }

    if (arcAxis === "horizontal") {
        const dx = (cellCenterX - viewportW / 2) / (viewportW / 2)
        const angle = dx * maxAngle

        const radius = viewportW / (2 * Math.sin(Math.max(0.001, maxAngle)))

        return {
            z: -radius * (Math.cos(angle) - 1),
            yawDeg: -(angle * 180) / Math.PI,
            pitchDeg: 0,
            edgeFactor: Math.min(1, Math.abs(dx)),
        }
    }

    const dy = (cellCenterY - viewportH / 2) / (viewportH / 2)
    const angle = dy * maxAngle

    const radius = viewportH / (2 * Math.sin(Math.max(0.001, maxAngle)))

    return {
        z: -radius * (Math.cos(angle) - 1),
        yawDeg: 0,
        pitchDeg: (angle * 180) / Math.PI,
        edgeFactor: Math.min(1, Math.abs(dy)),
    }
}

/* ---------------------------------------------------------
   Theme helpers
--------------------------------------------------------- */

const normColor = (c: string) =>
    String(c || "")
        .replace(/\s+/g, "")
        .toLowerCase()

const isColor = (c: string, hex: string, rgb: string) => {
    const n = normColor(c)

    return (
        n === hex ||
        n === rgb ||
        n === rgb.replace("rgb(", "rgba(").replace(")", ",1)")
    )
}

const BG_MIX = (pct: number) =>
    `color-mix(in srgb, var(--db-bg, #000000) ${pct}%, transparent)`

const ACCENT_MIX = (pct: number) =>
    `color-mix(in srgb, var(--db-accent, #F3500F) ${pct}%, transparent)`

/* ---------------------------------------------------------
   Existing photos — ALL preserved
--------------------------------------------------------- */

const IMG_A =
    "https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg"

const IMG_B =
    "https://framerusercontent.com/images/aNsAT3jCvt4zglbWCUoFe33Q.jpg"

const IMG_C =
    "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg"

const IMG_D =
    "https://framerusercontent.com/images/2uTNEj5aTl2K3NJaEFWMbnrA.jpg"

const IMG_E =
    "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg"

const DEFAULT_ITEMS: GalleryItem[] = [
    {
        title: "dj set @ btb · 1am",
        image: {
            src: IMG_A,
            alt: "dj",
        },
        year: 2024,
        category: "hobbies",
    },
    {
        title: "matcha run (always)",
        image: {
            src: IMG_B,
            alt: "matcha",
        },
        year: 2024,
        category: "hobbies",
    },
    {
        title: "psych degree speedrun",
        image: {
            src: IMG_A,
            alt: "psych",
        },
        year: 2024,
        category: "hobbies",
    },
    {
        title: "late night study hall",
        image: {
            src: IMG_B,
            alt: "study",
        },
        year: 2023,
        category: "hobbies",
    },
    {
        title: "research lab hrs",
        image: {
            src: IMG_A,
            alt: "research",
        },
        year: 2024,
        category: "hobbies",
    },
    {
        title: "overthinker (certified)",
        image: {
            src: IMG_B,
            alt: "brain",
        },
        year: 2024,
        category: "hobbies",
    },
    {
        title: "angell hall basement",
        image: {
            src: IMG_A,
            alt: "cafe",
        },
        year: 2023,
        category: "hobbies",
    },
    {
        title: "east lansing era",
        image: {
            src: IMG_B,
            alt: "msu",
        },
        year: 2021,
        category: "hobbies",
    },
    {
        title: "the diag in october",
        image: {
            src: IMG_C,
            alt: "diag",
        },
        year: 2023,
        category: "where i've touched grass",
    },
    {
        title: "bangalore, india",
        image: {
            src: IMG_D,
            alt: "bangalore",
        },
        year: 2001,
        category: "where i've touched grass",
    },
    {
        title: "ann arbor, mi",
        image: {
            src: IMG_E,
            alt: "ann arbor",
        },
        year: 2022,
        category: "where i've touched grass",
    },
    {
        title: "game day chaos",
        image: {
            src: IMG_C,
            alt: "game day",
        },
        year: 2023,
        category: "where i've touched grass",
    },
    {
        title: "east lansing, mi",
        image: {
            src: IMG_D,
            alt: "east lansing",
        },
        year: 2021,
        category: "where i've touched grass",
    },
    {
        title: "chicago layover",
        image: {
            src: IMG_E,
            alt: "chicago",
        },
        year: 2023,
        category: "where i've touched grass",
    },
    {
        title: "random road trip",
        image: {
            src: IMG_C,
            alt: "road trip",
        },
        year: 2024,
        category: "where i've touched grass",
    },
]

/** @framerSupportedLayoutWidth fixed */
/** @framerSupportedLayoutHeight fixed */

export default function PhantomInfiniteGallery(props: InfiniteGalleryProps) {
    const {
        items = DEFAULT_ITEMS,

        cellSize = 200,

        backgroundColor = "#000000",
        textColor = "#808080",

        cellPadding = 10,
        gap = 12,

        arcAmount = 0.6,
        arcMaxAngleDeg = 28,
        arcAxis = "horizontal",
        edgeFade = 0.25,

        border = {
            width: 1,
            style: "solid",
            color: "#FFFFFF",
            showTop: false,
            showBottom: true,
            showLeft: true,
            showRight: true,
        },

        parallaxEnabled = true,
        parallaxStrength = 0.1,
        parallaxEase = 0.12,
        parallaxWhileDragging = false,

        inertiaEnabled = true,
        throwFriction = 0.92,
        throwVelocityScale = 1,
        throwMinSpeed = 80,
        throwMaxSpeed = 2500,

        autoDrift = true,
        autoDriftSpeedX = -25,
        autoDriftSpeedY = -10,

        showHeader = true,
        headerText = "where i've touched grass",
        headerSubtext = "drag to explore ✦ click a photo to zoom",
    } = props as any

    /* ---------------------------------------------------------
       Theme
    --------------------------------------------------------- */

    const themedBg: string =
        isColor(backgroundColor, "#000000", "rgb(0,0,0)") ||
        isColor(backgroundColor, "#000", "rgb(0,0,0)")
            ? "var(--db-surface, #000000)"
            : backgroundColor

    const themedText: string = isColor(textColor, "#808080", "rgb(128,128,128)")
        ? "var(--db-text-2, #808080)"
        : textColor

    const themedBorderColor: string =
        isColor(border.color, "#ffffff", "rgb(255,255,255)") ||
        isColor(border.color, "#fff", "rgb(255,255,255)")
            ? "var(--db-text, #FFFFFF)"
            : border.color

    /* ---------------------------------------------------------
       Items

       IMPORTANT:
       No filtering anymore.
       Every photo in Framer stays visible.
    --------------------------------------------------------- */

    const [itemOrder, setItemOrder] = useState<GalleryItem[]>(items)

    useEffect(() => {
        setItemOrder(items)
    }, [JSON.stringify(items)])

    const displayItems =
        itemOrder && itemOrder.length > 0 ? itemOrder : DEFAULT_ITEMS

    /* ---------------------------------------------------------
       Lightbox
    --------------------------------------------------------- */

    const [zoomedItem, setZoomedItem] = useState<GalleryItem | null>(null)
    const [detailZoom, setDetailZoom] = useState(false)

    const openPhoto = useCallback((item: GalleryItem) => {
        if (!item?.image?.src) return

        setDetailZoom(false)
        setZoomedItem(item)
    }, [])

    const closePhoto = useCallback(() => {
        setDetailZoom(false)
        setZoomedItem(null)
    }, [])

    useEffect(() => {
        if (!zoomedItem) return

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closePhoto()
            }
        }

        window.addEventListener("keydown", handleKey)

        return () => {
            window.removeEventListener("keydown", handleKey)
        }
    }, [zoomedItem, closePhoto])

    /* ---------------------------------------------------------
       Core movement
    --------------------------------------------------------- */

    const containerRef = useRef<HTMLDivElement>(null)

    const cellSizeNum = cellSize as number

    const [offset, setOffset] = useState<Vec2>({
        x: 0,
        y: 0,
    })

    const [targetOffset, setTargetOffset] = useState<Vec2>({
        x: 0,
        y: 0,
    })

    const [isDragging, setIsDragging] = useState(false)

    // Distinguishes a click from a drag
    const didDragRef = useRef(false)

    const [currentCellSize, setCurrentCellSize] = useState<number>(cellSizeNum)

    const currentCellSizeRef = useRef<number>(cellSizeNum)

    const [targetCellSize, setTargetCellSize] = useState<number>(cellSizeNum)

    const targetCellSizeRef = useRef<number>(cellSizeNum)

    useEffect(() => {
        targetCellSizeRef.current = targetCellSize
    }, [targetCellSize])

    /* ---------------------------------------------------------
       Parallax
    --------------------------------------------------------- */

    const [mouseOffset, setMouseOffset] = useState<Vec2>({
        x: 0,
        y: 0,
    })

    const mouseOffsetRef2 = useRef<Vec2>({
        x: 0,
        y: 0,
    })

    const [targetMouseOffset, setTargetMouseOffset] = useState<Vec2>({
        x: 0,
        y: 0,
    })

    const mouseOffsetRef = useRef<Vec2>(mouseOffset)

    useEffect(() => {
        mouseOffsetRef.current = mouseOffset
    }, [mouseOffset])

    const targetMouseOffsetRef = useRef<Vec2>(targetMouseOffset)

    useEffect(() => {
        targetMouseOffsetRef.current = targetMouseOffset
    }, [targetMouseOffset])

    /* ---------------------------------------------------------
       Inertia
    --------------------------------------------------------- */

    const [inertia, setInertia] = useState<Vec2>({
        x: 0,
        y: 0,
    })

    const inertiaRef = useRef<Vec2>(inertia)

    useEffect(() => {
        inertiaRef.current = inertia
    }, [inertia])

    const velocityRef = useRef<Vec2>({
        x: 0,
        y: 0,
    })

    const inertiaActiveRef = useRef(false)

    /* ---------------------------------------------------------
       Drag refs
    --------------------------------------------------------- */

    const lastMoveRef = useRef({
        x: 0,
        y: 0,
        t: 0,
    })

    const pointerIdRef = useRef<number | null>(null)

    const isPressingRef = useRef(false)

    const draggingRef = useRef(false)

    useEffect(() => {
        draggingRef.current = isDragging
    }, [isDragging])

    const offsetRef = useRef<Vec2>(offset)

    useEffect(() => {
        offsetRef.current = offset
    }, [offset])

    const targetOffsetRef = useRef<Vec2>(targetOffset)

    useEffect(() => {
        targetOffsetRef.current = targetOffset
    }, [targetOffset])

    const pressPosRef = useRef<Vec2>({
        x: 0,
        y: 0,
    })

    const startOffsetRef = useRef<Vec2>({
        x: 0,
        y: 0,
    })

    const pressTimerRef = useRef<number | null>(null)

    /* ---------------------------------------------------------
       Auto drift
    --------------------------------------------------------- */

    const driftOffsetRef = useRef<Vec2>({
        x: 0,
        y: 0,
    })

    const [driftOffset, setDriftOffset] = useState<Vec2>({
        x: 0,
        y: 0,
    })

    const autoDriftRef = useRef<boolean>(autoDrift)
    const autoDriftSpeedXRef = useRef<number>(autoDriftSpeedX)
    const autoDriftSpeedYRef = useRef<number>(autoDriftSpeedY)

    useEffect(() => {
        autoDriftRef.current = autoDrift
    }, [autoDrift])

    useEffect(() => {
        autoDriftSpeedXRef.current = autoDriftSpeedX
    }, [autoDriftSpeedX])

    useEffect(() => {
        autoDriftSpeedYRef.current = autoDriftSpeedY
    }, [autoDriftSpeedY])

    /* ---------------------------------------------------------
       General refs/helpers
    --------------------------------------------------------- */

    const lastTimeRef = useRef(performance.now())

    const DRAG_THRESHOLD = 4
    const PRESS_ZOOM_DELAY = 120

    const clamp = (v: number, lo: number, hi: number) =>
        Math.max(lo, Math.min(hi, v))

    const commitInertiaToBase = useCallback(() => {
        const committed: Vec2 = {
            x: offsetRef.current.x + inertiaRef.current.x,
            y: offsetRef.current.y + inertiaRef.current.y,
        }

        setOffset(committed)
        setTargetOffset(committed)

        setInertia({
            x: 0,
            y: 0,
        })

        inertiaRef.current = {
            x: 0,
            y: 0,
        }

        inertiaActiveRef.current = false
    }, [])

    /* ---------------------------------------------------------
       Viewport
    --------------------------------------------------------- */

    const [viewport, setViewport] = useState({
        w: 0,
        h: 0,
    })

    useEffect(() => {
        const el = containerRef.current

        if (!el) return

        const ro = new ResizeObserver(([entry]) => {
            const cr = entry.contentRect

            setViewport({
                w: cr.width,
                h: cr.height,
            })
        })

        ro.observe(el)

        return () => ro.disconnect()
    }, [])

    /* ---------------------------------------------------------
       Visibility: only animate on screen + tab visible
    --------------------------------------------------------- */

    const [live, setLive] = useState(true)
    const reducedRef = useRef(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
        const readRM = () => {
            reducedRef.current = !!mq?.matches
        }
        readRM()
        mq?.addEventListener?.("change", readRM)
        const el = containerRef.current
        let near = true
        const sync = () => setLive(near && !document.hidden)
        const io =
            el && typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      ([entry]) => {
                          near = !!entry?.isIntersecting
                          sync()
                      },
                      { rootMargin: "120px" }
                  )
                : null
        if (io && el) io.observe(el)
        document.addEventListener("visibilitychange", sync)
        return () => {
            io?.disconnect()
            mq?.removeEventListener?.("change", readRM)
            document.removeEventListener("visibilitychange", sync)
        }
    }, [])

    /* ---------------------------------------------------------
       Animation loop
    --------------------------------------------------------- */

    useEffect(() => {
        if (!live) return

        let raf = 0
        let lastDriftCommit = 0

        lastTimeRef.current = performance.now()

        const tick = () => {
            const now = performance.now()

            const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000)

            lastTimeRef.current = now

            /* Smooth cell-size animation */

            const curCS = currentCellSizeRef.current
            const tgtCS = targetCellSizeRef.current

            const nextCS = curCS + (tgtCS - curCS) * 0.15

            const resolvedCS = Math.abs(nextCS - tgtCS) < 0.05 ? tgtCS : nextCS

            if (resolvedCS !== curCS) {
                currentCellSizeRef.current = resolvedCS
                setCurrentCellSize(resolvedCS)
            }

            /* Smooth base movement */

            if (!draggingRef.current) {
                const curOff = offsetRef.current

                const tx = targetOffsetRef.current.x
                const ty = targetOffsetRef.current.y

                const nx = curOff.x + (tx - curOff.x) * 0.15
                const ny = curOff.y + (ty - curOff.y) * 0.15

                const ro = {
                    x: Math.abs(nx - tx) < 0.1 ? tx : nx,
                    y: Math.abs(ny - ty) < 0.1 ? ty : ny,
                }

                if (ro.x !== curOff.x || ro.y !== curOff.y) {
                    setOffset(ro)
                }
            }

            /* Inertia */

            if (inertiaEnabled && inertiaActiveRef.current) {
                const f = Math.pow(throwFriction, dt * 60)

                velocityRef.current.x *= f
                velocityRef.current.y *= f

                if (
                    Math.hypot(velocityRef.current.x, velocityRef.current.y) < 2
                ) {
                    inertiaActiveRef.current = false

                    velocityRef.current = {
                        x: 0,
                        y: 0,
                    }
                } else {
                    const ni = {
                        x: inertiaRef.current.x + velocityRef.current.x * dt,

                        y: inertiaRef.current.y + velocityRef.current.y * dt,
                    }

                    inertiaRef.current = ni
                    setInertia(ni)
                }
            }

            /* Auto drift */

            if (
                autoDriftRef.current &&
                !reducedRef.current &&
                !draggingRef.current &&
                !isPressingRef.current &&
                !inertiaActiveRef.current &&
                !zoomedItem
            ) {
                driftOffsetRef.current = {
                    x:
                        driftOffsetRef.current.x +
                        autoDriftSpeedXRef.current * dt,

                    y:
                        driftOffsetRef.current.y +
                        autoDriftSpeedYRef.current * dt,
                }

                // Slow drift: ~30fps commits are visually identical
                if (now - lastDriftCommit >= 33) {
                    lastDriftCommit = now

                    setDriftOffset({
                        ...driftOffsetRef.current,
                    })
                }
            }

            /* Parallax */

            if (
                parallaxEnabled &&
                (parallaxWhileDragging || !draggingRef.current)
            ) {
                const curMO = mouseOffsetRef2.current

                const tmx = targetMouseOffsetRef.current.x
                const tmy = targetMouseOffsetRef.current.y

                const nmx = curMO.x + (tmx - curMO.x) * parallaxEase
                const nmy = curMO.y + (tmy - curMO.y) * parallaxEase

                const rmo = {
                    x: Math.abs(nmx - tmx) < 0.1 ? tmx : nmx,
                    y: Math.abs(nmy - tmy) < 0.1 ? tmy : nmy,
                }

                if (rmo.x !== curMO.x || rmo.y !== curMO.y) {
                    mouseOffsetRef2.current = rmo
                    setMouseOffset(rmo)
                }
            } else {
                const curMO = mouseOffsetRef2.current

                const rmo = {
                    x:
                        Math.abs(curMO.x) < 0.1
                            ? 0
                            : curMO.x + (0 - curMO.x) * parallaxEase,

                    y:
                        Math.abs(curMO.y) < 0.1
                            ? 0
                            : curMO.y + (0 - curMO.y) * parallaxEase,
                }

                if (rmo.x !== curMO.x || rmo.y !== curMO.y) {
                    mouseOffsetRef2.current = rmo
                    setMouseOffset(rmo)
                }
            }

            raf = requestAnimationFrame(tick)
        }

        raf = requestAnimationFrame(tick)

        return () => cancelAnimationFrame(raf)
    }, [
        inertiaEnabled,
        throwFriction,
        parallaxEnabled,
        parallaxWhileDragging,
        parallaxEase,
        zoomedItem,
        live,
    ])

    /* ---------------------------------------------------------
       Cell size changes
    --------------------------------------------------------- */

    useEffect(() => {
        const rect = containerRef.current?.getBoundingClientRect()

        const pivot = rect
            ? {
                  x: rect.width / 2,
                  y: rect.height / 2,
              }
            : {
                  x: 0,
                  y: 0,
              }

        const vis: Vec2 = {
            x: offsetRef.current.x + inertiaRef.current.x,
            y: offsetRef.current.y + inertiaRef.current.y,
        }

        targetCellSizeRef.current = cellSizeNum
        setTargetCellSize(cellSizeNum)

        setTargetOffset(
            computePinnedOffset(
                currentCellSizeRef.current,
                cellSizeNum,
                pivot,
                vis
            )
        )
    }, [cellSize, cellSizeNum])

    /* ---------------------------------------------------------
       Pointer down
    --------------------------------------------------------- */

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (zoomedItem) return

            didDragRef.current = false

            if (
                inertiaActiveRef.current ||
                inertiaRef.current.x !== 0 ||
                inertiaRef.current.y !== 0
            ) {
                commitInertiaToBase()
            }

            const drift = driftOffsetRef.current

            const merged: Vec2 = {
                x: offsetRef.current.x + drift.x,
                y: offsetRef.current.y + drift.y,
            }

            setOffset(merged)
            setTargetOffset(merged)

            driftOffsetRef.current = {
                x: 0,
                y: 0,
            }

            setDriftOffset({
                x: 0,
                y: 0,
            })

            pointerIdRef.current = e.pointerId
            ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

            isPressingRef.current = true

            setIsDragging(false)

            lastMoveRef.current = {
                x: e.clientX,
                y: e.clientY,
                t: performance.now(),
            }

            velocityRef.current = {
                x: 0,
                y: 0,
            }

            pressPosRef.current = {
                x: e.clientX,
                y: e.clientY,
            }

            startOffsetRef.current = merged

            if (pressTimerRef.current) {
                window.clearTimeout(pressTimerRef.current)
            }

            pressTimerRef.current = window.setTimeout(() => {
                if (!draggingRef.current && isPressingRef.current) {
                    const rect = containerRef.current?.getBoundingClientRect()

                    const pivot = rect
                        ? {
                              x: rect.width / 2,
                              y: rect.height / 2,
                          }
                        : {
                              x: 0,
                              y: 0,
                          }

                    const newSize = cellSizeNum * (props.zoomValue as number)

                    const vis: Vec2 = {
                        x: offsetRef.current.x + inertiaRef.current.x,
                        y: offsetRef.current.y + inertiaRef.current.y,
                    }

                    targetCellSizeRef.current = newSize
                    setTargetCellSize(newSize)

                    setTargetOffset(
                        computePinnedOffset(
                            currentCellSizeRef.current,
                            newSize,
                            pivot,
                            vis
                        )
                    )
                }
            }, PRESS_ZOOM_DELAY)
        },
        [cellSizeNum, props.zoomValue, commitInertiaToBase, zoomedItem]
    )

    /* ---------------------------------------------------------
       Pointer move
    --------------------------------------------------------- */

    const handlePointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (zoomedItem) return

            if (isPressingRef.current) {
                const now = performance.now()

                const dt = Math.max(0.001, (now - lastMoveRef.current.t) / 1000)

                const dx = e.clientX - lastMoveRef.current.x
                const dy = e.clientY - lastMoveRef.current.y

                const vx = clamp(
                    (dx / dt) * (throwVelocityScale as number),
                    -(throwMaxSpeed as number),
                    throwMaxSpeed as number
                )

                const vy = clamp(
                    (dy / dt) * (throwVelocityScale as number),
                    -(throwMaxSpeed as number),
                    throwMaxSpeed as number
                )

                velocityRef.current.x = vx * 0.6 + velocityRef.current.x * 0.4

                velocityRef.current.y = vy * 0.6 + velocityRef.current.y * 0.4

                lastMoveRef.current = {
                    x: e.clientX,
                    y: e.clientY,
                    t: now,
                }
            }

            if (
                parallaxEnabled &&
                (parallaxWhileDragging || !draggingRef.current) &&
                containerRef.current &&
                !(isPressingRef.current || isDragging)
            ) {
                const rect = containerRef.current.getBoundingClientRect()

                setTargetMouseOffset({
                    x:
                        (rect.width / 2 - (e.clientX - rect.left)) *
                        (parallaxStrength as number),

                    y:
                        (rect.height / 2 - (e.clientY - rect.top)) *
                        (parallaxStrength as number),
                })
            }

            if (!isPressingRef.current) return

            const dx = e.clientX - pressPosRef.current.x
            const dy = e.clientY - pressPosRef.current.y

            if (!draggingRef.current && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
                didDragRef.current = true

                setIsDragging(true)
                draggingRef.current = true

                startOffsetRef.current = offsetRef.current
            }

            if (draggingRef.current) {
                const next: Vec2 = {
                    x: startOffsetRef.current.x + dx,
                    y: startOffsetRef.current.y + dy,
                }

                startTransition(() => {
                    setOffset(next)
                    setTargetOffset(next)
                })
            }
        },
        [
            isDragging,
            parallaxEnabled,
            parallaxWhileDragging,
            parallaxStrength,
            throwVelocityScale,
            throwMaxSpeed,
            zoomedItem,
        ]
    )

    /* ---------------------------------------------------------
       Pointer up
    --------------------------------------------------------- */

    const handlePointerUp = useCallback(() => {
        if (zoomedItem) return

        isPressingRef.current = false

        if (pressTimerRef.current) {
            window.clearTimeout(pressTimerRef.current)
            pressTimerRef.current = null
        }

        const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y)

        if (inertiaEnabled && speed >= (throwMinSpeed as number)) {
            inertiaActiveRef.current = true
        } else {
            inertiaActiveRef.current = false

            setInertia({
                x: 0,
                y: 0,
            })

            inertiaRef.current = {
                x: 0,
                y: 0,
            }
        }

        setIsDragging(false)
        draggingRef.current = false

        const rect = containerRef.current?.getBoundingClientRect()

        const pivot = rect
            ? {
                  x: rect.width / 2,
                  y: rect.height / 2,
              }
            : {
                  x: 0,
                  y: 0,
              }

        const vis: Vec2 = {
            x: offsetRef.current.x + inertiaRef.current.x,
            y: offsetRef.current.y + inertiaRef.current.y,
        }

        setTargetMouseOffset({
            x: 0,
            y: 0,
        })

        startTransition(() => {
            const resetSize = cellSizeNum

            targetCellSizeRef.current = resetSize
            setTargetCellSize(resetSize)

            setTargetOffset(
                computePinnedOffset(
                    currentCellSizeRef.current,
                    resetSize,
                    pivot,
                    vis
                )
            )
        })

        // Keep didDragRef true through the click event.
        // Then reset it after.
        window.setTimeout(() => {
            didDragRef.current = false
        }, 0)
    }, [cellSizeNum, inertiaEnabled, throwMinSpeed, zoomedItem])

    const handlePointerLeave = useCallback(() => {
        setTargetMouseOffset({
            x: 0,
            y: 0,
        })
    }, [])

    /* ---------------------------------------------------------
       Wheel
    --------------------------------------------------------- */

    const handleWheel = useCallback(
        (e: React.WheelEvent<HTMLDivElement>) => {
            if (zoomedItem) return

            if (e.deltaX === 0 && e.deltaY === 0) return

            if (
                inertiaActiveRef.current ||
                inertiaRef.current.x !== 0 ||
                inertiaRef.current.y !== 0
            ) {
                commitInertiaToBase()
            }

            const drift = driftOffsetRef.current

            driftOffsetRef.current = {
                x: 0,
                y: 0,
            }

            setDriftOffset({
                x: 0,
                y: 0,
            })

            const next: Vec2 = {
                x: targetOffsetRef.current.x + drift.x - e.deltaX,
                y: targetOffsetRef.current.y + drift.y - e.deltaY,
            }

            startTransition(() => {
                setOffset(next)
                setTargetOffset(next)
            })
        },
        [commitInertiaToBase, zoomedItem]
    )

    /* ---------------------------------------------------------
       Build infinite grid
    --------------------------------------------------------- */

    const gridCells: React.ReactNode[] = []

    const renderX = offset.x + inertia.x + driftOffset.x

    const renderY = offset.y + inertia.y + driftOffset.y

    // Only build what can be seen, plus a 3-tile buffer (was a fixed 20×20 grid)
    const BUFFER = 3

    const colsNeeded = viewport.w
        ? Math.min(20, Math.ceil(viewport.w / currentCellSize) + BUFFER * 2 + 1)
        : 20

    const rowsNeeded = viewport.h
        ? Math.min(20, Math.ceil(viewport.h / currentCellSize) + BUFFER * 2 + 1)
        : 20

    const startX = Math.floor(-renderX / currentCellSize) - BUFFER

    const startY = Math.floor(-renderY / currentCellSize) - BUFFER

    for (let gy = startY; gy < startY + rowsNeeded; gy++) {
        for (let gx = startX; gx < startX + colsNeeded; gx++) {
            // Safe modulo, even for negative coordinates
            const rawIndex = gx + gy * 3

            const itemIndex =
                ((rawIndex % displayItems.length) + displayItems.length) %
                displayItems.length

            const item = displayItems[itemIndex]

            const tileLeft = gx * currentCellSize + renderX + mouseOffset.x

            const tileTop = gy * currentCellSize + renderY + mouseOffset.y

            const { z, yawDeg, pitchDeg, edgeFactor } = calcArcTransform({
                cellCenterX: tileLeft + currentCellSize / 2,

                cellCenterY: tileTop + currentCellSize / 2,

                viewportW: viewport.w || 1,

                viewportH: viewport.h || 1,

                arcAxis,
                arcMaxAngleDeg,
                arcAmount,
            })

            gridCells.push(
                <div
                    key={`${gx}-${gy}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open ${item?.title || "photo"}`}
                    style={{
                        position: "absolute",

                        left: 0,
                        top: 0,

                        width: currentCellSize,
                        height: currentCellSize,

                        borderTop: border.showTop
                            ? `${border.width}px ${border.style} ${themedBorderColor}`
                            : "none",

                        borderLeft: border.showLeft
                            ? `${border.width}px ${border.style} ${themedBorderColor}`
                            : "none",

                        borderRight: border.showRight
                            ? `${border.width}px ${border.style} ${themedBorderColor}`
                            : "none",

                        borderBottom: border.showBottom
                            ? `${border.width}px ${border.style} ${themedBorderColor}`
                            : "none",

                        backgroundColor: "rgba(0,0,0,0.1)",

                        cursor: isDragging ? "grabbing" : "zoom-in",

                        display: "flex",
                        flexDirection: "column",

                        padding: `${cellPadding}px`,

                        boxSizing: "border-box",

                        transformStyle: "preserve-3d",

                        transform: `
                            translate3d(${tileLeft}px,${tileTop}px,${z}px)
                            rotateY(${yawDeg}deg)
                            rotateX(${pitchDeg}deg)
                            scale(${1 - edgeFade * edgeFactor * edgeFactor})
                        `,

                        opacity: 1 - 0.4 * (edgeFactor * arcAmount),

                        transition:
                            "background-color 180ms ease, box-shadow 180ms ease",
                    }}
                    onClick={() => {
                        if (didDragRef.current) return

                        openPhoto(item)
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()

                            openPhoto(item)
                        }
                    }}
                    onMouseEnter={(event) => {
                        event.currentTarget.style.backgroundColor =
                            props.hoverColor || "#FF5588"

                        event.currentTarget.style.boxShadow = `inset 0 0 0 1px ${ACCENT_MIX(
                            45
                        )}`
                    }}
                    onMouseLeave={(event) => {
                        event.currentTarget.style.backgroundColor =
                            "rgba(0,0,0,0.1)"

                        event.currentTarget.style.boxShadow = "none"
                    }}
                >
                    {/* IMAGE */}

                    <div
                        style={{
                            position: "relative",

                            flex: 1,
                            minHeight: 0,

                            overflow: "hidden",

                            marginBottom: `${gap}px`,

                            borderRadius: 4,

                            background:
                                "var(--db-glass, rgba(255,255,255,0.04))",
                        }}
                    >
                        <img
                            src={item?.image?.src || IMG_A}
                            alt={item?.image?.alt || item?.title || ""}
                            draggable={false}
                            style={{
                                display: "block",

                                width: "100%",
                                height: "100%",

                                objectFit: "cover",

                                pointerEvents: "none",

                                userSelect: "none",
                            }}
                        />

                        {/* Tiny zoom affordance */}

                        <div
                            style={{
                                position: "absolute",

                                top: 8,
                                right: 8,

                                width: 28,
                                height: 28,

                                display: "grid",
                                placeItems: "center",

                                borderRadius: 999,

                                background:
                                    "color-mix(in srgb, var(--db-bg, #000) 72%, transparent)",

                                border: "1px solid color-mix(in srgb, var(--db-text, #fff) 16%, transparent)",

                                color: "var(--db-text, #fff)",

                                fontSize: 12,

                                pointerEvents: "none",
                            }}
                        >
                            ↗
                        </div>
                    </div>

                    {/* LABEL */}

                    <div
                        style={{
                            color: themedText,

                            fontSize: 12,

                            fontFamily: "Satoshi, Inter, sans-serif",

                            display: "flex",

                            justifyContent: "space-between",

                            alignItems: "center",

                            gap: 8,
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 700,

                                textTransform: "uppercase",

                                overflow: "hidden",

                                whiteSpace: "nowrap",

                                textOverflow: "ellipsis",
                            }}
                        >
                            {item?.title || "moment"}
                        </span>

                        <span
                            style={{
                                flexShrink: 0,
                            }}
                        >
                            {item?.year || 2024}
                        </span>
                    </div>
                </div>
            )
        }
    }

    /* ---------------------------------------------------------
       Render
    --------------------------------------------------------- */

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
            }}
        >
            <style>{`
                @keyframes dbGalleryBackdropIn {
                    from {
                        opacity: 0;
                    }

                    to {
                        opacity: 1;
                    }
                }

                @keyframes dbGalleryPhotoIn {
                    from {
                        opacity: 0;
                        transform: scale(.9) translateY(14px);
                    }

                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                @keyframes dbGalleryMetaIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .db-gallery-close:hover {
                    transform: scale(1.06);
                    background: var(--db-accent, #F3500F) !important;
                }

                @media (max-width: 600px) {
                    .db-gallery-header {
                        padding: 20px 18px 0 !important;
                    }

                    .db-gallery-lightbox {
                        padding: 14px !important;
                    }

                    .db-gallery-lightbox-card {
                        width: 100% !important;
                        height: min(84vh, 760px) !important;
                    }

                    .db-gallery-lightbox-image {
                        border-radius: 14px !important;
                    }

                    .db-gallery-lightbox-meta {
                        padding-left: 2px;
                        padding-right: 2px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .db-gallery-lightbox,
                    .db-gallery-photo-animation,
                    .db-gallery-lightbox-meta {
                        animation: none !important;
                    }
                }
            `}</style>

            {/* =================================================
                INFINITE GALLERY
            ================================================= */}

            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",

                    backgroundColor: themedBg,

                    position: "relative",

                    overflow: "hidden",

                    touchAction: "none",

                    cursor: isDragging ? "grabbing" : "grab",

                    userSelect: "none",

                    perspective: "1000px",

                    transformStyle: "preserve-3d",
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onWheel={handleWheel}
            >
                <div
                    style={{
                        position: "absolute",

                        width: "100%",
                        height: "100%",

                        transformStyle: "preserve-3d",
                    }}
                >
                    {gridCells}
                </div>

                {/* Edge vignette */}

                <div
                    style={{
                        position: "absolute",

                        inset: 0,

                        pointerEvents: "none",

                        background: `
                            radial-gradient(
                                ellipse at center,
                                transparent 30%,
                                ${BG_MIX(20)} 60%,
                                ${BG_MIX(80)} 90%,
                                var(--db-bg, #000000) 100%
                            )
                        `,
                    }}
                />
            </div>

            {/* =================================================
                HEADER

                NO CATEGORY PILLS HERE ANYMORE.
            ================================================= */}

            {showHeader && (
                <div
                    className="db-gallery-header"
                    style={{
                        position: "absolute",

                        top: 0,
                        left: 0,
                        right: 0,

                        padding: "28px 36px 0",

                        pointerEvents: "none",

                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",

                            alignItems: "center",

                            gap: 8,
                        }}
                    >
                        <span
                            style={{
                                fontSize: 16,
                            }}
                        >
                            📌
                        </span>

                        <h2
                            style={{
                                fontFamily: "Satoshi, Inter, sans-serif",

                                fontSize: "clamp(18px, 3vw, 28px)",

                                fontWeight: 700,

                                color: "var(--db-text, #FAFAFA)",

                                margin: 0,

                                letterSpacing: "-0.02em",
                            }}
                        >
                            {headerText}
                        </h2>
                    </div>

                    <p
                        style={{
                            fontFamily: "Satoshi, Inter, sans-serif",

                            fontSize: 10,

                            color: "var(--db-text-2, rgba(255,255,255,0.42))",

                            margin: "4px 0 0 24px",

                            letterSpacing: "0.04em",
                        }}
                    >
                        {headerSubtext}
                    </p>
                </div>
            )}

            {/* =================================================
                PHOTO LIGHTBOX
            ================================================= */}

            {zoomedItem && (
                <div
                    className="db-gallery-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Viewing ${zoomedItem.title}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerMove={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                    onClick={closePhoto}
                    style={{
                        position: "absolute",

                        inset: 0,

                        zIndex: 100,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        padding: "clamp(18px, 4vw, 48px)",

                        boxSizing: "border-box",

                        background:
                            "color-mix(in srgb, var(--db-bg, #000) 80%, transparent)",

                        backdropFilter: "blur(26px)",

                        WebkitBackdropFilter: "blur(26px)",

                        animation: "dbGalleryBackdropIn 180ms ease-out",

                        cursor: "zoom-out",
                    }}
                >
                    {/* CLOSE BUTTON */}

                    <button
                        className="db-gallery-close"
                        aria-label="Close photo"
                        onClick={(event) => {
                            event.stopPropagation()
                            closePhoto()
                        }}
                        style={{
                            appearance: "none",
                            WebkitAppearance: "none",

                            position: "absolute",

                            top: "clamp(14px, 2.5vw, 26px)",

                            right: "clamp(14px, 2.5vw, 26px)",

                            zIndex: 20,

                            width: 42,
                            height: 42,

                            display: "grid",

                            placeItems: "center",

                            borderRadius: 999,

                            border: "1px solid var(--db-glass-line, rgba(255,255,255,.16))",

                            background: "var(--db-glass, rgba(15,15,15,.72))",

                            backdropFilter: "blur(16px)",

                            WebkitBackdropFilter: "blur(16px)",

                            color: "var(--db-text, #fff)",

                            fontSize: 22,

                            lineHeight: 1,

                            cursor: "pointer",

                            transition:
                                "transform 160ms ease, background 160ms ease",
                        }}
                    >
                        ×
                    </button>

                    {/* PHOTO CARD */}

                    <div
                        className="db-gallery-lightbox-card"
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            width: "min(92vw, 1100px)",

                            height: "min(86vh, 900px)",

                            display: "flex",

                            flexDirection: "column",

                            gap: 14,

                            cursor: "default",
                        }}
                    >
                        {/* IMAGE */}

                        <div
                            className="db-gallery-lightbox-image db-gallery-photo-animation"
                            onClick={() => setDetailZoom((prev) => !prev)}
                            style={{
                                position: "relative",

                                flex: 1,

                                minHeight: 0,

                                overflow: "hidden",

                                display: "flex",

                                alignItems: "center",

                                justifyContent: "center",

                                borderRadius: 18,

                                background:
                                    "color-mix(in srgb, var(--db-surface, #000) 88%, transparent)",

                                border: "1px solid var(--db-glass-line, rgba(255,255,255,.12))",

                                boxShadow: "0 30px 100px rgba(0,0,0,.42)",

                                cursor: detailZoom ? "zoom-out" : "zoom-in",

                                animation:
                                    "dbGalleryPhotoIn 260ms cubic-bezier(.2,.8,.2,1)",
                            }}
                        >
                            <img
                                src={zoomedItem.image?.src}
                                alt={zoomedItem.image?.alt || zoomedItem.title}
                                draggable={false}
                                style={{
                                    display: "block",

                                    width: "100%",
                                    height: "100%",

                                    objectFit: detailZoom ? "cover" : "contain",

                                    transform: detailZoom
                                        ? "scale(1.75)"
                                        : "scale(1)",

                                    transition:
                                        "transform 420ms cubic-bezier(.2,.8,.2,1)",

                                    userSelect: "none",

                                    touchAction: "pinch-zoom",
                                }}
                            />

                            {/* zoom hint */}

                            <div
                                style={{
                                    position: "absolute",

                                    bottom: 14,
                                    right: 14,

                                    padding: "7px 10px",

                                    borderRadius: 999,

                                    background:
                                        "color-mix(in srgb, var(--db-bg, #000) 72%, transparent)",

                                    border: "1px solid color-mix(in srgb, var(--db-text, #fff) 14%, transparent)",

                                    backdropFilter: "blur(12px)",

                                    WebkitBackdropFilter: "blur(12px)",

                                    color: "var(--db-text, #fff)",

                                    fontFamily: "Satoshi, Inter, sans-serif",

                                    fontSize: 10,

                                    fontWeight: 600,

                                    letterSpacing: ".06em",

                                    pointerEvents: "none",
                                }}
                            >
                                {detailZoom ? "CLICK TO FIT" : "CLICK TO ZOOM"}
                            </div>
                        </div>

                        {/* META */}

                        <div
                            className="db-gallery-lightbox-meta"
                            style={{
                                display: "flex",

                                alignItems: "center",

                                justifyContent: "space-between",

                                gap: 20,

                                color: "var(--db-text, #fff)",

                                fontFamily: "Satoshi, Inter, sans-serif",

                                animation:
                                    "dbGalleryMetaIn 280ms 70ms both ease-out",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "clamp(15px, 2vw, 20px)",

                                    fontWeight: 650,

                                    letterSpacing: "-.02em",
                                }}
                            >
                                {zoomedItem.title}
                            </div>

                            <div
                                style={{
                                    fontSize: 12,

                                    color: "var(--db-text-2, rgba(255,255,255,.55))",

                                    flexShrink: 0,
                                }}
                            >
                                {zoomedItem.year}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/* ===========================================================
   FRAMER PROPERTY CONTROLS
=========================================================== */

addPropertyControls(PhantomInfiniteGallery, {
    items: {
        type: ControlType.Array,
        title: "Photos",

        control: {
            type: ControlType.Object,

            controls: {
                title: {
                    type: ControlType.String,

                    defaultValue: "moment",
                },

                image: {
                    type: ControlType.ResponsiveImage,
                },

                year: {
                    type: ControlType.Number,

                    defaultValue: 2024,

                    min: 1900,
                    max: 2100,

                    displayStepper: true,
                },

                // Category stays in the data so none of your
                // existing Framer items get disrupted.
                // It simply does NOT affect the UI anymore.
                category: {
                    type: ControlType.String,

                    defaultValue: "hobbies",
                },
            },
        },

        defaultValue: DEFAULT_ITEMS,
    },

    showHeader: {
        type: ControlType.Boolean,

        title: "Show Header",

        defaultValue: true,
    },

    headerText: {
        type: ControlType.String,

        title: "Header Text",

        defaultValue: "where i've touched grass",

        hidden: (p: any) => !p.showHeader,
    },

    headerSubtext: {
        type: ControlType.String,

        title: "Header Subtext",

        defaultValue: "drag to explore ✦ click a photo to zoom",

        hidden: (p: any) => !p.showHeader,
    },

    autoDrift: {
        type: ControlType.Boolean,

        title: "Auto Drift",

        defaultValue: true,
    },

    autoDriftSpeedX: {
        type: ControlType.Number,

        title: "Drift Speed X",

        min: -200,
        max: 200,

        step: 5,

        defaultValue: -25,

        unit: "px/s",

        hidden: (p: any) => !p.autoDrift,
    },

    autoDriftSpeedY: {
        type: ControlType.Number,

        title: "Drift Speed Y",

        min: -200,
        max: 200,

        step: 5,

        defaultValue: -10,

        unit: "px/s",

        hidden: (p: any) => !p.autoDrift,
    },

    cellSize: {
        type: ControlType.Number,

        title: "Cell Size",

        min: 100,
        max: 400,

        step: 10,

        defaultValue: 200,

        unit: "px",
    },

    gap: {
        type: ControlType.Number,

        title: "Image Gap",

        min: 0,
        max: 50,

        step: 1,

        defaultValue: 12,

        unit: "px",
    },

    backgroundColor: {
        type: ControlType.Color,

        title: "Background",

        defaultValue: "#000000",
    },

    textColor: {
        type: ControlType.Color,

        title: "Text Color",

        defaultValue: "#808080",
    },

    border: {
        type: ControlType.Object,

        title: "Border",

        controls: {
            width: {
                type: ControlType.Number,

                title: "Width",

                min: 0,
                max: 10,

                step: 1,

                defaultValue: 1,

                unit: "px",
            },

            style: {
                type: ControlType.Enum,

                title: "Style",

                options: ["solid", "dashed", "dotted", "double"],

                optionTitles: ["Solid", "Dashed", "Dotted", "Double"],

                defaultValue: "solid",
            },

            color: {
                type: ControlType.Color,

                title: "Color",

                defaultValue: "#FFFFFF",
            },

            showTop: {
                type: ControlType.Boolean,

                title: "Show Top",

                defaultValue: false,
            },

            showBottom: {
                type: ControlType.Boolean,

                title: "Show Bottom",

                defaultValue: true,
            },

            showLeft: {
                type: ControlType.Boolean,

                title: "Show Left",

                defaultValue: true,
            },

            showRight: {
                type: ControlType.Boolean,

                title: "Show Right",

                defaultValue: true,
            },
        },

        defaultValue: {
            width: 1,

            style: "solid",

            color: "#FFFFFF",

            showTop: false,

            showBottom: true,

            showLeft: true,

            showRight: true,
        },
    },

    hoverColor: {
        type: ControlType.Color,

        title: "Hover Color",

        defaultValue: "#FF5588",
    },

    cellPadding: {
        type: ControlType.Number,

        title: "Cell Padding",

        min: 0,
        max: 50,

        step: 1,

        defaultValue: 10,

        unit: "px",
    },

    zoomValue: {
        type: ControlType.Number,

        title: "Press Zoom",

        min: 0.1,
        max: 1,

        step: 0.05,

        defaultValue: 0.7,
    },

    arcAmount: {
        type: ControlType.Number,

        title: "Arc Amount",

        min: 0,
        max: 1,

        step: 0.01,

        defaultValue: 0.6,
    },

    arcMaxAngleDeg: {
        type: ControlType.Number,

        title: "Arc Max Angle",

        min: 0,
        max: 60,

        step: 1,

        defaultValue: 28,
    },

    arcAxis: {
        type: ControlType.Enum,

        title: "Arc Axis",

        options: ["horizontal", "vertical"],

        optionTitles: ["Horizontal", "Vertical"],

        defaultValue: "horizontal",
    },

    edgeFade: {
        type: ControlType.Number,

        title: "Edge Fade",

        min: 0,
        max: 1,

        step: 0.01,

        defaultValue: 0.25,
    },

    parallaxEnabled: {
        type: ControlType.Boolean,

        title: "Parallax",

        defaultValue: true,
    },

    parallaxStrength: {
        type: ControlType.Number,

        title: "Parallax Strength",

        min: 0,
        max: 0.5,

        step: 0.01,

        defaultValue: 0.1,
    },

    parallaxEase: {
        type: ControlType.Number,

        title: "Parallax Ease",

        min: 0.01,
        max: 0.5,

        step: 0.01,

        defaultValue: 0.12,
    },

    parallaxWhileDragging: {
        type: ControlType.Boolean,

        title: "Parallax While Drag",

        defaultValue: false,
    },

    inertiaEnabled: {
        type: ControlType.Boolean,

        title: "Throw / Inertia",

        defaultValue: true,
    },

    throwFriction: {
        type: ControlType.Number,

        title: "Friction",

        min: 0.85,
        max: 0.99,

        step: 0.001,

        defaultValue: 0.92,
    },

    throwVelocityScale: {
        type: ControlType.Number,

        title: "Velocity Scale",

        min: 0.5,
        max: 2,

        step: 0.05,

        defaultValue: 1,
    },

    throwMinSpeed: {
        type: ControlType.Number,

        title: "Min Speed (px/s)",

        min: 0,
        max: 500,

        step: 10,

        defaultValue: 80,
    },

    throwMaxSpeed: {
        type: ControlType.Number,

        title: "Max Speed (px/s)",

        min: 500,
        max: 6000,

        step: 100,

        defaultValue: 2500,
    },
})
