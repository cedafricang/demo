# Soundhous — Immersive AV Booking Platform

A single-page, strictly-booking experience for the Soundhous Experience
Centre, 17 Adeyemo Alakija Street, Victoria Island, Lagos. Built with
Next.js 14 (App Router), TypeScript, and Tailwind CSS, against the CED
Africa Group Master Brand System v1.0, the Soundhous Brand Guide (Phase
2B), and the Soundhous Project Intake Questionnaire.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. For production:

```bash
npm run build
npm run start
```

## How the page is built

**Hero** (`components/Hero.tsx`, `components/HeroBackground.tsx`) — a
full-bleed background with the header overlaid and "The home of
immersive AV." as the headline. The background is a generative duotone
scene (architectural line-art, a soft copper light source, ambient
sound arcs, film grain) rather than a photograph — the brand guide
explicitly prohibits stock/generic-library photography as brand-bearing
imagery (§07.2 of the Soundhous guide), so this gets the "background
image" moodboard feel the brief asked for without breaking that rule.
**Swap in commissioned Experience Centre photography here once it
exists** — the layer is a single component, easy to replace with an
`<img>` or `next/image`.

**Route selector** (`components/RouteSelector.tsx`) — the four tracks
from the intake questionnaire's routing page: Residential, Hospitality
& Commercial, Enterprise & Institutional, House of Worship. (The source
document has a fifth track, Private Home Cinema — not included here
since it wasn't in your list of four; say the word and I'll add it as
a fifth card, it's a five-minute change.)

**Booking wizard** (`components/BookingWizard.tsx` +
`components/wizard/*`) — one question per screen, Typeform-style:

- Picking a route determines everything downstream — the question set,
  the total count, the section labels.
- Every question, option, and helper line is transcribed from the
  actual intake PDF (contact fields → "About You & The Project" → the
  selected track's ten questions), including conditional follow-ups
  ("if a developer project, how many units?") and "Other" free-text
  fields.
- Single-choice questions auto-advance a beat after you pick;
  multi-choice and text questions use an explicit Continue; text
  fields advance on Enter.
- A live progress bar and "Question X of N" counter update per route
  (21 questions on every current track, since each PDF track has
  exactly ten).
- A review screen summarises every answer by section with inline
  "Edit" jumps, before final submission.
- The confirmation screen reproduces the intake document's "What
  Happens Next" five-step process and contact details verbatim.

**API route** (`app/api/book/route.ts`) — validates and accepts the
`{ route, routeName, answers }` payload. It currently logs the
submission; wire in your provider of choice where marked in the file
(the brand guide names Zoho as the Soundhous digital stack).

## Brand implementation notes

- **Colour** — Paper Cream `#F7F5F0`, Bone White `#FAFAF7`, Stone
  `#E8E4DC`, Sand `#C9C0B0`, Smoke `#6B6B66`, Charcoal `#2C2C24`, Ink
  `#1A1A16`, Acoustic Copper `#A87E5E` (sole accent, kept small), and
  Bronze Gold `#B8A882` (Group anchor — used once, in the footer).
- **Type** — Fraunces (display), Plus Jakarta Sans (body/UI), JetBrains
  Mono (eyebrows, labels, progress chrome), loaded via
  `next/font/google` with the brand's system fallbacks configured in
  `tailwind.config.ts`.
- **Wordmark** — reproduces the guide's own placeholder construction
  (Fraunces, lowercase, light italic). Swap in the licensed wordmark
  file the moment it's supplied.
- **Voice** — every question, helper line, and confirmation message is
  either lifted directly from the intake document or written to match
  its register: spare, warm, no hyperbole, no urgency language.

## Structure

```
app/
  api/book/route.ts        Booking submission endpoint
  layout.tsx                Fonts, metadata
  page.tsx                   Page assembly + route state
  globals.css
components/
  Header.tsx, Hero.tsx, HeroBackground.tsx, RouteSelector.tsx,
  BookingWizard.tsx, Footer.tsx, icons.tsx
  wizard/
    QuestionCard.tsx          Renders one question + follow-up
    ReviewScreen.tsx           Grouped summary before submit
    ConfirmationScreen.tsx      Post-submit confirmation
lib/
  questionnaire.ts            All question data — contact fields,
                                "About You" questions, and all four
                                route tracks (sourced from the intake PDF)
  process.ts                   "What Happens Next" steps + contact details
```
