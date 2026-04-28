// Chemistry meter — local computation from message history.
// Heuristic: rewards balanced back-and-forth, message depth, response cadence,
// and consistent engagement. 0 to 100.

export type Msg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export const computeChemistry = (
  messages: Msg[],
  userA: string,
  userB: string,
): number => {
  if (messages.length < 2) return 0;

  const fromA = messages.filter((m) => m.sender_id === userA);
  const fromB = messages.filter((m) => m.sender_id === userB);

  // Balance — 1.0 when 50/50
  const total = fromA.length + fromB.length;
  const balance = total ? 1 - Math.abs(fromA.length - fromB.length) / total : 0;

  // Depth — average message length, capped at 140 chars per message
  const avgLen =
    messages.reduce((sum, m) => sum + Math.min(m.body.trim().length, 140), 0) /
    messages.length;
  const depth = Math.min(avgLen / 80, 1);

  // Volume — saturates at 40 messages
  const volume = Math.min(total / 40, 1);

  // Cadence — fraction of replies that came within 24h
  let timely = 0;
  let alternations = 0;
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].sender_id !== messages[i - 1].sender_id) {
      alternations += 1;
      const dt =
        new Date(messages[i].created_at).getTime() -
        new Date(messages[i - 1].created_at).getTime();
      if (dt < 24 * 60 * 60 * 1000) timely += 1;
    }
  }
  const cadence = alternations ? timely / alternations : 0;
  const turnTaking = total ? alternations / (total - 1 || 1) : 0;

  const score =
    balance * 0.25 +
    depth * 0.2 +
    volume * 0.2 +
    cadence * 0.2 +
    turnTaking * 0.15;

  return Math.round(Math.max(0, Math.min(1, score)) * 100);
};

export const chemistryLabel = (score: number) => {
  if (score >= 95) return "Magnetic";
  if (score >= 80) return "Glowing";
  if (score >= 60) return "Warming up";
  if (score >= 35) return "Sparking";
  return "Just starting";
};
