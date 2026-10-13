// One motion language for the whole site. Change values here, not in components.
export const EASE = {
  out: "power3.out",
  inOut: "power3.inOut",
  expo: "expo.out",
} as const;

export const DUR = {
  fast: 0.3,
  base: 0.9,
  slow: 1.4,
  cinematic: 2,
} as const;

export const STAGGER = {
  words: 0.09,
  items: 0.1,
} as const;
