import { create } from "zustand";

export type Match = {
  name: string;
  age: number;
  city: string;
  compatibility: number;
  vibes: string[];
};

type State = {
  sessionsRemaining: number;
  answers: Record<string, unknown>;
  match: Match | null;
  sessionId: string | null;
  endsAt: string | null;
  mock: boolean;
  userDecision: "pending" | "pass" | "continue";
  setAnswer: (id: string, value: unknown) => void;
  setAnswers: (a: Record<string, unknown>) => void;
  setMatch: (m: Match, sessionId: string | null, endsAt: string | null, mock: boolean) => void;
  setDecision: (d: "pass" | "continue") => void;
  consumeSession: () => void;
  reset: () => void;
};

export const useBlindDateStore = create<State>((set) => ({
  sessionsRemaining: 3,
  answers: {},
  match: null,
  sessionId: null,
  endsAt: null,
  mock: true,
  userDecision: "pending",
  setAnswer: (id, value) => set((s) => ({ answers: { ...s.answers, [id]: value } })),
  setAnswers: (a) => set({ answers: a }),
  setMatch: (m, sessionId, endsAt, mock) => set({ match: m, sessionId, endsAt, mock }),
  setDecision: (d) => set({ userDecision: d }),
  consumeSession: () => set((s) => ({ sessionsRemaining: Math.max(0, s.sessionsRemaining - 1) })),
  reset: () => set({ answers: {}, match: null, sessionId: null, endsAt: null, userDecision: "pending" }),
}));

// Legacy helper kept for fallback
export const MOCK_MATCHES: Match[] = [
  { name: "Priya", age: 24, city: "Mumbai", compatibility: 91, vibes: ["Deep Talks", "Adventurous", "Serious"] },
  { name: "Ananya", age: 26, city: "Bangalore", compatibility: 87, vibes: ["Music Lover", "Night Owl", "Playful"] },
  { name: "Sara", age: 23, city: "Delhi", compatibility: 94, vibes: ["Mountains", "Calm", "Deep Talks"] },
];
export function pickMatch(): Match {
  return MOCK_MATCHES[Math.floor(Math.random() * MOCK_MATCHES.length)];
}
