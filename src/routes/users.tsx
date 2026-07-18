import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "../components/PageHeader";
import { useStore, type Customer } from "../lib/mockStore";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Customers — MantaGO" },
      { name: "description", content: "The people you serve. Filter, segment and export." },
    ],
  }),
  component: UsersPage,
});

const CHANNELS = ["All", "LINE", "WhatsApp", "Instagram", "Facebook"] as const;
const TAGS = ["All", "VIP", "Regular", "New", "At risk"] as const;

function toCsv(rows: Customer[]) {
  const header = ["Name","Channel","City","Spend (THB)","Orders","Last seen","Tag"];
  const body = rows.map((r) => [r.name, r.channel, r.city, r.spend, r.orders, r.lastSeen, r.tag]);
  return [header, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function tagClass(t: Customer["tag"]) {
  switch (t) {
    case "VIP": return "bg-status-green-soft text-status-green";
    case "New": return "bg-status-blue-soft text-brand-blue";
    case "At risk": return "bg-status-red-soft text-status-red";
    default: return "bg-muted text-muted-foreground";
  }
}

function UsersPage() {
  const [store] = useStore();
  const [q, setQ] = useState("");
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("All");
  const [tag, setTag] = useState<(typeof TAGS)[number]>("All");

  const rows = useMemo(() => store.customers.filter((c) => {
    if (channel !== "All" && c.channel !== channel) return false;
    if (tag !== "All" && c.tag !== tag) return false;
    if (q && !`${c.name} ${c.city}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [store.customers, q, channel, tag]);

  const download = () => {
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mantago-customers-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const total = rows.reduce((s, r) => s + r.spend, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="CUSTOMERS"
        title="The people you serve"
        description="Every customer MantaGO has met — across every channel. Filter, segment and export whenever you need."
        actions={<PrimaryButton onClick={download}>Download CSV</PrimaryButton>}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="People" value={rows.length.toString()} />
        <Stat label="Total spend" value={"฿" + total.toLocaleString()} />
        <Stat label="VIPs" value={rows.filter((r) => r.tag === "VIP").length.toString()} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or city…"
              className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-navy"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select label="Channel" value={channel} onChange={(v) => setChannel(v as typeof channel)} options={CHANNELS as unknown as string[]} />
            <Select label="Tag" value={tag} onChange={(v) => setTag(v as typeof tag)} options={TAGS as unknown as string[]} />
            <button onClick={download} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-accent">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr_0.8fr_0.6fr] gap-3 border-b border-border px-6 py-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
          <div>NAME</div><div>CHANNEL</div><div>CITY</div><div>SPEND</div><div>ORDERS</div><div>LAST SEEN</div><div>TAG</div>
        </div>
        {rows.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No customers match those filters.</div>}
        {rows.map((c) => (
          <div key={c.id} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr_0.6fr_0.8fr_0.6fr] items-center gap-3 border-b border-border/70 px-6 py-3 text-sm last:border-b-0 hover:bg-accent/40">
            <div className="font-medium text-foreground">{c.name}</div>
            <div className="text-muted-foreground">{c.channel}</div>
            <div className="text-muted-foreground">{c.city}</div>
            <div className="text-foreground">฿{c.spend.toLocaleString()}</div>
            <div className="text-muted-foreground">{c.orders}</div>
            <div className="text-muted-foreground">{c.lastSeen}</div>
            <div><span className={"inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold " + tagClass(c.tag)}>{c.tag}</span></div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-4">
      <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">{label.toUpperCase()}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs">
      <span className="text-muted-foreground">{label}:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent text-foreground outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
