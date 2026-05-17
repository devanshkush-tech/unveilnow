import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  MapPin,
  Wine,
  Users,
  ShieldCheck,
  Heart,
  Music2,
  Coffee,
  Plane,
  Crown,
} from "lucide-react";
import { trackMetaEvent } from "@/lib/metaCapi";
import coupleWarm from "@/assets/couple-warm.jpg";
import coupleQuiet from "@/assets/couple-quiet.jpg";

const cities = [
  "Mumbai",
  "Delhi NCR",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Gurgaon",
  "Chennai",
  "Kolkata",
];

const circleBenefits = [
  {
    icon: Crown,
    title: "An invite-only circle",
    desc: "A curated room for modern, ambitious singles who value taste, intent, and discretion.",
  },
  {
    icon: MapPin,
    title: "Made for your city",
    desc: "Meet people who already live the life you do — in your neighborhood, not three timezones away.",
  },
  {
    icon: Users,
    title: "Friends first, then more",
    desc: "Not every spark has to be romance. Build a real social circle of equals — dinner partners, plus-ones, real friends.",
  },
  {
    icon: ShieldCheck,
    title: "Quietly verified",
    desc: "A small fee, manual review, and a story-first profile keep the room private, safe, and serious.",
  },
];

const lifestyle = [
  { icon: Wine, label: "Wine & private dinners" },
  { icon: Music2, label: "Concerts & gigs" },
  { icon: Coffee, label: "Slow Sunday cafés" },
  { icon: Plane, label: "Weekend escapes" },
];

