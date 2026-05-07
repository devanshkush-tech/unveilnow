export function ParticleBurst({ count = 28 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {items.map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const dist = 120 + Math.random() * 220;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist;
        const color = i % 2 === 0 ? "#C084FC" : "#F472B6";
        return (
          <span
            key={i}
            className="bd-particle"
            style={{
              left: "50%",
              top: "50%",
              background: color,
              ["--tx" as any]: `${tx}px`,
              ["--ty" as any]: `${ty}px`,
              animationDelay: `${(i % 6) * 0.05}s`,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
}
