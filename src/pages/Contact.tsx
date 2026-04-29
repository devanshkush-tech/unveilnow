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
import { Mail, LifeBuoy, MessageSquare, Handshake, Newspaper, ShieldAlert, Wrench, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const contactSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  contact_number: z.string().trim().min(5, "Enter a valid phone").max(30),
  subject: z.string().trim().min(2, "Subject is required").max(150),
  message: z.string().trim().min(5, "Message is too short").max(2000),
});

const reasons = [
  { icon: LifeBuoy, label: "Account Support" },
  { icon: MessageSquare, label: "Feedback & Suggestions" },
  { icon: Handshake, label: "Brand Collaborations" },
  { icon: Newspaper, label: "Media / Press" },
  { icon: ShieldAlert, label: "Safety Concerns" },
  { icon: Wrench, label: "Technical Issues" },
];

const Contact = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    contact_number: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (user?.email && !form.email) setForm((f) => ({ ...f, email: user.email! }));
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to contact us.");
      navigate(`/login?next=${encodeURIComponent("/contact")}`);
      return;
    }
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      ticket_type: "contact",
      ...parsed.data,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    setForm({ full_name: "", email: user.email ?? "", contact_number: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Unveil | Get in Touch</title>
        <meta name="description" content="Contact Unveil for support, feedback, partnerships, and inquiries." />
        <link rel="canonical" href="https://unveilnow.in/contact" />
      </Helmet>
      <Navbar />
      <main className="pt-28 md:pt-32 pb-20">
        <section className="container max-w-3xl text-center animate-fade-up">
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Contact</p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight">
            Let's <em className="italic text-gradient">Connect</em>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Have a question, suggestion, partnership idea, need support, or want to report an issue? We'd love to hear from you.
          </p>
        </section>

        <section className="container max-w-5xl mt-16 grid lg:grid-cols-[1.3fr_1fr] gap-8">
          {/* Form */}
          <div className="rounded-3xl bg-card border border-border/60 shadow-card p-7 md:p-9">
            {done ? (
              <div className="flex flex-col items-center text-center py-10 animate-fade-up">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h2 className="font-display text-2xl mb-2">Message received</h2>
                <p className="text-muted-foreground max-w-sm">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
                <Button variant="soft" className="mt-6 rounded-full" onClick={() => setDone(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <h2 className="font-display text-2xl mb-2">Send us a message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input id="full_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={255} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact number</Label>
                    <Input id="contact_number" type="tel" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} required maxLength={30} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength={150} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={2000} />
                </div>
                <Button type="submit" variant="hero" size="lg" disabled={submitting || loading} className="w-full sm:w-auto">
                  {submitting ? "Sending…" : "Send Message"}
                </Button>
                {!user && !loading && (
                  <p className="text-xs text-muted-foreground">
                    You'll need to sign in to submit. We'll redirect you and bring you right back.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-soft border border-border/60 p-7">
              <Mail className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-display text-xl mb-1">Email us directly</h3>
              <a
                href="mailto:connect.unveil@gmail.com"
                className="text-primary font-medium hover:underline break-all"
              >
                connect.unveil@gmail.com
              </a>
              <p className="text-sm text-muted-foreground mt-3">
                We typically reply within 24–48 hours.
              </p>
            </div>

            <div className="rounded-3xl bg-card border border-border/60 p-7">
              <h3 className="font-display text-xl mb-4">Why reach out</h3>
              <ul className="space-y-3">
                {reasons.map((r) => (
                  <li key={r.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <r.icon className="h-4 w-4 text-primary" />
                    </div>
                    {r.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
