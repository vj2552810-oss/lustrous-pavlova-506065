import { WhatsAppIcon } from "./WhatsAppIcon";
import { whatsappLink } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Hello PRITIVO! I'd like help planning a trip.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with PRITIVO on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-7 sm:right-7"
    >
      <span className="hidden rounded-full bg-ink px-4 py-2 text-sm text-white shadow-xl transition group-hover:opacity-100 sm:block sm:opacity-0">
        Chat with us
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/30 transition group-hover:scale-105">
        <span className="animate-pulse-ring absolute inset-0 rounded-full bg-[#25D366]" aria-hidden="true" />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
    </a>
  );
}
