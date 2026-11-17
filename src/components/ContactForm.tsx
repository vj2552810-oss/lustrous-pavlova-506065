"use client";

import { useState, type ChangeEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Field, inputCls } from "./FormField";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { mailtoLink, whatsappLink } from "@/lib/site";
import { buildContactMessage, validateContact, type ContactEnquiry, type FieldErrors } from "@/lib/validation";

const empty: ContactEnquiry = { name: "", email: "", phone: "", subject: "", message: "" };
type Channel = "whatsapp" | "email";

export function ContactForm() {
  const [data, setData] = useState<ContactEnquiry>(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [honeypot, setHoneypot] = useState("");

  const set = (k: keyof ContactEnquiry) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData((d) => ({ ...d, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: "" }));
  };
  const aria = (k: string) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `c-${k}-error` : undefined,
  });

  const message = buildContactMessage(data);
  const waUrl = whatsappLink(message);
  const mailUrl = mailtoLink(data.subject || "Website enquiry", message);

  async function submit(via: Channel) {
    const errs = validateContact(data);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("error");
      document.getElementById(`c-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setChannel(via);
    setStatus("submitting");
    if (via === "whatsapp") window.open(waUrl, "_blank", "noopener,noreferrer");
    else window.location.href = mailUrl;
    try {
      await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", ...data, website: honeypot }),
      });
    } catch {
      /* WhatsApp / email is the primary channel; backup save is best-effort */
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-black/5 bg-white p-8 text-center shadow-[0_30px_60px_-35px_rgba(0,0,0,0.35)] sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-gold" aria-hidden="true" />
        <h3 className="mt-4 font-serif text-3xl">Message ready to send</h3>
        <p className="mt-3 text-neutral-600">
          We&apos;ve opened {channel === "whatsapp" ? "WhatsApp" : "your email app"} with your message. Please press send — we usually reply as soon as possible during business hours.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white">
            <WhatsAppIcon /> Open WhatsApp
          </a>
          <a href={mailUrl} className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-5 py-3 font-semibold">
            <Mail className="h-5 w-5" aria-hidden="true" /> Open Email
          </a>
        </div>
        <button type="button" onClick={() => { setData(empty); setStatus("idle"); }} className="mt-6 text-sm font-medium text-gold-dark hover:underline">
          Send another message
        </button>
      </div>
    );
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit("whatsapp");
      }}
      className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.35)] sm:p-10"
      aria-labelledby="contact-form-title"
    >
      <h2 id="contact-form-title" className="font-serif text-3xl">Send us a message</h2>
      {status === "error" && errorCount > 0 && (
        <div role="alert" className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> Please correct the highlighted fields.
        </div>
      )}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} aria-label="Website" />
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field id="c-name" label="Full name" required error={errors.name} className="sm:col-span-2">
          <input id="c-name" autoComplete="name" value={data.name} onChange={set("name")} className={inputCls(!!errors.name)} {...aria("name")} />
        </Field>
        <Field id="c-email" label="Email" required error={errors.email}>
          <input id="c-email" type="email" autoComplete="email" value={data.email} onChange={set("email")} className={inputCls(!!errors.email)} {...aria("email")} />
        </Field>
        <Field id="c-phone" label="Phone" required error={errors.phone}>
          <input id="c-phone" type="tel" autoComplete="tel" value={data.phone} onChange={set("phone")} className={inputCls(!!errors.phone)} {...aria("phone")} />
        </Field>
        <Field id="c-subject" label="Subject" required error={errors.subject} className="sm:col-span-2">
          <input id="c-subject" value={data.subject} onChange={set("subject")} className={inputCls(!!errors.subject)} placeholder="e.g. Family trip to Kerala in December" {...aria("subject")} />
        </Field>
        <Field id="c-message" label="Message" required error={errors.message} className="sm:col-span-2">
          <textarea id="c-message" rows={5} maxLength={1500} value={data.message} onChange={set("message")} className={inputCls(!!errors.message)} {...aria("message")} />
        </Field>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button type="submit" disabled={status === "submitting"} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-70">
          {status === "submitting" && channel === "whatsapp" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <WhatsAppIcon />}
          Send via WhatsApp
        </button>
        <button type="button" onClick={() => submit("email")} disabled={status === "submitting"} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 font-semibold text-white transition hover:bg-gold hover:text-ink disabled:opacity-70">
          {status === "submitting" && channel === "email" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
          Send via Email
        </button>
      </div>
    </form>
  );
}
