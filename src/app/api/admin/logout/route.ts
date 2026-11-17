import { NextResponse } from "next/server";
import { destroyAdminSession } from "@/lib/admin/auth";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  await destroyAdminSession(req);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
