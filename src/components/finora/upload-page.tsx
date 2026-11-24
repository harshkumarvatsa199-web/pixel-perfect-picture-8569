import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Upload, FileSpreadsheet, Download, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, LoaderCircle, X, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { COLUMNS, readFile, validateGrid, number, type Worksheet } from "@/lib/finora";
import { useData } from "./data-context";

export function UploadPage() {
  const { dataset, setDataset } = useData();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [sheets, setSheets] = useState<Worksheet[]>([]);
  const [sheetIndex, setSheetIndex] = useState("0");
  const [headerRow, setHeaderRow] = useState(1);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const sheet = sheets[Number(sheetIndex)];
  const preview = useMemo(() => sheet ? validateGrid(sheet.grid, headerRow) : null, [sheet, headerRow]);
  async function chooseFile(file: File | undefined) {
    if (!file || loading) return;
    setLoading(true); setError(""); setSheets([]);
    try {
      const workbook = await readFile(file);
      if (!workbook.length) throw new Error("No readable worksheets were found.");
      setSheets(workbook); setSheetIndex("0"); setHeaderRow(1); setName(file.name);
    } catch (issue) { setError(issue instanceof Error ? issue.message : "This file could not be read. Please check the file and try again."); }
    finally { setLoading(false); if (input.current) input.current.value = ""; }
  }
  function template() {
    const url = URL.createObjectURL(new Blob([COLUMNS.join(",") + "\n"], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "FINORA_dataset_template.csv"; anchor.click(); URL.revokeObjectURL(url);
  }
  function confirm() {
    if (!preview?.rows.length || preview.errors.length || !sheet) return;
    setDataset({ name, sheet: sheet.name, rows: preview.rows });
    void navigate({ to: "/" });
  }
  return <div className="fade-in">
    <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">Your data, your intelligence</div><h1 className="page-title">Upload Dataset</h1><p className="mt-2 text-xs text-muted-foreground">A new perspective on your business starts with your numbers.</p></div><Button variant="outline" onClick={template}><Download />Download template</Button></div>
    {dataset && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3"><div className="flex min-w-0 items-center gap-3"><CheckCircle2 size={18} className="shrink-0 text-success" /><div className="min-w-0"><p className="truncate text-xs font-semibold">Active: {dataset.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{number(dataset.rows.length)} records · Your current data remains active until you confirm a replacement.</p></div></div><Button variant="ghost" size="sm" asChild><Link to="/">View dashboard<ArrowRight /></Link></Button></div>}
    <input ref={input} aria-label="Upload spreadsheet" type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={e => void chooseFile(e.target.files?.[0])} />
    <div className={`upload-zone flex min-h-[260px] flex-col items-center justify-center px-5 py-10 text-center ${dragging ? "dragging" : ""}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); void chooseFile(e.dataTransfer.files[0]); }}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-lg bg-brand-soft text-primary">{loading ? <LoaderCircle size={25} className="animate-spin" /> : <Upload size={25} />}</div>
      <h2 className="font-display text-lg font-bold">{loading ? "Reading your dataset…" : "Drop your spreadsheet here"}</h2>
      <p className="mt-2 text-xs text-muted-foreground">Excel or CSV · Up to 20 MB · 100,000 rows</p>
      <Button className="mt-5" onClick={() => input.current?.click()} disabled={loading}><FileSpreadsheet />{dataset || sheets.length ? "Choose another file" : "Browse files"}</Button>
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground"><ShieldCheck size={12} />Processed privately in your browser</div>
    </div>
    {error && <div role="alert" className="mt-5 flex items-start gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive"><AlertCircle size={18} className="shrink-0" /><div><p className="font-semibold">Upload unsuccessful</p><p className="mt-1">{error}</p>{dataset && <p className="mt-2">Your active dataset has not changed.</p>}</div></div>}
    {sheet && preview && <section className="mt-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><FileSpreadsheet size={18} className="shrink-0 text-primary" /><h2 className="break-all text-sm font-bold">{name}</h2></div><Button variant="ghost" size="icon" aria-label="Discard pending upload" onClick={() => setSheets([])}><X /></Button></div>
      <div className="mb-4 flex flex-wrap items-end gap-4"><label className="min-w-[180px] text-[11px] text-muted-foreground">Worksheet<Select value={sheetIndex} onValueChange={value => { setSheetIndex(value); setHeaderRow(1); }}><SelectTrigger className="mt-1 bg-card" aria-label="Worksheet"><SelectValue /></SelectTrigger><SelectContent>{sheets.map((item, index) => <SelectItem key={index} value={String(index)}>{item.name}</SelectItem>)}</SelectContent></Select></label><label className="w-28 text-[11px] text-muted-foreground">Header row<Input type="number" min={1} max={sheet.grid.length || 1} aria-label="Header row" value={headerRow} className="mt-1 bg-card" onChange={e => setHeaderRow(Math.max(1, Number(e.target.value) || 1))} /></label><div className="mb-1 flex flex-wrap items-center gap-4 text-xs"><span>{number(preview.total)} total records</span><span className="text-success">{number(preview.rows.length)} valid</span><span className={preview.total - preview.rows.length > 0 ? "text-destructive" : "text-muted-foreground"}>{number(preview.total - preview.rows.length)} invalid</span></div></div>
      {preview.errors.length > 0 && <div role="alert" className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive"><div className="mb-2 flex items-center gap-2 font-semibold"><AlertCircle size={16} />Dataset needs attention</div><ul className="max-h-44 list-disc space-y-1 overflow-y-auto pl-5">{preview.errors.map((issue, i) => <li key={i}>{issue}</li>)}</ul><p className="mt-3">Correct the file and upload it again. Nothing has been replaced.</p></div>}
      {preview.records.length > 0 && <div className="panel overflow-hidden"><div className="flex items-center gap-2 border-b border-border px-5 py-4"><Rows3 size={15} className="text-primary" /><h3 className="text-xs font-semibold">Dataset preview</h3><span className="ml-auto text-[10px] text-muted-foreground">First {preview.records.length} of {number(preview.total)} records</span></div><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Row</th>{COLUMNS.map(c => <th key={c}>{c}</th>)}<th>Status</th></tr></thead><tbody>{preview.records.map(record => <tr key={record.number}><td>{record.number}</td>{COLUMNS.map(c => <td key={c}>{record.values[c]}</td>)}<td className={record.errors.length ? "text-destructive" : "text-success"}>{record.errors.length ? "Invalid" : "Valid"}</td></tr>)}</tbody></table></div></div>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><span className="flex items-center gap-2 text-[11px] text-muted-foreground">{preview.errors.length ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-success" />}{preview.errors.length ? "Confirmation is disabled until all records are valid." : "All required columns and values validated."}</span><Button onClick={confirm} disabled={!preview.rows.length || preview.errors.length > 0}>Confirm upload<ArrowRight /></Button></div>
    </section>}
    {!sheet && <section className="mt-8"><h2 className="mb-3 text-xs font-bold">Required columns</h2><div className="flex flex-wrap gap-2">{COLUMNS.map(column => <span key={column} className="rounded border border-border bg-card px-2.5 py-1.5 font-mono text-[10px] text-muted-foreground">{column}</span>)}</div><p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">Dates: Excel dates or YYYY-MM-DD. Discounts: 0–100. Monetary values: numeric INR. Shipping cost: total per row.</p></section>}
  </div>;
}