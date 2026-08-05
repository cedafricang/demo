import { processSteps, contactDetails } from "@/lib/process";
import type { RouteDef } from "@/lib/questionnaire";

export function ConfirmationScreen({
  firstName,
  route,
}: {
  firstName: string;
  route: RouteDef;
}) {
  return (
    <div>
      <p className="eyebrow">Session Requested</p>
      <h3 className="mt-4 max-w-xl font-display text-3xl font-light leading-snug text-ink sm:text-4xl">
        Thank you, {firstName || "there"}. Your {route.name.toLowerCase()}{" "}
        session is on its way to the team.
      </h3>
      <p className="mt-5 max-w-xl font-body text-[15px] leading-relaxed text-smoke">
        We&rsquo;ll confirm your appointment within one business day, by
        email or phone. No rush on your side — when the day comes, the room
        is yours.
      </p>

      <div className="mt-12 border-t border-sand pt-10">
        <p className="eyebrow-smoke mb-6">What Happens Next</p>
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {processSteps.map((s) => (
            <li key={s.n}>
              <span className="font-display text-lg font-light italic text-copper">{s.n}</span>
              <h4 className="mt-1 font-display text-lg font-normal text-ink">{s.title}</h4>
              <p className="mt-2 font-body text-[13.5px] leading-relaxed text-smoke">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-12 border border-sand bg-cream p-7 sm:p-9">
        <p className="eyebrow-smoke mb-5">Ready To Reach Us Directly?</p>
        <dl className="grid grid-cols-1 gap-4 font-body text-[14px] text-charcoal sm:grid-cols-2">
          <div>
            <dt className="text-smoke">Email</dt>
            <dd className="mt-0.5">{contactDetails.email}</dd>
          </div>
          <div>
            <dt className="text-smoke">WhatsApp</dt>
            <dd className="mt-0.5">{contactDetails.whatsapp}</dd>
          </div>
          <div>
            <dt className="text-smoke">Visit</dt>
            <dd className="mt-0.5">{contactDetails.visit}</dd>
          </div>
          <div>
            <dt className="text-smoke">Hours</dt>
            <dd className="mt-0.5">{contactDetails.hours}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}