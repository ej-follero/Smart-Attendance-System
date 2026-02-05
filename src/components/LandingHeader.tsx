"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Logo from "./Logo";

function useScrollFlag(threshold: number) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > threshold;
      setScrolled((prev) => (prev !== next ? next : prev));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}

export default function LandingHeader() {
  const scrolled = useScrollFlag(8);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const sectionIds = ["features", "flow", "pricing"];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0.15, 0.4, 0.6] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#flow", label: "Flow" },
    { href: "#pricing", label: "Pricing" },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded-lg focus:bg-icct-secondary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>
      <header
        className={`sticky top-0 z-30 border-b transition-[background-color,box-shadow,border-color] duration-200 ${
          scrolled
            ? "border-slate-800/90 bg-slate-950 shadow-[0_1px_0_rgba(148,163,184,0.25),0_14px_40px_-24px_rgba(0,0,0,0.8)] supports-[backdrop-filter]:bg-slate-950/85 supports-[backdrop-filter]:backdrop-blur-lg"
            : "border-transparent bg-slate-950 supports-[backdrop-filter]:bg-slate-950/60 supports-[backdrop-filter]:backdrop-blur"
        }`}
        aria-label="Primary"
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 ${
            scrolled ? "py-3" : "py-4"
          }`}
        >
          <div className="flex items-center gap-2">
            <Logo variant="compact" />
            <span className="text-sm font-semibold text-white hidden xs:inline">
              ICCT Smart Attendance System
            </span>
          </div>

          <nav className="hidden items-center gap-4 text-[11px] text-slate-300 sm:flex">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-2 py-1 transition ${
                    isActive
                      ? "text-icct-secondary"
                      : "hover:text-icct-secondary"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-icct-primary to-icct-secondary px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              Sign in
            </Link>
            <Link
              href="#pricing"
              className="hidden rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-sm transition hover:border-icct-secondary hover:text-icct-secondary sm:inline-flex"
            >
              Request demo
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-md border border-slate-800 bg-slate-900 px-2.5 py-2 text-slate-200 shadow-sm transition hover:border-icct-secondary hover:text-icct-secondary sm:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {menuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-menu"
            className="sm:hidden border-t border-slate-900 bg-slate-950/98 shadow-xl supports-[backdrop-filter]:bg-slate-950/85 supports-[backdrop-filter]:backdrop-blur-lg"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6 lg:px-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace("#", "");
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-icct-secondary/15 text-white"
                        : "text-slate-200 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-icct-primary to-icct-secondary px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                >
                  Sign in
                </Link>
                <Link
                  href="#pricing"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-icct-secondary hover:text-icct-secondary"
                >
                  Request demo
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
