import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useRef, MouseEvent } from "react";

const MagneticWrap = ({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };
  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="inline-block transition-transform duration-300 ease-out will-change-transform"
    >
      {children}
    </span>
  );
};

export const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-5xl">
        <div
          className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center shadow-elegant"
          style={{ background: "var(--gradient-romance)" }}
        >
          <div aria-hidden className="absolute inset-0" style={{ background: "var(--gradient-veil)", opacity: 0.35 }} />
          {/* Floating ambient orbs */}
          <div aria-hidden className="ambient-orb absolute -top-16 -left-10 w-64 h-64 rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, hsl(14 80% 80%), transparent 70%)" }} />
          <div aria-hidden className="ambient-orb-slow absolute -bottom-20 -right-10 w-72 h-72 rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, hsl(340 70% 75%), transparent 70%)" }} />

          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl text-primary-foreground leading-[1.05]">
              Ready to meet someone who <em className="italic">reads you first?</em>
            </h2>
            <p className="mt-5 text-base md:text-lg text-primary-foreground/85 max-w-xl mx-auto">
              Join a dating experience designed for people who want more than swipes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <MagneticWrap>
                <Button variant="soft" size="xl" asChild>
                  <Link to="/signup">Create My Profile</Link>
                </Button>
              </MagneticWrap>
              <MagneticWrap strength={0.25}>
                <Button variant="ghost" size="xl" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" asChild>
                  <Link to="/pricing">
                    Explore Plans <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </MagneticWrap>
            </div>
            <p className="mt-6 text-xs text-primary-foreground/70 italic">
              Feel the connection first, then images.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
