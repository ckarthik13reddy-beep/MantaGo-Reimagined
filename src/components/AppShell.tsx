import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  MessageSquare,
  Bot,
  LayoutGrid,
  Plug,
  Sparkles,
  Settings as SettingsIcon,
  Menu,
  X,
  History,
  Search,
  UsersRound,
} from "lucide-react";
import { useStore } from "../lib/mockStore";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: { count: number; tone: "red" | "amber" | "blue" | "green" };
};

const WORKSPACE: NavItem[] = [
  { to: "/", label: "Chat", icon: MessageSquare, badge: { count: 3, tone: "red" } },
  { to: "/omnichat", label: "OmniChat", icon: Search, badge: { count: 4, tone: "green" } },
  { to: "/chatbots", label: "Chatbots", icon: Bot },
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, badge: { count: 12, tone: "blue" } },
  { to: "/users", label: "Customers", icon: UsersRound },
];
const TOOLS: NavItem[] = [
  { to: "/connectors", label: "Data connectors", icon: Plug },
  { to: "/agents", label: "Custom agents", icon: Sparkles, badge: { count: 2, tone: "amber" } },
];
const SETTINGS: NavItem[] = [
  { to: "/settings", label: "Account settings", icon: SettingsIcon },
];

const toneClass: Record<string, string> = {
  red: "bg-status-red text-white",
  amber: "bg-status-amber text-white",
  blue: "bg-brand-blue text-white",
  green: "bg-status-green text-white",
};

function NavGroup({ label, items, pathname, onNavigate }: {
  label: string; items: NavItem[]; pathname: string; onNavigate?: () => void;
}) {
  return (
    <div className="px-3">
      <div className="px-3 pb-2 pt-4 text-[10px] font-semibold tracking-[0.16em] text-sidebar-muted">
        {label}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={
                "group flex items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors " +
                (active ? "bg-navy-hover text-white" : "text-sidebar-muted hover:bg-navy-hover/60 hover:text-white")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className={"inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold " + toneClass[item.badge.tone]}>
                  {item.badge.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function HistoryButton({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [store] = useStore();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const sorted = [...store.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const shown = q
    ? sorted.filter((c) =>
        c.title.toLowerCase().includes(q.toLowerCase()) ||
        c.messages.some((m) => m.text.toLowerCase().includes(q.toLowerCase()))
      ).slice(0, 8)
    : sorted.slice(0, 5);

  const go = (id: string) => {
    setOpen(false);
    onNavigate?.();
    navigate({ to: "/", search: { c: id } as never });
  };

  return (
    <div className="px-3" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          "flex w-full items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors " +
          (open ? "bg-navy-hover text-white" : "text-sidebar-muted hover:bg-navy-hover/60 hover:text-white")
        }
      >
        <History className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">History</span>
      </button>
      {open && (
        <div className="mt-2 rounded-2xl bg-navy-hover/70 p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-muted" />
            <input
              autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search past chats…"
              className="w-full rounded-full bg-[#0F1524] py-2 pl-8 pr-3 text-xs text-white placeholder:text-sidebar-muted outline-none"
            />
          </div>
          <div className="mt-2 flex flex-col gap-0.5">
            {shown.length === 0 && <div className="px-3 py-2 text-[11px] text-sidebar-muted">No matches.</div>}
            {shown.map((c) => (
              <button
                key={c.id} onClick={() => go(c.id)}
                className="rounded-lg px-3 py-1.5 text-left text-xs text-sidebar-muted hover:bg-navy-hover hover:text-white"
              >
                <div className="truncate text-white">{c.title}</div>
                <div className="mt-0.5 text-[10px] text-sidebar-muted">{timeAgo(c.updatedAt)}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col bg-[#0F1524] text-white">
      <div className="flex items-center gap-3 px-6 pb-4 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-navy font-bold">M</div>
        <div className="min-w-0">
          <div className="text-[15px] font-bold leading-tight">MantaGO</div>
          <div className="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-sidebar-muted">BUSINESS ASSISTANT</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto pb-4">
        <NavGroup label="WORKSPACE" items={WORKSPACE} pathname={pathname} onNavigate={onNavigate} />
        <div className="mt-1"><HistoryButton onNavigate={onNavigate} /></div>
        <NavGroup label="TOOLS" items={TOOLS} pathname={pathname} onNavigate={onNavigate} />
        <NavGroup label="SETTINGS" items={SETTINGS} pathname={pathname} onNavigate={onNavigate} />
      </nav>

      <div className="px-4 pb-5">
        <div className="rounded-2xl bg-navy-hover px-4 py-3">
          <div className="text-[10px] font-semibold tracking-[0.16em] text-sidebar-muted">ACTIVE WORKSPACE</div>
          <div className="mt-1 text-sm font-bold text-white">Siam Bloom Café</div>
          <div className="mt-0.5 text-xs text-sidebar-muted">LINE, Instagram &amp; WhatsApp connected</div>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <div className="hidden lg:flex"><Sidebar /></div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10"><Sidebar onNavigate={() => setMobileOpen(false)} /></div>
        </div>
      )}

      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen((v) => !v)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="text-sm font-bold">MantaGO</div>
        </div>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
