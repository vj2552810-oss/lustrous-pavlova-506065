import { NextResponse } from "next/server";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import {
  cleanPhone,
  tripDatesText,
  validateContact,
  validateTrip,
  validateAdvancedTrip,
  type ContactEnquiry,
  type TripEnquiry,
} from "@/lib/validation";
import { clientIp, NO_STORE, rateLimit } from "@/lib/rate-limit";
import { ensureCustomer, findDuplicate, generateEnquiryCode, notifyAdminOfEnquiry } from "@/lib/crm/enquiries";
import { audit } from "@/lib/security/log";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 1500) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown, max = 40) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= max ? n : null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function insertAndNotify(values: typeof enquiries.$inferInsert, ip: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const code = generateEnquiryCode();
    try {
      const inserted = await db.insert(enquiries).values({ ...values, code, status: "new_enquiry" }).returning();
      const row = inserted[0];
      if (!row) break;
      await ensureCustomer({
        name: row.name,
        email: row.email,
        phone: row.phone,
        city: row.originCity ?? row.departureCity,
        preferences: row.tripType ?? undefined,
      });
      // Admin notification is best-effort: the enquiry is already saved.
      await notifyAdminOfEnquiry(row).catch((err) => console.error("Admin notification failed", err instanceof Error ? err.message : ""));
      audit("enquiry.received", { actor: `guest:${ip}`, entityType: "enquiry", entityId: row.id, detail: `${row.kind} ${code}` });
      return NextResponse.json({ ok: true, code }, { status: 201, headers: NO_STORE });
    } catch (err) {
      const pgCode = (err as { code?: string }).code;
      if (pgCode === "23505" && attempt < 3) continue; // code collision
      console.error("Enquiry insert failed", err instanceof Error ? err.message : "");
      return NextResponse.json({ ok: false, error: "We couldn't save your enquiry. Please try again." }, { status: 500, headers: NO_STORE });
    }
  }
  return NextResponse.json({ ok: false, error: "We couldn't save your enquiry. Please try again." }, { status: 500, headers: NO_STORE });
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  // Layered spam protection: per-IP rate limit + honeypot + duplicate guard.
  const limit = rateLimit(`enquiry:${ip}`, 6, 60_000);
  if (!limit.allowed) {
    audit("enquiry.rate_limited", { actor: `guest:${ip}`, detail: `retryAfter=${limit.retryAfter}s` });
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please wait a minute and try again." },
      { status: 429, headers: { ...NO_STORE, "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  // Honeypot: bots fill hidden fields, people never see them.
  if (str(body.website) || str(body.company)) {
    audit("enquiry.spam_blocked", { actor: `guest:${ip}`, detail: "honeypot" });
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const kind = str(body.kind, 20);
  const email = str(body.email, 200).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    audit("validation.failed", { actor: `guest:${ip}`, detail: `${kind} invalid email` });
    return NextResponse.json({ ok: false, errors: { email: "Please enter a valid email address." } }, { status: 422, headers: NO_STORE });
  }

  const destination = str(body.destination, 160).trim();
  const travelDatesRaw = str(body.travelDates, 120);
  const duplicate = await findDuplicate({ email, destination: destination || null, travelDates: travelDatesRaw || null }).catch(() => null);
  if (duplicate) {
    audit("enquiry.duplicate_ignored", { actor: `guest:${ip}`, entityId: duplicate.id, detail: `${kind} duplicate within 10 minutes` });
    return NextResponse.json({ ok: true, code: duplicate.code ?? null, duplicate: true }, { status: 200, headers: NO_STORE });
  }

  try {
    if (kind === "trip") {
      const advanced = body.adults !== undefined || body.children !== undefined || body.hotelCategory !== undefined;
      const data: TripEnquiry = {
        name: str(body.name, 120),
        email,
        phone: str(body.phone, 30),
        destination,
        departureCity: str(body.departureCity, 120),
        startDate: str(body.startDate, 20),
        endDate: str(body.endDate, 20),
        flexibleDates: body.flexibleDates === true,
        travelers: str(String(body.travelers ?? ""), 5),
        budget: str(body.budget, 60),
        tripType: str(body.tripType, 60),
        requirements: str(body.requirements, 1000),
      };
      const errors = advanced ? validateAdvancedTrip(data, body) : validateTrip(data);
      if (Object.keys(errors).length) {
        audit("validation.failed", { actor: `guest:${ip}`, detail: `${kind} ${Object.keys(errors).join(",")}` });
        return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });
      }
      const adults = num(body.adults, 20);
      const children = num(body.children, 20);
      const travelers = adults !== null ? adults + (children ?? 0) : Number(data.travelers);
      return insertAndNotify(
        {
          kind: "trip",
          name: data.name.trim(),
          email,
          phone: cleanPhone(data.phone),
          destination: data.destination || null,
          departureCity: data.departureCity || null,
          originCity: data.departureCity || null,
          travelDates: tripDatesText(data),
          travelers: Number.isFinite(travelers) ? Math.min(travelers, 200) : null,
          adults,
          children,
          hotelCategory: str(body.hotelCategory, 60) || null,
          budget: data.budget || null,
          tripType: data.tripType || null,
          subject: `Trip enquiry — ${data.destination}`,
          message: data.requirements.trim() || null,
        },
        ip,
      );
    }

    if (kind === "tour") {
      const name = str(body.name, 120);
      const phone = str(body.phone, 30);
      const tourSlug = str(body.tourSlug, 140);
      const travelDates = str(body.travelDates, 120);
      const travelers = Number(body.travelers ?? 0);

      const errors: Record<string, string> = {};
      if (name.trim().length < 2) errors.name = "Please enter your full name.";
      if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s\-()]/g, ""))) errors.phone = "Enter a valid phone number (10–15 digits).";
      if (!tourSlug && destination.length < 2) errors.destination = "Tell us where you'd like to go.";
      if (!travelDates) errors.travelDates = "Choose a preferred travel date.";
      if (!Number.isInteger(travelers) || travelers < 1 || travelers > 40) errors.travelers = "Enter between 1 and 40 travellers.";
      if (Object.keys(errors).length) {
        audit("validation.failed", { actor: `guest:${ip}`, detail: `tour ${Object.keys(errors).join(",")}` });
        return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });
      }

      return insertAndNotify(
        {
          kind: "tour",
          tourSlug: tourSlug || null,
          name: name.trim(),
          email,
          phone: cleanPhone(phone),
          destination: destination || null,
          travelDates,
          travelers,
          budget: str(body.budget, 60) || null,
          tripType: str(body.tripType, 60) || null,
          subject: `Tour quotation — ${destination || tourSlug}`,
          message: str(body.message, 1000).trim() || null,
        },
        ip,
      );
    }

    if (kind === "flight") {
      const name = str(body.name, 120);
      const phone = str(body.phone, 30);
      const origin = str(body.departureCity, 120);
      const travelDates = str(body.travelDates, 120);
      const travelers = Number(body.travelers ?? 0);

      const errors: Record<string, string> = {};
      if (name.trim().length < 2) errors.name = "Please enter your full name.";
      if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s\-()]/g, ""))) errors.phone = "Enter a valid phone number (10–15 digits).";
      if (origin.trim().length < 2) errors.departureCity = "Where are you flying from?";
      if (destination.length < 2) errors.destination = "Where are you flying to?";
      if (!travelDates) errors.travelDates = "Choose your travel dates.";
      if (!Number.isInteger(travelers) || travelers < 1 || travelers > 9) errors.travelers = "Enter between 1 and 9 travellers.";
      if (Object.keys(errors).length) {
        audit("validation.failed", { actor: `guest:${ip}`, detail: `flight ${Object.keys(errors).join(",")}` });
        return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });
      }

      return insertAndNotify(
        {
          kind: "flight",
          name: name.trim(),
          email,
          phone: cleanPhone(phone),
          destination,
          departureCity: origin,
          originCity: origin,
          travelDates,
          travelers,
          tripType: str(body.tripType, 60) || null,
          subject: `Flight request — ${origin} → ${destination}`,
          message: str(body.message, 1000).trim() || null,
        },
        ip,
      );
    }

    if (kind === "hotel") {
      const name = str(body.name, 120);
      const phone = str(body.phone, 30);
      const travelDates = str(body.travelDates, 120);
      const message = str(body.message, 1500);
      const errors: Record<string, string> = {};
      if (name.trim().length < 2) errors.name = "Please enter your full name.";
      if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s\-()]/g, ""))) errors.phone = "Enter a valid phone number (10–15 digits).";
      if (destination.length < 2) errors.destination = "Which city or hotel are you asking about?";
      if (message.trim().length < 5) errors.message = "Tell us a little about what you need.";
      if (Object.keys(errors).length) {
        audit("validation.failed", { actor: `guest:${ip}`, detail: `hotel ${Object.keys(errors).join(",")}` });
        return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });
      }
      const travelers = num(body.travelers, 200);
      return insertAndNotify(
        {
          kind: "hotel",
          name: name.trim(),
          email,
          phone: cleanPhone(phone),
          destination,
          travelDates: travelDates || null,
          travelers,
          subject: `Hotel enquiry — ${destination}`,
          message: message.trim(),
        },
        ip,
      );
    }

    if (kind === "service") {
      const name = str(body.name, 120);
      const phone = str(body.phone, 30);
      const message = str(body.message, 1500);
      const errors: Record<string, string> = {};
      if (name.trim().length < 2) errors.name = "Please enter your full name.";
      if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s\-()]/g, ""))) errors.phone = "Enter a valid phone number (10–15 digits).";
      if (destination.length < 2) errors.destination = "Which service or city is this about?";
      if (message.trim().length < 5) errors.message = "Tell us a little about what you need.";
      if (Object.keys(errors).length) {
        audit("validation.failed", { actor: `guest:${ip}`, detail: `service ${Object.keys(errors).join(",")}` });
        return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });
      }
      return insertAndNotify(
        {
          kind: "service",
          name: name.trim(),
          email,
          phone: cleanPhone(phone),
          destination,
          travelDates: str(body.travelDates, 120) || null,
          travelers: num(body.travelers, 200),
          subject: `${str(body.serviceName, 80) || "Service"} enquiry — ${destination}`,
          message: message.trim(),
        },
        ip,
      );
    }

    if (kind === "contact") {
      const data: ContactEnquiry = {
        name: str(body.name, 120),
        email,
        phone: str(body.phone, 30),
        subject: str(body.subject, 160),
        message: str(body.message, 1500),
      };
      const errors = validateContact(data);
      if (Object.keys(errors).length) {
        audit("validation.failed", { actor: `guest:${ip}`, detail: `contact ${Object.keys(errors).join(",")}` });
        return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });
      }
      return insertAndNotify(
        {
          kind: "contact",
          name: data.name.trim(),
          email,
          phone: cleanPhone(data.phone),
          subject: data.subject.trim(),
          message: data.message.trim(),
        },
        ip,
      );
    }

    return NextResponse.json({ ok: false, error: "Unknown enquiry type." }, { status: 400, headers: NO_STORE });
  } catch (err) {
    console.error("Enquiry failed", err instanceof Error ? err.message : "");
    return NextResponse.json({ ok: false, error: "We couldn't save your enquiry. Please try again." }, { status: 500, headers: NO_STORE });
  }
}
