import { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TRADES = ["Electrical", "Mechanical / HVAC", "Plumbing", "Fire Protection", "Roofing", "Other specialty trade"];

type Fields = { name: string; company: string; email: string; trade: string; workflow: string; message: string };
const empty: Fields = { name: "", company: "", email: "", trade: "", workflow: "", message: "" };

export function validate(f: Fields) {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (!f.name.trim()) e.name = "Enter your full name.";
  if (!f.company.trim()) e.company = "Enter your company name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid work email.";
  if (!f.trade) e.trade = "Select your trade.";
  if (f.workflow.trim().length < 10) e.workflow = "Briefly describe your current bid workflow (10+ characters).";
  return e;
}

export function WalkthroughDialog({ open, onOpenChange, intent }: { open: boolean; onOpenChange: (o: boolean) => void; intent: string }) {
  const [f, setF] = useState<Fields>(empty);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [prepared, setPrepared] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setPrepared(
      [
        `Subject: ${intent} — Actelus AEC Bid Intelligence`,
        "",
        `Name: ${f.name}`,
        `Company: ${f.company}`,
        `Work email: ${f.email}`,
        `Trade: ${f.trade}`,
        "",
        "Current bid workflow:",
        f.workflow,
        ...(f.message.trim() ? ["", "Message:", f.message] : []),
      ].join("\n"),
    );
  };

  const copy = async () => {
    if (!prepared) return;
    try {
      await navigator.clipboard.writeText(prepared);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const reset = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(() => { setPrepared(null); setCopied(false); }, 200);
  };

  const field = "mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const Err = ({ k }: { k: keyof Fields }) =>
    errors[k] ? <p id={`${k}-err`} className="mt-1 text-xs text-destructive">{errors[k]}</p> : null;

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{intent}</DialogTitle>
          <DialogDescription>Tell us about your team and how you review bids today.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 rounded border border-border bg-muted p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Prototype form: no submission service is connected yet, so nothing is sent. Completing the form prepares a request message you can copy and share directly.
          </p>
        </div>

        {prepared ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Your request message is ready to copy. It has not been sent.</p>
            <label className="block text-xs text-muted-foreground">
              Request message
              <textarea readOnly value={prepared} rows={10} className={`${field} font-mono text-xs text-foreground`} />
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy message"}
              </button>
              <button type="button" onClick={() => setPrepared(null)} className="rounded border border-input px-4 py-2 text-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Edit details
              </button>
            </div>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium">Full Name
                <input className={field} value={f.name} onChange={set("name")} autoComplete="name" aria-invalid={!!errors.name} aria-describedby="name-err" />
                <Err k="name" />
              </label>
              <label className="block text-sm font-medium">Company
                <input className={field} value={f.company} onChange={set("company")} autoComplete="organization" aria-invalid={!!errors.company} aria-describedby="company-err" />
                <Err k="company" />
              </label>
            </div>
            <label className="block text-sm font-medium">Work Email
              <input type="email" className={field} value={f.email} onChange={set("email")} autoComplete="email" aria-invalid={!!errors.email} aria-describedby="email-err" />
              <Err k="email" />
            </label>
            <label className="block text-sm font-medium">Contractor Trade
              <select className={field} value={f.trade} onChange={set("trade")} aria-invalid={!!errors.trade} aria-describedby="trade-err">
                <option value="">Select a trade</option>
                {TRADES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <Err k="trade" />
            </label>
            <label className="block text-sm font-medium">Current Bid Workflow
              <textarea rows={3} className={field} value={f.workflow} onChange={set("workflow")} placeholder="e.g. ITBs arrive by email, we track due dates in a spreadsheet…" aria-invalid={!!errors.workflow} aria-describedby="workflow-err" />
              <Err k="workflow" />
            </label>
            <label className="block text-sm font-medium">Message <span className="font-normal text-muted-foreground">(optional)</span>
              <textarea rows={2} className={field} value={f.message} onChange={set("message")} />
            </label>
            <button type="submit" className="w-full rounded bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              Prepare request message
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
