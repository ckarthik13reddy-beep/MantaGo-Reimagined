import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Send, X, Plus } from "lucide-react";
import { PageContainer, PageHeader, PrimaryButton, SecondaryButton } from "../components/PageHeader";
import { useStore, uid, type Chatbot } from "../lib/mockStore";

export const Route = createFileRoute("/chatbots")({
  head: () => ({
    meta: [
      { title: "Chatbots — MantaGO" },
      { name: "description", content: "Manage the chatbots that reply to your customers across every channel." },
    ],
  }),
  component: ChatbotsPage,
});

function StatusPill({ status }: { status: Chatbot["status"] }) {
  const cls = status === "live"
    ? "bg-status-green-soft text-status-green"
    : "bg-status-amber-soft text-status-amber";
  return <span className={"inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize " + cls}>{status}</span>;
}

function BotRow({ bot, onDelete, onPublish }: { bot: Chatbot; onDelete: () => void; onPublish: () => void }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-accent/40">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground">{bot.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">{bot.channel}{bot.createdFromChat ? " · created from a chat" : ""}</div>
        </div>
        <StatusPill status={bot.status} />
        <ChevronDown className={"h-4 w-4 text-muted-foreground transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div className="border-t border-border bg-accent/30 px-6 py-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">WHAT IT KNOWS</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bot.knows.map((t) => (
                  <span key={t} className="inline-flex rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">WHAT IT WON&apos;T DO</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {bot.wont.map((t) => (
                  <span key={t} className="inline-flex rounded-full bg-status-red-soft px-2.5 py-1 text-xs text-status-red">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); setMsg(""); }} className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-card p-1.5">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={`Change how ${bot.name} behaves…`} className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
            <button type="submit" disabled={!msg.trim()} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy text-white disabled:opacity-40" aria-label="Send"><Send className="h-4 w-4" /></button>
          </form>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <SecondaryButton onClick={onDelete}>Delete</SecondaryButton>
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

  const del = (id: string) => setStore((s) => ({ ...s, chatbots: s.chatbots.filter((b) => b.id !== id) }));
  const publish = (id: string) => setStore((s) => ({ ...s, chatbots: s.chatbots.map((b) => b.id === id ? { ...b, status: "live" } : b) }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="YOUR BOTS"
        title="Chatbots"
        description="Every automated conversation running for your business, in one place."
        actions={<PrimaryButton onClick={() => setMaker(true)}><Plus className="mr-1 -ml-0.5 inline h-4 w-4" />New chatbot</PrimaryButton>}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {store.chatbots.map((b, i) => (
          <div key={b.id} className={i > 0 ? "border-t border-border" : ""}>
            <BotRow bot={b} onDelete={() => del(b.id)} onPublish={() => publish(b.id)} />
          </div>
        ))}
        {store.chatbots.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">No chatbots yet. Make one to get started.</div>}
      </div>

      {maker && <ChatbotMaker onClose={() => setMaker(false)} onCreate={(bot) => {
        setStore((s) => ({ ...s, chatbots: [bot, ...s.chatbots] }));
        setMaker(false);
      }} />}
    </PageContainer>
  );
}

function ChatbotMaker({ onClose, onCreate }: { onClose: () => void; onCreate: (b: Chatbot) => void }) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("LINE");
  const [knows, setKnows] = useState("Opening hours, Menu & prices, Delivery zones");
  const [wont, setWont] = useState("Take payments, Discuss staff details");
  const [describe, setDescribe] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onCreate({
      id: uid(),
      name: name.trim(),
      channel,
      status: "draft",
      knows: knows.split(",").map((s) => s.trim()).filter(Boolean),
      wont: wont.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">NEW CHATBOT</div>
            <h2 className="mt-1 text-xl font-bold">Chatbot maker</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Describe your bot in plain language, or fill the details manually.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">Describe it in one sentence</label>
            <textarea value={describe} onChange={(e) => { setDescribe(e.target.value); if (!name && e.target.value) setName(e.target.value.slice(0, 40)); }} rows={2}
              placeholder="e.g. Reply to café customers on LINE about hours, menu and reservations."
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Café front-of-house" className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Channel</label>
              <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy">
                {["LINE","WhatsApp","Instagram","Facebook"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">What it knows (comma separated)</label>
            <input value={knows} onChange={(e) => setKnows(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">What it won&apos;t do</label>
            <input value={wont} onChange={(e) => setWont(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton onClick={submit}>Create draft</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
