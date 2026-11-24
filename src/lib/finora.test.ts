import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { COLUMNS, EMPTY_FILTERS, MAX_BYTES, MAX_ROWS, calculateKPIs, filterRows, getInsights, readFile, validateGrid, type Cell, type Column } from "./finora";

const values = [
  ["001", "2026-01-01", "North", "Delhi", "0001", "Alpha", "Tech", "2", "100", "10", "40", "5", "Card", "Online"],
  ["001", "2026-01-31", "North", "Delhi", "0002", "Beta", "Home", "1", "200", "0", "120", "10", "Cash", "Store"],
  ["002", "2026-02-01", "South", "Chennai", "0001", "Alpha", "Tech", "3", "50", "20", "20", "15", "Card", "Online"],
];
const grid = (data: string[][]): Cell[][] => [Array.from(COLUMNS), ...data].map(row => row.map(value => ({ value, display: value })));
const rows = validateGrid(grid(values)).rows;
const kpis = calculateKPIs(rows);

describe("FINORA financial rules", () => {
  it("calculates gross sales as units × selling price", () => expect(kpis.gross).toBe(550));
  it("calculates percentage discounts per row", () => expect(kpis.discount).toBe(50));
  it("calculates net revenue as gross minus discounts", () => expect(kpis.revenue).toBe(500));
  it("calculates COGS as units × unit cost", () => expect(kpis.cogs).toBe(260));
  it("calculates expenses as COGS plus row shipping", () => expect(kpis.expenses).toBe(290));
  it("calculates profit as revenue minus expenses", () => expect(kpis.profit).toBe(210));
  it("calculates profit margin as profit/revenue × 100", () => expect(kpis.margin).toBe(42));
  it("counts unique order IDs rather than rows", () => expect(kpis.orders).toBe(2));
  it("sums units", () => expect(kpis.units).toBe(6));
  it("calculates average order value using unique orders", () => expect(kpis.aov).toBe(250));
  it("sums shipping cost without multiplying by units", () => expect(kpis.shipping).toBe(30));
  it("calculates average selling price as gross sales/units", () => expect(kpis.asp).toBeCloseTo(550 / 6));
  it("handles zero denominators", () => expect(calculateKPIs([])).toMatchObject({ margin: 0, aov: 0, asp: 0 }));
  it("preserves negative profits", () => {
    const row = rows[0]; if (!row) throw new Error("Missing fixture");
    expect(calculateKPIs([{ ...row, cost: 200 }]).profit).toBe(-225);
  });
});

describe("FINORA filters and insights", () => {
  it("filters an inclusive date range", () => expect(filterRows(rows, { ...EMPTY_FILTERS, start: "2026-01-01", end: "2026-01-31" })).toHaveLength(2));
  for (const [field, value, count] of [["Region", "South", 1], ["City", "Delhi", 2], ["Category", "Tech", 2], ["Sales_Channel", "Store", 1], ["Payment_Method", "Card", 2]] as const) {
    it(`filters ${field}`, () => expect(filterRows(rows, { ...EMPTY_FILTERS, [field]: value })).toHaveLength(count));
  }
  it("combines filters and recalculates KPIs", () => expect(calculateKPIs(filterRows(rows, { ...EMPTY_FILTERS, Region: "South", Category: "Tech" })).revenue).toBe(120));
  it("finds the highest revenue region", () => expect(getInsights(rows).region?.name).toBe("North"));
  it("finds the category with highest profit", () => expect(getInsights(rows).category?.name).toBe("Tech"));
  it("ranks products by net revenue", () => expect(getInsights(rows)).toMatchObject({ bestProduct: { name: "Alpha", revenue: 300 }, lowestProduct: { name: "Beta", revenue: 200 } }));
  it("finds the highest revenue month", () => expect(getInsights(rows).month?.name).toBe("2026-01"));
  it("compares channels using actual revenue and profit", () => expect(getInsights(rows).channels).toEqual([{ name: "Online", revenue: 300, profit: 140, orders: 2 }, { name: "Store", revenue: 200, profit: 70, orders: 1 }]));
  it("returns no invented insights for empty data", () => expect(getInsights([]).bestProduct).toBeUndefined());
});

