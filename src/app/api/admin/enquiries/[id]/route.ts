import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  allowedTransitions,
  canConfirm,
  getEnquiry,
  statusLabel,
  updateEnquiryAdvanced,
} from "@/lib/crm/enquiries";
import { supplierCanConfirm } from "@/lib/crm/suppliers";
import { getSupplier } from "@/lib/crm/suppliers";
import { audit } from "@/lib/security/log";
import { ENQUIRY_STATUS_KEYS } from "@/lib/crm/enquiries";
import { NO_STORE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.slice(0, max) : "");
const PAYMENT_STATUSES = ["not_collected", "unpaid", "partially_paid", "paid", "refunded"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ ok: false, error: "Staff session required." }, { status: 401, headers: NO_STORE });
  const { id } = await params;
  const enquiryId = Number(id);
  if (!Number.isInteger(enquiryId)) return NextResponse.json({ ok: false, error: "Invalid enquiry." }, { status: 400, headers: NO_STORE });

  const enquiry = await getEnquiry(enquiryId);
  if (!enquiry) return NextResponse.json({ ok: false, error: "Enquiry not found." }, { status: 404, headers: NO_STORE });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400, headers: NO_STORE });
  }

  const patch: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  if (body.status !== undefined) {
    const status = str(body.status, 40);
    if (!ENQUIRY_STATUS_KEYS.includes(status as never)) errors.status = "Unknown status.";
    else if (!allowedTransitions(enquiry.status).includes(status as never)) {
      errors.status = `Cannot move from “${statusLabel(enquiry.status)}” to “${statusLabel(status)}”. Allowed: ${allowedTransitions(enquiry.status).map(statusLabel).join(", ") || "none"}.`;
    } else if (status === "confirmed") {
      // Hard rule: never confirm without supplier confirmation and payment.
      const supplierConfirmed = body.supplierConfirmed === true || enquiry.supplierConfirmed;
      const paymentStatus = typeof body.paymentStatus === "string" ? body.paymentStatus : enquiry.paymentStatus;
      const check = canConfirm({ supplierConfirmed, paymentStatus });
      if (!check.ok) {
        errors.status = `A booking can only be confirmed when the supplier has confirmed${check.needsSupplier ? " (record supplier confirmation first)" : ""} and payment is recorded${check.needsPayment ? " (set payment status to paid)" : ""}.`;
      }
    }
    if (!errors.status) patch.status = status;
  }

  if (body.adminNote !== undefined) patch.adminNote = str(body.adminNote, 2000);
  if (body.supplierConfirmed !== undefined) patch.supplierConfirmed = body.supplierConfirmed === true;
  if (body.supplierName !== undefined) patch.supplierName = str(body.supplierName, 160);
  if (body.supplierId !== undefined && body.supplierId !== null && body.supplierId !== "") {
    const supplierId = Number(body.supplierId);
    const supplier = Number.isInteger(supplierId) ? await getSupplier(supplierId) : null;
    if (!supplier) errors.supplierId = "That supplier does not exist.";
    else {
      patch.supplierId = supplier.id;
      patch.supplierName = supplier.name;
      // A suspended or unverified supplier cannot be the confirming party.
      if (!supplierCanConfirm(supplier.verificationStatus) && body.supplierConfirmed === true) {
        errors.supplierId = "Mark the supplier as verified before recording a supplier confirmation.";
      }
    }
  }
  if (body.paymentStatus !== undefined) {
    const paymentStatus = str(body.paymentStatus, 30);
    if (!PAYMENT_STATUSES.includes(paymentStatus)) errors.paymentStatus = "Unknown payment status.";
    else patch.paymentStatus = paymentStatus;
  }
  if (body.transactionId !== undefined) patch.transactionId = str(body.transactionId, 120);

  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422, headers: NO_STORE });
  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: false, error: "Nothing to update." }, { status: 422, headers: NO_STORE });

  const updated = await updateEnquiryAdvanced(enquiryId, patch as never);
  await audit("admin.enquiry.updated", {
    actor: "staff",
    entityType: "enquiry",
    entityId: enquiryId,
    detail: Object.entries(patch).map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`).join(","),
  });
  return NextResponse.json({ ok: true, enquiry: updated }, { headers: NO_STORE });
}
