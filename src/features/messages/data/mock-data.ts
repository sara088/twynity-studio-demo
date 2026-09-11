export interface MessageThread {
  id: string;
  from: string;
  fromAvatar: string;
  org: string;
  preview: string;
  ts: string;
  unread: boolean;
}

export const SUPPLY_THREADS: MessageThread[] = [
  {
    id: "t1",
    from: "Sasha (Linear)",
    fromAvatar: "/assets/persona-prof-f.png",
    org: "Linear",
    preview: "Could your twyn jump on Friday's product review?",
    ts: "12m ago",
    unread: true,
  },
  {
    id: "t2",
    from: "Eli (Vercel)",
    fromAvatar: "/assets/persona-exec-m.png",
    org: "Vercel",
    preview: "We extended your engagement through Q3. Confirming the rate.",
    ts: "2h ago",
    unread: true,
  },
  {
    id: "t3",
    from: "Min (Notion)",
    fromAvatar: "/assets/persona-creative-m.png",
    org: "Notion",
    preview: "Thanks for the doc pass — ship it.",
    ts: "Yesterday",
    unread: false,
  },
];

export const DEMAND_THREADS: MessageThread[] = [
  {
    id: "dt1",
    from: "Sara Gordic",
    fromAvatar: "/assets/sara.png",
    org: "Design partner",
    preview: "I've drafted the audit. One thing I'm refusing — see comments.",
    ts: "8m ago",
    unread: true,
  },
  {
    id: "dt2",
    from: "Milos Tech",
    fromAvatar: "/assets/persona-dev-m.png",
    org: "Engineer",
    preview: "Migration plan v3 is ready. Need a canary window.",
    ts: "1h ago",
    unread: false,
  },
];
