import { routes, type RouteId } from "@/lib/questionnaire";
import type { BookingPayload } from "@/lib/email";

export type AvailabilityCheck =
  | { ok: true }
  | { ok: false; status: number; message: string };

/**
 * Re-checks the chosen slot against the real Experience Centre calendar
 * right before confirming — catches the rare race where someone else
 * grabbed the same slot between page-load and submit. This is read-only:
 * it never writes to bookings.soundhous.com. The actual booking is still
 * just emailed to the team, same as always.
 *
 * Configure:
 *   BOOKINGS_API_URL=https://bookings.soundhous.com
 *   BOOKINGS_API_KEY=<same secret as EXPERIENCE_BOOKING_API_KEY there>
 */
export async function checkSlotStillAvailable(payload: BookingPayload): Promise<AvailabilityCheck | null> {
  const baseUrl = process.env.BOOKINGS_API_URL;
  const apiKey = process.env.BOOKINGS_API_KEY;
  if (!baseUrl || !apiKey) {
    // Not configured yet — treat as a no-op rather than blocking the booking.
    console.log("BOOKINGS_API_URL / BOOKINGS_API_KEY not set — skipping calendar check.");
    return null;
  }

  const routeDef = routes.find((r) => r.id === (payload.route as RouteId));
  if (!routeDef) return { ok: false, status: 400, message: "Unknown route." };

  // Sonos is always bookable — nothing to check.
  if (routeDef.unrestricted) return null;

  const visit = payload.answers.preferredVisit as string[] | undefined;
  const [bookingDate, timeSlot] = Array.isArray(visit) ? visit : [];
  if (!bookingDate || !timeSlot) {
    return { ok: false, status: 422, message: "Missing preferred date/time." };
  }

  try {
    const roomsParam = encodeURIComponent(routeDef.rooms.join(","));
    const availabilityPath = process.env.BOOKINGS_AVAILABILITY_PATH ?? "/api/bookings/availability/public";
    const res = await fetch(
      `${baseUrl}${availabilityPath}?rooms=${roomsParam}&date=${encodeURIComponent(bookingDate)}`,
      { headers: { "x-api-key": apiKey }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Upstream returned ${res.status}`);
    const json = await res.json();
    const taken: string[] = json.data?.taken ?? json.taken ?? [];

    if (taken.includes(timeSlot)) {
      return { ok: false, status: 409, message: "That slot was just taken. Please pick another time." };
    }
    return { ok: true };
  } catch (err) {
    console.error("Calendar check failed (non-blocking):", err);
    // Fail soft — don't stop a booking just because the calendar was briefly unreachable.
    return null;
  }
}