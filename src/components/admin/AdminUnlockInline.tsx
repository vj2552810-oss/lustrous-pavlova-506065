import { adminSetupMessage, adminConfigured } from "@/lib/admin/auth";
import { AdminUnlockForm } from "./AdminUnlockForm";

export function AdminUnlockInline() {
  return (
    <section className="min-h-screen bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-lg px-5 sm:px-8">
        <AdminUnlockForm configured={adminConfigured()} setupMessage={adminSetupMessage()} />
      </div>
    </section>
  );
}
