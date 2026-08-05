import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildTeamRescheduleEmail,
  buildCustomerRescheduleEmail,
  formatVisitLabel,
  type BookingPayload,
} from "@/lib/email";
import { checkSlotStillAvailable } from "@/lib/bookingSync";
import { verifyRescheduleToken, buildRescheduleUrl } from "@/lib/rescheduleToken";
import { isClosedDate, routes } from "@/lib/questionnaire";

const TEAM_EMAIL = "hello@soundhous.com";
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? "Soundhous Experience Centre <hello@soundhous.com>";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/** Loads the booking behind a reschedule link, for the reschedule page to display. */
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const decoded = verifyRescheduleToken(token);
  if (!decoded.ok) {
    const message =
      decoded.reason === "expired"
        ? "This reschedule link has expired. Please email hello@soundhous.com to change your session."
        : decoded.reason === "not-configured"
        ? "Rescheduling isn't set up yet. Please email hello@soundhous.com."
        : "This reschedule link isn't valid.";
    return NextResponse.json({ error: message }, { status: decoded.reason === "expired" ? 410 : 400 });
  }

  const routeDef = routes.find((r) => r.id === decoded.payload.route);
  return NextResponse.json({
    routeName: decoded.payload.routeName,
    routeId: decoded.payload.route,
    fullName: decoded.payload.answers.fullName,
    currentVisit: formatVisitLabel(decoded.payload.answers),
    unrestricted: routeDef?.unrestricted ?? false,
  });
}

/** Confirms a new date/time for an existing booking, re-sends both emails. */
export async function POST(req: NextRequest) {
  let body: { token?: string; date?: string; time?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { token, date, time } = body;
  if (!token || !date || !time) {
    return NextResponse.json({ error: "Missing token, date, or time." }, { status: 422 });
  }

  const decoded = verifyRescheduleToken(token);
  if (!decoded.ok) {
    const message =
      decoded.reason === "expired"
        ? "This reschedule link has expired. Please email hello@soundhous.com to change your session."
        : "This reschedule link isn't valid.";
    return NextResponse.json({ error: message }, { status: decoded.reason === "expired" ? 410 : 400 });
  }

  if (isClosedDate(date)) {
    return NextResponse.json({ error: "We're closed Sundays — pick another day." }, { status: 422 });
  }

  const previousVisitLabel = formatVisitLabel(decoded.payload.answers);

  const updatedPayload: BookingPayload = {
    ...decoded.payload,
    answers: { ...decoded.payload.answers, preferredVisit: [date, time] },
  };

  // Re-check the new slot against the real calendar, same as a first-time booking.
  const check = await checkSlotStillAvailable(updatedPayload);
  if (check && !check.ok) {
    const status = check.status === 409 ? 409 : 502;
    return NextResponse.json({ error: check.message }, { status });
  }

  if (!resend) {
    console.log("Reschedule request (email not configured):", JSON.stringify(updatedPayload, null, 2));
    return NextResponse.json({ ok: true });
  }

  try {
    const team = buildTeamRescheduleEmail(updatedPayload, previousVisitLabel);
    const newRescheduleUrl = buildRescheduleUrl(updatedPayload, req.nextUrl.origin);
    const customer = buildCustomerRescheduleEmail(updatedPayload, newRescheduleUrl);
    const customerEmail = updatedPayload.answers.email as string;

    const [teamResult, customerResult] = await Promise.all([
      resend.emails.send({
        from: FROM_EMAIL,
        to: TEAM_EMAIL,
        replyTo: customerEmail,
        subject: team.subject,
        html: team.html,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: customerEmail,
        replyTo: TEAM_EMAIL,
        subject: customer.subject,
        html: customer.html,
      }),
    ]);

    if (teamResult.error || customerResult.error) {
      console.error("Resend rejected the reschedule send:", {
        team: teamResult.error,
        customer: customerResult.error,
      });
      return NextResponse.json(
        { error: "We couldn't send this through. Please try again, or email hello@soundhous.com directly." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Failed to send reschedule emails:", err);
    return NextResponse.json(
      { error: "We couldn't send this through. Please try again, or email hello@soundhous.com directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}