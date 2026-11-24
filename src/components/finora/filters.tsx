import { RotateCcw, SlidersHorizontal, CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EMPTY_FILTERS, FILTER_FIELDS, number } from "@/lib/finora";
import { useData } from "./data-context";

export function FiltersBar() {
  const { dataset, filters, setFilters, rows } = useData();
  const [expanded, setExpanded] = useState(false);
  const active = Object.values(filters).some(Boolean);
  return <section aria-label="Dataset filters" className="mb-6 border-y border-border py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-semibold"><SlidersHorizontal size={14} />Filters{active && <span className="size-1.5 rounded-full bg-primary" />}</div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 hidden text-[11px] text-muted-foreground sm:block">{dataset ? `${number(rows.length)} of ${number(dataset.rows.length)} records` : "All records"}</span>
        <Button variant={expanded ? "soft" : "outline"} size="sm" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><CalendarDays size={13} />{active ? "Date range & filters" : "All time & filters"}<ChevronDown size={12} /></Button>
        <Button variant="ghost" size="sm" disabled={!active} onClick={() => setFilters(EMPTY_FILTERS)} aria-label="Reset filters"><RotateCcw size={13} /><span className="hidden sm:inline">Reset</span></Button>
      </div>
    </div>
    <div className="filter-grid mt-3">{FILTER_FIELDS.map(field => <div key={field}><Select value={filters[field] || "__all"} onValueChange={value => setFilters({ ...filters, [field]: value === "__all" ? "" : value })} disabled={!dataset}><SelectTrigger aria-label={field.replaceAll("_", " ")} className="bg-card text-xs"><SelectValue placeholder={`All ${field.replaceAll("_", " ").toLowerCase()}s`} /></SelectTrigger><SelectContent><SelectItem value="__all">All {field === "City" ? "cities" : `${field.replaceAll("_", " ").toLowerCase()}s`}</SelectItem>{[...new Set(dataset?.rows.map(row => row[field]) ?? [])].sort().map(value => <SelectItem value={value} key={value}>{value}</SelectItem>)}</SelectContent></Select></div>)}</div>
    {expanded && <div className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-0 text-[11px] text-muted-foreground">From<Input aria-label="Start date" type="date" className="mt-1 bg-card" value={filters.start} max={filters.end || undefined} disabled={!dataset} onChange={e => setFilters({ ...filters, start: e.target.value })} /></label><span className="mb-2 text-xs text-muted-foreground">to</span><label className="min-w-0 text-[11px] text-muted-foreground">Until<Input aria-label="End date" type="date" className="mt-1 bg-card" value={filters.end} min={filters.start || undefined} disabled={!dataset} onChange={e => setFilters({ ...filters, end: e.target.value })} /></label>{filters.start && filters.end && filters.start > filters.end && <span role="alert" className="text-xs text-destructive">End date must be on or after start date.</span>}</div>}
  </section>;
}