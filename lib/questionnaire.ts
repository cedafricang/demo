import type { IconKey } from "@/components/icons";

export type QuestionType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "textarea"
  | "single"
  | "multi"
  | "date"
  | "schedule";

export type Option = { value: string; label: string };

export type FollowUp = {
  id: string;
  label: string;
  placeholder?: string;
  /** Show this follow-up field when the answer includes any of these option values */
  triggerValues: string[];
};

export type Question = {
  id: string;
  type: QuestionType;
  label: string;
  helper?: string;
  placeholder?: string;
  options?: Option[];
  required?: boolean;
  followUp?: FollowUp;
};

export type RouteId =
  | "sonos"
  | "cinema"
  | "residential"
  | "hospitality"
  | "enterprise"
  | "worship";

export type BookingRoom = "private-cinema" | "hi-fi-room" | "media-room";

export type RouteDef = {
  id: RouteId;
  letter: string;
  name: string;
  tagline: string;
  description: string;
  icon: IconKey;
  /** Path under /public — drop a real photo in and this just works. */
  image: string;
  /**
   * Candidate rooms for this route's session, in priority order. For routes
   * with more than one, a slot is only unavailable once ALL of them are
   * booked — whichever's free gets assigned.
   */
  rooms: BookingRoom[];
  /**
   * Sonos isn't tied to exclusive room time — always bookable Mon–Sat,
   * no conflict checking against the calendar at all.
   */
  unrestricted?: boolean;
};

/** Sonos leads — it's the fastest, most self-serve track, so it goes first. */
export const routes: RouteDef[] = [
  {
    id: "sonos",
    letter: "A",
    name: "Sonos Private Listening Experience",
    tagline: "Come hear it, then take it home",
    description:
      "A private listening session at the Experience Centre — personal audio, home theatre, multi-room, or architectural. No project, no drawings, just great sound.",
    icon: "sonos",
    image: "/images/hifi.jpg",
    rooms: ["hi-fi-room"],
    unrestricted: true,
  },
  {
    id: "cinema",
    letter: "B",
    name: "Private Cinema",
    tagline: "For the ultimate screening room",
    description:
      "A dedicated home cinema, media room, or screening space — engineered for reference-level picture and sound.",
    icon: "privateCinema",
    image: "/images/cinemaroom.jpg",
    rooms: ["private-cinema"],
  },
  {
    id: "residential",
    letter: "C",
    name: "Residential",
    tagline: "For the home",
    description:
      "A home, apartment, or residential development — whole-home audio, multi-room systems, or a single space.",
    icon: "wholeHome",
    image: "/images/arc.png",
    rooms: ["media-room", "hi-fi-room", "private-cinema"],
  },
  {
    id: "hospitality",
    letter: "D",
    name: "Hospitality & Commercial",
    tagline: "For guest-facing spaces",
    description:
      "A restaurant, hotel, lounge, retail space, or other space designed around guest experience.",
    icon: "hospitality",
    image: "/images/kilala1.jpeg",
    rooms: ["media-room", "hi-fi-room", "private-cinema"],
  },
  {
    id: "enterprise",
    letter: "E",
    name: "Enterprise & Institutional",
    tagline: "For reliability and scale",
    description:
      "An office, boardroom, auditorium, or institutional facility — built for reliability and scale.",
    icon: "avEnterprise",
    image: "/images/board.webp",
    rooms: ["media-room", "hi-fi-room", "private-cinema"],
  },
  {
    id: "worship",
    letter: "F",
    name: "House of Worship",
    tagline: "For clarity, near and far",
    description:
      "A sanctuary, chapel, or multipurpose worship hall — sound reinforcement, streaming, and clarity for speech and music.",
    icon: "worship",
    image: "/images/pro.webp",
    rooms: ["media-room", "hi-fi-room", "private-cinema"],
  },
];

