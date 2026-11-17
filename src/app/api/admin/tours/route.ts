import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createTour, slugify, type TourInput } from "@/lib/tours/service";
import { NO_STORE } from "@/lib/rate-limit";
import { parseTourForm } from "@/lib/tours/form";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const { input, errors } = parseTourForm(body);
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const slug = input!.slug || slugify(input!.name);
  try {
    const tour = await createTour({ ...(input as TourInput), slug });
    return NextResponse.json({ ok: true, id: tour?.id, slug: tour?.slug }, { status: 201, headers: NO_STORE });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json({ ok: false, errors: { slug: "That slug is already used by another tour." } }, { status: 409, headers: NO_STORE });
    }
    if (code === "23502" || code === "23514") {
      return NextResponse.json({ ok: false, error: "Some required fields are missing or invalid." }, { status: 422, headers: NO_STORE });
    }
    console.error("Tour create failed", err);
    return NextResponse.json({ ok: false, error: "Could not create the tour." }, { status: 500, headers: NO_STORE });
  }
}
