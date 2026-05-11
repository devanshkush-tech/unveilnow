import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { useIsAdmin } from "@/hooks/useRole";
import { Loader2 } from "lucide-react";

export function BlindDateGate({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-background via-background to-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md"
      >
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-romance flex items-center justify-center mb-6 shadow-elegant">
          <Sparkles className="h-7 w-7 text-primary-foreground" />
        </div>
        <span className="inline-block text-xs tracking-[0.25em] text-accent-foreground/70 mb-4">
          ✦ BLIND DATE
        </span>
        <h1 className="font-display text-4xl md:text-5xl leading-tight mb-4">
          Coming soon.
        </h1>
        <p className="text-muted-foreground mb-8">
          We're crafting something special. Blind Date launches very soon —
          stay tuned.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm hover:bg-secondary/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Unveil
        </Link>
      </motion.div>
    </div>
  );
}
