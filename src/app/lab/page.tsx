export const metadata = { title: "Play · Dhwani Bagrecha" }

const items = [
  { title: "Hoshi", line: "A Chrome extension that turns job applications into a game you want to keep playing.", tag: "Side project" },
  { title: "Lens", line: "An experiment from my AI lab.", tag: "AI experiment" },
  { title: "Luma", line: "A budgeting tracker built on Google Sheets with bank sync and quick phone entry.", tag: "Side project" },
]

export default function Lab() {
  return (
    <div className="case container">
      <p className="eyebrow">play</p>
      <h1 className="case-h1">Things I build when nobody asked.</h1>
      <p className="case-hook">Small tools and AI experiments. Each one taught me something I used in client work.</p>
      <ul className="lab">
        {items.map((it) => (
          <li key={it.title} className="lab-item">
            <p className="eyebrow">{it.tag}</p>
            <h2>{it.title}</h2>
            <p>{it.line}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
