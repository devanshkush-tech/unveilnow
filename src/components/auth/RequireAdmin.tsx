import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { adminAuth, type AdminUser } from "@/lib/adminAuth";
import { Loader2 } from "lucide-react";

export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const me = await adminAuth.verify();
      if (!cancelled) setAdmin(me);
    })();
    return () => { cancelled = true; };
  }, []);

  if (admin === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!admin) return <Navigate to="/admindashboard/login" replace />;
  return <>{children}</>;
};
