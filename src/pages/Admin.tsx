import { Users, CreditCard, Flag, Activity } from "lucide-react";

const stats = [
  { icon: Users, label: "Active users", value: "12,438", change: "+8.2%" },
  { icon: CreditCard, label: "Paying members", value: "2,109", change: "+12.5%" },
  { icon: Flag, label: "Open reports", value: "14", change: "-22%" },
  { icon: Activity, label: "Matches / day", value: "1,602", change: "+4.1%" },
];

const reports = [
  { id: "R-2841", user: "user_8123", reason: "Inappropriate prompt", status: "Pending" },
  { id: "R-2840", user: "user_2210", reason: "Suspicious profile", status: "Reviewing" },
  { id: "R-2839", user: "user_9920", reason: "Harassment in chat", status: "Pending" },
];

const Admin = () => {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-lg leading-none pb-0.5">U</span>
            </div>
            <div>
              <div className="font-display text-lg leading-tight">Unveil</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Console</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Hi, Admin</div>
        </div>
      </header>

      <main className="container py-10 space-y-10">
        <section>
          <h1 className="font-display text-3xl mb-6">Overview</h1>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="p-6 rounded-2xl bg-card border border-border/60 shadow-soft">
                <div className="flex items-center justify-between">
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-accent-foreground bg-accent/20 px-2 py-0.5 rounded-full">{s.change}</span>
                </div>
                <div className="font-display text-3xl mt-4">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl">Moderation queue</h2>
            <span className="text-sm text-muted-foreground">{reports.length} open</span>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 shadow-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Report</th>
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Reason</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="px-5 py-4 font-mono text-xs">{r.id}</td>
                    <td className="px-5 py-4">{r.user}</td>
                    <td className="px-5 py-4">{r.reason}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-secondary text-xs">{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
            <h3 className="font-display text-xl mb-4">Subscriptions</h3>
            <div className="space-y-3 text-sm">
              <Row label="Starter (₹299)" value="612 active" />
              <Row label="Premium (₹499)" value="1,184 active" />
              <Row label="Elite Verified (₹999)" value="313 active" />
            </div>
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-soft">
            <h3 className="font-display text-xl mb-4">Analytics</h3>
            <div className="h-40 rounded-xl bg-gradient-romance/10 border border-border/40 flex items-center justify-center text-sm text-muted-foreground">
              Chart placeholder
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-border/40 last:border-0">
    <span>{label}</span><span className="text-muted-foreground">{value}</span>
  </div>
);

export default Admin;
