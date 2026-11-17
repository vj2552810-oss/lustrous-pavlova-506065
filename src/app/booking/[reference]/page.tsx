import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, BedDouble, CalendarDays, CheckCircle2, Clock, Mail, MessageSquare, Phone, ShieldCheck, Users } from "lucide-react";
import { getBooking, type Booking as BookingRow } from "@/lib/bookings";
import { PaymentActions } from "@/components/hotels/PaymentActions";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { formatMoney, formatStayDate, maskEmail, maskPhone, BOOKING_STATUS_LABELS } from "@/lib/hotels/format";
import { stripeConfigured, stripeModeNotice } from "@/lib/payments/stripe";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const toneCls: Record<string, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  danger: "border-red-200 bg-red-50 text-red-800",
  neutral: "border-neutral-200 bg-neutral-50 text-neutral-600",
};

export default async function BookingPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  let booking: BookingRow | null = null;
  let lookupFailed = false;
  try {
    booking = await getBooking(reference);
  } catch (err) {
    console.error("Booking lookup failed", err instanceof Error ? err.message : "");
    lookupFailed = true;
  }

  if (lookupFailed) {
    return (
      <section className="flex min-h-[80vh] items-center bg-ink px-5 pt-24 text-center text-white">
        <div className="mx-auto max-w-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
          <h1 className="mt-5 font-serif text-4xl">We can&apos;t load your booking right now</h1>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Our booking database could not be reached, so we can&apos;t verify your reference yet. Your booking has not
            been changed or cancelled. Please reload in a moment, or contact us and we&apos;ll confirm it for you.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={whatsappLink(`Hello PRITIVO! I can't open my booking ${reference}.`)} target="_blank" rel="noopener noreferrer" className="bg-gold-gradient rounded-full px-6 py-3 font-semibold text-ink">
              WhatsApp {SITE.phoneDisplay}
            </a>
            <Link href="/my-booking" className="rounded-full border border-white/30 px-6 py-3 font-semibold hover:bg-white hover:text-ink">
              Try booking lookup
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="flex min-h-[80vh] items-center bg-ink px-5 pt-24 text-center text-white">
        <div className="mx-auto max-w-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
          <h1 className="mt-5 font-serif text-4xl">We couldn&apos;t find that booking</h1>
          <p className="mt-4 text-sm leading-6 text-white/65">
            Booking references look like <strong>PVH-8K2M4Q</strong>. Check the reference in your confirmation, or retrieve
            your booking with your email or phone.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/my-booking" className="bg-gold-gradient rounded-full px-6 py-3 font-semibold text-ink">Find my booking</Link>
            <a href={whatsappLink("Hello PRITIVO! I can't find my hotel booking reference.")} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/30 px-6 py-3 font-semibold hover:bg-white hover:text-ink">
              Ask us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    );
  }

  const status = BOOKING_STATUS_LABELS[booking.status] ?? { label: booking.status, tone: "neutral" as const };
  const supportMsg = `Hello PRITIVO! I need help with hotel booking ${booking.reference} — ${booking.hotelName}, ${formatStayDate(booking.checkIn)} to ${formatStayDate(booking.checkOut)}.`;
  const supportWa = whatsappLink(supportMsg);
  const supportEmail = mailtoLink(`Hotel booking ${booking.reference}`, supportMsg);
  const paymentsReady = stripeConfigured();
  const paymentNotice = stripeModeNotice();

  return (
    <section className="bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <p className="eyebrow text-gold-dark">Booking reference</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-mono text-4xl font-semibold tracking-wider text-ink sm:text-5xl">{booking.reference}</h1>
          <span className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${toneCls[status.tone]}`}>{status.label}</span>
        </div>
        <p className="mt-2 text-sm text-neutral-500">Keep this reference safe — it&apos;s all you need, together with your email or phone, to retrieve this booking. No account required.</p>

        {/* Status explanation — always honest about what has and hasn't happened */}
        <div className={`mt-6 rounded-3xl border p-5 text-sm leading-6 ${toneCls[status.tone]}`} role="status">
          {booking.status === "confirmed" && (
            <p className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Confirmed by the hotel.</strong> Your reservation is in place
                {booking.confirmationCode ? <> — hotel confirmation <strong>{booking.confirmationCode}</strong></> : null}.
                {booking.emailStatus === "sent" ? " A confirmation email is on its way." : " Email delivery isn't configured, so please save this page or message us for a copy."}
              </span>
            </p>
          )}
          {booking.status === "demo_request" && (
            <p className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <span>
                <strong>Demo request — not a reservation.</strong> No payment has been taken and the hotel has not been
                contacted, because PRITIVO is currently showing sample inventory. Send us these details on WhatsApp and a
                planner will confirm live availability and a real price with you.
              </span>
            </p>
          )}
          {booking.status === "request_received" && (
            <p className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Request received — not yet confirmed.</strong> Online payment isn&apos;t enabled, so no money has
                been taken. We&apos;ll contact you with a secure payment link and confirm once the hotel accepts the booking.
              </span>
            </p>
          )}
          {booking.status === "pending_payment" && (
            <p className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Awaiting payment.</strong> This room is not held yet. Complete payment below and we&apos;ll ask the
                hotel to confirm your reservation immediately afterwards.
              </span>
            </p>
          )}
          {booking.status === "paid" && (
            <p className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span><strong>Payment received.</strong> We&apos;re confirming your reservation with the hotel now — refresh this page in a moment.</span>
            </p>
          )}
          {booking.status === "confirmation_failed" && (
            <p className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>We couldn&apos;t complete this booking.</strong> {booking.failureReason ?? "The hotel could not confirm it."} A refund
                has been started{booking.refundId ? ` (refund ${booking.refundId})` : ""} — our team will follow up. Please contact us on WhatsApp.
              </span>
            </p>
          )}
          {booking.status === "refunded" && (
            <p className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span><strong>Refunded.</strong> This booking could not be confirmed, so the payment has been refunded. Bank timelines vary by provider.</span>
            </p>
          )}
          {booking.status === "cancelled" && (
            <p className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span><strong>Cancelled.</strong> No payment was taken for this booking.</span>
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
              <h2 className="font-serif text-2xl">Your stay</h2>
              <p className="mt-2 font-serif text-3xl text-ink">{booking.hotelName}</p>
              <p className="text-sm text-neutral-500">{booking.city}</p>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Check-in</dt><dd className="text-sm font-medium">{formatStayDate(booking.checkIn)}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Check-out</dt><dd className="text-sm font-medium">{formatStayDate(booking.checkOut)}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Room</dt><dd className="text-sm font-medium">{booking.roomName}{booking.breakfastIncluded ? " · breakfast included" : ""}</dd></div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                  <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Party</dt><dd className="text-sm font-medium">{booking.guests} guest(s) · {booking.rooms} room(s) · {booking.nights} night(s)</dd></div>
                </div>
              </dl>
              {booking.specialRequests && (
                <p className="mt-4 rounded-2xl bg-ivory p-4 text-sm text-neutral-600"><strong>Your requests:</strong> {booking.specialRequests}</p>
              )}
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
              <h2 className="font-serif text-2xl">Price</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-neutral-500">Room subtotal</dt><dd>{formatMoney(booking.subtotalMinor, booking.currency)}</dd></div>
                <div className="flex justify-between"><dt className="text-neutral-500">Taxes</dt><dd>{formatMoney(booking.taxesMinor, booking.currency)}</dd></div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold"><dt>Total</dt><dd>{formatMoney(booking.totalMinor, booking.currency)}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-neutral-500">Payment status: {booking.paymentStatus.replace(/_/g, " ")}{booking.paymentProvider ? ` · ${booking.paymentProvider}` : ""}. The final amount is always re-checked with the hotel partner before payment.</p>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-7">
              <h2 className="font-serif text-2xl">Cancellation</h2>
              <p className="mt-2 text-sm font-medium text-ink">{booking.cancellationLabel}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{booking.cancellationTerms}</p>
              <p className="mt-3 text-xs text-neutral-500">Cancellation and refund terms for your booking are those shown here and in your written confirmation.</p>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5">
            {(booking.mode === "live" && booking.status === "pending_payment") || ["pending_payment", "request_received"].includes(booking.status) ? (
              <Suspense fallback={<div className="rounded-3xl border border-black/5 bg-white p-6 text-sm text-neutral-500">Loading booking actions…</div>}>
                <PaymentActions
                  reference={booking.reference}
                  maskedContact={`${maskEmail(booking.guestEmail)} or ${maskPhone(booking.guestPhone)}`}
                  canPay={booking.mode === "live" && booking.status === "pending_payment"}
                  canCancel={["pending_payment", "request_received"].includes(booking.status)}
                  stripeConfigured={paymentsReady}
                  paymentNotice={paymentNotice}
                />
              </Suspense>
            ) : null}

            <div className="rounded-3xl bg-ink p-6 text-white sm:p-7">
              <MessageSquare className="h-6 w-6 text-gold" aria-hidden="true" />
              <h2 className="mt-3 font-serif text-2xl">Need help with this booking?</h2>
              <p className="mt-2 text-sm text-white/65">Our planners reply on WhatsApp {SITE.phoneDisplay}.</p>
              <div className="mt-4 space-y-2">
                <a href={supportWa} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp support
                </a>
                <a href={supportEmail} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                  <Mail className="h-4 w-4" aria-hidden="true" /> {SITE.email}
                </a>
                <a href={telLink} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call us
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6">
              <h2 className="font-serif text-2xl">Guest details</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Lead guest</dt><dd className="font-medium">{booking.guestName}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Email</dt><dd className="font-medium">{maskEmail(booking.guestEmail)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wider text-neutral-500">Phone</dt><dd className="font-medium">{maskPhone(booking.guestPhone)}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-neutral-500">Full contact details are never shown on this page. Use our booking lookup with your email or phone to verify them.</p>
              <Link href="/my-booking" className="mt-4 inline-flex rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium hover:border-gold">Retrieve booking details</Link>
            </div>

            {booking.mode === "demo" && (
              <p className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
                This booking was created in demo mode. It is a sample request only: no payment, no reservation, and no
                hotel notification.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
