import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/finora/dashboard";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Performance Dashboard | FINORA" },
    { name: "description", content: "Analyze your business revenue, profit, orders, and sales performance with FINORA’s private spreadsheet dashboard." },
    { property: "og:title", content: "Performance Dashboard | FINORA" },
    { property: "og:description", content: "Your business performance in focus: dynamic financial KPIs, charts, and filters." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});
