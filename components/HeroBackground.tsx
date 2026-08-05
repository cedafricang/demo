export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      {/* hero photo — drop a real image at /public/images/hero.jpg and this just works */}
      <img
        src="/images/sh.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />

      {/* tonal gradient — ink to charcoal, warm light from upper right, also the
          fallback look if no hero image has been added yet */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 8%, rgba(58,47,34,0.55) 0%, rgba(36,29,23,0.72) 32%, rgba(26,26,22,0.85) 62%, rgba(16,15,12,0.94) 100%)",
        }}
      />

      {/* soft copper light source */}
      <div
        className="absolute -right-[10%] -top-[15%] h-[70vh] w-[70vh] rounded-full opacity-[0.22] blur-[110px]"
        style={{ background: "radial-gradient(circle, #A87E5E 0%, transparent 70%)" }}
      />
      <div
        className="absolute left-[6%] top-[55%] h-[40vh] w-[40vh] rounded-full opacity-[0.10] blur-[100px]"
        style={{ background: "radial-gradient(circle, #A87E5E 0%, transparent 70%)" }}
      />

      {/* ambient sound arcs */}
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <circle cx="1230" cy="800" r="70" stroke="#A87E5E" strokeOpacity="0.16" strokeWidth="1" fill="none" className="animate-[pulse_6s_ease-in-out_infinite]" />
        <circle cx="1230" cy="800" r="115" stroke="#A87E5E" strokeOpacity="0.09" strokeWidth="1" fill="none" className="animate-[pulse_6s_ease-in-out_infinite_1s]" />
        <circle cx="1230" cy="800" r="165" stroke="#A87E5E" strokeOpacity="0.05" strokeWidth="1" fill="none" className="animate-[pulse_6s_ease-in-out_infinite_2s]" />
      </svg>

      {/* film grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay" aria-hidden="true">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* vignette + bottom fade to page background */}
      <div className="absolute inset-0 shadow-[inset_0_-40px_120px_60px_rgba(0,0,0,0.35)]" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-ink" />
    </div>
  );
}