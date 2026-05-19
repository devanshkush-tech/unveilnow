import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { trackMetaEvent } from "@/lib/metaCapi";
import coupleQuiet from "@/assets/couple-quiet.jpg";
import coupleWarm from "@/assets/couple-warm.jpg";
import coupleCafe from "@/assets/couple-cafe.jpg";
import heroCouple from "@/assets/hero-couple.jpg";
import lpRooftop from "@/assets/lp-rooftop.jpg";
import lpWinebar from "@/assets/lp-winebar.jpg";
import lpStreet from "@/assets/lp-street.jpg";

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

const pillars = [
  {
    n: "01",
    title: "Invite-only",
    body: "Every profile is manually reviewed. The room stays small on purpose — the kind of small where you actually remember names.",
  },
  {
    n: "02",
    title: "Friends first",
    body: "Not every spark has to be romance. Build a real circle — dinner partners, plus-ones, weekend co-conspirators. Let the rest happen on its own time.",
  },
  {
    n: "03",
    title: "City-native",
    body: "You'll meet people who already live the life you live — same neighborhood, same calendar, same late-night cafés. Not three timezones away.",
  },
  {
    n: "04",
    title: "Quietly verified",
    body: "A small entry fee, ID-level checks, and a story-first profile. No screenshots. No screenshots of screenshots. Just discretion.",
  },
];

const steps = [
  { n: "I", t: "Apply", b: "Tell us your story in a few prompts. No selfies yet." },
  { n: "II", t: "Reviewed quietly", b: "We read every profile by hand. Usually within 48 hours." },
  { n: "III", t: "Step into the room", b: "Meet people through chemistry first. Faces come after." },
];

const lifestyle = [
  "Private dinners",
  "Concerts & gigs",
  "Slow Sunday cafés",
  "Weekend escapes",
  "Gallery openings",
  "Last-minute Goa",
];

