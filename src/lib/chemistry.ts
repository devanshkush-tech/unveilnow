// Chemistry meter — local computation from message history.
// Goal: 25 messages each (50 total) with active back-and-forth = 100%.
// Grows naturally and faster than before, while still rewarding mutual,
// real conversation (not one-sided spam).

export type Msg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ChemistryWeights = {
  // Each user message they've actually sent contributes toward the volume target.
  perUserTarget: number; // default 25
  // Weights (must sum to 1)
  volume: number;
  balance: number;
  turnTaking: number;
  depth: number;
  curve: number; // power applied at end (1 = linear)
};

export const DEFAULT_CHEMISTRY_WEIGHTS: ChemistryWeights = {
  perUserTarget: 25,
  volume: 0.55,
  balance: 0.20,
  turnTaking: 0.15,
  depth: 0.10,
  curve: 1,
};

export const computeChemistry = (
  messages: Msg[],
  userA: string,
  userB: string,
  weights: ChemistryWeights = DEFAULT_CHEMISTRY_WEIGHTS,
): number => {
  const total = messages.length;
  if (total === 0) return 0;

  const fromA = messages.filter((m) => m.sender_id === userA).length;
  const fromB = messages.filter((m) => m.sender_id === userB).length;

  const target = Math.max(1, weights.perUserTarget);

  // 1. Volume — based on the SMALLER side, so both have to participate.
  //    25 msgs from each side saturates volume to 1.0.
  const minSide = Math.min(fromA, fromB);
  const volume = Math.min(minSide / target, 1);

  // 2. Balance — penalise heavily one-sided threads.
  const balance = total ? 1 - Math.abs(fromA - fromB) / total : 0;

  // 3. Turn-taking — fraction of consecutive messages that switch sender.
  let alternations = 0;
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender_id !== messages[i - 1].sender_id) alternations += 1;
  }
  const turnTaking = total > 1 ? alternations / (total - 1) : 0;

  // 4. Depth — gentle bonus for non-trivial messages (avg length, capped).
  const avgLen =
    messages.reduce((sum, m) => sum + Math.min(m.body.trim().length, 120), 0) /
    total;
  const depth = Math.min(avgLen / 60, 1); // 60+ chars avg = full depth

  let raw =
    volume * weights.volume +
    balance * weights.balance +
    turnTaking * weights.turnTaking +
    depth * weights.depth;

  if (weights.curve && weights.curve !== 1) {
    raw = Math.pow(Math.max(0, Math.min(1, raw)), weights.curve);
  }

  return Math.round(Math.max(0, Math.min(1, raw)) * 100);
};

export const chemistryLabel = (score: number) => {
  if (score >= 90) return "Magnetic";
  if (score >= 75) return "Glowing";
  if (score >= 55) return "Warming up";
  if (score >= 30) return "Sparking";
  return "Just starting";
};
