import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Upload, Lightbulb, Sparkles, ShieldCheck, Building2, ChevronRight, Menu, X, FileSpreadsheet, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "./data-context";
import { number } from "@/lib/finora";

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Upload Dataset", icon: Upload },
  { to: "/insights", label: "Business Insights", icon: Lightbulb },
  { to: "/analyst", label: "AI Business Analyst", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { dataset } = useData();
  const pathname = useLocation({ select: state => state.pathname });
  const current = navigation.find(item => item.to === pathname);
  return <div>
    {open && <Button variant="ghost" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-30 h-full w-full rounded-none bg-foreground/40 md:hidden" />}
    <aside className={`app-sidebar ${open ? "open" : ""}`}>
      <div className="px-7 pt-8 pb-7">
        <Link to="/" className="flex items-center gap-3 text-sidebar-strong" onClick={() => setOpen(false)} aria-label="FINORA dashboard"><span className="brand-mark" aria-hidden="true"><span /><span /><span /></span><span className="wordmark">FINORA<span className="text-primary">.</span></span></Link>
        <p className="mt-2 text-[10px] text-sidebar-muted">Intelligence Beyond Numbers.</p>
      </div>
      <div className="mx-5 flex items-center gap-3 border-y border-sidebar-border/10 py-5"><div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-active text-sidebar-strong"><Building2 size={18} /></div><div><p className="text-xs font-semibold text-sidebar-strong">Nova Retail</p><p className="mt-1 text-[10px] text-sidebar-muted">Business workspace</p></div></div>
      <div className="px-7 pt-7 pb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">Workspace</div>
      <nav className="space-y-1 px-4" aria-label="Main navigation">{navigation.map(item => <Button key={item.to} variant="sidebar" asChild className="nav-item h-auto w-full"><Link to={item.to} activeOptions={{ exact: true }} onClick={() => setOpen(false)}><item.icon size={18} /><span>{item.label}</span>{item.to === "/analyst" && <span className="ml-auto rounded bg-sidebar-active px-1.5 py-0.5 text-[8px] text-sidebar-muted">SOON</span>}</Link></Button>)}</nav>
      <div className="mx-5 mt-9"><p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-sidebar-muted">Active dataset</p><div className="flex items-start gap-2.5 text-xs"><FileSpreadsheet size={16} className={dataset ? "text-chart-2" : "text-sidebar-muted"} /><div className="min-w-0"><p className="truncate text-sidebar-foreground" title={dataset?.name}>{dataset?.name ?? "No dataset connected"}</p><p className="mt-1 text-[10px] text-sidebar-muted">{dataset ? `${number(dataset.rows.length)} records` : "Awaiting your first upload"}</p></div></div></div>
      <div className="mt-auto px-6 py-6"><div className="flex items-center gap-2 text-[11px] text-sidebar-foreground"><ShieldCheck size={15} className="text-chart-2" />Private by design</div><p className="mt-2 text-[10px] leading-relaxed text-sidebar-muted">Your data stays in your browser.<br />Nothing is sent to a server.</p><div className="mt-6 border-t border-sidebar-border/10 pt-4 text-[9px] text-sidebar-muted">FINORA <span className="float-right">v1.0</span></div></div>
    </aside>
    <div className="app-main">
      <header className="flex h-[72px] items-center justify-between gap-3 border-b border-border bg-card px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-3"><Button size="icon" variant="ghost" className="md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>{open ? <X /> : <Menu />}</Button><span className="hidden text-xs text-muted-foreground sm:inline">Workspace</span><ChevronRight size={13} className="hidden text-muted-foreground sm:block" /><span className="truncate text-xs font-medium">{current?.label ?? "FINORA"}</span></div>
        <div className="flex shrink-0 items-center gap-4"><span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex"><Circle size={7} className="fill-success text-success" />Browser-only session</span><span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-primary" title="Nova Retail workspace">NR</span></div>
      </header>
      <main className="page-content px-5 py-7 md:px-8">{children}</main>
      <footer className="mx-5 flex flex-wrap justify-between gap-2 border-t border-border py-5 text-[10px] text-muted-foreground md:mx-8"><span>© FINORA · Intelligence Beyond Numbers.</span><span>All amounts in INR · Data is cleared on refresh</span></footer>
    </div>
  </div>;
}