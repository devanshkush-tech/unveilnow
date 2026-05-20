import { useEffect } from "react";

/**
 * Global motion layer:
 *  - Fades + lifts every <section> and [data-reveal] element into view
 *  - Publishes window scroll position to --scroll-y for [data-parallax] elements
 *  - Respects prefers-reduced-motion
 */
export const ScrollReveal = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scroll-driven parallax variable ---
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
        raf = 0;
      });
    };
    if (!prefersReduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    if (prefersReduced) {
      return () => window.removeEventListener("scroll", onScroll);
    }

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
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
};

export default ScrollReveal;
