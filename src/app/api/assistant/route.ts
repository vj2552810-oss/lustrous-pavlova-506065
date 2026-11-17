import { NextResponse } from "next/server";
import { listTours } from "@/lib/tours/service";
import { DESTINATION_GUIDES } from "@/lib/destinations";
import { SERVICES } from "@/lib/services";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";
import { whatsappLink, SITE } from "@/lib/site";
import { BUDGET_BANDS, STYLE_LABELS } from "@/lib/tours/constants";

export const dynamic = "force-dynamic";

/**
 * PRITIVO travel assistant.
 *
 * Deterministic, retrieval-based: it answers from the tour catalogue, destination
 * guides and service list stored in this project. It deliberately cannot quote
 * prices, claim availability or confirm bookings — those always route to a human.
 * If OPENAI_API_KEY is configured later, a provider answer can be layered on top,
 * but the guardrails below stay in force.
 */

const GUARDRAILS = [
  "I never invent prices, availability or booking confirmations — those come from a written quotation.",
  "For live rates, dates and supplier confirmation, our Belagavi team replies on WhatsApp.",
];

interface Reply {
  answer: string;
  suggestions: { label: string; href: string }[];
  handoff?: string;
}

function matchTours(text: string) {
  const q = text.toLowerCase();
  return DESTINATION_GUIDES.filter((d) => q.includes(d.name.toLowerCase()) || q.includes(d.slug));
}

function budgetHint(text: string) {
  const digits = text.replace(/[^\d]/g, "");
  const amount = digits ? Number(digits) : 0;
  if (!amount) return null;
  const band = BUDGET_BANDS.find((b) => amount >= b.min && amount < b.max) ?? BUDGET_BANDS[BUDGET_BANDS.length - 1];
  return band;
}

function styleHint(text: string) {
  const q = text.toLowerCase();
  const found = Object.entries(STYLE_LABELS).find(([, label]) => q.includes(label.toLowerCase())) ??
    Object.entries(STYLE_LABELS).find(([key]) => q.includes(key.replace("-", " ")));
  return found ? { key: found[0], label: found[1] } : null;
}

