import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { ShieldCheck, BadgeCheck, Eye, Flag, Bot, Lock } from "lucide-react";


const items = [
  { icon: BadgeCheck, title: "Face verification", desc: "Every member completes a liveness check before they can message." },
  { icon: Lock, title: "Photos stay private", desc: "Hidden by default. Revealed only with mutual, simultaneous consent." },
  { icon: ShieldCheck, title: "No fake profiles", desc: "AI-assisted screening catches duplicates, bots, and bad-faith accounts." },
  { icon: Bot, title: "AI moderation", desc: "Harmful messages are filtered before they ever reach your inbox." },
  { icon: Flag, title: "One-tap report", desc: "Reports are reviewed by humans within 24 hours. Always." },
  { icon: Eye, title: "You're in control", desc: "Hide, block, or delete your data instantly. No support ticket required." },
];

const Trust = () => (
  <div className="min-h-screen bg-background">
    <SEO
      title="Trust & Safety | Unveil Now"
      description="Face verification, private photos, AI moderation, and 24-hour human report review. How Unveil Now keeps its community safe."
      path="/trust"
    />
    <Navbar />
    <main className="pt-28 md:pt-32 pb-20">

      <section className="container max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Trust & Safety</p>
        <h1 className="font-display text-5xl md:text-6xl leading-tight">
          Built to feel <em className="italic text-gradient">safe</em>.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          A respect-first community is non-negotiable. Here's how we protect it.
        </p>
      </section>

      <section className="container max-w-5xl mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((i) => (
          <div key={i.title} className="p-7 rounded-3xl bg-card border border-border/60 shadow-card">
            <i.icon className="h-6 w-6 text-primary mb-4" />
            <h3 className="font-display text-xl mb-2">{i.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{i.desc}</p>
          </div>
        ))}
      </section>
    </main>
    <Footer />
  </div>
);

export default Trust;
