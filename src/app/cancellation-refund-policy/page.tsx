import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy (Draft)",
  description: "General information about cancellations and refunds for trips arranged by PRITIVO.",
  alternates: { canonical: "/cancellation-refund-policy" },
};

export default function CancellationPage() {
  return (
    <LegalPage title="Cancellation & Refund Policy" updated="2026">
      <p>
        Because every PRITIVO trip is customised and relies on third-party suppliers, cancellation and refund terms vary
        by booking. <strong>The terms that apply to your trip are the ones stated in your written quotation</strong>, which
        you will receive before making any payment.
      </p>
      <h2>Cancellations by you</h2>
      <ul>
        <li>Cancellation requests must be made in writing (email or WhatsApp) to PRITIVO.</li>
        <li>Charges depend on supplier policies and how close to departure the cancellation is made.</li>
        <li>Some components — such as certain flight fares, peak-season hotels or special events — may be non-refundable.</li>
        <li>[Review: insert PRITIVO&apos;s own service fee / cancellation slabs, if any, before publication.]</li>
      </ul>
      <h2>Hotel bookings</h2>
      <ul>
        <li>Each room shows its cancellation terms before you book; those terms (from the hotel provider) apply to your reservation.</li>
        <li>Unpaid bookings can be cancelled from your booking page. Paid or confirmed bookings must be cancelled under the hotel&apos;s policy — contact us and we will action it with the provider.</li>
        <li>If a hotel cannot confirm a reservation after payment has been taken, we cancel the booking and start a refund of the amount paid. The reason is recorded on your booking page.</li>
        <li>Refund timing depends on the hotel and payment provider. Nothing in this draft overrides the cancellation terms confirmed with your booking.</li>
      </ul>
      <h2>Changes to your booking</h2>
      <p>Amendments are subject to availability and may incur supplier charges or fare differences.</p>
      <h2>Cancellations by suppliers or PRITIVO</h2>
      <p>
        If a service is cancelled by a supplier or by us, we will offer a suitable alternative where possible or process a
        refund of amounts recoverable from the supplier, as described in your quotation.
      </p>
      <h2>Refund processing</h2>
      <ul>
        <li>Refunds are processed to the original payment method after amounts are received back from suppliers.</li>
        <li>Supplier and bank timelines vary. [Review: specify an indicative processing timeline.]</li>
      </ul>
      <h2>Force majeure</h2>
      <p>
        For events beyond reasonable control, refunds depend on what suppliers return. We strongly recommend travel
        insurance.
      </p>
      <h2>Questions</h2>
      <p>
        Contact us at <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a> or {SITE.phoneDisplay}.
      </p>
    </LegalPage>
  );
}
