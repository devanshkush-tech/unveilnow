import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Heart, Eye, Activity, CheckCircle, Sparkles, Loader2, ArrowLeft,
  LogOut, ShieldCheck, Download, Search, Filter, Ban, Trash2,
  KeyRound, MessageCircle, IndianRupee, EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { adminAuth, type AdminUser } from "@/lib/adminAuth";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminChemistry from "@/components/admin/AdminChemistry";
import AdminPayments from "@/components/admin/AdminPayments";
import AdminPaymentHistory from "@/components/admin/AdminPaymentHistory";
import AdminCreateProfile from "@/components/admin/AdminCreateProfile";
import AdminImpersonate from "@/components/admin/AdminImpersonate";
import AdminBlindDate from "@/components/admin/AdminBlindDate";

type Metrics = {
  totalUsers: number; signupsToday: number; active7d: number;
  paid: number; interestsSent: number; matches: number; revealRequested: number;
  revealsBoth: number; messages: number; revenue: number;
};

type UserRow = {
  id: string; source_kind?: "profile" | "lead"; name: string; email: string; phone?: string;
  gender: string; interested_in: string;
  age: number | string; city: string; signup_date: string; last_active: string | null;
  plan: string; plan_started_at?: string | null; plan_expires_at?: string | null;
  utm_source: string; utm_medium?: string; utm_campaign: string; utm_content?: string; utm_term?: string; device: string;
  suspended: string; banned: string;
  email_verified?: string; onboarded?: string; payment_status?: string; stage?: string;
};

type JourneyStep = { key: string; label: string; completed: boolean; at: string | null; detail?: string | null };

type UserDetail = {
  profile: any; email: string | null; last_sign_in_at: string | null;
  prompts: { question: string; answer: string }[]; photo_urls: string[];
  interests: string[]; chats_count: number; matches_count: number; reports: any[];
  journey?: JourneyStep[]; dropped_off_at?: string | null; last_error?: string | null; lead?: any;
};

