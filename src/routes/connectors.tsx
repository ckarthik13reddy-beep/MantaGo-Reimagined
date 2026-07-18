import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  MessageCircle, Instagram, Facebook, Send, Database, Users, ShoppingBag, Sheet,
} from "lucide-react";
import { PageContainer, PageHeader } from "../components/PageHeader";

export const Route = createFileRoute("/connectors")({
  head: () => ({
    meta: [
      { title: "Data connectors — MantaGO" },
      { name: "description", content: "Connect the tools your business already uses — messaging apps, CRMs and databases." },
    ],
  }),
  component: ConnectorsPage,
});

type Category = "Social media" | "CRM" | "Database";
type Connector = {
  id: string;
  name: string;
  category: Category;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
};

const CONNECTORS: Connector[] = [
  { id: "line", name: "LINE Official", category: "Social media", description: "Reply to LINE chats from MantaGO.", icon: MessageCircle, connected: true },
  { id: "whatsapp", name: "WhatsApp Business", category: "Social media", description: "Handle WhatsApp customers in one inbox.", icon: Send, connected: true },
  { id: "instagram", name: "Instagram Direct", category: "Social media", description: "Manage DMs from your IG account.", icon: Instagram, connected: true },
  { id: "facebook", name: "Facebook Messenger", category: "Social media", description: "Answer Facebook page messages.", icon: Facebook, connected: false },
  { id: "hubspot", name: "HubSpot", category: "CRM", description: "Sync contacts and deals with HubSpot.", icon: Users, connected: false },
  { id: "shopify", name: "Shopify", category: "CRM", description: "Pull orders and customer info from your shop.", icon: ShoppingBag, connected: true },
  { id: "sheets", name: "Google Sheets", category: "Database", description: "Read and write to your spreadsheets.", icon: Sheet, connected: false },
  { id: "postgres", name: "PostgreSQL", category: "Database", description: "Connect a customer database.", icon: Database, connected: false },
];

const FILTERS: { label: string; value: "All" | Category }[] = [
  { label: "All", value: "All" },
  { label: "Social media", value: "Social media" },
  { label: "CRM", value: "CRM" },
  { label: "Database", value: "Database" },
];

function categoryBadge(cat: Category) {
  const map: Record<Category, string> = {
    "Social media": "bg-status-blue-soft text-brand-blue",
    "CRM": "bg-status-green-soft text-status-green",
    "Database": "bg-status-amber-soft text-status-amber",
  };
  return map[cat];
}

function ConnectorsPage() {
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [list, setList] = useState(CONNECTORS);
  const toggle = (id: string) => setList((prev) => prev.map((c) => c.id === id ? { ...c, connected: !c.connected } : c));
  const counts: Record<string, number> = { All: list.length };
  for (const c of list) counts[c.category] = (counts[c.category] ?? 0) + 1;
  const items = filter === "All" ? list : list.filter((c) => c.category === filter);


  return (
    <PageContainer>
      <PageHeader
        eyebrow="CONNECTIONS"
        title="Connected tools"
        description="Bring the apps you already use into MantaGO so the AI can act on real data."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
                (active
                  ? "border-navy bg-navy text-white"
                  : "border-border bg-card text-muted-foreground hover:text-foreground")
              }
            >
              {f.label}
              <span
                className={
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold " +
                  (active ? "bg-white/15 text-white" : "bg-muted text-muted-foreground")
                }
              >
                {counts[f.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <span className={"inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold " + categoryBadge(c.category)}>
                  {c.category}
                </span>
              </div>
              <div className="mt-4 text-sm font-semibold text-foreground">{c.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.description}</div>
              <div className="mt-5 flex items-center justify-between">
                <span className={"text-xs font-medium " + (c.connected ? "text-status-green" : "text-muted-foreground")}>
                  {c.connected ? "● Connected" : "○ Not connected"}
                </span>
                <button
                  onClick={() => toggle(c.id)}
                  className={
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
                    (c.connected
                      ? "border border-border bg-card text-foreground hover:bg-accent"
                      : "bg-navy text-white hover:bg-navy-hover")
                  }
                >
                  {c.connected ? "Disconnect" : "Connect"}
                </button>

              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
