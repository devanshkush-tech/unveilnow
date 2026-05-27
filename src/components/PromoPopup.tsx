import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X, Timer, Tag } from "lucide-react";

export function PromoPopup() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const alreadyShown = localStorage.getItem("promo-50-shown");
    if (!alreadyShown) {
      const timer = setTimeout(() => setOpen(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setDismissed(true);
    localStorage.setItem("promo-50-shown", "true");
  };

  const handleClaim = () => {
    setOpen(false);
    localStorage.setItem("promo-50-shown", "true");
    navigate("/pricing");
  };

  if (dismissed) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-0 shadow-elegant">
        {/* Decorative top gradient */}
        <div className="h-24 bg-gradient-romance relative flex items-center justify-center">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
              <Tag className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 text-center bg-card">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-display text-gradient leading-tight">
              50% OFF
            </DialogTitle>
            <DialogDescription className="text-base text-foreground font-medium">
              Limited Time Offer
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mt-3 mb-6 leading-relaxed">
            Get half off on all plans — Starter, Premium & Elite. Real connections, real savings. Don&apos;t miss out.
          </p>

          <div className="flex items-center justify-center gap-2 mb-6 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5 text-destructive" />
            <span className="text-destructive font-medium">Offer ends soon</span>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="hero" size="lg" className="w-full rounded-full" onClick={handleClaim}>
              Claim 50% Off
            </Button>
            <button
              onClick={handleClose}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
