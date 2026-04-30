import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminAuth } from "@/lib/adminAuth";

const AdminCreateProfile = ({ onCreated }: { onCreated?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    email: "", password: "", first_name: "", age: "", gender: "Woman",
    city: "", looking_for: "Everyone", story: "", plan: "premium",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.email || !form.password || !form.first_name) {
      toast.error("Email, password and first name are required.");
      return;
    }
    setBusy(true);
    try {
      await adminAuth.call("create_admin_profile", {
        ...form,
        age: form.age ? Number(form.age) : null,
      });
      toast.success("Profile created.");
      setOpen(false);
      setForm({ email: "", password: "", first_name: "", age: "", gender: "Woman", city: "", looking_for: "Everyone", story: "", plan: "premium" });
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
        </div>
        <DialogFooter className="mt-4">
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
