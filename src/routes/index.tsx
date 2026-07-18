import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Plus, Bot, Bookmark, Plug, ChevronDown, Check, Sparkles } from "lucide-react";
import { useStore, uid, type Msg, type Conversation } from "../lib/mockStore";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chat — MantaGO" },
      { name: "description", content: "Tell MantaGO what to do in plain language. No menus, no setup." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ c: typeof s.c === "string" ? s.c : undefined }),
  component: ChatPage,
});

const CONNECTORS = [
  { id: "line", name: "LINE", tasks: ["Broadcast a promo to LINE", "Reply to unread LINE chats", "Set LINE auto-reply hours"] },
  { id: "instagram", name: "Instagram", tasks: ["Draft captions for latest posts", "Reply to Instagram DMs", "Find top-engaging followers"] },
  { id: "whatsapp", name: "WhatsApp", tasks: ["Send order confirmations", "Broadcast to WhatsApp list", "Handle after-hours WA replies"] },
  { id: "shopify", name: "Shopify", tasks: ["Show today's orders", "Nudge abandoned carts", "Restock alert for low SKUs"] },
  { id: "sheets", name: "Google Sheets", tasks: ["Log this week's bookings", "Export new leads to Sheets"] },
];

const SUGGESTIONS = [
  "Send a 10% off coupon to my regulars",
  "Write a Songkran promo for LINE",
  "Show customers I haven't replied to yet",
  "Set up an auto-reply for opening hours",
];

