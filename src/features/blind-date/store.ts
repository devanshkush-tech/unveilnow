import { create } from "zustand";

export type Answers = Record<number, string>;

export type Match = {
  name: string;
  age: number;
  city: string;
  compatibility: number;
  vibes: string[];
};

type State = {
  sessionsRemaining: number;
  answers: Answers;
  match: Match | null;
  userDecision: "pending" | "pass" | "continue";
  setAnswer: (q: number, value: string) => void;
  setMatch: (m: Match) => void;
  setDecision: (d: "pass" | "continue") => void;
  consumeSession: () => void;
  reset: () => void;
};

export const useBlindDateStore = create<State>((set) => ({
  sessionsRemaining: 3,
  answers: {},
  match: null,
  userDecision: "pending",
  setAnswer: (q, value) => set((s) => ({ answers: { ...s.answers, [q]: value } })),
  setMatch: (m) => set({ match: m }),
  setDecision: (d) => set({ userDecision: d }),
  consumeSession: () => set((s) => ({ sessionsRemaining: Math.max(0, s.sessionsRemaining - 1) })),
  reset: () => set({ answers: {}, match: null, userDecision: "pending" }),
}));

export const MOCK_MATCHES: Match[] = [
  { name: "Priya", age: 24, city: "Mumbai", compatibility: 91, vibes: ["Deep Talks", "Adventurous", "Serious"] },
  { name: "Ananya", age: 26, city: "Bangalore", compatibility: 87, vibes: ["Music Lover", "Night Owl", "Playful"] },
  { name: "Sara", age: 23, city: "Delhi", compatibility: 94, vibes: ["Mountains", "Calm", "Deep Talks"] },
];

export function pickMatch(): Match {
  return MOCK_MATCHES[Math.floor(Math.random() * MOCK_MATCHES.length)];
}
