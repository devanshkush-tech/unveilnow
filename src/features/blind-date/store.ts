import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Match = {
  name: string;
  age: number;
  city: string;
  compatibility: number;
  vibes: string[];
};

type State = {
  answers: Record<string, unknown>;
  extendedAnswers: Record<string, unknown>;
  match: Match | null;
  sessionId: string | null;
  endsAt: string | null;
  userDecision: "pending" | "pass" | "continue";
  setAnswer: (id: string, value: unknown) => void;
  setAnswers: (a: Record<string, unknown>) => void;
  setExtendedAnswer: (id: string, value: unknown) => void;
  setExtendedAnswers: (a: Record<string, unknown>) => void;
  setMatch: (m: Match, sessionId: string | null, endsAt: string | null) => void;
  setDecision: (d: "pass" | "continue") => void;
  reset: () => void;
};

export const useBlindDateStore = create<State>()(
  persist(
    (set) => ({
      answers: {},
      extendedAnswers: {},
      match: null,
      sessionId: null,
      endsAt: null,
      userDecision: "pending",
      setAnswer: (id, value) => set((s) => ({ answers: { ...s.answers, [id]: value } })),
      setAnswers: (a) => set({ answers: a }),
      setExtendedAnswer: (id, value) => set((s) => ({ extendedAnswers: { ...s.extendedAnswers, [id]: value } })),
      setExtendedAnswers: (a) => set({ extendedAnswers: a }),
      setMatch: (m, sessionId, endsAt) => set({ match: m, sessionId, endsAt }),
      setDecision: (d) => set({ userDecision: d }),
      reset: () => set({ answers: {}, extendedAnswers: {}, match: null, sessionId: null, endsAt: null, userDecision: "pending" }),
    }),
    {
      name: "bd-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist the questionnaire answers across signup redirects/email verification.
      partialize: (s) => ({ answers: s.answers, extendedAnswers: s.extendedAnswers }) as any,
    }
  )
);
