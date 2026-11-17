import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions (Draft)",
  description: "Draft terms governing use of the PRITIVO website and travel planning services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions" updated="2026">
      <p>By using this website or requesting our services, you agree to the following terms.</p>
      <h2>Our role</h2>
      <p>
        PRITIVO is an online travel agency that plans itineraries and arranges travel services provided by independent
        third parties such as hotels, airlines, transport operators and activity providers. Those services are subject to
        the suppliers&apos; own terms and conditions.
      </p>
      <h2>Website information</h2>
      <ul>
        <li>Package descriptions, durations and highlights are indicative and for inspiration only.</li>
        <li>Prices are shown only where verified; otherwise &ldquo;Request a Quote&rdquo; is displayed.</li>
        <li>Photographs are representative and may not depict the exact hotels or services provided.</li>
      </ul>
      <h2>Quotations & confirmation</h2>
      <ul>
        <li>A submitted enquiry is not a booking. Bookings are confirmed only after written confirmation from both parties and any required payment.</li>
        <li>Final prices, inclusions, exclusions, payment schedules and cancellation terms are those stated in your written quotation.</li>
        <li>Prices may change until confirmed due to supplier availability, fares, taxes or currency fluctuations.</li>
      </ul>
      <h2>Hotel bookings</h2>
      <ul>
        <li>Hotel booking on this website is guest-only; no account is created and none is required.</li>
        <li>Availability, room details, prices, taxes and cancellation terms are supplied by the hotel provider. Where the site is in demo mode, the properties and prices shown are samples and no reservation is made.</li>
        <li>Availability and the final price are re-checked on our server before payment. If the price changes materially before the hotel confirms, we will not charge the new amount without your agreement — any payment taken is refunded instead.</li>
        <li>A booking is confirmed only after (a) the payment gateway confirms the payment to our server and (b) the hotel provider returns a booking confirmation. The confirmed details are shown on your booking page and emailed when email delivery is configured.</li>
        <li>Guests are responsible for providing accurate guest details and for meeting the hotel&apos;s check-in requirements, including valid identification.</li>
      </ul>
      <h2>Traveller responsibilities</h2>
      <ul>
        <li>Providing accurate traveller names and details as per official ID/passport.</li>
        <li>Holding valid passports, visas, permits, vaccinations and insurance as required.</li>
        <li>Complying with local laws and supplier rules during travel.</li>
      </ul>
      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, PRITIVO is not liable for acts, omissions or failures of third-party suppliers, or
        for events beyond reasonable control such as weather, natural disasters, strikes, government actions or health
        emergencies.
      </p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. [Review: specify jurisdiction before publication.]</p>
      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a> ·{" "}
        {SITE.phoneDisplay}
      </p>
    </LegalPage>
  );
}
