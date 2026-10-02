"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type DesignCarouselSlide = {
  src: string
  alt: string
}

type DesignCarouselProps = {
  slides: DesignCarouselSlide[]
  ariaLabel?: string
  height?: number | string
  fit?: "contain" | "cover"
  showDots?: boolean
  autoPlay?: boolean
  autoPlayDelay?: number
  className?: string
}

/**
 * A responsive, centered design carousel. Pass image URLs from /public or a
 * remote asset host in `slides`; neighboring designs remain visible as peeks.
 */
export function DesignCarousel({
  slides,
  ariaLabel = "Portfolio designs",
  height = 560,
  fit = "contain",
  showDots = true,
  autoPlay = false,
  autoPlayDelay = 4500,
  className = "",
}: DesignCarouselProps) {
  const [active, setActive] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const count = slides.length

  useEffect(() => {
    setActive((current) => (count ? current % count : 0))
  }, [count])

  const move = useCallback((direction: number) => {
    if (!count) return
    setActive((current) => (current + direction + count) % count)
  }, [count])

  useEffect(() => {
    if (!autoPlay || count < 2) return
    const timer = window.setInterval(() => move(1), Math.max(2000, autoPlayDelay))
    return () => window.clearInterval(timer)
  }, [autoPlay, autoPlayDelay, count, move])

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      move(-1)
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      move(1)
    }
  }

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
    if (delta > 45) move(-1)
    if (delta < -45) move(1)
    touchStartX.current = null
  }

  if (!count) return null

  const heightStyle = typeof height === "number" ? `${height}px` : height

  return (
    <div
      className={`design-carousel ${className}`.trim()}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ height: heightStyle }}
    >
      <style>{carouselCss}</style>

      {slides.map((slide, index) => {
        let position = index - active
        if (position > count / 2) position -= count
        if (position < -count / 2) position += count
        if (Math.abs(position) > 2) return null

        const distance = Math.abs(position)
        const scale = distance === 0 ? 1 : distance === 1 ? 0.9 : 0.78

        return (
          <div
            key={`${slide.src}-${index}`}
            className="design-carousel__card"
            data-position={position}
            aria-hidden={distance !== 0}
            style={{ transform: `translate(-50%, -50%) translateX(var(--offset)) scale(${scale})` }}
          >
            <img
              src={slide.src}
              alt={distance === 0 ? slide.alt : ""}
              draggable={false}
              loading={distance <= 1 ? "eager" : "lazy"}
              style={{ objectFit: fit }}
            />
          </div>
        )
      })}

      {count > 1 && (
        <>
          <button
            type="button"
            className="design-carousel__arrow design-carousel__arrow--previous"
            aria-label="Previous design"
            onClick={() => move(-1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            className="design-carousel__arrow design-carousel__arrow--next"
            aria-label="Next design"
            onClick={() => move(1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </>
      )}

      <span className="design-carousel__sr-only" aria-live="polite" aria-atomic="true">
        Design {active + 1} of {count}
      </span>

      {showDots && count > 1 && (
        <div className="design-carousel__dots" aria-label="Choose a design">
          {slides.map((slide, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              className="design-carousel__dot"
              aria-label={`Show design ${index + 1}${slide.alt ? `: ${slide.alt}` : ""}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const carouselCss = `
.design-carousel {
  --step: 22vw;
  position: relative;
  width: 100%;
  min-height: 280px;
  overflow: hidden;
  isolation: isolate;
  outline: none;
  touch-action: pan-y;
}
.design-carousel:focus-visible { outline: 2px solid var(--accent, #f3500f); outline-offset: 4px; }
.design-carousel__card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(190px, 22vw, 310px);
  height: min(82%, 500px);
  overflow: hidden;
  border: 1px solid var(--line-strong, rgba(255,255,255,.18));
  border-radius: 24px;
  background: var(--surface-2, #161618);
  box-shadow: 0 22px 60px rgba(0,0,0,.34);
  will-change: transform;
  transition: transform 420ms cubic-bezier(.2,.75,.25,1), opacity 320ms ease;
}
.design-carousel__card[data-position="-2"] { --offset: -44vw; opacity: .34; z-index: 1; }
.design-carousel__card[data-position="-1"] { --offset: -22vw; opacity: .72; z-index: 2; }
.design-carousel__card[data-position="0"] { --offset: 0vw; opacity: 1; z-index: 3; }
.design-carousel__card[data-position="1"] { --offset: 22vw; opacity: .72; z-index: 2; }
.design-carousel__card[data-position="2"] { --offset: 44vw; opacity: .34; z-index: 1; }
.design-carousel__card img { display: block; width: 100%; height: 100%; user-select: none; }
.design-carousel__arrow {
  position: absolute;
  top: 50%;
  z-index: 5;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  padding: 0;
  border: 1px solid var(--line-strong, rgba(255,255,255,.28));
  border-radius: 50%;
  color: var(--text, #fff);
  background: var(--glass, rgba(18,18,20,.78));
  backdrop-filter: blur(10px);
  font: 400 31px/1 system-ui, sans-serif;
  cursor: pointer;
  transform: translateY(-50%);
  transition: opacity 180ms ease, scale 180ms ease;
}
.design-carousel__arrow:hover { scale: 1.06; }
.design-carousel__arrow:focus-visible,
.design-carousel__dot:focus-visible { outline: 2px solid var(--accent, #f3500f); outline-offset: 3px; }
.design-carousel__arrow--previous { left: 31%; }
.design-carousel__arrow--next { right: 31%; }
.design-carousel__dots {
  position: absolute;
  z-index: 6;
  left: 50%;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transform: translateX(-50%);
}
.design-carousel__dot {
  width: 7px;
  height: 7px;
  padding: 0;
  border: 0;
  border-radius: 99px;
  background: var(--text, #fff);
  opacity: .45;
  cursor: pointer;
  transition: width 220ms ease, opacity 220ms ease;
}
.design-carousel__dot[aria-current="true"] { width: 22px; opacity: 1; }
.design-carousel__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 700px) {
  .design-carousel { --step: 63vw; }
  .design-carousel__card { width: 64vw; height: min(74%, 470px); border-radius: 22px; }
  .design-carousel__card[data-position="-2"] { --offset: -126vw; }
  .design-carousel__card[data-position="-1"] { --offset: -63vw; }
  .design-carousel__card[data-position="0"] { --offset: 0vw; }
  .design-carousel__card[data-position="1"] { --offset: 63vw; }
  .design-carousel__card[data-position="2"] { --offset: 126vw; }
  .design-carousel__arrow { top: auto; bottom: 26px; transform: none; }
  .design-carousel__arrow--previous { left: 18px; }
  .design-carousel__arrow--next { right: 18px; }
}
@media (prefers-reduced-motion: reduce) {
  .design-carousel__card,
  .design-carousel__arrow,
  .design-carousel__dot { transition: none; }
}
`
