import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Why are photos hidden at first?",
    a: "We've found people connect deeper when they read each other first. It strips away the snap-judgement of swiping and lets your personality lead.",
  },
  {
    q: "When do photos reveal?",
    a: "Only when both people opt in. You can request a reveal in chat, and the moment they accept, photos unveil simultaneously for both of you.",
  },
  {
    q: "Is Unveil only for people looking for marriage?",
    a: "Not at all. Unveil is for anyone dating with intention — whether that's a serious relationship, marriage, or exploring with depth.",
  },
  {
    q: "How do you keep the community safe?",
    a: "Every profile is reviewed by humans, AI moderated for harmful behaviour, and reports are actioned within 24 hours.",
  },
  {
    q: "Can I use Unveil for free?",
    a: "Yes. Our free tier gives you a curated daily set of matches. Paid plans unlock unlimited likes, better filters and priority discovery.",
  },
];

export const FAQ = () => {
  return (
    <section className="py-24 md:py-32 bg-gradient-soft border-t border-border/60">
      <div className="container max-w-3xl">
        <div className="text-center mb-14">
          <p className="text-sm uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-4">Questions</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            Everything you'd want to know.
          </h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card border border-border/60 rounded-2xl px-6 shadow-soft"
            >
              <AccordionTrigger className="font-display text-lg hover:no-underline text-left">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