async function buildReply(message: string): Promise<Reply> {
  const q = message.toLowerCase().trim();
  const suggestions: Reply["suggestions"] = [];

  // Price / availability / booking status questions always hand off.
  if (/(price|cost|how much|rate|fare|available|availability|confirm(ed)? booking|payment status|refund status)/.test(q)) {
    return {
      answer:
        "I can explain itineraries, destinations and how our process works, but I can't quote live prices or confirm availability — that would be guessing. A PRITIVO planner will send exact pricing and supplier confirmation in writing.",
      suggestions: [
        { label: "Request a written quote", href: "/plan-trip" },
        { label: "Browse tours", href: "/tours" },
      ],
      handoff: whatsappLink("Hello PRITIVO! I'd like a price and availability quote."),
    };
  }

  if (/(visa|passport|document)/.test(q)) {
    return {
      answer:
        "Document needs depend on your nationality and destination, and rules change. Generally you'll need a passport valid at least six months beyond your return date, plus a visa or e-visa where required. We share a checklist for your specific route, but approval always rests with the authorities — we can't guarantee a visa.",
      suggestions: [{ label: "Read the travel FAQ", href: "/faq" }],
      handoff: whatsappLink("Hello PRITIVO! I need visa guidance for my trip."),
    };
  }

  if (/(cancel|refund|policy)/.test(q)) {
    return {
      answer:
        "Cancellation terms depend on the hotel, airline or operator and how close to departure you cancel. The terms that apply to your trip are stated in your written quotation. Unpaid hotel bookings can be cancelled from your booking page.",
      suggestions: [
        { label: "Cancellation & refund policy", href: "/cancellation-refund-policy" },
        { label: "Find my booking", href: "/my-booking" },
      ],
      handoff: whatsappLink("Hello PRITIVO! I need help with a cancellation."),
    };
  }

  const destinations = matchTours(q);

  const serviceHit = SERVICES.find((svc) => {
    const words = svc.name.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    return words.some((w) => w.length > 3 && q.includes(w));
  });
  const budgetBand = budgetHint(q);

  if (destinations.length === 0 && !serviceHit && !budgetBand) {
    // Fall back to the live tour catalogue: match on individual keywords so
    // "tell me about Switzerland" still resolves to the Switzerland tour.
    const STOPWORDS = new Set(["tell","me","about","the","a","an","for","to","in","of","and","or","please","want","need","trip","tour","tours","holiday","package","packages","go","going","visit","best","good","how","what","is","are","do","you","i","we","my","our","from","with","any","some","best"]);
    const tokens = Array.from(new Set(
      message
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
    ));
    for (const token of tokens.slice(0, 6)) {
      const hits = await listTours({ q: token }).catch(() => []);
      if (hits.length > 0) {
        const t = hits[0];
        const cityLabel = t.city.split("·")[0].trim() || t.country;
        return {
          answer: `${t.name} (${t.type === "domestic" ? "India" : t.country}) — ${t.summary} Suggested duration: ${t.durationDays} days / ${t.durationNights} nights${t.bestTime ? `. Best time: ${t.bestTime}` : ""}. ${
            t.priceVerified && t.priceFromINR
              ? "An indicative starting price is published on the tour page."
              : "Pricing is quoted individually for your dates and hotel category — we never publish a guessed price."
          }${hits.length > 1 ? ` We also have ${hits.length - 1} related option(s) for “${token}”.` : ""}`,
          suggestions: [
            { label: `${t.name} itinerary`, href: `/tours/${t.slug}` },
            { label: `Hotels in ${cityLabel}`, href: `/hotels?destination=${encodeURIComponent(cityLabel)}` },
            ...(hits.length > 1 ? [{ label: `All “${token}” tours`, href: `/tours?q=${encodeURIComponent(token)}` }] : []),
          ],
          handoff: whatsappLink(`Hello PRITIVO! I'd like a quote for the ${t.name} tour.`),
        };
      }
    }
  }

  if (destinations.length) {
    const d = destinations[0];
    return {
      answer: `${d.name} (${d.region}, ${d.country}) — ${d.overview} Best time to visit: ${d.bestTime} Typical duration: ${d.durations}. Indicative planning budget: ₹${d.indicativeBudgetINR.from.toLocaleString("en-IN")}–₹${d.indicativeBudgetINR.to.toLocaleString("en-IN")} per person, which is a planning range only — your exact quote depends on season, hotel category and group size.`,
      suggestions: [
        { label: `${d.name} guide`, href: `/destinations/${d.slug}` },
        { label: `${d.name} tours`, href: `/tours?q=${encodeURIComponent(d.name)}` },
      ],
      handoff: whatsappLink(`Hello PRITIVO! I'd like to plan a trip to ${d.name}.`),
    };
  }

  const style = styleHint(q);
  if (style) {
    const tours = await listTours({ style: style.key }).catch(() => []);
    const names = tours.slice(0, 4).map((t) => t.name);
    return {
      answer: `For ${style.label.toLowerCase()} we currently plan ${tours.length} journeys${names.length ? ` — including ${names.join(", ")}` : ""}. Every itinerary is adjustable for your dates, pace and hotel category.`,
      suggestions: [{ label: `See ${style.label}`, href: `/tours?style=${style.key}` }],
      handoff: whatsappLink(`Hello PRITIVO! I'm interested in a ${style.label} trip.`),
    };
  }

  const band = budgetHint(q);
  if (band) {
    const tours = await listTours({ budget: band.key }).catch(() => []);
    const names = tours.slice(0, 5).map((t) => t.name);
    return {
      answer: `For a budget around ${band.label}, ${tours.length} tours in our catalogue fit that band based on verified prices. ${names.length ? `Options include ${names.join(", ")}.` : ""} Tours shown as "Request a Quote" are priced individually, so ask us and we'll match an itinerary to your budget.`,
      suggestions: [
        { label: `Tours in ${band.label}`, href: `/tours?budget=${band.key}` },
        { label: "Budget trips", href: "/tours?style=budget" },
      ],
      handoff: whatsappLink(`Hello PRITIVO! My budget is about ${band.label} per person — what do you suggest?`),
    };
  }

  const service = SERVICES.find((s) => q.includes(s.name.toLowerCase().split(" ")[0]));
  if (service) {
    return {
      answer: `${service.name}: ${service.description} ${service.terms}`,
      suggestions: [{ label: `About ${service.name}`, href: `/services/${service.slug}` }],
      handoff: whatsappLink(`Hello PRITIVO! I'd like to know more about ${service.name}.`),
    };
  }

  if (/(hi|hello|hey|namaste)/.test(q)) {
    return {
      answer: `Hello! I'm the PRITIVO travel assistant. Ask me about a destination (Kashmir, Switzerland, Bali…), a travel style (honeymoon, trekking, family), a budget range, or our services — hotels, flights, car rental and custom planning.`,
      suggestions: [
        { label: "Browse all tours", href: "/tours" },
        { label: "Destination guides", href: "/destinations" },
        { label: "Our services", href: "/services" },
      ],
    };
  }

  return {
    answer:
      "I can help with destinations, itineraries, travel styles, budgets and our services. Try asking about a place (Kerala, Iceland, Dubai), a style (honeymoon, trekking, family) or a budget range.",
    suggestions: [
      { label: "Browse tours", href: "/tours" },
      { label: "Plan a custom trip", href: "/plan-trip" },
    ],
    handoff: whatsappLink("Hello PRITIVO! I have a travel question."),
  };
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = rateLimit(`assistant:${ip}`, 20, 10 * 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: "You've sent a lot of messages. Please try again shortly." }, { status: 429, headers: NO_STORE });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  if (message.length < 2) {
    return NextResponse.json({ ok: false, error: "Please type a question." }, { status: 422, headers: NO_STORE });
  }

  try {
    const reply = await buildReply(message);
    return NextResponse.json(
      {
        ok: true,
        answer: reply.answer,
        suggestions: reply.suggestions,
        handoff: reply.handoff ?? null,
        guardrails: GUARDRAILS,
        support: { whatsapp: whatsappLink("Hello PRITIVO!"), phone: SITE.phoneDisplay, email: SITE.email },
        mode: process.env.OPENAI_API_KEY ? "assisted" : "catalogue",
      },
      { headers: NO_STORE },
    );
  } catch (err) {
    console.error("Assistant failed", err instanceof Error ? err.message : "");
    return NextResponse.json({ ok: false, error: "The assistant is unavailable right now. Please message us on WhatsApp." }, { status: 500, headers: NO_STORE });
  }
}
