// GalleryWall.tsx — Dhwani Bagrecha portfolio
// About-me: draggable gallery wall with illustrated polaroids, pinned stickies, stamps, vinyl, playlist, field note, matcha doodle
// Oct 4: blends with the page in light + dark (transparent board, --db-* tokens for the grid and page text;
// the physical objects keep their own paper colours). *word* in the header is set in Pinyon Script.

import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"
import { useState } from "react"

interface GalleryItem {
    id: string
    x: number
    y: number
    tilt: number
    z: number
    type: "polaroid" | "sticky" | "stamp" | "vinyl" | "playlist" | "fieldnote" | "doodle"
}

const ITEMS: GalleryItem[] = [
    { id: "polaroid-dj",     x: 22,  y: 68,  tilt: -5,  z: 2, type: "polaroid"  },
    { id: "polaroid-cafe",   x: 218, y: 40,  tilt: 3,   z: 1, type: "polaroid"  },
    { id: "polaroid-campus", x: 468, y: 85,  tilt: -2,  z: 3, type: "polaroid"  },
    { id: "sticky-brain",    x: 148, y: 255, tilt: 2,   z: 2, type: "sticky"    },
    { id: "sticky-3yr",      x: 362, y: 268, tilt: -4,  z: 1, type: "sticky"    },
    { id: "sticky-psych",    x: 572, y: 210, tilt: 5,   z: 2, type: "sticky"    },
    { id: "stamp-bangalore", x: 44,  y: 305, tilt: -2,  z: 1, type: "stamp"     },
    { id: "stamp-annarbor",  x: 508, y: 318, tilt: 3,   z: 2, type: "stamp"     },
    { id: "vinyl",           x: 318, y: 88,  tilt: 6,   z: 3, type: "vinyl"     },
    { id: "playlist",        x: 668, y: 52,  tilt: -3,  z: 1, type: "playlist"  },
    { id: "fieldnote",       x: 692, y: 255, tilt: 4,   z: 2, type: "fieldnote" },
    { id: "doodle-matcha",   x: 138, y: 375, tilt: -6,  z: 1, type: "doodle"    },
]

