import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Heart,
  Eye,
  Activity,
  CheckCircle,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Megaphone,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Stats = {
  totalUsers: number;
  signupsToday: number;
  onboarded: number;
  matches: number;
  interestsSent: number;
  reveals: number;
};

type FunnelData = {
  signedUp: number;
  onboarded: number;
  sentInterest: number;
  matched: number;
  revealed: number;
};

const Admin = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [users, setUsers] = useState<{ id: string; first_name: string | null; city: string | null; created_at: string; onboarded: boolean }[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [prompts, setPrompts] = useState<{ id: string; text: string; category: string; active: boolean; position: number }[]>([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [announcements, setAnnouncements] = useState<{ id: string; title: string; body: string; active: boolean; created_at: string }[]>([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [reports, setReports] = useState<{ id: string; reporter_id: string; reported_id: string; reason: string; status: string; created_at: string }[]>([]);

  const load = async () => {
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const [
      { count: totalUsers },
      { count: signupsToday },
      { count: onboardedCount },
      { count: matchesCount },
      { count: interestsCount },
      { count: revealsCount },
      { data: usersData },
      { data: promptsData },
      { data: annData },
      { data: reportsData },
      { data: rolesData },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayIso),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("onboarded", true),
      supabase.from("matches").select("*", { count: "exact", head: true }),
      supabase.from("interest_requests").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }).eq("reveal_a", true).eq("reveal_b", true),
      supabase.from("profiles").select("id, first_name, city, created_at, onboarded").order("created_at", { ascending: false }).limit(100),
      supabase.from("prompts_library").select("*").order("position"),
      supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
    ]);

    setStats({
      totalUsers: totalUsers ?? 0,
      signupsToday: signupsToday ?? 0,
      onboarded: onboardedCount ?? 0,
      matches: matchesCount ?? 0,
      interestsSent: interestsCount ?? 0,
      reveals: revealsCount ?? 0,
    });

    // Funnel
    const { count: matched } = await supabase
      .from("interest_requests").select("*", { count: "exact", head: true }).eq("status", "accepted");

    setFunnel({
      signedUp: totalUsers ?? 0,
      onboarded: onboardedCount ?? 0,
      sentInterest: interestsCount ?? 0,
      matched: matched ?? 0,
      revealed: revealsCount ?? 0,
    });

    setUsers(usersData ?? []);
    setPrompts(promptsData ?? []);
    setAnnouncements(annData ?? []);
    setReports(reportsData ?? []);
    setAdminIds(new Set((rolesData ?? []).map((r: { user_id: string }) => r.user_id)));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const addPrompt = async () => {
    if (!newPrompt.trim()) return;
    const { error } = await supabase
      .from("prompts_library")
      .insert({ text: newPrompt.trim(), category: "about-me", position: prompts.length + 1 });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Prompt added.");
    setNewPrompt("");
    load();
  };

  const togglePromptActive = async (id: string, active: boolean) => {
    await supabase.from("prompts_library").update({ active }).eq("id", id);
    setPrompts((p) => p.map((x) => (x.id === id ? { ...x, active } : x)));
  };

  const deletePrompt = async (id: string) => {
    await supabase.from("prompts_library").delete().eq("id", id);
    setPrompts((p) => p.filter((x) => x.id !== id));
  };

  const sendAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim() || !user) return;
    const { error } = await supabase
      .from("announcements")
      .insert({ title: annTitle.trim(), body: annBody.trim(), created_by: user.id });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Announcement published.");
    setAnnTitle("");
    setAnnBody("");
    load();
  };

  const filteredUsers = users.filter((u) =>
    !search.trim() || (u.first_name ?? "").toLowerCase().includes(search.toLowerCase()) || u.id.includes(search),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total users", value: stats?.totalUsers ?? 0 },
    { icon: Sparkles, label: "Signups today", value: stats?.signupsToday ?? 0 },
    { icon: CheckCircle, label: "Onboarded", value: stats?.onboarded ?? 0 },
    { icon: Heart, label: "Interests sent", value: stats?.interestsSent ?? 0 },
    { icon: Activity, label: "Matches", value: stats?.matches ?? 0 },
    { icon: Eye, label: "Photo reveals", value: stats?.reveals ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur sticky top-0 z-20">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-sm text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to app
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-romance flex items-center justify-center">
                <span className="font-display text-primary-foreground text-lg leading-none pb-0.5">U</span>
              </div>
              <div>
                <div className="font-display text-lg leading-tight">Unveil</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Console</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Admin</div>
        </div>
      </header>

      <main className="container py-10 space-y-10">
        <section>
          <h1 className="font-display text-3xl mb-6">Overview</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="p-5 rounded-2xl bg-card border border-border/60 shadow-soft">
                <s.icon className="h-5 w-5 text-muted-foreground mb-3" />
                <div className="font-display text-3xl">{s.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <Tabs defaultValue="funnel" className="space-y-6">
          <TabsList className="rounded-full p-1 h-12 bg-secondary">
            <TabsTrigger value="funnel" className="rounded-full px-5">Funnel</TabsTrigger>
            <TabsTrigger value="users" className="rounded-full px-5">Users</TabsTrigger>
            <TabsTrigger value="prompts" className="rounded-full px-5">Prompts</TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-full px-5">Announcements</TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-full px-5">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel">
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-6">
              <h2 className="font-display text-2xl mb-6">Conversion funnel</h2>
              {funnel && (
                <div className="space-y-4">
                  {[
                    { label: "Signed up", value: funnel.signedUp },
                    { label: "Completed onboarding", value: funnel.onboarded },
                    { label: "Sent interest", value: funnel.sentInterest },
                    { label: "Got matched (accepted interest)", value: funnel.matched },
                    { label: "Photo reveals", value: funnel.revealed },
                  ].map((row, i, arr) => {
                    const max = arr[0].value || 1;
                    const pct = (row.value / max) * 100;
                    return (
                      <div key={row.label}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span>{row.label}</span>
                          <span className="text-muted-foreground">{row.value.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-romance transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border/60 flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl">Members</h2>
                <Input placeholder="Search by name or id…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 max-w-xs rounded-full" />
              </div>
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">City</th>
                    <th className="text-left px-5 py-3">Joined</th>
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-border/60">
                      <td className="px-5 py-3">{u.first_name ?? "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.city ?? "—"}</td>
                      <td className="px-5 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs ${u.onboarded ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                          {u.onboarded ? "Active" : "Onboarding"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="prompts">
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-6 space-y-5">
              <div>
                <h2 className="font-display text-2xl mb-1">Prompt library</h2>
                <p className="text-sm text-muted-foreground">Members pick 5 of these during onboarding.</p>
              </div>
              <div className="flex gap-2">
                <Input value={newPrompt} onChange={(e) => setNewPrompt(e.target.value)} placeholder="Add a new prompt…" className="h-11 rounded-xl" />
                <Button variant="hero" onClick={addPrompt} className="rounded-full">
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <ul className="divide-y divide-border/60">
                {prompts.map((p) => (
                  <li key={p.id} className="py-3 flex items-center gap-3">
                    <span className="flex-1">{p.text}</span>
                    <span className="text-xs text-muted-foreground">{p.category}</span>
                    <Switch checked={p.active} onCheckedChange={(v) => togglePromptActive(p.id, v)} />
                    <Button variant="ghost" size="icon" onClick={() => deletePrompt(p.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="announcements">
            <div className="grid lg:grid-cols-2 gap-5">
              <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-romance flex items-center justify-center">
                    <Megaphone className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-2xl">Compose announcement</h2>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={annBody} onChange={(e) => setAnnBody(e.target.value)} className="rounded-2xl min-h-[140px]" />
                </div>
                <Button variant="hero" onClick={sendAnnouncement} className="rounded-full">Publish</Button>
              </div>
              <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-6">
                <h2 className="font-display text-2xl mb-4">Recent</h2>
                <div className="space-y-3">
                  {announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No announcements yet.</p>
                  ) : (
                    announcements.map((a) => (
                      <div key={a.id} className="p-4 rounded-2xl bg-secondary/40">
                        <div className="font-display text-lg">{a.title}</div>
                        <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                          {new Date(a.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="moderation">
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
              <div className="p-5 border-b border-border/60">
                <h2 className="font-display text-2xl">Reports</h2>
              </div>
              {reports.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No open reports. The community is healthy.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-5 py-3">Report</th>
                      <th className="text-left px-5 py-3">Reason</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-left px-5 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-t border-border/60">
                        <td className="px-5 py-3 font-mono text-xs">{r.id.slice(0, 8)}</td>
                        <td className="px-5 py-3">{r.reason}</td>
                        <td className="px-5 py-3">
                          <span className="px-2.5 py-1 rounded-full bg-secondary text-xs capitalize">{r.status}</span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
