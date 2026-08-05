import {
  contactFields,
  scheduleFields,
  sharedQuestions,
  routeQuestions,
  type Question,
  type RouteId,
} from "@/lib/questionnaire";
import { contactDetails } from "@/lib/process";

type Answers = Record<string, string | string[] | undefined>;

export type BookingPayload = {
  route: RouteId;
  routeName: string;
  answers: Answers;
};

function formatAnswer(q: Question, value: string | string[] | undefined): string | null {
  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  if (q.type === "single") {
    return q.options?.find((o) => o.value === value)?.label ?? String(value);
  }
  if (q.type === "multi" && Array.isArray(value)) {
    return value.map((v) => q.options?.find((o) => o.value === v)?.label ?? v).join(", ");
  }
  if (q.type === "date" && typeof value === "string") {
    const d = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
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
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }
    const timeLabel = q.options?.find((o) => o.value === timeVal)?.label ?? timeVal;
    return [dateLabel, timeLabel].filter(Boolean).join(" · ");
  }
  return String(value);
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderRows(questions: Question[], answers: Answers): string {
  return questions
    .flatMap((q) => {
      const formatted = formatAnswer(q, answers[q.id]);
      const rows: string[] = [];
      if (formatted) {
        rows.push(
          `<tr><td style="padding:9px 18px 9px 0;color:#6B6B66;font-size:15px;line-height:1.5;vertical-align:top;white-space:nowrap;">${escapeHtml(
            q.label
          )}</td><td style="padding:9px 0;color:#2C2C24;font-size:15px;line-height:1.5;">${escapeHtml(formatted)}</td></tr>`
        );
      }
      if (q.followUp) {
        const fu = answers[q.followUp.id];
        if (typeof fu === "string" && fu.trim()) {
          rows.push(
            `<tr><td style="padding:9px 18px 9px 0;color:#6B6B66;font-size:15px;line-height:1.5;vertical-align:top;white-space:nowrap;">${escapeHtml(
              q.followUp.label
            )}</td><td style="padding:9px 0;color:#2C2C24;font-size:15px;line-height:1.5;">${escapeHtml(fu)}</td></tr>`
          );
        }
      }
      return rows;
    })
    .join("");
}

function section(title: string, rows: string): string {
  if (!rows) return "";
  return `
    <tr><td style="padding-top:28px;">
      <p style="margin:0 0 10px;font-family:'Courier New',monospace;font-size:13px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase;color:#A87E5E;">${escapeHtml(
        title
      )}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody>${rows}</tbody></table>
    </td></tr>`;
}