// ── Polaroid ──────────────────────────────────────────────────────────────────
function PolaroidCard({ id }: { id: string }) {
    const tapeColor: Record<string, string> = {
        "polaroid-dj":     "rgba(255,228,120,0.52)",
        "polaroid-cafe":   "rgba(255,215,170,0.48)",
        "polaroid-campus": "rgba(195,232,175,0.48)",
    }
    const tapeTilt: Record<string, string> = {
        "polaroid-dj": "-1deg", "polaroid-cafe": "2deg", "polaroid-campus": "-0.5deg",
    }
    const captions: Record<string, string> = {
        "polaroid-dj":     "dj set @ btb · 1am",
        "polaroid-cafe":   "angell hall basement. always.",
        "polaroid-campus": "diag in october > everything",
    }

    const djScene = (
        <svg width="116" height="116" viewBox="0 0 116 116" style={{ display: "block" }}>
            <rect width="116" height="116" fill="#0c0014" />
            <polygon points="20,0 0,116 40,116" fill="rgba(191,127,255,0.07)" />
            <polygon points="58,0 30,116 86,116" fill="rgba(243,80,15,0.05)" />
            <polygon points="96,0 76,116 116,116" fill="rgba(0,229,255,0.04)" />
            <circle cx="18" cy="7" r="5" fill="#F3500F" opacity="0.55" />
            <circle cx="58" cy="5" r="5" fill="#BF7FFF" opacity="0.60" />
            <circle cx="98" cy="7" r="5" fill="#00E5FF" opacity="0.45" />
            <rect x="16" y="68" width="84" height="5" rx="2.5" fill="#1a0030" />
            <circle cx="36" cy="68" r="13" fill="#0f0020" stroke="rgba(191,127,255,0.2)" strokeWidth="1" />
            <circle cx="36" cy="68" r="9"  fill="#170025" />
            <circle cx="36" cy="68" r="3.5" fill="#BF7FFF" opacity="0.7" />
            <circle cx="36" cy="68" r="1.2" fill="#0c0014" />
            <circle cx="80" cy="68" r="13" fill="#0f0020" stroke="rgba(243,80,15,0.2)" strokeWidth="1" />
            <circle cx="80" cy="68" r="9"  fill="#170025" />
            <circle cx="80" cy="68" r="3.5" fill="#F3500F" opacity="0.7" />
            <circle cx="80" cy="68" r="1.2" fill="#0c0014" />
            <rect x="50" y="64" width="16" height="12" rx="2" fill="#1a0028" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <circle cx="56" cy="70" r="2.5" fill="#F3500F" opacity="0.7" />
            <circle cx="62" cy="70" r="2.5" fill="#BF7FFF" opacity="0.7" />
            <ellipse cx="36" cy="72" rx="16" ry="4" fill="rgba(191,127,255,0.12)" />
            <ellipse cx="80" cy="72" rx="16" ry="4" fill="rgba(243,80,15,0.12)" />
            {[[10,103],[22,100],[34,105],[46,101],[58,103],[70,100],[82,105],[94,101],[106,103]].map(([cx,cy],i)=>(
                <ellipse key={i} cx={cx} cy={cy} rx="5" ry="9" fill={`rgba(255,255,255,${0.03+i%3*0.01})`} />
            ))}
            {[0,1,2,3,4].map(i=>(
                <rect key={i} x={4+i*4} y={90-(i%3===0?10:i%3===1?7:13)} width="2.5" height={i%3===0?10:i%3===1?7:13} rx="1" fill="rgba(191,127,255,0.38)" />
            ))}
        </svg>
    )

    const cafeScene = (
        <svg width="116" height="116" viewBox="0 0 116 116" style={{ display: "block" }}>
            <rect width="116" height="116" fill="#0b0700" />
            <rect x="8" y="12" width="38" height="52" rx="2" fill="#140900" stroke="rgba(255,170,50,0.12)" strokeWidth="1" />
            <rect x="10" y="14" width="34" height="48" rx="1" fill="rgba(255,140,30,0.04)" />
            <line x1="27" y1="14" x2="27" y2="62" stroke="rgba(255,140,30,0.08)" strokeWidth="1" />
            <line x1="10" y1="38" x2="44" y2="38" stroke="rgba(255,140,30,0.08)" strokeWidth="1" />
            <rect x="20" y="76" width="76" height="5" rx="2" fill="#1e1100" />
            <rect x="42" y="48" width="28" height="30" rx="5" fill="#160c00" stroke="rgba(255,150,40,0.2)" strokeWidth="1" />
            <rect x="45" y="51" width="22" height="24" rx="3" fill="#0d0700" />
            <ellipse cx="56" cy="52" rx="11" ry="3.5" fill="#3d2200" />
            <ellipse cx="56" cy="52" rx="7"  ry="2"   fill="#5a3500" />
            <path d="M50 51 Q56 49 62 51" fill="none" stroke="rgba(255,220,160,0.12)" strokeWidth="1" />
            <path d="M70 56 Q80 56 80 65 Q80 74 70 74" fill="none" stroke="rgba(255,150,40,0.22)" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="56" cy="78" rx="18" ry="4.5" fill="#1e1100" />
            <path d="M50 47 C47 41 51 35 48 29" fill="none" stroke="rgba(255,200,100,0.18)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M56 45 C53 39 57 32 54 26" fill="none" stroke="rgba(255,200,100,0.22)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M62 47 C59 41 63 35 60 29" fill="none" stroke="rgba(255,200,100,0.16)" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="27" cy="38" r="18" fill="rgba(255,130,20,0.03)" />
            <rect x="88" y="30" width="20" height="48" rx="1" fill="#160a00" stroke="rgba(255,150,40,0.06)" strokeWidth="0.5" />
            {[35,42,50,58,64,70].map((y,i)=>(
                <rect key={i} x="90" y={y} width="16" height={4+i%2} rx="0.5" fill={`rgba(255,${100+i*15},${20+i*5},0.15)`} />
            ))}
        </svg>
    )

    const campusScene = (
        <svg width="116" height="116" viewBox="0 0 116 116" style={{ display: "block" }}>
            <rect width="116" height="116" fill="#080c03" />
            <rect width="116" height="58" fill="#080d05" />
            <polygon points="44,58 52,116 64,116 72,58" fill="#151008" />
            <rect x="0" y="74" width="116" height="42" fill="#0a0d02" />
            <rect x="4"   y="32" width="6" height="45" rx="3" fill="#0e0800" />
            <rect x="101" y="38" width="5" height="39" rx="2.5" fill="#0e0800" />
            <rect x="85"  y="42" width="4" height="35" rx="2"   fill="#120c00" />
            <ellipse cx="7"   cy="24" rx="14" ry="19" fill="#0d1400" />
            <ellipse cx="7"   cy="18" rx="10" ry="13" fill="#0e1800" />
            <ellipse cx="103" cy="30" rx="12" ry="16" fill="#0d1400" />
            <ellipse cx="87"  cy="35" rx="10" ry="13" fill="#0e1800" />
            {[
                [23,22,9,"#b85500"],[46,14,8,"#c46200"],[68,28,7,"#a84000"],
                [82,16,9,"#d07000"],[14,48,6,"#963300"],[60,42,8,"#c44800"],
                [90,40,7,"#bf5800"],[32,60,6,"#b04200"],[75,55,5,"#c46800"],
                [50,70,5,"#a03a00"],[18,72,4,"#b05000"],[95,58,6,"#be5500"],
            ].map(([x,y,r,fill],i)=>(
                <ellipse key={i} cx={x as number} cy={y as number} rx={(r as number)*0.65} ry={r as number}
                    fill={fill as string} opacity="0.72"
                    transform={`rotate(${i*37-20} ${x} ${y})`} />
            ))}
            <rect x="44" y="22" width="28" height="36" fill="#090e06" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
            <rect x="54" y="14" width="8" height="10" fill="#0a0f07" />
            {[[48,28],[60,28],[48,38],[60,38],[48,48],[60,48]].map(([x,y],i)=>(
                <rect key={i} x={x} y={y} width="6" height="7" rx="0.5"
                    fill={`rgba(255,${180+i*5},${60+i*10},${i===2?0.18:0.07})`} />
            ))}
            <rect x="30" y="88" width="20" height="3" rx="1.5" fill="#1a1200" />
            <rect x="68" y="90" width="20" height="3" rx="1.5" fill="#1a1200" />
        </svg>
    )

    const sceneMap: Record<string, React.ReactNode> = {
        "polaroid-dj": djScene,
        "polaroid-cafe": cafeScene,
        "polaroid-campus": campusScene,
    }

    return (
        <div style={{
            width: 140,
            background: "#F5F0E8",
            borderRadius: 3,
            padding: "10px 10px 36px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.22)",
            userSelect: "none",
            position: "relative",
        }}>
            {/* Tape */}
            <div style={{
                position: "absolute",
                top: -9, left: "50%",
                transform: `translateX(-50%) rotate(${tapeTilt[id] ?? "0deg"})`,
                width: 50, height: 18,
                background: tapeColor[id] ?? "rgba(255,235,150,0.5)",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }} />
            <div style={{ width: "100%", height: 120, borderRadius: 2, overflow: "hidden" }}>
                {sceneMap[id] ?? <div style={{ width: "100%", height: "100%", background: "#111" }} />}
            </div>
            <div style={{
                paddingTop: 9,
                fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive",
                fontSize: 11,
                color: "#444",
                textAlign: "center",
                lineHeight: 1.3,
            }}>
                {captions[id] ?? "captured"}
            </div>
        </div>
    )
}

