"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/motion/gsap";
import { getTier, markIntroDone, stageReady } from "@/motion/state";
import { EASE } from "@/motion/tokens";

const SEEN_KEY = "studio-intro-seen";
const MIN_MS = 1700; // shortest the intro stays
const MAX_WAIT_MS = 3000; // never wait longer than this for the 3D stage

// Shown only on the first visit (the <html data-intro="on"> flag is set by the
// boot script in layout.tsx). Returning visitors skip straight to the hero.
export function Intro({ name }: { name: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const d = document.documentElement;
    const root = rootRef.current;
    const nameEl = nameRef.current;
    const bar = barRef.current;
    const skip = skipRef.current;
    if (!root || !nameEl || !bar || !skip) return;

    if (d.dataset.intro !== "on" || getTier() === "static") {
      delete d.dataset.intro;
      markIntroDone();
      return;
    }

    let cancelled = false;
    let finished = false;
    const tweens: gsap.core.Animation[] = [];

    tweens.push(
      gsap.fromTo(nameEl, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: EASE.out, delay: 0.1 }),
      gsap.to(bar, { scaleX: 1, duration: 1.6, ease: "power2.inOut" }),
    );

    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {
        // storage unavailable: intro will simply show again next time
      }
      tweens.push(
        gsap.to(root, {
          yPercent: -100,
          duration: 0.9,
          ease: EASE.inOut,
          onComplete: () => {
            delete d.dataset.intro;
            gsap.set(root, { clearProps: "all" });
          },
        }),
        gsap.delayedCall(0.5, markIntroDone),
      );
    };

    const minDelay = new Promise<void>((r) => window.setTimeout(r, MIN_MS));
    const maxWait = new Promise<void>((r) => window.setTimeout(r, MAX_WAIT_MS));
    void Promise.all([minDelay, Promise.race([stageReady, maxWait])]).then(finish);

    skip.addEventListener("click", finish);
    return () => {
      cancelled = true;
      skip.removeEventListener("click", finish);
      tweens.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={rootRef} className="intro">
      <div className="intro__inner">
        <p className="intro__name">
          <span ref={nameRef} className="intro__name-inner">
            {name}
          </span>
        </p>
        <div className="intro__bar" aria-hidden="true">
          <span ref={barRef} />
        </div>
      </div>
      <button ref={skipRef} type="button" className="intro__skip">
        Skip
      </button>
    </div>
  );
}
