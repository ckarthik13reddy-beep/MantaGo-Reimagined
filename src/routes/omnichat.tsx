import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, useEffect } from "react";
import { Search, Send, Filter, Phone, Star, Archive, CheckCheck } from "lucide-react";

export const Route = createFileRoute("/omnichat")({
  head: () => ({
    meta: [
      { title: "Omnichat — MantaGO" },
      { name: "description", content: "One inbox for LINE, WhatsApp, Instagram and Facebook customer conversations." },
    ],
  }),
  component: OmnichatPage,
});

type Channel = "LINE" | "WhatsApp" | "Instagram" | "Facebook";
type ChatMsg = { id: string; from: "them" | "me"; text: string; at: string };
type Thread = {
  id: string;
  name: string;
  channel: Channel;
  avatar: string;
  lastAt: string;
  unread: number;
  tag?: "VIP" | "New" | "At risk";
  starred?: boolean;
  messages: ChatMsg[];
};

const THREADS: Thread[] = [
  {
    id: "t1", name: "Ploy S.", channel: "LINE", avatar: "P", lastAt: "2m", unread: 2, tag: "VIP", starred: true,
    messages: [
      { id: "1", from: "them", text: "Hi! Do you still have the matcha cheesecake today?", at: "10:12" },
      { id: "2", from: "me",   text: "Yes we do 💚 last 4 slices. Want me to hold one for you?", at: "10:13" },
      { id: "3", from: "them", text: "Please hold 2. I'll come by at 3pm 🙏", at: "10:14" },
      { id: "4", from: "them", text: "And can I also add a latte to the order?", at: "10:14" },
    ],
  },
  {
    id: "t2", name: "Nan K.", channel: "WhatsApp", avatar: "N", lastAt: "18m", unread: 1, tag: "New",
    messages: [
      { id: "1", from: "them", text: "Do you deliver to Ari?", at: "09:41" },
      { id: "2", from: "me",   text: "Yes! Free delivery over ฿500 in Bangkok.", at: "09:44" },
      { id: "3", from: "them", text: "Perfect. Sending my address now.", at: "09:55" },
    ],
  },
  {
    id: "t3", name: "@arisa.mint", channel: "Instagram", avatar: "A", lastAt: "1h", unread: 0,
    messages: [
      { id: "1", from: "them", text: "Loved the reel 🌸 what beans do you use?", at: "Yesterday" },
      { id: "2", from: "me",   text: "Thank you! We use a Doi Chang single-origin, roasted in-house.", at: "Yesterday" },
    ],
  },
  {
    id: "t4", name: "Somchai P.", channel: "Facebook", avatar: "S", lastAt: "3h", unread: 0, tag: "At risk",
    messages: [
      { id: "1", from: "them", text: "Haven't been by in a while, are you open Sundays now?", at: "07:20" },
      { id: "2", from: "me",   text: "We are — 9am to 6pm every Sunday. Come say hi ☕", at: "07:31" },
    ],
  },
  {
    id: "t5", name: "Mint T.", channel: "LINE", avatar: "M", lastAt: "6h", unread: 0,
    messages: [
      { id: "1", from: "them", text: "Booking for 4 this Friday 7pm please 🙏", at: "Yesterday" },
      { id: "2", from: "me",   text: "Booked! See you Friday.", at: "Yesterday" },
    ],
  },
  {
    id: "t6", name: "Kritsada W.", channel: "WhatsApp", avatar: "K", lastAt: "1d", unread: 0, tag: "VIP",
    messages: [
      { id: "1", from: "them", text: "Order #1284 arrived — thank you!", at: "Mon" },
      { id: "2", from: "me",   text: "So glad 🙏 See you next week for the tasting?", at: "Mon" },
    ],
  },
  {
    id: "t7", name: "@bua.petch", channel: "Instagram", avatar: "B", lastAt: "1d", unread: 0,
    messages: [
      { id: "1", from: "them", text: "Do you ship to Chiang Mai?", at: "Mon" },
      { id: "2", from: "me",   text: "Yes — 2 to 3 days via Kerry.", at: "Mon" },
    ],
  },
  {
    id: "t8", name: "Nam C.", channel: "Facebook", avatar: "N", lastAt: "2d", unread: 0, tag: "New",
    messages: [
      { id: "1", from: "them", text: "Saw your Songkran post — can I book the whole café?", at: "Sun" },
    ],
  },
];

const CHANNELS: (Channel | "All")[] = ["All", "LINE", "WhatsApp", "Instagram", "Facebook"];

const channelClass: Record<Channel, string> = {
  LINE: "bg-status-green-soft text-status-green",
  WhatsApp: "bg-status-green-soft text-status-green",
  Instagram: "bg-status-red-soft text-status-red",
  Facebook: "bg-status-blue-soft text-status-blue",
};

const tagClass: Record<NonNullable<Thread["tag"]>, string> = {
  VIP: "bg-status-amber text-white",
  New: "bg-status-blue text-white",
  "At risk": "bg-status-red text-white",
};