function shell(preheader: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <body style="margin:0;background:#F7F5F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F5F0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#FAFAF7;border:1px solid #E8E4DC;">
            <tr>
              <td style="background:#1A1A16;padding:32px 36px;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:26px;color:#F7F5F0;">soundhous</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 36px 12px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 36px;border-top:1px solid #E8E4DC;margin-top:28px;">
                <p style="margin:18px 0 0;font-size:14px;line-height:1.6;color:#6B6B66;">
                  Soundhous Experience Centre &middot; ${escapeHtml(contactDetails.visit)}<br />
                  ${escapeHtml(contactDetails.email)} &middot; ${escapeHtml(contactDetails.whatsapp)} &middot; ${escapeHtml(
    contactDetails.hours
  )}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const RESCHEDULE_BUTTON_STYLE =
  "display:inline-block;background:#1A1A16;color:#F7F5F0;font-size:15px;font-weight:bold;font-family:'Courier New',monospace;letter-spacing:0.06em;text-transform:uppercase;padding:16px 28px;text-decoration:none;border-radius:2px;";

export function formatVisitLabel(answers: Answers): string | null {
  return formatAnswer(scheduleFields[0], answers.preferredVisit as string[] | undefined);
}

/** Internal notification — sent to the Soundhous team. */
export function buildTeamNotificationEmail(payload: BookingPayload): { subject: string; html: string } {
  const { answers, routeName, route } = payload;
  const fullName = (answers.fullName as string) ?? "Someone";

  const body = `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.3;color:#1A1A16;">New session request</p>
    <p style="margin:0 0 4px;font-size:16px;line-height:1.6;color:#2C2C24;">${escapeHtml(fullName)} just requested a free <strong>${escapeHtml(
    routeName
  )}</strong> session.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${section("Your Details", renderRows(contactFields, answers))}
      ${section(routeName, renderRows(routeQuestions[route], answers))}
      ${section("Budget", renderRows(sharedQuestions(route), answers))}
      ${section("Date & Time", renderRows(scheduleFields, answers))}
    </table>
  `;

  return {
    subject: `New ${routeName} session request — ${fullName}`,
    html: shell(`New ${routeName} request from ${fullName}`, body),
  };
}

/** Confirmation email — sent to the person who booked. */
export function buildCustomerConfirmationEmail(
  payload: BookingPayload,
  rescheduleUrl?: string | null
): { subject: string; html: string } {
  const { answers, routeName } = payload;
  const firstName = ((answers.fullName as string) ?? "there").split(" ")[0];
  const visitLabel = formatAnswer(scheduleFields[0], answers.preferredVisit as string[] | undefined);

  const body = `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.3;color:#1A1A16;">You&rsquo;re booked in, ${escapeHtml(
      firstName
    )}.</p>
    <p style="margin:16px 0 0;font-size:16px;line-height:1.65;color:#2C2C24;">
      Thank you for requesting a free <strong>${escapeHtml(routeName)}</strong> session at the Soundhous
      Experience Centre${
        visitLabel ? `, for <strong>${escapeHtml(visitLabel)}</strong>` : ""
      } — we&rsquo;ll confirm the exact time within one business day by email or phone.
    </p>
    <p style="margin:18px 0 0;font-size:16px;line-height:1.65;color:#2C2C24;">
      No rush on your side. When the day comes, the room is yours.
    </p>
    ${
      rescheduleUrl
        ? `<p style="margin:28px 0 0;">
             <a href="${escapeHtml(rescheduleUrl)}" style="${RESCHEDULE_BUTTON_STYLE}">Need a different day? Reschedule</a>
           </p>`
        : ""
    }
  `;

  return {
    subject: "You're booked in — Soundhous Experience Centre",
    html: shell(`Your ${routeName} session request has been received`, body),
  };
}

/** Sent to the team when someone reschedules — flags what the date/time used to be. */
export function buildTeamRescheduleEmail(
  payload: BookingPayload,
  previousVisitLabel: string | null
): { subject: string; html: string } {
  const { answers, routeName } = payload;
  const fullName = (answers.fullName as string) ?? "Someone";
  const newVisitLabel = formatAnswer(scheduleFields[0], answers.preferredVisit as string[] | undefined);

  const body = `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.3;color:#1A1A16;">Session rescheduled</p>
    <p style="margin:0 0 4px;font-size:16px;line-height:1.6;color:#2C2C24;">
      ${escapeHtml(fullName)} moved their <strong>${escapeHtml(routeName)}</strong> session${
    previousVisitLabel ? ` from <strong>${escapeHtml(previousVisitLabel)}</strong>` : ""
  } to <strong>${escapeHtml(newVisitLabel ?? "a new time")}</strong>.
    </p>
  `;

  return {
    subject: `Rescheduled: ${routeName} — ${fullName}`,
    html: shell(`${fullName} rescheduled their ${routeName} session`, body),
  };
}

/** Sent to the customer confirming their new date/time, with a fresh reschedule link. */
export function buildCustomerRescheduleEmail(
  payload: BookingPayload,
  rescheduleUrl?: string | null
): { subject: string; html: string } {
  const { answers, routeName } = payload;
  const firstName = ((answers.fullName as string) ?? "there").split(" ")[0];
  const visitLabel = formatAnswer(scheduleFields[0], answers.preferredVisit as string[] | undefined);

  const body = `
    <p style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.3;color:#1A1A16;">You&rsquo;re all set, ${escapeHtml(
      firstName
    )}.</p>
    <p style="margin:16px 0 0;font-size:16px;line-height:1.65;color:#2C2C24;">
      Your <strong>${escapeHtml(routeName)}</strong> session is now booked for
      ${visitLabel ? `<strong>${escapeHtml(visitLabel)}</strong>` : "your new time"}.
    </p>
    ${
      rescheduleUrl
        ? `<p style="margin:28px 0 0;">
             <a href="${escapeHtml(rescheduleUrl)}" style="${RESCHEDULE_BUTTON_STYLE}">Need to change it again? Reschedule</a>
           </p>`
        : ""
    }
  `;

  return {
    subject: "Rescheduled — Soundhous Experience Centre",
    html: shell(`Your ${routeName} session has a new time`, body),
  };
}