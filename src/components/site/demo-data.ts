export type Status = "Addendum Review" | "Scope Clarification" | "Ready for Team Review";
export const STATUSES: Status[] = ["Addendum Review", "Scope Clarification", "Ready for Team Review"];

export type ChecklistItem = { id: string; label: string; done: boolean };
export type DocSection = { heading: string; body: string[] };
export type Extract = { label: string; value: string; checklistId?: string };
export type Doc = {
  id: string;
  name: string;
  type: "Invitation to Bid" | "Specification" | "Drawings" | "Addendum";
  note: string;
  pages: number;
  flag?: string;
  sections: DocSection[];
  extracted: Extract[];
};
export type Question = { id: string; text: string; resolved: boolean; source?: string | undefined };
export type Addendum = {
  id: string;
  label: string;
  issued: string;
  reviewed: boolean;
  docId?: string;
  summary: string;
  changes: string[];
  affects: string[]; // checklist ids
};
export type Project = {
  id: string;
  name: string;
  gc: string;
  trade: string;
  location: string;
  due: string;
  daysLeft: number;
  status: Status;
  flagged: boolean;
  checklist: ChecklistItem[];
  documents: Doc[];
  questions: Question[];
  addenda: Addendum[];
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "Northgate Medical Expansion",
    gc: "Sample GC A",
    trade: "Electrical",
    location: "Northgate, fictional city",
    due: "Oct 28, 2:00 PM",
    daysLeft: 3,
    status: "Addendum Review",
    flagged: false,
    checklist: [
      { id: "c1", label: "ITB and bid form received", done: true },
      { id: "c2", label: "Electrical drawings E-001 to E-412 logged", done: true },
      { id: "c3", label: "Addendum 02 reviewed against scope", done: false },
      { id: "c4", label: "Bonding requirement confirmed (100% P&P bond)", done: false },
      { id: "c5", label: "Bid form unit prices completed", done: false },
    ],
    documents: [
      {
        id: "d1",
        name: "ITB_Northgate_Electrical.pdf",
        type: "Invitation to Bid",
        note: "Invitation and bid form",
        pages: 6,
        sections: [
          { heading: "1. Project", body: ["Northgate Medical Expansion, 3-storey outpatient wing (approx. 64,000 sf).", "General Contractor: Sample GC A. Owner: fictional regional health system."] },
          { heading: "2. Bid Submission", body: ["Sealed bids due Oct 28, 2:00 PM local time via the GC's bid portal.", "Bids must use the attached bid form, including unit prices for added receptacles and lighting fixtures."] },
          { heading: "3. Bonding & Insurance", body: ["A 5% bid bond is required with submission.", "Successful bidder must provide 100% performance and payment bonds."] },
          { heading: "4. Pre-Bid Meeting", body: ["Non-mandatory pre-bid walk held Oct 14. Minutes issued as Addendum 01."] },
        ],
        extracted: [
          { label: "Bid due", value: "Oct 28, 2:00 PM" },
          { label: "Bid bond", value: "5% of bid amount" },
          { label: "P&P bond", value: "100% performance & payment", checklistId: "c4" },
          { label: "Required deliverable", value: "Bid form with unit prices", checklistId: "c5" },
        ],
      },
      {
        id: "d2",
        name: "Spec_Div26_Electrical.pdf",
        type: "Specification",
        note: "Division 26 specifications",
        pages: 142,
        sections: [
          { heading: "26 05 00 Common Work Results", body: ["Contractor shall provide all labor, materials and equipment for a complete electrical installation.", "Temporary power: refer to Division 01 — responsibility not stated in this section."] },
          { heading: "26 24 16 Panelboards", body: ["Panelboards per schedules on drawings E-601 through E-605.", "Provide 25% spare breaker capacity in all branch panels."] },
          { heading: "28 31 00 Fire Detection (reference)", body: ["Fire alarm system referenced in Division 28; coordinate with Division 26."] },
        ],
        extracted: [
          { label: "Spare capacity", value: "25% spare breakers in branch panels" },
          { label: "Ambiguity", value: "Temporary power responsibility not stated" },
          { label: "Ambiguity", value: "Fire alarm split between Div 26 and Div 28" },
        ],
      },
      {
        id: "d3",
        name: "Addendum_02.pdf",
        type: "Addendum",
        note: "Revised panel schedules",
        pages: 4,
        flag: "Revises panel schedules after drawings were logged",
        sections: [
          { heading: "Addendum 02 — Issued Oct 21", body: ["Item 1: Panel schedules LP-2A and LP-2B revised; 12 additional 20A circuits.", "Item 2: Drawing E-603 reissued (Rev 2).", "Item 3: Bid date unchanged."] },
        ],
        extracted: [
          { label: "Change", value: "+12 × 20A circuits on LP-2A / LP-2B", checklistId: "c3" },
          { label: "Reissued drawing", value: "E-603 Rev 2", checklistId: "c3" },
          { label: "Bid date", value: "Unchanged" },
        ],
      },
    ],
    questions: [
      { id: "q1", text: "Is temporary power included in electrical scope or by GC?", resolved: false, source: "Spec_Div26_Electrical.pdf" },
      { id: "q2", text: "Confirm fire alarm scope responsibility (Div 26 vs Div 28).", resolved: false, source: "Spec_Div26_Electrical.pdf" },
    ],
    addenda: [
      { id: "A01", label: "Addendum 01 · Pre-bid minutes & schedule", issued: "Oct 15", reviewed: true, summary: "Pre-bid meeting minutes and updated construction schedule.", changes: ["Substantial completion moved two weeks later.", "Site access via north gate only."], affects: ["c1"] },
      { id: "A02", label: "Addendum 02 · Panel schedules", issued: "Oct 21", reviewed: false, docId: "d3", summary: "Revised panel schedules and reissued drawing E-603.", changes: ["12 additional 20A circuits on LP-2A / LP-2B.", "E-603 reissued as Rev 2."], affects: ["c2", "c3"] },
    ],
  },
  {
    id: "p2",
    name: "Lakeside Logistics Center",
    gc: "Sample GC B",
    trade: "HVAC",
    location: "Lakeside, fictional city",
    due: "Nov 4, 11:00 AM",
    daysLeft: 10,
    status: "Scope Clarification",
    flagged: false,
    checklist: [
      { id: "c1", label: "ITB and bid form received", done: true },
      { id: "c2", label: "Mechanical drawings logged", done: true },
      { id: "c3", label: "Controls scope boundary defined", done: false },
      { id: "c4", label: "Exclusions list drafted", done: false },
      { id: "c5", label: "Equipment lead times checked (RTUs)", done: false },
    ],
    documents: [
      {
        id: "d1",
        name: "ITB_Lakeside_Mechanical.pdf",
        type: "Invitation to Bid",
        note: "Invitation and bid form",
        pages: 5,
        sections: [
          { heading: "1. Project", body: ["Lakeside Logistics Center, 420,000 sf distribution warehouse with 18,000 sf office."] },
          { heading: "2. Bid Submission", body: ["Bids due Nov 4, 11:00 AM by email to the GC estimating team.", "Include a list of clarifications and exclusions with the bid."] },
          { heading: "3. Schedule", body: ["Rooftop units must be set by week 22 of the project schedule."] },
        ],
        extracted: [
          { label: "Bid due", value: "Nov 4, 11:00 AM" },
          { label: "Required deliverable", value: "Clarifications & exclusions list", checklistId: "c4" },
          { label: "Schedule constraint", value: "RTUs set by week 22", checklistId: "c5" },
        ],
      },
      {
        id: "d2",
        name: "M-Series_Drawings.pdf",
        type: "Drawings",
        note: "Mechanical plans",
        pages: 38,
        flag: "Controls responsibility unclear on M-501",
        sections: [
          { heading: "M-101 to M-104 Roof Plans", body: ["14 rooftop units (RTU-1 to RTU-14), curbs shown as 'by others'."] },
          { heading: "M-501 Controls Diagram", body: ["BAS points list shown; note reads 'controls by Division 23 or 25 contractor'."] },
        ],
        extracted: [
          { label: "Equipment", value: "14 rooftop units", checklistId: "c5" },
          { label: "Ambiguity", value: "Curbs 'by others' — not assigned" },
          { label: "Ambiguity", value: "Controls by Div 23 or 25", checklistId: "c3" },
        ],
      },
      {
        id: "d3",
        name: "Spec_Div23_HVAC.pdf",
        type: "Specification",
        note: "Division 23 specifications",
        pages: 96,
        sections: [
          { heading: "23 05 93 Testing, Adjusting & Balancing", body: ["TAB agency to be engaged by owner — confirm before excluding."] },
          { heading: "23 74 13 Packaged RTUs", body: ["Basis of design listed; two approved equals."] },
        ],
        extracted: [{ label: "TAB", value: "Possibly owner-provided" }],
      },
    ],
    questions: [
      { id: "q1", text: "Building automation controls: HVAC sub or separate controls contractor?", resolved: false, source: "M-Series_Drawings.pdf" },
      { id: "q2", text: "Rooftop unit curbs and structural supports: whose scope?", resolved: false, source: "M-Series_Drawings.pdf" },
      { id: "q3", text: "Test and balance: included or by owner?", resolved: false, source: "Spec_Div23_HVAC.pdf" },
    ],
    addenda: [
      { id: "A01", label: "Addendum 01 · Pre-bid minutes", issued: "Oct 20", reviewed: true, summary: "Pre-bid minutes; GC to answer controls question in Addendum 02.", changes: ["Controls scope question logged by GC.", "No change to bid date."], affects: ["c3"] },
    ],
  },
  {
    id: "p3",
    name: "City Library Renovation",
    gc: "Sample GC C",
    trade: "Fire Protection",
    location: "Downtown, fictional city",
    due: "Nov 12, 3:00 PM",
    daysLeft: 18,
    status: "Ready for Team Review",
    flagged: false,
    checklist: [
      { id: "c1", label: "ITB and bid form received", done: true },
      { id: "c2", label: "Fire protection drawings logged", done: true },
      { id: "c3", label: "Hydraulic calc responsibility confirmed", done: true },
      { id: "c4", label: "Exclusions list drafted", done: true },
    ],
    documents: [
      {
        id: "d1",
        name: "ITB_Library_FireProtection.pdf",
        type: "Invitation to Bid",
        note: "Invitation and bid form",
        pages: 4,
        sections: [
          { heading: "1. Project", body: ["Renovation of a 1960s public library, phased while partially occupied."] },
          { heading: "2. Bid Submission", body: ["Bids due Nov 12, 3:00 PM. Delegated design: hydraulic calculations by bidder."] },
        ],
        extracted: [
          { label: "Bid due", value: "Nov 12, 3:00 PM" },
          { label: "Delegated design", value: "Hydraulic calcs by bidder", checklistId: "c3" },
        ],
      },
      {
        id: "d2",
        name: "FP-Series_Drawings.pdf",
        type: "Drawings",
        note: "Sprinkler layout",
        pages: 12,
        sections: [{ heading: "FP-101 to FP-103", body: ["Wet system throughout; dry system in unheated book drop."] }],
        extracted: [{ label: "Systems", value: "Wet + one dry zone" }],
      },
      {
        id: "d3",
        name: "Spec_Div21_FireSuppression.pdf",
        type: "Specification",
        note: "Division 21 specifications",
        pages: 28,
        sections: [{ heading: "21 13 13 Wet-Pipe Sprinklers", body: ["Concealed heads in public areas; quick-response throughout."] }],
        extracted: [{ label: "Heads", value: "Concealed, quick-response" }],
      },
    ],
    questions: [],
    addenda: [
      { id: "A01", label: "Addendum 01 · Clarifications", issued: "Oct 25", reviewed: true, summary: "Confirms delegated hydraulic design and phasing.", changes: ["Hydraulic calcs confirmed as bidder's scope.", "Two phases; second phase after library reopens."], affects: ["c3"] },
    ],
  },
];

