"use client";

import type { Question, RouteDef } from "@/lib/questionnaire";

export type Answers = Record<string, string | string[] | undefined>;

function formatAnswer(q: Question, value: string | string[] | undefined): string | null {
  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  if (q.type === "single") {
    return q.options?.find((o) => o.value === value)?.label ?? String(value);
  }
  if (q.type === "multi" && Array.isArray(value)) {
    return value
      .map((v) => q.options?.find((o) => o.value === v)?.label ?? v)
      .join(", ");
  }
  if (q.type === "date" && typeof value === "string") {
    const d = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  if (q.type === "schedule" && Array.isArray(value)) {
    const [dateStr, timeVal] = value;
    let dateLabel = dateStr;
    if (dateStr) {
      const d = new Date(`${dateStr}T00:00:00`);
      if (!Number.isNaN(d.getTime())) {
        dateLabel = d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    }
    const timeLabel = q.options?.find((o) => o.value === timeVal)?.label ?? timeVal;
    return [dateLabel, timeLabel].filter(Boolean).join(" · ");
  }
  return String(value);
}

export function ReviewScreen({
  route,
  groups,
  answers,
  onEdit,
  onBack,
  onSubmit,
  consent,
  setConsent,
  status,
  errorMessage,
}: {
  route: RouteDef;
  groups: { title: string; startIndex: number; questions: Question[] }[];
  answers: Answers;
  onEdit: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  consent: boolean;
  setConsent: (v: boolean) => void;
  status: "idle" | "submitting" | "error";
  errorMessage?: string | null;
}) {
  return (
    <div>
      <p className="eyebrow">Final Step</p>
      <h3 className="mt-4 max-w-xl font-display text-3xl font-light leading-snug text-ink sm:text-4xl">
        Everything look right, {(answers.fullName as string)?.split(" ")[0] || "there"}?
      </h3>
      <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-smoke">
        A quick look before it goes to the team. Tap any section to change an
        answer.
      </p>

      <div className="mt-10 divide-y divide-sand border-y border-sand">
        {groups.map((group) => (
          <div key={group.title} className="py-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-eyebrow text-copper">
                {group.title}
              </p>
              <button
                type="button"
                onClick={() => onEdit(group.startIndex)}
                className="font-mono text-[10.5px] uppercase tracking-eyebrow text-smoke hover:text-ink"
              >
                Edit
              </button>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {group.questions.flatMap((q) => {
                const formatted = formatAnswer(q, answers[q.id]);
                const rows = [];
                if (formatted) {
                  rows.push(
                    <div key={q.id}>
                      <dt className="font-body text-[12.5px] text-smoke">{q.label}</dt>
                      <dd className="mt-0.5 font-body text-[14.5px] text-charcoal">{formatted}</dd>
                    </div>
                  );
                }
                if (q.followUp) {
                  const fu = answers[q.followUp.id];
                  if (typeof fu === "string" && fu.trim()) {
                    rows.push(
                      <div key={q.followUp.id}>
                        <dt className="font-body text-[12.5px] text-smoke">{q.followUp.label}</dt>
                        <dd className="mt-0.5 font-body text-[14.5px] text-charcoal">{fu}</dd>
                      </div>
                    );
                  }
                }
                return rows;
              })}
            </dl>
          </div>
        ))}
      </div>

      <label className="mt-8 flex max-w-xl items-start gap-3 font-body text-[13.5px] leading-relaxed text-smoke">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 h-4 w-4 border-sand accent-[#A87E5E]"
        />
        <span>
          I&rsquo;d like Soundhous to contact me to confirm this session on
          the <strong className="text-charcoal">{route.name}</strong> track.
          This is a free, no-obligation session.
        </span>
      </label>

      {status === "error" && (
        <p className="mt-4 font-body text-[13px] text-copper">
          {errorMessage ||
            "Something interrupted the request. Please try again, or reach us directly at marketing@ced.africa."}
        </p>
      )}

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[11px] uppercase tracking-eyebrow text-smoke transition-colors hover:text-charcoal"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!consent || status === "submitting"}
          className="border border-ink bg-ink px-8 py-4 font-mono text-[11px] uppercase tracking-eyebrow text-cream transition-colors duration-300 ease-quiet hover:bg-copper hover:border-copper disabled:opacity-40"
        >
          {status === "submitting" ? "Sending…" : "Confirm — it's free"}
        </button>
      </div>
    </div>
  );
}