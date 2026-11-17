import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Info, Mail, Phone } from "lucide-react";
import { AdvancedEnquiryForm } from "@/components/AdvancedEnquiryForm";
import { TourCard } from "@/components/tours/TourCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SERVICES, findService } from "@/lib/services";
import { listTours } from "@/lib/tours/service";
import { SITE, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = findService(slug);
  if (!s) return { title: "Service not found" };
  return {
    title: `${s.name} — PRITIVO`,
    description: `${s.tagline}. ${s.description.slice(0, 140)}…`,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title: `${s.name} — PRITIVO`, description: s.description.slice(0, 160), images: [{ url: s.image }] },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) notFound();

  const filters = service.relatedTourFilters;
  const tours = Object.keys(filters).length
    ? (await listTours(filters).catch(() => [])).slice(0, 3)
    : [];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink pb-14 pt-32 text-white">
        <Image src={service.image} alt={service.imageAlt} fill priority sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/60 to-ink" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="hover:text-gold">Home</Link></li><li aria-hidden="true">/</li>
              <li><Link href="/services" className="hover:text-gold">Services</Link></li><li aria-hidden="true">/</li>
              <li className="text-white">{service.name}</li>
            </ol>
          </nav>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-medium leading-tight sm:text-6xl">{service.name}</h1>
          <p className="mt-3 text-xl text-gold">{service.tagline}</p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white">{service.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#enquire" className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold text-ink">
              Enquire about this service <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href={whatsappLink(`Hello PRITIVO! I'd like to know more about your ${service.name} service.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white">
              <WhatsAppIcon className="h-4 w-4" /> {SITE.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-14">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-2xl">What you get</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {service.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 rounded-2xl bg-ivory/70 px-4 py-2.5 text-sm text-neutral-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
              <h2 className="font-serif text-2xl">How it works</h2>
              <ol className="mt-4 space-y-4">
                {service.howItWorks.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-gold">{i + 1}</span>
                    <p className="pt-1.5 text-sm leading-6 text-neutral-600">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-gold/30 bg-champagne/30 p-6">
              <h2 className="flex items-center gap-2 font-serif text-xl"><Info className="h-5 w-5 text-gold-dark" aria-hidden="true" /> Terms for this service</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{service.terms}</p>
              <p className="mt-3 text-xs text-neutral-500">
                Full terms are stated in your written quotation. See our{" "}
                <Link href="/terms" className="underline">Terms &amp; Conditions</Link> and{" "}
                <Link href="/cancellation-refund-policy" className="underline">Cancellation &amp; Refund Policy</Link>.
              </p>
            </div>

            {tours.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl">Related tours</h2>
                <ul className="mt-4 grid gap-5 sm:grid-cols-2">
                  {tours.map((t) => <li key={t.slug}><TourCard tour={t} /></li>)}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:col-span-5">
            <div id="enquire" className="scroll-mt-28 space-y-4 lg:sticky lg:top-24">
              <AdvancedEnquiryForm defaultService={service.name} heading={`Enquire — ${service.name}`} subheading="Share your dates and preferences; no account needed." />
              <div className="rounded-3xl border border-black/5 bg-white p-6">
                <h2 className="font-serif text-xl">Other ways to reach us</h2>
                <div className="mt-3 space-y-2 text-sm">
                  <a href={whatsappLink(`Hello PRITIVO! Enquiry about ${service.name}.`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 font-semibold text-white"><WhatsAppIcon className="h-4 w-4" /> WhatsApp {SITE.phoneDisplay}</a>
                  <a href={mailtoLink(`${service.name} enquiry`)} className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 font-medium hover:border-gold"><Mail className="h-4 w-4" aria-hidden="true" /> {SITE.email}</a>
                  <a href={telLink} className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2.5 font-medium hover:border-gold"><Phone className="h-4 w-4" aria-hidden="true" /> Call us</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
