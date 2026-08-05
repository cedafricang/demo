"use client";

import { routes, type RouteId } from "@/lib/questionnaire";
import { ExperienceIcon } from "./icons";

export function RouteSelector({
  value,
  onSelect,
}: {
  value: RouteId | null;
  onSelect: (id: RouteId) => void;
}) {
  return (
    <section id="routes" className="bg-cream py-24 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">Start Here</p>
          <h2 className="mt-5 font-display text-4xl font-light leading-[1.08] text-ink sm:text-[46px]">
            Which world are you
            <br />
            <span className="italic text-copper">designing for?</span>
          </h2>
          <p className="mt-6 font-body text-[15px] leading-relaxed text-smoke">
            Every space asks different questions. Choose your track, and the
            session ahead is built to match it — nothing generic, nothing
            wasted.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => {
            const active = value === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => onSelect(route.id)}
                aria-pressed={active}
                className={`group flex flex-col overflow-hidden border text-left transition-colors duration-300 ease-quiet ${
                  active ? "border-copper" : "border-sand hover:border-charcoal/40"
                }`}
              >
                {/* photo — up top, on its own, no text laid over it */}
                <div className="relative h-48 w-full shrink-0 overflow-hidden bg-charcoal/10 sm:h-52">
                  <img
                    src={route.image}
                    alt={route.name}
                    className="h-full w-full object-cover transition-transform duration-700 ease-quiet group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center bg-cream/90 font-display text-sm font-light italic text-ink">
                    {route.letter}
                  </span>
                </div>

                {/* text — down below, in its own panel */}
                <div
                  className={`flex flex-1 flex-col gap-3 p-7 sm:p-8 ${
                    active ? "bg-ink text-cream" : "bg-cream text-charcoal"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`eyebrow-smoke ${
                        active ? "text-stone/60" : ""
                      }`}
                    >
                      {route.tagline}
                    </p>
                    <ExperienceIcon
                      icon={route.icon}
                      className={`h-6 w-6 shrink-0 ${
                        active ? "text-copper" : "text-charcoal/50 group-hover:text-copper"
                      }`}
                    />
                  </div>

                  <h3 className="font-display text-2xl font-normal leading-snug sm:text-[24px]">
                    {route.name}
                  </h3>
                  <p
                    className={`font-body text-[14px] leading-relaxed ${
                      active ? "text-stone/80" : "text-smoke"
                    }`}
                  >
                    {route.description}
                  </p>

                  <span
                    className={`mt-auto pt-3 font-mono text-[11px] uppercase tracking-eyebrow ${
                      active ? "text-copper" : "text-charcoal/50 group-hover:text-copper"
                    }`}
                  >
                    {active ? "Selected — scroll to continue ↓" : "Select this track →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}