import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, RefreshCw, Download, IndianRupee, CheckCircle2, XCircle, Clock } from "lucide-react";
import { adminAuth } from "@/lib/adminAuth";
import { toast } from "sonner";
import { planPrice } from "@/lib/payment";

type PaymentRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  plan: string;
  amount_label: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  upi_reference: string | null;
  whatsapp_sent_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  account_status: string;
};

type Totals = { total: number; approved: number; rejected: number; pending: number };

const planBadge: Record<string, string> = {
  starter: "bg-secondary text-foreground",
  premium: "bg-primary/15 text-primary",
  elite: "bg-accent/30 text-accent-foreground",
};

const AdminPaymentHistory = () => {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [totals, setTotals] = useState<Totals>({ total: 0, approved: 0, rejected: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "approved" | "rejected">("");
  const [planFilter, setPlanFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAuth.call<{ payments: PaymentRow[]; totals: Totals }>("payment_history", {
        status: statusFilter || undefined,
        plan: planFilter || undefined,
        search: search.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setRows(r.payments ?? []);
      setTotals(r.totals ?? { total: 0, approved: 0, rejected: 0, pending: 0 });
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter, planFilter, dateFrom, dateTo]);

  const exportCsv = () => {
    const header = ["Date", "Name", "Email", "Phone", "Plan", "Amount", "Status", "UPI Ref", "Reviewed", "Notes"];
    const escape = (v: any) => {
      const s = v == null ? "" : String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = rows.map((r) => [
      new Date(r.created_at).toISOString(),
      r.name, r.email, r.phone ?? "", r.plan,
      r.amount_label ?? planPrice(r.plan),
      r.status,
      r.upi_reference ?? "",
      r.reviewed_at ? new Date(r.reviewed_at).toISOString() : "",
      r.admin_notes ?? "",
    ].map(escape).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unveil-payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { icon: IndianRupee, label: "All submissions", value: totals.total },
    { icon: CheckCircle2, label: "Approved", value: totals.approved },
    { icon: Clock, label: "Pending", value: totals.pending },
    { icon: XCircle, label: "Rejected", value: totals.rejected },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border/60 shadow-soft">
            <s.icon className="h-4 w-4 text-muted-foreground mb-2" />
            <div className="font-display text-2xl">{s.value.toLocaleString()}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-4 md:p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Name, email, phone, UPI ref…" className="h-10 rounded-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm">
            <option value="">All plans</option>
            <option value="starter">Starter</option>
            <option value="premium">Premium</option>
            <option value="elite">Elite</option>
          </select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10 rounded-xl w-auto" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10 rounded-xl w-auto" />
          <Button variant="hero" className="rounded-full" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
          <Button variant="soft" className="rounded-full" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Reviewed</th>
                <th className="text-left px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="p-10 text-center text-muted-foreground">No payment history found.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.name || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[220px]">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.phone || "—"}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs capitalize ${planBadge[r.plan] ?? "bg-secondary"}`}>{r.plan}</span></td>
                  <td className="px-4 py-3">{r.amount_label || planPrice(r.plan)}</td>
                  <td className="px-4 py-3">
                    {r.status === "approved" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/15 text-primary">Approved</span>
                    ) : r.status === "rejected" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-destructive/15 text-destructive">Rejected</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-accent/30 text-accent-foreground">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[260px]">{r.admin_notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentHistory;
