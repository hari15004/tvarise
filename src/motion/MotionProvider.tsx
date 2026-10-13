"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";
import { getTier, onIntroDone, stageInput } from "./state";
import { initReveals } from "./reveal";
import { initMagnetic } from "./magnetic";
import { initScrollScenes } from "./scroll";
import { initSpotlight } from "./spotlight";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // Runs once: detect tier, start smooth scroll, track the pointer.
  useEffect(() => {
    const d = document.documentElement;
    const tier = getTier();
    d.dataset.tier = tier;
    d.dataset.ready = "1";

    if (tier === "static") {
      // Reduced motion / no WebGL: everything visible immediately, no effects.
      d.dataset.motion = "off";
      delete d.dataset.intro;
      d.dataset.navIn = "1";
      return;
    }

    // Navbar slides in shortly after the intro.
    const offIntro = onIntroDone(() => {
      window.setTimeout(() => {
        d.dataset.navIn = "1";
      }, 900);
    });

    // Smooth scroll on desktop-class devices only.
    let raf: ((time: number) => void) | null = null;
    if (tier === "full") {
      const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
    }

    // Pointer position feeds the Sculpture parallax (desktop only).
    const onPointer = (e: PointerEvent) => {
      stageInput.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      stageInput.pointerY = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (tier === "full" && finePointer) {
      window.addEventListener("pointermove", onPointer, { passive: true });
    }

    return () => {
      offIntro();
      window.removeEventListener("pointermove", onPointer);
      if (raf) gsap.ticker.remove(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  // Runs on every page change: reset scroll, set up reveals and magnetic buttons.
  useEffect(() => {
    const tier = getTier();
    if (tier === "static") return;

    lenisRef.current?.scrollTo(0, { immediate: true });
    const killReveals = initReveals();
    const killMagnetic = tier === "full" ? initMagnetic() : () => {};
    const killSpotlight = tier === "full" ? initSpotlight() : () => {};
    const killScenes = initScrollScenes();
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 150);

    return () => {
      window.clearTimeout(refresh);
      killReveals();
      killMagnetic();
      killSpotlight();
      killScenes();
    };
  }, [pathname]);

  return <>{children}</>;
}
