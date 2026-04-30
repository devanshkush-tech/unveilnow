import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, EyeOff } from "lucide-react";
import { adminAuth } from "@/lib/adminAuth";
import { toast } from "sonner";

type Match = {
  id: string;
  other: { id: string; first_name?: string; age?: number; city?: string };
  messages: { id: string; body: string; sender_id: string; created_at: string }[];
  created_at: string;
};

type Snapshot = {
  profile: any;
  matches: Match[];
  photo_urls: string[];
};

const AdminImpersonate = ({ userId, open, onOpenChange }: { userId: string | null; open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeMatch, setActiveMatch] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setSnap(null);
    setLoading(true);
    (async () => {
      try {
        const data = await adminAuth.call<Snapshot>("impersonate_view", { user_id: userId });
        setSnap(data);
        setActiveMatch(data.matches[0]?.id ?? null);
      } catch (e: any) { toast.error(e.message); }
      setLoading(false);
    })();
  }, [open, userId]);

  const current = snap?.matches.find((m) => m.id === activeMatch);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border/60">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-muted-foreground" />
            Read-only view as {snap?.profile?.first_name ?? "user"}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">You can browse this member's matches and chats. Sending messages is disabled.</p>
        </DialogHeader>

        {loading || !snap ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-0">
            {/* Match list */}
            <aside className="border-r border-border/60 overflow-y-auto">
              {snap.matches.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No matches yet.</div>
              ) : snap.matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMatch(m.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/40 hover:bg-secondary/40 ${activeMatch === m.id ? "bg-secondary/60" : ""}`}
                >
                  <div className="font-medium">{m.other.first_name ?? "Member"}{m.other.age ? `, ${m.other.age}` : ""}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {m.messages.at(-1)?.body ?? "No messages yet"}
                  </div>
                </button>
              ))}
            </aside>

            {/* Conversation */}
            <section className="flex flex-col min-h-0">
              {!current ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Select a match to view the conversation.</div>
              ) : (
                <>
                  <header className="px-5 py-3 border-b border-border/60">
                    <div className="font-display text-lg">{current.other.first_name ?? "Member"}</div>
                    <div className="text-xs text-muted-foreground">{current.other.city ?? ""}</div>
                  </header>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gradient-soft">
                    {current.messages.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground">No messages in this match.</div>
                    ) : current.messages.map((msg) => {
                      const mine = msg.sender_id === userId;
                      return (
                        <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-gradient-romance text-primary-foreground" : "bg-card border border-border/60"}`}>
                            <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                            <p className={`text-[10px] mt-1 ${mine ? "opacity-80" : "text-muted-foreground"}`}>
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <footer className="px-5 py-3 border-t border-border/60 bg-secondary/30 text-xs text-muted-foreground">
                    🔒 Read-only — admin impersonation cannot send messages.
                  </footer>
                </>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminImpersonate;
