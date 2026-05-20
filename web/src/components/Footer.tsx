import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";
import type { SiteConfig } from "@/lib/site";

export function Footer({ site }: { site: Pick<SiteConfig, "brand" | "footer"> }) {
  return (
    <footer className="mt-16 border-t border-border bg-[#0b1220] text-white">
      <Container className="grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <div className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-sm bg-[#0a3525]">
            <Image
              src="/media/maxgreenLogo_v2.png"
              alt={`${site.brand.name} logo`}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
          <div className="text-sm font-extrabold tracking-tight">{site.brand.logoText}</div>
          <p className="text-sm text-white/70">{site.footer.about}</p>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-bold">Quick Links</div>
          <ul className="space-y-2 text-sm text-white/70">
            {site.footer.quickLinks.map((l) => (
              <li key={l.href}>
                <Link className="hover:text-white" href={l.href}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-bold">Contact</div>
          <ul className="space-y-2 text-sm text-white/70">
            {site.footer.contact.map((c) => (
              <li key={c.label}>
                <span className="text-white/50">{c.label}:</span>{" "}
                {c.href ? (
                  <a className="hover:text-white" href={c.href}>
                    {c.value}
                  </a>
                ) : (
                  c.value
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-bold">Office Address</div>
          <ul className="space-y-1 text-sm text-white/70">
            {site.footer.officeAddress.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-4">
        <Container className="text-xs text-white/60">{site.footer.copyright}</Container>
      </div>
    </footer>
  );
}

