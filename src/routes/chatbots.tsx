import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ChevronDown, Send, X, Plus, Settings, Sparkles, Bot, MessageSquare,
  ClipboardList, Link as LinkIcon, CalendarClock, HelpCircle, Ticket, Gift, Dice5, Trophy,
} from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "../components/PageHeader";
import {
  useStore, uid,
  FEATURE_CATALOG, MEDIA_CATALOG,
  emptyMetrics,
  type Chatbot, type MediaKind, type Msg, type TrainingSample,
} from "../lib/mockStore";

export const Route = createFileRoute("/chatbots")({
  head: () => ({
    meta: [
      { title: "Chatbots — MantaGO" },
      { name: "description", content: "Manage the chatbots that reply to your customers across every channel." },
    ],
  }),
  component: ChatbotsPage,
});

const CONNECTORS = [
  { id: "line", name: "LINE" }, { id: "instagram", name: "Instagram" },
  { id: "whatsapp", name: "WhatsApp" }, { id: "facebook", name: "Facebook" },
  { id: "shopify", name: "Shopify" }, { id: "sheets", name: "Google Sheets" },
  { id: "hubspot", name: "HubSpot" }, { id: "postgres", name: "PostgreSQL" },
];

const FEATURE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  forms: ClipboardList, linkTracking: LinkIcon, booking: CalendarClock,
  quiz: HelpCircle, coupons: Ticket, rewards: Gift, roulette: Dice5, campaign: Trophy,
};

function StatusPill({ status }: { status: Chatbot["status"] }) {
  const cls = status === "live"
    ? "bg-status-green-soft text-status-green"
    : "bg-status-amber-soft text-status-amber";
  return <span className={"inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize " + cls}>{status}</span>;
}

