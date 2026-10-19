import { useEffect, useMemo, useState } from "react";
import {
  Search, FileText, AlertTriangle, CheckCircle2, Circle, Clock, Flag, Download, RotateCcw, Plus,
  Undo2, Trash2, Link2, Eye, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  STATUSES, computeMetrics, docToText, filterProjects, reportToText, reviewCount,
  type Addendum, type Doc, type Project, type Status,
} from "./demo-data";
import { dispatch, hasSaveError, useProjects } from "./demo-store";

const statusStyle: Record<Status, string> = {
  "Addendum Review": "bg-warning/15 text-warning ring-warning/30",
  "Scope Clarification": "bg-info/15 text-info ring-info/30",
  "Ready for Team Review": "bg-success/15 text-success ring-success/30",
};

function act(a: Parameters<typeof dispatch>[0], msg?: string) {
  dispatch(a);
  if (hasSaveError()) toast.error("Change applied, but your browser blocked saving it. It will reset on reload.");
  else if (msg) toast.success(msg);
}

function downloadText(filename: string, text: string) {
  try {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Downloaded ${filename}`);
  } catch {
    toast.error("Download failed in this browser.");
  }
}

function DueBadge({ days }: { days: number }) {
  const tone = days <= 5 ? "text-destructive" : days <= 12 ? "text-warning" : "text-navy-muted";
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[11px]", tone)}>
      <Clock className="h-3 w-3" aria-hidden /> {days}d left
    </span>
  );
}

const ctl = "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";
const smallBtn = cn("inline-flex items-center gap-1.5 rounded border border-navy-line px-2.5 py-1.5 text-xs font-medium text-navy-foreground hover:bg-navy", ctl);

export function BidDashboard({ compact = false }: { compact?: boolean }) {
  const projects = useProjects();
  const m = computeMetrics(projects);
  const summary = [
    { label: "Active Opportunities", value: m.active },
    { label: "Upcoming Deadlines", value: m.upcoming, hint: "next 14 days" },
    { label: "Items Requiring Review", value: m.review },
    { label: "Bid Packages Under Review", value: m.underReview },
  ];

  if (compact) {
    return (
      <div className="overflow-hidden rounded-lg border border-navy-line bg-navy-2 text-navy-foreground shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy-line px-4 py-2.5">
          <span className="font-mono text-[11px] tracking-wider text-navy-muted">BID PIPELINE</span>
          <span className="font-mono text-[10px] text-navy-muted">SAMPLE DATA</span>
        </div>
        <div className="grid grid-cols-2 gap-px bg-navy-line">
          {summary.map((s) => (
            <div key={s.label} className="bg-navy-2 px-4 py-3">
              <div className="font-display text-2xl font-semibold">{s.value}</div>
              <div className="text-[11px] text-navy-muted">{s.label}</div>
            </div>
          ))}
        </div>
        <ul className="divide-y divide-navy-line">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                  {p.name}
                  {p.flagged && <Flag className="h-3 w-3 shrink-0 text-accent" aria-label="Marked for review" />}
                </div>
                <div className="text-[11px] text-navy-muted">{p.trade} · Due {p.due}</div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium ring-1", statusStyle[p.status])}>{p.status}</span>
                <DueBadge days={p.daysLeft} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return <FullDashboard projects={projects} summary={summary} flagged={m.flagged} />;
}

function FullDashboard({ projects, summary, flagged }: { projects: Project[]; summary: { label: string; value: number; hint?: string }[]; flagged: number }) {
  const [filter, setFilter] = useState<"All" | Status>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("p1");
  const [tab, setTab] = useState("checklist");
  const [docId, setDocId] = useState<string | null>(null);
  const [addId, setAddId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const rows = useMemo(() => filterProjects(projects, query, filter), [projects, query, filter]);
  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];
  if (!selected) return null;
  const doc = docId ? selected.documents.find((d) => d.id === docId) ?? null : null;
  const addendum = addId ? selected.addenda.find((a) => a.id === addId) ?? null : null;

  const select = (id: string) => { setSelectedId(id); setDocId(null); setAddId(null); };

  return (
    <div className="overflow-hidden rounded-lg border border-navy-line bg-navy-2 text-navy-foreground shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy-line px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-bold tracking-wider">ACTELUS</span>
          <span className="font-mono text-[11px] text-navy-muted">/ Bid Pipeline</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded border border-navy-line px-2 py-0.5 font-mono text-[10px] tracking-wider text-navy-muted">
            ILLUSTRATIVE PROTOTYPE · FICTIONAL DATA · NOT LIVE
          </span>
          <button type="button" onClick={() => setConfirmReset(true)} className={smallBtn}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset Demo Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-navy-line md:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="bg-navy-2 px-4 py-4">
            <div className="font-display text-3xl font-semibold" aria-live="polite">{s.value}</div>
            <div className="mt-1 text-xs text-navy-muted">
              {s.label}
              {s.hint ? <span className="block font-mono text-[10px]">{s.hint}</span> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0 border-b border-navy-line lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-3 border-b border-navy-line p-4 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search projects</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-muted" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search project, GC or trade"
                className={cn("w-full rounded border border-navy-line bg-navy py-2 pl-8 pr-3 text-sm text-navy-foreground placeholder:text-navy-muted", ctl)}
              />
            </label>
            <label className="sm:w-56">
              <span className="sr-only">Filter by status</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className={cn("w-full rounded border border-navy-line bg-navy px-2 py-2 text-sm text-navy-foreground", ctl)}>
                <option value="All">All statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>

          {/* mobile cards */}
          <ul className="divide-y divide-navy-line md:hidden">
            {rows.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => select(p.id)} aria-pressed={p.id === selected.id} className={cn("w-full px-4 py-3 text-left", p.id === selected.id && "bg-navy", ctl)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-medium">{p.name}{p.flagged && <Flag className="h-3.5 w-3.5 text-accent" aria-label="Marked for review" />}</span>
                    <span className="font-mono text-xs">{reviewCount(p)} open</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-navy-muted">
                    {p.trade} · {p.due} <DueBadge days={p.daysLeft} />
                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium ring-1", statusStyle[p.status])}>{p.status}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-navy-muted">
                  <th className="px-4 py-2 font-medium">Project</th>
                  <th className="px-2 py-2 font-medium">Trade</th>
                  <th className="px-2 py-2 font-medium">Bid Due</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 text-right font-medium">Open Items</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const active = p.id === selected.id;
                  return (
                    <tr key={p.id} className={cn("cursor-pointer border-t border-navy-line transition-colors hover:bg-navy", active && "bg-navy")} onClick={() => select(p.id)}>
                      <td className="px-4 py-3">
                        <button type="button" onClick={(e) => { e.stopPropagation(); select(p.id); }} aria-pressed={active} className={cn("flex items-center gap-2 rounded text-left font-medium", ctl)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent" : "bg-navy-line")} />
                          {p.name}
                          {p.flagged && <Flag className="h-3.5 w-3.5 text-accent" aria-label="Marked for review" />}
                        </button>
                        <div className="pl-3.5 text-[11px] text-navy-muted">{p.gc}</div>
                      </td>
                      <td className="px-2 py-3 text-navy-muted">{p.trade}</td>
                      <td className="px-2 py-3"><div className="font-mono text-xs">{p.due}</div><DueBadge days={p.daysLeft} /></td>
                      <td className="px-2 py-3"><span className={cn("whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium ring-1", statusStyle[p.status])}>{p.status}</span></td>
                      <td className="px-4 py-3 text-right font-mono">{reviewCount(p)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-navy-muted">
              No sample projects match this search.{" "}
              <button type="button" className={cn("underline", ctl)} onClick={() => { setQuery(""); setFilter("All"); }}>Clear filters</button>
            </div>
          )}
          <div className="border-t border-navy-line px-4 py-2 font-mono text-[10px] text-navy-muted">
            {flagged} marked for team review · changes are saved in this browser only
          </div>
        </div>

        <ProjectDetail
          p={selected}
          tab={tab}
          setTab={setTab}
          openDoc={setDocId}
          openAddendum={setAddId}
        />
      </div>

      <DocumentDialog p={selected} doc={doc} onClose={() => setDocId(null)} onAsk={() => { setDocId(null); setTab("questions"); }} />
      <AddendumDialog p={selected} a={addendum} onClose={() => setAddId(null)} openDoc={(id) => { setAddId(null); setDocId(id); }} />

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset demo data?</AlertDialogTitle>
            <AlertDialogDescription>All checklist changes, flags, statuses and questions return to the original sample state.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { act({ type: "reset" }, "Demo data reset"); setQuery(""); setFilter("All"); select("p1"); }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ProjectDetail({ p, tab, setTab, openDoc, openAddendum }: { p: Project; tab: string; setTab: (t: string) => void; openDoc: (id: string) => void; openAddendum: (id: string) => void }) {
  const done = p.checklist.filter((c) => c.done).length;
  const openQ = p.questions.filter((q) => !q.resolved).length;
  const pendingA = p.addenda.filter((a) => !a.reviewed).length;
  const trig = "rounded px-2 py-1 text-xs text-navy-muted data-[state=active]:bg-navy data-[state=active]:text-navy-foreground data-[state=active]:shadow-none";

  return (
    <div className="min-w-0 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-wider text-navy-muted">{p.trade} · {p.gc}</div>
          <h3 className="mt-1 text-lg font-semibold">{p.name}</h3>
          <div className="mt-1 flex items-center gap-3 text-xs"><span className="font-mono">Due {p.due}</span><DueBadge days={p.daysLeft} /></div>
        </div>
        <button
          type="button"
          onClick={() => act({ type: "toggleFlag", projectId: p.id }, p.flagged ? "Review flag removed" : "Marked for team review")}
          aria-pressed={p.flagged}
          className={cn("inline-flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors", ctl,
            p.flagged ? "bg-accent text-accent-foreground hover:bg-accent/85" : "border border-navy-line text-navy-foreground hover:bg-navy")}
        >
          <Flag className="h-3.5 w-3.5" aria-hidden />
          {p.flagged ? "Marked · Remove" : "Mark for Review"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-xs text-navy-muted">
          Status
          <select
            value={p.status}
            onChange={(e) => act({ type: "setStatus", projectId: p.id, status: e.target.value as Status }, "Status updated")}
            className={cn("rounded border border-navy-line bg-navy px-2 py-1 text-xs text-navy-foreground", ctl)}
          >
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <button type="button" className={smallBtn} onClick={() => downloadText(`${p.name.replace(/\s+/g, "_")}_Readiness_Summary_SAMPLE.txt`, reportToText(p))}>
          <Download className="h-3.5 w-3.5" aria-hidden /> Summary
        </button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-4">
        <TabsList className="h-auto flex-wrap justify-start gap-1 bg-navy-2 p-0">
          <TabsTrigger value="checklist" className={trig}>Checklist {done}/{p.checklist.length}</TabsTrigger>
          <TabsTrigger value="documents" className={trig}>Documents {p.documents.length}</TabsTrigger>
          <TabsTrigger value="questions" className={trig}>Questions {openQ}</TabsTrigger>
          <TabsTrigger value="addenda" className={trig}>Addenda {pendingA ? `${pendingA} pending` : "✓"}</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="mt-3">
          <div className="mb-2 h-1.5 overflow-hidden rounded bg-navy" aria-hidden>
            <div className="h-full bg-success transition-all" style={{ width: `${(done / p.checklist.length) * 100}%` }} />
          </div>
          <ul className="space-y-1">
            {p.checklist.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-navy">
                  <input type="checkbox" className="sr-only peer" checked={c.done} onChange={() => act({ type: "toggleCheck", projectId: p.id, itemId: c.id }, c.done ? "Checklist item reopened" : "Checklist item completed")} />
                  <span className="mt-0.5 rounded peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                    {c.done ? <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> : <Circle className="h-4 w-4 text-navy-muted" aria-hidden />}
                  </span>
                  <span className={c.done ? "text-navy-muted line-through" : ""}>{c.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="documents" className="mt-3">
          <ul className="space-y-1">
            {p.documents.map((d) => (
              <li key={d.id}>
                <button type="button" onClick={() => openDoc(d.id)} className={cn("flex w-full items-start gap-2 rounded px-1 py-1.5 text-left text-sm hover:bg-navy", ctl)}>
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-navy-muted" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-xs">{d.name}</span>
                    <span className="block text-[11px] text-navy-muted">{d.type} · {d.pages} pp{d.flag && <span className="text-warning"> · needs review</span>}</span>
                  </span>
                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-navy-muted" aria-label="Open preview" />
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="questions" className="mt-3">
          <QuestionPanel p={p} />
        </TabsContent>

        <TabsContent value="addenda" className="mt-3">
          <ul className="space-y-1">
            {p.addenda.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 rounded px-1 py-1 text-sm hover:bg-navy">
                <button type="button" onClick={() => openAddendum(a.id)} className={cn("min-w-0 flex-1 truncate rounded text-left underline-offset-2 hover:underline", ctl)}>{a.label}</button>
                <button
                  type="button"
                  onClick={() => act({ type: "toggleAddendum", projectId: p.id, addendumId: a.id }, a.reviewed ? "Addendum set to pending" : "Addendum marked reviewed")}
                  className={cn("rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ring-1", ctl, a.reviewed ? "text-success ring-success/30" : "text-warning ring-warning/30")}
                  aria-label={`${a.label}: ${a.reviewed ? "reviewed, click to mark pending" : "pending, click to mark reviewed"}`}
                >
                  {a.reviewed ? "Reviewed" : "Pending"}
                </button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QuestionPanel({ p }: { p: Project }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { setText(""); setError(""); }, [p.id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (t.length < 5) return setError("Enter a question of at least 5 characters.");
    if (p.questions.some((q) => q.text.toLowerCase() === t.toLowerCase())) return setError("This question is already logged.");
    act({ type: "addQuestion", projectId: p.id, text: t }, "Question added");
    setText("");
    setError("");
  };

  const open = p.questions.filter((q) => !q.resolved);
  const resolved = p.questions.filter((q) => q.resolved);

  return (
    <div>
      <form onSubmit={submit} noValidate className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">New clarification question</span>
          <input
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            placeholder="Add a question for the GC…"
            aria-invalid={!!error}
            aria-describedby="q-err"
            className={cn("w-full rounded border border-navy-line bg-navy px-2.5 py-1.5 text-sm text-navy-foreground placeholder:text-navy-muted", ctl)}
          />
        </label>
        <button type="submit" className={smallBtn}><Plus className="h-3.5 w-3.5" aria-hidden /> Add</button>
      </form>
      {error && <p id="q-err" className="mt-1 text-xs text-destructive">{error}</p>}

      {p.questions.length === 0 && <p className="mt-3 text-sm text-navy-muted">No questions logged for this project.</p>}
      {open.length > 0 && <QList title={`Open (${open.length})`} p={p} items={open} />}
      {resolved.length > 0 && <QList title={`Resolved (${resolved.length})`} p={p} items={resolved} />}
    </div>
  );
}

function QList({ title, p, items }: { title: string; p: Project; items: Project["questions"] }) {
  return (
    <div className="mt-3">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-navy-muted">{title}</div>
      <ul className="space-y-1">
        {items.map((q) => (
          <li key={q.id} className="flex items-start gap-2 rounded px-1 py-1 text-sm">
            {q.resolved ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />}
            <span className="min-w-0 flex-1">
              <span className={q.resolved ? "text-navy-muted line-through" : ""}>{q.text}</span>
              {q.source && <span className="block text-[11px] text-navy-muted">From {q.source}</span>}
            </span>
            <button type="button" onClick={() => act({ type: "toggleQuestion", projectId: p.id, questionId: q.id }, q.resolved ? "Question reopened" : "Question resolved")} className={cn("shrink-0 rounded px-1.5 py-0.5 text-[11px] text-navy-muted hover:bg-navy hover:text-navy-foreground", ctl)}>
              {q.resolved ? <span className="inline-flex items-center gap-1"><Undo2 className="h-3 w-3" aria-hidden />Reopen</span> : "Resolve"}
            </button>
            <button type="button" aria-label="Delete question" onClick={() => act({ type: "deleteQuestion", projectId: p.id, questionId: q.id }, "Question deleted")} className={cn("shrink-0 rounded p-0.5 text-navy-muted hover:text-destructive", ctl)}>
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DocumentDialog({ p, doc, onClose, onAsk }: { p: Project; doc: Doc | null; onClose: () => void; onAsk: () => void }) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, [doc?.id, p.id]);

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {doc && (
          <>
            <DialogHeader>
              <DialogTitle className="break-all font-mono text-base">{doc.name}</DialogTitle>
              <DialogDescription>{doc.type} · {doc.pages} pages · {p.name}</DialogDescription>
            </DialogHeader>
            <div className="rounded border border-warning/40 bg-warning/10 px-3 py-2 text-xs">
              Fictional sample document. The highlighted items were prepared by hand for this demo — no real document analysis is performed.
            </div>
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Opening preview…</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
                <article className="rounded border border-border bg-card p-4 text-sm leading-relaxed">
                  {doc.sections.map((s) => (
                    <section key={s.heading} className="mb-4 last:mb-0">
                      <h4 className="font-semibold">{s.heading}</h4>
                      {s.body.map((b) => <p key={b} className="mt-1 text-muted-foreground">{b}</p>)}
                    </section>
                  ))}
                </article>
                <aside>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Highlighted items (simulated)</div>
                  {doc.flag && <p className="mt-2 text-xs text-warning">⚑ {doc.flag}</p>}
                  <ul className="mt-2 space-y-2">
                    {doc.extracted.map((e, i) => {
                      const item = e.checklistId ? p.checklist.find((c) => c.id === e.checklistId) : undefined;
                      return (
                        <li key={i} className="rounded border border-border p-2 text-sm">
                          <div className="text-[11px] text-muted-foreground">{e.label}</div>
                          <div className="font-medium">{e.value}</div>
                          {item && (
                            <label className="mt-1.5 flex cursor-pointer items-center gap-2 text-xs">
                              <input type="checkbox" checked={item.done} onChange={() => act({ type: "toggleCheck", projectId: p.id, itemId: item.id }, item.done ? "Checklist item reopened" : "Checklist item completed")} className="accent-primary" />
                              <Link2 className="h-3 w-3" aria-hidden /> {item.label}
                            </label>
                          )}
                          {e.label === "Ambiguity" && (
                            <button type="button" className="mt-1.5 text-xs text-primary underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => {
                              const text = `Clarify: ${e.value}`;
                              if (p.questions.some((q) => q.text === text)) toast.info("This question is already logged.");
                              else act({ type: "addQuestion", projectId: p.id, text, source: doc.name }, "Added to clarification questions");
                            }}>+ Add as clarification question</button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => downloadText(doc.name.replace(/\.pdf$/, "_SAMPLE.txt"), docToText(p, doc))} className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <Download className="h-3.5 w-3.5" aria-hidden /> Download sample
                    </button>
                    <button type="button" onClick={onAsk} className="rounded border border-input px-3 py-1.5 text-xs hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">View questions</button>
                  </div>
                </aside>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddendumDialog({ p, a, onClose, openDoc }: { p: Project; a: Addendum | null; onClose: () => void; openDoc: (id: string) => void }) {
  return (
    <Dialog open={!!a} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {a && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display">{a.label}</DialogTitle>
              <DialogDescription>Issued {a.issued} · {p.name} · sample data</DialogDescription>
            </DialogHeader>
            <p className="text-sm">{a.summary}</p>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Changes</div>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{a.changes.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Affects these requirements</div>
              <ul className="mt-1 space-y-1">
                {a.affects.map((id) => {
                  const c = p.checklist.find((x) => x.id === id);
                  if (!c) return null;
                  return (
                    <li key={id}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input type="checkbox" className="accent-primary" checked={c.done} onChange={() => act({ type: "toggleCheck", projectId: p.id, itemId: c.id }, c.done ? "Checklist item reopened" : "Checklist item completed")} />
                        {c.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => act({ type: "toggleAddendum", projectId: p.id, addendumId: a.id }, a.reviewed ? "Addendum set to pending" : "Addendum marked reviewed")} className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {a.reviewed ? "Mark as pending" : "Mark as reviewed"}
              </button>
              {a.docId && (
                <Button type="button" variant="outline" size="sm" onClick={() => { if (a.docId) openDoc(a.docId); }}>Open addendum document</Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
