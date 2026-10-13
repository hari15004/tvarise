// Sets --mx / --my on every [data-spotlight] element while the pointer moves over it.
// CSS draws the light. Desktop (fine pointer) only.
export function initSpotlight(): () => void {
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};

  const items = Array.from(document.querySelectorAll<HTMLElement>("[data-spotlight]")).map((el) => {
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return { el, onMove };
  });

  return () => items.forEach(({ el, onMove }) => el.removeEventListener("pointermove", onMove));
}
