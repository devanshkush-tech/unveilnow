import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Download, Trash2, BadgeCheck, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminAuth } from "@/lib/adminAuth";

type Lead = {
  id: string;
  first_name: string;
  email: string;
  phone: string;
  attempts: number;
  attempted_at: string | null;
  verified_at: string | null;
  completed_at: string | null;
  auth_user_id: string | null;
  last_error: string | null;
  source: string;
  utm_source: string;
  ip: string;
  created_at: string;
};

type Status = "" | "unverified" | "verified" | "incomplete" | "completed";

const AdminLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status>("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAuth.call<{ leads: Lead[] }>("list_leads", {
        search: search.trim() || undefined,
        status: status || undefined,
      });
      setLeads(res.leads ?? []);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportCsv = async () => {
    try {
      await adminAuth.download(
        "export_leads",
        { search: search.trim() || undefined, status: status || undefined },
        `unveil-leads-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      toast.success("Export downloaded.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this lead? This does not delete the user account if signup completed.")) return;
    try {
      await adminAuth.call("delete_lead", { id });
      setLeads((arr) => arr.filter((l) => l.id !== id));
      toast.success("Lead deleted.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-card border border-border/60 shadow-soft p-4 md:p-5 space-y-3">
        <p className="text-sm text-muted-foreground">
          Every signup attempt is recorded here — including users who entered their email/phone but never verified or completed onboarding.
          Re-attempts update the existing lead instead of creating duplicates.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email, phone, name…" className="h-10 rounded-full" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm"
          >
            <option value="">All statuses</option>
            <option value="unverified">Unverified email</option>
            <option value="verified">Verified email</option>
            <option value="incomplete">Signup incomplete</option>
            <option value="completed">Signup completed</option>
          </select>
          <Button variant="hero" className="rounded-full" onClick={load}>
            <RefreshCw className="h-4 w-4" /> Apply
          </Button>
          <Button variant="soft" className="rounded-full" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-3xl bg-card border border-border/60 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Phone</th>
                <th className="text-left px-4 py-3">Attempts</th>
                <th className="text-left px-4 py-3">First seen</th>
                <th className="text-left px-4 py-3">Last attempt</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="p-10 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin inline" /></td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No leads yet.</td></tr>
              ) : leads.map((l) => {
                const completed = !!l.completed_at;
                const verified = !!l.verified_at;
                return (
                  <tr key={l.id} className="border-t border-border/60 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">{l.first_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-[220px]">{l.email || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.attempts}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.created_at ? new Date(l.created_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.attempted_at ? new Date(l.attempted_at).toLocaleString() : "—"}</td>
                    <td className="px-4 py-3">
                      {completed && verified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/15 text-primary"><BadgeCheck className="h-3 w-3" /> Completed</span>
                      ) : verified ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-accent/30 text-accent-foreground">Verified, no profile</span>
                      ) : l.last_error ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-destructive/15 text-destructive" title={l.last_error}>
                          <AlertCircle className="h-3 w-3" /> Error
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-secondary text-muted-foreground">Unverified</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.utm_source || l.source || "direct"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(l.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;
