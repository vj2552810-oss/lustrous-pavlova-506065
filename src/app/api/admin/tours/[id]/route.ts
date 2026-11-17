import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { deleteTour, getTourById, updateTour, slugify, type TourInput } from "@/lib/tours/service";
import { parseTourForm } from "@/lib/tours/form";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function guard() {
  return (await isAdminAuthenticated()) ? null : NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const tourId = Number(id);
  if (!Number.isInteger(tourId)) return NextResponse.json({ ok: false, error: "Invalid tour." }, { status: 400, headers: NO_STORE });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  // Quick toggles from the management table
  if (typeof body.published === "boolean" && Object.keys(body).length === 1) {
    const updated = await updateTour(tourId, { published: body.published });
    return NextResponse.json({ ok: true, published: updated?.published }, { headers: NO_STORE });
  }

  const existing = await getTourById(tourId);
  if (!existing) return NextResponse.json({ ok: false, error: "Tour not found." }, { status: 404, headers: NO_STORE });

  const { input, errors } = parseTourForm({ ...existing, ...body });
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });

  const slug = input!.slug || slugify(input!.name);
  try {
    const updated = await updateTour(tourId, { ...(input as TourInput), slug });
    return NextResponse.json({ ok: true, slug: updated?.slug }, { headers: NO_STORE });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "23505") {
      return NextResponse.json({ ok: false, errors: { slug: "That slug is already used by another tour." } }, { status: 409, headers: NO_STORE });
    }
    console.error("Tour update failed", err);
    return NextResponse.json({ ok: false, error: "Could not update the tour." }, { status: 500, headers: NO_STORE });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const tourId = Number(id);
  if (!Number.isInteger(tourId)) return NextResponse.json({ ok: false, error: "Invalid tour." }, { status: 400, headers: NO_STORE });
  await deleteTour(tourId);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
