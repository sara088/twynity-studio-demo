export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  current?: boolean;
}

export const RECENT_CONVERSATIONS: Conversation[] = [
  {
    id: "n1",
    title: "New conversation",
    preview: "Fresh thread. What do you want to work on?",
    timestamp: "Just now",
  },
  {
    id: "n2",
    title: "New conversation",
    preview: "Fresh thread. What do you want to work on?",
    timestamp: "Just now",
  },
  {
    id: "n3",
    title: "New conversation",
    preview: "Fresh thread. What do you want to work on?",
    timestamp: "Just now",
  },
  {
    id: "n4",
    title: "New conversation",
    preview: "Fresh thread. What do you want to work on?",
    timestamp: "Just now",
  },
  {
    id: "n5",
    title: "New conversation",
    preview: "Fresh thread. What do you want to work on?",
    timestamp: "Just now",
  },
  {
    id: "n6",
    title: "New conversation",
    preview: "Fresh thread. What do you want to work on?",
    timestamp: "Just now",
  },
  {
    id: "n7",
    title: "New conversation",
    preview: "Fresh thread. What do you want to work on?",
    timestamp: "Just now",
  },
  {
    id: "current",
    title: "Today — current",
    preview: "Hi Sara — I'm your twyn. I can summarize docs…",
    timestamp: "Just now",
    current: true,
  },
  {
    id: "q3-board",
    title: "Q3 board prep — draft talking points",
    preview: "Pulled the highlights from your three latest decks…",
    timestamp: "Yesterday · 4:12 PM",
  },
  {
    id: "outreach-aurelia",
    title: "Outreach to Aurelia",
    preview: "Three drafts in your voice. The middle one leans warmer…",
    timestamp: "May 18 · 11:02 AM",
  },
  {
    id: "scheduling-pst",
    title: "Scheduling — PST x CET",
    preview: "Three slots that land in both your and her working hours…",
    timestamp: "May 16 · 9:38 AM",
  },
];
