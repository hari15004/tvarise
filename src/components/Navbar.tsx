"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/types";

type Props = { name: string; logo?: string; items: NavItem[]; cta: NavItem };

export function Navbar({ name, logo, items, cta }: Props) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu whenever the page changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let previousY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const currentY = window.scrollY;
        if (open || currentY <= 80 || document.body.dataset.siteEditMode === "true") {
          setHidden(false);
        } else if (currentY > previousY + 4) {
          setHidden(true);
        } else if (currentY < previousY - 4) {
          setHidden(false);
        }
        previousY = currentY;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [open]);

  // While the menu is open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`nav${hidden && !open ? " nav--hidden" : ""}`} inert={hidden && !open}>
      <div className="container nav__inner">
        <Link href="/" className="brand" aria-label={`${name}, home`}>
          {logo ? (
            <img
              src={logo}
              alt={name}
              style={{ width: "auto", height: "2rem", maxWidth: "9rem", objectFit: "contain" }}
            />
          ) : name}
        </Link>

        <nav aria-label="Primary" className="nav__links">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav__link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav__right">
          <Link href={cta.href} className="btn btn--primary btn--sm" data-magnetic>
            {cta.label}
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="nav__bars" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="menu" hidden={!open}>
        <nav aria-label="Mobile" className="container menu__inner">
          <ul className="menu__list">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="menu__link"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
