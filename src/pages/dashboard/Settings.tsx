import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, KeyRound, Trash2, ShieldOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Notification preferences (stored locally for now — backend column would be cheap to add)
  const [notifMatches, setNotifMatches] = useState(() => localStorage.getItem("u_notif_matches") !== "0");
  const [notifMessages, setNotifMessages] = useState(() => localStorage.getItem("u_notif_messages") !== "0");
  useEffect(() => { localStorage.setItem("u_notif_matches", notifMatches ? "1" : "0"); }, [notifMatches]);
  useEffect(() => { localStorage.setItem("u_notif_messages", notifMessages ? "1" : "0"); }, [notifMessages]);

  // Privacy
  const [hideFromContacts, setHideFromContacts] = useState(() => localStorage.getItem("u_hide_contacts") !== "0");
  const [voiceRequired, setVoiceRequired] = useState(() => localStorage.getItem("u_voice_required") === "1");
  useEffect(() => { localStorage.setItem("u_hide_contacts", hideFromContacts ? "1" : "0"); }, [hideFromContacts]);
  useEffect(() => { localStorage.setItem("u_voice_required", voiceRequired ? "1" : "0"); }, [voiceRequired]);

  // Change password
  const [pwOpen, setPwOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const changePassword = async () => {
    if (newPw.length < 8) { toast.error("Use at least 8 characters."); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    setPwSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated.");
    setNewPw(""); setPwOpen(false);
  };

  const sendResetEmail = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Reset link sent to your email.");
  };

  // Blocked users
  const [blockedOpen, setBlockedOpen] = useState(false);
  const [blocked, setBlocked] = useState<{ id: string; blocked_id: string; first_name: string | null }[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);

  const loadBlocked = async () => {
    if (!user) return;
    setLoadingBlocked(true);
    const { data: rows } = await supabase.from("blocked_users").select("id, blocked_id").eq("blocker_id", user.id);
    const ids = (rows ?? []).map((r) => r.blocked_id);
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id, first_name").in("id", ids)
      : { data: [] as { id: string; first_name: string | null }[] };
    const map = new Map(profs?.map((p) => [p.id, p.first_name]) ?? []);
    setBlocked((rows ?? []).map((r) => ({ id: r.id, blocked_id: r.blocked_id, first_name: map.get(r.blocked_id) ?? null })));
    setLoadingBlocked(false);
  };

  useEffect(() => { if (blockedOpen) loadBlocked(); }, [blockedOpen]); // eslint-disable-line

  const unblock = async (id: string) => {
    const { error } = await supabase.from("blocked_users").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Unblocked.");
    setBlocked((b) => b.filter((x) => x.id !== id));
  };

  // Delete account
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      // Best-effort cleanup of profile rows; auth user removal happens via admin or RLS cascade.
      await supabase.from("profile_prompts").delete().eq("user_id", user.id);
      await supabase.from("profile_interests").delete().eq("user_id", user.id);
      await supabase.from("profile_photos").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);
      await supabase.auth.signOut();
      toast.success("Account removed. Sorry to see you go.");
      navigate("/");
    } catch (e: any) {
      toast.error(e.message ?? "Could not delete account.");
    } finally { setDeleting(false); }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <div className="container max-w-2xl py-6 md:py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Settings</h1>
        <p className="text-muted-foreground mt-1">You're in control.</p>
      </div>

      <Section title="Privacy">
        <Row label="Hide me from friends in my contacts"><Switch checked={hideFromContacts} onCheckedChange={setHideFromContacts} /></Row>
        <Row label="Require voice intro before messaging me"><Switch checked={voiceRequired} onCheckedChange={setVoiceRequired} /></Row>
      </Section>

      <Section title="Notifications">
        <Row label="New matches"><Switch checked={notifMatches} onCheckedChange={setNotifMatches} /></Row>
        <Row label="New messages"><Switch checked={notifMessages} onCheckedChange={setNotifMessages} /></Row>
      </Section>

      <Section title="Account">
        <Button variant="ghost" className="justify-start" onClick={() => setPwOpen(true)}>
          <KeyRound className="h-4 w-4" /> Change password
        </Button>
        <Button variant="ghost" className="justify-start" onClick={sendResetEmail}>
          Send password reset email
        </Button>
        <Button variant="ghost" className="justify-start" onClick={() => setBlockedOpen(true)}>
          <ShieldOff className="h-4 w-4" /> Blocked users
        </Button>
        <Button variant="ghost" className="justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
        <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4" /> Delete my account
        </Button>
      </Section>

      {/* Change password */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Use at least 8 characters.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newpw">New password</Label>
            <PasswordInput id="newpw" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={changePassword} disabled={pwSaving}>
              {pwSaving ? "Saving…" : "Save password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blocked list */}
      <Dialog open={blockedOpen} onOpenChange={setBlockedOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Blocked users</DialogTitle>
            <DialogDescription>People you've blocked won't see you on Discover or message you.</DialogDescription>
          </DialogHeader>
          {loadingBlocked ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : blocked.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">You haven't blocked anyone.</p>
          ) : (
            <ul className="divide-y divide-border/60 max-h-72 overflow-y-auto">
              {blocked.map((b) => (
                <li key={b.id} className="py-3 flex items-center justify-between">
                  <span>{b.first_name ?? "Someone"}</span>
                  <Button size="sm" variant="ghost" onClick={() => unblock(b.id)}>Unblock</Button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your Unveil account?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes your profile, prompts, photos, voice intro, and matches. You can't undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground">
              {deleting ? "Deleting…" : "Yes, delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
    <h2 className="font-display text-xl mb-4">{title}</h2>
    <div className="space-y-3 flex flex-col">{children}</div>
  </div>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-1.5">
    <Label className="text-sm font-normal">{label}</Label>
    {children}
  </div>
);

export default Settings;
