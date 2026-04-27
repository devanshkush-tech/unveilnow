import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Settings = () => {
  return (
    <div className="container max-w-2xl py-6 md:py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl">Settings</h1>
        <p className="text-muted-foreground mt-1">You're in control.</p>
      </div>

      <Section title="Privacy">
        <Row label="Hide me from friends' contacts"><Switch defaultChecked /></Row>
        <Row label="Show distance instead of city"><Switch /></Row>
        <Row label="Require voice intro to message me"><Switch defaultChecked /></Row>
      </Section>

      <Section title="Notifications">
        <Row label="New matches"><Switch defaultChecked /></Row>
        <Row label="New messages"><Switch defaultChecked /></Row>
        <Row label="Weekly story digest"><Switch /></Row>
      </Section>

      <Section title="Subscription">
        <Row label="Current plan"><span className="text-sm text-muted-foreground">Premium · Renews 12 May</span></Row>
        <Button variant="soft" className="rounded-full">Manage subscription</Button>
      </Section>

      <Section title="Account">
        <Button variant="ghost" className="justify-start">Blocked users</Button>
        <Button variant="ghost" className="justify-start text-destructive hover:text-destructive">Delete my account</Button>
      </Section>
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
