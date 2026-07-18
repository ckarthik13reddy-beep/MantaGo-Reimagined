import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "../components/PageHeader";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MantaGO" },
      { name: "description", content: "See how your conversations, customers and campaigns are performing this week." },
    ],
  }),
  component: DashboardPage,
});

type Tone = "blue" | "green" | "red" | "amber";
const numberTone: Record<Tone, string> = {
  blue: "text-brand-blue",
  green: "text-status-green",
  red: "text-status-red",
  amber: "text-status-amber",
};

function Metric({ label, value, hint, tone }: { label: string; value: string; hint: string; tone: Tone }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={"mt-3 text-3xl font-bold tracking-tight " + numberTone[tone]}>{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent">
          <MessageCircle className="h-3.5 w-3.5" />
          Ask about this chart
        </button>
      </div>
      <div className="mt-5 h-40">{children}</div>
    </div>
  );
}

function BarChart({ data, tone }: { data: number[]; tone: "blue" | "green" }) {
  const max = Math.max(...data);
  const color = tone === "blue" ? "bg-brand-blue" : "bg-status-green";
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex h-full items-stretch gap-2">
      {data.map((v, i) => (
        <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className={color + " w-full rounded-md"}
              style={{ height: `${(v / max) * 100}%` }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground">{days[i]}</div>
        </div>
      ))}
    </div>

  );
}

function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="MANTAGO DASHBOARD"
        title="How your business is doing"
        description="A quick read on your conversations, customers and campaigns over the last 7 days."
        actions={<PrimaryButton>Download report</PrimaryButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="CONVERSATIONS THIS WEEK" value="1,284" hint="Across LINE, IG and WhatsApp" tone="blue" />
        <Metric label="REPEAT CUSTOMERS" value="342" hint="Up 12% vs last week" tone="green" />
        <Metric label="COUPONS REDEEMED" value="87" hint="From your Songkran promo" tone="green" />
        <Metric label="AVG. RESPONSE TIME" value="1m 42s" hint="Bot handles 78% on its own" tone="blue" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Conversations by day" subtitle="Last 7 days">
          <BarChart data={[120, 180, 150, 220, 260, 190, 164]} tone="blue" />
        </ChartCard>
        <ChartCard title="New vs repeat customers" subtitle="Last 7 days">
          <BarChart data={[40, 62, 48, 71, 88, 74, 59]} tone="green" />
        </ChartCard>
      </div>
    </PageContainer>
  );
}
