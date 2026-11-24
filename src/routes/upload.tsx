import { createFileRoute } from "@tanstack/react-router";
import { UploadPage } from "@/components/finora/upload-page";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [
    { title: "Upload Dataset | FINORA" },
    { name: "description", content: "Privately upload and validate Excel or CSV sales data, preview your records, and connect your dataset to FINORA." },
    { property: "og:title", content: "Upload Dataset | FINORA" },
    { property: "og:description", content: "Excel and CSV uploads with full validation, preview, and safe dataset replacement." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: UploadPage,
});