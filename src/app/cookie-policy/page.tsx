import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy (Draft)",
  description: "How PRITIVO uses cookies and third-party services such as Google Maps and analytics.",
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" updated="2026">
      <p>This policy explains the small files and third-party services used on this website.</p>
      <h2>What we use</h2>
      <ul>
        <li><strong>Essential (strictly necessary).</strong> A staff-only session cookie protects the internal tour manager. Guest hotel bookings use a booking reference plus your email or phone — there is no customer login cookie anywhere on this site.</li>
        <li><strong>Google Maps.</strong> When you open a map (hotel location, map view or the destination explorer), Google may set cookies and receive your IP address and the area being viewed, under Google&apos;s own privacy policy. Maps load only when you open them, not on every page.</li>
        <li><strong>Analytics (only when configured).</strong> If a measurement ID is added, an analytics script counts page views with IP anonymisation. It is not enabled by default.</li>
        <li><strong>WhatsApp and email links.</strong> Clicking these opens a third-party service; their cookie policies then apply.</li>
      </ul>
      <h2>What we do not use</h2>
      <ul>
        <li>No advertising or cross-site tracking pixels.</li>
        <li>No customer accounts, so no profiling or saved-login cookies.</li>
        <li>No sale or sharing of personal data with advertisers.</li>
      </ul>
      <h2>Your choices</h2>
      <p>
        You can block or delete cookies in your browser settings. Blocking third-party cookies may prevent maps from
        displaying; the address text, “Get directions” links and all enquiry and booking features continue to work.
      </p>
      <h2>Questions</h2>
      <p>
        Contact <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a> or WhatsApp {SITE.phoneDisplay}.
      </p>
    </LegalPage>
  );
}
