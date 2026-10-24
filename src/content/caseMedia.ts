/** Portfolio media already published on Dhwani's Framer case-study pages.
 * Use a URL only if the user has publicly released that artifact.
 * DPSS operational screenshots/videos are intentionally excluded pending explicit clearance.
 */
export type CaseMediaItem = {
  kind: "film" | "phone" | "image"
  url: string
  title: string
  detail: string
  owner: "mine" | "team" | "shared"
  poster?: string
  shape?: "wide" | "portrait"
}
export const caseMedia: Record<string, CaseMediaItem[]> = {
  "general-motors": [
    {kind:"film",title:"The in-car screen",detail:"Prototype motion on the vehicle display · team concept",owner:"shared",url:"https://framerusercontent.com/assets/0dibZtjqrd9g6cmZW8QH3f2A0Q.mov",poster:"https://framerusercontent.com/images/29A0ZOMxfReybbtzuRfATcryUjg.png",shape:"wide"},
    {kind:"film",title:"Plan on the phone",detail:"Trip planning before the group hits the road · team concept",owner:"shared",url:"https://framerusercontent.com/assets/VrmcsYlTQ5avTsdGH0XSDIiOnqI.mov",shape:"portrait"},
    {kind:"film",title:"Where is everybody?",detail:"In-car view to keep the convoy together · team concept",owner:"shared",url:"https://framerusercontent.com/assets/pWIEFibz91K1Wj5fcQnZHXnI4E0.mov",shape:"wide"},
    {kind:"film",title:"The trip organizer",detail:"What the host sees and manages · team concept",owner:"shared",url:"https://framerusercontent.com/assets/a8KPynb3qlZ6Qx7cdMV4b7Nq3j4.mov",shape:"wide"},
    {kind:"film",title:"After the drive",detail:"The closing moment of the trip prototype · team concept",owner:"shared",url:"https://framerusercontent.com/assets/5AODOc5vwowRoVEUHFwVK5Cm0.mov",shape:"wide"},
    {kind:"image",title:"The concept in context",detail:"Original project image published on the Framer GM case study",owner:"shared",url:"https://framerusercontent.com/images/eogQzlLlJkKRjhqtEK3LlHYx1aU.png",shape:"wide"},
    {kind:"image",title:"Interface exploration",detail:"Original project image published on the Framer GM case study",owner:"shared",url:"https://framerusercontent.com/images/bbC5Z4JP5oocNq8wjwNNRFHys.png",shape:"wide"},
  ],
  budgetcart: [
    {kind:"phone",title:"AI cart builder",detail:"My flow · editable starter cart from a prompt",owner:"mine",url:"/case-shots/budgetcart/smart-ai.png",shape:"portrait"},
    {kind:"phone",title:"Budget Calendar",detail:"My flow · spending and budget planning",owner:"mine",url:"/case-shots/budgetcart/budget-calendar.png",shape:"portrait"},
    {kind:"phone",title:"Item-first browsing",detail:"Team flow · iteration based on prototype feedback",owner:"team",url:"/case-shots/budgetcart/item-first-browse.png",shape:"portrait"},
    {kind:"phone",title:"Store comparison",detail:"Anne's flow · totals and eligibility at the choice",owner:"team",url:"/case-shots/budgetcart/store-comparison.png",shape:"portrait"},
    {kind:"image",title:"The final flow, together",detail:"Original BudgetCart contact sheet from the published portfolio",owner:"shared",url:"https://framerusercontent.com/images/COjbLFwAmGvtuuKJLEwMwK4km8.png"},
    {kind:"image",title:"Details where shoppers decide",detail:"Published item-decision screen montage",owner:"shared",url:"https://framerusercontent.com/images/uPP7lhLkly1KwKE5wBOnpFOykB0.png"},
    {kind:"image",title:"More of the shopping flow",detail:"Original BudgetCart screen gallery",owner:"shared",url:"https://framerusercontent.com/images/Idl5R7hLN8rPEaYL9cbyYQqisk.png"},
    {kind:"image",title:"Screen study 01",detail:"Original BudgetCart artifact from the published portfolio",owner:"shared",url:"https://framerusercontent.com/images/6lTUiDS9b7lZTxlCra5BQyizw4.png"},
    {kind:"image",title:"Screen study 02",detail:"Original BudgetCart artifact from the published portfolio",owner:"shared",url:"https://framerusercontent.com/images/nCIFZ0Q7ZsHHXjZX9wKGyTWpEY.png"},
  ],
  openlibrary: [
    {kind:"film",title:"Where the research happened",detail:"Published Open Library research footage · not a shipped product",owner:"team",url:"https://framerusercontent.com/assets/RJtQzxfrsLVRsXkPPVUBkHPWsU.mp4",poster:"https://framerusercontent.com/images/khnJGJvOghz1Tnm55VQc0KOJMy0.png",shape:"wide"},
    {kind:"image",title:"Who we talked to",detail:"Multilingual students and people supporting them · published research overview",owner:"team",url:"https://framerusercontent.com/images/jW0NYbdxXDDe8DqIkhRMXvecaQ.png",shape:"wide"},
  ],
}
