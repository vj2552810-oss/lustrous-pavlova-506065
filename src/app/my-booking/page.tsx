import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { BookingLookupForm } from "@/components/hotels/BookingLookupForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Find My Hotel Booking",
  description:
    "Retrieve your PRITIVO hotel booking details with your booking reference and the email or phone number used. No account needed.",
  alternates: { canonical: "/my-booking" },
};

export default function MyBookingPage() {
  return (
    <>
      <PageHero
        eyebrow="Guest booking lookup"
        title={<>Find my <span className="text-gold-gradient italic">booking.</span></>}
        description="Enter your booking reference and the email address or phone number you booked with. No account or password needed."
      />
      <section className="bg-ivory py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <BookingLookupForm />
          </div>
          <aside className="space-y-4 lg:col-span-5">
            <div className="rounded-3xl border border-black/5 bg-white p-6">
              <h2 className="flex items-center gap-2 font-serif text-2xl">
                <ShieldCheck className="h-5 w-5 text-gold" aria-hidden="true" /> Why we verify
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                We only show booking details when the reference and contact detail match, because bookings contain personal
                information. Your full email and phone are never displayed on screen.
              </p>
            </div>
            <div className="rounded-3xl bg-ink p-6 text-white">
              <h2 className="font-serif text-2xl">Lost your reference?</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Message us from the phone number or email used on the booking and we&apos;ll locate it.
              </p>
              <div className="mt-4 space-y-2">
                <a href={whatsappLink("Hello PRITIVO! I need help finding my hotel booking.")} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white">
                  <WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}
                </a>
                <a href={mailtoLink("Hotel booking lookup")} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                  <Mail className="h-4 w-4" aria-hidden="true" /> {SITE.email}
                </a>
                <a href={telLink} className="flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-3 text-sm font-semibold hover:bg-white hover:text-ink">
                  <Phone className="h-4 w-4" aria-hidden="true" /> Call us
                </a>
              </div>
            </div>
            <div className="rounded-3xl border border-black/5 bg-white p-6">
              <h2 className="font-serif text-2xl">Want to book again?</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">Search live hotel availability and book as a guest in minutes.</p>
              <Link href="/hotels" className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-gold hover:text-ink">Search hotels</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