function ChatPage() {
  const [store, setStore] = useStore();
  const { c: routeC } = Route.useSearch();
  const navigate = useNavigate();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [attached, setAttached] = useState<string | null>(null);
  const [showConn, setShowConn] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  useEffect(() => {
    if (routeC && store.conversations.some((c) => c.id === routeC)) setActiveId(routeC);
  }, [routeC, store.conversations]);

  const active: Conversation | null = useMemo(
    () => (activeId ? store.conversations.find((c) => c.id === activeId) ?? null : null),
    [store.conversations, activeId],
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, thinking]);

  const newChat = () => {
    setActiveId(null); setValue(""); setAttached(null); setSavedNote(null);
    navigate({ to: "/", search: {} as never });
  };

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const now = Date.now();
    const userMsg: Msg = { id: uid(), role: "user", text: clean, connector: attached ?? undefined, at: now };
    let id = activeId;
    setStore((s) => {
      let convos = s.conversations;
      if (!id) {
        id = uid();
        const title = clean.length > 42 ? clean.slice(0, 42) + "…" : clean;
        convos = [{ id, title, updatedAt: now, messages: [userMsg] }, ...convos];
      } else {
        convos = convos.map((c) => c.id === id ? { ...c, updatedAt: now, messages: [...c.messages, userMsg] } : c);
      }
      return { ...s, conversations: convos };
    });
    setActiveId(id!);
    setValue("");
    setThinking(true);

    setTimeout(() => {
      const reply = mockReply(clean, attached);
      const asst: Msg = { id: uid(), role: "assistant", text: reply, connector: attached ?? undefined, at: Date.now() };
      setStore((s) => ({
        ...s,
        conversations: s.conversations.map((c) => c.id === id ? { ...c, updatedAt: Date.now(), messages: [...c.messages, asst] } : c),
      }));
      setThinking(false);
      setAttached(null);
    }, 900);
  };

  const saveAsChatbot = (msg: Msg) => {
    const name = "Chatbot from chat · " + new Date().toLocaleDateString();
    setStore((s) => ({
      ...s,
      chatbots: [
        {
          id: uid(),
          name,
          channel: attached ?? msg.connector ?? "LINE",
          status: "draft",
          knows: [msg.text.slice(0, 60)],
          wont: ["Anything outside my rules"],
          createdFromChat: true,
        },
        ...s.chatbots,
      ],
    }));
    setSavedNote("Saved as a new chatbot draft. Open Chatbots to publish it.");
    setTimeout(() => setSavedNote(null), 3200);
  };

  const attachedConn = CONNECTORS.find((c) => c.id === attached);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-8">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">MANTAGO ASSISTANT</div>
          <div className="mt-0.5 truncate text-sm font-bold text-foreground">
            {active ? active.title : "New conversation"}
          </div>
        </div>
        <button onClick={newChat} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">
          <Plus className="h-3.5 w-3.5" /> New chat
        </button>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
          {!active ? (
            <div className="pt-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">What are we getting done today?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Describe what you want and MantaGO handles it — reply to customers, run a promo, or check on your business.</p>
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setValue(s)} className="rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-navy hover:bg-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {active.messages.map((m) => (
                <MessageBubble key={m.id} msg={m} onSave={() => saveAsChatbot(m)} />
              ))}
              {thinking && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-white"><Bot className="h-4 w-4" /></div>
                  <div className="flex items-center gap-1 pt-2">
                    <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background px-4 pb-6 pt-4 md:px-8">
        <div className="mx-auto w-full max-w-3xl">
          {savedNote && (
            <div className="mb-2 rounded-lg border border-status-green-soft bg-status-green-soft/60 px-3 py-2 text-xs text-status-green">{savedNote}</div>
          )}
          {attachedConn && (
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-accent/40 px-3 py-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-semibold text-white">
                <Plug className="h-3 w-3" /> {attachedConn.name}
              </span>
              <span className="text-[11px] text-muted-foreground">Quick tasks:</span>
              {attachedConn.tasks.map((t) => (
                <button key={t} onClick={() => setValue(t)} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] hover:bg-accent">{t}</button>
              ))}
              <button onClick={() => setAttached(null)} className="ml-auto text-[11px] text-muted-foreground hover:text-foreground">Remove</button>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); send(value); }} className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
            <div className="relative">
              <button type="button" onClick={() => setShowConn((v) => !v)} className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-background px-2 text-xs font-medium hover:bg-accent">
                <Plug className="h-3.5 w-3.5" /> Connector <ChevronDown className="h-3 w-3" />
              </button>
              {showConn && (
                <div className="absolute bottom-full left-0 z-20 mb-2 w-64 rounded-xl border border-border bg-card p-1 shadow-lg">
                  {CONNECTORS.map((c) => (
                    <button key={c.id} type="button"
                      onClick={() => { setAttached(c.id); setShowConn(false); }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-accent">
                      <span className="font-medium">{c.name}</span>
                      {attached === c.id && <Check className="h-3 w-3 text-status-green" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <textarea
              value={value} onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(value); } }}
              rows={1} placeholder="Ask MantaGO anything about your business…"
              className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" disabled={!value.trim()} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white transition-opacity disabled:opacity-40" aria-label="Send">
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Guardrails from your Semantic Layer are active</span>
            <span>Enter to send · Shift+Enter for a new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onSave }: { msg: Msg; onSave: () => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-navy px-4 py-2.5 text-sm text-white">
          {msg.connector && <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/70">via {msg.connector}</div>}
          {msg.text}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-white"><Bot className="h-4 w-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground">{msg.text}</div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={onSave} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent">
            <Bookmark className="h-3 w-3" /> Save as chatbot
          </button>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: `${delay}s` }} />;
}

function mockReply(text: string, connector: string | null): string {
  const t = text.toLowerCase();
  if (connector === "line")     return "Drafted a LINE broadcast in your brand voice. It's ready in the LINE Official queue — approve to send to your 1,240 followers.";
  if (connector === "instagram")return "I pulled your latest 12 Instagram posts and drafted captions plus 4 reply templates for common DMs. Preview them in the Instagram inbox.";
  if (connector === "whatsapp") return "Set up the WhatsApp flow. New messages after 10pm will get an auto-reply and be queued for you in the morning.";
  if (connector === "shopify")  return "Today's Shopify: 18 orders, ฿12,430 in revenue, 3 carts abandoned. Want me to nudge those carts?";
  if (connector === "sheets")   return "Logged 7 new bookings into 'Reservations 2026'. I'll keep syncing as more come in.";
  if (t.includes("promo") || t.includes("coupon"))   return "Here's a warm Songkran promo:\n\n\"สุขสันต์วันสงกรานต์ 🌸 Enjoy 15% off your favourite drink this week — just show this message at the counter.\"\n\nWant me to send it to your 320 LINE regulars?";
  if (t.includes("hours") || t.includes("reply"))    return "Auto-reply is on for 10pm–8am (Bangkok). Anything urgent will still ping your personal LINE.";
  return "Got it. I've drafted an action plan — check the top of your inbox and approve to run it.";
}
