import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "../components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { useStore, uid, type Agent } from "../lib/mockStore";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Custom agents — MantaGO" },
      { name: "description", content: "Automations that quietly run your business in the background." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  const [store, setStore] = useStore();
  const [maker, setMaker] = useState(false);

  const toggle = (id: string) =>
    setStore((s) => ({ ...s, agents: s.agents.map((a) => a.id === id ? { ...a, autonomous: !a.autonomous } : a) }));
  const del = (id: string) => setStore((s) => ({ ...s, agents: s.agents.filter((a) => a.id !== id) }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="AUTOMATION"
        title="Agents working for you"
        description="Small helpers you can leave running. Choose which ones act on their own and which check with you first."
        actions={<PrimaryButton onClick={() => setMaker(true)}><Plus className="mr-1 -ml-0.5 inline h-4 w-4" />New agent</PrimaryButton>}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {store.agents.map((a, i) => (
          <div key={a.id} className={"flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between " + (i > 0 ? "border-t border-border" : "")}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-foreground">{a.name}</div>
                {a.tag && <span className="inline-flex rounded-full bg-status-green-soft px-2 py-0.5 text-[10px] font-semibold text-status-green">{a.tag}</span>}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{a.description}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-xs text-muted-foreground">Ask me first</span>
              <Switch checked={a.autonomous} onCheckedChange={() => toggle(a.id)} />
              <span className="text-xs font-medium text-foreground">Fully autonomous</span>
              <button onClick={() => del(a.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-status-red" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {maker && <AgentMaker onClose={() => setMaker(false)} onCreate={(a) => {
        setStore((s) => ({ ...s, agents: [a, ...s.agents] }));
        setMaker(false);
      }} />}
    </PageContainer>
  );
}

function AgentMaker({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Agent) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [autonomous, setAutonomous] = useState(false);
  const [tag, setTag] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onCreate({ id: uid(), name: name.trim(), description: description.trim() || "New agent — describe what it should do.", autonomous, tag: tag.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">NEW AGENT</div>
            <h2 className="mt-1 text-xl font-bold">Custom agent</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Give your agent a job and decide how much freedom it has.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="24/7 upsell closer" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">What should it do?</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Follow up on leads round the clock, offer the right upgrade and send the payment link when they say yes." className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">Tag (optional)</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Revenue" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
            <Switch checked={autonomous} onCheckedChange={setAutonomous} />
            <div className="text-xs">
              <div className="font-medium">{autonomous ? "Fully autonomous" : "Ask me first"}</div>
              <div className="text-muted-foreground">{autonomous ? "Will act on its own using the semantic layer rules." : "Will draft actions and wait for your approval."}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit}>Create agent</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
