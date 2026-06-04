import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2, Check, X, Send, RefreshCw, Users, IndianRupee, Activity, Clock, MapPin, Sparkles } from "lucide-react";
import { adminAuth } from "@/lib/adminAuth";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type BdUser = {
  user_id: string; name: string; email: string; phone: string;
  gender: string; age: number | null; city: string;
  plan: string; paid: boolean; is_trial: boolean; trial_expires_at: string | null;
  chats_remaining: number; sessions_used: number; notes: string | null;
  completed: boolean; extended_completed: boolean;
};
type Package = { id: string; name: string; price: number; matches: number; active: boolean };
type Question = { id?: string; key: string; prompt: string; type: string; options: any[]; position: number; active: boolean };

export default function BlindDateAdminConsole() {
  return (
    <Tabs defaultValue="dashboard" className="space-y-6">
      <TabsList className="rounded-full p-1 h-12 bg-secondary flex-wrap">
        <TabsTrigger value="dashboard" className="rounded-full px-5">Dashboard</TabsTrigger>
        <TabsTrigger value="users" className="rounded-full px-5">Users</TabsTrigger>
        <TabsTrigger value="dummy" className="rounded-full px-5">Dummy Accounts</TabsTrigger>
        <TabsTrigger value="questions" className="rounded-full px-5">Questions</TabsTrigger>
        <TabsTrigger value="packages" className="rounded-full px-5">Packages</TabsTrigger>
        <TabsTrigger value="payments" className="rounded-full px-5">Payments</TabsTrigger>
        <TabsTrigger value="matches" className="rounded-full px-5">Matches</TabsTrigger>
        <TabsTrigger value="notifications" className="rounded-full px-5">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard"><BdDashboard /></TabsContent>
      <TabsContent value="users"><BdUsers /></TabsContent>
      <TabsContent value="dummy"><BdDummy /></TabsContent>
      <TabsContent value="questions"><BdQuestions /></TabsContent>
      <TabsContent value="packages"><BdPackages /></TabsContent>
      <TabsContent value="payments"><BdPayments /></TabsContent>
      <TabsContent value="matches"><BdMatches /></TabsContent>
      <TabsContent value="notifications"><BdNotificationsTab /></TabsContent>
    </Tabs>
  );
}

/* ───────── Dashboard ───────── */
function BdDashboard() {
  const [m, setM] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { setM(await adminAuth.call("bd_metrics")); }
      catch (e: any) { toast.error(e.message); }
      setLoading(false);
    })();
  }, []);
  if (loading) return <Spinner />;
  if (!m) return null;
  const cards = [
    { icon: Users, label: "Total users", value: m.totalUsers },
    { icon: Sparkles, label: "Paid users", value: m.paidUsers },
    { icon: Clock, label: "Trial users", value: m.trialUsers },
    { icon: IndianRupee, label: "Revenue", value: `₹${Number(m.revenue).toLocaleString("en-IN")}` },
    { icon: Activity, label: "Matches used", value: m.matchesUsed },
    { icon: Clock, label: "Pending payments", value: m.pendingPayments },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="p-4 rounded-2xl bg-card border border-border/60 shadow-soft">
            <c.icon className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="font-display text-xl">{typeof c.value === "number" ? c.value.toLocaleString() : c.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-5">
        <h3 className="font-display text-lg mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> City-wise users</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(m.cities ?? []).map((c: any) => (
            <div key={c.city} className="rounded-xl bg-secondary/40 p-3 flex items-center justify-between">
              <span className="text-sm truncate">{c.city}</span>
              <span className="font-display text-lg">{c.count}</span>
            </div>
          ))}
          {(!m.cities || m.cities.length === 0) && <div className="text-sm text-muted-foreground">No data yet.</div>}
        </div>
      </div>
    </div>
  );
}

