import { MapPin, Layers3, Trophy, TrendingDown, CalendarDays, Store, ArrowUpRight } from "lucide-react";
import { getInsights, money, monthLabel } from "@/lib/finora";
import { useData } from "./data-context";

export function InsightList({ compact = false }: { compact?: boolean }) {
  const { rows } = useData();
  const insights = getInsights(rows);
  const items = [
    { label: "Highest revenue region", name: insights.region?.name, detail: insights.region ? `${money(insights.region.revenue)} in net revenue` : "", icon: MapPin, positive: true },
    { label: "Most profitable category", name: insights.category?.name, detail: insights.category ? `${money(insights.category.profit)} in net profit` : "", icon: Layers3, positive: true },
    { label: "Best-performing product", name: insights.bestProduct?.name, detail: insights.bestProduct ? `${money(insights.bestProduct.revenue)} in net revenue` : "", icon: Trophy, positive: true },
    { label: "Lowest-performing product", name: insights.lowestProduct?.name, detail: insights.lowestProduct ? `${money(insights.lowestProduct.revenue)} in net revenue` : "", icon: TrendingDown, positive: false },
    { label: "Best month by revenue", name: insights.month ? monthLabel(insights.month.name) : undefined, detail: insights.month ? `${money(insights.month.revenue)} in net revenue` : "", icon: CalendarDays, positive: true },
  ];
  return <div className={compact ? "grid gap-0 divide-y divide-border md:grid-cols-3 md:divide-y-0" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"}>{(compact ? items.slice(0, 3) : items).map(item => <article key={item.label} className={compact ? "px-5 py-4" : "panel p-5"}><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><item.icon size={14} />{item.label}</div><p className="mt-3 break-words font-display text-base font-bold">{item.name ?? "—"}</p><p className={`mt-2 flex items-center gap-1 text-[11px] ${item.name && item.positive ? "text-success" : "text-muted-foreground"}`}>{item.name && item.positive && <ArrowUpRight size={12} />}{item.detail || "Awaiting dataset"}</p></article>)}{!compact && <article className="panel p-5"><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Store size={14} />Sales channel comparison</div>{insights.channels.length ? <div className="mt-3 space-y-3">{insights.channels.map(channel => <div key={channel.name} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 text-xs"><span className="font-semibold">{channel.name}</span><span className="text-muted-foreground">{money(channel.revenue)} revenue · {money(channel.profit)} profit</span></div>)}</div> : <><p className="mt-3 font-display text-base font-bold">—</p><p className="mt-2 text-[11px] text-muted-foreground">Awaiting dataset</p></>}</article>}</div>;
}