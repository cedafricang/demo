import { Wordmark } from "./Header";
import { contactDetails } from "@/lib/process";

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-page flex flex-col gap-10 py-16 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-2xl">
            <Wordmark tone="light" />
          </span>
          <p className="mt-4 max-w-[260px] font-body text-[13px] leading-relaxed text-stone/70">
            A listening room with a counter at the back. Buying is the
            consequence of hearing.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-10 gap-y-6 font-body text-[13px] text-stone/80 sm:flex sm:gap-14">
          <div>
            <p className="eyebrow-smoke text-stone/45">Visit</p>
            <p className="mt-2 leading-relaxed">
              17 Adeyemo Alakija Street
              <br />
              Victoria Island, Lagos
            </p>
          </div>
          <div>
            <p className="eyebrow-smoke text-stone/45">Hours</p>
            <p className="mt-2 leading-relaxed">{contactDetails.hours}</p>
          </div>
          <div>
            <p className="eyebrow-smoke text-stone/45">Reach Us</p>
            <p className="mt-2 leading-relaxed">
              {contactDetails.email}
              <br />
              {contactDetails.whatsapp}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-2 py-6 text-stone/45 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-eyebrow">
            © {new Date().getFullYear()} Soundhous Experience Centre
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-eyebrow text-bronze/80">
            A Brand Expression by CED Africa
          </p>
        </div>
      </div>
    </footer>
  );
}
