// Simple localStorage-backed mock store used across the prototype.
// Keeps chatbots, agents, semantic layer rules, and conversation history
// in-sync between routes without a real backend.
import { useEffect, useState } from "react";

export type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  connector?: string;
  action?: string;
  at: number;
  // Inline "chatbot draft" card rendered under an assistant message.
  draft?: ChatbotDraft;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  messages: Msg[];
};

export const FEATURE_CATALOG: { id: string; name: string; blurb: string }[] = [
  { id: "forms",        name: "Forms",              blurb: "Collect leads, orders, feedback." },
  { id: "linkTracking", name: "Link tracking",      blurb: "Short links with click stats." },
  { id: "booking",      name: "Booking & meetings", blurb: "Let customers pick a slot." },
  { id: "quiz",         name: "Short quizzes",      blurb: "Fun 3-question quizzes to qualify." },
  { id: "coupons",      name: "Coupon management",  blurb: "Issue and validate discount codes." },
  { id: "rewards",      name: "Reward cards",       blurb: "Digital stamp cards for regulars." },
  { id: "roulette",     name: "Roulette",           blurb: "Spin-to-win engagement game." },
  { id: "campaign",     name: "Campaign prize",     blurb: "Prize draws tied to a campaign." },
];

export const MEDIA_CATALOG = ["text","image","card","video","location","attachment","file","audio"] as const;
export type MediaKind = typeof MEDIA_CATALOG[number];

export type ChatbotMetrics = {
  formsSubmitted: number;
  linkClicks: number;
  meetingsBooked: number;
  quizCompleted: number;
  couponsRedeemed: number;
  rewardsIssued: number;
  rouletteSpins: number;
  campaignEntries: number;
};

export type TrainingSample = {
  id: string;
  persona: "VIP" | "Regular" | "New" | "At risk";
  sample: string;
};

export type Chatbot = {
  id: string;
  name: string;
  channel: string;
  status: "live" | "draft";
  knows: string[];
  wont: string[];
  createdFromChat?: boolean;
  purpose?: string;
  persona?: string;
  features: string[];
  mediaSupport: MediaKind[];
  connectors: string[];
  businessLogic: string[];
  guardrails: string[];
  testMessages?: Msg[];
  trainingSamples?: TrainingSample[];
  metrics?: ChatbotMetrics;
};

export type ChatbotDraft = {
  name: string;
  channel: string;
  purpose: string;
  features: string[];
  mediaSupport: MediaKind[];
  connectors: string[];
  guardrails: string[];
  saved?: boolean;
};

export type Agent = {
  id: string;
  name: string;
  description: string;
  autonomous: boolean;
  tag?: string;
};

export type Customer = {
  id: string;
  name: string;
  channel: "LINE" | "WhatsApp" | "Instagram" | "Facebook";
  city: string;
  spend: number;
  orders: number;
  lastSeen: string;
  tag: "VIP" | "Regular" | "New" | "At risk";
};

export type SemanticRule = {
  id: string;
  kind: "logic" | "guardrail";
  text: string;
};

const KEY = "mantago.v3";

type Store = {
  conversations: Conversation[];
  chatbots: Chatbot[];
  agents: Agent[];
  semantic: SemanticRule[];
  customers: Customer[];
};

function defaultMetrics(seed = 1): ChatbotMetrics {
  const r = (n: number) => Math.round(n * seed);
  return {
    formsSubmitted: r(184),
    linkClicks: r(1220),
    meetingsBooked: r(46),
    quizCompleted: r(312),
    couponsRedeemed: r(87),
    rewardsIssued: r(58),
    rouletteSpins: r(240),
    campaignEntries: r(410),
  };
}

const DEFAULT_TRAINING: TrainingSample[] = [
  { id: "t1", persona: "VIP",     sample: "Khun Ploy (VIP, ฿12k / 90d) — always asks for the new arrivals first. Reply warmly, offer to hold the item, mention free delivery." },
  { id: "t2", persona: "Regular", sample: "Khun Nan (Regular) — cares about opening hours and delivery windows. Keep answers short and factual." },
  { id: "t3", persona: "New",     sample: "First-time buyer — introduce the top 3 sellers, offer the 10% off welcome code, then ask for their delivery area." },
  { id: "t4", persona: "At risk", sample: "Khun Ton (At risk, no order in 45 days) — apologise for missing them, offer a small win-back coupon, ask what would bring them back." },
];

