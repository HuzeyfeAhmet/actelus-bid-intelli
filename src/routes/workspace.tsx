import { createFileRoute } from "@tanstack/react-router";
import { BidWorkspace } from "@/components/site/BidWorkspace";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [
    { title: "Actelus Workspace — Bid Operations & Project Review" },
    { name: "description", content: "Actelus bid workspace with opportunity tracking, document review, clarification questions, addenda, deadlines and sample readiness reports." },
    { property: "og:title", content: "Actelus Workspace — Bid Operations & Project Review" },
    { property: "og:description", content: "Review bid packages, track open scope questions and manage project readiness in the Actelus illustrative workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: BidWorkspace,
});