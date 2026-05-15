import { Link } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { items, loading, unreadCount, markRead, markAllRead } = useNotifications();
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h1 className="font-display text-2xl">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border/60 p-10 text-center">
            <div className="text-sm text-muted-foreground">You have no notifications yet.</div>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id} className={`rounded-2xl border p-4 ${n.read_at ? "border-border/60 bg-card" : "border-primary/30 bg-secondary/40"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{n.body}</div>
                    <div className="text-[11px] text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.read_at && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-muted-foreground hover:text-foreground shrink-0">
                      Mark read
                    </button>
                  )}
                </div>
                {n.cta_link && n.cta_text && (
                  <div className="mt-3">
                    <Button asChild size="sm" variant="default" className="rounded-full" onClick={() => markRead(n.id)}>
                      <Link to={n.cta_link}>{n.cta_text}</Link>
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
