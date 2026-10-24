import type { CaseMediaItem } from "@/content/caseMedia"

export type Feature = {
  title: string
  caption: string
  mediaIndex: number
  ownership?: "mine" | "team" | "shared"
}

/** Each mediaIndex refers to a real item in caseMedia.ts.
 * Short editorial labels explain the feature rather than claiming unmeasured impact.
 */
export const caseFeatures: Record<string, Feature[]> = {
  budgetcart: [
    {title:"Start with a budget. Not a blank chat.",caption:"I designed a guided AI cart builder that starts with the shopper’s budget and needs, then leaves room to edit every suggestion.",mediaIndex:0,ownership:"mine"},
    {title:"A calendar for what you can spend—and when.",caption:"My Budget Calendar puts shopping alongside spending days, so planning isn’t a separate spreadsheet.",mediaIndex:1,ownership:"mine"},
    {title:"Show the details at the moment of choice.",caption:"After the first prototype made browsing harder, the team restored brand, store and price information. The revised flow was not retested.",mediaIndex:2,ownership:"team"},
    {title:"Make the whole trip visible.",caption:"The store comparison brings together cart totals and SNAP/WIC labels. This was part of Anne’s flow.",mediaIndex:3,ownership:"team"},
  ],
  "general-motors": [
    {title:"Before the keys, there’s the plan.",caption:"A group road trip starts on the phone. The experience lets people organize the journey before anyone starts driving.",mediaIndex:1,ownership:"shared"},
    {title:"Then the truck takes over.",caption:"The in-car view focuses on where the group is and how it’s doing, rather than turning the dashboard into a planning app.",mediaIndex:2,ownership:"shared"},
    {title:"One organizer, one shared route.",caption:"The convoy host helps coordinate the trip. We didn’t establish whether everyone would want the same level of control.",mediaIndex:3,ownership:"shared"},
    {title:"Bring the journey to a close.",caption:"A final prototype sequence completes the concept story. This is not a shipped GM vehicle feature.",mediaIndex:4,ownership:"shared"},
  ],
  openlibrary: [
    {title:"The moment reading breaks.",caption:"People described leaving the book to look up language, then trying to find their place again. We traced that friction through interviews.",mediaIndex:0,ownership:"team"},
    {title:"Our evidence changed the recommendation.",caption:"Eight interviews and 330 mapped data points led us away from proposing another tool, toward better access to the help that already existed.",mediaIndex:1,ownership:"team"},
  ],
}
export function getFeaturedMedia(items:CaseMediaItem[],feature:Feature) { return items[feature.mediaIndex] }
