import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, Upload, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData } from "@/components/finora/data-context";
import { FiltersBar } from "@/components/finora/filters";
import { InsightList } from "@/components/finora/insight-list";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [
    { title: "Business Insights | FINORA" },
    { name: "description", content: "Discover top regions, profitable categories, leading products, and channel performance from your own sales dataset." },
    { property: "og:title", content: "Business Insights | FINORA" },
    { property: "og:description", content: "Actionable business insights grounded in your data, never invented." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: InsightsPage,
});
function InsightsPage() {
  const { dataset, rows } = useData();
  return <div className="fade-in"><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">From numbers to perspective</div><h1 className="page-title">Business Insights</h1><p className="mt-2 text-xs text-muted-foreground">What’s leading. What’s lagging. Where to look next.</p></div><Button asChild><Link to="/upload"><Upload />{dataset ? "Replace dataset" : "Upload dataset"}</Link></Button></div><FiltersBar />{!rows.length && <div className="mb-6 flex items-center gap-3 rounded-md border border-primary/15 bg-brand-soft p-5"><Lightbulb size={23} className="shrink-0 text-primary" /><div><p className="text-xs font-semibold">{dataset ? "No insights for the selected filters" : "Your next insight is in your data"}</p><p className="mt-1 text-[11px] text-muted-foreground">{dataset ? "No matching records." : "No dataset connected. No conclusions invented."}</p></div></div>}<InsightList /><div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><ShieldCheck size={14} className="text-success" /><span>Calculated from {rows.length ? "the filtered dataset" : "your dataset"} · Product performance is ranked by net revenue.</span></div></div>;
}