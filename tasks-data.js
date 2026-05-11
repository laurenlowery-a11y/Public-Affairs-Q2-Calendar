// Q2 2026 Public Affairs tasks — snapshot from Asana May 11, 2026
// Goals: AP=Anthropic Partnership, HE=Higher Ed Strategy, GP=Govt & Public Sector,
// ES=Events & Speaking, EM=Earned Media/Content Development, RT=Research/Thought Leadership,
// CI=CEO Influence, ER=Earned Revenue, PR=Public Recognition,
// IN=Internal, RC=Relationship Cultivation
window.PA_TASKS = [
  // ---- Active Q2 ----
  { id:'forbes', name:'Forbes CIR Pitch', section:'Media Relations', owner:'Lauren', wa:true, status:'In Progress', goals:['EM'], start:'2026-05-06', due:'2026-06-30', notes:'Goal is Q2 — complicated timeline due to contributions' },
  { id:'atlantic', name:'The Atlantic — Quote + Intro Call', section:'Media Relations', owner:'Lauren', status:'In Progress', goals:['CI'], due:'2026-05-06', notes:'Atlantic story may include a quote from Michael + learn more about CodePath' },
  { id:'wfpr', name:'WF Press Release', section:'Media Relations', owner:'Lauren', status:'In Progress', goals:['EM','ER'], due:'2026-05-13' },
  { id:'qes', name:'Quarterly Engineering Survey', section:'Media Relations', owner:'Lauren', status:'Pending', goals:['EM'], start:'2026-04-30', due:'2026-06-30', notes:'Pending more info' },

  { id:'moret', name:'Op-Ed with Stephen Moret & Michael Ellison', section:'Content Development', owner:'Madison', wa:true, status:'In Progress', goals:['EM','RT'], start:'2026-05-04', due:'2026-06-30', notes:'Goal is Q2 — complicated timeline due to contributions' },
  { id:'ade', name:'Op-Ed with Ade (Base10 Founder) + Michael', section:'Content Development', owner:'Madison', status:'In Progress', goals:['RT'], due:'2026-05-14' },
  { id:'newprofit', name:'New Profit Story', section:'Content Development', owner:'Lauren', status:'Pending', goals:['EM'], due:'2026-05-06' },
  { id:'qletters', name:'CodePath / OOCEO Quarterly Letters', section:'Content Development', owner:'Lauren', status:'In Progress', goals:['CI'], start:'2026-05-04', due:'2026-06-30' },
  { id:'facultyoped', name:'Faculty Op-Ed Pipeline', section:'Content Development', owner:'Lauren', status:'In Progress', goals:['HE','EM'], start:'2026-04-30', due:'2026-06-30', notes:'Goal is Q2, dependent on engagement from contacts' },

  { id:'recogtarget', name:'Target List Creation', section:'Recognition / Awards', owner:'Lauren', status:'In Progress', goals:['PR'], start:'2026-05-04', due:'2026-05-29' },
  { id:'rolling', name:'Rolling Basis Submissions', section:'Recognition / Awards', owner:'Lauren', status:'Not Started', goals:['PR'], due:'2026-06-03' },
  { id:'eventsapprove', name:'Rolling Basis Approval (Events + Speaking)', section:'Recognition / Awards', owner:'Lauren', status:'Not Started', goals:['ES','RT','CI'], due:'2026-06-03' },
  { id:'eventstarget', name:'Target List Creation (Events + Speaking)', section:'Recognition / Awards', owner:'Lauren', status:'In Progress', goals:['ES','RT','CI'], start:'2026-05-04', due:'2026-05-29' },

  { id:'devoffsite', name:'Development Team Offsite (Louisville, KY)', section:'External Event Prep', owner:'Lauren', status:'Pending', goals:['IN'], due:'2026-05-18' },
  { id:'sis', name:'Social Innovation Summit (Atlanta)', section:'External Event Prep', owner:'Lauren', status:'Pending', goals:['ES'], start:'2026-06-02', due:'2026-06-03', notes:'Development Team — attending' },
  { id:'databricks', name:'Databricks Data & AI Summit (San Francisco)', section:'External Event Prep', owner:'Lauren', status:'Pending', goals:['ES'], start:'2026-06-15', due:'2026-06-18', notes:'Development Team — attending' },

  { id:'webinar', name:'Annual Report Internal Webinar', section:'Hosted Convenings', owner:'Lauren', status:'In Progress', goals:['IN'], due:'2026-05-27' },
  { id:'base10panel', name:'Base 10 + Student + Alumni Panel', section:'Hosted Convenings', owner:'Lauren', status:'In Progress', goals:['ES','RC'], due:'2026-06-23' },

  { id:'wallerstein', name:'Learning + Strategy call w/ Wallerstein + Michael', section:'Government Relations', owner:'Lauren', status:'—', goals:['GP'], due:'2026-05-14' },

  { id:'salesforce', name:'Salesforce x CodePath Storytelling and Comms', section:'Misc', owner:'Madison', status:'In Progress', goals:['RC'], due:'2026-05-29' },

  // ---- Q2 wins (Completed/Cancelled in Q2 window) ----
  { id:'wfvideo', name:'WF — Michael Video to be shared', section:'Completed', owner:'Lauren', status:'Completed', goals:['HE','EM'], due:'2026-04-06', completed:true },
  { id:'wfcharlotte', name:'TBD Charlotte/Wells Fargo Event', section:'Completed', owner:'Madison', status:'Completed', goals:['HE','EM'], due:'2026-04-07', completed:true },
  { id:'asugsv', name:'Anthropic + CP side event (ASU GSV)', section:'Completed', owner:'Madison', wa:true, status:'Completed', goals:['GP','RT'], due:'2026-04-13', event:'2026-04-13', completed:true },
  { id:'knightfiu', name:'Knight x FIU x CP S. Florida event (Emerge — Vic)', section:'Completed', owner:'Madison', status:'Completed', goals:['HE'], due:'2026-04-22', event:'2026-04-23', completed:true },
  { id:'wfpartner', name:'Wells Fargo/Charlotte Partnership', section:'Completed', owner:'Victoria', wa:true, status:'Completed', goals:['HE'], due:'2026-04-22', completed:true },
  { id:'milkenglobal', name:'Milken Global Dialogues', section:'Completed', owner:'Madison', wa:true, status:'Completed', goals:[], due:'2026-04-27', event:'2026-05-05', completed:true },
  { id:'milkenanthropic', name:'Anthropic + CP side event (Milken Global)', section:'Completed', owner:'Madison', wa:true, status:'Cancelled', goals:['AP','RT'], due:'2026-05-03', event:'2026-05-05', completed:true },
  { id:'ggi', name:'Golden Gate Institute Convening w/ Superset', section:'Completed', owner:'Madison', status:'Cancelled', goals:[], due:'2026-05-04', completed:true },
  { id:'chenault', name:'Ken Chenault Co-Hosted Event', section:'Completed', owner:'Madison', wa:true, status:'Cancelled', goals:[], due:'2026-05-04', event:'2026-04-15', completed:true },
  { id:'beacon', name:'Talent Bridge Event w/ Beacon Council', section:'Completed', owner:'Madison', status:'Cancelled', goals:[], due:'2026-05-04', notes:'Target major employers', completed:true },
  { id:'fortune', name:'Fortune Brand Studio Documentary', section:'Completed', owner:'Lauren', status:'Cancelled', goals:['EM'], due:'2026-05-04', completed:true, notes:'W/A vetted — not pursuing. Charged for the story.' },
  { id:'durruthy', name:'Op-Ed w/ Rosanna Durruthy (LinkedIn)', section:'Completed', owner:'Madison', status:'Cancelled', goals:[], due:'2026-05-06', completed:true },
  { id:'sisreg', name:'Social Innovation Summit: Registrant List Request', section:'Completed', owner:'Lauren', status:'Completed', goals:[], due:'2026-05-07', completed:true, notes:'Requested by Sarah Perry' },
  { id:'shonda', name:'Introductions: Shonda Gibson and A&M System', section:'Completed', owner:'Lauren', status:'Completed', goals:[], start:'2026-04-30', due:'2026-06-30', completed:true },
  { id:'ooceoQ2', name:'Q2 OOCEO Quarterly Letter', section:'Completed', owner:'Lauren', status:'Completed', goals:['CI'], due:'2026-06-30', completed:true },

  // ---- Beyond Q2 (Q3+) ----
  { id:'jffhorizons', name:'JFF Horizons', section:'External Event Prep', owner:'Madison', wa:true, status:'In Progress', goals:[], due:'2026-07-13', beyond:true },
  { id:'jffknowledge', name:'JFF Horizons — Knowledge Network Kickoff', section:'Hosted Convenings', owner:'Lauren', status:'In Progress', goals:[], due:'2026-07-13', beyond:true },
  { id:'mdanthropic', name:'State of Maryland + Anthropic (JFF Horizons)', section:'Hosted Convenings', owner:'Madison', status:'Pending', goals:[], due:'2026-07-13', beyond:true },
  { id:'uncfunite', name:'UNCF Unite', section:'External Event Prep', owner:'Madison', status:'Pending', goals:[], due:'2026-07-15', event:'2026-07-20', beyond:true },
  { id:'mdairound', name:'Maryland AI Roundtable', section:'Hosted Convenings', owner:'Lauren', status:'Pending', goals:[], due:'2026-07-27', beyond:true },
  { id:'fiu', name:'FIU Case Study', section:'Content Development', owner:'Victoria', status:'In Progress', goals:['HE'], due:'2026-08-03', beyond:true },
  { id:'shultz', name:'Shultz Convening', section:'Hosted Convenings', owner:'Lauren', status:'Pending', goals:[], due:'2026-08-31', beyond:true, notes:'See Vic for more details' },
];

