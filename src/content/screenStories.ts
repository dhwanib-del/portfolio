import type {StoryScreen} from "@/components/case/ScreenStory"
// Mapping is intentionally portable: in Framer, replace src with uploaded asset URLs.
// DPSS images were found in the portfolio repo but are gated until approval.
export const screenStories:Record<string,{title:string;screens:StoryScreen[];readyForPublic:boolean}>={
 intel:{title:"A workspace that keeps the context together.",readyForPublic:false,screens:[
 {src:"/case-shots/intel/01-home.jpg",alt:"Intelligence Hub command center",chapter:"Command center",caption:"A view of ongoing work and the information analysts need to orient themselves.",reviewRequired:true},
 {src:"/case-shots/intel/03-cases-overview.jpg",alt:"Intelligence Hub case overview",chapter:"Case overview",caption:"The case context and current status need to remain clear across handoffs.",reviewRequired:true},
 {src:"/case-shots/intel/06-case-workup.jpg",alt:"Intelligence Hub workup screen",chapter:"Investigate a case",caption:"The interface connects investigation work to the current case.",reviewRequired:true},
 {src:"/case-shots/intel/09-review-queue.jpg",alt:"Intelligence Hub review queue",chapter:"Review and next actions",caption:"Review states are part of the product, not an afterthought.",reviewRequired:true}
 ]},
 briefs:{title:"Make a building record easier to navigate.",readyForPublic:false,screens:[
 {src:"/case-shots/briefs/01-home.jpg",alt:"BRIEFS home screen",chapter:"Find the starting point",caption:"An entry to the building-information workflow.",reviewRequired:true},
 {src:"/case-shots/briefs/02-buildings.jpg",alt:"BRIEFS building information view",chapter:"Find the record",caption:"Building records are the center of the retrieval task.",reviewRequired:true},
 {src:"/case-shots/briefs/03-assistant.jpg",alt:"BRIEFS assistant screen",chapter:"Check the source",caption:"Assistant behavior should remain verifiable against approved source material.",reviewRequired:true}
 ]},
 "general-motors":{title:"From a driver profile to a shared trip.",readyForPublic:true,screens:[
 {alt:"Original biometric exploration",chapter:"The original bet",caption:"Place the existing early biometric concept export here."},
 {alt:"Original GM trip planning UI",chapter:"Plan before driving",caption:"Place the final phone planning screen export here."},
 {alt:"Original GM in-vehicle HMI",chapter:"Coordinate on the road",caption:"Place the final in-drive screen export here."},
 {alt:"3D-printed truck cab test photo",chapter:"Test the physical interaction",caption:"Place the cleared prototype evaluation image here."}
 ]},
 openlibrary:{title:"Research changed the recommendation.",readyForPublic:true,screens:[
 {alt:"Open Library affinity mapping evidence",chapter:"Find the pattern",caption:"Add a cleared crop of the team affinity map from the original report."},
 {alt:"Reading journey interruption diagram",chapter:"See the hidden friction",caption:"Add the original research synthesis artifact or a source-grounded diagram."},
 {alt:"Contextual language support recommendation",chapter:"Bring help into context",caption:"Add an existing approved recommendation visual. This was a proposal, not an implemented interface."}
 ]}
}
