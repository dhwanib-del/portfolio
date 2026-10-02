// Before/after scene for BRIEFS. Recreated with synthetic content only: no real buildings,
// contacts or operational data. Drawn in HTML so it reads in light and dark and scales to phones.
export function BriefsBeforeAfter() {
  return (
    <figure className="ba container">
      <div className="ba-grid">
        <div className="ba-panel">
          <p className="ba-tag">Before</p>
          <div className="ba-win">
            <div className="ba-path">Dropbox › Buildings › <b>building-records.pdf</b></div>
            <div className="ba-pdf" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => <i key={i} style={{ width: `${62 + ((i * 37) % 34)}%` }} />)}
              <span className="ba-needle">the detail you need, somewhere in here</span>
              {Array.from({ length: 4 }).map((_, i) => <i key={`b${i}`} style={{ width: `${55 + ((i * 29) % 40)}%` }} />)}
            </div>
          </div>
          <ul className="ba-chips" aria-label="Also open">
            <li>CAD</li><li>contact sheet</li><li>shared drive</li><li>+8 more tools</li>
          </ul>
          <p className="ba-note">Find the document, scroll it, check the contact is still current somewhere else, then get back to the call.</p>
        </div>
        <div className="ba-panel ba-after">
          <p className="ba-tag">After</p>
          <div className="ba-win">
            <div className="ba-path"><b>Building profile</b> · synthetic example</div>
            <div className="ba-strip" aria-label="Always visible">
              <span>access</span><span>on-call contact</span><span>active notes</span>
            </div>
            <ul className="ba-tabs" aria-label="Sections">
              <li aria-current="true">Response</li><li>Contacts</li><li>Maps &amp; floor plans</li><li>Documents</li><li>Details</li>
            </ul>
            <div className="ba-body" aria-hidden="true"><i /><i /><i style={{ width: "70%" }} /></div>
          </div>
          <p className="ba-note">Every profile has the same five places. The few details that matter mid-call stay pinned while you move between them.</p>
        </div>
      </div>
      <figcaption>Recreated with made-up content. Section names follow the PRD; they could still change after testing.</figcaption>
    </figure>
  )
}
