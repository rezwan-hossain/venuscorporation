// components/layout/WhatsAppButton.tsx
//
// Floating "Chat on WhatsApp" button, bottom-right on every page (added in
// AppLayout). Opens WhatsApp with a friendly message already typed.
//   - WhatsApp-green circle with the logo and a soft pulse ring
//   - Large screens: a label card slides out to the left on hover / focus
// Server component, no JavaScript. The number lives in
// module/contact/contact-details.ts (`whatsapp`).

import { contactDetails } from "@/module/contact/contact-details";

const MESSAGE =
  "Hi Venus Corporation! I'd like to know more about your events.";

/** The WhatsApp logo (simple-icons, CC0). */
function WhatsAppLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  const href = `${contactDetails.whatsapp.href}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Venus Corporation on WhatsApp"
      className="group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center outline-none sm:right-6 sm:bottom-6"
    >
      {/* Label card — slides out on hover / keyboard focus (large screens) */}
      <span className="pointer-events-none mr-3 hidden translate-x-2 rounded-2xl border border-[#c49a3c]/30 bg-white px-4 py-2.5 text-right opacity-0 shadow-xl shadow-[#14245a]/15 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 lg:block">
        <span className="block text-sm font-semibold whitespace-nowrap text-[#14245a]">
          Chat with us on WhatsApp
        </span>
        <span className="mt-0.5 flex items-center justify-end gap-1.5 text-xs whitespace-nowrap text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" aria-hidden />
          Typically replies within an hour
        </span>
      </span>

      {/* The round button */}
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 ring-1 ring-[#dcb45c] ring-offset-2 ring-offset-white transition duration-300 group-hover:scale-105 group-hover:bg-[#1ebe5b] group-hover:ring-[#c49a3c] group-focus-visible:ring-[#14245a]">
        {/* Soft pulse ring (off for reduced motion) */}
        <span
          className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.5s] motion-reduce:hidden"
          aria-hidden
        />
        <WhatsAppLogo className="relative h-7 w-7" />
      </span>
    </a>
  );
}
