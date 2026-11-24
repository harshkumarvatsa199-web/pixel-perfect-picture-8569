import Papa from "papaparse";
import * as XLSX from "xlsx";

export const COLUMNS = ["Order_ID", "Order_Date", "Region", "City", "Product_ID", "Product_Name", "Category", "Units_Sold", "Unit_Selling_Price_INR", "Discount_Percent", "Unit_Cost_INR", "Shipping_Cost_INR", "Payment_Method", "Sales_Channel"] as const;
export type Column = typeof COLUMNS[number];
export type Row = Record<Column, string> & { units: number; price: number; discount: number; cost: number; shipping: number; date: string };
export type Cell = { value: unknown; display: string };
export type Worksheet = { name: string; grid: Cell[][] };
export type Preview = { rows: Row[]; records: { number: number; values: Record<string, string>; errors: string[] }[]; errors: string[]; total: number };
export type Dataset = { name: string; sheet: string; rows: Row[] };
export type Filters = { start: string; end: string; Region: string; City: string; Category: string; Sales_Channel: string; Payment_Method: string };
export const EMPTY_FILTERS: Filters = { start: "", end: "", Region: "", City: "", Category: "", Sales_Channel: "", Payment_Method: "" };
export const FILTER_FIELDS = ["Region", "City", "Category", "Sales_Channel", "Payment_Method"] as const;
export const MAX_BYTES = 20 * 1024 * 1024;
export const MAX_ROWS = 100000;
const numericFields = ["Units_Sold", "Unit_Selling_Price_INR", "Discount_Percent", "Unit_Cost_INR", "Shipping_Cost_INR"];

export async function readFile(file: File): Promise<Worksheet[]> {
  if (file.size > MAX_BYTES) throw new Error("This file is too large. Please upload a file smaller than 20 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    const result = Papa.parse<string[]>(await file.text(), { skipEmptyLines: "greedy", dynamicTyping: false });
    const issue = result.errors.find(e => e.code !== "UndetectableDelimiter");
    if (issue) throw new Error(`CSV could not be read: ${issue.message}`);
    if (result.data.length > MAX_ROWS + 1) throw new Error("The dataset exceeds the 100,000-row limit.");
    return [{ name: "CSV", grid: result.data.map(row => row.map(value => ({ value, display: value }))) }];
  }
  if (extension !== "xlsx" && extension !== "xls") throw new Error("Please choose an .xlsx, .xls, or .csv file.");
  const book = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
  return book.SheetNames.map(name => {
    const sheet = book.Sheets[name];
    if (!sheet?.["!ref"]) return { name, grid: [] };
    const range = XLSX.utils.decode_range(sheet["!ref"]);
    if (range.e.r - range.s.r > MAX_ROWS) throw new Error("The dataset exceeds the 100,000-row limit.");
    if (range.e.c - range.s.c > 255) throw new Error("Please use a worksheet with at most 256 columns.");
    const grid: Cell[][] = [];
    for (let r = 0; r <= range.e.r; r++) {
      const cells: Cell[] = [];
      for (let c = 0; c <= range.e.c; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })] as XLSX.CellObject | undefined;
        cells.push({ value: cell?.v ?? "", display: String(cell?.w ?? cell?.v ?? "") });
      }
      grid.push(cells);
    }
    return { name, grid };
  });
}

function parseDate(value: unknown): string {
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date || date.y < 1900 || date.y > 9999) return "";
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }
  const text = String(value ?? "").trim();
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(text) ?? /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(text);
  if (!match) return "";
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) return "";
  return date.toISOString().slice(0, 10);
}

