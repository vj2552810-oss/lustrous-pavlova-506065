import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact PRITIVO — Travel Agency in Belagavi",
  description: `Call, WhatsApp or email PRITIVO for holiday packages from Belagavi. Phone & WhatsApp ${SITE.phoneDisplay}, email ${SITE.email}.`,
  alternates: { canonical: "/contact" },
};

function ContactCard({ icon, label, value, href, cta, external }: { icon: ReactNode; label: string; value: string; href?: string; cta?: string; external?: boolean }) {
  const inner = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-gold">{icon}</span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</span>
        <span className="mt-1 block break-words font-serif text-xl text-ink">{value}</span>
        {cta && <span className="mt-1 block text-sm font-medium text-gold-dark">{cta} →</span>}
      </span>
    </>
  );
  const cls = "flex items-start gap-4 rounded-3xl border border-black/5 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg";
  return href ? (
    <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={<>Let&apos;s start a <span className="text-gold-gradient italic">conversation.</span></>}
        description="Questions, ideas or a destination in mind? Reach us on WhatsApp, phone or email — whichever suits you."
      />
      <section className="bg-ivory py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <ContactCard icon={<Phone className="h-5 w-5" />} label="Phone" value={SITE.phoneDisplay} href={telLink} cta="Tap to call" />
            <ContactCard icon={<WhatsAppIcon className="h-5 w-5" />} label="WhatsApp" value={SITE.phoneDisplay} href={whatsappLink("Hello PRITIVO! I'd like help planning a trip.")} cta="Start a chat" external />
            <ContactCard icon={<Mail className="h-5 w-5" />} label="Email" value={SITE.email} href={mailtoLink("Travel enquiry")} cta="Write to us" />
            <ContactCard icon={<MapPin className="h-5 w-5" />} label="Location" value={SITE.location} />
            <div className="overflow-hidden rounded-3xl border border-black/5">
              <iframe
                title="Map of Belagavi, Karnataka"
                src="https://www.google.com/maps?q=Belagavi,Karnataka,India&output=embed"
                className="h-64 w-full grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="px-2 text-xs text-neutral-500">
              PRITIVO is an online travel agency. Meetings in Belagavi are by appointment — message us to arrange one.
            </p>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
