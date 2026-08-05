"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  contactFields,
  scheduleFields,
  sharedQuestions,
  routeQuestions,
  routes,
  isClosedDate,
  type Question,
  type RouteId,
} from "@/lib/questionnaire";
import { QuestionCard, type Answers, type AnswerValue } from "./wizard/QuestionCard";
import { ReviewScreen } from "./wizard/ReviewScreen";
import { ConfirmationScreen } from "./wizard/ConfirmationScreen";
import { ExperienceIcon } from "./icons";

type Phase = "question" | "review" | "success";
type SubmitStatus = "idle" | "submitting" | "error";

function isValid(q: Question, value: AnswerValue): boolean {
  if (q.type === "schedule") {
    const arr = Array.isArray(value) ? value : [];
    const [date, time] = arr;
    if (isClosedDate(date)) return false;
    if (!q.required) return true;
    return Boolean(date && time);
  }
  if (!q.required) return true;
  if (q.type === "multi") return Array.isArray(value) && value.length > 0;
  if (q.type === "email") return typeof value === "string" && /^\S+@\S+\.\S+$/.test(value);
  return typeof value === "string" && value.trim().length > 0;
}

export function BookingWizard({
  route,
  onChangeRoute,
}: {
  route: RouteId | null;
  onChangeRoute: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [phase, setPhase] = useState<Phase>("question");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invalidFlash, setInvalidFlash] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Refs mirroring the latest state — setTimeout-delayed callbacks (the
  // auto-advance after picking a single-choice answer) close over a
  // specific render, so without these they'd validate against stale
  // pre-click state. Mutating during render keeps them always current.
  const answersRef = useRef<Answers>({});
  const indexRef = useRef(0);
  const stepsRef = useRef<Question[]>([]);

  const routeDef = useMemo(() => routes.find((r) => r.id === route) ?? null, [route]);
  const routeSharedQuestions = useMemo(() => (route ? sharedQuestions(route) : []), [route]);

  const steps = useMemo<Question[]>(() => {
    if (!route) return [];
    return [...contactFields, ...routeQuestions[route], ...routeSharedQuestions, ...scheduleFields];
  }, [route, routeSharedQuestions]);

  const total = steps.length;
  const contactLen = contactFields.length;

  // Keep refs current on every render so delayed callbacks (auto-advance)
  // never act on stale, pre-update values.
  answersRef.current = answers;
  indexRef.current = index;
  stepsRef.current = steps;

  // Reset the flow whenever the person picks a different track.
  useEffect(() => {
    setIndex(0);
    setPhase("question");
    setConsent(false);
    setStatus("idle");
    setInvalidFlash(false);
    // Keep contact-info + scheduling answers if they already filled them
    // in on a previous track — everything else (route-specific) starts fresh.
    setAnswers((prev) => {
      const kept: Answers = {};
      [...contactFields, ...scheduleFields].forEach((f) => {
        if (prev[f.id] !== undefined) kept[f.id] = prev[f.id];
      });
      return kept;
    });
  }, [route]);

  useEffect(() => {
    if (!route) return;
    const t = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(t);
  }, [route, index, phase]);

  if (!route || !routeDef) {
    return (
      <section id="book" className="border-t border-sand bg-bone py-28">
        <div className="container-page">
          <div className="mx-auto max-w-md text-center">
            <p className="eyebrow justify-center">Waiting On You</p>
            <h3 className="mt-5 font-display text-3xl font-light leading-snug text-ink">
              Choose a track above to begin.
            </h3>
            <p className="mt-4 font-body text-[14px] leading-relaxed text-smoke">
              The questions ahead change completely depending on the space
              you&rsquo;re designing for — pick one and the session starts
              here.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const current = steps[index];

  function updateField(id: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setInvalidFlash(false);
  }

  function goNext() {
    const idx = indexRef.current;
    const stepsNow = stepsRef.current;
    const q = stepsNow[idx];
    const val = answersRef.current[q.id];
    if (!isValid(q, val)) {
      setInvalidFlash(true);
      return;
    }
    if (idx < stepsNow.length - 1) {
      setIndex(idx + 1);
    } else {
      setPhase("review");
    }
  }

  function goBack() {
    if (phase === "review") {
      setPhase("question");
      return;
    }
    if (index > 0) {
      setIndex((i) => i - 1);
    } else {
      onChangeRoute();
    }
  }

  async function handleSubmit() {
    setStatus("submitting");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ route: routeDef!.id, routeName: routeDef!.name, answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          // The slot was taken between page-load and submit — send them
          // straight back to the date/time step to pick another.
          setIndex(total - 1);
          setPhase("question");
        }
        setErrorMessage(data.error ?? "Request failed.");
        setStatus("error");
        return;
      }
      setPhase("success");
      setStatus("idle");
    } catch {
      setErrorMessage(null);
      setStatus("error");
    }
  }

  const routeLen = routeQuestions[route].length;
  const sharedLen = routeSharedQuestions.length;

  const sectionLabel =
    index < contactLen
      ? "Your Details"
      : index < contactLen + routeLen
      ? routeDef.name
      : index < contactLen + routeLen + sharedLen
      ? "Budget"
      : "Pick a Date & Time";

  const progressPct =
    phase === "success" ? 100 : phase === "review" ? 100 : Math.round(((index + 1) / total) * 100);

  const groups = [
    { title: "Your Details", startIndex: 0, questions: contactFields },
    { title: routeDef.name, startIndex: contactLen, questions: routeQuestions[route] },
    { title: "Budget", startIndex: contactLen + routeLen, questions: routeSharedQuestions },
    {
      title: "Date & Time",
      startIndex: contactLen + routeLen + sharedLen,
      questions: scheduleFields,
    },
  ];

  return (
    <section id="book" className="border-t border-sand bg-bone py-20 sm:py-28">
      <div className="container-page">
        <div ref={cardRef} className="mx-auto max-w-3xl scroll-mt-28 border border-sand bg-cream">
          {/* Route photo — up top, on its own */}
          <div className="h-40 w-full overflow-hidden bg-charcoal/10 sm:h-52">
            <img
              src={routeDef.image}
              alt={routeDef.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          {/* Route name — down below the photo, its own bar */}
          <div className="flex items-center gap-3 border-b border-sand bg-ink px-7 py-4 sm:px-14">
            <ExperienceIcon icon={routeDef.icon} className="h-6 w-6 text-copper" />
            <span className="font-display text-lg font-light italic text-cream sm:text-xl">
              {routeDef.name}
            </span>
          </div>

          {/* Progress header */}
          <div className="border-b border-sand px-7 py-6 sm:px-14">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[10.5px] uppercase tracking-eyebrow text-smoke">
                {phase === "success" ? "Confirmed" : phase === "review" ? "Review" : sectionLabel}
              </p>
              <div className="flex items-center gap-4">
                {phase === "question" && (
                  <p className="font-mono text-[10.5px] uppercase tracking-eyebrow text-smoke">
                    Question {index + 1} of {total}
                  </p>
                )}
                <button
                  type="button"
                  onClick={onChangeRoute}
                  className="font-mono text-[10.5px] uppercase tracking-eyebrow text-smoke transition-colors hover:text-copper"
                >
                  Change track
                </button>
              </div>
            </div>

            <div className="mt-3 h-px w-full bg-sand">
              <div
                className="h-px bg-copper transition-all duration-500 ease-quiet"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="min-h-[440px] px-7 py-14 sm:px-14 sm:py-20">
            {phase === "question" && (
              <div key={`${route}-${current.id}`} className="wizard-step">
                <QuestionCard
                  question={current}
                  answers={answers}
                  onChangeField={updateField}
                  onAdvance={goNext}
                  route={route}
                />
                {invalidFlash && (
                  <p className="mt-5 font-body text-[13px] text-copper">
                    This one&rsquo;s needed before we continue.
                  </p>
                )}
                {status === "error" && errorMessage && current.type === "schedule" && (
                  <p className="mt-5 font-body text-[13px] text-copper">
                    {errorMessage}
                  </p>
                )}
              </div>
            )}

            {phase === "review" && (
              <div className="wizard-step">
                <ReviewScreen
                  route={routeDef}
                  groups={groups}
                  answers={answers}
                  onEdit={(i) => {
                    setIndex(i);
                    setPhase("question");
                  }}
                  onBack={goBack}
                  onSubmit={handleSubmit}
                  consent={consent}
                  setConsent={setConsent}
                  status={status}
                  errorMessage={errorMessage}
                />
              </div>
            )}

            {phase === "success" && (
              <div className="wizard-step">
                <ConfirmationScreen
                  firstName={(answers.fullName as string)?.split(" ")[0] ?? ""}
                  route={routeDef}
                />
              </div>
            )}
          </div>

          {/* Footer nav — question phase only; review/success have their own controls */}
          {phase === "question" && (
            <div className="flex items-center justify-between border-t border-sand px-7 py-6 sm:px-14">
              <button
                type="button"
                onClick={goBack}
                className="font-mono text-[11px] uppercase tracking-eyebrow text-smoke transition-colors hover:text-charcoal"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="border border-ink bg-ink px-8 py-3.5 font-mono text-[11px] uppercase tracking-eyebrow text-cream transition-colors duration-300 ease-quiet hover:bg-copper hover:border-copper"
              >
                {index === total - 1 ? "Review" : "Continue"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}