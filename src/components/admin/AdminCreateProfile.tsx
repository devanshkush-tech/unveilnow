import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { adminAuth } from "@/lib/adminAuth";

type PromptRow = { question: string; answer: string };

const DEFAULT_PROMPTS: PromptRow[] = [
  { question: "A perfect Sunday for me looks like…", answer: "" },
  { question: "Two truths and a lie…", answer: "" },
  { question: "I'll fall for you if…", answer: "" },
];

const AdminCreateProfile = ({ onCreated }: { onCreated?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", first_name: "", age: "", gender: "Woman",
    city: "", looking_for: "Everyone", story: "", plan: "premium",
    interests: "",
  });
  const [prompts, setPrompts] = useState<PromptRow[]>(DEFAULT_PROMPTS);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setPrompt = (i: number, k: keyof PromptRow, v: string) =>
    setPrompts((arr) => arr.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)));
  const addPrompt = () => setPrompts((arr) => [...arr, { question: "", answer: "" }]);
  const removePrompt = (i: number) => setPrompts((arr) => arr.filter((_, idx) => idx !== i));

  const reset = () => {
    setForm({ email: "", password: "", first_name: "", age: "", gender: "Woman", city: "", looking_for: "Everyone", story: "", plan: "premium", interests: "" });
    setPrompts(DEFAULT_PROMPTS);
  };

  const submit = async () => {
    if (!form.email || !form.password || !form.first_name) {
      toast.error("Email, password and first name are required.");
      return;
    }
    setBusy(true);
    try {
      const cleanPrompts = prompts.filter((p) => p.question.trim() && p.answer.trim());
      const cleanInterests = form.interests
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await adminAuth.call("create_admin_profile", {
        ...form,
        age: form.age ? Number(form.age) : null,
        prompts: cleanPrompts,
        interests: cleanInterests,
      });
      toast.success("Profile created.");
      setOpen(false);
      reset();
      onCreated?.();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" className="rounded-full"><UserPlus className="h-4 w-4" /> Create Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Create new member profile</DialogTitle>
        </DialogHeader>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <Field label="Email"><Input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" className="h-11 rounded-xl" /></Field>
          <Field label="Temporary password"><Input value={form.password} onChange={(e) => set("password", e.target.value)} type="text" className="h-11 rounded-xl" /></Field>
          <Field label="First name"><Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className="h-11 rounded-xl" /></Field>
          <Field label="Age"><Input value={form.age} onChange={(e) => set("age", e.target.value)} type="number" className="h-11 rounded-xl" /></Field>
          <Field label="Gender">
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3 w-full text-sm">
              <option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option>
            </select>
          </Field>
          <Field label="Interested in">
            <select value={form.looking_for} onChange={(e) => set("looking_for", e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3 w-full text-sm">
              <option>Women</option><option>Men</option><option>Everyone</option>
            </select>
          </Field>
          <Field label="City"><Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-11 rounded-xl" /></Field>
          <Field label="Plan">
            <select value={form.plan} onChange={(e) => set("plan", e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3 w-full text-sm">
              <option value="starter">Starter</option><option value="premium">Premium</option><option value="elite">Elite</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio / story"><Textarea value={form.story} onChange={(e) => set("story", e.target.value)} className="rounded-xl min-h-[100px]" /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Interests (comma separated)">
              <Input value={form.interests} onChange={(e) => set("interests", e.target.value)} placeholder="Travel, Coffee, Indie music, Trekking" className="h-11 rounded-xl" />
            </Field>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">Prompts</Label>
            <Button type="button" variant="soft" size="sm" className="rounded-full" onClick={addPrompt}>
              <Plus className="h-3.5 w-3.5" /> Add prompt
            </Button>
          </div>
          <div className="space-y-3">
            {prompts.map((p, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-secondary/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={p.question}
                    onChange={(e) => setPrompt(i, "question", e.target.value)}
                    placeholder="Prompt question"
                    className="h-10 rounded-xl text-sm"
                  />
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removePrompt(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={p.answer}
                  onChange={(e) => setPrompt(i, "answer", e.target.value)}
                  placeholder="Their answer…"
                  className="rounded-xl min-h-[70px] text-sm"
                />
              </div>
            ))}
            {prompts.length === 0 && (
              <p className="text-xs text-muted-foreground">No prompts yet. Add one to make the profile feel real.</p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="hero" className="rounded-full" onClick={submit} disabled={busy}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</> : "Create profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    {children}
  </div>
);

export default AdminCreateProfile;
