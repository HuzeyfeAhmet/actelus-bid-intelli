import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Inbox, FileSearch, ListChecks, Scale, CalendarClock, ClipboardCheck, AlertCircle, StickyNote, LayoutDashboard, Target, Menu, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BidDashboard } from "@/components/site/BidDashboard";
import { WalkthroughDialog } from "@/components/site/WalkthroughDialog";
import { Button } from "@/components/ui/button";

const TITLE = "Actelus AEC Bid Intelligence — Bid Readiness for Specialty Contractors";
const DESC =
  "Organize bid invitations, track addenda and deadlines, flag missing scope details, and prepare clearer bid/no-bid decisions for specialty contractors.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const NAV = [
  { href: "#overview", label: "Overview" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#preview", label: "Product Preview" },
  { href: "#pilot", label: "Pilot" },
];

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navy";
const btnGhostDark =
  "inline-flex items-center justify-center gap-2 rounded border border-navy-line px-5 py-3 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`font-mono text-[11px] font-medium tracking-[0.18em] ${dark ? "text-accent" : "text-info"}`}>{children}</div>
  );
}

function Index() {
  const [dialog, setDialog] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const open = (intent: string) => () => setDialog(intent);

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-navy-line bg-navy/95 text-navy-foreground backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <a href="#top" className="flex items-baseline gap-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <span className="font-display text-lg font-extrabold tracking-[0.12em]">ACTELUS</span>
            <span className="hidden font-mono text-[10px] tracking-[0.18em] text-navy-muted sm:inline">AEC BID INTELLIGENCE</span>
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded text-sm text-navy-muted hover:text-navy-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                {n.label}
              </a>
            ))}
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/85"><Link to="/workspace">Open Workspace <ArrowRight /></Link></Button>
            <button onClick={open("Request a Walkthrough")} className="rounded bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/85 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
              Request a Walkthrough
            </button>
          </nav>
          <button className="rounded p-2 md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} onClick={() => setMenu(!menu)}>
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menu && (
          <nav aria-label="Mobile" className="border-t border-navy-line px-5 pb-4 md:hidden">
            <Button asChild className="mt-3 w-full bg-accent text-accent-foreground hover:bg-accent/85"><Link to="/workspace">Open Workspace <ArrowRight /></Link></Button>
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="block py-3 text-sm text-navy-foreground">
                {n.label}
              </a>
            ))}
            <button onClick={() => { setMenu(false); setDialog("Request a Walkthrough"); }} className={`${btnPrimary} mt-2 w-full`}>
              Request a Walkthrough
            </button>
          </nav>
        )}
      </header>

      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden bg-navy text-navy-foreground">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--navy-foreground)_1px,transparent_1px),linear-gradient(90deg,var(--navy-foreground)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
            <div>
              <Eyebrow dark>BID PREPARATION FOR SPECIALTY CONTRACTORS</Eyebrow>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
                Know what you're bidding before you commit.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-muted">
                Bring bid invitations, project documents, deadlines, and scope questions into one clear workflow. Spot missing information, track addenda, and prepare your team for more informed bid decisions.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className={`${btnPrimary} h-auto`}><Link to="/workspace">Open Bid Workspace <ArrowRight className="h-4 w-4" /></Link></Button>
                <button onClick={open("Discuss a Pilot")} className={btnGhostDark}>Discuss a Pilot</button>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-muted">
                {["Clearer bid readiness", "Organized scope review", "Human-controlled decisions"].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" aria-hidden />{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-3 font-mono text-[10px] tracking-[0.18em] text-navy-muted">INTERACTIVE PRODUCT PREVIEW · SAMPLE DATA</div>
              <BidDashboard compact />
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section id="overview" className="mx-auto max-w-7xl px-5 py-24">
          <Eyebrow>OVERVIEW</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">Every bid package has details worth checking.</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {[
              { icon: Inbox, t: "Scattered Bid Invitations", d: "Project information, documents, emails, and deadlines can end up spread across different places." },
              { icon: FileSearch, t: "Scope Gaps and Addenda", d: "Missing details, exclusions, unclear requirements, and revised documents can complicate bid preparation." },
              { icon: Scale, t: "Unclear Bid Readiness", d: "Your team needs a structured way to identify open questions and decide which opportunities deserve further attention." },
            ].map(({ icon: I, t, d }, i) => (
              <div key={t} className="bg-card p-8">
                <div className="flex items-center justify-between">
                  <I className="h-6 w-6 text-primary" aria-hidden />
                  <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">{t}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PREVIEW */}
        <section id="preview" className="bg-navy py-24 text-navy-foreground">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <Eyebrow dark>PRODUCT PREVIEW</Eyebrow>
                <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">One view of every opportunity and what still needs review.</h2>
              </div>
              <p className="max-w-md text-sm text-navy-muted">
                Search, filter, open a project and mark it for team review. This is an illustrative prototype with fictional projects; it is not connected to live data or external platforms.
              </p>
            </div>
            <div className="mt-10">
              <BidDashboard />
            </div>
            <Button asChild className="mt-6 bg-accent text-accent-foreground hover:bg-accent/85"><Link to="/workspace">Open the Full Workspace <ArrowRight /></Link></Button>
          </div>
        </section>

        {/* HOW */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24">
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">From bid invitation to a clearer decision.</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
            {[
              ["Capture the Opportunity", "Organize the project details, bid invitation, due date, and available documents."],
              ["Review the Package", "Structure the information and flag missing details, scope questions, and items requiring attention."],
              ["Track Readiness", "Keep addenda, clarifications, exclusions, and unresolved review items visible."],
              ["Make the Bid Decision", "Give your estimating team a clearer overview for its pursue/no-bid discussion."],
            ].map(([t, d], i) => (
              <li key={t} className="relative border-l-2 border-primary pl-5 md:border-l-0 md:border-t-2 md:pl-0 md:pt-6">
                <span className="font-mono text-xs text-info">STEP {i + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CAPABILITIES */}
        <section className="border-y border-border bg-secondary py-24">
          <div className="mx-auto max-w-7xl px-5">
            <Eyebrow>KEY CAPABILITIES</Eyebrow>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold sm:text-4xl">Practical tools for the bid review your team already does.</h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { i: Target, t: "Bid Opportunity Tracking", d: "Keep every invitation, general contractor, trade and due date in one list so nothing sits forgotten in an inbox." },
                { i: CalendarClock, t: "Deadline and Addenda Monitoring", d: "See which bids are due soon and which addenda have been received but not yet reviewed." },
                { i: ListChecks, t: "Scope Review Checklist", d: "Work through a consistent checklist for each package so reviews follow the same steps every time." },
                { i: AlertCircle, t: "Missing Information Flags", d: "Note documents or details that look incomplete or unclear so they can be followed up before pricing." },
                { i: StickyNote, t: "Clarification and Exclusion Notes", d: "Record questions for the GC, assumptions and exclusions alongside the project they belong to." },
                { i: LayoutDashboard, t: "Bid-Readiness Overview", d: "Give owners and estimators a quick read on which opportunities are ready to discuss and which need more work." },
              ].map(({ i: I, t, d }) => (
                <div key={t} className="rounded-lg border border-border bg-card p-6">
                  <I className="h-5 w-5 text-info" aria-hidden />
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PILOT */}
        <section id="pilot" className="mx-auto max-w-7xl px-5 py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>PILOT</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Start with your existing bid workflow.</h2>
              <p className="mt-5 max-w-lg leading-relaxed text-muted-foreground">
                Explore a focused pilot using a representative bid package and your team's review process. Establish the required inputs, desired outputs, and scope before any implementation work begins.
              </p>
              <button onClick={open("Discuss a Pilot")} className="mt-8 inline-flex items-center gap-2 rounded bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Discuss a Pilot <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <ol className="divide-y divide-border rounded-lg border border-border bg-card">
              {[
                [ClipboardCheck, "Review one agreed sample opportunity."],
                [FileSearch, "Map the current review workflow."],
                [Target, "Identify the most useful next step for a pilot."],
              ].map(([I, t], i) => {
                const Icon = I as typeof Target;
                return (
                  <li key={t as string} className="flex items-center gap-5 p-6">
                    <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                    <Icon className="h-5 w-5 text-info" aria-hidden />
                    <span className="font-medium">{t as string}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border bg-secondary py-24">
          <div className="mx-auto max-w-3xl px-5">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Questions contractors ask.</h2>
            <Accordion type="single" collapsible className="mt-10 rounded-lg border border-border bg-card px-6">
              {[
                ["Does this replace our estimating software?", "No. The concept is designed to support bid organization and readiness review alongside your existing estimating process."],
                ["Does it automatically prepare a complete bid?", "No. It is intended to organize information and highlight items that require review. Estimating, scope interpretation, and final bid decisions remain under the contractor's control."],
                ["Can it work with our current documents?", "The proposed workflow is designed around existing bid invitations and project documents. The supported file formats and processing capabilities must be confirmed for the pilot."],
                ["Does it connect to our existing construction platforms?", "Integrations depend on the implementation scope. No external platform connection should be represented as available until it has been built and tested."],
                ["How would a pilot work?", "We would agree on a representative workflow, the available documents, the desired output, and the boundaries of the pilot before proceeding."],
              ].map(([q, a], i) => (
                <AccordionItem key={q} value={`q${i}`} className="last:border-b-0">
                  <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-navy text-navy-foreground">
          <div className="mx-auto max-w-7xl px-5 py-24 text-center">
            <h2 className="mx-auto max-w-3xl text-4xl font-extrabold sm:text-5xl">Make your next bid easier to review.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-muted">
              Let's examine your current bid workflow and identify where clearer information, review steps, and deadline visibility would help your team.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button onClick={open("Request a Walkthrough")} className={btnPrimary}>Request a Walkthrough</button>
              <a href="#preview" className="inline-flex items-center gap-2 rounded px-3 py-3 text-sm font-semibold text-navy-foreground underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                Explore the Product Preview <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-navy-line bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-display text-lg font-extrabold tracking-[0.12em]">ACTELUS</div>
            <div className="mt-1 font-mono text-[11px] tracking-[0.18em] text-navy-muted">AEC Bid Intelligence</div>
            <p className="mt-4 max-w-sm text-sm text-navy-muted">Bid readiness and information review for specialty contractors.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-6">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="rounded text-sm text-navy-muted hover:text-navy-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">{n.label}</a>
            ))}
          </nav>
        </div>
        <div className="border-t border-navy-line">
          <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-navy-muted">
            Concept product. All dashboard projects and figures shown are fictional and illustrative.
          </p>
        </div>
      </footer>

      <WalkthroughDialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)} intent={dialog ?? "Request a Walkthrough"} />
    </div>
  );
}
