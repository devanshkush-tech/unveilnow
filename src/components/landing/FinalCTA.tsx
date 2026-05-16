import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center shadow-elegant"
          style={{ background: "var(--gradient-romance)" }}>
          <div aria-hidden className="absolute inset-0" style={{ background: "var(--gradient-veil)", opacity: 0.35 }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl text-primary-foreground leading-[1.05]">
              Ready to meet someone who <em className="italic">reads you first?</em>
            </h2>
            <p className="mt-5 text-base md:text-lg text-primary-foreground/85 max-w-xl mx-auto">
              Join a dating experience designed for people who want more than swipes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="soft" size="xl" asChild>
                <Link to="/signup">Create My Profile</Link>
              </Button>
              <Button variant="ghost" size="xl" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground" asChild>
                <Link to="/pricing">
                  Explore Plans <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
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
