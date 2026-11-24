import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { EMPTY_FILTERS, filterRows, type Dataset, type Filters, type Row } from "@/lib/finora";

type DataContext = { dataset: Dataset | null; setDataset: (data: Dataset) => void; filters: Filters; setFilters: (filters: Filters) => void; rows: Row[] };
const Context = createContext<DataContext | null>(null);
export function DataProvider({ children }: { children: ReactNode }) {
  const [dataset, updateDataset] = useState<Dataset | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const rows = useMemo(() => filterRows(dataset?.rows ?? [], filters), [dataset, filters]);
  function setDataset(data: Dataset) { updateDataset(data); setFilters(EMPTY_FILTERS); }
  return <Context.Provider value={{ dataset, setDataset, filters, setFilters, rows }}>{children}</Context.Provider>;
}
export function useData() {
  const context = useContext(Context);
  if (!context) throw new Error("DataProvider is required");
  return context;
}