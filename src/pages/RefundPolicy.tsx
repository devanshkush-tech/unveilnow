import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Mail, Clock, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const refundSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  contact_number: z.string().trim().min(5, "Enter a valid phone").max(30),
  transaction_id: z.string().trim().min(2, "Transaction ID is required").max(100),
  purchase_date: z.string().min(1, "Purchase date is required"),
  message: z.string().trim().min(5, "Reason is too short").max(2000),
});

const effectiveDate = new Date().toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="font-display text-2xl mt-2">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-6 space-y-2">
    {items.map((i) => <li key={i}>{i}</li>)}
  </ul>
);

const RefundPolicy = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    transaction_id: "",
    purchase_date: "",
    message: "",
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = "Refund & Cancellation Policy | Unveil";
    }
  }, []);

  useEffect(() => {
    if (user?.email && !form.email) setForm((f) => ({ ...f, email: user.email! }));
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to submit a refund request.");
      navigate(`/login?next=${encodeURIComponent("/refund-policy")}`);
      return;
    }
    const parsed = refundSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      ticket_type: "refund",
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      contact_number: parsed.data.contact_number,
      transaction_id: parsed.data.transaction_id,
      purchase_date: parsed.data.purchase_date,
      subject: "Refund request",
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    setForm({
      full_name: "",
      email: user.email ?? "",
      contact_number: "",
      transaction_id: "",
      purchase_date: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-28 md:pt-32 pb-20">
        <section className="container max-w-3xl text-center animate-fade-up">
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Policies</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight">
            Refund & <em className="italic text-gradient">Cancellation</em> Policy
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Transparent policies for payments, subscriptions, and cancellations at Unveil.
          </p>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
            Effective Date: {effectiveDate}
          </p>
        </section>

        <section className="container max-w-3xl mt-16 space-y-10">
          <Section title="Refund Policy">
            <p>At Unveil, we aim to provide a premium and fair digital experience.</p>
            <p>Refund requests must be submitted within 7 days of purchase.</p>
            <p className="font-medium text-foreground">Refunds may be considered for:</p>
            <Bullets items={[
              "Duplicate payment",
              "Technical issues preventing access",
              "Unauthorized verified transaction",
              "Paid feature not delivered as described",
            ]} />
            <p className="font-medium text-foreground">Refunds may not apply for:</p>
            <Bullets items={[
              "Change of mind",
              "Partial use of subscription period",
              "Violation of platform terms",
              "Completed verification or consumed digital services",
            ]} />
          </Section>

          <Section title="Cancellation Policy">
            <Bullets items={[
              "Users may cancel recurring subscriptions anytime before the next billing cycle.",
              "Cancellation stops future billing.",
              "Current paid access remains active until the billing period ends.",
            ]} />
          </Section>
        </section>

        {/* Refund Request Form */}
        <section className="container max-w-3xl mt-16">
          <div className="rounded-3xl bg-card border border-border/60 shadow-card p-7 md:p-9">
            {done ? (
              <div className="flex flex-col items-center text-center py-10 animate-fade-up">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-display text-2xl mb-2">Request received</h2>
                <p className="text-muted-foreground max-w-md">
                  Your request has been received. Our team will review it shortly.
                </p>
                <Button variant="soft" className="mt-6 rounded-full" onClick={() => setDone(false)}>
                  Submit another request
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <h2 className="font-display text-2xl mb-2">Refund / Cancellation Request</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Registered email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact number</Label>
                    <Input id="contact_number" type="tel" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} required maxLength={30} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction_id">Transaction ID</Label>
                    <Input id="transaction_id" value={form.transaction_id} onChange={(e) => setForm({ ...form, transaction_id: e.target.value })} required maxLength={100} />
                  </div>
                </div>
                <div className="space-y-2 sm:max-w-[50%]">
                  <Label htmlFor="purchase_date">Purchase date</Label>
                  <Input id="purchase_date" type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Reason for request</Label>
                  <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={2000} />
                </div>
                <Button type="submit" variant="hero" size="lg" disabled={submitting || loading} className="w-full sm:w-auto">
                  {submitting ? "Submitting…" : "Submit Request"}
                </Button>
                {!user && !loading && (
                  <p className="text-xs text-muted-foreground">
                    You'll need to sign in to submit. We'll redirect you and bring you right back.
                  </p>
                )}
              </form>
            )}
          </div>
        </section>

        <section className="container max-w-3xl mt-12 grid sm:grid-cols-2 gap-5">
          <div className="rounded-3xl bg-gradient-soft border border-border/60 p-6">
            <Mail className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-display text-lg mb-1">Support email</h3>
            <a href="mailto:connect.unveil@gmail.com" className="text-primary font-medium hover:underline break-all">
              connect.unveil@gmail.com
            </a>
          </div>
          <div className="rounded-3xl bg-card border border-border/60 p-6">
            <Clock className="h-5 w-5 text-primary mb-3" />
            <h3 className="font-display text-lg mb-1">Processing timeline</h3>
            <p className="text-sm text-muted-foreground">
              Reviews within 5–7 business days. Approved refunds may take additional bank/payment gateway processing time.
            </p>
          </div>
        </section>

        <section className="container max-w-3xl mt-10">
          <div className="rounded-3xl border border-border/60 bg-secondary/40 p-6 flex gap-4">
            <ShieldAlert className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Important: </span>
              Unveil reserves the right to review all requests fairly and prevent abuse or fraud.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
