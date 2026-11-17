import { AlertTriangle, BadgeCheck, Info } from "lucide-react";

/**
 * Always visible above hotel content: guests must know whether they are looking
 * at live partner availability or sample demo inventory.
 */
export function ModeBanner({
  mode,
  providerName,
  compact = false,
}: {
  mode: "demo" | "live";
  providerName?: string;
  compact?: boolean;
}) {
  if (mode === "live") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p>
          <strong>Live availability.</strong> Rooms, prices and cancellation terms are supplied by our hotel partner
          {providerName ? ` (${providerName})` : ""} for the dates selected. Prices are re-checked before payment.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 ${compact ? "px-4 py-3 text-sm" : "p-5 text-sm"}`}
      role="note"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
      <div className="leading-6">
        <p className="font-semibold">Demo mode — sample hotels, not live availability</p>
        <p className="mt-1">
          The properties and prices below are fictional samples built so you can see how booking works. No payment is
          taken and <strong>no reservation is made or confirmed</strong>. To book a real stay, message us on WhatsApp or
          send a booking enquiry — a PRITIVO planner will confirm live rates with our hotel partners.
        </p>
        {!compact && (
          <p className="mt-2 flex items-start gap-2 text-xs text-amber-800">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Live booking switches on once an authorised hotel API and payment gateway are configured (see the setup guide).
          </p>
        )}
      </div>
    </div>
  );
}
