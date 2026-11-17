"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { CONTINENTS, STYLE_LABELS, TOUR_TYPE_LABELS, type TourType } from "@/lib/tours/constants";
import type { TourRecord } from "@/lib/tours/service";

const input = (invalid?: string) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-4 ${
    invalid ? "border-red-400 focus:ring-red-100" : "border-neutral-200 focus:border-gold focus:ring-gold/15"
  }`;
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500";

interface FormState {
  name: string;
  slug: string;
  type: TourType;
  city: string;
  country: string;
  continent: string;
  summary: string;
  description: string;
  durationDays: string;
  durationNights: string;
  priceFromINR: string;
  priceVerified: boolean;
  heroImage: string;
  heroImageAlt: string;
  highlights: string;
  inclusions: string;
  exclusions: string;
  travelTips: string;
  styles: string;
  bestTime: string;
  published: boolean;
  featured: boolean;
  itinerary: string;
}

function toForm(tour?: TourRecord): FormState {
  return {
    name: tour?.name ?? "",
    slug: tour?.slug ?? "",
    type: (tour?.type as TourType) ?? "domestic",
    city: tour?.city ?? "",
    country: tour?.country ?? "India",
    continent: tour?.continent ?? "Asia",
    summary: tour?.summary ?? "",
    description: tour?.description ?? "",
    durationDays: String(tour?.durationDays ?? 6),
    durationNights: String(tour?.durationNights ?? 5),
    priceFromINR: tour?.priceFromINR ? String(tour.priceFromINR) : "",
    priceVerified: tour?.priceVerified ?? false,
    heroImage: tour?.heroImage ?? "",
    heroImageAlt: tour?.heroImageAlt ?? "",
    highlights: (tour?.highlights ?? []).join("\n"),
    inclusions: (tour?.inclusions ?? []).join("\n"),
    exclusions: (tour?.exclusions ?? []).join("\n"),
    travelTips: (tour?.travelTips ?? []).join("\n"),
    styles: (tour?.styles ?? []).join(", "),
    bestTime: tour?.bestTime ?? "",
    published: tour?.published ?? true,
    featured: tour?.featured ?? false,
    itinerary: (tour?.itinerary ?? []).map((d) => `${d.title} | ${d.description}`).join("\n"),
  };
}

export function TourEditor({ tour }: { tour?: TourRecord }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toForm(tour));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: "" }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const itinerary = form.itinerary
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const [title, ...rest] = line.split("|");
        return { day: i + 1, title: title.trim(), description: rest.join("|").trim() };
      });

    const payload = {
      ...form,
      durationDays: Number(form.durationDays),
      durationNights: Number(form.durationNights),
      priceFromINR: form.priceFromINR === "" ? null : Number(form.priceFromINR),
      styles: form.styles.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
      itinerary,
    };

    try {
      const res = await fetch(tour ? `/api/admin/tours/${tour.id}` : "/api/admin/tours", {
        method: tour ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) setErrors(json.errors);
        else setFormError(json.error ?? "Could not save the tour.");
        setSaving(false);
        return;
      }
      router.push("/admin?tab=tours");
      router.refresh();
    } catch {
      setFormError("Network error — please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin?tab=tours" className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to tour manager
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="bg-gold-gradient inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-ink disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {saving ? "Saving…" : tour ? "Save changes" : "Create tour"}
        </button>
      </div>

      {formError && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {formError}
        </div>
      )}

      <section className="rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="font-serif text-2xl">Basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="t-name" className={label}>Tour name</label>
            <input id="t-name" value={form.name} onChange={set("name")} className={input(errors.name)} />
            {errors.name && <p role="alert" className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="t-slug" className={label}>URL slug <span className="font-normal normal-case text-neutral-500">(auto if blank)</span></label>
            <input id="t-slug" value={form.slug} onChange={set("slug")} className={input(errors.slug)} placeholder="e.g. ladakh" />
            {errors.slug && <p role="alert" className="mt-1 text-xs text-red-600">{errors.slug}</p>}
          </div>
          <div>
            <label htmlFor="t-type" className={label}>Collection</label>
            <select id="t-type" value={form.type} onChange={set("type")} className={input(errors.type)}>
              {(Object.keys(TOUR_TYPE_LABELS) as TourType[]).map((t) => <option key={t} value={t}>{TOUR_TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="t-city" className={label}>Cities / region</label>
            <input id="t-city" value={form.city} onChange={set("city")} className={input()} placeholder="Srinagar · Gulmarg" />
          </div>
          <div>
            <label htmlFor="t-country" className={label}>Country</label>
            <input id="t-country" value={form.country} onChange={set("country")} className={input(errors.country)} />
            {errors.country && <p role="alert" className="mt-1 text-xs text-red-600">{errors.country}</p>}
          </div>
          <div>
            <label htmlFor="t-continent" className={label}>Continent</label>
            <select id="t-continent" value={form.continent} onChange={set("continent")} className={input(errors.continent)}>
              {CONTINENTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="t-days" className={label}>Days</label>
              <input id="t-days" type="number" min={1} max={60} value={form.durationDays} onChange={set("durationDays")} className={input(errors.durationDays)} />
              {errors.durationDays && <p role="alert" className="mt-1 text-xs text-red-600">{errors.durationDays}</p>}
            </div>
            <div>
              <label htmlFor="t-nights" className={label}>Nights</label>
              <input id="t-nights" type="number" min={0} max={59} value={form.durationNights} onChange={set("durationNights")} className={input(errors.durationNights)} />
              {errors.durationNights && <p role="alert" className="mt-1 text-xs text-red-600">{errors.durationNights}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="t-best" className={label}>Best time to travel</label>
            <input id="t-best" value={form.bestTime} onChange={set("bestTime")} className={input()} placeholder="October–March" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="t-summary" className={label}>Card summary</label>
            <textarea id="t-summary" rows={2} value={form.summary} onChange={set("summary")} className={input(errors.summary)} />
            {errors.summary && <p role="alert" className="mt-1 text-xs text-red-600">{errors.summary}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="t-description" className={label}>Full description</label>
            <textarea id="t-description" rows={4} value={form.description} onChange={set("description")} className={input()} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="font-serif text-2xl">Pricing &amp; visibility</h2>
        <p className="mt-1 text-xs text-neutral-500">
          Leave the price blank to show “Request a Quote”. Only mark a price verified once it is confirmed with suppliers —
          guests see verified prices as “from, per person”.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="t-price" className={label}>Indicative price from (INR per person)</label>
            <input id="t-price" type="number" min={0} step={500} value={form.priceFromINR} onChange={set("priceFromINR")} className={input(errors.priceFromINR)} placeholder="Leave blank for Request a Quote" />
            {errors.priceFromINR && <p role="alert" className="mt-1 text-xs text-red-600">{errors.priceFromINR}</p>}
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={form.priceVerified} onChange={set("priceVerified")} className="h-4 w-4 accent-[#c6a866]" /> Price verified (show publicly)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={form.published} onChange={set("published")} className="h-4 w-4 accent-[#c6a866]" /> Published (visible to guests)
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={form.featured} onChange={set("featured")} className="h-4 w-4 accent-[#c6a866]" /> Featured on the home page
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="font-serif text-2xl">Images &amp; tags</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="t-image" className={label}>Hero image URL</label>
            <input id="t-image" value={form.heroImage} onChange={set("heroImage")} className={input(errors.heroImage)} placeholder="https://…" />
            {errors.heroImage && <p role="alert" className="mt-1 text-xs text-red-600">{errors.heroImage}</p>}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="t-imagealt" className={label}>Image alt text (accessibility)</label>
            <input id="t-imagealt" value={form.heroImageAlt} onChange={set("heroImageAlt")} className={input()} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="t-styles" className={label}>Travel styles (comma separated)</label>
            <input id="t-styles" value={form.styles} onChange={set("styles")} className={input()} placeholder="honeymoon, luxury, beach" />
            <p className="mt-1 text-xs text-neutral-500">Valid keys: {Object.keys(STYLE_LABELS).join(", ")}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-black/5 bg-white p-6">
        <h2 className="font-serif text-2xl">Content</h2>
        <p className="mt-1 text-xs text-neutral-500">One item per line. Itinerary lines use “Title | Description”.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="t-highlights" className={label}>Highlights</label>
            <textarea id="t-highlights" rows={5} value={form.highlights} onChange={set("highlights")} className={input(errors.highlights)} />
            {errors.highlights && <p role="alert" className="mt-1 text-xs text-red-600">{errors.highlights}</p>}
          </div>
          <div>
            <label htmlFor="t-tips" className={label}>Travel tips</label>
            <textarea id="t-tips" rows={5} value={form.travelTips} onChange={set("travelTips")} className={input()} />
          </div>
          <div>
            <label htmlFor="t-inclusions" className={label}>Inclusions</label>
            <textarea id="t-inclusions" rows={5} value={form.inclusions} onChange={set("inclusions")} className={input()} />
          </div>
          <div>
            <label htmlFor="t-exclusions" className={label}>Exclusions</label>
            <textarea id="t-exclusions" rows={5} value={form.exclusions} onChange={set("exclusions")} className={input()} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="t-itinerary" className={label}>Itinerary — one day per line</label>
            <textarea id="t-itinerary" rows={7} value={form.itinerary} onChange={set("itinerary")} className={input()} placeholder={"Arrive Srinagar | Private transfer and an evening shikara ride"} />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="bg-gold-gradient inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-ink disabled:opacity-70"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
        {saving ? "Saving…" : tour ? "Save changes" : "Create tour"}
      </button>
    </form>
  );
}
