import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Mail, Phone, MessageSquare, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { adminAuth } from "@/lib/adminAuth";

type Ticket = {
  id: string;
  user_id: string | null;
  ticket_type: "contact" | "refund" | "cancellation" | string;
  full_name: string;
  email: string;
  contact_number: string | null;
  subject: string | null;
  message: string;
  transaction_id: string | null;
  purchase_date: string | null;
  status: "new" | "in_progress" | "resolved" | "closed" | string;
  priority: "low" | "medium" | "high" | string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

const statusBadge: Record<string, string> = {
  new: "bg-primary/15 text-primary",
  in_progress: "bg-accent/30 text-accent-foreground",
  resolved: "bg-secondary text-foreground",
  closed: "bg-secondary text-muted-foreground",
};

const priorityBadge: Record<string, string> = {
  low: "bg-secondary text-muted-foreground",
  medium: "bg-accent/30 text-accent-foreground",
  high: "bg-destructive/15 text-destructive",
};

const typeBadge: Record<string, string> = {
  contact: "bg-secondary text-foreground",
  refund: "bg-primary/10 text-primary",
  cancellation: "bg-destructive/10 text-destructive",
};

const typeLabel: Record<string, string> = {
  contact: "Contact",
  refund: "Refund Request",
  cancellation: "Cancellation Request",
};

const AdminTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [active, setActive] = useState<Ticket | null>(null);
  const [draftStatus, setDraftStatus] = useState<string>("");
  const [draftPriority, setDraftPriority] = useState<string>("");
  const [draftNotes, setDraftNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAuth.call<{ tickets: Ticket[] }>("list_tickets", {
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        sort,
      });
      setTickets(res.tickets ?? []);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, sort]);

  const openTicket = (t: Ticket) => {
    setActive(t);
    setDraftStatus(t.status);
    setDraftPriority(t.priority);
    setDraftNotes(t.admin_notes ?? "");
  };

  const save = async () => {
    if (!active) return;
    setSaving(true);
    try {
      await adminAuth.call("update_ticket", {
        id: active.id,
        status: draftStatus,
        priority: draftPriority,
        admin_notes: draftNotes,
      });
      toast.success("Ticket updated.");
      setActive(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      new: tickets.filter((t) => t.status === "new").length,
      open: tickets.filter((t) => t.status === "in_progress").length,
    };
  }, [tickets]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Search by name, email, subject, transaction…"
              className="h-10 rounded-full"
            />
          </div>
          <Button variant="hero" className="rounded-full" onClick={load}>Apply</Button>
          <div className="text-xs text-muted-foreground">
            {counts.total} total · {counts.new} new · {counts.open} in progress
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 rounded-xl border border-border/60 bg-background px-3">
            <option value="">All types</option>
            <option value="contact">Contact</option>
            <option value="refund">Refund Request</option>
            <option value="cancellation">Cancellation Request</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-10 rounded-xl border border-border/60 bg-background px-3">
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="h-10 rounded-xl border border-border/60 bg-background px-3">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Ticket ID</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Subject</th>
                <th className="text-left px-4 py-3">Submitted</th>
                <th className="text-left px-4 py-3">Priority</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No tickets found.</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.id} onClick={() => openTicket(t)} className="border-t border-border/60 hover:bg-secondary/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${typeBadge[t.ticket_type] ?? "bg-secondary"}`}>
                      {typeLabel[t.ticket_type] ?? t.ticket_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">{t.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{t.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.contact_number || "—"}</td>
                  <td className="px-4 py-3 truncate max-w-[220px]">{t.subject || (t.ticket_type === "refund" ? "Refund request" : "—")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${priorityBadge[t.priority] ?? "bg-secondary"}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusBadge[t.status] ?? "bg-secondary"}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail drawer */}
      <Sheet open={!!active} onOpenChange={(v) => { if (!v) setActive(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Ticket details</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${typeBadge[active.ticket_type] ?? "bg-secondary"}`}>
                  {typeLabel[active.ticket_type] ?? active.ticket_type}
                </span>
                <span className="text-xs text-muted-foreground font-mono">#{active.id.slice(0, 8)}</span>
                <span className="text-xs text-muted-foreground">· {new Date(active.created_at).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Full name</div>
                  <div className="font-medium">{active.full_name}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</div>
                  <a href={`mailto:${active.email}`} className="text-primary hover:underline break-all">{active.email}</a>
                </div>
                {active.contact_number && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone</div>
                    <a href={`tel:${active.contact_number}`} className="text-primary hover:underline">{active.contact_number}</a>
                  </div>
                )}
                {active.transaction_id && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transaction ID</div>
                    <div className="font-mono text-xs">{active.transaction_id}</div>
                  </div>
                )}
                {active.purchase_date && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Purchase date</div>
                    <div>{new Date(active.purchase_date).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              {active.subject && (
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Subject</div>
                  <div className="font-medium">{active.subject}</div>
                </div>
              )}

              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Message</div>
                <div className="rounded-2xl bg-secondary/40 border border-border/60 p-4 text-sm whitespace-pre-wrap">
                  {active.message}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="soft" size="sm" className="rounded-full">
                  <a href={`mailto:${active.email}`}><Mail className="h-4 w-4" /> Email</a>
                </Button>
                {active.contact_number && (
                  <Button asChild variant="soft" size="sm" className="rounded-full">
                    <a href={`tel:${active.contact_number}`}><Phone className="h-4 w-4" /> Call</a>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)} className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm">
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <select value={draftPriority} onChange={(e) => setDraftPriority(e.target.value)} className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Internal notes</Label>
                <Textarea rows={4} value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} placeholder="Notes only visible to admins…" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="rounded-full" onClick={() => setActive(null)}>Cancel</Button>
                <Button variant="hero" className="rounded-full" disabled={saving} onClick={save}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminTickets;
