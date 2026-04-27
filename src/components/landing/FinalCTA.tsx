import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FinalCTA = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-romance p-12 md:p-20 text-center shadow-elegant">
          <div aria-hidden className="absolute inset-0 bg-gradient-veil opacity-30" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl text-primary-foreground leading-[1.05]">
              Looks later. <em className="italic">Vibes first.</em>
            </h2>
            <p className="mt-5 text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Join a community that values you for who you are — not how you photograph.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="soft" size="xl" asChild>
                <Link to="/signup">Create your profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
