import { useEffect, useState } from "react";
import { Navigate, useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, ArrowLeft, ArrowRight, Camera, EyeOff, Loader2, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { VoiceRecorder } from "@/components/dating/VoiceRecorder";

const stepLabels = ["Basics", "Preferences", "Prompts", "Story", "Voice", "Photos"];
const TOTAL_STEPS = stepLabels.length;

const interestOptions = [
  "Travel",
  "Books",
  "Fitness",
  "Music",
  "Food",
  "Entrepreneurship",
  "Films",
  "Art",
  "Yoga",
  "Tech",
  "Photography",
  "Writing",
  "Coffee",
  "Hiking",
  "Cooking",
  "Theatre",
  "Spirituality",
  "Startups",
];

const intents = [
  { id: "serious", label: "Serious relationship", desc: "I'm ready to invest in something real." },
  { id: "marriage", label: "Marriage minded", desc: "Looking for a long-term life partner." },
  { id: "exploring", label: "Exploring intentionally", desc: "Open, but only with depth." },
];

const lookingForOptions = ["Women", "Men", "Everyone"];

type PromptAnswer = { prompt_id: string; question: string; answer: string };

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get("edit") === "1";
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState("Woman");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");

  // Step 2
  const [lookingFor, setLookingFor] = useState("Everyone");
  const [ageMin, setAgeMin] = useState("24");
  const [ageMax, setAgeMax] = useState("40");
  const [distanceKm, setDistanceKm] = useState("50");
  const [intent, setIntent] = useState<string>("");

  // Step 3 — prompts
  const [library, setLibrary] = useState<{ id: string; text: string; category: string }[]>([]);
  const [picked, setPicked] = useState<PromptAnswer[]>([]);

  // Step 4 — story
  const [story, setStory] = useState("");

  // Step 4.5 - interests (kept inside step 3 layout? we keep on Story step under bio)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Step 5 — voice
  const [voicePath, setVoicePath] = useState<string | null>(null);

  // Step 6 — photos
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; storage_path: string }[]>([]);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);

  // Hydrate
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setHydrating(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: profRows }, { data: lib }, { data: prompts }, { data: ints }, { data: pics }] = await Promise.all([
        supabase.rpc("get_my_profile"),
        supabase.from("prompts_library").select("id, text, category").eq("active", true).order("position"),
        supabase
          .from("profile_prompts")
          .select("id, question, answer, position")
          .eq("user_id", user.id)
          .order("position"),
        supabase.from("profile_interests").select("interest").eq("user_id", user.id),
        supabase.from("profile_photos").select("id, storage_path, position").eq("user_id", user.id).order("position"),
      ]);
      const prof = Array.isArray(profRows) ? profRows[0] : null;
      if (cancelled) return;

      if (prof) {
        setFirstName(prof.first_name ?? "");
        setAge(prof.age ? String(prof.age) : "");
        setGender(prof.gender ?? "Woman");
        setCity(prof.city ?? "");
        setProfession(prof.profession ?? "");
        setIntent(prof.intent ?? "");
        setStory(prof.story ?? "");
        setLookingFor(prof.looking_for ?? "Everyone");
        setAgeMin(String(prof.age_min ?? 24));
        setAgeMax(String(prof.age_max ?? 40));
        setDistanceKm(String(prof.distance_km ?? 50));
        setVoicePath(prof.voice_intro_path ?? null);
        // Resume on saved step (cap at last index)
        const savedStep = Math.min(Math.max(prof.onboarding_step ?? 0, 0), TOTAL_STEPS - 1);
        setStep(savedStep);
        if (prof.account_status === "active" && !editMode) {
          setRedirectTo("/dashboard");
          setHydrating(false);
          return;
        }
        if (prof.onboarded && !editMode) {
          const destination =
            prof.payment_status === "pending" ? "/payment/review" : "/payment";
          setRedirectTo(destination);
          setHydrating(false);
          return;
        }
      }

      setLibrary(lib ?? []);

      if (prompts && prompts.length > 0) {
        // map saved prompts to library entries by question text
        const libByText = new Map((lib ?? []).map((l) => [l.text, l]));
        setPicked(
          prompts.map((p) => ({
            prompt_id: libByText.get(p.question)?.id ?? p.id,
            question: p.question,
            answer: p.answer,
          })),
        );
      }

      setSelectedInterests((ints ?? []).map((i) => i.interest));
      setExistingPhotos(pics ?? []);
      setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, editMode]);

  const persistStep = async (nextStep: number) => {
    if (!user) return;
    const updates: Partial<{
      onboarding_step: number;
      first_name: string;
      age: number | null;
      gender: string;
      city: string;
      profession: string;
      looking_for: string;
      age_min: number;
      age_max: number;
      distance_km: number;
      intent: string;
      story: string;
    }> = { onboarding_step: nextStep };

    if (step === 0) {
      Object.assign(updates, {
        first_name: firstName,
        age: age ? Number(age) : null,
        gender,
        city,
        profession,
      });
    }
    if (step === 1) {
      Object.assign(updates, {
        looking_for: lookingFor,
        age_min: Number(ageMin) || 24,
        age_max: Number(ageMax) || 40,
        distance_km: Number(distanceKm) || 50,
        intent,
      });
    }
    if (step === 3) {
      Object.assign(updates, { story });
    }

    const { error: updErr } = await supabase.from("profiles").update(updates).eq("id", user.id);
    if (updErr) {
      console.error("[onboarding] persistStep profile update failed", { step, updErr });
      throw updErr;
    }

    if (step === 2) {
      const { error: delErr } = await supabase.from("profile_prompts").delete().eq("user_id", user.id);
      if (delErr) {
        console.error("[onboarding] persistStep prompts delete failed", delErr);
        throw delErr;
      }
      if (picked.length) {
        const { error: insErr } = await supabase.from("profile_prompts").insert(
          picked.map((p, i) => ({
            user_id: user.id,
            question: p.question,
            answer: p.answer,
            position: i,
          })),
        );
        if (insErr) {
          console.error("[onboarding] persistStep prompts insert failed", insErr);
          throw insErr;
        }
      }
      // Save interests too (we expose interests on prompts step block)
      const { error: intDelErr } = await supabase
        .from("profile_interests")
        .delete()
        .eq("user_id", user.id);
      if (intDelErr) {
        console.error("[onboarding] persistStep interests delete failed", intDelErr);
        throw intDelErr;
      }
      if (selectedInterests.length) {
        const { error: intInsErr } = await supabase
          .from("profile_interests")
          .insert(selectedInterests.map((interest) => ({ user_id: user.id, interest })));
        if (intInsErr) {
          console.error("[onboarding] persistStep interests insert failed", intInsErr);
          throw intInsErr;
        }
      }
    }
    console.info("[onboarding] step advance", { from: step, to: nextStep, savedOk: true });
  };

  const toggleInterest = (i: string) => {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 8 ? [...prev, i] : prev,
    );
  };

  const togglePrompt = (lib: { id: string; text: string }) => {
    setPicked((prev) => {
      if (prev.some((p) => p.prompt_id === lib.id)) {
        return prev.filter((p) => p.prompt_id !== lib.id);
      }
      if (prev.length >= 5) {
        toast("You've already picked 5 prompts.", { description: "Remove one to swap." });
        return prev;
      }
      return [...prev, { prompt_id: lib.id, question: lib.text, answer: "" }];
    });
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 6 - (existingPhotos.length + photos.length);
    const next = files.slice(0, remaining).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos((p) => [...p, ...next]);
    e.target.value = "";
  };

  const removeNewPhoto = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));
  const removeExistingPhoto = async (id: string, path: string) => {
    await supabase.storage.from("photos").remove([path]);
    await supabase.from("profile_photos").delete().eq("id", id);
    setExistingPhotos((p) => p.filter((x) => x.id !== id));
  };

  const validateStep = () => {
    if (step === 0) {
      if (!firstName || !age || !city) {
        toast.error("Please fill in your basics.");
        return false;
      }
    }
    if (step === 1) {
      if (!intent) {
        toast.error("Tell us what you're here for.");
        return false;
      }
    }
    if (step === 2) {
      if (picked.length !== 5) {
        toast.error("Pick exactly 5 prompts to share.");
        return false;
      }
      if (picked.some((p) => !p.answer.trim())) {
        toast.error("Answer each of your chosen prompts — even a sentence helps.");
        return false;
      }
      if (selectedInterests.length < 3) {
        toast.error("Pick at least 3 interests.");
        return false;
      }
    }
    if (step === 3 && story.trim().length < 40) {
      toast.error("Share a few honest sentences about yourself (40+ characters).");
      return false;
    }
    return true;
  };

  const finish = async () => {
    if (!user) return;

    setSaving(true);

    try {
      // Upload new photos
      const baseIdx = existingPhotos.length;

      const uploaded = await Promise.all(
        photos.map(async ({ file }, i) => {
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

          const { error: upErr } = await supabase.storage.from("photos").upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

          if (upErr) throw upErr;

          return {
            storage_path: path,
            position: baseIdx + i,
          };
        }),
      );

      // Save uploaded photos
      if (uploaded.length) {
        const { error: insErr } = await supabase
          .from("profile_photos")
          .insert(uploaded.map((u) => ({ user_id: user.id, ...u })));

        if (insErr) throw insErr;
      }

      // Mark onboarding complete
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          onboarded: true,
          onboarding_step: TOTAL_STEPS - 1,
        })
        .eq("id", user.id);

      if (pErr) {
        console.error("[onboarding] finish failed", { step: "profiles.update", error: pErr });
        throw pErr;
      }

      // Read back to confirm the write is visible to our session before
      // navigating — otherwise RequireAuth on /payment may still see the
      // pre-update value and bounce back to /onboarding.
      let confirmed = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: check, error: chkErr } = await supabase
          .from("profiles")
          .select("onboarded")
          .eq("id", user.id)
          .maybeSingle();
        if (!chkErr && check?.onboarded) {
          confirmed = true;
          break;
        }
        console.warn("[onboarding] finish read-back not yet visible", { attempt, chkErr });
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!confirmed) {
        console.error("[onboarding] finish read-back never confirmed onboarded=true");
        toast.error("Saved, but we couldn't confirm. Please refresh the page.");
        setSaving(false);
        return;
      }

      toast.success(editMode ? "Profile updated." : "Profile created successfully!");

      // Navigate immediately. RequireAuth refetches the profile gate on
      // route change so /payment will see onboarded=true on first paint.
      navigate(editMode ? "/dashboard/profile" : "/payment", { replace: true });
    } catch (err) {
      console.error(err);

      toast.error(err instanceof Error ? err.message : "Could not save profile.");

      setSaving(false);
    }
  };

  const next = async () => {
    if (!validateStep()) return;
    const isLast = step === TOTAL_STEPS - 1;
    if (isLast) {
      // finish() handles its own loading + errors + redirect.
      await finish();
      return;
    }
    setSaving(true);
    try {
      await persistStep(step + 1);
      setStep((s) => s + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save progress.");
    } finally {
      setSaving(false);
    }
  };

  const back = () => step > 0 && setStep((s) => s - 1);

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (authLoading || hydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          <div className="text-xs text-muted-foreground">
            Step {step + 1} of {TOTAL_STEPS}
          </div>
        </div>
        <div className="container max-w-3xl pb-3">
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-romance transition-all duration-500"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
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
                <Field label="First name">
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Aanya"
                  />
                </Field>
                <Field label="Age">
                  <Input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="h-11 rounded-xl"
                    type="number"
                    min={18}
                    max={99}
                    placeholder="28"
                  />
                </Field>
                <Field label="Gender">
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
                  >
                    <option>Woman</option>
                    <option>Man</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </Field>
                <Field label="City">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-11 rounded-xl"
                    placeholder="Bengaluru"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Occupation">
                    <Input
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="h-11 rounded-xl"
                      placeholder="Product designer at Acme"
                    />
                  </Field>
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Who are you here for?</h1>
              <p className="text-muted-foreground mb-10">Set the kind of connection you're looking for.</p>

              <div className="space-y-6">
                <Field label="Interested in">
                  <div className="flex flex-wrap gap-2">
                    {lookingForOptions.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setLookingFor(o)}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${
                          lookingFor === o
                            ? "bg-primary text-primary-foreground border-primary shadow-soft"
                            : "bg-background border-border hover:border-accent/60"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Age range">
                    <div className="flex items-center gap-3">
                      <Input
                        value={ageMin}
                        onChange={(e) => setAgeMin(e.target.value)}
                        type="number"
                        min={18}
                        max={99}
                        className="h-11 rounded-xl"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        value={ageMax}
                        onChange={(e) => setAgeMax(e.target.value)}
                        type="number"
                        min={18}
                        max={99}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  </Field>
                  <Field label="Distance preference (km)">
                    <Input
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(e.target.value)}
                      type="number"
                      min={1}
                      max={5000}
                      className="h-11 rounded-xl"
                    />
                  </Field>
                </div>

                <Field label="Relationship goal">
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
                            <div
                              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${active ? "border-primary bg-primary" : "border-muted-foreground/40"}`}
                            >
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
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Choose 5 prompts.</h1>
              <p className="text-muted-foreground mb-6">
                These are how people first meet you. Pick the 5 that feel most you.
              </p>
              <p className="text-sm text-primary font-medium mb-6">{picked.length}/5 chosen</p>

              <div className="grid sm:grid-cols-2 gap-2 mb-10">
                {library.map((l) => {
                  const active = picked.some((p) => p.prompt_id === l.id);
                  const disabled = !active && picked.length >= 5;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => togglePrompt(l)}
                      disabled={disabled}
                      className={`text-left p-3.5 rounded-2xl border text-sm transition-all ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : disabled
                            ? "bg-background border-border opacity-50 cursor-not-allowed"
                            : "bg-background border-border hover:border-accent/60"
                      }`}
                    >
                      {active && <Check className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />}
                      {l.text}
                    </button>
                  );
                })}
              </div>

              {picked.length > 0 && (
                <div className="space-y-5 mb-10">
                  <h3 className="font-display text-2xl">Your answers</h3>
                  {picked.map((p, i) => (
                    <div key={p.prompt_id} className="space-y-2">
                      <Label className="font-display text-base">{p.question}</Label>
                      <Textarea
                        value={p.answer}
                        onChange={(e) =>
                          setPicked((prev) => prev.map((x, idx) => (idx === i ? { ...x, answer: e.target.value } : x)))
                        }
                        placeholder="A few honest sentences…"
                        className="rounded-2xl min-h-[88px] resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <Label className="font-display text-base mb-3 block">What lights you up?</Label>
                <p className="text-xs text-muted-foreground mb-3">Pick 3 to 8 things you genuinely love.</p>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map((i) => {
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
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">My story.</h1>
              <p className="text-muted-foreground mb-10">
                Read me before you judge me. Tell people who you are, what shaped you, and what you're looking for.
              </p>
              <Textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Tell people who you are, what shaped you, what matters to you, and what kind of connection you're looking for."
                className="rounded-2xl min-h-[280px] resize-none text-base leading-relaxed"
                maxLength={1500}
              />
              <p className="text-xs text-muted-foreground mt-2 text-right">{story.length}/1500</p>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Your voice.</h1>
              <p className="text-muted-foreground mb-10">
                Optional. Let people hear your vibe before seeing your face.
              </p>
              <VoiceRecorder
                existingPath={voicePath}
                onUploaded={async (path) => {
                  setVoicePath(path);
                  if (user) await supabase.from("profiles").update({ voice_intro_path: path }).eq("id", user.id);
                }}
                onCleared={async () => {
                  setVoicePath(null);
                  if (user) await supabase.from("profiles").update({ voice_intro_path: null }).eq("id", user.id);
                }}
              />
              <div className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-secondary/60 border border-border/60">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Members with a voice intro get 3× more meaningful interest. Skip it if it's not for you.
                </p>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="font-display text-4xl md:text-5xl mb-3">Photos. Hidden by default.</h1>
              <p className="text-muted-foreground mb-10">
                Upload up to 6. They stay private until you and a match both choose to unveil.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {existingPhotos.map((p) => (
                  <div
                    key={p.id}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-secondary/40 flex items-center justify-center"
                  >
                    <EyeOff className="h-6 w-6 text-muted-foreground" />
                    <button
                      onClick={() => removeExistingPhoto(p.id, p.storage_path)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/90 flex items-center justify-center shadow-soft"
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border">
                    <img src={p.preview} alt="upload" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeNewPhoto(i)}
                      className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/90 flex items-center justify-center shadow-soft"
                      aria-label="Remove photo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {existingPhotos.length + photos.length < 6 && (
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
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                {step === TOTAL_STEPS - 1 ? "Finish" : "Continue"} <ArrowRight className="h-4 w-4" />
              </>
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