export function reviewCount(p: Project) {
  return (
    p.checklist.filter((c) => !c.done).length +
    p.addenda.filter((a) => !a.reviewed).length +
    p.questions.filter((q) => !q.resolved).length
  );
}

export function computeMetrics(projects: Project[]) {
  return {
    active: projects.length,
    upcoming: projects.filter((p) => p.daysLeft <= 14).length,
    review: projects.reduce((n, p) => n + reviewCount(p), 0),
    underReview: projects.filter((p) => p.status !== "Ready for Team Review").length,
    flagged: projects.filter((p) => p.flagged).length,
  };
}

export function filterProjects(projects: Project[], query: string, status: "All" | Status) {
  const q = query.trim().toLowerCase();
  return projects.filter(
    (p) =>
      (status === "All" || p.status === status) &&
      (!q || [p.name, p.gc, p.trade].some((s) => s.toLowerCase().includes(q))),
  );
}

export type Action =
  | { type: "toggleCheck"; projectId: string; itemId: string }
  | { type: "toggleFlag"; projectId: string }
  | { type: "setStatus"; projectId: string; status: Status }
  | { type: "addQuestion"; projectId: string; text: string; source?: string }
  | { type: "toggleQuestion"; projectId: string; questionId: string }
  | { type: "deleteQuestion"; projectId: string; questionId: string }
  | { type: "toggleAddendum"; projectId: string; addendumId: string }
  | { type: "reset" };

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export function reducer(state: Project[], a: Action): Project[] {
  if (a.type === "reset") return clone(INITIAL_PROJECTS);
  return state.map((p) => {
    if (p.id !== a.projectId) return p;
    switch (a.type) {
      case "toggleCheck":
        return { ...p, checklist: p.checklist.map((c) => (c.id === a.itemId ? { ...c, done: !c.done } : c)) };
      case "toggleFlag":
        return { ...p, flagged: !p.flagged };
      case "setStatus":
        return { ...p, status: a.status };
      case "addQuestion": {
        const text = a.text.trim();
        if (!text) return p;
        const id = `q${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        return { ...p, questions: [...p.questions, { id, text, resolved: false, source: a.source }] };
      }
      case "toggleQuestion":
        return { ...p, questions: p.questions.map((q) => (q.id === a.questionId ? { ...q, resolved: !q.resolved } : q)) };
      case "deleteQuestion":
        return { ...p, questions: p.questions.filter((q) => q.id !== a.questionId) };
      case "toggleAddendum":
        return { ...p, addenda: p.addenda.map((x) => (x.id === a.addendumId ? { ...x, reviewed: !x.reviewed } : x)) };
    }
  });
}

export const STORAGE_KEY = "actelus-demo-v1";

export function loadState(storage: Pick<Storage, "getItem"> | undefined): Project[] {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((p) => p && typeof p.id === "string" && Array.isArray(p.checklist))) return parsed;
    }
  } catch {
    /* corrupted data falls back to defaults */
  }
  return clone(INITIAL_PROJECTS);
}

export function docToText(p: Project, d: Doc) {
  const lines = [
    "SAMPLE DOCUMENT — FICTIONAL, FOR DEMONSTRATION ONLY",
    "",
    d.name,
    `${d.type} · ${p.name} · ${p.gc} · ${p.trade}`,
    "",
  ];
  d.sections.forEach((s) => lines.push(s.heading, ...s.body.map((b) => `  ${b}`), ""));
  lines.push("Highlighted items (simulated, prepared by hand for this demo):");
  d.extracted.forEach((e) => lines.push(`  - ${e.label}: ${e.value}`));
  return lines.join("\n");
}

export function reportToText(p: Project) {
  const lines = [
    "BID READINESS SUMMARY — SAMPLE DATA, FOR DEMONSTRATION ONLY",
    "",
    `${p.name}`,
    `${p.gc} · ${p.trade} · Due ${p.due} (${p.daysLeft} days)`,
    `Status: ${p.status}${p.flagged ? " · Marked for team review" : ""}`,
    `Open review items: ${reviewCount(p)}`,
    "",
    "Checklist:",
    ...p.checklist.map((c) => `  [${c.done ? "x" : " "}] ${c.label}`),
    "",
    "Addenda:",
    ...p.addenda.map((a) => `  ${a.label} — ${a.reviewed ? "Reviewed" : "Pending"}`),
    "",
    "Clarification questions:",
    ...(p.questions.length ? p.questions.map((q) => `  [${q.resolved ? "Resolved" : "Open"}] ${q.text}`) : ["  None logged."]),
    "",
    "Documents:",
    ...p.documents.map((d) => `  ${d.name} (${d.type})`),
  ];
  return lines.join("\n");
}
