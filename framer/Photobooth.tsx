import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerIntrinsicWidth 310
 * @framerIntrinsicHeight 700
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

// Oct 11 (perf pass, "site is slow with the motion graphics"): same look and props, cheaper loop.
//  • The print loop only runs while the strip is on screen and the tab is visible; CSS motion
//    (roller, LED, vibration) is paused otherwise.
//  • The first print starts after the page has painted (idle callback), not during load.
//  • The machine no longer remounts every cycle; only the paper strip restarts.
//  • LED pulse animates opacity only (no per-frame box-shadow repaint); the vibrating machine is
//    promoted to its own layer while printing so the blurred slot/strip shadows aren't repainted.

type Img = any

interface Props {
    photo1: Img
    photo2: Img
    photo3: Img
    photo4: Img

    frameColor: string
    innerMetal: string
    rollerColor: string
    paperColor: string
    accentColor: string

    photoGap: number
    printDuration: number
    holdDuration: number

    loop: boolean

    showFooter: boolean
    footerText: string

    style?: React.CSSProperties
}

function imageSrc(image: Img) {
    if (!image) return ""

    if (typeof image === "string") {
        return image
    }

    return image.src || ""
}

/* =========================================================
   PHOTO
   ========================================================= */

function StripPhoto({ image, index }: { image: Img; index: number }) {
    const src = imageSrc(image)

    return (
        <div className="mech-photo">
            {src ? (
                <img
                    src={src}
                    srcSet={image?.srcSet}
                    draggable={false}
                    alt={`Photo strip frame ${index + 1}`}
                />
            ) : (
                <div className="mech-placeholder">add photo {index + 1}</div>
            )}

            <span className="mech-photo-finish" />
        </div>
    )
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function MechanicalPhotoStripV2(props: Props) {
    const {
        photo1,
        photo2,
        photo3,
        photo4,

        frameColor = "#111111",
        innerMetal = "#77736d",
        rollerColor = "#111111",
        paperColor = "#f4f1e9",
        accentColor = "#ff5c9d",

        photoGap = 7,
        printDuration = 4.5,
        holdDuration = 3.4,

        loop = true,

        showFooter = true,
        footerText = "dhwanibagrecha.com",

        style,
    } = props

    const rootRef = useRef<HTMLDivElement>(null)

    const reduced = !!useReducedMotion()

    const [compact, setCompact] = useState(false)

    const [cycle, setCycle] = useState(0)

    const [printing, setPrinting] = useState(true)

    // On screen + tab visible. Starts true so the canvas/static render matches the original.
    const [active, setActive] = useState(true)

    // First print waits until after first paint.
    const [started, setStarted] = useState(false)

    useEffect(() => {
        if (typeof window === "undefined") return
        const w = window as any
        let idle = 0
        let t = 0
        if (typeof w.requestIdleCallback === "function") {
            idle = w.requestIdleCallback(() => setStarted(true), {
                timeout: 1200,
            })
        } else {
            t = window.setTimeout(() => setStarted(true), 300)
        }
        return () => {
            if (idle && typeof w.cancelIdleCallback === "function")
                w.cancelIdleCallback(idle)
            window.clearTimeout(t)
        }
    }, [])

    useEffect(() => {
        const el = rootRef.current
        if (!el || typeof window === "undefined") return
        let near = true
        const sync = () => setActive(near && !document.hidden)
        const io =
            typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      ([entry]) => {
                          near = !!entry?.isIntersecting
                          sync()
                      },
                      { rootMargin: "100px 0px" }
                  )
                : null
        io?.observe(el)
        document.addEventListener("visibilitychange", sync)
        return () => {
            io?.disconnect()
            document.removeEventListener("visibilitychange", sync)
        }
    }, [])

    /* =====================================================
       RESPONSIVE
       ===================================================== */

    useEffect(() => {
        const el = rootRef.current

        if (!el || typeof ResizeObserver === "undefined") {
            return
        }

        const ro = new ResizeObserver(([entry]) => {
            setCompact(entry.contentRect.width < 270)
        })

        ro.observe(el)

        return () => ro.disconnect()
    }, [])

    /* =====================================================
       LOOP
       ===================================================== */

    useEffect(() => {
        if (!loop || reduced || !active || !started) {
            return
        }

        const total = (printDuration + holdDuration) * 1000

        const timer = window.setInterval(() => {
            setCycle((n) => n + 1)
        }, total)

        return () => window.clearInterval(timer)
    }, [loop, reduced, printDuration, holdDuration, active, started])

    useEffect(() => {
        setPrinting(true)
    }, [cycle])

    /* =====================================================
       DIMENSIONS
       ===================================================== */

    const machineWidth = compact ? 184 : 236

    const stripWidth = machineWidth * 0.46

    const imageHeight = stripWidth * 0.82

    const sidePad = stripWidth * 0.06

    const topPad = sidePad

    const footerHeight = showFooter ? 20 : 8

    const stripHeight =
        topPad * 2 + imageHeight * 4 + photoGap * 3 + footerHeight

    const housingHeight = compact ? 216 : 250

    const componentHeight = stripHeight + 135

    /*
     * Most of the strip starts hidden
     * behind the feed mechanism.
     */

    const hiddenY = -(stripHeight - 8)

    /*
     * Uneven feed positions:
     * advance / micro-stop / advance.
     */

    const feedY = reduced
        ? [0]
        : [
              hiddenY,
              hiddenY,

              hiddenY * 0.84,
              hiddenY * 0.82,

              hiddenY * 0.64,
              hiddenY * 0.62,

              hiddenY * 0.43,
              hiddenY * 0.41,

              hiddenY * 0.22,
              hiddenY * 0.2,

              -3,
              0,
          ]

    const feedTimes = [
        0, 0.04,

        0.16, 0.2,

        0.34, 0.38,

        0.52, 0.56,

        0.7, 0.74,

        0.94, 1,
    ]

    const photos = [photo1, photo2, photo3, photo4]

    /* =====================================================
       CSS
       ===================================================== */

    const css = `
        .mech-root {
            --mech-accent:
                var(
                    --db-accent,
                    ${accentColor}
                );

            width: 100%;
            height: 100%;

            min-height:
                ${componentHeight}px;

            display: flex;

            justify-content:
                center;

            overflow: hidden;

            box-sizing:
                border-box;
        }

        /* =========================================
           MACHINE
           ========================================= */

        .mech-machine {
            position: relative;

            width:
                ${machineWidth}px;

            height:
                ${componentHeight}px;

            flex: none;
        }

        /* =========================================
           OUTER HOUSING
           ========================================= */

        .mech-housing {
            position: absolute;

            left: 0;
            right: 0;
            top: 0;

            height:
                ${housingHeight}px;

            z-index: 20;

            border-radius:
                15px;

            background:
                linear-gradient(
                    145deg,
                    rgba(
                        255,
                        255,
                        255,
                        .07
                    ),
                    transparent
                    19%
                ),
                linear-gradient(
                    180deg,
                    color-mix(
                        in srgb,
                        ${frameColor}
                        93%,
                        #ffffff
                    ),
                    ${frameColor}
                    48%,
                    color-mix(
                        in srgb,
                        ${frameColor}
                        80%,
                        #000000
                    )
                );

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    .055
                );

            box-shadow:
                0 28px 60px
                    rgba(
                        0,
                        0,
                        0,
                        .34
                    ),
                inset
                0 1px 0
                    rgba(
                        255,
                        255,
                        255,
                        .055
                    ),
                inset
                0 -1px 0
                    rgba(
                        0,
                        0,
                        0,
                        .7
                    );
        }

        /* =========================================
           INSET FRAME
           ========================================= */

        .mech-bezel {
            position: absolute;

            left: 5.5%;
            right: 5.5%;

            top: 5%;
            bottom: 5%;

            border-radius:
                10px;

            background:
                linear-gradient(
                    145deg,
                    rgba(
                        255,
                        255,
                        255,
                        .045
                    ),
                    transparent
                    23%
                ),
                #090909;

            box-shadow:
                inset
                0 0 0
                1px
                    rgba(
                        255,
                        255,
                        255,
                        .045
                    ),
                inset
                0 12px 30px
                    rgba(
                        0,
                        0,
                        0,
                        .7
                    );

            overflow: hidden;
        }

        /* =========================================
           METAL CAVITY
           ========================================= */

        .mech-cavity {
            position: absolute;

            left: 6%;
            right: 6%;

            top: 8%;
            bottom: 7%;

            border-radius:
                7px;

            overflow: hidden;

            background:
                linear-gradient(
                    90deg,
                    rgba(
                        0,
                        0,
                        0,
                        .22
                    ),
                    transparent 15%,
                    transparent 85%,
                    rgba(
                        0,
                        0,
                        0,
                        .24
                    )
                ),
                linear-gradient(
                    180deg,
                    color-mix(
                        in srgb,
                        ${innerMetal}
                        108%,
                        #fff
                    ),
                    ${innerMetal}
                    45%,
                    color-mix(
                        in srgb,
                        ${innerMetal}
                        66%,
                        #252321
                    )
                );

            border:
                1px solid
                rgba(
                    0,
                    0,
                    0,
                    .48
                );

            box-shadow:
                inset
                0 16px 23px
                    rgba(
                        0,
                        0,
                        0,
                        .3
                    ),
                inset
                0 -5px 14px
                    rgba(
                        255,
                        255,
                        255,
                        .045
                    );
        }

        /* =========================================
           SIDE PAPER GUIDES
           ========================================= */

        .mech-guide {
            position: absolute;

            top: 31%;

            width: 2px;

            height: 48%;

            opacity: .42;

            background:
                linear-gradient(
                    180deg,
                    transparent,
                    rgba(
                        255,
                        255,
                        255,
                        .22
                    )
                    20%,
                    rgba(
                        0,
                        0,
                        0,
                        .3
                    )
                    80%,
                    transparent
                );
        }

        .mech-guide-left {
            left: 24%;
        }

        .mech-guide-right {
            right: 24%;
        }

        /* =========================================
           SCREWS
           ========================================= */

        .mech-screw {
            position: absolute;

            z-index: 50;

            width: 6px;
            height: 6px;

            border-radius: 50%;

            background:
                radial-gradient(
                    circle
                    at
                    38% 32%,
                    #b7b2aa,
                    #59554f
                    52%,
                    #2e2c29
                );

            box-shadow:
                0 1px 2px
                    rgba(
                        0,
                        0,
                        0,
                        .55
                    );
        }

        .mech-screw::after {
            content: "";

            position: absolute;

            left: 1px;
            right: 1px;

            top: 50%;

            height: 1px;

            background:
                rgba(
                    0,
                    0,
                    0,
                    .5
                );

            transform:
                rotate(-17deg);
        }

        .mech-screw-a {
            left: 8%;
            top: 7%;
        }

        .mech-screw-b {
            right: 8%;
            top: 7%;
        }

        .mech-screw-c {
            left: 8%;
            bottom: 7%;
        }

        .mech-screw-d {
            right: 8%;
            bottom: 7%;
        }

        /* =========================================
           LED
           ========================================= */

        .mech-led {
            position: absolute;

            z-index: 60;

            right: 10%;

            top: 12%;

            width: 5px;
            height: 5px;

            border-radius:
                50%;

            background:
                var(
                    --mech-accent
                );

            box-shadow:
                0 0 8px
                    var(
                        --mech-accent
                    );

            opacity:
                .8;
        }

        .mech-printing
        .mech-led {
            animation:
                mech-led-pulse
                .78s
                ease-in-out
                infinite;
        }

        @keyframes
        mech-led-pulse {
            0%,
            100% {
                opacity:
                    .46;
            }

            50% {
                opacity:
                    1;
            }
        }

        /* =========================================
           ROLLER ASSEMBLY
           ========================================= */

        .mech-roller-zone {
            position: absolute;

            z-index: 65;

            left: 13%;
            right: 13%;

            top: 16%;

            height: 44px;
        }

        .mech-bearing {
            position: absolute;

            top: 11px;

            width: 20px;
            height: 24px;

            border-radius:
                5px;

            background:
                linear-gradient(
                    90deg,
                    #4f4b46,
                    #ada69d
                    46%,
                    #59544e
                );

            border:
                1px solid
                rgba(
                    0,
                    0,
                    0,
                    .32
                );

            box-shadow:
                0 3px 4px
                    rgba(
                        0,
                        0,
                        0,
                        .42
                    ),
                inset
                0 1px 0
                    rgba(
                        255,
                        255,
                        255,
                        .23
                    );
        }

        .mech-bearing-left {
            left: 0;
        }

        .mech-bearing-right {
            right: 0;
        }

        .mech-roller {
            position: absolute;

            left: 14px;
            right: 14px;

            top: 7px;

            height: 31px;

            overflow: hidden;

            border-radius:
                999px;

            background:
                linear-gradient(
                    180deg,
                    #262626,
                    ${rollerColor}
                    46%,
                    #080808
                );

            box-shadow:
                inset
                0 4px 7px
                    rgba(
                        255,
                        255,
                        255,
                        .055
                    ),
                inset
                0 -5px 7px
                    rgba(
                        0,
                        0,
                        0,
                        .75
                    ),
                0 4px 6px
                    rgba(
                        0,
                        0,
                        0,
                        .5
                    );
        }

        /*
         * Moving highlight = rotating cylinder.
         */

        .mech-roller-highlight {
            position: absolute;

            left: 0;
            right: 0;

            top: -90%;

            height: 300%;

            background:
                repeating-linear-gradient(
                    180deg,
                    transparent
                    0 11px,
                    rgba(
                        255,
                        255,
                        255,
                        .052
                    )
                    11px 14px,
                    transparent
                    14px 27px
                );
        }

        .mech-printing
        .mech-roller-highlight {
            animation:
                mech-roll
                .31s
                linear
                infinite;
        }

        @keyframes
        mech-roll {
            from {
                transform:
                    translateY(0);
            }

            to {
                transform:
                    translateY(27px);
            }
        }

        /* =========================================
           SLOT
           ========================================= */

        .mech-slot-shadow {
            position: absolute;

            z-index: 58;

            left: 50%;

            top: 32%;

            width:
                ${stripWidth + 22}px;

            height: 18px;

            transform:
                translateX(-50%);

            border-radius:
                7px;

            background:
                rgba(
                    0,
                    0,
                    0,
                    .42
                );

            filter:
                blur(5px);
        }

        .mech-slot {
            position: absolute;

            z-index: 70;

            left: 50%;

            top: 31%;

            width:
                ${stripWidth + 17}px;

            height: 11px;

            transform:
                translateX(-50%);

            border-radius:
                2px 2px 6px 6px;

            background:
                linear-gradient(
                    180deg,
                    #010101,
                    #151515
                );

            box-shadow:
                inset
                0 3px 6px
                    rgba(
                        0,
                        0,
                        0,
                        .95
                    ),
                0 1px 0
                    rgba(
                        255,
                        255,
                        255,
                        .04
                    );
        }

        /* =========================================
           FEED MASK
           ========================================= */

        .mech-feed-window {
            position: absolute;

            z-index: 30;

            left: 50%;

            top:
                ${housingHeight * 0.31 + 7}px;

            width:
                ${stripWidth + 30}px;

            height:
                ${stripHeight + 28}px;

            transform:
                translateX(-50%);

            overflow: hidden;

            pointer-events: none;
        }

        /* =========================================
           STRIP
           ========================================= */

        .mech-strip {
            position: absolute;

            left: 50%;
            top: 0;

            width:
                ${stripWidth}px;

            padding:
                ${topPad}px
                ${sidePad}px
                ${topPad}px;

            box-sizing:
                border-box;

            display: grid;

            gap:
                ${photoGap}px;

            transform-origin:
                50% 0%;

            background:
                ${paperColor};

            border:
                1px solid
                rgba(
                    0,
                    0,
                    0,
                    .055
                );

            box-shadow:
                0 11px 18px
                    rgba(
                        0,
                        0,
                        0,
                        .21
                    );
        }

        /* physical paper shading */

        .mech-strip::before {
            content: "";

            position: absolute;

            inset: 0;

            pointer-events: none;

            background:
                linear-gradient(
                    90deg,
                    rgba(
                        0,
                        0,
                        0,
                        .025
                    ),
                    transparent 12%,
                    transparent 87%,
                    rgba(
                        0,
                        0,
                        0,
                        .035
                    )
                ),
                linear-gradient(
                    180deg,
                    rgba(
                        255,
                        255,
                        255,
                        .2
                    ),
                    transparent 9%
                );
        }

        /*
         * Bottom edge soft shadow.
         */

        .mech-strip::after {
            content: "";

            position: absolute;

            left: 7%;
            right: 7%;

            bottom: -4px;

            height: 7px;

            z-index: -1;

            border-radius: 50%;

            background:
                rgba(
                    0,
                    0,
                    0,
                    .16
                );

            filter:
                blur(4px);
        }

        /* =========================================
           PHOTOS
           ========================================= */

        .mech-photo {
            position: relative;

            width: 100%;

            height:
                ${imageHeight}px;

            overflow: hidden;

            background:
                #d6d3cd;
        }

        .mech-photo img {
            display: block;

            width: 100%;
            height: 100%;

            object-fit: cover;

            filter:
                contrast(1.025)
                saturate(.91)
                brightness(1.015);
        }

        .mech-photo-finish {
            position: absolute;

            inset: 0;

            pointer-events: none;

            background:
                linear-gradient(
                    180deg,
                    rgba(
                        236,
                        200,
                        150,
                        .035
                    ),
                    transparent 42%,
                    rgba(
                        58,
                        77,
                        102,
                        .025
                    )
                );
        }

        .mech-placeholder {
            width: 100%;
            height: 100%;

            display: grid;

            place-items: center;

            color:
                rgba(
                    30,
                    30,
                    30,
                    .35
                );

            font:
                500
                7px/1
                "Poppins",
                sans-serif;

            letter-spacing:
                .06em;

            text-transform:
                uppercase;
        }

        /* =========================================
           FOOTER
           ========================================= */

        .mech-footer {
            height:
                ${footerHeight}px;

            display: flex;

            align-items:
                flex-end;

            justify-content:
                center;

            color:
                rgba(
                    20,
                    20,
                    20,
                    .36
                );

            font:
                500
                5.5px/1
                "Poppins",
                sans-serif;

            letter-spacing:
                .08em;

            text-transform:
                uppercase;
        }

        /* =========================================
           MACHINE MICRO-VIBRATION
           ========================================= */

        .mech-printing {
            animation:
                mech-vibrate
                .14s
                linear
                infinite;

            will-change:
                translate;
        }

        /* off screen or tab hidden: freeze CSS motion */

        .mech-paused,
        .mech-paused *,
        .mech-paused *::before,
        .mech-paused *::after {
            animation-play-state:
                paused !important;
        }

        @keyframes
        mech-vibrate {
            0% {
                translate:
                    0 0;
            }

            25% {
                translate:
                    -.3px .15px;
            }

            50% {
                translate:
                    .25px 0;
            }

            75% {
                translate:
                    -.12px -.12px;
            }

            100% {
                translate:
                    0 0;
            }
        }

        /* =========================================
           REDUCED MOTION
           ========================================= */

        @media
        (
            prefers-reduced-motion:
            reduce
        ) {
            .mech-root *,
            .mech-root *::before,
            .mech-root *::after {
                animation:
                    none !important;

                transition:
                    none !important;
            }
        }
    `

    return (
        <div ref={rootRef} className="mech-root" style={style}>
            <style>{css}</style>

            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap"
            />

            <div
                className={`mech-machine ${printing && started ? "mech-printing" : ""}${active ? "" : " mech-paused"}`}
            >
                {/* =================================
                    MACHINE HOUSING
                    ================================= */}

                <div className="mech-housing">
                    <div className="mech-bezel">
                        <div className="mech-cavity">
                            <span className="mech-guide mech-guide-left" />
                            <span className="mech-guide mech-guide-right" />
                        </div>
                    </div>

                    {/* screws */}

                    <span className="mech-screw mech-screw-a" />
                    <span className="mech-screw mech-screw-b" />
                    <span className="mech-screw mech-screw-c" />
                    <span className="mech-screw mech-screw-d" />

                    {/* status */}

                    <span className="mech-led" />

                    {/* roller */}

                    <div className="mech-roller-zone">
                        <span className="mech-bearing mech-bearing-left" />

                        <span className="mech-bearing mech-bearing-right" />

                        <div className="mech-roller">
                            <div className="mech-roller-highlight" />
                        </div>
                    </div>

                    {/* output slot */}

                    <div className="mech-slot-shadow" />
                    <div className="mech-slot" />
                </div>

                {/* =================================
                    PAPER FEED
                    ================================= */}

                <div className="mech-feed-window">
                    <motion.div
                        key={`paper-${cycle}`}
                        className="mech-strip"
                        initial={
                            reduced
                                ? {
                                      x: "-50%",

                                      y: 0,

                                      rotate: -0.6,
                                  }
                                : {
                                      x: "-50%",

                                      y: hiddenY,

                                      rotate: 0,
                                  }
                        }
                        animate={
                            !reduced && !started
                                ? undefined
                                : reduced
                                ? {
                                      x: "-50%",

                                      y: 0,

                                      rotate: -0.6,
                                  }
                                : {
                                      x: "-50%",

                                      y: feedY,

                                      /*
                                       * Mechanical wobble while
                                       * feeding, then slight
                                       * imperfect hang.
                                       */

                                      rotate: [
                                          0, 0,

                                          -0.12, 0.09,

                                          -0.1, 0.07,

                                          -0.08, 0.06,

                                          -0.06, 0.04,

                                          -0.8, -0.65,
                                      ],

                                      /*
                                       * Slight paper curl after
                                       * the strip clears the rollers.
                                       */

                                      scaleX: [
                                          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.996,
                                          1,
                                      ],
                                  }
                        }
                        transition={
                            reduced
                                ? undefined
                                : {
                                      duration: printDuration,

                                      times: feedTimes,

                                      ease: "linear",
                                  }
                        }
                        onAnimationComplete={() => setPrinting(false)}
                    >
                        {photos.map((photo, index) => (
                            <StripPhoto
                                key={index}
                                image={photo}
                                index={index}
                            />
                        ))}

                        {showFooter && (
                            <div className="mech-footer">{footerText}</div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

MechanicalPhotoStripV2.displayName = "Mechanical Photo Strip V2"

/* =========================================================
   FRAMER CONTROLS
   ========================================================= */

addPropertyControls(MechanicalPhotoStripV2, {
    photo1: {
        type: ControlType.ResponsiveImage,

        title: "Photo 1",
    },

    photo2: {
        type: ControlType.ResponsiveImage,

        title: "Photo 2",
    },

    photo3: {
        type: ControlType.ResponsiveImage,

        title: "Photo 3",
    },

    photo4: {
        type: ControlType.ResponsiveImage,

        title: "Photo 4",
    },

    frameColor: {
        type: ControlType.Color,

        title: "Housing",

        defaultValue: "#111111",
    },

    innerMetal: {
        type: ControlType.Color,

        title: "Inner Metal",

        defaultValue: "#77736d",
    },

    rollerColor: {
        type: ControlType.Color,

        title: "Roller",

        defaultValue: "#111111",
    },

    paperColor: {
        type: ControlType.Color,

        title: "Paper",

        defaultValue: "#f4f1e9",
    },

    accentColor: {
        type: ControlType.Color,

        title: "LED",

        defaultValue: "#ff5c9d",
    },

    photoGap: {
        type: ControlType.Number,

        title: "Photo Gap",

        defaultValue: 7,

        min: 2,

        max: 16,

        step: 1,
    },

    printDuration: {
        type: ControlType.Number,

        title: "Print Speed",

        defaultValue: 4.5,

        min: 2,

        max: 10,

        step: 0.1,
    },

    holdDuration: {
        type: ControlType.Number,

        title: "Hold",

        defaultValue: 3.4,

        min: 0.5,

        max: 10,

        step: 0.1,
    },

    loop: {
        type: ControlType.Boolean,

        title: "Loop",

        defaultValue: true,
    },

    showFooter: {
        type: ControlType.Boolean,

        title: "Footer",

        defaultValue: true,
    },

    footerText: {
        type: ControlType.String,

        title: "Footer Text",

        defaultValue: "dhwanibagrecha.com",

        hidden: (props: any) => !props.showFooter,
    },
})
