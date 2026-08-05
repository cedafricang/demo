"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isClosedDate, minBookableDate, timeSlotOptionsForDate } from "@/lib/questionnaire";

type BookingSummary = {
  routeName: string;
  routeId: string;
  fullName: string;
  currentVisit: string | null;
  unrestricted: boolean;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; summary: BookingSummary };

type SubmitState = "idle" | "submitting" | "done" | "error";

function RescheduleForm() {
  const token = useSearchParams().get("token") ?? "";
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [submit, setSubmit] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoad({ status: "error", message: "This link is missing its token." });
      return;
    }
    fetch(`/api/reschedule?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load this booking.");
        setLoad({ status: "ready", summary: data });
      })
      .catch((err) => setLoad({ status: "error", message: err.message }));
  }, [token]);

  useEffect(() => {
    if (load.status !== "ready" || load.summary.unrestricted || !date || isClosedDate(date)) {
      setTakenSlots([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/availability?route=${load.summary.routeId}&date=${date}`)
      .then((res) => res.json())
      .then((data: { taken?: string[] }) => {
        if (!cancelled) setTakenSlots(data.taken ?? []);
      })
      .catch(() => {
        if (!cancelled) setTakenSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [load, date]);

  async function handleSubmit() {
    setSubmit("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, date, time }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong.");
        setSubmit("error");
        return;
      }
      setSubmit("done");
    } catch {
      setSubmitError(null);
      setSubmit("error");
    }
  }

  if (load.status === "loading") {
    return <p className="font-body text-[14px] text-smoke">Loading your booking…</p>;
  }

  if (load.status === "error") {
    return (
      <div>
        <h1 className="font-display text-3xl font-light text-ink">Can&rsquo;t open this link</h1>
        <p className="mt-4 max-w-md font-body text-[14px] leading-relaxed text-smoke">{load.message}</p>
      </div>
    );
  }

  const { summary } = load;

  if (submit === "done") {
    return (
      <div>
        <p className="eyebrow">Rescheduled</p>
        <h1 className="mt-4 font-display text-3xl font-light leading-snug text-ink sm:text-4xl">
          All set. You&rsquo;ll get a confirmation email shortly.
        </h1>
      </div>
    );
  }

  const dateClosed = isClosedDate(date);
  const timeOptions = timeSlotOptionsForDate(date);

  return (
    <div>
      <p className="eyebrow">Reschedule</p>
      <h1 className="mt-4 max-w-xl font-display text-3xl font-light leading-snug text-ink sm:text-4xl">
        Hi {summary.fullName?.split(" ")[0] ?? "there"}, pick a new time for your{" "}
        <span className="italic text-copper">{summary.routeName}</span> session.
      </h1>
      {summary.currentVisit && (
        <p className="mt-4 font-body text-[14px] text-smoke">
          Currently booked for <strong className="text-charcoal">{summary.currentVisit}</strong>.
        </p>
      )}

      <div className="mt-10 max-w-xl space-y-9 border-t border-sand pt-10">
        <div>
          <label className="mb-3 block font-mono text-[11px] uppercase tracking-eyebrow text-smoke">Date</label>
          <input
            type="date"
            value={date}
            min={minBookableDate()}
            onChange={(e) => {
              setDate(e.target.value);
              setTime("");
            }}
            className="w-full border-b border-sand bg-transparent pb-4 font-display text-2xl font-light text-ink placeholder:text-sand focus:border-copper focus:outline-none sm:text-3xl"
          />
          {dateClosed && (
            <p className="mt-4 font-body text-[13px] text-copper">We&rsquo;re closed Sundays — pick another day.</p>
          )}
        </div>

        {date && !dateClosed && (
          <div>
            <label className="mb-3 block font-mono text-[11px] uppercase tracking-eyebrow text-smoke">Time</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {timeOptions.map((opt) => {
                const isSelected = time === opt.value;
                const isTaken = takenSlots.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isTaken}
                    onClick={() => setTime(opt.value)}
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

        {submitError && <p className="font-body text-[13px] text-copper">{submitError}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!date || !time || dateClosed || submit === "submitting"}
          className="border border-ink bg-ink px-8 py-4 font-mono text-[11px] uppercase tracking-eyebrow text-cream transition-colors duration-300 ease-quiet hover:bg-copper hover:border-copper disabled:opacity-40"
        >
          {submit === "submitting" ? "Saving…" : "Confirm new time"}
        </button>
      </div>
    </div>
  );
}

export default function ReschedulePage() {
  return (
    <>
      <Header />
      <main className="border-t border-sand bg-bone py-28 pt-36">
        <div className="container-page">
          <Suspense fallback={<p className="font-body text-[14px] text-smoke">Loading…</p>}>
            <RescheduleForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}