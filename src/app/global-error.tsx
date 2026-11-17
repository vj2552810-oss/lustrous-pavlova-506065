"use client";

import { AlertTriangle } from "lucide-react";

/** Last-resort boundary (root layout failures). Keeps its own minimal markup. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#071629", color: "#fff", fontFamily: "Inter, Arial, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ maxWidth: 460 }}>
            <AlertTriangle size={40} color="#c6a866" aria-hidden="true" />
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, margin: "16px 0 8px" }}>PRITIVO — something went wrong</h1>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
              The site could not render this page. No booking or payment has been made. Please reload, or contact us on
              WhatsApp +91 78923 37596 / vj2552810@gmail.com.
            </p>
            {error.digest && <p style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Reference: {error.digest}</p>}
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 20, background: "#c6a866", color: "#071629", border: 0, borderRadius: 999, padding: "12px 24px", fontWeight: 600, cursor: "pointer" }}
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
