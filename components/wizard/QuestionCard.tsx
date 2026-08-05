"use client";

import { useEffect, useRef, useState } from "react";
import { isClosedDate, minBookableDate, timeSlotOptionsForDate, type Question, type RouteId } from "@/lib/questionnaire";

export type AnswerValue = string | string[] | undefined;
export type Answers = Record<string, AnswerValue>;

export function shouldShowFollowUp(q: Question, answer: AnswerValue): boolean {
  if (!q.followUp) return false;
  const vals = Array.isArray(answer) ? answer : answer ? [answer] : [];
  return q.followUp.triggerValues.some((v) => vals.includes(v));
}

export function QuestionCard({
  question,
  answers,
  onChangeField,
  onAdvance,
  autoAdvanceOnSingle = true,
  route,
}: {
  question: Question;
  answers: Answers;
  onChangeField: (id: string, value: AnswerValue) => void;
  onAdvance: () => void;
  autoAdvanceOnSingle?: boolean;
  /** Needed on the schedule step to check real availability for this route's room. */
  route?: RouteId | null;
}) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const answer = answers[question.id];
  const followUpAnswer = question.followUp ? (answers[question.followUp.id] as string | undefined) : undefined;
  const onChange = (value: AnswerValue) => onChangeField(question.id, value);
  const onFollowUpChange = (value: string) => {
    if (question.followUp) onChangeField(question.followUp.id, value);
  };

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 260);
    return () => clearTimeout(t);
  }, [question.id]);

  const showFollowUp = shouldShowFollowUp(question, answer);
  const dateIsClosed = question.type === "date" && isClosedDate(answer as string);

  const scheduleArr = Array.isArray(answer) ? answer : [];
  const scheduleDate = scheduleArr[0] ?? "";
  const scheduleTime = scheduleArr[1] ?? "";
  const scheduleDateClosed = question.type === "schedule" && isClosedDate(scheduleDate);
  const scheduleTimeOptions = timeSlotOptionsForDate(scheduleDate);

  // Live availability — checks the same calendar bookings.soundhous.com uses,
  // so two people can't be offered the same room/date/time.
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityUnknown, setAvailabilityUnknown] = useState(false);

  useEffect(() => {
    if (question.type !== "schedule" || !route || !scheduleDate || scheduleDateClosed) {
      setTakenSlots([]);
      setAvailabilityUnknown(false);
      return;
    }
    let cancelled = false;
    setCheckingAvailability(true);
    fetch(`/api/availability?route=${route}&date=${scheduleDate}`)
      .then((res) => res.json())
      .then((data: { taken?: string[]; liveCheckFailed?: boolean }) => {
        if (cancelled) return;
        setTakenSlots(data.taken ?? []);
        setAvailabilityUnknown(Boolean(data.liveCheckFailed));
      })
      .catch(() => {
        if (cancelled) return;
        setTakenSlots([]);
        setAvailabilityUnknown(true);
      })
      .finally(() => {
        if (!cancelled) setCheckingAvailability(false);
      });
    return () => {
      cancelled = true;
    };
  }, [question.type, route, scheduleDate, scheduleDateClosed]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <h3 className="max-w-2xl font-display text-[26px] font-light leading-[1.25] text-ink sm:text-[34px]">
          {question.label}
        </h3>
        {!question.required && (
          <span className="mt-2 shrink-0 font-mono text-[10px] uppercase tracking-eyebrow text-sand">
            Optional
          </span>
        )}
      </div>

      {question.helper && (
        <p className="mt-4 max-w-xl font-body text-[14.5px] italic leading-relaxed text-smoke">
          {question.helper}
        </p>
      )}

      <div className="mt-9">
        {(question.type === "text" ||
          question.type === "email" ||
          question.type === "tel" ||
          question.type === "number") && (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={question.type}
            value={(answer as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdvance();
              }
            }}
            placeholder={question.placeholder}
            className="w-full max-w-xl border-b border-sand bg-transparent pb-4 font-display text-2xl font-light text-ink placeholder:text-sand focus:border-copper focus:outline-none sm:text-3xl"
          />
        )}

        {question.type === "date" && (
          <div className="max-w-xl">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="date"
              value={(answer as string) ?? ""}
              min={minBookableDate()}
              onChange={(e) => onChange(e.target.value)}
              className="w-full border-b border-sand bg-transparent pb-4 font-display text-2xl font-light text-ink placeholder:text-sand focus:border-copper focus:outline-none sm:text-3xl"
            />
            {dateIsClosed && (
              <p className="mt-4 font-body text-[13px] text-copper">
                We&rsquo;re closed Sundays — pick a date Monday through Saturday.
              </p>
            )}
          </div>
        )}

        {question.type === "schedule" && (
          <div className="max-w-xl space-y-9">
            <div>
              <label className="mb-3 block font-mono text-[11px] uppercase tracking-eyebrow text-smoke">
                Date
              </label>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="date"
                value={scheduleDate}
                min={minBookableDate()}
                onChange={(e) => onChange([e.target.value, scheduleTime])}
                className="w-full border-b border-sand bg-transparent pb-4 font-display text-2xl font-light text-ink placeholder:text-sand focus:border-copper focus:outline-none sm:text-3xl"
              />
              {scheduleDateClosed && (
                <p className="mt-4 font-body text-[13px] text-copper">
                  We&rsquo;re closed Sundays — pick another day.
                </p>
              )}
            </div>

            {!scheduleDateClosed && (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="block font-mono text-[11px] uppercase tracking-eyebrow text-smoke">
                    Time
                  </label>
                  {checkingAvailability && (
                    <span className="font-mono text-[10px] uppercase tracking-eyebrow text-sand">
                      Checking availability…
                    </span>
                  )}
                  {!checkingAvailability && availabilityUnknown && scheduleDate && (
                    <span className="font-mono text-[10px] uppercase tracking-eyebrow text-copper">
                      Couldn&rsquo;t confirm live availability — we&rsquo;ll verify
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {scheduleTimeOptions.map((opt) => {
                    const isSelected = scheduleTime === opt.value;
                    const isTaken = takenSlots.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isTaken}
                        onClick={() => onChange([scheduleDate, opt.value])}
                        className={`border px-4 py-3.5 text-left font-body text-[13.5px] leading-snug transition-colors duration-300 ease-quiet ${
                          isTaken
                            ? "cursor-not-allowed border-sand bg-stone/40 text-smoke/50 line-through"
                            : isSelected
                            ? "border-ink bg-ink text-cream"
                            : "border-sand bg-transparent text-charcoal hover:border-charcoal/50"
                        }`}
                      >
                        {opt.label}
                        {isTaken && <span className="ml-1 not-italic">— booked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {question.type === "textarea" && (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={(answer as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            rows={3}
            className="w-full max-w-xl resize-none border-b border-sand bg-transparent pb-4 font-body text-lg font-light leading-relaxed text-ink placeholder:text-sand focus:border-copper focus:outline-none"
          />
        )}

        {question.type === "single" && question.options && (
          <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((opt, i) => {
              const isSelected = answer === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    if (autoAdvanceOnSingle) {
                      setTimeout(onAdvance, 380);
                    }
                  }}
                  className={`flex items-center gap-3 border px-5 py-4 text-left font-body text-[14.5px] leading-snug transition-colors duration-300 ease-quiet ${
                    isSelected
                      ? "border-ink bg-ink text-cream"
                      : "border-sand bg-transparent text-charcoal hover:border-charcoal/50"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] ${
                      isSelected ? "text-copper" : "text-sand"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "multi" && question.options && (
          <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((opt) => {
              const arr = (answer as string[]) ?? [];
              const isSelected = arr.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const next = isSelected
                      ? arr.filter((v) => v !== opt.value)
                      : [...arr, opt.value];
                    onChange(next);
                  }}
                  className={`flex items-center justify-between gap-3 border px-5 py-4 text-left font-body text-[14.5px] leading-snug transition-colors duration-300 ease-quiet ${
                    isSelected
                      ? "border-copper bg-copper/10 text-charcoal"
                      : "border-sand bg-transparent text-charcoal hover:border-charcoal/50"
                  }`}
                >
                  {opt.label}
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center border font-mono text-[9px] ${
                      isSelected ? "border-copper bg-copper text-ink" : "border-sand text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {showFollowUp && question.followUp && (
          <div className="mt-6 max-w-xl animate-[fadeInUp_0.4s_ease_both]">
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-eyebrow text-smoke">
              {question.followUp.label}
            </label>
            <input
              type="text"
              value={followUpAnswer ?? ""}
              onChange={(e) => onFollowUpChange(e.target.value)}
              placeholder={question.followUp.placeholder}
              className="w-full border-b border-sand bg-transparent pb-3 font-body text-lg text-ink placeholder:text-sand focus:border-copper focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}