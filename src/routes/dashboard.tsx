import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, ClipboardList, Link as LinkIcon, CalendarClock, HelpCircle, Ticket, Gift, Dice5, Trophy } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton } from "../components/PageHeader";
import { useStore } from "../lib/mockStore";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MantaGO" },
      { name: "description", content: "See how your conversations, customers and chatbot features are performing this week." },
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

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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
            <div className={color + " w-full rounded-md"} style={{ height: `${(v / max) * 100}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground">{days[i]}</div>
        </div>
      ))}
    </div>
  );
}

function FeatureTile({ icon: Icon, label, value, delta, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; delta: string; tone: Tone }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <span className={"text-[10px] font-semibold " + numberTone[tone]}>{delta}</span>
      </div>
      <div className="mt-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={"mt-1 text-xl font-bold " + numberTone[tone]}>{value.toLocaleString()}</div>
    </div>
  );
}

function DashboardPage() {
  const [store] = useStore();

  // Aggregate feature metrics across all chatbots.
  const totals = store.chatbots.reduce(
    (acc, b) => {
      const m = b.metrics;
      if (!m) return acc;
      acc.forms += m.formsSubmitted;
      acc.links += m.linkClicks;
      acc.meetings += m.meetingsBooked;
      acc.quiz += m.quizCompleted;
      acc.coupons += m.couponsRedeemed;
      acc.rewards += m.rewardsIssued;
      acc.roulette += m.rouletteSpins;
      acc.campaign += m.campaignEntries;
      return acc;
    },
    { forms: 0, links: 0, meetings: 0, quiz: 0, coupons: 0, rewards: 0, roulette: 0, campaign: 0 },
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="MANTAGO DASHBOARD"
        title="How your business is doing"
        description="A quick read on your conversations, customers and chatbot features over the last 7 days."
        actions={<PrimaryButton>Download report</PrimaryButton>}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="CONVERSATIONS THIS WEEK" value="1,284" hint="Across LINE, IG and WhatsApp" tone="blue" />
        <Metric label="REPEAT CUSTOMERS" value="342" hint="Up 12% vs last week" tone="green" />
        <Metric label="COUPONS REDEEMED" value={totals.coupons.toString()} hint="From your chatbot promos" tone="green" />
        <Metric label="AVG. RESPONSE TIME" value="1m 42s" hint="Bot handles 78% on its own" tone="blue" />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Chatbot feature performance</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Every feature you switched on inside your chatbots — measured live.</div>
          </div>
          <span className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">LAST 7 DAYS</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureTile icon={ClipboardList} label="FORMS SUBMITTED"  value={totals.forms}    delta="+18%" tone="blue" />
          <FeatureTile icon={LinkIcon}      label="LINK CLICKS"       value={totals.links}    delta="+9%"  tone="blue" />
          <FeatureTile icon={CalendarClock} label="MEETINGS BOOKED"   value={totals.meetings} delta="+24%" tone="green" />
          <FeatureTile icon={HelpCircle}    label="QUIZZES COMPLETED" value={totals.quiz}     delta="+11%" tone="amber" />
          <FeatureTile icon={Ticket}        label="COUPONS REDEEMED"  value={totals.coupons}  delta="+7%"  tone="green" />
          <FeatureTile icon={Gift}          label="REWARDS ISSUED"    value={totals.rewards}  delta="+15%" tone="green" />
          <FeatureTile icon={Dice5}         label="ROULETTE SPINS"    value={totals.roulette} delta="+31%" tone="amber" />
          <FeatureTile icon={Trophy}        label="CAMPAIGN ENTRIES"  value={totals.campaign} delta="+21%" tone="blue" />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Conversations by day" subtitle="Last 7 days">
          <BarChart data={[120, 180, 150, 220, 260, 190, 164]} tone="blue" />
        </ChartCard>
        <ChartCard title="New vs repeat customers" subtitle="Last 7 days">
          <BarChart data={[40, 62, 48, 71, 88, 74, 59]} tone="green" />
        </ChartCard>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-sm font-semibold text-foreground">Per-chatbot snapshot</div>
        <div className="mt-0.5 text-xs text-muted-foreground">How each of your bots is pulling its weight this week.</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
                <th className="pb-2">CHATBOT</th>
                <th className="pb-2">CHANNEL</th>
                <th className="pb-2 text-right">FORMS</th>
                <th className="pb-2 text-right">MEETINGS</th>
                <th className="pb-2 text-right">COUPONS</th>
                <th className="pb-2 text-right">CAMPAIGN</th>
              </tr>
            </thead>
            <tbody>
              {store.chatbots.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="py-2.5 font-medium text-foreground">{b.name}</td>
                  <td className="py-2.5 text-muted-foreground">{b.channel}</td>
                  <td className="py-2.5 text-right">{b.metrics?.formsSubmitted ?? 0}</td>
                  <td className="py-2.5 text-right">{b.metrics?.meetingsBooked ?? 0}</td>
                  <td className="py-2.5 text-right">{b.metrics?.couponsRedeemed ?? 0}</td>
                  <td className="py-2.5 text-right">{b.metrics?.campaignEntries ?? 0}</td>
                </tr>
              ))}
              {store.chatbots.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-xs text-muted-foreground">Make a chatbot to see data here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}