/** Contact fields — the bare minimum needed to follow up. */
export const contactFields: Question[] = [
  { id: "fullName", type: "text", label: "Let's start with your name.", placeholder: "Full name", required: true },
  { id: "email", type: "email", label: "And the best email to reach you on.", placeholder: "you@email.com", required: true },
  { id: "phone", type: "tel", label: "A phone or WhatsApp number.", placeholder: "+234", required: true },
];

/**
 * Scheduling — the wizard runs on its own hours, independent of whatever
 * bookings.soundhous.com's internal rules are. Open Monday–Saturday,
 * 9am–6pm, closed Sundays.
 */
export const businessHours = {
  days: "Monday–Saturday",
  hours: "9am–6pm",
  closedDay: 0, // Date.getDay() === 0 → Sunday
};

const TIME_SLOTS: Option[] = [
  { value: "9:00am", label: "9:00am" },
  { value: "10:00am", label: "10:00am" },
  { value: "11:00am", label: "11:00am" },
  { value: "12:00pm", label: "12:00pm" },
  { value: "1:00pm", label: "1:00pm" },
  { value: "2:00pm", label: "2:00pm" },
  { value: "3:00pm", label: "3:00pm" },
  { value: "4:00pm", label: "4:00pm" },
  { value: "5:00pm", label: "5:00pm" },
];

/** Same slots every open day — Monday through Saturday, 9am–6pm. */
export function timeSlotOptionsForDate(_value: string | undefined): Option[] {
  return TIME_SLOTS;
}

/**
 * A single combined step — the answer is stored as a 2-element array:
 * [ preferredDate (yyyy-mm-dd), preferredTime (a slot label like "2:00pm") ].
 * Time options are resolved per-date in the UI, so this question's own
 * `options` is left unset.
 */
export const scheduleFields: Question[] = [
  {
    id: "preferredVisit",
    type: "schedule",
    label: "When works for a visit to the Experience Centre?",
    helper: `We're open ${businessHours.days}, ${businessHours.hours} — closed Sundays. Pick your best guess; we'll confirm exact timing.`,
    required: true,
  },
];

/** Returns true if the given yyyy-mm-dd string falls on the closed day (Sunday). */
export function isClosedDate(value: string | undefined): boolean {
  if (!value) return false;
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  return d.getDay() === businessHours.closedDay;
}

/** Earliest bookable date — tomorrow, formatted for an <input type="date"> min attr. */
export function minBookableDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}


/** Sonos is a walk-in purchase — kept in Naira, starting well below project scale. */
export const budgetQuestionNGN: Question = {
  id: "budgetRange",
  type: "single",
  label: "What budget range are you working with?",
  helper: "A ballpark is fine — this just helps us pitch the right tier of system.",
  required: true,
  options: [
    { value: "under-2m", label: "Under ₦2,000,000" },
    { value: "2m-5m", label: "₦2,000,000 – ₦5,000,000" },
    { value: "5m-15m", label: "₦5,000,000 – ₦15,000,000" },
    { value: "15m-plus", label: "₦15,000,000+" },
    { value: "unsure", label: "Not sure yet — want guidance" },
  ],
};

/** Every other route is a project — priced in USD, starting at $20,000. */
export const budgetQuestionUSD: Question = {
  id: "budgetRange",
  type: "single",
  label: "What budget range are you working with?",
  helper: "A ballpark is fine — this just helps us pitch the right tier of system.",
  required: true,
  options: [
    { value: "20k-50k", label: "$20,000 – $50,000" },
    { value: "50k-100k", label: "$50,000 – $100,000" },
    { value: "100k-250k", label: "$100,000 – $250,000" },
    { value: "250k-plus", label: "$250,000+" },
    { value: "unsure", label: "Not sure yet — want guidance" },
  ],
};

export const timelineQuestion: Question = {
  id: "systemTimeline",
  type: "single",
  label: "What's the target timeline for the system to be live?",
  required: true,
  options: [
    { value: "3", label: "Within 3 months" },
    { value: "3-6", label: "3–6 months" },
    { value: "6-12", label: "6–12 months" },
    { value: "12+", label: "12 months+" },
  ],
};

