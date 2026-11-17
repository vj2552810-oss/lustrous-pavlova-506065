import "server-only";
import { SITE } from "./site";

export interface EmailResult {
  sent: boolean;
  provider: string;
  reason?: string;
}

import { envValue } from "@/lib/env";

export function emailConfigured() {
  return Boolean(envValue("RESEND_API_KEY") && envValue("BOOKING_EMAIL_FROM"));
}

/**
 * Sends transactional email via Resend when configured. Without credentials the
 * message is logged server-side and the caller tells the guest to save their
 * booking reference — the confirmation is never claimed to have been emailed.
 */
export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }): Promise<EmailResult> {
  if (!emailConfigured()) {
    console.info(`[email:not-configured] To: ${to} | ${subject}\n${text}`);
    return { sent: false, provider: "none", reason: "Email delivery is not configured." };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.BOOKING_EMAIL_FROM,
        to: [to],
        subject,
        text,
        html,
        reply_to: SITE.email,
      }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, (await res.text()).slice(0, 300));
      return { sent: false, provider: "resend", reason: "The email service rejected the message." };
    }
    return { sent: true, provider: "resend" };
  } catch (err) {
    console.error("Resend request failed", err);
    return { sent: false, provider: "resend", reason: "The email service could not be reached." };
  }
}

const shell = (body: string) => `<div style="font-family:Inter,Arial,sans-serif;background:#faf8f3;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:20px;padding:32px;border:1px solid #eee">
    <p style="letter-spacing:.32em;font-size:11px;color:#8f7438;margin:0 0 16px">PRITIVO</p>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:28px 0" />
    <p style="color:#888;font-size:12px;line-height:1.7;margin:0">
      PRITIVO · ${SITE.location}<br />
      WhatsApp / Call ${SITE.phoneDisplay} · ${SITE.email}
    </p>
  </div>
</div>`;

export interface BookingEmailData {
  reference: string;
  hotelName: string;
  city: string;
  roomName: string;
  checkInLabel: string;
  checkOutLabel: string;
  nights: number;
  rooms: number;
  guests: number;
  guestName: string;
  totalLabel: string;
  confirmed: boolean;
  confirmationCode?: string | null;
  cancellationLabel: string;
}

export function bookingEmail(data: BookingEmailData) {
  const heading = data.confirmed ? "Your stay is confirmed" : "We've received your booking request";
  const intro = data.confirmed
    ? "The hotel has confirmed your reservation. Please keep your booking reference safe — you can use it any time to retrieve your booking details."
    : "This is a request, not a confirmed reservation. No payment has been taken. A PRITIVO planner will contact you to confirm availability and payment.";

  const rows: [string, string][] = [
    ["Booking reference", data.reference],
    ["Hotel", `${data.hotelName}, ${data.city}`],
    ["Room", data.roomName],
    ["Check-in", data.checkInLabel],
    ["Check-out", data.checkOutLabel],
    ["Stay", `${data.nights} night${data.nights === 1 ? "" : "s"} · ${data.rooms} room${data.rooms === 1 ? "" : "s"} · ${data.guests} guest${data.guests === 1 ? "" : "s"}`],
    ["Guest", data.guestName],
    ["Total", data.totalLabel],
    ["Cancellation", data.cancellationLabel],
  ];
  if (data.confirmationCode) rows.splice(1, 0, ["Hotel confirmation", data.confirmationCode]);

  const table = rows
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:#888;font-size:13px">${k}</td><td style="padding:6px 0;color:#0b0b0c;font-size:13px;text-align:right;font-weight:600">${v}</td></tr>`)
    .join("");

  const text = [
    heading,
    "",
    intro,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Retrieve your booking: ${SITE.url}/my-booking`,
    `Need help? WhatsApp ${SITE.phoneDisplay} or email ${SITE.email}`,
  ].join("\n");

  const html = shell(`<h1 style="font-family:Georgia,serif;font-size:26px;color:#0b0b0c;margin:0 0 12px">${heading}</h1>
    <p style="color:#555;line-height:1.7;font-size:14px">${intro}</p>
    <table style="width:100%;border-collapse:collapse;margin-top:20px">${table}</table>
    <p style="margin:24px 0 0"><a href="${SITE.url}/my-booking" style="background:#c6a866;color:#0b0b0c;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600;font-size:13px">View booking details</a></p>`);

  return { subject: `${data.confirmed ? "Booking confirmed" : "Booking request received"} — ${data.reference}`, text, html };
}