const DEFAULT: Store = {
  conversations: [
    { id: "c1", title: "Songkran promo for LINE",       updatedAt: Date.now() - 1000 * 60 * 30,      messages: seed("Write a Songkran promo for LINE") },
    { id: "c2", title: "Reply backlog from Instagram",  updatedAt: Date.now() - 1000 * 60 * 60 * 4,  messages: seed("Show customers I haven't replied to yet") },
    { id: "c3", title: "VIP win-back campaign",         updatedAt: Date.now() - 1000 * 60 * 60 * 26, messages: seed("Send a 10% off coupon to my regulars") },
    { id: "c4", title: "Opening hours auto-reply",      updatedAt: Date.now() - 1000 * 60 * 60 * 48, messages: seed("Set up an auto-reply for opening hours") },
    { id: "c5", title: "Weekly sales summary",          updatedAt: Date.now() - 1000 * 60 * 60 * 72, messages: seed("Summarise this week's sales") },
    { id: "c6", title: "Menu photos for IG",            updatedAt: Date.now() - 1000 * 60 * 60 * 120, messages: seed("Draft captions for our new menu photos") },
  ],
  chatbots: [
    {
      id: "1", name: "Café front-of-house", channel: "LINE", status: "live",
      knows: ["Opening hours", "Menu & prices", "Reservation policy", "Delivery zones"],
      wont: ["Take payments", "Discuss staff details"],
      purpose: "Answer LINE customers about the café: hours, menu, reservations and delivery.",
      persona: "Warm, concise, uses light Thai greetings.",
      features: ["forms","booking","coupons","rewards"],
      mediaSupport: ["text","image","card","location","file"],
      connectors: ["line","sheets"],
      businessLogic: ["Delivery is free inside Bangkok over ฿500.", "Reservations only between 11:00–21:00."],
      guardrails: ["Never quote wholesale prices.", "Don't confirm bookings without a name and phone."],
      trainingSamples: DEFAULT_TRAINING,
      metrics: defaultMetrics(1),
    },
    {
      id: "2", name: "Instagram DM helper", channel: "Instagram", status: "live",
      knows: ["New arrivals", "Sizing chart", "Return window"],
      wont: ["Share supplier names", "Give personal discounts"],
      purpose: "Handle Instagram DMs about products, sizing and returns.",
      persona: "Playful, uses emojis sparingly.",
      features: ["linkTracking","coupons","quiz","campaign"],
      mediaSupport: ["text","image","card","video","attachment"],
      connectors: ["instagram","shopify"],
      businessLogic: ["A VIP has spent > ฿5,000 in the last 90 days."],
      guardrails: ["No discounts above 15% without approval.", "Don't discuss competitors."],
      trainingSamples: DEFAULT_TRAINING,
      metrics: defaultMetrics(0.7),
    },
    {
      id: "3", name: "After-hours WhatsApp", channel: "WhatsApp", status: "draft",
      knows: ["Business hours", "Emergency contact"],
      wont: ["Confirm bookings", "Share pricing"],
      purpose: "Handle WhatsApp customers between 10pm–8am with polite deflection.",
      persona: "Apologetic, brief.",
      features: ["forms","linkTracking"],
      mediaSupport: ["text","file","audio","location"],
      connectors: ["whatsapp"],
      businessLogic: ["After-hours = 22:00–08:00 Bangkok time."],
      guardrails: ["Never promise a callback time under 12 hours."],
      trainingSamples: DEFAULT_TRAINING,
      metrics: defaultMetrics(0.3),
    },
  ],
  agents: [
    { id: "a0", name: "24/7 deal closer", tag: "Revenue", description: "Follows up leads round the clock, negotiates within your rules and takes the payment link the moment they say yes.", autonomous: true },
    { id: "a1", name: "Welcome new followers", description: "Sends a friendly first message and 10% off code when someone new messages you.", autonomous: true },
    { id: "a2", name: "Win-back inactive customers", description: "Every Sunday, spots customers who haven't ordered in 30 days and drafts a note.", autonomous: false },
    { id: "a3", name: "Reservation confirmations", description: "Replies to reservation requests and adds them to your Google Sheet.", autonomous: true },
    { id: "a4", name: "Bad-review triage", description: "Flags any 1 or 2 star mention for you to reply personally.", autonomous: false },
    { id: "a5", name: "Abandoned-cart nudge", tag: "Revenue", description: "Waits 20 minutes after a checkout is dropped, then sends a warm nudge on the channel they came from.", autonomous: false },
  ],
  semantic: [
    { id: "s1", kind: "logic",     text: "A 'VIP' customer is anyone who has spent more than ฿5,000 in the last 90 days." },
    { id: "s2", kind: "logic",     text: "Delivery is free inside Bangkok for orders over ฿500." },
    { id: "s3", kind: "guardrail", text: "Never offer a discount larger than 15% without asking me first." },
    { id: "s4", kind: "guardrail", text: "Do not share supplier names, staff contact details or wholesale prices." },
    { id: "s5", kind: "guardrail", text: "Refuse to discuss politics, religion or competitors." },
  ],
  customers: makeCustomers(),
};