/**
 * Shared questions, per route. Sonos is a walk-in purchase, not a build —
 * so it only asks budget (in Naira), never a project timeline. Every other
 * route is a project, priced in USD, and also asks for a timeline.
 */
export function sharedQuestions(route: RouteId): Question[] {
  if (route === "sonos") return [budgetQuestionNGN];
  return [budgetQuestionUSD, timelineQuestion];
}

/** Route-specific tracks — only the questions that actually change the proposal. */
export const routeQuestions: Record<RouteId, Question[]> = {
  sonos: [
    {
      id: "so_solutionType",
      type: "multi",
      label: "What type of solution are you looking for?",
      required: true,
      options: [
        { value: "personal", label: "Personal audio" },
        { value: "home-theatre", label: "Home theatre audio" },
        { value: "multiroom", label: "Multi-room" },
        { value: "architectural", label: "Architectural — indoor, in-ceiling & outdoor" },
      ],
    },
  ],

  cinema: [
    {
      id: "c_roomType",
      type: "single",
      label: "What kind of space is this?",
      required: true,
      options: [
        { value: "dedicated", label: "Dedicated home cinema room" },
        { value: "media-room", label: "Multi-purpose media room" },
        { value: "outdoor", label: "Outdoor cinema / screening area" },
        { value: "unsure", label: "Not sure yet — want guidance" },
      ],
    },
    {
      id: "c_seating",
      type: "number",
      label: "Roughly how many seats are you designing for?",
      placeholder: "e.g. 8",
    },
    {
      id: "c_soundFormat",
      type: "single",
      label: "What level of sound are you after?",
      options: [
        { value: "atmos", label: "Full immersive (Dolby Atmos-class)" },
        { value: "surround", label: "Standard surround (5.1 / 7.1)" },
        { value: "stereo", label: "Simple stereo" },
        { value: "recommend", label: "Open to recommendation" },
      ],
    },
    {
      id: "c_specific",
      type: "textarea",
      label: "Anything specific you want this room to do?",
      helper: "e.g. \u201cdouble as a screening room for guests,\u201d \u201cone-touch start for movie night.\u201d",
      placeholder: "Optional",
    },
  ],

  residential: [
    {
      id: "r_buildStage",
      type: "single",
      label: "Is this a new build or an existing home?",
      required: true,
      options: [
        { value: "new-pre", label: "New build, pre-construction" },
        { value: "new-under", label: "New build, under construction" },
        { value: "existing-retrofit", label: "Existing home — retrofit" },
        { value: "renovation", label: "Renovation in progress" },
      ],
    },
    {
      id: "r_audioScope",
      type: "single",
      label: "What's the scope of audio you want?",
      required: true,
      options: [
        { value: "whole-every", label: "Whole-home, every room" },
        { value: "whole-key", label: "Whole-home, key rooms only" },
        { value: "one-two", label: "One or two specific rooms" },
        { value: "outdoor", label: "Outdoor / pool / garden only" },
        { value: "unsure", label: "Not sure yet — want guidance" },
      ],
    },
    {
      id: "r_rooms",
      type: "multi",
      label: "Which rooms or areas should be included?",
      options: [
        { value: "living", label: "Living room" },
        { value: "dining", label: "Dining room" },
        { value: "kitchen", label: "Kitchen" },
        { value: "bedrooms", label: "Bedrooms" },
        { value: "office", label: "Home office / study" },
        { value: "pool", label: "Pool / outdoor deck" },
        { value: "garden", label: "Garden / compound" },
      ],
    },
    {
      id: "r_specific",
      type: "textarea",
      label: "Anything specific you want the system to solve?",
      helper: "e.g. \u201cmusic in every room without visible speakers,\u201d \u201cone remote for everything.\u201d",
      placeholder: "Optional",
    },
  ],

  hospitality: [
    {
      id: "h_venueType",
      type: "single",
      label: "What type of venue is this?",
      required: true,
      options: [
        { value: "restaurant", label: "Restaurant" },
        { value: "hotel", label: "Hotel" },
        { value: "lounge", label: "Lounge / bar / nightclub" },
        { value: "retail", label: "Retail store" },
        { value: "event", label: "Event / multi-purpose venue" },
        { value: "other", label: "Other" },
      ],
      followUp: {
        id: "h_venueTypeOther",
        label: "Tell us a little more",
        triggerValues: ["other"],
      },
    },
    {
      id: "h_zones",
      type: "textarea",
      label: "How many distinct zones or areas need audio?",
      helper: "e.g. main dining, bar, terrace, private room — list them.",
    },
    {
      id: "h_primaryUse",
      type: "multi",
      label: "Primary use of the system.",
      options: [
        { value: "ambient", label: "Background / ambient music" },
        { value: "live", label: "Live music or DJ performance" },
        { value: "paging", label: "Announcements / paging" },
        { value: "sports", label: "Sports / event viewing (video + audio)" },
      ],
    },
    {
      id: "h_experience",
      type: "textarea",
      label: "What experience should the sound create for guests?",
      helper: "e.g. \u201cenergetic and loud at night, calm during lunch.\u201d",
      placeholder: "Optional",
    },
  ],

  enterprise: [
    {
      id: "e_facilityType",
      type: "single",
      label: "What type of facility is this?",
      required: true,
      options: [
        { value: "office", label: "Corporate office" },
        { value: "boardroom", label: "Boardroom / meeting rooms" },
        { value: "auditorium", label: "Auditorium / training centre" },
        { value: "bank", label: "Bank / financial institution branch" },
        { value: "school", label: "School / university facility" },
        { value: "other", label: "Other" },
      ],
      followUp: {
        id: "e_facilityTypeOther",
        label: "Tell us a little more",
        triggerValues: ["other"],
      },
    },
    {
      id: "e_spaces",
      type: "textarea",
      label: "How many spaces need AV, and what kind?",
      helper: "e.g. \u201c3 boardrooms, 1 town-hall space, reception lobby.\u201d",
    },
    {
      id: "e_videoConf",
      type: "single",
      label: "Do rooms need video conferencing capability?",
      options: [
        { value: "all", label: "Yes, all rooms" },
        { value: "select", label: "Yes, select rooms" },
        { value: "no", label: "No" },
      ],
    },
    {
      id: "e_driving",
      type: "textarea",
      label: "What's driving this project?",
      helper: "e.g. new office fit-out, upgrade of failing legacy system.",
      placeholder: "Optional",
    },
  ],

  worship: [
    {
      id: "w_capacity",
      type: "number",
      label: "What is the seating / congregation capacity of the main hall?",
      placeholder: "Approximate number",
      required: true,
    },
    {
      id: "w_service",
      type: "multi",
      label: "What does the service typically involve?",
      options: [
        { value: "spoken", label: "Spoken word / preaching" },
        { value: "choir", label: "Choir" },
        { value: "band", label: "Live band / instruments" },
        { value: "playback", label: "Playback / recorded music" },
      ],
    },
    {
      id: "w_stream",
      type: "single",
      label: "Do you currently stream or record services?",
      options: [
        { value: "live", label: "Yes — live streaming" },
        { value: "want", label: "Not yet, but want to" },
        { value: "no", label: "Not needed" },
      ],
    },
    {
      id: "w_funding",
      type: "single",
      label: "How is this project being funded?",
      options: [
        { value: "approved", label: "Approved budget, ready to proceed" },
        { value: "fundraising", label: "Fundraising in progress" },
        { value: "phased", label: "Phased — want a plan we can build in stages" },
      ],
    },
  ],
};

export function routeQuestionCount(route: RouteId): number {
  return (
    contactFields.length +
    routeQuestions[route].length +
    sharedQuestions(route).length +
    scheduleFields.length
  );
}