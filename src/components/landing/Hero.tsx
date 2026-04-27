import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import heroGradient from "@/assets/hero-gradient.jpg";

export const Hero = () => {
  return (
    <section className="relative pt-28 md:pt-36 pb-20 md:pb-32 overflow-hidden">
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

      <div className="container max-w-5xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 border border-border/60 backdrop-blur text-xs font-medium text-secondary-foreground mb-8 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          Now inviting our founding members
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[1.02] font-medium animate-fade-up">
          Read me <em className="italic text-gradient">before</em> you
          <br className="hidden md:block" /> judge me.
        </h1>

        <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up delay-100">
          Meaningful dating for people who value connection over appearances.
          Photos stay hidden until you both choose to unveil.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center animate-fade-up delay-200">
          <Button variant="hero" size="xl" asChild>
            <Link to="/signup">Join the waitlist</Link>
          </Button>
          <Button variant="soft" size="xl" asChild>
            <Link to="/login">I have an invite</Link>
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground animate-fade-up delay-300">
          Free to join · Verified profiles · India's intentional dating community
        </p>
      </div>
    </section>
  );
};