// ── Sticky note ───────────────────────────────────────────────────────────────
function StickyNote({ id }: { id: string }) {
    const configs: Record<string, { text: string; bg: string; textColor: string; pinColor: string }> = {
        "sticky-brain": {
            text: "professional\noverthinker\n(it's a skill)",
            bg: "#FFF176", textColor: "#333", pinColor: "#e53935",
        },
        "sticky-3yr": {
            text: "bs psych\nin 3 years\n(i was built\ndifferent)",
            bg: "#B2EBF2", textColor: "#1a4a52", pinColor: "#1976d2",
        },
        "sticky-psych": {
            text: "studied why\npeople do\nirational things\n(then became one)",
            bg: "#F8BBD9", textColor: "#4a1a2a", pinColor: "#c2185b",
        },
    }
    const c = configs[id] ?? { text: "note", bg: "#FFF176", textColor: "#333", pinColor: "#e53935" }

    return (
        <div style={{
            width: 126,
            minHeight: 116,
            background: c.bg,
            padding: "20px 11px 11px",
            boxShadow: "3px 3px 14px rgba(0,0,0,0.30), inset 0 -2px 5px rgba(0,0,0,0.05)",
            userSelect: "none",
            position: "relative",
        }}>
            {/* Push pin */}
            <div style={{
                position: "absolute", top: -9, left: "50%",
                transform: "translateX(-50%)",
                width: 14, height: 14, borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${c.pinColor}ee, ${c.pinColor}88)`,
                boxShadow: `0 2px 5px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.22)`,
                zIndex: 5,
            }} />
            {/* Ruled lines */}
            {[0,1,2,3,4].map(i => (
                <div key={i} style={{
                    position: "absolute", left: 9, right: 9,
                    top: 22 + i * 17, height: 1,
                    background: "rgba(0,0,0,0.06)",
                }} />
            ))}
            <p style={{
                fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive",
                fontSize: 12.5,
                color: c.textColor,
                margin: 0,
                lineHeight: 1.5,
                whiteSpace: "pre-line",
                position: "relative",
                zIndex: 1,
            }}>
                {c.text}
            </p>
        </div>
    )
}

// ── City stamp ────────────────────────────────────────────────────────────────
function CityStamp({ id }: { id: string }) {
    const configs: Record<string, { city: string; flag: string; sub: string; color: string; year: string }> = {
        "stamp-bangalore": { city: "BANGALORE", flag: "🇮🇳", sub: "where it started", color: "#FF6B35", year: "2001" },
        "stamp-annarbor":  { city: "ANN ARBOR",  flag: "〽️", sub: "where it's going",  color: "#18A0FB", year: "2023" },
    }
    const c = configs[id] ?? { city: "SOMEWHERE", flag: "📍", sub: "", color: "#F3500F", year: "" }

    return (
        <div style={{
            width: 118, height: 118, borderRadius: "50%",
            border: `2.5px solid ${c.color}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            boxShadow: `0 0 0 5px rgba(0,0,0,0.25), 0 4px 22px rgba(0,0,0,0.5), inset 0 0 0 7px ${c.color}14`,
            userSelect: "none",
            gap: 1,
        }}>
            <div style={{ fontSize: 26 }}>{c.flag}</div>
            <div style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 8.5, fontWeight: 800,
                letterSpacing: "0.22em",
                color: c.color, textTransform: "uppercase",
            }}>{c.city}</div>
            <div style={{ width: "55%", height: 1, background: `${c.color}55`, margin: "2px 0" }} />
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 7.5, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>{c.sub}</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 7, color: `${c.color}80`, letterSpacing: "0.08em" }}>{c.year}</div>
        </div>
    )
}

