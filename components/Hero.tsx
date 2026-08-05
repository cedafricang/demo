import { HeroBackground } from "./HeroBackground";

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden text-cream">
      <HeroBackground />

      <div className="container-page relative z-10 flex flex-1 flex-col justify-center pt-28 pb-24">
        <p className="eyebrow">Soundhous Experience Centre &middot; Victoria Island, Lagos</p>

        <h1 className="mt-7 max-w-3xl font-display text-[13vw] font-light leading-[0.98] tracking-[-0.02em] sm:text-[72px] lg:text-[96px]">
          The home of
          <br />
          <span className="italic text-copper">immersive AV.</span>
        </h1>

        <p className="mt-8 max-w-lg font-body text-[16px] leading-relaxed text-stone/85">
          A private, free session at the Experience Centre — built around the
          space you&rsquo;re actually designing for. Tell us which world you
          belong to, and we&rsquo;ll take it from there.
        </p>

        <div className="mt-11 flex flex-wrap items-center gap-8">
          <a
            href="#routes"
            className="border border-cream px-7 py-3.5 font-mono text-[11px] uppercase tracking-eyebrow transition-colors duration-300 ease-quiet hover:bg-cream hover:text-ink"
          >
            Begin your booking
          </a>
          <dl className="flex flex-wrap items-center gap-7">
            <div>
              <dt className="eyebrow-smoke text-stone/60">Cost</dt>
              <dd className="font-display text-base font-light">Free</dd>
            </div>
            <div>
              <dt className="eyebrow-smoke text-stone/60">Format</dt>
              <dd className="font-display text-base font-light">By appointment</dd>
            </div>
            <div>
              <dt className="eyebrow-smoke text-stone/60">Duration</dt>
              <dd className="font-display text-base font-light">45&ndash;60 min</dd>
            </div>
          </dl>
        </div>
      </div>

      <a
        href="#routes"
        aria-label="Scroll to route selection"
        className="group relative z-10 mx-auto mb-10 flex h-11 w-7 items-start justify-center rounded-full border border-cream/40 p-1.5"
      >
        <span className="h-2 w-px animate-[bounce_2s_ease-in-out_infinite] bg-cream/70" />
      </a>
    </section>
  );
}
