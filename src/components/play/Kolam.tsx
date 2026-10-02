"use client"
// Kolam divider (rebuilt from Dhwani's Framer KolamDivider): a pulli-kolam lattice of rounded
// loops around a dot grid, in the accent color, edges faded. Decorative only (aria-hidden).
// Redraws on resize and when the theme or vibe changes.
import { useEffect, useRef } from "react"

export function Kolam({ height = 96, spacing = 54, rows = 2 }: { height?: number; spacing?: number; rows?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = box.current, canvas = cv.current
    if (!el || !canvas) return
    const ctx = canvas.getContext("2d")!
    const draw = () => {
      const w = el.clientWidth, h = el.clientHeight, dpr = window.devicePixelRatio || 1
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + "px"; canvas.style.height = h + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const color = getComputedStyle(el).color
      const cols = Math.ceil(w / spacing) + 2
      const x0 = (w - (cols - 1) * spacing) / 2, y0 = (h - (rows - 1) * spacing) / 2
      const r = spacing * 0.6, k = r / 2
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = "round"
      ctx.shadowColor = color; ctx.shadowBlur = 6
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const cx = x0 + j * spacing, cy = y0 + i * spacing
        ctx.beginPath()
        ctx.moveTo(cx + k, cy - k)
        ctx.quadraticCurveTo(cx + r, cy, cx + k, cy + k)
        ctx.quadraticCurveTo(cx, cy + r, cx - k, cy + k)
        ctx.quadraticCurveTo(cx - r, cy, cx - k, cy - k)
        ctx.quadraticCurveTo(cx, cy - r, cx + k, cy - k)
        ctx.stroke()
        ctx.beginPath(); ctx.arc(cx, cy, 1.6, 0, Math.PI * 2); ctx.fill()
      }
    }
    draw()
    const ro = new ResizeObserver(draw); ro.observe(el)
    const mo = new MutationObserver(draw)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-vibe", "style"] })
    const mq = window.matchMedia("(prefers-color-scheme: light)"); mq.addEventListener("change", draw)
    return () => { ro.disconnect(); mo.disconnect(); mq.removeEventListener("change", draw) }
  }, [spacing, rows])

  return (
    <div ref={box} aria-hidden="true" className="kolam" style={{ height }}>
      <canvas ref={cv} />
    </div>
  )
}