function BotRow({ bot, onDelete, onPublish, onEdit }: { bot: Chatbot; onDelete: () => void; onPublish: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-accent/40">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{bot.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {bot.channel}
            {bot.createdFromChat ? " · created from a chat" : ""}
            {bot.features.length ? ` · ${bot.features.length} features` : ""}
          </div>
        </div>
        <StatusPill status={bot.status} />
        <ChevronDown className={"h-4 w-4 text-muted-foreground transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="border-t border-border bg-accent/30 px-6 py-5">
          {bot.purpose && (
            <div className="mb-4 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">PURPOSE</div>
              <div className="mt-1">{bot.purpose}</div>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">FEATURES</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bot.features.length === 0 && <span className="text-xs text-muted-foreground">None yet — add some in Edit.</span>}
                {bot.features.map((f) => {
                  const meta = FEATURE_CATALOG.find((x) => x.id === f);
                  const Icon = FEATURE_ICON[f] ?? Sparkles;
                  return (
                    <span key={f} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
                      <Icon className="h-3 w-3" /> {meta?.name ?? f}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">SUPPORTED MEDIA</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bot.mediaSupport.map((m) => (
                  <span key={m} className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">{m}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">WHAT IT KNOWS</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bot.knows.map((t) => (
                  <span key={t} className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">GUARDRAILS</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(bot.guardrails.length ? bot.guardrails : bot.wont).map((t) => (
                  <span key={t} className="inline-flex rounded-full bg-status-red-soft px-2.5 py-1 text-xs text-status-red">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <SecondaryButton onClick={onDelete}>Delete</SecondaryButton>
            <SecondaryButton onClick={onEdit}><Settings className="mr-1 -ml-0.5 inline h-3.5 w-3.5" />Edit & test</SecondaryButton>
            {bot.status === "draft" && <PrimaryButton onClick={onPublish}>Publish</PrimaryButton>}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatbotsPage() {
  const [store, setStore] = useStore();
  const [maker, setMaker] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const del = (id: string) => setStore((s) => ({ ...s, chatbots: s.chatbots.filter((b) => b.id !== id) }));
  const publish = (id: string) => setStore((s) => ({ ...s, chatbots: s.chatbots.map((b) => b.id === id ? { ...b, status: "live" } : b) }));
  const editing = store.chatbots.find((b) => b.id === editingId) ?? null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="YOUR BOTS"
        title="Chatbots"
        description="Every automated conversation running for your business — customise features, connectors and guardrails, then test in a sandbox."
        actions={<PrimaryButton onClick={() => setMaker(true)}><Plus className="mr-1 -ml-0.5 inline h-4 w-4" />New chatbot</PrimaryButton>}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {store.chatbots.map((b, i) => (
          <div key={b.id} className={i > 0 ? "border-t border-border" : ""}>
            <BotRow bot={b} onDelete={() => del(b.id)} onPublish={() => publish(b.id)} onEdit={() => setEditingId(b.id)} />
          </div>
        ))}
        {store.chatbots.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No chatbots yet. Make one to get started.</div>}
      </div>

      {maker && <ChatbotMaker onClose={() => setMaker(false)} onCreate={(bot) => {
        setStore((s) => ({ ...s, chatbots: [bot, ...s.chatbots] }));
        setMaker(false);
      }} />}
      {editing && (
        <ChatbotEditor
          bot={editing}
          onClose={() => setEditingId(null)}
          onSave={(next) => {
            setStore((s) => ({ ...s, chatbots: s.chatbots.map((b) => b.id === next.id ? next : b) }));
          }}
        />
      )}
    </PageContainer>
  );
}

function ChatbotMaker({ onClose, onCreate }: { onClose: () => void; onCreate: (b: Chatbot) => void }) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("LINE");
  const [describe, setDescribe] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onCreate({
      id: uid(),
      name: name.trim(),
      channel,
      status: "draft",
      knows: describe ? [describe.slice(0, 80)] : ["Basic FAQ"],
      wont: ["Discuss competitors"],
      purpose: describe || `Handle ${channel} customers.`,
      features: [], mediaSupport: ["text","image"], connectors: [channel.toLowerCase()],
      businessLogic: [], guardrails: ["No discounts above 15% without approval."],
      metrics: emptyMetrics(),
    });
  };

  return (
    <Modal onClose={onClose} title="Chatbot maker" eyebrow="NEW CHATBOT" subtitle="Describe your bot in plain language, or fill the details manually.">
      <div className="space-y-3">
        <Field label="Describe it in one sentence">
          <textarea value={describe} onChange={(e) => { setDescribe(e.target.value); if (!name && e.target.value) setName(e.target.value.slice(0, 40)); }} rows={2}
            placeholder="e.g. Reply to café customers on LINE about hours, menu and reservations."
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Café front-of-house" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
          </Field>
          <Field label="Channel">
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy">
              {["LINE","WhatsApp","Instagram","Facebook"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton onClick={submit}>Create draft</PrimaryButton>
      </div>
    </Modal>
  );
}

// -------------- Editor Modal --------------

type Tab = "overview" | "features" | "media" | "connectors" | "guardrails" | "test" | "training";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "media", label: "Media" },
  { id: "connectors", label: "Connectors" },
  { id: "guardrails", label: "Business logic & guardrails" },
  { id: "test", label: "Test" },
  { id: "training", label: "Training" },
];

function ChatbotEditor({ bot, onClose, onSave }: { bot: Chatbot; onClose: () => void; onSave: (b: Chatbot) => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [draft, setDraft] = useState<Chatbot>(bot);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(bot), [draft, bot]);

  const commit = (next: Chatbot) => { setDraft(next); onSave(next); };
  const patch = (p: Partial<Chatbot>) => commit({ ...draft, ...p });

  return (
    <Modal onClose={onClose} eyebrow={"EDITING · " + draft.channel.toUpperCase()} title={draft.name} subtitle={draft.purpose ?? "Fine-tune this chatbot."} wide>
      <div className="-mx-6 mt-1 flex gap-1 overflow-x-auto border-b border-border px-6 pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={"whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors " +
              (tab === t.id ? "bg-navy text-white" : "text-muted-foreground hover:text-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "overview" && <OverviewTab bot={draft} onChange={patch} />}
        {tab === "features" && <FeaturesTab bot={draft} onChange={patch} />}
        {tab === "media" && <MediaTab bot={draft} onChange={patch} />}
        {tab === "connectors" && <ConnectorsTab bot={draft} onChange={patch} />}
        {tab === "guardrails" && <GuardrailsTab bot={draft} onChange={patch} />}
        {tab === "test" && <TestTab bot={draft} onChange={patch} />}
        {tab === "training" && <TrainingTab bot={draft} onChange={patch} />}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <div className="text-[11px] text-muted-foreground">
          {dirty ? "Saving as you edit…" : "All changes saved."}
        </div>
        <div className="flex gap-2">
          <SecondaryButton onClick={onClose}>Close</SecondaryButton>
          {draft.status === "draft"
            ? <PrimaryButton onClick={() => { commit({ ...draft, status: "live" }); onClose(); }}>Publish</PrimaryButton>
            : <PrimaryButton onClick={() => { commit({ ...draft, status: "draft" }); }}>Move to draft</PrimaryButton>}
        </div>
      </div>
    </Modal>
  );
}

function OverviewTab({ bot, onChange }: { bot: Chatbot; onChange: (p: Partial<Chatbot>) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name">
        <input value={bot.name} onChange={(e) => onChange({ name: e.target.value })}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
      </Field>
      <Field label="Channel">
        <select value={bot.channel} onChange={(e) => onChange({ channel: e.target.value })}
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy">
          {["LINE","WhatsApp","Instagram","Facebook"].map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Purpose" className="sm:col-span-2">
        <textarea rows={2} value={bot.purpose ?? ""} onChange={(e) => onChange({ purpose: e.target.value })}
          placeholder="What should this chatbot do?"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
      </Field>
      <Field label="Persona / tone" className="sm:col-span-2">
        <input value={bot.persona ?? ""} onChange={(e) => onChange({ persona: e.target.value })}
          placeholder="e.g. warm and concise, uses light Thai greetings"
          className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
      </Field>
    </div>
  );
}

function FeaturesTab({ bot, onChange }: { bot: Chatbot; onChange: (p: Partial<Chatbot>) => void }) {
  const toggle = (id: string) => onChange({
    features: bot.features.includes(id) ? bot.features.filter((x) => x !== id) : [...bot.features, id],
  });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {FEATURE_CATALOG.map((f) => {
        const on = bot.features.includes(f.id);
        const Icon = FEATURE_ICON[f.id] ?? Sparkles;
        return (
          <button key={f.id} onClick={() => toggle(f.id)}
            className={"flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors " +
              (on ? "border-navy bg-accent/60" : "border-border bg-card hover:bg-accent/30")}>
            <div className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " + (on ? "bg-navy text-white" : "bg-muted text-foreground")}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{f.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{f.blurb}</div>
            </div>
            <div className={"ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " + (on ? "bg-navy text-white" : "bg-muted text-muted-foreground")}>{on ? "ON" : "OFF"}</div>
          </button>
        );
      })}
    </div>
  );
}

function MediaTab({ bot, onChange }: { bot: Chatbot; onChange: (p: Partial<Chatbot>) => void }) {
  const toggle = (m: MediaKind) => onChange({
    mediaSupport: bot.mediaSupport.includes(m) ? bot.mediaSupport.filter((x) => x !== m) : [...bot.mediaSupport, m],
  });
  return (
    <div>
      <p className="text-xs text-muted-foreground">Choose the message types this chatbot can send and receive.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {MEDIA_CATALOG.map((m) => {
          const on = bot.mediaSupport.includes(m);
          return (
            <button key={m} onClick={() => toggle(m)}
              className={"rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors " +
                (on ? "border-navy bg-navy text-white" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
              {m}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConnectorsTab({ bot, onChange }: { bot: Chatbot; onChange: (p: Partial<Chatbot>) => void }) {
  const toggle = (id: string) => onChange({
    connectors: bot.connectors.includes(id) ? bot.connectors.filter((x) => x !== id) : [...bot.connectors, id],
  });
  return (
    <div>
      <p className="text-xs text-muted-foreground">Attach channels or data sources so this bot can respond with real business data.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {CONNECTORS.map((c) => {
          const on = bot.connectors.includes(c.id);
          return (
            <button key={c.id} onClick={() => toggle(c.id)}
              className={"flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm " +
                (on ? "border-navy bg-accent/60" : "border-border bg-card hover:bg-accent/30")}>
              <span className="font-medium">{c.name}</span>
              <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + (on ? "bg-navy text-white" : "bg-muted text-muted-foreground")}>{on ? "Connected" : "Attach"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ListEditor({ items, onChange, placeholder, empty }: { items: string[]; onChange: (n: string[]) => void; placeholder: string; empty: string }) {
  const [v, setV] = useState("");
  const add = () => { if (v.trim()) { onChange([...items, v.trim()]); setV(""); } };
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="space-y-1.5">
        {items.length === 0 && <div className="text-xs text-muted-foreground">{empty}</div>}
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg bg-accent/40 px-2.5 py-1.5">
            <span className="flex-1 text-sm text-foreground">{it}</span>
            <button onClick={() => onChange(items.filter((_, x) => x !== i))} className="text-muted-foreground hover:text-status-red"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-navy" />
        <button onClick={add} className="rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white">Add</button>
      </div>
    </div>
  );
}

function GuardrailsTab({ bot, onChange }: { bot: Chatbot; onChange: (p: Partial<Chatbot>) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">BUSINESS LOGIC</div>
        <p className="mt-1 text-xs text-muted-foreground">Rules the bot follows when it decides.</p>
        <div className="mt-2">
          <ListEditor items={bot.businessLogic} onChange={(n) => onChange({ businessLogic: n })}
            placeholder="Delivery is free inside Bangkok over ฿500…"
            empty="No business logic yet. Add rules like pricing tiers or delivery policies." />
        </div>
      </div>
      <div>
        <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">GUARDRAILS</div>
        <p className="mt-1 text-xs text-muted-foreground">Lines the bot will never cross.</p>
        <div className="mt-2">
          <ListEditor items={bot.guardrails} onChange={(n) => onChange({ guardrails: n })}
            placeholder="Never quote wholesale prices…"
            empty="No guardrails yet. Add things this bot must never do." />
        </div>
      </div>
    </div>
  );
}

function TestTab({ bot, onChange }: { bot: Chatbot; onChange: (p: Partial<Chatbot>) => void }) {
  const [text, setText] = useState("");
  const messages = bot.testMessages ?? [];

  const send = () => {
    const clean = text.trim();
    if (!clean) return;
    const user: Msg = { id: uid(), role: "user", text: clean, at: Date.now() };
    const reply: Msg = { id: uid(), role: "assistant", text: mockBotReply(bot, clean), at: Date.now() + 1 };
    onChange({ testMessages: [...messages, user, reply] });
    setText("");
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground">Chat with your bot the way a customer would. Anything it says wrong, tell it — every correction improves it.</p>
      <div className="mt-3 h-72 overflow-y-auto rounded-xl border border-border bg-background p-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            <div className="text-center">
              <Bot className="mx-auto h-6 w-6 text-muted-foreground" />
              <div className="mt-2">Try: "Do you deliver to Ari?" or "Book a table for 4 at 7pm"</div>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {messages.map((m) => m.role === "user" ? (
            <div key={m.id} className="flex justify-end"><div className="max-w-[80%] rounded-2xl bg-navy px-3 py-2 text-sm text-white">{m.text}</div></div>
          ) : (
            <div key={m.id} className="flex gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-white"><Bot className="h-3.5 w-3.5" /></div>
              <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl border border-border bg-card px-3 py-2 text-sm">{m.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-border bg-card p-1.5">
        <MessageSquare className="ml-2 h-4 w-4 text-muted-foreground" />
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), send())}
          placeholder={`Chat with ${bot.name}…`}
          className="flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground" />
        <button onClick={send} disabled={!text.trim()} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
      </div>
      {messages.length > 0 && (
        <button onClick={() => onChange({ testMessages: [] })} className="mt-2 text-[11px] text-muted-foreground hover:text-foreground">Clear conversation</button>
      )}
    </div>
  );
}

function TrainingTab({ bot, onChange }: { bot: Chatbot; onChange: (p: Partial<Chatbot>) => void }) {
  const samples = bot.trainingSamples ?? [];
  const [persona, setPersona] = useState<TrainingSample["persona"]>("VIP");
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    onChange({ trainingSamples: [{ id: uid(), persona, sample: text.trim() }, ...samples] });
    setText("");
  };
  const remove = (id: string) => onChange({ trainingSamples: samples.filter((s) => s.id !== id) });

  const tagCls: Record<TrainingSample["persona"], string> = {
    VIP: "bg-status-green-soft text-status-green",
    Regular: "bg-status-blue-soft text-brand-blue",
    New: "bg-status-amber-soft text-status-amber",
    "At risk": "bg-status-red-soft text-status-red",
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground">Give the bot examples of how to talk to each type of customer. It uses these plus your Semantic Layer to reply in your voice.</p>

      <div className="mt-3 rounded-xl border border-border bg-card p-3">
        <div className="flex gap-2">
          <select value={persona} onChange={(e) => setPersona(e.target.value as TrainingSample["persona"])}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none">
            {(["VIP","Regular","New","At risk"] as const).map((p) => <option key={p}>{p}</option>)}
          </select>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="e.g. Khun Ploy (VIP) asks about new arrivals — reply warmly and offer to hold the item."
            className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-navy" />
          <button onClick={add} className="rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-white">Add sample</button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {samples.length === 0 && <div className="rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">No training samples yet.</div>}
        {samples.map((s) => (
          <div key={s.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
            <span className={"inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold " + tagCls[s.persona]}>{s.persona}</span>
            <div className="min-w-0 flex-1 text-sm text-foreground">{s.sample}</div>
            <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-status-red"><X className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------- Bits --------------

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={"block " + (className ?? "")}>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Modal({ children, onClose, title, eyebrow, subtitle, wide }: { children: React.ReactNode; onClose: () => void; title: string; eyebrow: string; subtitle?: string; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className={"max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl " + (wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">{eyebrow}</div>
            <h2 className="mt-1 truncate text-xl font-bold">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function mockBotReply(bot: Chatbot, text: string): string {
  const t = text.toLowerCase();
  if (/hi|hello|hey|สวัสดี/.test(t)) return `Hi! I'm ${bot.name}. How can I help today?`;
  if (/hours|open|close/.test(t))    return "We're open 10:00–21:00 every day (Bangkok time). Want me to remind you before closing?";
  if (/deliver|shipping|ari|bangkok/.test(t)) {
    if (bot.businessLogic.some((r) => /free/i.test(r) && /bangkok/i.test(r))) return "Yes — inside Bangkok, delivery is free over ฿500. Outside is ฿60 flat. Want me to check your area?";
    return "Yes, we deliver across Bangkok. What's your address?";
  }
  if (/book|reserve|table|meeting/.test(t)) {
    if (bot.features.includes("booking")) return "Sure — I can hold a table. What date & time, and how many people?";
    return "Booking isn't switched on for me yet — I'll pass this to the team.";
  }
  if (/coupon|discount|promo/.test(t)) {
    if (bot.features.includes("coupons")) return "I've got you — here's a 10% off code just for you: MG-WELCOME10. Valid this week.";
    return "No active coupons right now, but I can put you on the waitlist for the next promo.";
  }
  if (/price|wholesale|supplier/.test(t) && bot.guardrails.some((g) => /wholesale|supplier/i.test(g))) {
    return "I can't share wholesale or supplier details — but I'd love to help with retail prices or availability.";
  }
  if (/quiz|game|spin|roulette/.test(t) && (bot.features.includes("quiz") || bot.features.includes("roulette"))) {
    return "Fancy a quick spin? 🎯 3 questions and you might win a prize.";
  }
  return `Got it. I'll answer using what I know${bot.connectors.length ? ` from ${bot.connectors.join(", ")}` : ""}. Anything specific you want me to check?`;
}