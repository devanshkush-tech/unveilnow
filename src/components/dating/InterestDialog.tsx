import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const suggestions = [
  "I liked your story about ",
  "You seem thoughtful — ",
  "Your values stood out to me. ",
  "Your prompt about ",
];

export const InterestDialog = ({
  open,
  onOpenChange,
  receiverId,
  receiverName,
  onSent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  receiverId: string;
  receiverName: string | null;
  onSent?: () => void;
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!user) return;
    if (!message.trim()) {
      toast.error("Add a few words — generic notes get ignored.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("interest_requests").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: message.trim(),
      });
      if (error) {
        if (error.code === "23505") toast.error("You've already sent interest to this person.");
        else toast.error(error.message);
        return;
      }
      toast.success(`Interest sent to ${receiverName ?? "them"}.`);
      setMessage("");
      onOpenChange(false);
      onSent?.();
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="h-12 w-12 rounded-full bg-gradient-romance flex items-center justify-center mb-2">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <DialogTitle className="font-display text-2xl">
            Send {receiverName ?? "them"} a note
          </DialogTitle>
          <DialogDescription>
            Connection before attraction. A real, specific note goes a long way.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What stood out about their story?"
            className="min-h-[120px] rounded-2xl resize-none"
            maxLength={300}
          />
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-accent/30 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> {s.trim()}…
              </button>
            ))}
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {message.length}/300
          </div>

          <Button
            onClick={send}
            disabled={sending}
            variant="hero"
            className="w-full h-12 rounded-full"
            size="lg"
          >
            <Heart className="h-4 w-4" /> {sending ? "Sending…" : "Send interest"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
