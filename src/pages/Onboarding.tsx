import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, ArrowLeft, ArrowRight, Mic, Camera, EyeOff } from "lucide-react";

const steps = [
  "Basics",
  "Your story",
  "Interests",
  "Intent",
  "Voice intro",
  "Photos",
];

const interests = [
  "Travel", "Books", "Fitness", "Music", "Food", "Entrepreneurship",
  "Films", "Art", "Yoga", "Tech", "Photography", "Writing", "Coffee",
  "Hiking", "Cooking", "Theatre", "Spirituality", "Startups",
];

const intents = [
  { id: "serious", label: "Serious relationship", desc: "I'm ready to invest in something real." },
  { id: "marriage", label: "Marriage minded", desc: "Looking for a long-term life partner." },
  { id: "exploring", label: "Exploring intentionally", desc: "Open, but only with depth." },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [intent, setIntent] = useState<string>("");

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      toast.success("Profile created. Welcome to Unveil.");
      navigate("/dashboard");
    }
  };
  const back = () => step > 0 && setStep(step - 1);

  const toggleInterest = (i: string) => {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 8 ? [...prev, i] : prev
    );
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border/50 bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-3xl flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-sm leading-none pb-0.5">U</span>
            </div>
            <span className="font-display text-lg">Unveil</span>
          </Link>
          <div className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</div>
        </div>
        <div className="container max-w-3xl pb-3">
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-romance transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl py-12 md:py-16">
        <div className="animate-fade-up" key={step}>
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">
            {steps[step]}
          </p>

          {step === 0 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Tell us about you.</h1>
              <p className="text-muted-foreground mb-10">Just the basics. We'll get to the good stuff next.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name"><Input className="h-11 rounded-xl" placeholder="Aanya" /></Field>
                <Field label="Age"><Input className="h-11 rounded-xl" type="number" placeholder="28" /></Field>
                <Field label="Gender">
                  <select className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                    <option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </Field>
                <Field label="City"><Input className="h-11 rounded-xl" placeholder="Bengaluru" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Profession"><Input className="h-11 rounded-xl" placeholder="Product designer at Acme" /></Field>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Your story, in your words.</h1>
              <p className="text-muted-foreground mb-10">These prompts are how people will first meet you. Be honest, not polished.</p>
              <div className="space-y-6">
                <Prompt label="My ideal Sunday looks like…" placeholder="Slow mornings, a good book, biryani for lunch…" />
                <Prompt label="I value…" placeholder="Honesty, curiosity, and a sense of humour…" />
                <Prompt label="A green flag I admire…" placeholder="Someone who calls their mum on Sundays…" />
                <Prompt label="A random truth about me…" placeholder="I cried watching Up. The first 10 minutes." />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">What lights you up?</h1>
              <p className="text-muted-foreground mb-10">Pick up to 8 things you genuinely love.</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((i) => {
                  const active = selectedInterests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : "bg-background border-border hover:border-accent/60"
                      }`}
                    >
                      {active && <Check className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />}
                      {i}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-4">{selectedInterests.length}/8 selected</p>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">What are you here for?</h1>
              <p className="text-muted-foreground mb-10">No judgement. Just clarity.</p>
              <div className="space-y-3">
                {intents.map((i) => {
                  const active = intent === i.id;
                  return (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => setIntent(i.id)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all ${
                        active
                          ? "bg-card border-primary shadow-elegant"
                          : "bg-card border-border hover:border-accent/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                          {active && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div>
                          <div className="font-display text-lg">{i.label}</div>
                          <div className="text-sm text-muted-foreground">{i.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Say hi, out loud.</h1>
              <p className="text-muted-foreground mb-10">A 30-second voice intro. People match 3x more often when they hear your voice.</p>
              <div className="rounded-3xl border border-border bg-card p-12 text-center shadow-card">
                <div className="mx-auto h-24 w-24 rounded-full bg-gradient-romance flex items-center justify-center shadow-glow animate-float">
                  <Mic className="h-10 w-10 text-primary-foreground" />
                </div>
                <p className="font-display text-2xl mt-6">Tap to record</p>
                <p className="text-sm text-muted-foreground mt-2">Try answering: "What's something you can talk about for hours?"</p>
                <Button variant="soft" className="mt-6 rounded-full">Skip for now</Button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Your photos. Hidden by default.</h1>
              <p className="text-muted-foreground mb-10">Upload up to 6. They stay private until you and a match both choose to unveil.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <button
                    key={i}
                    className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-2 hover:border-accent/60 hover:bg-secondary/70 transition-all"
                  >
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add photo</span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-secondary/60 border border-border/60">
                <EyeOff className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Your photos are encrypted and never shown until both people in a match opt in to reveal.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="hero" onClick={next} className="rounded-full">
            {step === steps.length - 1 ? "Finish" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

const Prompt = ({ label, placeholder }: { label: string; placeholder: string }) => (
  <div className="space-y-2">
    <Label className="font-display text-base">{label}</Label>
    <Textarea placeholder={placeholder} className="rounded-2xl min-h-[88px] resize-none" />
  </div>
);

export default Onboarding;
