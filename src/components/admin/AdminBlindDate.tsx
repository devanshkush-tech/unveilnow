import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles, Users, MessageCircle, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AdminPayments from "./AdminPayments";

type BdProfile = {
  user_id: string;
  plan: string;
  sessions_used: number;
  sessions_limit: number | null;
  chats_remaining: number;
  paid: boolean;
  completed: boolean;
  extended_completed: boolean;
  updated_at: string;
  answers: Record<string, unknown>;
};
type BdSession = {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
  compatibility: number | null;
  started_at: string;
  ends_at: string;
  decision_a: string | null;
  decision_b: string | null;
  revealed_at: string | null;
};

export default function AdminBlindDate() {
  const [tab, setTab] = useState("users");
  const [profiles, setProfiles] = useState<BdProfile[]>([]);
  const [sessions, setSessions] = useState<BdSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BdProfile | null>(null);
  const [pickA, setPickA] = useState("");
  const [pickB, setPickB] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: ps }, { data: ss }] = await Promise.all([
        supabase.from("blind_date_profiles").select("*").order("updated_at", { ascending: false }).limit(200),
        supabase.from("blind_date_sessions").select("*").order("started_at", { ascending: false }).limit(100),
      ]);
      setProfiles((ps as BdProfile[]) ?? []);
      setSessions((ss as BdSession[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const totalUsers = profiles.length;
  const completed = profiles.filter((p) => p.completed).length;
  const activeSessions = sessions.filter((s) => s.status === "active").length;
  const revealed = sessions.filter((s) => s.status === "revealed").length;
  const continueRate = sessions.length ? Math.round((revealed / sessions.length) * 100) : 0;

  const createMatch = async () => {
    if (!pickA || !pickB || pickA === pickB) return;
    const { error } = await supabase.from("blind_date_sessions").insert({
      user_a: pickA, user_b: pickB,
      ends_at: new Date(Date.now() + 60_000).toISOString(),
    });
    if (!error) {
      const { data } = await supabase.from("blind_date_sessions")
        .select("*").order("started_at", { ascending: false }).limit(100);
      setSessions((data as BdSession[]) ?? []);
      setPickA(""); setPickB("");
    }
  };

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat icon={<Users className="h-4 w-4" />} label="BD Users" value={totalUsers} />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Completed setup" value={completed} />
        <Stat icon={<Activity className="h-4 w-4" />} label="Active sessions" value={activeSessions} />
        <Stat icon={<MessageCircle className="h-4 w-4" />} label="Revealed" value={revealed} />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Continue rate" value={`${continueRate}%`} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="rounded-full">
          <TabsTrigger value="users" className="rounded-full">Users</TabsTrigger>
          <TabsTrigger value="match" className="rounded-full">Manual match</TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-full">Sessions</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-full">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="rounded-2xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr>
                  <th className="text-left p-3">User ID</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-left p-3">Paid</th>
                  <th className="text-left p-3">Chats left</th>
                  <th className="text-left p-3">Setup</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.user_id} className="border-t border-border/40">
                    <td className="p-3 font-mono text-xs">{p.user_id.slice(0, 8)}…</td>
                    <td className="p-3">{p.plan}</td>
                    <td className="p-3">{p.paid ? "✓" : "—"}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        defaultValue={p.chats_remaining ?? 0}
                        className="w-20 rounded-md bg-secondary/60 px-2 py-1 text-sm"
                        onBlur={async (e) => {
                          const v = Math.max(0, Number(e.target.value) || 0);
                          if (v === p.chats_remaining) return;
                          await supabase.from("blind_date_profiles")
                            .update({ chats_remaining: v, paid: v > 0 ? true : p.paid })
                            .eq("user_id", p.user_id);
                          setProfiles((arr) => arr.map((x) => x.user_id === p.user_id ? { ...x, chats_remaining: v, paid: v > 0 ? true : x.paid } : x));
                        }}
                      />
                    </td>
                    <td className="p-3">{p.completed ? (p.extended_completed ? "✓✓" : "✓") : "—"}</td>
                    <td className="p-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(p)}>Responses</Button>
                      <Button size="sm" variant="ghost" onClick={async () => {
                        await supabase.from("blind_date_profiles").update({ chats_remaining: 0, paid: false }).eq("user_id", p.user_id);
                        setProfiles((arr) => arr.map((x) => x.user_id === p.user_id ? { ...x, chats_remaining: 0, paid: false } : x));
                      }}>Reset</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
              <div onClick={(e) => e.stopPropagation()} className="max-w-lg w-full max-h-[80vh] overflow-auto rounded-2xl bg-card p-6">
                <h3 className="font-display text-xl mb-4">Questionnaire responses</h3>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(selected.answers, null, 2)}</pre>
                <Button onClick={() => setSelected(null)} className="mt-4">Close</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="match">
          <div className="rounded-2xl border border-border/60 p-5 space-y-3">
            <p className="text-sm text-muted-foreground">Select two users to manually create a Blind Date session.</p>
            <div className="grid md:grid-cols-2 gap-3">
              <select className="rounded-xl bg-secondary/60 p-3 text-sm" value={pickA} onChange={(e) => setPickA(e.target.value)}>
                <option value="">User A…</option>
                {profiles.map((p) => <option key={p.user_id} value={p.user_id}>{p.user_id.slice(0, 8)}… · {p.plan}</option>)}
              </select>
              <select className="rounded-xl bg-secondary/60 p-3 text-sm" value={pickB} onChange={(e) => setPickB(e.target.value)}>
                <option value="">User B…</option>
                {profiles.map((p) => <option key={p.user_id} value={p.user_id}>{p.user_id.slice(0, 8)}… · {p.plan}</option>)}
              </select>
            </div>
            <Button onClick={createMatch} disabled={!pickA || !pickB || pickA === pickB}>Create session</Button>
          </div>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="rounded-2xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40">
                <tr><th className="text-left p-3">Session</th><th className="text-left p-3">Status</th><th className="text-left p-3">Compat</th><th className="text-left p-3">A</th><th className="text-left p-3">B</th><th className="text-left p-3">Started</th></tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-border/40">
                    <td className="p-3 font-mono text-xs">{s.id.slice(0, 8)}…</td>
                    <td className="p-3">{s.status}</td>
                    <td className="p-3">{s.compatibility ?? "—"}%</td>
                    <td className="p-3 text-xs">{s.decision_a ?? "—"}</td>
                    <td className="p-3 text-xs">{s.decision_b ?? "—"}</td>
                    <td className="p-3 text-xs">{new Date(s.started_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <p className="text-xs text-muted-foreground mb-3">Showing all payments (use the plan column to filter Blind Date — entries start with <code>bd_</code>).</p>
          <AdminPayments />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon} {label}</div>
      <div className="font-display text-2xl mt-1">{value}</div>
    </div>
  );
}