window.PA_GOAL_META = {
  AP: { label:'Anthropic Partnership', color:'#00C385', ink:'#062F54' },
  HE: { label:'Higher Ed Strategy',     color:'#02BCFF', ink:'#062F54' },
  GP: { label:'Govt & Public Sector',   color:'#FFCB03', ink:'#1B1C57' },
  ES: { label:'Events & Speaking',      color:'#FE3C84', ink:'#FFFFFF' },
  EM: { label:'Earned Media / Content', color:'#B243FF', ink:'#FFFFFF' },
  RT: { label:'Research / Thought Ldr', color:'#4F5EFF', ink:'#FFFFFF' },
  CI: { label:'CEO Influence',          color:'#AF1E1E', ink:'#FFFFFF' },
  ER: { label:'Earned Revenue',         color:'#FE6901', ink:'#FFFFFF' },
  PR: { label:'Public Recognition',     color:'#FEA08D', ink:'#1B1C57' },
  IN: { label:'Internal',               color:'#A8C66C', ink:'#1B1C57' },
  RC: { label:'Relationship Cultivation', color:'#00BCB0', ink:'#FFFFFF' },
};

window.PA_STATUS_META = {
  'In Progress': { color:'#FFCB03', dot:'#D9A600' },
  'Pending':     { color:'#FFF6BF', dot:'#D9A600' },
  'Not Started': { color:'#E5E5E5', dot:'#737373' },
  'Blocked':     { color:'#FDECEC', dot:'#AF1E1E' },
  'Ready to Review': { color:'#E9F6FF', dot:'#4F5EFF' },
  'Completed':   { color:'#D2FFD1', dot:'#22A900' },
  'Cancelled':   { color:'#F5F5F5', dot:'#B8B8B8' },
  '—':           { color:'#F5F5F5', dot:'#B8B8B8' },
};

window.PA_OWNER_META = {
  'Lauren':   { initials:'LL', color:'#4F5EFF' },
  'Madison':  { initials:'M',  color:'#B243FF' },
  'Victoria': { initials:'VA', color:'#00C385' },
};
