import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 48 48",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.15,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export type IconKey =
  | "sonos"
  | "multiRoom"
  | "homeTheatre"
  | "portable"
  | "privateCinema"
  | "lighting"
  | "wholeHome"
  | "avEnterprise"
  | "hospitality"
  | "worship";

function Sonos(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="24" cy="24" r="15.5" />
      <circle cx="24" cy="24" r="8.5" />
      <circle cx="24" cy="24" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MultiRoom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="8" width="14" height="14" rx="1.5" />
      <rect x="28" y="8" width="14" height="14" rx="1.5" />
      <rect x="17" y="27" width="14" height="14" rx="1.5" />
      <path d="M13 22v3.5M35 22v3.5M24 27v-4" />
    </svg>
  );
}

function HomeTheatre(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 33 20 14h8l13 19" />
      <rect x="14" y="33" width="20" height="7" rx="1" />
      <path d="M18 40h12" />
    </svg>
  );
}

function Portable(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="12" y="14" width="24" height="20" rx="4" />
      <circle cx="19" cy="24" r="3.4" />
      <circle cx="29" cy="24" r="3.4" />
      <path d="M20 14v-3h8v3" />
    </svg>
  );
}

function PrivateCinema(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 15h30l-3 20H12z" />
      <path d="M15 35c0 2.5 1.5 4 4 4h10c2.5 0 4-1.5 4-4" />
      <path d="M16 15v-4M32 15v-4" />
    </svg>
  );
}

function Lighting(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6v5M24 6c-6 3-8 8-5.5 13.5 1.4 3 1.5 5 .8 7.5h17.4c-.7-2.5-.6-4.5.8-7.5C40 14 38 9 32 6" />
      <path d="M18.5 32h11M19.5 36h9M21.5 40h5" />
    </svg>
  );
}

function WholeHome(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M8 22 24 8l16 14" />
      <path d="M12 19v18h24V19" />
      <path d="M20 37V27h8v10" />
      <circle cx="24" cy="22" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AvEnterprise(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="10" width="36" height="21" rx="1.5" />
      <path d="M17 38h14M24 31v7" />
      <path d="M13 17h8M13 21h5" />
      <circle cx="32" cy="19" r="4.2" />
    </svg>
  );
}

function Hospitality(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="10" y="10" width="28" height="30" />
      <path d="M10 40h28" />
      <path d="M16 17h4M24 17h4M16 24h4M24 24h4M16 31h4M24 31h4" />
      <path d="M20 40v-8h8v8" />
    </svg>
  );
}

function Worship(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6v14M18 12h12" />
      <path d="M12 40V24l12-9 12 9v16" />
      <path d="M12 40h24" />
      <path d="M20 40V30h8v10" />
    </svg>
  );
}

const registry: Record<IconKey, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  sonos: Sonos,
  multiRoom: MultiRoom,
  homeTheatre: HomeTheatre,
  portable: Portable,
  privateCinema: PrivateCinema,
  lighting: Lighting,
  wholeHome: WholeHome,
  avEnterprise: AvEnterprise,
  hospitality: Hospitality,
  worship: Worship,
};

export function ExperienceIcon({
  icon,
  className,
}: {
  icon: IconKey;
  className?: string;
}) {
  const Cmp = registry[icon];
  return <Cmp className={className} />;
}