const LP = () => {
  useEffect(() => {
    document.title = "Unveil Now · A private circle for modern singles in your city";
    const desc =
      "An invite-only social circle for modern, ambitious singles. Friends first, then everything else. Story-first, privacy-first, city-native.";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", desc);

    // Scoped Google Fonts for this page only
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@300;400;500;600&display=swap";
    link.setAttribute("data-lp-fonts", "true");
    document.head.appendChild(link);

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

    return () => {
      link.remove();
    };
  }, []);

  return (
    <div className="lp-theme">
      <style>{`
        .lp-theme {
          --lp-bg: #07070C;
          --lp-surface: #0F0F18;
          --lp-border: rgba(255,255,255,0.08);
          --lp-text: #F4F4F8;
          --lp-muted: rgba(244,244,248,0.6);
          --lp-indigo: #6366F1;
          --lp-violet: #A78BFA;
          background: var(--lp-bg);
          color: var(--lp-text);
          font-family: 'Work Sans', system-ui, sans-serif;
          font-weight: 300;
          letter-spacing: -0.005em;
        }
        .lp-theme nav,
        .lp-theme footer { color: initial; }
        .lp-serif { font-family: 'Instrument Serif', serif; font-weight: 400; letter-spacing: -0.02em; }
        .lp-italic { font-family: 'Instrument Serif', serif; font-style: italic; font-weight: 400; }
        .lp-eyebrow {
          font-family: 'Work Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--lp-muted);
          font-weight: 400;
        }
        .lp-h1 { font-family: 'Instrument Serif', serif; font-weight: 400; line-height: 0.98; letter-spacing: -0.03em; }
        .lp-h2 { font-family: 'Instrument Serif', serif; font-weight: 400; line-height: 1.02; letter-spacing: -0.025em; }
        .lp-body { color: var(--lp-muted); line-height: 1.65; font-weight: 300; }
        .lp-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--lp-indigo), var(--lp-violet));
          color: white;
          border-radius: 999px;
          font-family: 'Work Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.02em;
          box-shadow: 0 10px 40px -10px rgba(99,102,241,0.6), 0 0 0 1px rgba(255,255,255,0.06) inset;
          transition: transform .35s ease, box-shadow .35s ease;
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 60px -10px rgba(167,139,250,0.7); }
        .lp-btn-ghost {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 1rem 2rem;
          background: transparent;
          color: var(--lp-text);
          border: 1px solid var(--lp-border);
          border-radius: 999px;
          font-family: 'Work Sans', sans-serif;
          font-size: 14px; font-weight: 400;
          transition: border-color .3s ease, background .3s ease;
        }
        .lp-btn-ghost:hover { border-color: var(--lp-violet); background: rgba(167,139,250,0.06); }
        .lp-aurora {
          position: absolute; inset: -20%;
          background:
            radial-gradient(600px 400px at 20% 30%, rgba(99,102,241,0.35), transparent 60%),
            radial-gradient(700px 500px at 80% 70%, rgba(167,139,250,0.28), transparent 60%),
            radial-gradient(500px 400px at 50% 90%, rgba(99,102,241,0.18), transparent 60%);
          filter: blur(20px);
          pointer-events: none;
          animation: lp-drift 22s ease-in-out infinite alternate;
        }
        @keyframes lp-drift {
          0% { transform: translate3d(0,0,0) scale(1); }
          100% { transform: translate3d(-3%, 2%, 0) scale(1.08); }
        }
        .lp-grain::after {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>");
          opacity: 0.06; mix-blend-mode: overlay;
        }
        .lp-marquee {
          display: flex; gap: 3rem; white-space: nowrap;
          animation: lp-marq 40s linear infinite;
        }
        @keyframes lp-marq {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .lp-divider { height: 1px; background: linear-gradient(90deg, transparent, var(--lp-border), transparent); }
        .lp-city-word {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2.5rem, 8vw, 6rem);
          line-height: 1;
          color: rgba(244,244,248,0.4);
          transition: color .4s ease, text-shadow .4s ease;
          cursor: default;
        }
        .lp-city-word:hover { color: var(--lp-text); text-shadow: 0 0 40px rgba(167,139,250,0.6); }
        .lp-light-wrap {
          background: linear-gradient(180deg, var(--lp-bg) 0%, #0a0a14 100%);
          padding: 4rem 0;
          position: relative;
        }
        .lp-light-wrap > * { filter: hue-rotate(0deg); }
        .lp-pricing-mask, .lp-faq-mask {
          background: radial-gradient(800px 400px at 50% 0%, rgba(99,102,241,0.12), transparent 70%), var(--lp-bg);
        }
      `}</style>

      <Navbar />

      <main>
        {/* Marquee */}
        <div className="overflow-hidden border-b" style={{ borderColor: "var(--lp-border)", background: "var(--lp-surface)" }}>
          <div className="lp-marquee py-3 lp-eyebrow">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex gap-12 pr-12">
                {["Mumbai", "Invite-only", "Delhi NCR", "Friends first", "Bengaluru", "Quietly verified", "Pune", "Story-first", "Gurgaon", "2026 cohort", "Hyderabad"].map((w) => (
                  <span key={w + k}>{w} <span style={{ opacity: 0.4 }}>·</span></span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* HERO */}
        <section className="relative overflow-hidden lp-grain" style={{ minHeight: "92vh", display: "flex", alignItems: "center" }}>
          <div className="lp-aurora" />
          <div className="container max-w-7xl relative py-24 md:py-32">
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
              <div>
                <p className="lp-eyebrow mb-8 animate-fade-in">— Invite-only · 2026 cohort</p>
                <h1 className="lp-h1 text-[3.25rem] sm:text-7xl md:text-8xl lg:text-[7.5rem] animate-fade-up">
                  A private circle
                  <br />
                  for your <span className="lp-italic" style={{ color: "var(--lp-violet)" }}>city.</span>
                </h1>
                <p className="lp-body mt-10 max-w-xl text-base md:text-lg animate-fade-up delay-100">
                  Unveil Now is a quietly curated room for modern, ambitious singles who'd rather meet five real ones than scroll five hundred strangers. Friends first. Chemistry next. Faces last.
                </p>
                <div className="mt-12 flex flex-col sm:flex-row gap-3 animate-fade-up delay-200">
                  <Link to="/signup" className="lp-btn-primary">Request my invite →</Link>
                  <a href="#room" className="lp-btn-ghost">See inside the room</a>
                </div>
                <p className="lp-eyebrow mt-10 animate-fade-up delay-300">Manually reviewed · Small entry keeps it private</p>
              </div>

              {/* Hero image collage */}
              <div className="relative hidden lg:block animate-fade-up delay-200">
                <div
                  className="aspect-[4/5] rounded-[2rem] overflow-hidden relative"
                  style={{
                    border: "1px solid var(--lp-border)",
                    boxShadow: "0 30px 80px -20px rgba(99,102,241,0.4)",
                  }}
                >
                  <img src={heroCouple} alt="" className="w-full h-full object-cover" style={{ filter: "saturate(0.85) contrast(1.05) brightness(0.85)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(7,7,12,0.85)), linear-gradient(135deg, rgba(99,102,241,0.25), rgba(167,139,250,0.15))", mixBlendMode: "multiply" }} />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="lp-eyebrow mb-2" style={{ color: "rgba(255,255,255,0.7)" }}>— Tonight in the room</p>
                    <p className="lp-serif text-2xl" style={{ color: "white" }}>14 founders · 9 designers · 6 doctors</p>
                  </div>
                </div>
                <div
                  className="absolute -top-6 -left-10 w-32 h-40 rounded-2xl overflow-hidden hidden xl:block"
                  style={{ border: "1px solid var(--lp-border)", boxShadow: "0 20px 50px -10px rgba(0,0,0,0.6)" }}
                >
                  <img src={coupleCafe} alt="" className="w-full h-full object-cover" style={{ filter: "saturate(0.7) brightness(0.8)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.3), transparent)", mixBlendMode: "overlay" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* THE ROOM */}
        <section id="room" className="py-28 md:py-40 relative overflow-hidden">
          <div className="container max-w-5xl">
            <p className="lp-eyebrow mb-10">— The room</p>
            <h2 className="lp-h2 text-4xl md:text-6xl lg:text-7xl max-w-4xl">
              A different kind of social life. <span className="lp-italic" style={{ color: "var(--lp-violet)" }}>Less feed.</span> More people.
            </h2>
            <div className="grid md:grid-cols-3 gap-12 mt-20">
              {[
                { k: "08", l: "Cities open" },
                { k: "412", l: "Profiles reviewed this week" },
                { k: "<48h", l: "Average response time" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="lp-serif text-5xl md:text-6xl" style={{ color: "var(--lp-violet)" }}>{s.k}</div>
                  <p className="lp-eyebrow mt-3">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* PILLARS */}
        <section className="py-28 md:py-40" style={{ background: "linear-gradient(180deg, var(--lp-bg), #09091200)" }}>
          <div className="container max-w-5xl">
            <p className="lp-eyebrow mb-16">— What makes the room, the room</p>
            <div>
              {pillars.map((p, i) => (
                <div key={p.n}>
                  <div className="grid md:grid-cols-[120px_1fr_2fr] gap-6 md:gap-12 py-10 md:py-14 items-baseline">
                    <div className="lp-serif text-3xl" style={{ color: "var(--lp-violet)" }}>{p.n}</div>
                    <h3 className="lp-h2 text-3xl md:text-4xl">{p.title}</h3>
                    <p className="lp-body text-base md:text-lg">{p.body}</p>
                  </div>
                  {i < pillars.length - 1 && <div className="lp-divider" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* LIFESTYLE */}
        <section className="relative py-28 md:py-40 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${coupleQuiet})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.18,
              mixBlendMode: "luminosity",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(167,139,250,0.3) 60%, transparent), linear-gradient(180deg, transparent, var(--lp-bg) 90%)",
              mixBlendMode: "multiply",
            }}
          />
          <div className="container max-w-5xl relative">
            <p className="lp-eyebrow mb-10">— Your kind of nights</p>
            <h2 className="lp-h2 text-4xl md:text-6xl lg:text-7xl max-w-3xl">
              The people you keep <span className="lp-italic">wishing</span> you'd meet.
            </h2>
            <p className="lp-body mt-8 max-w-xl text-base md:text-lg">
              Founders, creatives, doctors, designers, bankers, artists. Calendars full of intent — wine bars, slow Sundays, last-minute Goa plans. Unveil Now is where they quietly find each other.
            </p>
            <div className="mt-12 flex flex-wrap gap-3">
              {lifestyle.map((l) => (
                <span key={l} className="px-5 py-2.5 rounded-full text-sm" style={{ border: "1px solid var(--lp-border)", background: "rgba(15,15,24,0.6)", backdropFilter: "blur(8px)" }}>
                  {l}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* CITIES */}
        <section className="py-28 md:py-36">
          <div className="container max-w-6xl">
            <p className="lp-eyebrow mb-12 text-center">— Now opening in</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
              {cities.map((c) => (
                <span key={c} className="lp-city-word">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* HOW IT WORKS */}
        <section className="py-28 md:py-40">
          <div className="container max-w-5xl">
            <p className="lp-eyebrow mb-16">— How it works</p>
            <div className="grid md:grid-cols-3 gap-12 md:gap-8">
              {steps.map((s) => (
                <div key={s.n}>
                  <div className="lp-serif lp-italic text-4xl mb-6" style={{ color: "var(--lp-violet)" }}>{s.n}</div>
                  <h3 className="lp-h2 text-2xl md:text-3xl mb-3">{s.t}</h3>
                  <p className="lp-body text-sm md:text-base">{s.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* MEMBERS SAY */}
        <section className="py-28 md:py-40 relative overflow-hidden">
          <div className="lp-aurora" style={{ opacity: 0.5 }} />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${coupleWarm})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.12,
              mixBlendMode: "luminosity",
              maskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 70%)",
            }}
          />
          <div className="container max-w-4xl text-center relative">
            <p className="lp-eyebrow mb-10">— Members say</p>
            <p className="lp-serif lp-italic text-3xl md:text-5xl leading-tight" style={{ color: "var(--lp-text)" }}>
              "It felt less like an app and more like being introduced by a friend who actually <span style={{ color: "var(--lp-violet)" }}>knows</span> the room."
            </p>
            <p className="lp-eyebrow mt-8">A · Founder, Mumbai</p>
          </div>
        </section>

        {/* PRICING — light intermission band */}
        <div style={{ background: "#F4F4F8", color: "#0a0a14" }}>
          <Pricing />
        </div>

        {/* FAQ — light intermission band */}
        <div style={{ background: "#EDEDF2", color: "#0a0a14" }}>
          <FAQ />
        </div>

        <div className="lp-divider" />

        {/* FINAL CTA */}
        <section className="py-28 md:py-40 relative overflow-hidden">
          <div className="lp-aurora" />
          <div className="container max-w-4xl text-center relative">
            <p className="lp-eyebrow mb-8">— One last thing</p>
            <h2 className="lp-h2 text-4xl md:text-6xl lg:text-7xl">
              The city is <span className="lp-italic">quieter</span> than your feed.
              <br />Step in.
            </h2>
            <div className="mt-12">
              <Link to="/signup" className="lp-btn-primary">Request my invite →</Link>
            </div>
            <p className="lp-eyebrow mt-8">Manually reviewed · Privacy-first · Story-first</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LP;