// ── Vinyl ─────────────────────────────────────────────────────────────────────
function VinylSticker() {
    return (
        <div style={{ userSelect: "none" }}>
            <svg width="118" height="118" viewBox="0 0 118 118">
                <defs>
                    <radialGradient id="vg" cx="50%" cy="50%" r="50%">
                        <stop offset="0%"   stopColor="#1c1c1c" />
                        <stop offset="38%"  stopColor="#111" />
                        <stop offset="39%"  stopColor="#252525" />
                        <stop offset="53%"  stopColor="#111" />
                        <stop offset="54%"  stopColor="#1e1e1e" />
                        <stop offset="100%" stopColor="#090909" />
                    </radialGradient>
                    <radialGradient id="vl" cx="40%" cy="40%" r="60%">
                        <stop offset="0%"   stopColor="#c080ff" />
                        <stop offset="100%" stopColor="#6b20ee" />
                    </radialGradient>
                </defs>
                <circle cx="59" cy="59" r="57" fill="url(#vg)" stroke="#2a2a2a" strokeWidth="1" />
                {[46,36,26].map(r=>(
                    <circle key={r} cx="59" cy="59" r={r} fill="none" stroke="rgba(255,255,255,0.032)" strokeWidth="1.5" />
                ))}
                <circle cx="59" cy="59" r="22" fill="url(#vl)" />
                <circle cx="59" cy="59" r="4"  fill="#090909" />
                <text x="59" y="54" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="5.5" fontWeight="800" fill="rgba(0,0,0,0.55)" letterSpacing="0.12em">DHWANI</text>
                <text x="59" y="63" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="4.5" fill="rgba(0,0,0,0.45)" letterSpacing="0.07em">LATE NIGHT MIX</text>
                <ellipse cx="45" cy="45" rx="18" ry="10" fill="rgba(255,255,255,0.025)" transform="rotate(-25 59 59)" />
                <circle cx="59" cy="59" r="57" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            </svg>
        </div>
    )
}

