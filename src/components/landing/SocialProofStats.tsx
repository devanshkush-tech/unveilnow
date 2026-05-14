import { Users, MessageCircle, BadgeCheck, Heart } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Members across India",
  },
  {
    icon: MessageCircle,
    value: "25,000+",
    label: "Meaningful conversations",
  },
  {
    icon: BadgeCheck,
    value: "Verified",
    label: "Profiles",
  },
  {
    icon: Heart,
    value: "More than",
    label: "Looks — intention first",
  },
];

export const SocialProofStats = () => {
  return (
    <section className="pb-12 md:pb-16">
      <div className="container max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-5 md:p-6 rounded-2xl bg-card border border-border/60 shadow-card flex flex-col items-start"
            >
              <s.icon className="h-5 w-5 text-accent mb-3" />
              <div className="font-display text-xl md:text-2xl text-foreground leading-tight">
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1 leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
