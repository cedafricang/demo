"use client";

import { useEffect, useState } from "react";

export function Wordmark({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  // Dark tone = shown on light/cream backgrounds, so it needs the black
  // logo for contrast. Light tone = shown on dark backgrounds (the hero),
  // so it needs the white logo.
  const src = tone === "dark" ? "/images/logo/shblack.png" : "/images/logo/shwhite.png";

  return (
    <img
      src={src}
      alt="Soundhous"
      className={`h-8 w-auto ${className}`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-quiet ${
        scrolled ? "bg-cream/95 backdrop-blur-sm border-b border-sand/50" : "bg-transparent"
      }`}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <a href="#top" className="leading-none">
          <Wordmark tone={scrolled ? "dark" : "light"} />
        </a>

        <div className="flex items-center gap-5">
          <span
            className={`hidden font-mono text-[11px] uppercase tracking-eyebrow sm:inline transition-colors duration-500 ${
              scrolled ? "text-smoke" : "text-stone/70"
            }`}
          >
            Free &middot; By appointment
          </span>
          <a
            href="#routes"
            className={`border px-5 py-2.5 font-mono text-[11px] uppercase tracking-eyebrow transition-colors duration-300 ease-quiet ${
              scrolled
                ? "border-ink text-ink hover:bg-ink hover:text-cream"
                : "border-cream text-cream hover:bg-cream hover:text-ink"
            }`}
          >
            Book Now
          </a>
        </div>
      </div>
    </header>
  );
}