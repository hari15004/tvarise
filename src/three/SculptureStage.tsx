"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getTier, markStageReady, onIntroDone, onTierChange, setTier } from "@/motion/state";
import type { PieceDef, Sculpture } from "./sculpture";

// Fixed full-screen stage behind the page. Three.js is loaded only when needed
// (never for the Static tier). Active on the home page; hidden on other pages.
export function SculptureStage({ pieces }: { pieces: PieceDef[] }) {
  const isHome = usePathname() === "/";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrl = useRef<Sculpture | null>(null);
  const busy = useRef(false);
  const alive = useRef(false);
  const homeRef = useRef(isHome);
  const piecesRef = useRef(pieces);
  const buildRef = useRef<() => void>(() => {});

  useEffect(() => {
    homeRef.current = isHome;
    piecesRef.current = pieces;
  });

  // Lifecycle: build/teardown, react to tier changes (e.g. slow device downgrade).
  useEffect(() => {
    alive.current = true;
    let offIntro: () => void = () => {};

    const teardown = () => {
      offIntro();
      ctrl.current?.dispose();
      ctrl.current = null;
    };

    const build = async () => {
      const canvas = canvasRef.current;
      const tier = getTier();
      if (!canvas || tier === "static" || ctrl.current || busy.current) return;
      busy.current = true;
      try {
        const mod = await import("./sculpture");
        if (!alive.current) return;
        const sculpture = mod.createSculpture({
          canvas,
          pieces: piecesRef.current,
          tier,
          onSlow: () => setTier(tier === "full" ? "lite" : "static"),
          onContextLost: () => setTier("static"),
        });
        ctrl.current = sculpture;
        sculpture.setActive(homeRef.current);
        markStageReady();
        offIntro = onIntroDone(() => sculpture.assemble());
      } catch {
        // WebGL failed: fall back to the static experience.
        setTier("static");
      } finally {
        busy.current = false;
      }
    };
    buildRef.current = () => void build();

    const offTier = onTierChange((t) => {
      teardown();
      if (t === "lite") void build();
    });

    return () => {
      alive.current = false;
      offTier();
      teardown();
    };
  }, []);

  // Home only: create on first visit to "/", show/hide when navigating.
  useEffect(() => {
    if (isHome) {
      buildRef.current();
    } else {
      markStageReady(); // nothing to wait for on other pages
    }
    ctrl.current?.setActive(isHome);
  }, [isHome]);

  return (
    <div className="stage" aria-hidden="true">
      <canvas ref={canvasRef} className="stage__canvas" />
      {/* Static tier fallback: a simple still of the same idea. */}
      <svg className="stage__static" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="200,60 270,150 130,150" />
        <circle cx="290" cy="240" r="48" />
        <polygon points="110,210 170,250 150,320 90,290" />
        <polygon points="220,300 260,330 240,370 200,370 180,330" />
      </svg>
    </div>
  );
}
