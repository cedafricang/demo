import { NextRequest, NextResponse } from "next/server";
import { routes, type RouteId } from "@/lib/questionnaire";

// Server-side proxy to bookings.soundhous.com — keeps BOOKINGS_API_KEY off
// the client entirely. Set these in your env:
//   BOOKINGS_API_URL=https://bookings.soundhous.com
//   BOOKINGS_API_KEY=<the same secret as EXPERIENCE_BOOKING_API_KEY there>
//   BOOKINGS_AVAILABILITY_PATH=/api/bookings/availability/public
//     (adjust to whatever base path booking.routes.ts is actually mounted
//      at in that app's index.ts — check for `app.use('/something', ...)`)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const route = searchParams.get("route") as RouteId | null;
  const date = searchParams.get("date");

  const routeDef = routes.find((r) => r.id === route);
  if (!routeDef) {
    return NextResponse.json({ error: "Unknown route." }, { status: 400 });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date must be yyyy-mm-dd" }, { status: 400 });
  }

  // Sonos is always bookable — nothing to check against the calendar.
  if (routeDef.unrestricted) {
    return NextResponse.json({ taken: [] });
  }

  const baseUrl = process.env.BOOKINGS_API_URL;
  const apiKey = process.env.BOOKINGS_API_KEY;
  const availabilityPath = process.env.BOOKINGS_AVAILABILITY_PATH ?? "/api/bookings/availability/public";

  if (!baseUrl || !apiKey) {
    // Not configured yet — don't block the wizard, just show every slot as open.
    return NextResponse.json({ taken: [], liveCheckFailed: true });
  }

  try {
    const roomsParam = encodeURIComponent(routeDef.rooms.join(","));
    const res = await fetch(
      `${baseUrl}${availabilityPath}?rooms=${roomsParam}&date=${encodeURIComponent(date)}`,
      { headers: { "x-api-key": apiKey }, cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Upstream returned ${res.status}`);
    const json = await res.json();
    // The Express API wraps responses as { success, data: {...} } —
    // fall back to a flat shape too, just in case.
    const taken = json.data?.taken ?? json.taken ?? [];
    return NextResponse.json({ taken });
  } catch (err) {
    console.error("Availability proxy failed:", err);
    // Fail soft — surface it, but let the person keep booking rather than
    // getting stuck if bookings.soundhous.com is briefly unreachable.
    return NextResponse.json({ taken: [], liveCheckFailed: true });
  }
}