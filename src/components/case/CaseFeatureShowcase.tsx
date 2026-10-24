import type { Feature } from "@/content/caseFeatures"
import type { CaseMediaItem } from "@/content/caseMedia"
import s from "./CaseFeatureShowcase.module.css"

export function CaseFeatureShowcase({ features, media }: { features: Feature[]; media: CaseMediaItem[] }) {
  const visible=features.map((feature)=>({feature,item:media[feature.mediaIndex]})).filter(x=>!!x.item)
  if(!visible.length)return null
  return <section className={s.showcase} aria-label="Features and interface details">
    <header className={s.heading}>
      <div><span className={s.kicker}>A closer look</span><h2>The details make the difference<span>.</span></h2></div>
      <p>What we designed, why each part matters, and who made it.</p>
    </header>
    <div className={s.list}>
      {visible.map(({feature,item},index)=>(
        <article className={s.feature} key={feature.title} data-flip={index%2===1}>
          <div className={s.copy}>
            <span className={s.number}>{String(index+1).padStart(2,"0")} <span aria-hidden="true">/</span> {String(visible.length).padStart(2,"0")}</span>
            <h3>{feature.title}</h3>
            <p>{feature.caption}</p>
            <span className={s.credit}>{feature.ownership==="mine"?"Designed by me":feature.ownership==="team"?"Team contribution":"Team concept"}</span>
          </div>
          <div className={s.media} data-kind={item.kind}>
            {item.kind==="film" ? <div className={s.videoWrap}>
              <video src={item.url} poster={item.poster} controls muted playsInline preload="metadata" aria-label={item.title}/>
            </div> : item.kind==="phone" ? <div className={s.phoneWrap}>
              <div className={s.phone}><span className={s.notch} aria-hidden="true"/>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.title+": "+item.detail} loading="lazy"/>
              </div>
            </div> : <div className={s.imageWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={item.title+": "+item.detail} loading="lazy"/>
            </div>}
            <span className={s.mediaTag}>{item.kind==="film"?"PLAY THE PROTOTYPE":item.kind==="phone"?"ORIGINAL SCREEN":"PROJECT ARTIFACT"} <span aria-hidden="true">↗</span></span>
          </div>
        </article>
      ))}
    </div>
  </section>
}
