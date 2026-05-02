import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, EyeOff, ShieldCheck } from "lucide-react";
import heroGradient from "@/assets/hero-gradient.jpg";
import heroCouple from "@/assets/hero-couple.jpg";

export const Hero = () => {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-40 dark:opacity-30 blur-3xl"
        style={{
          backgroundImage: `url(${heroGradient})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-veil" />

      <div className="container max-w-6xl">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border/60 backdrop-blur text-xs font-medium text-secondary-foreground mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              India's intentional dating community
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.04] font-medium animate-fade-up">
              Read me <em className="italic text-gradient">before</em> you
              <br className="hidden md:block" /> judge me.
            </h1>

            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-up delay-100">
              Meaningful dating for people who value connection over appearances.
              Photos stay hidden until you both choose to unveil.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up delay-200">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">Create your profile</Link>
              </Button>
              <Button variant="soft" size="xl" asChild>
                <Link to="/login">Log in</Link>
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 justify-center lg:justify-start text-xs text-muted-foreground animate-fade-up delay-300">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-accent" /> Verified profiles</span>
              <span className="inline-flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-accent" /> Photos stay hidden</span>
              <span>Free to join</span>
            </div>
          </div>

          {/* Right: imagery */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative rounded-[2rem] overflow-hidden shadow-elegant border border-border/60 aspect-[4/5] lg:aspect-[5/6]">
              <img
                src={heroCouple}
                alt="A young modern Indian couple sharing a candid moment of laughter"
                className="w-full h-full object-cover"
                width={1600}
                height={1024}
                loading="eager"
                decoding="async"
                // @ts-expect-error - fetchpriority is a valid HTML attribute
                fetchpriority="high"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
            </div>
            {/* Floating "hidden until both reveal" badge */}
            <div className="absolute -bottom-3 -left-3 sm:-left-4 bg-card border border-border/60 shadow-card rounded-2xl px-4 py-3 backdrop-blur max-w-[14rem]">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
                  <EyeOff className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <p className="leading-snug text-foreground/80">
                  Photos unveil only when <span className="text-foreground font-medium">you both</span> say yes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