function seed(userText: string): Msg[] {
  return [
    { id: "m1", role: "user", text: userText, at: Date.now() - 60_000 },
    { id: "m2", role: "assistant", text: "Done — here is a draft you can send as-is or tweak. Let me know if you'd like a shorter version.", at: Date.now() - 30_000 },
  ];
}

function makeCustomers(): Customer[] {
  const first = ["Ploy","Nan","Somchai","Arisa","Chai","Mint","Kritsada","Nam","Ton","Beam","Fah","Bank","Pim","Nut","Ice","Praew","View","Gun","Ohm","Ally","Ken","Aom","Fern","May","Boss","Bua","Petch","Tao","Kae","Nine"];
  const last = ["S.","K.","P.","T.","W.","C.","R.","N.","J.","M.","L.","H."];
  const cities = ["Bangkok","Chiang Mai","Phuket","Pattaya","Khon Kaen","Hat Yai","Ayutthaya"];
  const chans: Customer["channel"][] = ["LINE","WhatsApp","Instagram","Facebook"];
  const tags: Customer["tag"][] = ["VIP","Regular","New","At risk"];
  const out: Customer[] = [];
  for (let i = 0; i < 30; i++) {
    const spend = Math.round((Math.random() * 12000 + 200) / 10) * 10;
    const orders = Math.max(1, Math.round(spend / 400));
    out.push({
      id: "cus_" + i,
      name: `${first[i % first.length]} ${last[i % last.length]}`,
      channel: chans[i % chans.length],
      city: cities[i % cities.length],
      spend,
      orders,
      lastSeen: `${1 + (i % 30)}d ago`,
      tag: spend > 5000 ? "VIP" : orders <= 2 ? (i % 3 === 0 ? "New" : "At risk") : (tags[i % tags.length]),
    });
  }
  return out;
}

function load(): Store {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<Store>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

function save(s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

const listeners = new Set<() => void>();
let cache: Store | null = null;
function get(): Store {
  if (!cache) cache = load();
  return cache;
}
function set(mutator: (s: Store) => Store) {
  cache = mutator(get());
  save(cache);
  listeners.forEach((l) => l());
}

export function useStore(): [Store, (m: (s: Store) => Store) => void] {
  const [, tick] = useState(0);
  useEffect(() => {
    const l = () => tick((n) => n + 1);
    listeners.add(l);
    cache = load();
    l();
    return () => { listeners.delete(l); };
  }, []);
  return [get(), set];
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export function emptyMetrics(): ChatbotMetrics {
  return { formsSubmitted: 0, linkClicks: 0, meetingsBooked: 0, quizCompleted: 0, couponsRedeemed: 0, rewardsIssued: 0, rouletteSpins: 0, campaignEntries: 0 };
}