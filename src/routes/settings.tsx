import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Shield, Sparkles } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "../components/PageHeader";
import { useStore, uid, type SemanticRule } from "../lib/mockStore";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account settings — MantaGO" },
      { name: "description", content: "Manage your team, notifications, billing and semantic layer." },
    ],
  }),
  component: SettingsPage,
});

function Section({ title, description, children, action }: { title: string; description: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
        </div>
        {action}
      </div>
      <div className="pt-4">{children}</div>
    </div>
  );
}

function Row({ label, value, action, onClick }: { label: string; value: string; action: string; onClick?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{value}</div>
      </div>
      <SecondaryButton onClick={onClick}>{action}</SecondaryButton>
    </div>
  );
}

function SettingsPage() {
  const [store, setStore] = useStore();
  const [newRule, setNewRule] = useState("");
  const [kind, setKind] = useState<SemanticRule["kind"]>("guardrail");

  const addRule = () => {
    if (!newRule.trim()) return;
    setStore((s) => ({ ...s, semantic: [{ id: uid(), kind, text: newRule.trim() }, ...s.semantic] }));
    setNewRule("");
  };
  const removeRule = (id: string) => setStore((s) => ({ ...s, semantic: s.semantic.filter((r) => r.id !== id) }));

  const logic = store.semantic.filter((r) => r.kind === "logic");
  const guardrails = store.semantic.filter((r) => r.kind === "guardrail");

  const noop = () => alert("This is a demo — action wired for the client walkthrough.");

  return (
    <PageContainer>
      <PageHeader
        eyebrow="ACCOUNT"
        title="Account settings"
        description="Team, billing, notifications and the rules the AI must follow."
      />

      <div className="rounded-2xl border border-status-amber-soft bg-status-amber-soft/60 px-5 py-3 text-xs text-status-amber">
        Looking to teach the AI something new or change what a bot can say?{" "}
        <Link to="/chatbots" className="font-semibold underline underline-offset-2">Open Chatbots</Link> and just tell it in plain language.
      </div>

      {/* SEMANTIC LAYER */}
      <Section
        title="Semantic layer"
        description="Define your business logic and the guardrails the AI must never cross. Every chatbot and agent inherits these rules."
      >
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-border bg-card p-0.5 text-[11px]">
              <button onClick={() => setKind("logic")} className={"rounded-full px-3 py-1 font-medium " + (kind === "logic" ? "bg-navy text-white" : "text-muted-foreground")}>Business logic</button>
              <button onClick={() => setKind("guardrail")} className={"rounded-full px-3 py-1 font-medium " + (kind === "guardrail" ? "bg-navy text-white" : "text-muted-foreground")}>Guardrail</button>
            </div>
            <input
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRule(); } }}
              placeholder={kind === "logic" ? "e.g. A VIP is anyone who spent over ฿5,000 this quarter" : "e.g. Never quote wholesale prices"}
              className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-navy"
            />
            <PrimaryButton onClick={addRule}><Plus className="mr-1 -ml-0.5 inline h-4 w-4" />Add rule</PrimaryButton>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <RuleList
            title="Business logic" icon={<Sparkles className="h-4 w-4 text-brand-blue" />}
            tone="blue" rules={logic} onRemove={removeRule}
            empty="Add rules like 'Free delivery over ฿500' so the AI understands your business."
          />
          <RuleList
            title="Guardrails" icon={<Shield className="h-4 w-4 text-status-red" />}
            tone="red" rules={guardrails} onRemove={removeRule}
            empty="Add hard rules the AI must never break, like 'Never share supplier names'."
          />
        </div>
      </Section>

      <Section title="Team" description="Who has access to this workspace.">
        <div className="divide-y divide-border">
          <Row label="Ploy S. (Owner)" value="ploy@siambloom.co" action="Manage" onClick={noop} />
          <Row label="Nan K." value="nan@siambloom.co · Editor" action="Manage" onClick={noop} />
          <Row label="Invite teammate" value="Add someone by email" action="Invite" onClick={noop} />
        </div>
      </Section>

      <Section title="Notifications" description="How MantaGO reaches you when something needs a human.">
        <div className="divide-y divide-border">
          <Row label="Email" value="ploy@siambloom.co" action="Change" onClick={noop} />
          <Row label="LINE alerts" value="Sent to your personal LINE" action="Configure" onClick={noop} />
          <Row label="Quiet hours" value="10pm – 8am (Bangkok)" action="Edit" onClick={noop} />
        </div>
      </Section>

      <Section title="Billing" description="Your plan and payment method.">
        <div className="divide-y divide-border">
          <Row label="Plan" value="Growth · ฿990 / month" action="Change plan" onClick={noop} />
          <Row label="Payment method" value="Visa •••• 4021" action="Update" onClick={noop} />
          <Row label="Invoices" value="Download previous months" action="View" onClick={noop} />
        </div>
      </Section>
    </PageContainer>
  );
}

function RuleList({ title, icon, tone, rules, onRemove, empty }: {
  title: string; icon: React.ReactNode; tone: "blue" | "red"; rules: SemanticRule[]; onRemove: (id: string) => void; empty: string;
}) {
  const chip = tone === "blue" ? "bg-status-blue-soft text-brand-blue" : "bg-status-red-soft text-status-red";
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm font-semibold">{title}</div>
        <span className={"ml-auto inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold " + chip}>{rules.length}</span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {rules.length === 0 && <div className="text-xs text-muted-foreground">{empty}</div>}
        {rules.map((r) => (
          <div key={r.id} className="flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <div className="flex-1 text-xs text-foreground">{r.text}</div>
            <button onClick={() => onRemove(r.id)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-status-red" aria-label="Remove"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
