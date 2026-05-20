"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import type { SiteConfig } from "@/lib/site";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Header({ site }: { site: Pick<SiteConfig, "brand" | "nav" | "topRight"> }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 leading-none">
            <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border shadow-sm bg-[#0a3525]">
              <Image
                src="/media/maxgreenLogo_v2.png"
                alt={`${site.brand.name} logo`}
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </span>
            <span className="font-extrabold tracking-tight text-sm text-foreground">{site.brand.logoText}</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {site.nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-colors ${
                  active ? "text-brand" : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 text-sm font-semibold text-foreground/80 md:flex">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface ring-1 ring-border">
            ☎
          </span>
          <a className="hover:text-foreground" href={`tel:${site.topRight.phoneValue}`}>
            {site.topRight.phoneLabel}
          </a>
        </div>

        <div className="md:hidden">
          <a
            className="rounded-lg px-3 py-2 text-sm font-semibold ring-1 ring-border hover:bg-surface/60"
            href={`tel:${site.topRight.phoneValue}`}
          >
            Call
          </a>
        </div>
      </Container>
    </header>
  );
}

