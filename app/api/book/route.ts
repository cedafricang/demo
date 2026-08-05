import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { buildTeamNotificationEmail, buildCustomerConfirmationEmail, type BookingPayload } from "@/lib/email";
import { checkSlotStillAvailable } from "@/lib/bookingSync";
import { buildRescheduleUrl } from "@/lib/rescheduleToken";

const TEAM_EMAIL = "hello@soundhous.com";
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL ?? "Soundhous Experience Centre <hello@soundhous.com>";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function isValid(payload: Partial<BookingPayload>): payload is BookingPayload {
  if (!payload.route || !payload.routeName || !payload.answers) return false;
  const a = payload.answers;
  const email = a.email;
  const emailOk = typeof email === "string" && /^\S+@\S+\.\S+$/.test(email);
  const nameOk = typeof a.fullName === "string" && a.fullName.trim().length > 0;
  const phoneOk = typeof a.phone === "string" && a.phone.trim().length > 0;
  return Boolean(emailOk && nameOk && phoneOk);
}

export async function POST(req: NextRequest) {
  let payload: Partial<BookingPayload>;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isValid(payload)) {
    return NextResponse.json(
      { error: "Please complete the required fields (name, email, phone)." },
      { status: 422 }
    );
  }

  const customerEmail = payload.answers.email as string;

  // Re-check the slot against the real calendar right before confirming —
  // catches the rare race where someone else grabbed it in the meantime.
  const check = await checkSlotStillAvailable(payload);
  if (check && !check.ok) {
    const status = check.status === 409 ? 409 : 502;
    return NextResponse.json({ error: check.message }, { status });
  }

  if (!resend) {
    // No RESEND_API_KEY configured yet — log instead of failing the booking.
    // Set RESEND_API_KEY (and optionally BOOKING_FROM_EMAIL) in your env to
    // start actually sending mail to hello@soundhous.com.
    console.log("New Soundhous session request (email not configured):", JSON.stringify(payload, null, 2));
    return NextResponse.json({ ok: true });
  }

  try {
    const team = buildTeamNotificationEmail(payload);
    const rescheduleUrl = buildRescheduleUrl(payload, req.nextUrl.origin);
    const customer = buildCustomerConfirmationEmail(payload, rescheduleUrl);

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

    // The Resend SDK does NOT throw on API-level failures (bad domain,
    // invalid address, etc) — it resolves with { data: null, error }.
    // Check that explicitly, or a failed send silently reports success.
    if (teamResult.error || customerResult.error) {
      console.error("Resend rejected the send:", {
        team: teamResult.error,
        customer: customerResult.error,
      });
      return NextResponse.json(
        { error: "We couldn't send this through. Please try again, or email hello@soundhous.com directly." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Failed to send booking emails:", err);
    return NextResponse.json(
      { error: "We couldn't send this through. Please try again, or email hello@soundhous.com directly." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}