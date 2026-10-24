"use client"

import { useEffect, useState } from "react"
import type { CaseMediaItem } from "@/content/caseMedia"
import s from "./CaseMediaWall.module.css"

export function CaseMediaWall({ project, items }: { project: string; items: CaseMediaItem[] }) {
  const [active,setActive]=useState(0)
  const [reduced,setReduced]=useState(false)
  useEffect(()=>{
    const query=window.matchMedia("(prefers-reduced-motion: reduce)")
    const update=()=>setReduced(query.matches)
    update()
    query.addEventListener("change",update)
    return ()=>query.removeEventListener("change",update)
  },[])
  if(!items.length)return null
  const selected=items[Math.min(active,items.length-1)]
  const phones=items.map((item,i)=>({item,i})).filter(({item})=>item.kind==="phone")
  const films=items.filter(item=>item.kind==="film")
  const stills=items.map((item,i)=>({item,i})).filter(({item})=>item.kind==="image")

  return <section className={s.mediaWall} aria-label={project+" project screen and video gallery"}>
    <header className={s.heading}>
      <div><span className={s.dot} aria-hidden="true"/> Project gallery <span className={s.muted}>/ photos & screens</span></div>
      <span>{films.length ? films.length+" clips · " : ""}{items.length} pieces</span>
    </header>

    <div className={s.feature} data-kind={selected.kind}>
      <div className={s.featureScreen} key={selected.url}>
        {selected.kind==="film" ? (
          <video
            className={s.film} src={selected.url} poster={selected.poster}
            autoPlay={!reduced} muted loop playsInline controls preload="metadata"
            aria-label={selected.title+" — "+selected.detail}
          >
            <a href={selected.url} target="_blank" rel="noopener noreferrer">Watch the original video</a>
          </video>
        ) : selected.kind==="phone" ? (
          <div className={s.phoneSpot}>
            <div className={s.phoneDevice}>
              <div className={s.phoneTop} aria-hidden="true"/>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.title+": "+selected.detail} loading="eager" />
            </div>
            <span className={s.phoneLight} aria-hidden="true"/>
          </div>
        ) : (
          // These are screenshots from the user's own published Framer case studies.
          // eslint-disable-next-line @next/next/no-img-element
          <img className={s.fullImage} src={selected.url} alt={selected.title+": "+selected.detail} loading="eager" />
        )}
      </div>
      <div className={s.featureInfo}>
        <div className={s.artifactIndex}><span>FRAME {String(active+1).padStart(2,"0")}</span><span>/ {String(items.length).padStart(2,"0")}</span></div>
        <div className={s.infoBody}>
          <span className={s.kind}>{selected.kind==="film"?"Moving image":selected.kind==="phone"?"Mobile interface":"Project still"}</span>
          <h3>{selected.title}<span>.</span></h3>
          <p>{selected.detail}</p>
        </div>
        <div className={s.infoBottom}>
          <span>{selected.owner==="mine"?"My work":selected.owner==="team"?"Team work":"Shared / team concept"}</span>
          <div className={s.stepButtons}>
            <button type="button" aria-label="Previous artifact" onClick={()=>setActive((active+items.length-1)%items.length)}>←</button>
            <button type="button" aria-label="Next artifact" onClick={()=>setActive((active+1)%items.length)}>→</button>
          </div>
        </div>
      </div>
    </div>

    <div className={s.reelLabel}><span>More from the project</span><span>CHOOSE A FRAME <span aria-hidden="true">↙</span></span></div>
    <div className={s.filmstrip} role="group" aria-label="Select an artifact">
      {items.map((item,i)=><button
        type="button" className={s.thumb} data-selected={i===active} aria-pressed={i===active}
        onClick={()=>setActive(i)} key={item.url} aria-label={String(i+1).padStart(2,"0")+". "+item.title}
      >
        <span className={s.thumbPreview}>
          {item.kind==="film" ? <span className={s.thumbFilm}><span className={s.playSign} aria-hidden="true">▶</span><small>VIDEO</small></span> : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt="" loading="lazy" />
          )}
        </span>
        <span className={s.thumbLabel}><small>{String(i+1).padStart(2,"0")} / {item.kind==="film"?"FILM":item.kind==="phone"?"PHONE":"STILL"}</small><span>{item.title}</span></span>
      </button>)}
    </div>

    {phones.length>=3 && <div className={s.phoneSection}>
      <div className={s.subhead}><span>All the screens</span><span>{phones.length} PHONE SCREENS</span></div>
      <div className={s.phoneGrid}>
        {phones.map(({item,i})=><button type="button" className={s.phoneCard} key={item.url} onClick={()=>setActive(i)} aria-label={"Inspect "+item.title}>
          <span className={s.phoneCardDevice}>
            <span className={s.cardNotch} aria-hidden="true"/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" loading="lazy" />
          </span>
          <span className={s.phoneCardFoot}><strong>{item.title}</strong><small>{item.owner==="mine"?"MY FLOW":"TEAM FLOW"} ↗</small></span>
        </button>)}
      </div>
    </div>}

    {stills.length>0 && <div className={s.stillSection}>
      <div className={s.subhead}><span>More to explore</span><span>{stills.length} IMAGES</span></div>
      <div className={s.stillGrid}>
        {stills.map(({item,i})=><button type="button" className={s.stillCard} key={item.url} onClick={()=>setActive(i)} aria-label={"Inspect "+item.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.url} alt={item.title} loading="lazy" />
          <span><strong>{item.title}</strong><span aria-hidden="true">↗</span></span>
        </button>)}
      </div>
    </div>}
    <p className={s.footerNote}>Screens and footage from the original projects. Prototypes are concepts, not launched products.</p>
  </section>
}
