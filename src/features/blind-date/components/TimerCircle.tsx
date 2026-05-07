export function TimerCircle({ seconds }: { seconds: number }) {
  const danger = seconds <= 10;
  const warn = seconds <= 20;
  const color = danger ? "#EF4444" : warn ? "#F59E0B" : "#F8FAFC";
  const mm = Math.floor(seconds / 60);
  const ss = (seconds % 60).toString().padStart(2, "0");
  return (
    <div
      className={`font-mono text-2xl font-bold tabular-nums ${danger ? "bd-heartbeat" : ""}`}
      style={{ color, textShadow: danger ? "0 0 16px rgba(239,68,68,0.6)" : "none" }}
    >
      {mm}:{ss}
    </div>
  );
}
