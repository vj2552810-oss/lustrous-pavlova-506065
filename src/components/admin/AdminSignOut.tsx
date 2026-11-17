"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export function AdminSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/admin/logout", { method: "POST" });
        } finally {
          router.refresh();
          setBusy(false);
        }
      }}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 hover:border-red-300 hover:text-red-700 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogOut className="h-4 w-4" aria-hidden="true" />}
      End staff session
    </button>
  );
}
