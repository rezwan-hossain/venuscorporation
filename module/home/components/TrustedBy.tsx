// module/home/components/TrustedBy.tsx
//
// Homepage "Trusted by" strip, right under the hero: a slow, endless scroll
// of client names (or logos), pausing on hover. CSS only — see the .module.css.
//
// Content: module/home/business/data.ts (`clients`). A client without a
// `logo` is shown as a serif wordmark with a small gold star.

import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import { Star } from "lucide-react";

import { clients } from "../business/data";
import styles from "./TrustedBy.module.css";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["600"], display: "swap" });

const NAVY = "#14245a";
const GOLD = "#c49a3c";

function ClientList({ copy = false }: { copy?: boolean }) {
  return (
    // The second copy is only for the seamless loop — hidden from screen readers.
    <ul className={`flex shrink-0 items-center ${copy ? styles.copy : ""}`} aria-hidden={copy || undefined}>
      {clients.map((c) => (
        <li key={c.name} className="flex items-center gap-3 px-8 sm:px-12">
          {c.logo ? (
            <Image src={c.logo} alt={copy ? "" : c.name} width={140} height={48} className="h-8 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0 sm:h-10" />
          ) : (
            <>
              <Star size={10} fill={GOLD} strokeWidth={0} className="shrink-0" aria-hidden />
              <span className={`${serif.className} text-2xl whitespace-nowrap text-slate-400 transition-colors hover:text-[#14245a] sm:text-[1.7rem]`}>{c.name}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function TrustedBy() {
  if (clients.length === 0) return null;

  return (
    <section aria-label="Clients who trust us" className="border-b py-10 sm:py-12" style={{ borderColor: `${GOLD}26` }}>
      <p className="mb-6 flex items-center justify-center gap-3 px-5 text-center text-[10px] font-semibold whitespace-nowrap uppercase tracking-[0.2em] sm:gap-4 sm:text-[11px] sm:tracking-[0.3em]" style={{ color: NAVY }}>
        <span className="h-px w-5 shrink-0 sm:w-12" style={{ background: GOLD }} aria-hidden />
        Trusted by leading companies
        <span className="h-px w-5 shrink-0 sm:w-12" style={{ background: GOLD }} aria-hidden />
      </p>

      <div className={styles.viewport}>
        <div className={styles.track}>
          <ClientList />
          <ClientList copy />
        </div>
      </div>
    </section>
  );
}
