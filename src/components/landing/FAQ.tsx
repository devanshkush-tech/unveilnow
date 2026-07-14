import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "How is Unveil Now different from regular dating apps?",
    a: "Unveil Now focuses on stories, prompts, values, and chemistry before photos. You connect with the person first, not just their appearance.",
  },
  {
    q: "When are photos revealed?",
    a: "Photos are revealed only after the chemistry meter is filled, so both people have time to build comfort and interest first.",
  },
  {
    q: "Can I send unlimited likes?",
    a: "Yes. Likes are unlimited. Matches depend on mutual interest and your selected plan.",
  },
  {
    q: "What is counted as a match?",
    a: "A match is created only when both people like each other.",
  },
  {
    q: "What happens when my match limit is over?",
    a: "You can continue receiving interest from others, but to unlock more mutual matches, you need to renew or upgrade your plan.",
  },
  {
    q: "Why is there a fee?",
    a: "The fee helps keep the platform serious and reduces fake intent, casual browsing, and timepass users.",
  },
  {
    q: "Is my profile private?",
    a: "Yes. Your photos and personal details are handled with privacy-first controls.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-28 bg-gradient-soft border-y border-border/60">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-foreground/70 font-medium mb-3">Questions</p>
          <h2 className="font-display text-3xl md:text-5xl leading-tight">
            Frequently asked <em className="italic text-gradient">questions</em>
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
