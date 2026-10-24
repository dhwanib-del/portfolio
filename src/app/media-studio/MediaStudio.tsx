"use client"

import { useEffect, useRef, useState } from "react"
import { caseMedia, type CaseMediaItem } from "@/content/caseMedia"
import { CaseMediaWall } from "@/components/case/CaseMediaWall"
import s from "./MediaStudio.module.css"

type Item = CaseMediaItem & { localName?: string; pendingUpload?: boolean }
type Library = Record<string, Item[]>
const PROJECTS = [
  { slug: "general-motors", name: "GM Convoy" },
  { slug: "budgetcart", name: "BudgetCart" },
  { slug: "openlibrary", name: "Open Library" },
  { slug: "briefs", name: "BRIEFS (restricted)" },
  { slug: "intel", name: "Intelligence Hub (restricted)" },
]
const BASE: Library = Object.fromEntries(PROJECTS.map(p=>[p.slug,caseMedia[p.slug] || []]))
const KEY = "db-portfolio-media-draft-v1"
const isWebUrl = (value:string) => /^https?:\/\/\S+$/i.test(value) || /^\/(?!\/)\S+$/.test(value)
const niceName = (value:string) => value.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").replace(/\s+/g," ").trim().slice(0,65)
const safeFile = (value:string) => value.replace(/[^a-z0-9._-]+/gi,"-").replace(/^-+|-+$/g,"").slice(0,100)

