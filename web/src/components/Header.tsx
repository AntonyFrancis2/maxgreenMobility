"use client";

import { useState, useEffect } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auto-close menu when path changes (i.e. user clicks a link)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

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

        <div className="flex items-center gap-2 md:hidden">
          <a
            className="rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 ring-border bg-surface hover:bg-surface/60 text-foreground/80 transition-colors"
            href={`tel:${site.topRight.phoneValue}`}
          >
            Call
          </a>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-foreground hover:bg-surface focus:outline-none transition-colors"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-16 z-20 bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 z-30 border-b border-border bg-white shadow-lg md:hidden animate-slide-down">
          <nav className="flex flex-col p-4 space-y-2">
            {site.nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base font-semibold px-3 py-2.5 rounded-lg transition-colors ${
                    active
                      ? "bg-brand/10 text-brand"
                      : "text-foreground/80 hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="border-t border-border mt-3 pt-4 px-3">
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-border">
                  ☎
                </span>
                <div className="flex flex-col">
                  <span className="text-xs text-foreground/50">Contact Us</span>
                  <a
                    className="text-base text-foreground hover:text-brand transition-colors"
                    href={`tel:${site.topRight.phoneValue}`}
                  >
                    {site.topRight.phoneLabel}
                  </a>
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}


