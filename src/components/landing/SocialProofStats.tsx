import { Users, MessageCircle, BadgeCheck, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const stats = [
  { icon: Users, target: 10000, suffix: "+", display: (n: number) => `${n.toLocaleString()}+`, label: "Members across India" },
  { icon: MessageCircle, target: 25000, suffix: "+", display: (n: number) => `${n.toLocaleString()}+`, label: "Meaningful conversations" },
  { icon: BadgeCheck, target: 100, suffix: "%", display: (n: number) => `${n}%`, label: "Verified profiles" },
  { icon: Heart, target: 98, suffix: "%", display: (n: number) => `${n}%`, label: "Intention-first matches" },
];

const useCountUp = (target: number, active: boolean, duration = 1800) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
};

const StatCard = ({ s, active }: { s: typeof stats[number]; active: boolean }) => {
  const n = useCountUp(s.target, active);
  return (
    <div className="hover-lift p-5 md:p-6 rounded-2xl bg-card border border-border/60 shadow-card flex flex-col items-start">
      <s.icon className="h-5 w-5 text-accent mb-3" />
      <div className="font-display text-2xl md:text-3xl text-foreground leading-tight tabular-nums">
        {s.display(n)}
      </div>
      <div className="text-xs text-muted-foreground mt-1 leading-snug">{s.label}</div>
    </div>
  );
};

export const SocialProofStats = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section className="pb-12 md:pb-16">
      <div className="container max-w-6xl" ref={ref}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s) => (
            <StatCard key={s.label} s={s} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
};
