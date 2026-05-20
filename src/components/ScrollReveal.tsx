import { useEffect } from "react";

/**
 * Global scroll-reveal: fades + lifts every <section> and any element
 * with [data-reveal] as it enters the viewport. Respects reduced motion.
 */
export const ScrollReveal = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const selector = "section, [data-reveal]";
    const seen = new WeakSet<Element>();

    const prep = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      el.classList.add("sr-init");
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    const scan = () => {
      document.querySelectorAll(selector).forEach((el) => {
        prep(el);
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
};

export default ScrollReveal;
