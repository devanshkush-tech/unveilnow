// Chemistry meter — local computation from message history.
// Designed to feel earned, not instant: rewards balanced conversation,
// thoughtful depth, sustained engagement across days, and consistent reply cadence.
// 0 to 100. Reaching 60+ should typically take several days of real exchange.

export type Msg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const DAY = 24 * 60 * 60 * 1000;

export const computeChemistry = (
  messages: Msg[],
  userA: string,
  userB: string,
): number => {
  if (messages.length < 4) return Math.min(messages.length * 3, 12);

  const fromA = messages.filter((m) => m.sender_id === userA);
  const fromB = messages.filter((m) => m.sender_id === userB);
  const total = fromA.length + fromB.length;

  // 1. Balance — both must contribute. Heavily penalises one-sided threads.
  const balanceRaw = total ? 1 - Math.abs(fromA.length - fromB.length) / total : 0;
  const balance = Math.pow(balanceRaw, 1.5);

  // 2. Depth — average meaningful message length, capped per message.
  const avgLen =
    messages.reduce((sum, m) => sum + Math.min(m.body.trim().length, 180), 0) /
    messages.length;
  // Need ~120 chars average to max out depth.
  const depth = Math.min(avgLen / 120, 1);

  // 3. Volume — saturates much later (80 messages instead of 40).
  const volume = Math.min(total / 80, 1);

  // 4. Time spread — conversation must span multiple days. 0 if same day, 1 at 7+ days.
  const first = new Date(messages[0].created_at).getTime();
  const last = new Date(messages[messages.length - 1].created_at).getTime();
  const spreadDays = (last - first) / DAY;
  const timeSpread = Math.min(spreadDays / 7, 1);

  // 5. Reply consistency — fraction of turn changes that came within 36h.
  let timely = 0;
  let alternations = 0;
  // Track per-day activity for engagement
  const days = new Set<string>();
  for (let i = 1; i < messages.length; i++) {
    days.add(messages[i].created_at.slice(0, 10));
    if (messages[i].sender_id !== messages[i - 1].sender_id) {
      alternations += 1;
      const dt =
        new Date(messages[i].created_at).getTime() -
        new Date(messages[i - 1].created_at).getTime();
      if (dt < 36 * 60 * 60 * 1000) timely += 1;
    }
  }
  days.add(messages[0].created_at.slice(0, 10));
  const replyConsistency = alternations ? timely / alternations : 0;
  const turnTaking = total > 1 ? alternations / (total - 1) : 0;

  // 6. Active days — engagement spread across separate days. Need 5 days for 1.0.
  const activeDays = Math.min(days.size / 5, 1);

  // Weighted blend.  Note: weights sum to 1.
  let raw =
    balance * 0.18 +
    depth * 0.18 +
    volume * 0.12 +
    timeSpread * 0.18 +
    replyConsistency * 0.12 +
    turnTaking * 0.10 +
    activeDays * 0.12;

  // Apply a soft curve so the early/middle range feels slower.
  // Concretely: a "decent" raw of 0.55 produces a score around 47, not 70.
  raw = Math.pow(raw, 1.35);

  return Math.round(Math.max(0, Math.min(1, raw)) * 100);
};

export const chemistryLabel = (score: number) => {
  if (score >= 90) return "Magnetic";
  if (score >= 75) return "Glowing";
  if (score >= 55) return "Warming up";
  if (score >= 30) return "Sparking";
  return "Just starting";
};