/* ───────── Users ───────── */
function BdUsers() {
  const [rows, setRows] = useState<BdUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<BdUser | null>(null);
  const [pkgs, setPkgs] = useState<Package[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAuth.call<{ users: BdUser[] }>("bd_list_users");
      setRows(r.users ?? []);
      const p = await adminAuth.call<{ packages: Package[] }>("bd_packages_get");
      setPkgs(p.packages ?? []);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const assign = async (u: BdUser, pkg: Package) => {
    await adminAuth.call("bd_assign_package", { user_id: u.user_id, plan: pkg.id, chats: pkg.matches, paid: true });
    toast.success(`Assigned ${pkg.name}`);
    load();
  };
  const markPaid = async (u: BdUser) => {
    await adminAuth.call("bd_mark_paid", { user_id: u.user_id, chats: u.chats_remaining || 10 });
    toast.success("Marked paid"); load();
  };
  const del = async (u: BdUser) => {
    if (!confirm(`Remove ${u.name || u.email} from Blind Date?`)) return;
    await adminAuth.call("bd_delete_user", { user_id: u.user_id });
    toast.success("Removed"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button variant="hero" className="rounded-full" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
      <div className="rounded-3xl bg-card border border-border/60 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1200px]">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-3">Name</th>
                <th className="text-left px-3 py-3">Phone</th>
                <th className="text-left px-3 py-3">Email</th>
                <th className="text-left px-3 py-3">Gender / Age</th>
                <th className="text-left px-3 py-3">City</th>
                <th className="text-left px-3 py-3">Package</th>
                <th className="text-left px-3 py-3">Payment</th>
                <th className="text-left px-3 py-3">Trial</th>
                <th className="text-left px-3 py-3">Used / Left</th>
                <th className="text-right px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={10} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                : rows.length === 0 ? <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No Blind Date users yet.</td></tr>
                : rows.map((u) => (
                <tr key={u.user_id} className="border-t border-border/60 hover:bg-secondary/30">
                  <td className="px-3 py-2 cursor-pointer" onClick={() => setActive(u)}>{u.name || "—"}</td>
                  <td className="px-3 py-2">{u.phone || "—"}</td>
                  <td className="px-3 py-2 truncate max-w-[180px]">{u.email}</td>
                  <td className="px-3 py-2">{u.gender || "—"} {u.age ? `· ${u.age}` : ""}</td>
                  <td className="px-3 py-2">{u.city || "—"}</td>
                  <td className="px-3 py-2 capitalize">{u.plan}</td>
                  <td className="px-3 py-2">{u.paid ? <span className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary">Paid</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-2">{u.is_trial ? <span className="px-2 py-0.5 rounded-full text-xs bg-accent/30 text-accent-foreground">Trial</span> : "—"}</td>
                  <td className="px-3 py-2">{u.sessions_used} / {u.chats_remaining}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => setActive(u)}>Edit</Button>
                      {!u.paid && <Button size="sm" variant="hero" className="h-7 rounded-full" onClick={() => markPaid(u)}><Check className="h-3 w-3" /></Button>}
                      <Button size="sm" variant="ghost" className="h-7 rounded-full text-destructive" onClick={() => del(u)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle className="font-display text-2xl">{active?.name || active?.email}</SheetTitle></SheetHeader>
          {active && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-secondary/40 p-4 text-sm space-y-1">
                <div>📞 {active.phone || "—"}</div>
                <div>✉ {active.email}</div>
                <div>{active.gender} · {active.age ?? "—"} · {active.city || "—"}</div>
                <div>Plan: <b className="capitalize">{active.plan}</b></div>
                <div>Matches: {active.sessions_used} used · {active.chats_remaining} remaining</div>
                {active.notes && <div className="text-muted-foreground">Note: {active.notes}</div>}
              </div>
              <div className="space-y-2">
                <Label>Assign package</Label>
                <div className="grid grid-cols-1 gap-2">
                  {pkgs.filter(p => p.active).map((p) => (
                    <Button key={p.id} variant="outline" className="rounded-xl justify-between" onClick={() => assign(active, p)}>
                      <span>{p.name}</span>
                      <span>₹{p.price} · {p.matches} matches</span>
                    </Button>
                  ))}
                </div>
              </div>
              <Button variant="ghost" className="w-full rounded-full text-destructive" onClick={() => { del(active); setActive(null); }}>
                <Trash2 className="h-4 w-4" /> Delete from Blind Date
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ───────── Dummy accounts ───────── */
function BdDummy() {
  const [f, setF] = useState({ name: "", phone: "", email: "", gender: "Woman", age: 25, city: "", trial_days: 7, trial_chats: 3, notes: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!f.email || !f.name) { toast.error("Name and email are required."); return; }
    setSaving(true);
    try {
      await adminAuth.call("bd_create_dummy", f);
      toast.success("Account created.");
      setF({ name: "", phone: "", email: "", gender: "Woman", age: 25, city: "", trial_days: 7, trial_chats: 3, notes: "" });
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-5 max-w-2xl space-y-4">
      <h3 className="font-display text-xl">Create account</h3>
      <p className="text-sm text-muted-foreground">Creates a regular member account with a trial allowance. Account is indistinguishable from a real user.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Name"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Phone"><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Email"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Gender">
          <select className="h-10 w-full rounded-xl border border-border/60 bg-background px-3" value={f.gender} onChange={(e) => setF({ ...f, gender: e.target.value })}>
            <option>Woman</option><option>Man</option><option>Non-binary</option>
          </select>
        </Field>
        <Field label="Age"><Input type="number" value={f.age} onChange={(e) => setF({ ...f, age: Number(e.target.value) })} /></Field>
        <Field label="City"><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></Field>
        <Field label="Trial duration (days)"><Input type="number" value={f.trial_days} onChange={(e) => setF({ ...f, trial_days: Number(e.target.value) })} /></Field>
        <Field label="Trial match credits"><Input type="number" value={f.trial_chats} onChange={(e) => setF({ ...f, trial_chats: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Internal notes (admin-only)"><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      <Button variant="hero" className="rounded-full" onClick={submit} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create account
      </Button>
    </div>
  );
}

/* ───────── Questions ───────── */
function BdQuestions() {
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Question | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAuth.call<{ questions: Question[] }>("bd_questions_list");
      setItems(r.questions ?? []);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async (q: Question) => {
    await adminAuth.call("bd_questions_upsert", q);
    toast.success("Saved"); setEditing(null); load();
  };
  const del = async (id?: string) => {
    if (!id || !confirm("Delete question?")) return;
    await adminAuth.call("bd_questions_delete", { id });
    load();
  };
  const move = async (q: Question, dir: -1 | 1) => {
    await adminAuth.call("bd_questions_upsert", { ...q, position: q.position + dir });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="font-display text-xl">Blind Date questions</h3>
        <Button variant="hero" className="rounded-full" onClick={() => setEditing({ key: "", prompt: "", type: "text", options: [], position: items.length, active: true })}>
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </div>
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
        {loading ? <Spinner /> : items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No questions yet. Add one to override the default list.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left px-4 py-3">#</th><th className="text-left px-4 py-3">Key</th><th className="text-left px-4 py-3">Prompt</th><th className="text-left px-4 py-3">Type</th><th className="text-left px-4 py-3">Active</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((q, i) => (
                <tr key={q.id} className="border-t border-border/60">
                  <td className="px-4 py-2">{q.position}</td>
                  <td className="px-4 py-2 font-mono text-xs">{q.key}</td>
                  <td className="px-4 py-2">{q.prompt}</td>
                  <td className="px-4 py-2">{q.type}</td>
                  <td className="px-4 py-2">{q.active ? "✓" : "—"}</td>
                  <td className="px-4 py-2 text-right space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => move(q, -1)} disabled={i === 0}>↑</Button>
                    <Button size="sm" variant="ghost" onClick={() => move(q, 1)} disabled={i === items.length - 1}>↓</Button>
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setEditing(q)}>Edit</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del(q.id)}><Trash2 className="h-3 w-3" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Sheet open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader><SheetTitle>{editing?.id ? "Edit" : "New"} question</SheetTitle></SheetHeader>
          {editing && (
            <div className="mt-4 space-y-3">
              <Field label="Key"><Input value={editing.key} onChange={(e) => setEditing({ ...editing, key: e.target.value })} /></Field>
              <Field label="Prompt"><Textarea value={editing.prompt} onChange={(e) => setEditing({ ...editing, prompt: e.target.value })} /></Field>
              <Field label="Type">
                <select className="h-10 w-full rounded-xl border border-border/60 bg-background px-3" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  <option value="text">Text</option><option value="single">Single choice</option><option value="multi">Multi choice</option><option value="scale">Scale (1-5)</option>
                </select>
              </Field>
              {(editing.type === "single" || editing.type === "multi") && (
                <Field label="Options (comma-separated)">
                  <Input value={(editing.options ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                </Field>
              )}
              <Field label="Position"><Input type="number" value={editing.position} onChange={(e) => setEditing({ ...editing, position: Number(e.target.value) })} /></Field>
              <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>Active</Label></div>
              <Button variant="hero" className="w-full rounded-full" onClick={() => save(editing)}>Save</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ───────── Packages ───────── */
function BdPackages() {
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try { const r = await adminAuth.call<{ packages: Package[] }>("bd_packages_get"); setPkgs(r.packages ?? []); }
    catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    await adminAuth.call("bd_packages_set", { packages: pkgs });
    toast.success("Saved");
  };
  const update = (i: number, patch: Partial<Package>) => setPkgs(pkgs.map((p, idx) => idx === i ? { ...p, ...patch } : p));
  const addNew = () => setPkgs([...pkgs, { id: `pkg_${Date.now()}`, name: "New", price: 0, matches: 0, active: true }]);
  const removeIdx = (i: number) => setPkgs(pkgs.filter((_, idx) => idx !== i));

  if (loading) return <Spinner />;
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="font-display text-xl">Packages</h3>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={addNew}><Plus className="h-4 w-4" /> Add</Button>
          <Button variant="hero" className="rounded-full" onClick={save}>Save changes</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pkgs.map((p, i) => (
          <div key={p.id} className="rounded-2xl bg-card border border-border/60 shadow-soft p-4 space-y-3">
            <Field label="Name"><Input value={p.name} onChange={(e) => update(i, { name: e.target.value })} /></Field>
            <Field label="Price (₹)"><Input type="number" value={p.price} onChange={(e) => update(i, { price: Number(e.target.value) })} /></Field>
            <Field label="Matches"><Input type="number" value={p.matches} onChange={(e) => update(i, { matches: Number(e.target.value) })} /></Field>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Switch checked={p.active} onCheckedChange={(v) => update(i, { active: v })} /><Label>Active</Label></div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeIdx(i)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Payments ───────── */
function BdPayments() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"" | "pending" | "approved" | "rejected">("pending");
  const [active, setActive] = useState<any | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try { const r = await adminAuth.call<{ payments: any[] }>("bd_list_payments", { status: status || undefined }); setRows(r.payments ?? []); }
    catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [status]);

  const decide = async (id: string, s: "approved" | "rejected", admin_notes?: string) => {
    await adminAuth.call("update_payment_status", { id, status: s, admin_notes });
    toast.success(s === "approved" ? "Approved" : "Rejected");
    setActive(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          <option value="">All</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
        <Button variant="hero" className="rounded-full" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
      </div>
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground">
              <tr><th className="text-left px-4 py-3">Name</th><th className="text-left px-4 py-3">Phone</th><th className="text-left px-4 py-3">Plan</th><th className="text-left px-4 py-3">Amount</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">Submitted</th><th className="text-right px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                : rows.length === 0 ? <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">None.</td></tr>
                : rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-2 cursor-pointer" onClick={() => { setActive(r); setNotes(r.admin_notes ?? ""); }}>{r.name || r.email}</td>
                  <td className="px-4 py-2">{r.phone || "—"}</td>
                  <td className="px-4 py-2">{r.plan}</td>
                  <td className="px-4 py-2">{r.amount_label || "—"}</td>
                  <td className="px-4 py-2">{r.status}</td>
                  <td className="px-4 py-2 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right space-x-1">
                    {r.status !== "approved" && <Button size="sm" variant="hero" className="h-7 rounded-full" onClick={() => decide(r.id, "approved")}><Check className="h-3 w-3" /></Button>}
                    {r.status !== "rejected" && <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => decide(r.id, "rejected")}><X className="h-3 w-3" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader><SheetTitle>Payment review</SheetTitle></SheetHeader>
          {active && (
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-secondary/40 p-4 text-sm">
                <div className="font-display text-lg">{active.name || active.email}</div>
                <div>📞 {active.phone || "—"}</div>
                <div>Plan: {active.plan} · {active.amount_label}</div>
              </div>
              <Field label="Admin notes"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
              <Button variant="hero" className="w-full rounded-full" onClick={() => decide(active.id, "approved", notes)}><Check className="h-4 w-4" /> Approve & mark paid</Button>
              <Button variant="outline" className="w-full rounded-full" onClick={() => decide(active.id, "rejected", notes)}><X className="h-4 w-4" /> Reject</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ───────── Matches ───────── */
function BdMatches() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [users, setUsers] = useState<BdUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [a, setA] = useState(""); const [b, setB] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [s, u] = await Promise.all([
        adminAuth.call<{ sessions: any[] }>("bd_list_sessions"),
        adminAuth.call<{ users: BdUser[] }>("bd_list_users"),
      ]);
      setSessions(s.sessions ?? []); setUsers(u.users ?? []);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!a || !b || a === b) return;
    await adminAuth.call("bd_create_session", { user_a: a, user_b: b });
    toast.success("Match created"); setA(""); setB(""); load();
  };
  const setStatus = async (id: string, status: string) => {
    await adminAuth.call("bd_update_session", { id, status });
    toast.success("Updated"); load();
  };
  const refund = async (s: any) => {
    await adminAuth.call("bd_refund_match", { user_ids: [s.user_a, s.user_b] });
    toast.success("Refunded 1 credit to each"); load();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-5 space-y-3">
        <h3 className="font-display text-lg">Create manual match</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <select className="rounded-xl border border-border/60 bg-background h-10 px-3 text-sm" value={a} onChange={(e) => setA(e.target.value)}>
            <option value="">User A…</option>
            {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.name || u.email} · {u.plan}</option>)}
          </select>
          <select className="rounded-xl border border-border/60 bg-background h-10 px-3 text-sm" value={b} onChange={(e) => setB(e.target.value)}>
            <option value="">User B…</option>
            {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.name || u.email} · {u.plan}</option>)}
          </select>
        </div>
        <Button variant="hero" className="rounded-full" disabled={!a || !b || a === b} onClick={create}><Plus className="h-4 w-4" /> Create session</Button>
      </div>
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase text-muted-foreground"><tr><th className="text-left px-4 py-3">ID</th><th className="text-left px-4 py-3">Status</th><th className="text-left px-4 py-3">A</th><th className="text-left px-4 py-3">B</th><th className="text-left px-4 py-3">Started</th><th className="text-right px-4 py-3">Actions</th></tr></thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-border/60">
                  <td className="px-4 py-2 font-mono text-xs">{s.id.slice(0, 8)}…</td>
                  <td className="px-4 py-2">{s.status}</td>
                  <td className="px-4 py-2 font-mono text-xs">{s.user_a.slice(0, 8)}</td>
                  <td className="px-4 py-2 font-mono text-xs">{s.user_b.slice(0, 8)}</td>
                  <td className="px-4 py-2 text-muted-foreground">{new Date(s.started_at).toLocaleString()}</td>
                  <td className="px-4 py-2 text-right space-x-1">
                    <Button size="sm" variant="hero" className="h-7 rounded-full" onClick={() => setStatus(s.id, "matched")}>Approve</Button>
                    <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => setStatus(s.id, "rejected")}>Reject</Button>
                    <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => refund(s)}>Refund</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ───────── Notifications ───────── */
function BdNotificationsTab() {
  const [audienceType, setAudienceType] = useState<"all" | "trial" | "paid" | "city" | "payment_pending">("all");
  const [city, setCity] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [cta, setCta] = useState("");
  const [link, setLink] = useState("/blind-date");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title || !message) { toast.error("Title and message required."); return; }
    setSending(true);
    try {
      const res = await adminAuth.call<{ sent: number }>("bd_notify", {
        audience: { type: audienceType, value: audienceType === "city" ? city : undefined },
        title, message, cta_text: cta || undefined, cta_link: link || undefined,
      });
      toast.success(`Sent to ${res.sent} users.`);
      setTitle(""); setMessage(""); setCta("");
    } catch (e: any) { toast.error(e.message); }
    setSending(false);
  };

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-5 max-w-2xl space-y-4">
      <h3 className="font-display text-xl">Send notification</h3>
      <Field label="Audience">
        <select className="h-10 w-full rounded-xl border border-border/60 bg-background px-3" value={audienceType} onChange={(e) => setAudienceType(e.target.value as any)}>
          <option value="all">All Blind Date users</option>
          <option value="trial">Trial users</option>
          <option value="paid">Paid users</option>
          <option value="city">By city</option>
          <option value="payment_pending">Payment pending</option>
        </select>
      </Field>
      {audienceType === "city" && <Field label="City"><Input value={city} onChange={(e) => setCity(e.target.value)} /></Field>}
      <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
      <Field label="Message"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA label (optional)"><Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Open Blind Date" /></Field>
        <Field label="CTA link"><Input value={link} onChange={(e) => setLink(e.target.value)} /></Field>
      </div>
      <Button variant="hero" className="rounded-full" onClick={send} disabled={sending}>
        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
      </Button>
    </div>
  );
}

/* ───────── helpers ───────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
function Spinner() {
  return <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
}
