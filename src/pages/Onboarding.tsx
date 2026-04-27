import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, ArrowLeft, ArrowRight, Camera, EyeOff, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const stepLabels = ["Basics", "Your story", "Interests", "Intent", "Photos"];

const interestOptions = [
  "Travel", "Books", "Fitness", "Music", "Food", "Entrepreneurship",
  "Films", "Art", "Yoga", "Tech", "Photography", "Writing", "Coffee",
  "Hiking", "Cooking", "Theatre", "Spirituality", "Startups",
];

const intents = [
  { id: "serious", label: "Serious relationship", desc: "I'm ready to invest in something real." },
  { id: "marriage", label: "Marriage minded", desc: "Looking for a long-term life partner." },
  { id: "exploring", label: "Exploring intentionally", desc: "Open, but only with depth." },
];

const promptQuestions = [
  "My ideal Sunday looks like…",
  "I value…",
  "A green flag I admire…",
  "A random truth about me…",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState("Woman");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [intent, setIntent] = useState<string>("");
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const toggleInterest = (i: string) => {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 8 ? [...prev, i] : prev
    );
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 6 - photos.length;
    const next = files.slice(0, remaining).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos((p) => [...p, ...next]);
    e.target.value = "";
  };

  const removePhoto = (i: number) =>
    setPhotos((p) => p.filter((_, idx) => idx !== i));

  const validateStep = () => {
    if (step === 0) {
      if (!firstName || !age || !city) {
        toast.error("Please fill in your basics.");
        return false;
      }
    }
    if (step === 1 && answers.some((a) => !a.trim())) {
      toast.error("Share something for each prompt — even short answers.");
      return false;
    }
    if (step === 2 && selectedInterests.length < 3) {
      toast.error("Pick at least 3 interests.");
      return false;
    }
    if (step === 3 && !intent) {
      toast.error("Tell us what you're here for.");
      return false;
    }
    return true;
  };

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Upload photos
      const uploaded: { storage_path: string; position: number }[] = [];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i].file;
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("photos").upload(path, file, {
          cacheControl: "3600", upsert: false,
        });
        if (upErr) throw upErr;
        uploaded.push({ storage_path: path, position: i });
      }

      const { error: pErr } = await supabase.from("profiles").update({
        first_name: firstName,
        age: Number(age),
        gender,
        city,
        profession,
        intent,
        onboarded: true,
      }).eq("id", user.id);
      if (pErr) throw pErr;

      await supabase.from("profile_prompts").delete().eq("user_id", user.id);
      const promptRows = promptQuestions.map((q, i) => ({
        user_id: user.id, question: q, answer: answers[i], position: i,
      }));
      if (promptRows.length) await supabase.from("profile_prompts").insert(promptRows);

      await supabase.from("profile_interests").delete().eq("user_id", user.id);
      if (selectedInterests.length) {
        await supabase.from("profile_interests").insert(
          selectedInterests.map((interest) => ({ user_id: user.id, interest }))
        );
      }

      if (uploaded.length) {
        await supabase.from("profile_photos").insert(
          uploaded.map((u) => ({ user_id: user.id, ...u }))
        );
      }

      toast.success("Profile created. Welcome to Unveil.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < stepLabels.length - 1) setStep(step + 1);
    else finish();
  };
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <header className="border-b border-border/50 bg-background/70 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-3xl flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-sm leading-none pb-0.5">U</span>
            </div>
            <span className="font-display text-lg">Unveil</span>
          </Link>
          <div className="text-xs text-muted-foreground">Step {step + 1} of {stepLabels.length}</div>
        </div>
        <div className="container max-w-3xl pb-3">
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-romance transition-all duration-500"
              style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-2xl py-12 md:py-16">
        <div className="animate-fade-up" key={step}>
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">
            {stepLabels[step]}
          </p>

          {step === 0 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Tell us about you.</h1>
              <p className="text-muted-foreground mb-10">Just the basics. We'll get to the good stuff next.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First name"><Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-11 rounded-xl" placeholder="Aanya" /></Field>
                <Field label="Age"><Input value={age} onChange={(e) => setAge(e.target.value)} className="h-11 rounded-xl" type="number" min={18} max={99} placeholder="28" /></Field>
                <Field label="Gender">
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                    <option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </Field>
                <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl" placeholder="Bengaluru" /></Field>
                <div className="sm:col-span-2">
                  <Field label="Profession"><Input value={profession} onChange={(e) => setProfession(e.target.value)} className="h-11 rounded-xl" placeholder="Product designer at Acme" /></Field>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Your story, in your words.</h1>
              <p className="text-muted-foreground mb-10">These prompts are how people will first meet you. Be honest, not polished.</p>
              <div className="space-y-6">
                {promptQuestions.map((q, i) => (
                  <div key={q} className="space-y-2">
                    <Label className="font-display text-base">{q}</Label>
                    <Textarea
                      value={answers[i]}
                      onChange={(e) => setAnswers((a) => a.map((v, idx) => idx === i ? e.target.value : v))}
                      placeholder="A few honest sentences…"
                      className="rounded-2xl min-h-[88px] resize-none"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">What lights you up?</h1>
              <p className="text-muted-foreground mb-10">Pick up to 8 things you genuinely love.</p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((i) => {
                  const active = selectedInterests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        active ? "bg-primary text-primary-foreground border-primary shadow-soft" : "bg-background border-border hover:border-accent/60"
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
                        active ? "bg-card border-primary shadow-elegant" : "bg-card border-border hover:border-accent/60"
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
              <h1 className="font-display text-4xl md:text-5xl mb-3">Your photos. Hidden by default.</h1>
              <p className="text-muted-foreground mb-10">Upload up to 6. They stay private until you and a match both choose to unveil.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border">
                    <img src={p.preview} alt="upload" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/90 flex items-center justify-center shadow-soft" aria-label="Remove photo">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="aspect-[3/4] rounded-2xl border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-2 hover:border-accent/60 hover:bg-secondary/70 transition-all cursor-pointer">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Add photo</span>
                    <input type="file" accept="image/*" multiple onChange={onPickPhoto} className="hidden" />
                  </label>
                )}
              </div>
              <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-secondary/60 border border-border/60">
                <EyeOff className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Your photos are private and never shown until both people in a match opt in to reveal.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0 || saving}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="hero" onClick={next} disabled={saving} className="rounded-full">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : (
              <>{step === stepLabels.length - 1 ? "Finish" : "Continue"} <ArrowRight className="h-4 w-4" /></>
            )}
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

export default Onboarding;
