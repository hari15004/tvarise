import { gsap } from "./gsap";

const STRENGTH = 0.32;
const RADIUS = 1.1; // reach beyond the element, as a multiple of its size

// Pulls every [data-magnetic] element slightly toward the pointer when it is near.
// Desktop (fine pointer) only. Returns a cleanup function.
export function initMagnetic(): () => void {
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};

  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]")).map(
    (el) => ({
      el,
      x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
    }),
  );
  if (items.length === 0) return () => {};

  const onMove = (e: PointerEvent) => {
    for (const { el, x, y } of items) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = Math.max(r.width, r.height) * RADIUS;
      if (Math.hypot(dx, dy) < reach) {
        x(dx * STRENGTH);
        y(dy * STRENGTH);
      } else {
        x(0);
        y(0);
      }
    }
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  return () => {
    window.removeEventListener("pointermove", onMove);
    items.forEach(({ el }) => gsap.set(el, { x: 0, y: 0 }));
  };
}
