import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/analyst")({
  head: () => ({ meta: [
    { title: "AI Business Analyst — Coming Soon | FINORA" },
    { name: "description", content: "FINORA’s AI Business Analyst is planned for a future chatbot integration and is not yet available." },
    { property: "og:title", content: "AI Business Analyst — Coming Soon | FINORA" },
    { property: "og:description", content: "Future conversational business analysis. Explore dataset-based insights today." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AnalystPage,
});
function AnalystPage() {
  return <div className="fade-in"><div className="mb-7"><div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">The next chapter</div><h1 className="page-title">AI Business Analyst</h1></div><section className="flex min-h-[480px] flex-col items-center justify-center border-y border-border px-5 py-16 text-center"><span className="mb-6 flex size-20 items-center justify-center rounded-full bg-brand-soft text-primary"><Sparkles size={34} /></span><span className="mb-4 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[10px] font-medium text-muted-foreground"><Clock3 size={12} />COMING SOON</span><h2 className="font-display text-2xl font-bold">Intelligence, in conversation.</h2><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Reserved for future chatbot integration.<br />The AI analyst is not available yet.</p><Button variant="outline" className="mt-7" asChild><Link to="/insights">Explore business insights<ArrowRight /></Link></Button></section></div>;
}