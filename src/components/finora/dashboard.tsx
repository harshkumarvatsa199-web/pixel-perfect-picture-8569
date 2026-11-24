import { Link } from "@tanstack/react-router";
import { Upload, ArrowUpRight, FileSpreadsheet, CheckCircle2, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupRows, number } from "@/lib/finora";
import { useData } from "./data-context";
import { FiltersBar } from "./filters";
import { KPIs } from "./kpis";
import { AnalyticsChart } from "./charts";
import { InsightList } from "./insight-list";

export function Dashboard() {
  const { dataset, rows } = useData();
  const empty = !rows.length;
  const products = groupRows(rows, "Product_ID");
  return <div className="fade-in">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"><span className="h-px w-5 bg-primary" />Business overview</div><h1 className="page-title">Performance Dashboard</h1><p className="mt-2 text-xs text-muted-foreground">The big picture. Every detail. All in one place.</p></div><Button asChild><Link to="/upload"><Upload />{dataset ? "Replace dataset" : "Upload dataset"}</Link></Button></div>
    {!dataset ? <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-primary/15 bg-brand-soft px-5 py-4"><div className="flex items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-card text-primary"><FileSpreadsheet size={20} /></span><div><p className="text-xs font-semibold">Ready for your first dataset</p><p className="mt-1 text-[11px] text-muted-foreground">Your numbers. Real insights. No sample data.</p></div></div><Button variant="link" size="sm" asChild><Link to="/upload">Connect your data<ArrowRight /></Link></Button></div> : <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><CheckCircle2 size={14} className="text-success" /><span className="max-w-full truncate font-medium text-foreground">{dataset.name}</span><span>· {number(dataset.rows.length)} records · {dataset.sheet}</span><span className="ml-auto rounded bg-success-soft px-2 py-1 text-[9px] font-medium text-success">DATA CONNECTED</span></div>}
    <FiltersBar />
    {dataset && !rows.length && <div role="status" className="mb-5 rounded-md bg-warning-soft p-4 text-xs text-warning">No records match the current filters.</div>}
    <KPIs />
    <div className="mb-5 grid gap-5 xl:grid-cols-3"><AnalyticsChart title="Revenue & Profit" subtitle="Monthly performance · INR" data={groupRows(rows, "month")} type="area" comparison empty={empty} className="xl:col-span-2" /><AnalyticsChart title="Revenue by Region" subtitle="Regional contribution · INR" data={groupRows(rows, "Region")} type="horizontal" empty={empty} /></div>
    <div className="mb-7 grid gap-5 lg:grid-cols-2"><AnalyticsChart title="Revenue by Category" subtitle="Category performance · INR" data={groupRows(rows, "Category")} type="horizontal" empty={empty} /><AnalyticsChart title="Top Products by Revenue" subtitle="Top 10 products · Net revenue in INR" data={products.slice(0, 10)} type="horizontal" empty={empty} /></div>
    <section className="mb-7"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-sm font-bold"><Lightbulb size={16} className="text-primary" />At a glance</h2><Button variant="link" size="sm" asChild><Link to="/insights">All insights<ArrowUpRight /></Link></Button></div><div className="overflow-hidden rounded-lg border border-border bg-card"><InsightList compact /></div></section>
    <section className="mb-7"><div className="mb-4"><h2 className="text-sm font-bold">Behind the numbers</h2><p className="mt-1 text-[11px] text-muted-foreground">The details that make up your financial performance.</p></div><KPIs secondary /></section>
    <div className="grid gap-5 lg:grid-cols-2"><AnalyticsChart title="Top Products by Profit" subtitle="Top 10 products · Net profit in INR" data={[...products].sort((a, b) => b.profit - a.profit).slice(0, 10)} type="horizontal" metric="profit" empty={empty} /><AnalyticsChart title="Sales Channel Comparison" subtitle="Revenue and profit by channel · INR" data={groupRows(rows, "Sales_Channel")} comparison empty={empty} /><AnalyticsChart title="Payment Method Distribution" subtitle="Share of net revenue by payment method" data={groupRows(rows, "Payment_Method")} type="pie" empty={empty} /><AnalyticsChart title="City-wise Revenue" subtitle="Net revenue by city · INR" data={groupRows(rows, "City")} type="horizontal" empty={empty} /></div>
  </div>;
}