describe("Spreadsheet validation", () => {
  it("requires all 14 specified columns", () => {
    const input = grid(values); input[0]?.splice(0, 1);
    expect(validateGrid(input).errors.join()).toContain("Order_ID");
  });
  it("rejects repeated required headings", () => {
    const input = grid(values); input[0]?.push({ value: "Order_ID", display: "Order_ID" });
    expect(validateGrid(input).errors.join()).toContain("Repeated required columns");
  });
  it("preserves formatted identifiers", () => expect(rows[0]).toMatchObject({ Order_ID: "001", Product_ID: "0001" }));
  it("rejects invalid dates", () => {
    const first = values[0]; if (!first) throw new Error("Missing fixture");
    const row = [...first]; row[1] = "2026-02-30";
    expect(validateGrid(grid([row])).errors.join()).toContain("Order_Date");
  });
  for (const field of ["Units_Sold", "Unit_Selling_Price_INR", "Discount_Percent", "Unit_Cost_INR", "Shipping_Cost_INR"] as Column[]) {
    it(`rejects invalid ${field}`, () => {
      const first = values[0]; if (!first) throw new Error("Missing fixture");
      const row = [...first]; row[COLUMNS.indexOf(field)] = "-1";
      expect(validateGrid(grid([row])).errors.join()).toContain(field);
    });
  }
  it("rejects discounts over 100", () => {
    const first = values[0]; if (!first) throw new Error("Missing fixture");
    const row = [...first]; row[9] = "101";
    expect(validateGrid(grid([row])).errors.join()).toContain("between 0 and 100");
  });
  it("previews only the first 10 rows but validates the entire input", () => {
    const first = values[0]; if (!first) throw new Error("Missing fixture");
    const input = Array.from({ length: 12 }, () => [...first]); const last = input[11]; if (last) last[7] = "bad";
    const preview = validateGrid(grid(input));
    expect(preview.records).toHaveLength(10); expect(preview.total).toBe(12); expect(preview.rows).toHaveLength(11); expect(preview.errors.join()).toContain("Row 13");
  });
  it("rejects oversized files", async () => {
    await expect(readFile({ size: MAX_BYTES + 1, name: "large.csv" } as File)).rejects.toThrow("20 MB");
  });
  it("rejects more than 100,000 rows", () => {
    const first = values[0]; if (!first) throw new Error("Missing fixture");
    const row = first.map(value => ({ value, display: value }));
    const input = [COLUMNS.map(value => ({ value, display: value })), ...Array.from({ length: MAX_ROWS + 1 }, () => row)];
    expect(validateGrid(input).errors.join()).toContain("100,000");
  });
  it("reads quoted CSV fields and embedded newlines", async () => {
    const text = [COLUMNS.join(","), '001,2026-01-01,North,Delhi,0001,"Alpha,\nPlus",Tech,2,100,10,40,5,Card,Online'].join("\n");
    const sheets = await readFile({ size: text.length, name: "sales.csv", text: async () => text } as File);
    expect(validateGrid(sheets[0]?.grid ?? []).rows[0]?.Product_Name).toBe("Alpha,\nPlus");
  });
  for (const bookType of ["xlsx", "xls"] as const) {
    it(`reads ${bookType} and preserves identifiers and raw numeric values`, async () => {
      const book = XLSX.utils.book_new();
      const sheet = XLSX.utils.aoa_to_sheet([Array.from(COLUMNS), ...values]);
      sheet["A2"] = { t: "n", v: 1, z: "000" }; sheet["B2"] = { t: "n", v: 46023, z: "yyyy-mm-dd" };
      sheet["I2"] = { t: "n", v: 100, z: '"₹"#,##0' };
      XLSX.utils.book_append_sheet(book, sheet, "Sales");
      const buffer = XLSX.write(book, { type: "array", bookType });
      const sheets = await readFile({ size: buffer.byteLength, name: `sales.${bookType}`, arrayBuffer: async () => buffer } as File);
      const preview = validateGrid(sheets[0]?.grid ?? []);
      expect(preview.errors).toEqual([]); expect(preview.rows[0]).toMatchObject({ Order_ID: "001", date: "2026-01-01", price: 100 });
    });
  }
});