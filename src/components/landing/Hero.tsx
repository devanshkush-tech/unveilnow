import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, EyeOff, ShieldCheck, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { HeroCard } from "./HeroCard";
import coupleWarm from "@/assets/couple-warm.jpg";
import heroRooftop from "@/assets/lp-hero-rooftop.jpg";


export const Hero = () => {
  const [slide, setSlide] = useState(0);
  const slides = 2;
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % slides), 5500);
    return () => clearInterval(id);
  }, []);
  const go = (i: number) => setSlide((i + slides) % slides);
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">

      {/* Warm plum-to-peach gradient backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 600px at 10% 0%, hsl(327 50% 92% / 0.9), transparent 60%), radial-gradient(900px 500px at 100% 20%, hsl(14 80% 92% / 0.9), transparent 60%), linear-gradient(180deg, hsl(36 50% 98%) 0%, hsl(18 55% 96%) 100%)",
        }}
      />
      {/* Decorative leaves */}
      <div aria-hidden className="ambient-orb absolute -left-10 top-40 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, hsl(340 60% 80%), transparent 70%)" }} />
      <div aria-hidden className="ambient-orb-slow absolute -right-10 bottom-0 w-96 h-96 rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, hsl(14 70% 80%), transparent 70%)" }} />
      {/* Candid couple photo as ambient background accent */}
      <div
        aria-hidden
        className="absolute -z-10 left-0 bottom-0 w-[55%] h-[70%] pointer-events-none opacity-[0.18] hidden md:block"
        style={{
          backgroundImage: `url(${coupleWarm})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          WebkitMaskImage:
            "radial-gradient(ellipse at 30% 70%, black 0%, transparent 70%)",
          maskImage:
            "radial-gradient(ellipse at 30% 70%, black 0%, transparent 70%)",
        }}
      />

      <div className="container max-w-6xl">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 border border-border/60 backdrop-blur text-xs font-medium text-secondary-foreground mb-6 animate-fade-in shadow-soft">
              <Heart className="h-3.5 w-3.5 text-primary-glow fill-current" />
              For serious singles in India
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.04] font-medium animate-fade-up">
              Read Me <em className="italic text-gradient">Before</em>
              <br className="hidden md:block" /> You Judge Me.
            </h1>

            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-up delay-100">
              A story-first dating platform where real connection starts before appearance. Share your personality, values, and intentions first — and reveal photos only after the chemistry meter is filled.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up delay-200">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">Create My Profile</Link>
              </Button>
              <Button variant="soft" size="xl" asChild>
                <a href="#how">See How It Works</a>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 justify-center lg:justify-start animate-fade-up delay-300">
              {[
                { icon: Heart, label: "Connection first" },
                { icon: ShieldCheck, label: "Privacy-first" },
                { icon: EyeOff, label: "No random swiping" },
              ].map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card border border-border/60 text-xs text-foreground/80 shadow-soft"
                >
                  <c.icon className="h-3.5 w-3.5 text-primary-glow" /> {c.label}
                </span>
              ))}
            </div>

            <p className="mt-5 text-[11px] text-muted-foreground/60 tracking-wide animate-fade-up delay-300 inline-flex items-center gap-1.5 justify-center lg:justify-start">
              <Sparkles className="h-3 w-3" /> Serious members only. A small entry fee keeps away timepass users.
            </p>
          </div>

          {/* Right: card + rooftop image */}
          <div className="animate-fade-up delay-200 relative">
            <div
              className="relative mb-6 aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-border/40 hero-float"
            >
              <img
                src={heroRooftop}
                alt="A couple at a Mumbai rooftop bar at night"
                loading="eager"
                className="w-full h-full object-cover hero-kenburns"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 45%, rgba(20,10,20,0.55) 100%), linear-gradient(135deg, hsl(327 60% 70% / 0.18), transparent 60%)",
                }}
              />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-[10px] tracking-[0.28em] uppercase opacity-80 mb-1">— Tonight in Mumbai</p>
                <p className="font-display text-xl leading-tight">One conversation. Hours later, still talking.</p>
              </div>
            </div>
            <HeroCard />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes hero-kenburns {
          0% { transform: scale(1.05) translate3d(0,0,0); }
          100% { transform: scale(1.18) translate3d(-2%, -2%, 0); }
        }
        .hero-kenburns { animation: hero-kenburns 18s ease-in-out infinite alternate; }
        @keyframes hero-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hero-float { animation: hero-float 7s ease-in-out infinite; }
      `}</style>
    </section>
  );
};