export function validateGrid(grid: Cell[][], headerRow = 1): Preview {
  const header = grid[headerRow - 1]?.map(c => c.display.trim()) ?? [];
  const missing = COLUMNS.filter(c => !header.includes(c));
  const duplicates = COLUMNS.filter(c => header.filter(h => h === c).length > 1);
  const errors: string[] = [];
  if (missing.length) errors.push(`Missing required columns: ${missing.join(", ")}.`);
  if (duplicates.length) errors.push(`Repeated required columns: ${duplicates.join(", ")}.`);
  const records: Preview["records"] = [];
  const rows: Row[] = [];
  const nonblank = grid.slice(headerRow).map((cells, i) => ({ cells, number: headerRow + i + 1 })).filter(({ cells }) => cells.some(c => c.display.trim()));
  if (nonblank.length > MAX_ROWS) errors.push("The dataset exceeds the 100,000-row limit.");
  if (errors.length) return { rows, records, errors, total: nonblank.length };
  for (const { cells, number } of nonblank) {
    const values = Object.fromEntries(COLUMNS.map(field => {
      const cell = cells[header.indexOf(field)];
      return [field, numericFields.includes(field) ? String(cell?.value ?? "").trim() : (cell?.display ?? "").trim()];
    })) as Record<Column, string>;
    const rowErrors: string[] = [];
    for (const field of COLUMNS) if (!values[field]) rowErrors.push(`${field} is empty`);
    for (const field of numericFields) {
      const value = values[field as Column];
      if (value && (!Number.isFinite(Number(value)) || Number(value) < 0)) rowErrors.push(`${field} must be a non-negative number`);
    }
    if (Number(values.Units_Sold) % 1 !== 0) rowErrors.push("Units_Sold must be a whole number");
    if (Number(values.Discount_Percent) > 100) rowErrors.push("Discount_Percent must be between 0 and 100");
    const date = parseDate(cells[header.indexOf("Order_Date")]?.value);
    if (!date) rowErrors.push("Order_Date must be a valid Excel date or YYYY-MM-DD");
    if (records.length < 10) records.push({ number, values, errors: rowErrors });
    if (rowErrors.length) {
      if (errors.length < 20) errors.push(`Row ${number}: ${rowErrors.join("; ")}.`);
    } else rows.push({ ...values, date, units: Number(values.Units_Sold), price: Number(values.Unit_Selling_Price_INR), discount: Number(values.Discount_Percent), cost: Number(values.Unit_Cost_INR), shipping: Number(values.Shipping_Cost_INR) });
  }
  if (!nonblank.length) errors.push("This worksheet has no data rows.");
  return { rows, records, errors, total: nonblank.length };
}

export function filterRows(rows: Row[], filters: Filters): Row[] {
  return rows.filter(row => (!filters.start || row.date >= filters.start) && (!filters.end || row.date <= filters.end) && FILTER_FIELDS.every(field => !filters[field] || row[field] === filters[field]));
}

export function rowMetrics(row: Row) {
  const gross = row.units * row.price;
  const discount = gross * row.discount / 100;
  const revenue = gross - discount;
  const cogs = row.units * row.cost;
  const expenses = cogs + row.shipping;
  return { gross, discount, revenue, cogs, expenses, profit: revenue - expenses, shipping: row.shipping, units: row.units };
}
export function calculateKPIs(rows: Row[]) {
  const sum = rows.reduce((total, row) => {
    const metrics = rowMetrics(row);
    for (const key of Object.keys(metrics) as (keyof typeof metrics)[]) total[key] += metrics[key];
    return total;
  }, { gross: 0, discount: 0, revenue: 0, cogs: 0, expenses: 0, profit: 0, shipping: 0, units: 0 });
  const orders = new Set(rows.map(row => row.Order_ID)).size;
  return { ...sum, orders, margin: sum.revenue ? sum.profit / sum.revenue * 100 : 0, aov: orders ? sum.revenue / orders : 0, asp: sum.units ? sum.gross / sum.units : 0 };
}
export type Group = { name: string; revenue: number; profit: number; orders: number };
export function groupRows(rows: Row[], field: Column | "month"): Group[] {
  const groups = new Map<string, { name: string; revenue: number; profit: number; ids: Set<string> }>();
  for (const row of rows) {
    const key = field === "month" ? row.date.slice(0, 7) : row[field];
    const name = field === "Product_ID" ? row.Product_Name : key;
    const group = groups.get(key) ?? { name, revenue: 0, profit: 0, ids: new Set<string>() };
    const metrics = rowMetrics(row);
    group.revenue += metrics.revenue;
    group.profit += metrics.profit;
    group.ids.add(row.Order_ID);
    groups.set(key, group);
  }
  const result = [...groups.values()].map(group => ({ name: group.name, revenue: group.revenue, profit: group.profit, orders: group.ids.size }));
  return field === "month" ? result.sort((a, b) => a.name.localeCompare(b.name)) : result.sort((a, b) => b.revenue - a.revenue);
}
export function getInsights(rows: Row[]) {
  const regions = groupRows(rows, "Region");
  const categories = groupRows(rows, "Category").sort((a, b) => b.profit - a.profit);
  const products = groupRows(rows, "Product_ID");
  const months = groupRows(rows, "month").sort((a, b) => b.revenue - a.revenue);
  return { region: regions[0], category: categories[0], bestProduct: products[0], lowestProduct: products.at(-1), month: months[0], channels: groupRows(rows, "Sales_Channel") };
}
export const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const number = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
export function compactMoney(value: number) {
  const abs = Math.abs(value);
  if (abs >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(value / 1000).toFixed(1)}k`;
  return money(value);
}
export function monthLabel(value: string) { return new Date(`${value}-01T00:00:00Z`).toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" }); }