// ── Playlist card ─────────────────────────────────────────────────────────────
function PlaylistCard() {
    const tracks = [
        { title: "something about us", artist: "daft punk" },
        { title: "fukumean",           artist: "gunna" },
        { title: "escapism.",          artist: "raye" },
        { title: "creepin'",           artist: "metro boomin" },
        { title: "golden hour",        artist: "jvke" },
    ]
    return (
        <div style={{
            width: 176, background: "#0f0f0f", borderRadius: 12,
            padding: "11px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.65)",
            userSelect: "none",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 6,
                    background: "linear-gradient(135deg, #F3500F, #BF7FFF)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 17, flexShrink: 0,
                }}>🎵</div>
                <div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, fontWeight: 600, color: "#FAFAFA" }}>dhwani's mix</div>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 8.5,  color: "rgba(255,255,255,0.38)" }}>the rotation rn</div>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5.5 }}>
                {tracks.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 8.5, color: "rgba(255,255,255,0.22)", width: 11, textAlign: "right", flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 9.5, color: i === 0 ? "#F3500F" : "#FAFAFA", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 7.5, color: "rgba(255,255,255,0.32)" }}>{t.artist}</div>
                        </div>
                        {i === 0 && (
                            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", flexShrink: 0 }}>
                                {[8, 12, 6, 10].map((h, bi) => (
                                    <motion.div key={bi}
                                        animate={{ height: [h, h * 0.35, h] }}
                                        transition={{ duration: 0.55 + bi * 0.15, repeat: Infinity, ease: "easeInOut", delay: bi * 0.1 }}
                                        style={{ width: 2, background: "#F3500F", borderRadius: 1 }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Field note (replaces AI-looking badge) ─────────────────────────────────────
function FieldNote() {
    return (
        <div style={{
            width: 148,
            background: "#fefce8",
            borderRadius: 2,
            padding: "14px 12px 13px 28px",
            boxShadow: "2px 3px 14px rgba(0,0,0,0.28), -1px -1px 0 rgba(0,0,0,0.04)",
            userSelect: "none",
            position: "relative",
            fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive",
        }}>
            {/* Red margin line */}
            <div style={{
                position: "absolute", left: 24, top: 0, bottom: 0,
                width: 1, background: "rgba(210,70,70,0.28)",
            }} />
            {/* Hole punch */}
            <div style={{
                position: "absolute", left: 7, top: "50%",
                transform: "translateY(-50%)",
                width: 11, height: 11, borderRadius: "50%",
                background: "#e8e4d0",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.22)",
            }} />
            {/* Ruled lines */}
            {[0,1,2,3,4,5].map(i=>(
                <div key={i} style={{
                    position: "absolute", left: 27, right: 9,
                    top: 20 + i * 18, height: 1,
                    background: "rgba(100,149,237,0.2)",
                }} />
            ))}
            <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: 7 }}>
                    field note
                </div>
                <div style={{ fontSize: 11.5, color: "#333", lineHeight: 1.58 }}>
                    overheard at<br/>usability test:<br/>
                    <span style={{ fontStyle: "italic", color: "#666" }}>
                        "why does nothing<br/>do what I think<br/>it should do?"
                    </span>
                </div>
                <div style={{ fontSize: 9.5, color: "#bbb", marginTop: 9 }}>
                    → saved to brain
                </div>
            </div>
        </div>
    )
}

// ── Matcha doodle ─────────────────────────────────────────────────────────────
function MatchaDoodle() {
    return (
        <div style={{ userSelect: "none" }}>
            <svg width="88" height="108" viewBox="0 0 88 108">
                {/* Cup */}
                <path d="M 22 46 L 26 95 L 62 95 L 66 46 Z" fill="#2a1800" stroke="#3d2500" strokeWidth="1" />
                <path d="M 25 48 L 28 92 L 60 92 L 63 48 Z" fill="#1a0f00" />
                {/* Matcha lid layers */}
                <ellipse cx="44" cy="47" rx="22" ry="7"   fill="#3a6b3a" />
                <ellipse cx="44" cy="45" rx="21" ry="6"   fill="#4a7e4a" />
                <ellipse cx="44" cy="43" rx="20" ry="5"   fill="#5a9a5a" />
                <ellipse cx="44" cy="41" rx="14" ry="3.5" fill="#4a8a4a" />
                <path d="M38 40 Q44 37 50 40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" strokeLinecap="round" />
                {/* Straw */}
                <rect x="51" y="18" width="4" height="28" rx="2" fill="#c8a46a" stroke="#a08040" strokeWidth="0.5" />
                {/* Handle */}
                <path d="M66 57 Q78 57 78 67 Q78 77 66 77" fill="none" stroke="#3d2500" strokeWidth="3" strokeLinecap="round" />
                {/* Sleeve bands */}
                <rect x="22" y="62" width="44" height="3" rx="1" fill="#3d2200" />
                <rect x="22" y="72" width="44" height="3" rx="1" fill="#3d2200" />
                {/* Shadow */}
                <ellipse cx="44" cy="97" rx="23" ry="5" fill="rgba(0,0,0,0.18)" />
                <text x="44" y="106" textAnchor="middle" fontFamily="'Patrick Hand', cursive" fontSize="8.5" style={{ fill: "var(--db-text-2, rgba(255,255,255,0.28))" }}>matcha szn ☁️</text>
            </svg>
        </div>
    )
}

// ── Draggable wrapper ─────────────────────────────────────────────────────────
function DraggableItem({ item, isOnTop, onDragStart }: {
    item: GalleryItem
    isOnTop: boolean
    onDragStart: (id: string) => void
}) {
    const renderContent = () => {
        switch (item.type) {
            case "polaroid":  return <PolaroidCard id={item.id} />
            case "sticky":    return <StickyNote id={item.id} />
            case "stamp":     return <CityStamp id={item.id} />
            case "vinyl":     return <VinylSticker />
            case "playlist":  return <PlaylistCard />
            case "fieldnote": return <FieldNote />
            case "doodle":    return <MatchaDoodle />
            default:          return null
        }
    }

    return (
        <motion.div
            drag dragMomentum={false} dragElastic={0}
            onDragStart={() => onDragStart(item.id)}
            whileDrag={{ scale: 1.04, cursor: "grabbing" }}
            initial={{ x: item.x, y: item.y, rotate: item.tilt }}
            style={{
                position: "absolute", top: 0, left: 0,
                rotate: item.tilt,
                zIndex: isOnTop ? 100 : item.z,
                cursor: "grab",
                touchAction: "none",
                willChange: "transform",
            }}
            transition={{ type: "spring", stiffness: 800, damping: 50 }}
        >
            {renderContent()}
        </motion.div>
    )
}

// ── Header ─────────────────────────────────────────────────────────────────────
const SCRIPT = "'Pinyon Script', 'Snell Roundhand', cursive"

// Font pairing: wrap a word in *stars* to set it in the script face, e.g. "where i've touched *grass*"
function renderTitle(t: string) {
    const parts = String(t || "").split(/(\*[^*]+\*)/g)
    return parts.map((p, i) =>
        p.startsWith("*") && p.endsWith("*") && p.length > 2 ? (
            <span key={i} style={{ fontFamily: SCRIPT, fontWeight: 400, fontSize: "1.3em", lineHeight: 0.8, letterSpacing: 0, color: "inherit" }}>{p.slice(1, -1)}</span>
        ) : (
            <span key={i}>{p}</span>
        )
    )
}

function GalleryHeader({ title }: { title: string }) {
    return (
        <div style={{
            paddingTop: 48, paddingBottom: 12,
            paddingLeft: 32, paddingRight: 32,
            pointerEvents: "none", position: "relative", zIndex: 200,
        }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>📌</span>
                <h2 style={{
                    fontFamily: "'Poppins', Inter, sans-serif",
                    fontSize: "clamp(22px, 4vw, 32px)",
                    fontWeight: 600, color: "var(--db-text, #FAFAFA)",
                    margin: 0, letterSpacing: "-0.01em",
                }}>{renderTitle(title)}</h2>
            </div>
            <p style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12, color: "var(--db-text-2, rgba(255,255,255,0.28))", opacity: 0.75,
                margin: "6px 0 0 30px", letterSpacing: "0.02em",
            }}>drag to rearrange ✦ it's giving mood board</p>
        </div>
    )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function GalleryWall({
    header = "where i've touched grass",
    boardHeight = 520,
}: {
    header?: string
    boardHeight?: number
}) {
    const [activeId, setActiveId] = useState<string | null>(null)

    return (
        <div style={{ background: "transparent", minHeight: "100%", display: "flex", flexDirection: "column" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&family=Patrick+Hand&family=Pinyon+Script&display=swap');
            `}</style>

            <GalleryHeader title={header} />

            <div style={{
                position: "relative",
                width: "100%",
                height: boardHeight,
                overflow: "hidden",
                background: "repeating-linear-gradient(0deg, transparent, transparent 23px, color-mix(in srgb, var(--db-line, rgba(255,255,255,0.1)) 30%, transparent) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, color-mix(in srgb, var(--db-line, rgba(255,255,255,0.1)) 30%, transparent) 24px)",
                backgroundSize: "24px 24px",
            }}>
                <div style={{
                    position: "absolute", top: "8%", left: "12%",
                    width: 320, height: 220, borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(243,80,15,0.05) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />
                <div style={{
                    position: "absolute", bottom: "18%", right: "18%",
                    width: 260, height: 200, borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(191,127,255,0.05) 0%, transparent 70%)",
                    pointerEvents: "none",
                }} />

                {ITEMS.map(item => (
                    <DraggableItem
                        key={item.id}
                        item={item}
                        isOnTop={activeId === item.id}
                        onDragStart={id => setActiveId(id)}
                    />
                ))}
            </div>

            <div style={{
                padding: "10px 32px 32px",
                fontFamily: "Inter, sans-serif",
                fontSize: 10, color: "var(--db-text-2, rgba(255,255,255,0.15))", opacity: 0.5,
                letterSpacing: "0.06em",
                pointerEvents: "none",
            }}>
                ✦ everything here is real ✦
            </div>
        </div>
    )
}

addPropertyControls(GalleryWall, {
    header: {
        type: ControlType.String,
        title: "Header",
        defaultValue: "where i've touched grass",
        description: "Wrap a word in *stars* to set it in script.",
    },
    boardHeight: {
        type: ControlType.Number,
        title: "Board Height",
        defaultValue: 520,
        min: 300, max: 900, step: 20,
    },
})