function OmnichatPage() {
  const [threads, setThreads] = useState<Thread[]>(THREADS);
  const [activeId, setActiveId] = useState<string>(THREADS[0].id);
  const [filter, setFilter] = useState<Channel | "All">("All");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (filter !== "All" && t.channel !== filter) return false;
      if (q && !(t.name.toLowerCase().includes(q.toLowerCase()) ||
                 t.messages.some((m) => m.text.toLowerCase().includes(q.toLowerCase())))) return false;
      return true;
    });
  }, [threads, filter, q]);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [active?.messages.length, activeId]);

  useEffect(() => {
    if (!active) return;
    if (active.unread > 0) {
      setThreads((ts) => ts.map((t) => t.id === active.id ? { ...t, unread: 0 } : t));
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    const text = draft.trim();
    if (!text || !active) return;
    const msg: ChatMsg = { id: String(Date.now()), from: "me", text, at: "now" };
    setThreads((ts) => ts.map((t) => t.id === active.id ? { ...t, messages: [...t.messages, msg], lastAt: "now" } : t));
    setDraft("");
  };

  const toggleStar = () => {
    if (!active) return;
    setThreads((ts) => ts.map((t) => t.id === active.id ? { ...t, starred: !t.starred } : t));
  };

  const unreadTotal = threads.reduce((n, t) => n + t.unread, 0);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col lg:h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-8">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">OMNICHAT</div>
          <div className="mt-0.5 truncate text-sm font-bold text-foreground">
            Unified inbox · {unreadTotal} unread across {threads.length} conversations
          </div>
        </div>
        <div className="hidden gap-2 md:flex">
          {CHANNELS.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                (filter === c ? "border-navy bg-navy text-white" : "border-border bg-card text-muted-foreground hover:bg-accent")
              }>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Thread list */}
        <div className="hidden w-80 shrink-0 flex-col border-r border-border bg-card md:flex">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers or messages…"
                className="w-full rounded-full border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-navy" />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground md:hidden">
              <Filter className="h-3 w-3" /> Filter:
              <select value={filter} onChange={(e) => setFilter(e.target.value as Channel | "All")}
                className="rounded-md border border-border bg-background px-1.5 py-0.5">
                {CHANNELS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">No conversations match.</div>
            )}
            {filtered.map((t) => {
              const last = t.messages[t.messages.length - 1];
              const isActive = t.id === activeId;
              return (
                <button key={t.id} onClick={() => setActiveId(t.id)}
                  className={
                    "flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors " +
                    (isActive ? "bg-accent" : "hover:bg-accent/60")
                  }>
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                      {t.avatar}
                    </div>
                    <span className={"absolute -bottom-0.5 -right-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold " + channelClass[t.channel]}>
                      {t.channel[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="truncate text-sm font-semibold text-foreground">{t.name}</div>
                      {t.starred && <Star className="h-3 w-3 fill-status-amber text-status-amber" />}
                      <div className="ml-auto text-[10px] text-muted-foreground">{t.lastAt}</div>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">{t.channel}</span>
                      {t.tag && <span className={"rounded-full px-1.5 py-0.5 text-[9px] font-semibold " + tagClass[t.tag]}>{t.tag}</span>}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="truncate text-xs text-muted-foreground">
                        {last.from === "me" && <CheckCheck className="mr-1 inline h-3 w-3 text-status-blue" />}
                        {last.text}
                      </div>
                      {t.unread > 0 && (
                        <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-status-red px-1 text-[10px] font-bold text-white">
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          {active ? (
            <>
              <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{active.avatar}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-bold text-foreground">{active.name}</div>
                    <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + channelClass[active.channel]}>{active.channel}</span>
                    {active.tag && <span className={"rounded-full px-2 py-0.5 text-[10px] font-semibold " + tagClass[active.tag]}>{active.tag}</span>}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Last active {active.lastAt} ago</div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <button onClick={toggleStar} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent" aria-label="Star">
                    <Star className={"h-4 w-4 " + (active.starred ? "fill-status-amber text-status-amber" : "text-muted-foreground")} />
                  </button>
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent" aria-label="Call">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent" aria-label="Archive">
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
                <div className="mx-auto flex max-w-2xl flex-col gap-3">
                  {active.messages.map((m) => (
                    <div key={m.id} className={"flex " + (m.from === "me" ? "justify-end" : "justify-start")}>
                      <div className={
                        "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm " +
                        (m.from === "me" ? "bg-navy text-white" : "bg-card border border-border text-foreground")
                      }>
                        <div>{m.text}</div>
                        <div className={"mt-1 text-[10px] " + (m.from === "me" ? "text-white/60" : "text-muted-foreground")}>{m.at}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border bg-background px-4 py-3 md:px-8">
                <div className="mx-auto max-w-2xl">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {["Thanks for reaching out! 🙏", "Sorry for the delay —", "We're open 9am–8pm today.", "Let me check and get back to you."].map((q) => (
                      <button key={q} onClick={() => setDraft(q)}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground">
                        {q}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2">
                    <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      rows={1} placeholder={`Reply to ${active.name} on ${active.channel}…`}
                      className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground" />
                    <button type="submit" disabled={!draft.trim()}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white disabled:opacity-40" aria-label="Send">
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Pick a conversation.</div>
          )}
        </div>
      </div>
    </div>
  );
}
