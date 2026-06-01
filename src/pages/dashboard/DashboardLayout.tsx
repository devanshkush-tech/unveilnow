import { NavLink, Outlet, Link } from "react-router-dom";
import { Compass, Heart, MessageCircle, User, Settings } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { BlindDateToggle } from "@/components/BlindDateToggle";

const tabs = [
  { to: "/dashboard", end: true, label: "Discover", icon: Compass },
  { to: "/dashboard/matches", label: "Matches", icon: Heart },
  { to: "/dashboard/chats", label: "Chats", icon: MessageCircle },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border/60 bg-gradient-soft p-6">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-romance flex items-center justify-center">
              <span className="font-display text-primary-foreground text-lg leading-none pb-0.5">U</span>
            </div>
            <span className="font-display text-xl">Unveil</span>
          </Link>
          <div className="flex items-center gap-2">
            <BlindDateToggle />
            <NotificationBell />
          </div>
        </div>
        <nav className="space-y-1">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                  isActive
                    ? "bg-card text-foreground shadow-soft border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/60 hover:translate-x-0.5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-gradient-romance transition-all duration-300 ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                  <t.icon className={`h-4 w-4 transition-colors ${isActive ? "text-primary" : ""}`} />
                  {t.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4 rounded-2xl bg-gradient-romance text-primary-foreground">
          <p className="font-display text-lg leading-snug">More matches?</p>
          <p className="text-xs opacity-80 mt-1 mb-3">Likes are unlimited. Upgrade for more monthly matches.</p>
          <Link to="/pricing" className="inline-block text-xs font-medium px-3 py-1.5 rounded-full bg-background text-foreground">
            See plans
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-5 h-14 border-b border-border/60 bg-background sticky top-0 z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-romance flex items-center justify-center">
            <span className="font-display text-primary-foreground text-sm leading-none pb-0.5">U</span>
          </div>
          <span className="font-display text-lg">Unveil</span>
        </Link>
        <div className="flex items-center gap-2">
          <BlindDateToggle />
          <NotificationBell />
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-border/60">
        <div className="grid grid-cols-5">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-wider transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-romance transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <t.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "text-primary scale-110" : ""}`} />
                  {t.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
