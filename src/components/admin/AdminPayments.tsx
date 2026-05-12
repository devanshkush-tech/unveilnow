import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Check, X, MessageCircle, RefreshCw, BadgeCheck } from "lucide-react";
import { adminAuth } from "@/lib/adminAuth";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  whatsapp_sent_at: string | null;
  created_at: string;
  account_status: string;
  is_admin_created: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
};

const planBadge: Record<string, string> = {
  starter: "bg-secondary text-foreground",
  premium: "bg-primary/15 text-primary",
  elite: "bg-accent/30 text-accent-foreground",
};

const AdminPayments = () => {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "pending" | "approved" | "rejected">("pending");
  const [active, setActive] = useState<PaymentRow | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminAuth.call<{ payments: PaymentRow[] }>("list_payments", {
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
      setRows(r.payments ?? []);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter]);

  const update = async (id: string, status: "approved" | "rejected", admin_notes?: string) => {
    try {
      await adminAuth.call("update_payment_status", { id, status, admin_notes });
      toast.success(status === "approved" ? "Payment approved — user unlocked." : "Payment rejected.");
      setActive(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-4 md:p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, phone…" className="h-10 rounded-full" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button variant="hero" className="rounded-full" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Plan</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3">Source / Campaign</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Account</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline text-muted-foreground" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No payments found.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <button onClick={() => { setActive(r); setNotes(r.admin_notes ?? ""); }} className="text-left">
                      <div className="font-medium flex items-center gap-1.5">
                        {r.name || "—"}
                        {r.is_admin_created && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{r.email}</div>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.phone || "—"}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs capitalize ${planBadge[r.plan] ?? "bg-secondary"}`}>{r.plan}</span></td>
                  <td className="px-4 py-3">{r.amount_label || "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {r.utm_source || r.utm_campaign || r.utm_medium ? (
                      <div className="space-y-0.5 max-w-[180px]">
                        <div className="font-medium truncate">{r.utm_source || "direct"}{r.utm_medium ? ` · ${r.utm_medium}` : ""}</div>
                        {r.utm_campaign && <div className="text-muted-foreground truncate">{r.utm_campaign}</div>}
                        {r.utm_content && <div className="text-muted-foreground truncate">{r.utm_content}</div>}
                      </div>
                    ) : <span className="text-muted-foreground">direct</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-accent/30 text-accent-foreground">Pending</span>
                    ) : r.status === "approved" ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/15 text-primary">Approved</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-destructive/15 text-destructive">Rejected</span>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{r.account_status}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      {r.status !== "approved" && (
                        <Button size="sm" variant="hero" className="rounded-full h-8" onClick={() => update(r.id, "approved")}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      {r.status !== "rejected" && (
                        <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => update(r.id, "rejected")}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!active} onOpenChange={(v) => !v && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Payment review</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-secondary/40 p-4 space-y-1">
                <div className="font-display text-xl">{active.name || active.email}</div>
                <div className="text-sm text-muted-foreground">{active.email}</div>
                <div className="text-sm">📞 {active.phone || "—"}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-secondary/40 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Plan</div>
                  <div className="font-display capitalize">{active.plan}</div>
                </div>
                <div className="rounded-xl bg-secondary/40 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Amount</div>
                  <div className="font-display">{active.amount_label || "—"}</div>
                </div>
              </div>
              <div className="rounded-xl border border-border/60 p-3 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Attribution</div>
                {(active.utm_source || active.utm_medium || active.utm_campaign || active.utm_content || active.utm_term) ? (
                  <div className="text-xs space-y-0.5">
                    <div><span className="text-muted-foreground">source:</span> {active.utm_source || "—"}</div>
                    <div><span className="text-muted-foreground">medium:</span> {active.utm_medium || "—"}</div>
                    <div><span className="text-muted-foreground">campaign:</span> {active.utm_campaign || "—"}</div>
                    {active.utm_content && <div><span className="text-muted-foreground">content:</span> {active.utm_content}</div>}
                    {active.utm_term && <div><span className="text-muted-foreground">term:</span> {active.utm_term}</div>}
                  </div>
                ) : <div className="text-xs text-muted-foreground">Direct (no UTMs captured)</div>}
              </div>
              <div className="space-y-2">
                <Label>Internal notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl min-h-[100px]" placeholder="UPI ref, screenshot link, etc." />
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {active.phone && (
                  <Button variant="soft" className="rounded-full" onClick={() => window.open(`https://wa.me/${active.phone!.replace(/\D/g, "")}`, "_blank", "noopener")}>
                    <MessageCircle className="h-4 w-4" /> Open WhatsApp chat
                  </Button>
                )}
                <Button variant="hero" className="rounded-full" onClick={() => update(active.id, "approved", notes)}>
                  <Check className="h-4 w-4" /> Approve & unlock account
                </Button>
                <Button variant="outline" className="rounded-full" onClick={() => update(active.id, "rejected", notes)}>
                  <X className="h-4 w-4" /> Reject payment
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPayments;
