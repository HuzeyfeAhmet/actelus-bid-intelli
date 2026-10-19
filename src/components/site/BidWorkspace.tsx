import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, LayoutDashboard, FolderKanban, FileText, MessageSquare, Layers, CalendarDays, ClipboardCheck, Search, Flag, Clock, ChevronRight, Download, CheckCircle2, Circle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjects } from "./demo-store";
import { computeMetrics, reviewCount, reportToText, STATUSES, filterProjects, type Status, type Project } from "./demo-data";
import { ProjectDetail, DocumentDialog, AddendumDialog } from "./BidDashboard";
import { toast } from "sonner";

const views = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Opportunities", icon: FolderKanban },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "questions", label: "Clarifications", icon: MessageSquare },
  { id: "addenda", label: "Addenda", icon: Layers },
  { id: "deadlines", label: "Bid calendar", icon: CalendarDays },
  { id: "reports", label: "Readiness reports", icon: ClipboardCheck },
] as const;
type View = typeof views[number]["id"];

function saveReport(p: Project) {
  const url = URL.createObjectURL(new Blob([reportToText(p)], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${p.name.replace(/\s+/g, "_")}_SAMPLE.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast.success("Sample readiness report downloaded");
}

export function BidWorkspace() {
  const projects = useProjects();
  const [view, setView] = useState<View>("overview");
  const [selectedId, setSelectedId] = useState("p1");
  const [tab, setTab] = useState("checklist");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [docId, setDocId] = useState<string | null>(null);
  const [addId, setAddId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const selected = projects.find(p => p.id === selectedId) ?? projects[0];
  const metrics = computeMetrics(projects);
  const rows = filterProjects(projects, query, status);
  const current = views.find(v => v.id === view) ?? views[0];
  const openProject = (id: string, targetTab = "checklist") => {
    setSelectedId(id); setTab(targetTab); setView("projects"); setDocId(null); setAddId(null);
  };
  const navigate = (next: View) => { setView(next); setMenuOpen(false); setQuery(""); setStatus("All"); };
  if (!selected) return null;
  const documents = rows.flatMap(p => p.documents.map(doc => ({ p, doc })));
  const questions = rows.flatMap(p => p.questions.map(q => ({ p, q })));
  const addenda = rows.flatMap(p => p.addenda.map(a => ({ p, a })));
  const doc = selected.documents.find(d => d.id === docId) ?? null;
  const addendum = selected.addenda.find(a => a.id === addId) ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
      <aside className={cn("border-r border-navy-line bg-navy text-navy-foreground lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col", menuOpen ? "fixed inset-0 z-50 flex flex-col" : "hidden")}>
        <div className="flex h-20 items-center justify-between border-b border-navy-line px-6">
          <Link to="/" className="font-display text-xl font-extrabold">ACTELUS<span className="mt-1 block font-mono text-[9px] font-normal text-navy-muted">AEC BID INTELLIGENCE</span></Link>
          <Button variant="ghost" size="icon" aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="lg:hidden"><X /></Button>
        </div>
        <div className="px-6 pb-3 pt-8 font-mono text-[10px] text-navy-muted">WORKSPACE</div>
        <nav aria-label="Workspace navigation" className="space-y-1 px-3">
          {views.map(({ id, label, icon: Icon }) => <Button key={id} variant="ghost" onClick={() => navigate(id)} aria-current={view === id ? "page" : undefined} className={cn("h-11 w-full justify-start px-3 text-navy-muted hover:bg-navy-2 hover:text-navy-foreground", view === id && "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground")}><Icon />{label}{id === "questions" && <span className="ml-auto font-mono text-xs">{projects.reduce((n,p) => n + p.questions.filter(q => !q.resolved).length, 0)}</span>}</Button>)}
        </nav>
        <div className="mt-auto border-t border-navy-line p-5">
          <div className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-accent" /> Demo workspace</div>
          <p className="mt-2 text-xs leading-relaxed text-navy-muted">Fictional projects · Not live<br />Changes saved in this browser</p>
          <Button asChild variant="ghost" className="mt-4 w-full justify-start px-0 text-navy-muted hover:bg-navy-2 hover:text-navy-foreground"><Link to="/"><ArrowLeft /> Back to website</Link></Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="lg:hidden"><Menu /></Button>
            <div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-bold lg:hidden">ACTELUS</span><span className="hidden text-muted-foreground sm:inline">Workspace</span><ChevronRight className="hidden h-3 w-3 text-muted-foreground sm:block" /><span>{current.label}</span></div>
          </div>
          <span className="shrink-0 rounded border border-border bg-secondary px-2 py-1 font-mono text-[10px] text-muted-foreground">SAMPLE DATA</span>
        </header>

        <main className="mx-auto max-w-[1600px] p-4 sm:p-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div><div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">ACTELUS / BID OPERATIONS</div><h1 className="text-3xl font-bold">{view === "overview" ? "Bid control center" : current.label}</h1></div>
            {view === "overview" && <Button onClick={() => navigate("projects")}><FolderKanban /> Review opportunities <ArrowUpRight /></Button>}
          </div>

          {view === "overview" ? <>
            <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
              {[{ label: "Active opportunities", value: metrics.active, icon: FolderKanban }, { label: "Due within 14 days", value: metrics.upcoming, icon: Clock }, { label: "Open review items", value: metrics.review, icon: Circle }, { label: "Ready for team review", value: projects.length - metrics.underReview, icon: CheckCircle2 }].map(({label,value,icon: Icon}) => <div key={label} className="rounded-md border border-border bg-card p-4 sm:p-5"><div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{label}</span><Icon className="h-4 w-4 shrink-0" /></div><div className="mt-4 font-display text-4xl font-semibold">{value}</div></div>)}
            </div>
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
              <section><SectionHeading title="Opportunity pipeline" count={projects.length} /><ProjectTable rows={projects} selectedId={selectedId} open={openProject} />
                <div className="mt-8"><SectionHeading title="Review queue" count={metrics.review} /><div className="divide-y divide-border border-y border-border">{projects.filter(p => reviewCount(p) > 0).map(p => <Button key={p.id} variant="ghost" onClick={() => openProject(p.id)} className="h-auto w-full justify-between whitespace-normal rounded-none px-0 py-4 text-left hover:bg-secondary"><span><span className="block font-semibold">{p.name}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{p.checklist.filter(c => !c.done).length} checklist items · {p.questions.filter(q => !q.resolved).length} questions · {p.addenda.filter(a => !a.reviewed).length} addenda</span></span><span className="ml-3 flex items-center gap-2 font-mono text-sm text-info">{reviewCount(p)}<ChevronRight className="h-4 w-4" /></span></Button>)}</div></div>
              </section>
              <section><SectionHeading title="Upcoming bid deadlines" /><div className="divide-y divide-border border-y border-border">{[...projects].sort((a,b) => a.daysLeft-b.daysLeft).map(p => <Button key={p.id} variant="ghost" onClick={() => openProject(p.id)} className="h-auto w-full justify-start gap-4 whitespace-normal rounded-none px-0 py-5 text-left hover:bg-secondary"><div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded border border-border bg-secondary"><span className="font-display text-xl font-bold">{p.daysLeft}</span><span className="font-mono text-[9px] text-muted-foreground">DAYS</span></div><span className="min-w-0"><span className="block text-sm font-semibold">{p.name}</span><span className="mt-1 block font-mono text-[11px] text-muted-foreground">{p.due}</span><span className="mt-1 block text-xs text-muted-foreground">{p.trade}</span></span></Button>)}</div>
                <div className="mt-8 border-t-2 border-info pt-5"><h3 className="font-semibold">Package readiness</h3>{projects.map(p => <div key={p.id} className="mt-5"><div className="mb-2 flex justify-between gap-3 text-xs"><span>{p.name}</span><span className="font-mono text-muted-foreground">{p.checklist.filter(c => c.done).length}/{p.checklist.length}</span></div><div className="flex gap-1" aria-label={`${p.name} checklist progress`}>{p.checklist.map(c => <span key={c.id} className={cn("h-2 flex-1 rounded-sm", c.done ? "bg-success" : "bg-border")} />)}</div></div>)}</div>
              </section>
            </div>
          </> : <>
            <div className="mb-6 flex flex-wrap gap-3">
              <label className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input aria-label="Search workspace" placeholder="Search project, contractor or trade…" value={query} onChange={e => setQuery(e.target.value)} className="h-10 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></label>
              <select aria-label="Filter workspace status" value={status} onChange={e => setStatus(e.target.value as typeof status)} className="h-10 max-w-full rounded-md border border-input bg-card px-3 text-sm"><option value="All">All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
            </div>
            {rows.length === 0 && <div className="border-y border-border py-12 text-center text-muted-foreground">No opportunities match these filters.<Button variant="link" onClick={() => { setQuery(""); setStatus("All"); }}>Clear filters</Button></div>}
            {view === "projects" && <><ProjectTable rows={rows} selectedId={selectedId} open={openProject} /><section className="workspace-review mt-8 border-y border-border"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3"><span className="font-mono text-[10px] text-muted-foreground">PROJECT REVIEW</span><span className="text-xs text-muted-foreground">{selected.location}</span></div><ProjectDetail p={selected} tab={tab} setTab={setTab} openDoc={setDocId} openAddendum={setAddId} /></section></>}
            {view === "documents" && <div className="divide-y divide-border border-y border-border">{documents.map(({p,doc: d}) => <Button key={`${p.id}-${d.id}`} variant="ghost" onClick={() => { setSelectedId(p.id); setDocId(d.id); }} className="h-auto w-full justify-start gap-4 whitespace-normal rounded-none px-2 py-5 text-left hover:bg-secondary"><FileText className="text-info" /><span className="min-w-0 flex-1"><span className="block break-all font-mono text-sm">{d.name}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{p.name} · {d.type} · {d.pages} pages</span></span>{d.flag && <Flag className="text-warning" />}<ArrowUpRight /></Button>)}</div>}
            {view === "questions" && <div className="divide-y divide-border border-y border-border">{questions.map(({p,q}) => <Button key={`${p.id}-${q.id}`} variant="ghost" onClick={() => openProject(p.id,"questions")} className="h-auto w-full justify-start gap-4 whitespace-normal rounded-none px-2 py-5 text-left hover:bg-secondary">{q.resolved ? <CheckCircle2 className="text-success" /> : <MessageSquare className="text-info" />}<span className="flex-1"><span className="block">{q.text}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{p.name}{q.source && ` · ${q.source}`}</span></span><span className="text-xs text-muted-foreground">{q.resolved ? "Resolved" : "Open"}</span><ChevronRight /></Button>)}{questions.length === 0 && rows.length > 0 && <p className="py-8 text-muted-foreground">No clarification questions.</p>}</div>}
            {view === "addenda" && <div className="divide-y divide-border border-y border-border">{addenda.map(({p,a}) => <Button key={`${p.id}-${a.id}`} variant="ghost" onClick={() => { setSelectedId(p.id); setAddId(a.id); }} className="h-auto w-full justify-start gap-4 whitespace-normal rounded-none px-2 py-5 text-left hover:bg-secondary"><Layers className="text-info" /><span className="flex-1"><span className="block">{a.label}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{p.name} · Issued {a.issued}</span><span className="mt-2 block text-sm font-normal text-muted-foreground">{a.summary}</span></span><span className={cn("text-xs", a.reviewed ? "text-success" : "text-info")}>{a.reviewed ? "Reviewed" : "Pending"}</span><ChevronRight /></Button>)}</div>}
            {view === "deadlines" && <div className="divide-y divide-border border-y border-border">{[...rows].sort((a,b) => a.daysLeft-b.daysLeft).map(p => <Button key={p.id} variant="ghost" onClick={() => openProject(p.id)} className="h-auto w-full justify-start gap-5 whitespace-normal rounded-none px-2 py-6 text-left hover:bg-secondary"><CalendarDays className="text-info" /><span className="flex-1"><span className="block font-semibold">{p.name}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{p.gc} · {p.trade}</span></span><span className="text-right"><span className="block font-mono text-sm">{p.due}</span><span className="mt-1 block text-xs text-muted-foreground">{p.daysLeft} days left · Sample deadline</span></span><ChevronRight /></Button>)}</div>}
            {view === "reports" && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map(p => <article key={p.id} className="rounded-md border border-border bg-card p-5"><ClipboardCheck className="h-5 w-5 text-info" /><h2 className="mt-4 text-lg font-semibold">{p.name}</h2><p className="mt-1 text-xs text-muted-foreground">{p.trade} · {p.gc}</p><dl className="my-6 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-muted-foreground">Checklist completed</dt><dd>{p.checklist.filter(c => c.done).length}/{p.checklist.length}</dd></div><div className="flex justify-between"><dt className="text-muted-foreground">Open review items</dt><dd>{reviewCount(p)}</dd></div><div className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">Status</dt><dd className="text-xs">{p.status}</dd></div></dl><div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => saveReport(p)}><Download /> Download sample</Button><Button variant="outline" size="sm" onClick={() => openProject(p.id)}>Review <ArrowUpRight /></Button></div></article>)}</div>}
          </>}
          <footer className="mt-12 flex flex-wrap justify-between gap-2 border-t border-border pt-4 font-mono text-[10px] text-muted-foreground"><span>ACTELUS AEC / DEMO WORKSPACE</span><span>FICTIONAL DATA · HUMAN-CONTROLLED REVIEW</span></footer>
        </main>
      </div>
      <DocumentDialog p={selected} doc={doc} onClose={() => setDocId(null)} onAsk={() => openProject(selected.id,"questions")} />
      <AddendumDialog p={selected} a={addendum} onClose={() => setAddId(null)} openDoc={id => { setAddId(null); setDocId(id); }} />
    </div>
  );
}

function SectionHeading({title,count}: {title: string; count?: number}) {
  return <div className="mb-4 flex items-center justify-between"><h2 className="text-base font-semibold">{title}</h2>{count !== undefined && <span className="font-mono text-xs text-muted-foreground">{count.toString().padStart(2,"0")}</span>}</div>;
}

function ProjectTable({rows,selectedId,open}: {rows: Project[]; selectedId: string; open: (id: string) => void}) {
  return <div className="overflow-x-auto border-y border-border"><table className="w-full min-w-[580px] text-left text-sm"><thead className="bg-secondary font-mono text-[10px] uppercase text-muted-foreground"><tr><th className="px-4 py-3 font-normal">Project / contractor</th><th className="px-3 py-3 font-normal">Trade</th><th className="px-3 py-3 font-normal">Status</th><th className="px-4 py-3 text-right font-normal">Review</th></tr></thead><tbody className="divide-y divide-border">{rows.map(p => <tr key={p.id} className={cn("bg-card", p.id === selectedId && "bg-info/5")}><td className="px-4 py-4"><Button variant="link" className="h-auto justify-start whitespace-normal p-0 text-left font-semibold" onClick={() => open(p.id)}>{p.name}{p.flagged && <Flag className="text-info" />}</Button><div className="mt-1 text-xs text-muted-foreground">{p.gc} · {p.due}</div></td><td className="px-3 py-4 text-xs text-muted-foreground">{p.trade}</td><td className="px-3 py-4"><span className={cn("inline-flex items-center gap-2 text-xs", p.status === "Ready for Team Review" ? "text-success" : "text-info")}><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{p.status}</span></td><td className="px-4 py-4 text-right font-mono">{reviewCount(p)}</td></tr>)}</tbody></table></div>;
}