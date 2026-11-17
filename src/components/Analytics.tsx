import Script from "next/script";

/**
 * Google Analytics — only rendered when NEXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * Nothing is loaded (and no data sent) until you add a measurement ID.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive" />
      <Script id="pritivo-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)}, { anonymize_ip: true });`}
      </Script>
    </>
  );
}