const Admin = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [interestedIn, setInterestedIn] = useState("");
  const [city, setCity] = useState("");
  const [plan, setPlan] = useState("");
  
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");
  const [source, setSource] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Confirm delete
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  // Impersonate
  const [impersonateId, setImpersonateId] = useState<string | null>(null);

  useEffect(() => {
    setAdmin(adminAuth.getAdmin());
    (async () => {
      try {
        const m = await adminAuth.call<Metrics>("metrics");
        setMetrics(m);
      } catch (e: any) { toast.error(e.message); }
      setLoading(false);
    })();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filterPayload = useMemo(() => ({
    search: search.trim() || undefined,
    gender: gender || undefined,
    interestedIn: interestedIn || undefined,
    city: city.trim() || undefined,
    plan: plan || undefined,
    active: activeFilter === "" ? undefined : activeFilter === "true",
    source: source.trim() || undefined,
    utmCampaign: utmCampaign.trim() || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [search, gender, interestedIn, city, plan, activeFilter, source, utmCampaign, dateFrom, dateTo]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await adminAuth.call<{ users: UserRow[] }>("list_users", filterPayload);
      setUsers(res.users ?? []);
    } catch (e: any) { toast.error(e.message); }
    setUsersLoading(false);
  };

  const exportUsers = async () => {
    try {
      await adminAuth.download("export_users", filterPayload, `unveil-users-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success("Export downloaded.");
    } catch (e: any) { toast.error(e.message); }
  };

  const openDetail = async (id: string) => {
    setDetailId(id); setDetail(null); setDetailLoading(true);
    try {
      const d = await adminAuth.call<UserDetail>("user_detail", { id });
      setDetail(d);
    } catch (e: any) { toast.error(e.message); }
    setDetailLoading(false);
  };

  const setFlag = async (id: string, patch: Partial<{ suspended: boolean; banned: boolean }>) => {
    try {
      await adminAuth.call("set_user_flags", { id, ...patch });
      toast.success("Updated.");
      loadUsers();
      if (detailId === id) openDetail(id);
    } catch (e: any) { toast.error(e.message); }
  };

  const resetPassword = async (id: string) => {
    try {
      await adminAuth.call("reset_password", { id });
      toast.success("Password reset email sent.");
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteUser = async (id: string) => {
    try {
      if (id.startsWith("lead:")) {
        await adminAuth.call("delete_lead", { id: id.slice(5) });
      } else {
        await adminAuth.call("delete_user", { id });
      }
      toast.success("User deleted.");
      setConfirmDelete(null); setDetailId(null);
      loadUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  const assignPlan = async (
    id: string,
    plan: string,
    plan_started_at?: string | null,
    plan_expires_at?: string | null,
  ) => {
    try {
      await adminAuth.call("assign_plan", {
        user_id: id,
        plan,
        plan_started_at: plan_started_at || undefined,
        plan_expires_at: plan_expires_at || undefined,
      });
      toast.success("Plan updated.");
      loadUsers();
      if (detailId === id) openDetail(id);
    } catch (e: any) { toast.error(e.message); }
  };

  const onLogout = async () => {
    await adminAuth.logout();
    navigate("/admindashboard/login", { replace: true });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const cards = [
    { icon: Users, label: "Total users", value: metrics?.totalUsers ?? 0 },
    { icon: Sparkles, label: "New today", value: metrics?.signupsToday ?? 0 },
    
    { icon: Activity, label: "Active (7d)", value: metrics?.active7d ?? 0 },
    { icon: ShieldCheck, label: "Paid subscribers", value: metrics?.paid ?? 0 },
    { icon: IndianRupee, label: "Revenue", value: `₹${(metrics?.revenue ?? 0).toLocaleString("en-IN")}` },
    { icon: Heart, label: "Interests sent", value: metrics?.interestsSent ?? 0 },
    { icon: Heart, label: "Matches", value: metrics?.matches ?? 0 },
    { icon: Eye, label: "Reveal requests", value: metrics?.revealRequested ?? 0 },
    { icon: Eye, label: "Successful reveals", value: metrics?.revealsBoth ?? 0 },
    { icon: MessageCircle, label: "Messages sent", value: metrics?.messages ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-20">
        <div className="container flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-sm text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground shrink-0">
              <ArrowLeft className="h-4 w-4" /> Site
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-romance flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-lg leading-tight truncate">Unveil Admin</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">Restricted console</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-muted-foreground leading-none">Signed in as</span>
              <span className="text-sm font-medium leading-tight truncate max-w-[200px]">{admin?.email}</span>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-10 space-y-8">
        {/* Metrics */}
        <section>
          <h1 className="font-display text-2xl md:text-3xl mb-5">Dashboard</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {cards.map((s) => (
              <div key={s.label} className="p-4 md:p-5 rounded-2xl bg-card border border-border/60 shadow-soft animate-fade-up">
                <s.icon className="h-4 w-4 text-muted-foreground mb-2" />
                <div className="font-display text-xl md:text-2xl truncate">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="rounded-full p-1 h-12 bg-secondary flex-wrap">
            <TabsTrigger value="users" className="rounded-full px-5">User management</TabsTrigger>
            <TabsTrigger value="payments" className="rounded-full px-5">Payments</TabsTrigger>
            <TabsTrigger value="payment-history" className="rounded-full px-5">Payment history</TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-full px-5">Tickets / Customer Support</TabsTrigger>
            <TabsTrigger value="chemistry" className="rounded-full px-5">Chemistry tuning</TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-full px-5">Moderation</TabsTrigger>
            <TabsTrigger value="blind-date" className="rounded-full px-5">✦ Blind Date</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-4 md:p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, city…" className="h-10 rounded-full" />
                </div>
                <Button variant="hero" className="rounded-full" onClick={loadUsers}><Filter className="h-4 w-4" /> Apply</Button>
                <Button variant="soft" className="rounded-full" onClick={exportUsers}><Download className="h-4 w-4" /> Export CSV</Button>
                <AdminCreateProfile onCreated={loadUsers} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-sm">
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-10 rounded-xl border border-border/60 bg-background px-3">
                  <option value="">Any gender</option>
                  <option value="Woman">Woman</option><option value="Man">Man</option><option value="Non-binary">Non-binary</option>
                </select>
                <select value={interestedIn} onChange={(e) => setInterestedIn(e.target.value)} className="h-10 rounded-xl border border-border/60 bg-background px-3">
                  <option value="">Interested in (any)</option>
                  <option value="Women">Women</option><option value="Men">Men</option><option value="Everyone">Everyone</option>
                </select>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="h-10 rounded-xl" />
                <select value={plan} onChange={(e) => setPlan(e.target.value)} className="h-10 rounded-xl border border-border/60 bg-background px-3">
                  <option value="">Any plan</option>
                  <option value="free">Free</option><option value="starter">Starter</option><option value="premium">Premium</option><option value="elite">Elite</option>
                </select>
                <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="UTM source" className="h-10 rounded-xl" />
                <Input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} placeholder="UTM campaign" className="h-10 rounded-xl" />
                <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as any)} className="h-10 rounded-xl border border-border/60 bg-background px-3">
                  <option value="">Activity (any)</option>
                  <option value="true">Active (14d)</option><option value="false">Inactive</option>
                </select>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 rounded-xl" />
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 rounded-xl" />
              </div>
            </div>

            <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1400px]">
                  <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Phone</th>
                      <th className="text-left px-4 py-3">Stage</th>
                      <th className="text-left px-4 py-3">Gender</th>
                      <th className="text-left px-4 py-3">City</th>
                      <th className="text-left px-4 py-3">Joined</th>
                      <th className="text-left px-4 py-3">Last active</th>
                      <th className="text-left px-4 py-3">Plan</th>
                      <th className="text-left px-4 py-3">Plan expiry</th>
                      <th className="text-left px-4 py-3">Days left</th>
                      <th className="text-left px-4 py-3">Source</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-right px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr><td colSpan={14} className="p-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={14} className="p-10 text-center text-muted-foreground">No members match these filters.</td></tr>
                    ) : users.map((u) => {
                      const isLead = u.source_kind === "lead";
                      const stageTone = u.stage === "Active" ? "bg-primary/15 text-primary"
                        : u.stage === "Awaiting payment" ? "bg-accent/30 text-accent-foreground"
                        : u.stage === "Onboarding" ? "bg-secondary text-foreground"
                        : u.stage === "Signup error" ? "bg-destructive/15 text-destructive"
                        : "bg-secondary text-muted-foreground";
                      return (
                      <tr key={u.id} onClick={() => openDetail(u.id)} className="border-t border-border/60 hover:bg-secondary/30 transition-colors cursor-pointer">
                        <td className="px-4 py-3">
                          <span>{u.name || "—"}</span>
                          {isLead && <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">Lead</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{u.email || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${stageTone}`}>{u.stage || "—"}</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{u.gender || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.city || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.signup_date ? new Date(u.signup_date).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.last_active ? new Date(u.last_active).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 capitalize">{u.plan || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.plan_expires_at ? new Date(u.plan_expires_at).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{(() => {
                          if (!u.plan_expires_at) return "—";
                          const days = Math.ceil((new Date(u.plan_expires_at).getTime() - Date.now()) / 86400000);
                          if (days <= 0) return <span className="text-destructive">Expired</span>;
                          return `${days}d`;
                        })()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.utm_source || "direct"}</td>
                        <td className="px-4 py-3">
                          {u.banned === "Yes" ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-destructive/15 text-destructive">Banned</span>
                          ) : u.suspended === "Yes" ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-accent/30 text-accent-foreground">Suspended</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-secondary text-muted-foreground">Active</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setConfirmDelete(u)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <AdminPayments />
          </TabsContent>

          <TabsContent value="payment-history">
            <AdminPaymentHistory />
          </TabsContent>

          <TabsContent value="tickets">
            <AdminTickets />
          </TabsContent>

          <TabsContent value="chemistry">
            <AdminChemistry />
          </TabsContent>

          <TabsContent value="moderation">
            <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-6 text-sm text-muted-foreground">
              Open the user drawer to see reports filed against a member, and use the action buttons there to suspend, ban, or delete.
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* User detail drawer */}
      <Sheet open={!!detailId} onOpenChange={(v) => { if (!v) { setDetailId(null); setDetail(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Member profile</SheetTitle>
          </SheetHeader>
          {detailLoading || !detail ? (
            <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-2xl bg-gradient-romance overflow-hidden shrink-0">
                  {detail.photo_urls[0] && <img src={detail.photo_urls[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-2xl flex items-center gap-2">
                    {detail.profile?.first_name ?? "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">{detail.email ?? "—"}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {[detail.profile?.city, detail.profile?.profession, detail.profile?.gender].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <Stat label="Age" value={detail.profile?.age ?? "—"} />
                <Stat label="Plan" value={detail.profile?.plan ?? "free"} />
                <Stat label="Chats" value={detail.chats_count} />
                <Stat label="Matches" value={detail.matches_count} />
              </div>

              {detail.photo_urls.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {detail.photo_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="h-28 w-24 object-cover rounded-xl shrink-0" />
                  ))}
                </div>
              )}

              {detail.profile?.story && (
                <Section title="Story"><p className="text-sm whitespace-pre-line">{detail.profile.story}</p></Section>
              )}

              {detail.prompts.length > 0 && (
                <Section title="Prompts">
                  <div className="space-y-3">
                    {detail.prompts.map((p, i) => (
                      <div key={i} className="border-l-2 border-accent/60 pl-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.question}</p>
                        <p className="text-sm">{p.answer}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {detail.interests.length > 0 && (
                <Section title="Interests">
                  <div className="flex flex-wrap gap-1.5">
                    {detail.interests.map((i) => <span key={i} className="px-2.5 py-1 rounded-full bg-secondary text-xs">{i}</span>)}
                  </div>
                </Section>
              )}

              <Section title="Preferences">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Looking for: <span className="text-foreground">{detail.profile?.looking_for ?? "—"}</span></div>
                  <div>Age range: <span className="text-foreground">{detail.profile?.age_min}–{detail.profile?.age_max}</span></div>
                  <div>Distance: <span className="text-foreground">{detail.profile?.distance_km ?? "—"} km</span></div>
                  <div>Intent: <span className="text-foreground">{detail.profile?.intent ?? "—"}</span></div>
                </div>
              </Section>

              <Section title="Acquisition & device">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>UTM source: <span className="text-foreground">{detail.profile?.utm_source ?? "direct"}</span></div>
                  <div>UTM medium: <span className="text-foreground">{detail.profile?.utm_medium ?? "—"}</span></div>
                  <div>UTM campaign: <span className="text-foreground">{detail.profile?.utm_campaign ?? "—"}</span></div>
                  <div>UTM content: <span className="text-foreground">{detail.profile?.utm_content ?? "—"}</span></div>
                  <div>UTM term: <span className="text-foreground">{detail.profile?.utm_term ?? "—"}</span></div>
                  <div>Device: <span className="text-foreground">{detail.profile?.device ?? "—"}</span></div>
                  <div>Last sign in: <span className="text-foreground">{detail.last_sign_in_at ? new Date(detail.last_sign_in_at).toLocaleString() : "—"}</span></div>
                </div>
              </Section>

              <Section title="Reports against user">
                {detail.reports.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reports.</p>
                ) : (
                  <ul className="space-y-2">
                    {detail.reports.map((r) => (
                      <li key={r.id} className="text-sm p-3 rounded-xl bg-secondary/40">
                        <div className="font-medium">{r.reason}</div>
                        {r.details && <div className="text-muted-foreground">{r.details}</div>}
                        <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()} · {r.status}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Signup journey / funnel */}
              {detail.journey && detail.journey.length > 0 && (
                <Section title="Signup journey">
                  {detail.dropped_off_at && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-accent/30 text-xs">
                      Dropped off at: <span className="font-medium">{detail.dropped_off_at}</span>
                      {detail.last_error && <div className="text-destructive mt-1">Error: {detail.last_error}</div>}
                    </div>
                  )}
                  <ol className="space-y-2">
                    {detail.journey.map((step, idx) => {
                      const isDropoff = !step.completed && detail.journey!.slice(0, idx).every((s) => s.completed);
                      return (
                        <li key={step.key} className="flex items-start gap-3">
                          <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-medium ${
                            step.completed ? "bg-primary text-primary-foreground"
                              : isDropoff ? "bg-destructive/20 text-destructive border border-destructive/40"
                              : "bg-secondary text-muted-foreground"
                          }`}>
                            {step.completed ? <CheckCircle className="h-3.5 w-3.5" /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {step.at ? new Date(step.at).toLocaleString() : (step.completed ? "" : "Not yet")}
                              {step.detail ? <span className="ml-2">· {step.detail}</span> : null}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </Section>
              )}

              {!detail.profile?.is_lead_only && <PlanControl profile={detail.profile} onSave={assignPlan} />}

              {/* Actions */}
              {!detail.profile?.is_lead_only && (
              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Suspended</Label>
                  <Switch checked={!!detail.profile?.suspended} onCheckedChange={(v) => setFlag(detail.profile.id, { suspended: v })} />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="soft" size="sm" className="rounded-full col-span-2" onClick={() => setImpersonateId(detail.profile.id)}>
                    <EyeOff className="h-4 w-4" /> Login as user (read-only)
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => resetPassword(detail.profile.id)}>
                    <KeyRound className="h-4 w-4" /> Reset password
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setFlag(detail.profile.id, { banned: !detail.profile.banned })}>
                    <Ban className="h-4 w-4" /> {detail.profile.banned ? "Unban" : "Ban user"}
                  </Button>
                  <Button
                    variant="destructive" size="sm" className="rounded-full col-span-2"
                    onClick={() => {
                      const row = users.find((u) => u.id === detail.profile.id);
                      if (row) setConfirmDelete(row);
                    }}
                  >
                    <Trash2 className="h-4 w-4" /> Delete account
                  </Button>
                </div>
              </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmDelete} onOpenChange={(v) => !v && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-medium">{confirmDelete?.name || confirmDelete?.email}</span> and all of their data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete && deleteUser(confirmDelete.id)} className="bg-destructive text-destructive-foreground">
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminImpersonate
        userId={impersonateId}
        open={!!impersonateId}
        onOpenChange={(v) => !v && setImpersonateId(null)}
      />
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{title}</p>
    {children}
  </div>
);

const Stat = ({ label, value }: { label: string; value: any }) => (
  <div className="p-3 rounded-xl bg-secondary/40">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display text-lg">{value}</div>
  </div>
);


const toDateInput = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Format as yyyy-mm-dd in local time
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
};

const PLAN_OPTIONS = ["free", "starter", "premium", "elite"] as const;

const PlanControl = ({
  profile,
  onSave,
}: {
  profile: any;
  onSave: (id: string, plan: string, started?: string | null, expires?: string | null) => void;
}) => {
  const [plan, setPlan] = useState<string>(profile?.plan ?? "free");
  const [startedAt, setStartedAt] = useState<string>(toDateInput(profile?.plan_started_at) || toDateInput(new Date().toISOString()));
  const [expiresAt, setExpiresAt] = useState<string>(toDateInput(profile?.plan_expires_at));

  // Re-sync when a different user is loaded
  useEffect(() => {
    setPlan(profile?.plan ?? "free");
    setStartedAt(toDateInput(profile?.plan_started_at) || toDateInput(new Date().toISOString()));
    setExpiresAt(toDateInput(profile?.plan_expires_at));
  }, [profile?.id]);

  const daysRemaining = (() => {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt + "T23:59:59").getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  })();

  const setQuickDuration = (days: number) => {
    const start = startedAt ? new Date(startedAt) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    setExpiresAt(toDateInput(end.toISOString()));
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Plan & expiry</p>
        <span className="text-[11px] text-muted-foreground capitalize">Current: {profile?.plan ?? "free"}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs">Plan</Label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm capitalize"
          >
            {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs">Start date</Label>
          <Input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="mt-1 h-10 rounded-xl" />
        </div>
        <div>
          <Label className="text-xs">Expiry date</Label>
          <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1 h-10 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button type="button" size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setQuickDuration(30)}>+30d</Button>
        <Button type="button" size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setQuickDuration(90)}>+90d</Button>
        <Button type="button" size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setQuickDuration(365)}>+1y</Button>
        <Button type="button" size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => setExpiresAt("")}>No expiry</Button>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Days remaining</span>
        <span className={`font-medium ${daysRemaining !== null && daysRemaining <= 0 ? "text-destructive" : "text-foreground"}`}>
          {daysRemaining === null ? "No expiry set" : daysRemaining <= 0 ? "Expired" : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"}`}
        </span>
      </div>

      <Button
        variant="hero"
        size="sm"
        className="w-full rounded-full"
        onClick={() => onSave(profile.id, plan, startedAt || null, expiresAt || null)}
      >
        Save plan changes
      </Button>
    </div>
  );
};

export default Admin;

