import { detectTier, type Tier } from "./tier";

export type { Tier } from "./tier";

/* ---- Tier ---- */
let tier: Tier | null = null;
const tierListeners = new Set<(t: Tier) => void>();

// Browser only. Cached after the first call.
export function getTier(): Tier {
  if (tier === null) tier = detectTier();
  return tier;
}

// Used for runtime downgrades (slow device, WebGL failure).
export function setTier(next: Tier): void {
  if (tier === next) return;
  tier = next;
  const d = document.documentElement;
  d.dataset.tier = next;
  if (next === "static") {
    d.dataset.motion = "off";
    markStageReady();
  }
  tierListeners.forEach((fn) => fn(next));
}

export function onTierChange(fn: (t: Tier) => void): () => void {
  tierListeners.add(fn);
  return () => {
    tierListeners.delete(fn);
  };
}

/* ---- 3D stage readiness (the intro waits for it, with a time cap) ---- */
let stageResolve: () => void = () => {};
export const stageReady: Promise<void> = new Promise<void>((resolve) => {
  stageResolve = resolve;
});
export const markStageReady = (): void => stageResolve();

/* ---- Intro finished (hero entrance and Sculpture assembly start after this) ---- */
let introDone = false;
const introListeners = new Set<() => void>();

export function markIntroDone(): void {
  if (introDone) return;
  introDone = true;
  introListeners.forEach((fn) => fn());
  introListeners.clear();
}

export function onIntroDone(fn: () => void): () => void {
  if (introDone) {
    fn();
    return () => {};
  }
  introListeners.add(fn);
  return () => {
    introListeners.delete(fn);
  };
}

/* ---- Live input read by the 3D stage every frame ---- */
export const stageInput = {
  heroProgress: 0, // 0 to 1 while the hero scrolls
  ctaProgress: 0, // 0 to 1 while the final CTA scrolls in (pieces reassemble)
  pointerX: 0, // -1 to 1
  pointerY: 0, // -1 to 1
};
