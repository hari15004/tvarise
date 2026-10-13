export type Tier = "full" | "lite" | "static";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

// Decides how much of the experience this device gets. Browser only.
export function detectTier(): Tier {
  if (typeof window === "undefined") return "static";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static";
  if (!hasWebGL()) return "static";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const saveData = nav.connection?.saveData === true;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const fewCores = (navigator.hardwareConcurrency ?? 8) <= 4;
  const smallScreen = window.matchMedia("(max-width: 820px)").matches;
  const touch = window.matchMedia("(pointer: coarse)").matches;

  if (saveData || lowMemory || fewCores || smallScreen || touch) return "lite";
  return "full";
}