function downloadFile(name:string, content:string) {
  const objectUrl=URL.createObjectURL(new Blob([content],{type:"application/json"}))
  const a=document.createElement("a")
  a.href=objectUrl;a.download=name;document.body.appendChild(a);a.click();a.remove()
  window.setTimeout(()=>URL.revokeObjectURL(objectUrl),1000)
}
export function MediaStudio() {
  const [project,setProject]=useState(PROJECTS[0].slug)
  const [library,setLibrary]=useState<Library>(BASE)
  const [selected,setSelected]=useState(0)
  const [url,setUrl]=useState("")
  const [kind,setKind]=useState<CaseMediaItem["kind"]>("phone")
  const [message,setMessage]=useState("")
  const [ready,setReady]=useState(false)
  const urls=useRef<string[]>([])
  const fileInput=useRef<HTMLInputElement>(null)
  useEffect(()=>{
    try {
      const raw=localStorage.getItem(KEY)
      if(raw) {
        const data=JSON.parse(raw) as Library
        const cleaned=Object.fromEntries(PROJECTS.map(p=>[p.slug,(data[p.slug]||[]).filter(x=>x.url && !x.url.startsWith("blob:"))]))
        setLibrary(cleaned)
      }
    }catch{}
    setReady(true)
    return ()=>{urls.current.forEach(x=>URL.revokeObjectURL(x))}
  },[])
  useEffect(()=>{
    if(!ready)return
    const saved=Object.fromEntries(PROJECTS.map(p=>[p.slug,(library[p.slug]||[]).filter(x=>!x.pendingUpload && !x.url.startsWith("blob:"))]))
    try {localStorage.setItem(KEY,JSON.stringify(saved))}catch{setMessage("Browser storage is full. Export your draft to keep it.")}
  },[library,ready])
  const items=library[project]||[]
  const current=items[Math.min(selected,Math.max(0,items.length-1))]
  function updateItems(next:Item[]) {
    setLibrary(prev=>({...prev,[project]:next}))
    setSelected(i=>Math.min(i,Math.max(0,next.length-1)))
  }
  function move(from:number,to:number) {
    if(to<0 || to>=items.length)return
    const next=[...items]
    const [item]=next.splice(from,1);next.splice(to,0,item)
    updateItems(next);setSelected(to)
  }
  function remove(index:number) {
    const removed=items[index]
    if(removed.url.startsWith("blob:")) {
      URL.revokeObjectURL(removed.url)
      urls.current=urls.current.filter(x=>x!==removed.url)
    }
    updateItems(items.filter((_,i)=>i!==index))
    setMessage("Removed from this draft. Published pages are unchanged.")
  }
  function setField(field:keyof CaseMediaItem,value:string) {
    const next=[...items]
    if(!current)return
    next[selected]={...next[selected],[field]:value}
    updateItems(next)
  }
  function upload(files:FileList|null) {
    if(!files)return
    const allowed=Array.from(files).filter(f=>f.type.startsWith("image/") || f.type.startsWith("video/"))
    if(!allowed.length){setMessage("Use an image or video file.");return}
    const next:Item[]=allowed.map(f=>{
      const src=URL.createObjectURL(f)
      urls.current.push(src)
      return {kind:f.type.startsWith("video/")?"film":kind,url:src,title:niceName(f.name),detail:"",owner:"mine",shape:kind==="phone"?"portrait":"wide",localName:f.name,pendingUpload:true}
    })
    updateItems([...items,...next])
    setSelected(items.length)
    setMessage(allowed.length+" file(s) added to this preview. Export your draft and upload the files to GitHub before publishing.")
    if(fileInput.current) fileInput.current.value=""
  }
  function addUrl() {
    const src=url.trim()
    if(!isWebUrl(src)){setMessage("Enter a full https:// URL or a local /case-shots/... path.");return}
    updateItems([...items,{kind,url:src,title:"New "+(kind==="film"?"video":kind==="phone"?"screen":"photo"),detail:"",owner:"mine",shape:kind==="phone"?"portrait":"wide"}])
    setSelected(items.length);setUrl("");setMessage("Added to your draft. Export to publish the changes.")
  }
  function exportDraft() {
    const data: Record<string,CaseMediaItem[]>={}
    const uploads:string[]=[]
    for(const p of PROJECTS) {
      data[p.slug]=(library[p.slug]||[]).map(({localName,pendingUpload,...item})=>{
        if(pendingUpload && localName) {
          const filename=safeFile(localName)
          const path="/case-shots/"+p.slug+"/"+filename
          uploads.push(p.name+" → public"+path)
          return {...item,url:path}
        }
        return item
      })
    }
    downloadFile("portfolio-media-draft.json",JSON.stringify({projects:data,filesToUpload:uploads,notes:"Draft only. Upload files to GitHub and apply these entries to src/content/caseMedia.ts to publish."},null,2))
    setMessage("Downloaded the media manifest. The site will update when the files and entries are committed to GitHub.")
  }
  function resetProject() {
    if(!window.confirm("Reset this project's unpublished media edits?"))return
    updateItems(caseMedia[project]||[])
    setMessage("Restored the published media list for this project.")
  }
  return <main className={s.page}>
    <div className={s.head}>
      <div><span className={s.eyebrow}>YOUR PORTFOLIO / MEDIA LIBRARY</span><h1>Everything, in its place<span>.</span></h1><p>Drop in real photos, prototypes, videos and screens. Tell us what each one actually shows, arrange the order, then export what should be published.</p></div>
      <a href="/#work" className={s.back}>Back to the work ↗</a>
    </div>
    <div className={s.notice}><strong>This is a private-to-your-browser drafting space, not a live CMS.</strong> Uploaded files preview here, but are not sent to a server or automatically published. To make them live, export the manifest, upload files in GitHub, and commit the media entries. Restricted DPSS screens still require clearance.</div>
    <div className={s.projectNav} role="group" aria-label="Choose project">{PROJECTS.map(p=><button key={p.slug} type="button" aria-pressed={project===p.slug} data-current={project===p.slug} onClick={()=>{setProject(p.slug);setSelected(0);setMessage("")}}>{p.name} <small>{(library[p.slug]||[]).length}</small></button>)}</div>
    {project==="intel"||project==="briefs"?<p className={s.warning}>DPSS: do not publish operational or identifiable records until approved. Keep restricted drafts on approved university systems.</p>:null}
    <div className={s.builder}>
      <section className={s.edit}>
        <div className={s.sectionHead}><h2>Add to the story</h2><span>PHOTOS · SCREENS · VIDEO</span></div>
        <div className={s.addControls}><label>Format<select value={kind} onChange={e=>setKind(e.target.value as CaseMediaItem["kind"])}><option value="phone">Phone screen</option><option value="image">Photo / other screen</option><option value="film">Video</option></select></label>
          <label className={s.uploadButton}>Upload files<input ref={fileInput} type="file" multiple accept="image/*,video/*" onChange={e=>upload(e.target.files)}/></label>
        </div>
        <div className={s.urlInput}><label htmlFor="media-studio-url">Or paste a published media URL</label><div><input id="media-studio-url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://... or /case-shots/..."/><button type="button" onClick={addUrl}>Add ↗</button></div></div>
        <div className={s.sectionHead}><h2>Arrange the frames</h2><span>{items.length} TOTAL</span></div>
        <ol className={s.list}>{items.map((item,i)=><li key={item.url+"-"+i} data-current={i===selected}>
          <button type="button" onClick={()=>setSelected(i)} className={s.choose} aria-pressed={i===selected}><span>{String(i+1).padStart(2,"0")}</span><strong>{item.title||"Untitled"}</strong><small>{item.kind}{item.pendingUpload?" · local upload":""}</small></button>
          <div className={s.reorder}><button type="button" onClick={()=>move(i,i-1)} disabled={i===0} aria-label={"Move "+item.title+" up"}>↑</button><button type="button" onClick={()=>move(i,i+1)} disabled={i===items.length-1} aria-label={"Move "+item.title+" down"}>↓</button><button type="button" onClick={()=>remove(i)} aria-label={"Remove "+item.title}>×</button></div>
        </li>)}</ol>
        {current&&<fieldset className={s.fields}><legend>Frame {String(selected+1).padStart(2,"0")} — details</legend>
          <label>Title<input value={current.title} onChange={e=>setField("title",e.target.value)}/></label>
          <label>Caption<textarea rows={3} value={current.detail} onChange={e=>setField("detail",e.target.value)} placeholder="What changed? What should a recruiter notice?"/></label>
          <label>Contribution<select value={current.owner} onChange={e=>setField("owner",e.target.value)}><option value="mine">My work</option><option value="team">Team work</option><option value="shared">Shared</option></select></label>
          {!current.pendingUpload&&<label>Media URL<input value={current.url} onChange={e=>setField("url",e.target.value)} /></label>}
        </fieldset>}
        <div className={s.publish}><button type="button" className={s.export} onClick={exportDraft}>Export media manifest ↓</button><button type="button" onClick={resetProject} className={s.reset}>Reset project</button></div>
        <p className={s.status} role="status">{message}</p>
      </section>
      <section className={s.preview}>
        <div className={s.sectionHead}><h2>Live draft preview</h2><span>THIS BROWSER ONLY</span></div>
        <div className={s.canvas}><CaseMediaWall key={project+"-"+items.length} project={PROJECTS.find(p=>p.slug===project)?.name||project} items={items}/></div>
      </section>
    </div>
  </main>
}
