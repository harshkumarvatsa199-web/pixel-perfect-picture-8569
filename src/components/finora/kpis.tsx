import { IndianRupee, TrendingUp, ShoppingBag, Percent, Package, Receipt, Tag, Truck, Wallet, CircleDollarSign, BadgeIndianRupee, ArrowDownRight } from "lucide-react";
import { calculateKPIs, money, number } from "@/lib/finora";
import { useData } from "./data-context";

export function KPIs({ secondary = false }: { secondary?: boolean }) {
  const { dataset, rows } = useData();
  const kpi = calculateKPIs(rows);
  const main = [
    { label: "Net Revenue", value: money(kpi.revenue), icon: IndianRupee, tone: "", note: "After discounts", formula: "Gross sales − discount amount" },
    { label: "Net Profit", value: money(kpi.profit), icon: TrendingUp, tone: "positive", note: "Revenue less total expenses", formula: "Net revenue − COGS − shipping" },
    { label: "Total Orders", value: number(kpi.orders), icon: ShoppingBag, tone: "", note: "Unique orders in this period", formula: "Count of unique Order_IDs" },
    { label: "Profit Margin", value: `${kpi.margin.toFixed(1)}%`, icon: Percent, tone: "warm", note: "Of total net revenue", formula: "Net profit ÷ net revenue × 100" },
  ];
  const extra = [
    { label: "Gross Sales", value: money(kpi.gross), icon: BadgeIndianRupee, formula: "Sum of units × selling price" },
    { label: "Discount Amount", value: money(kpi.discount), icon: Tag, formula: "Sum of gross sales × discount percent ÷ 100" },
    { label: "Cost of Goods Sold", value: money(kpi.cogs), icon: Package, formula: "Sum of units × unit cost" },
    { label: "Total Expenses", value: money(kpi.expenses), icon: Receipt, formula: "COGS + shipping cost" },
    { label: "Units Sold", value: number(kpi.units), icon: ShoppingBag, formula: "Sum of Units_Sold" },
    { label: "Average Order Value", value: money(kpi.aov), icon: Wallet, formula: "Net revenue ÷ unique orders" },
    { label: "Shipping Cost", value: money(kpi.shipping), icon: Truck, formula: "Sum of Shipping_Cost_INR" },
    { label: "Average Selling Price", value: money(kpi.asp), icon: CircleDollarSign, formula: "Gross sales ÷ total units" },
  ];
  if (secondary) return <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{extra.map(item => <article className="panel p-4" key={item.label} title={item.formula}><div className="flex items-start justify-between gap-2"><p className="text-[11px] text-muted-foreground">{item.label}</p><item.icon size={14} className="shrink-0 text-muted-foreground/70" /></div><p className="mt-2 break-words font-display text-xl font-bold tabular-nums">{dataset ? item.value : "—"}</p></article>)}</div>;
  return <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">{main.map(item => <article className="panel p-4 lg:p-5" key={item.label} title={item.formula}><div className="flex items-center justify-between gap-2"><p className="text-[11px] font-medium text-muted-foreground">{item.label}</p><span className={`metric-icon ${item.tone}`}><item.icon size={16} /></span></div><p className={`metric-value mt-3 ${item.label === "Net Profit" && kpi.profit < 0 ? "text-destructive" : ""}`}>{dataset ? item.value : "—"}</p><div className="mt-3 flex min-h-4 items-center gap-1.5 text-[10px] text-muted-foreground">{item.label === "Net Profit" && <ArrowDownRight size={12} />}<span>{dataset ? item.note : "No data yet"}</span></div></article>)}</div>;
}