const LP = () => {
  useEffect(() => {
    document.title = "Unveil Now LP | A private circle for modern singles in your city";
    const desc =
      "A curated, invite-only circle for modern, luxurious singles. Make friends first in your city — then let real chemistry decide the rest. Story-first, privacy-first.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = desc;
      document.head.appendChild(m);
    }
    trackMetaEvent("ViewContent", {
      event_id: `view_lp_${Date.now()}`,
      custom_data: {
        content_name: "LP",
        content_category: "marketing-lp",
        content_type: "product_group",
        currency: "INR",
        value: 199,
      },
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative pt-24 md:pt-32 pb-20 md:pb-28 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(900px 500px at 85% 10%, hsl(327 60% 90% / 0.85), transparent 60%), radial-gradient(700px 500px at 10% 90%, hsl(14 70% 90% / 0.8), transparent 60%), linear-gradient(180deg, hsl(36 50% 98%) 0%, hsl(18 55% 96%) 100%)",
            }}
          />
          <div
            aria-hidden
            className="absolute -z-10 right-0 top-0 w-[55%] h-[80%] pointer-events-none opacity-[0.18] hidden md:block"
            style={{
              backgroundImage: `url(${coupleWarm})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              WebkitMaskImage:
                "radial-gradient(ellipse at 70% 30%, black 0%, transparent 70%)",
              maskImage:
                "radial-gradient(ellipse at 70% 30%, black 0%, transparent 70%)",
            }}
          />

          <div className="container max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/80 border border-border/60 backdrop-blur text-xs font-medium text-secondary-foreground mb-6 shadow-soft animate-fade-in">
              <Crown className="h-3.5 w-3.5 text-primary-glow" />
              Invite-only · For modern, luxurious singles
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.04] font-medium animate-fade-up">
              A private circle <em className="italic text-gradient">for your city.</em>
              <br className="hidden md:block" /> Friends first. Then everything else.
            </h1>

            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up delay-100">
              Unveil Now is a quietly curated room for modern singles who want taste, intent, and a real social life — not a swipe carousel. Meet people in your city through story, build genuine friendships, and let chemistry decide what becomes more.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-fade-up delay-200">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">Request my invite</Link>
              </Button>
              <Button variant="soft" size="xl" asChild>
                <a href="#circle">See what's inside</a>
              </Button>
            </div>

            <p className="mt-5 text-[11px] text-muted-foreground/70 tracking-wide animate-fade-up delay-300 inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Manually reviewed · Small entry fee keeps the room private
            </p>

            {/* City strip */}
            <div className="mt-12 animate-fade-up delay-300">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-4">
                Now opening in
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {cities.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-card border border-border/60 text-xs text-foreground/80 shadow-soft"
                  >
                    <MapPin className="h-3 w-3 text-primary-glow" /> {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY THIS CIRCLE */}
        <section id="circle" className="py-20 md:py-28">
          <div className="container max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">
                Why this circle
              </p>
              <h2 className="font-display text-3xl md:text-5xl leading-tight">
                A different kind of <em className="italic text-gradient">social life</em> in your city
              </h2>
              <p className="text-muted-foreground mt-4 text-sm md:text-base">
                For people who'd rather meet 5 real ones than scroll 500 strangers.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {circleBenefits.map((it) => (
                <div
                  key={it.title}
                  className="group p-6 rounded-3xl bg-card border border-border/60 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-500"
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                    style={{ background: "var(--gradient-warm)" }}
                  >
                    <it.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{it.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {it.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LIFESTYLE BAND */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div
            aria-hidden
            className="absolute -z-10 left-0 top-0 w-[55%] h-full pointer-events-none opacity-[0.12] hidden md:block"
            style={{
              backgroundImage: `url(${coupleQuiet})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              WebkitMaskImage:
                "radial-gradient(ellipse at 30% 50%, black 0%, transparent 70%)",
              maskImage:
                "radial-gradient(ellipse at 30% 50%, black 0%, transparent 70%)",
            }}
          />
          <div className="container max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">
                  Your kind of room
                </p>
                <h2 className="font-display text-3xl md:text-5xl leading-tight mb-5">
                  The people you keep <em className="italic text-gradient">wishing</em> you'd meet
                </h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-7">
                  Founders, creatives, doctors, designers, bankers, artists. People with calendars full of intent — wine bars, slow Sundays, gigs, last-minute Goa plans. Unveil Now is where they quietly find each other.
                </p>
                <div className="flex flex-wrap gap-2">
                  {lifestyle.map((l) => (
                    <span
                      key={l.label}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-card border border-border/60 text-xs text-foreground/80 shadow-soft"
                    >
                      <l.icon className="h-3.5 w-3.5 text-primary-glow" /> {l.label}
                    </span>
                  ))}
                </div>
                <div className="mt-8">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/signup">
                      <Heart className="h-4 w-4" /> Join the circle
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div
                  className="aspect-[4/5] rounded-[2rem] border border-border/60 shadow-elegant overflow-hidden"
                  style={{
                    backgroundImage: `linear-gradient(180deg, hsl(327 50% 92% / 0.4), hsl(14 80% 92% / 0.3)), url(${coupleQuiet})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="absolute -bottom-6 -left-6 hidden md:block bg-card border border-border/60 rounded-2xl p-4 shadow-card max-w-[260px]">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    The room tonight
                  </p>
                  <p className="text-sm font-medium">
                    14 new founders · 9 designers · 6 doctors
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across Mumbai, Delhi & Bengaluru
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING (reused) */}
        <Pricing />

        {/* FAQ (reused) */}
        <FAQ />

        {/* FINAL CTA */}
        <section className="py-20 md:py-28">
          <div className="container max-w-4xl">
            <div
              className="relative overflow-hidden rounded-[2rem] p-10 md:p-16 text-center text-primary-foreground shadow-elegant"
              style={{ background: "var(--gradient-romance)" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-[11px] uppercase tracking-widest mb-6">
                <Crown className="h-3 w-3" /> Invite-only
              </div>
              <h2 className="font-display text-3xl md:text-5xl leading-tight mb-4">
                Your city is more interesting than your feed.
              </h2>
              <p className="text-primary-foreground/90 text-sm md:text-base max-w-xl mx-auto mb-8">
                Step into a quietly curated circle. Make friends first. Let the rest happen the way it's supposed to.
              </p>
              <Button variant="secondary" size="xl" asChild>
                <Link to="/signup">Request my invite</Link>
              </Button>
              <p className="mt-4 text-[11px] text-primary-foreground/70">
                Manually reviewed · Privacy-first · Story-first
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LP;
