import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const FloatingSignupCTA = () => {
  const { user, loading } = useAuth();
  if (loading || user) return null;

  return (
    <Link
      to="/signup"
      aria-label="Sign up for Unveil"
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 inline-flex items-center gap-2 h-12 px-5 rounded-full bg-gradient-romance text-primary-foreground shadow-glow hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm animate-fade-up"
    >
      <Sparkles className="h-4 w-4" />
      Sign up
    </Link>
  );
};
