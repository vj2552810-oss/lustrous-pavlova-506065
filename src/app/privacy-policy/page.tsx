import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy (Draft)",
  description: "How PRITIVO collects, uses and protects personal information shared through enquiries.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="2026">
      <p>
        This Privacy Policy explains how PRITIVO (&ldquo;we&rdquo;, &ldquo;us&rdquo;), an online travel agency based in{" "}
        {SITE.location}, handles personal information you share with us through this website, WhatsApp, phone or email.
      </p>
      <h2>Information we collect</h2>
      <ul>
        <li>Contact details you provide: name, email address and phone number.</li>
        <li>Trip details: destination, departure city, dates, number of travellers, budget, trip type and special requirements.</li>
        <li>Messages you send us via our forms, WhatsApp or email.</li>
        <li>Basic technical data automatically processed by our hosting provider (such as IP address and browser type) for security and performance.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry and prepare quotations and itineraries.</li>
        <li>To arrange services you confirm, which may require sharing necessary details with hotels, transport providers or other suppliers.</li>
        <li>To keep records of enquiries and communicate with you about your trip.</li>
      </ul>
      <p>We do not sell your personal information. Enquiry records are stored privately and are not published on this website.</p>
      <h2>Hotel bookings and payments</h2>
      <ul>
        <li>To reserve a room we collect the lead guest&apos;s name, email, phone, stay dates and any special requests, and share what is necessary with the hotel or our hotel provider.</li>
        <li>Booking references and contact-checked lookups are used so you can retrieve your booking without an account.</li>
        <li>Card payments are processed by our payment gateway (Stripe). PRITIVO does not receive or store your full card details; we keep only the payment reference, amount and status.</li>
        <li>Booking records are kept for as long as needed to service the booking and meet accounting and legal obligations.</li>
      </ul>
      <h2>Google Maps and nearby places</h2>
      <ul>
        <li>Hotel location maps use the Google Maps JavaScript API. When a map loads, Google may receive your IP address, device information and the area being viewed, and may set its own cookies under Google&apos;s privacy policy.</li>
        <li>Maps only load when you open a map view or scroll to a location section, so they are not requested on every page.</li>
        <li>Nearby attractions, restaurants, airports and transport are requested from the Google Places API only when you tap that option.</li>
        <li>Hotel prices, availability and booking confirmation come from our hotel provider and payment gateway — never from Google Maps.</li>
      </ul>
      <h2>WhatsApp and email</h2>
      <p>
        When you submit a form, your details may be prefilled into a WhatsApp or email message that you choose to send.
        These services are operated by third parties and their own privacy policies apply.
      </p>
      <h2>Data retention & security</h2>
      <p>
        We keep enquiry information only as long as needed for the purposes above or as required by law, and take
        reasonable measures to protect it. No method of transmission or storage is completely secure.
      </p>
      <h2>Your choices</h2>
      <p>
        You may request access to, correction of, or deletion of your personal information by emailing{" "}
        <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>.
      </p>
      <h2>Changes</h2>
      <p>We may update this policy from time to time. The latest version will always be available on this page.</p>
    </LegalPage>
  );
}
