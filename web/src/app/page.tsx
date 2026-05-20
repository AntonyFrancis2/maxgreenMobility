import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Accordion } from "@/components/Accordion";
import { MailtoForm } from "@/components/MailtoForm";
import { siteCardStackClass } from "@/lib/layoutTheme";
import { resolveHomeTileToProduct } from "@/lib/homeProducts";
import { getProductsRuntime, getSiteRuntime } from "@/lib/runtimeContent";

export const metadata: Metadata = {
  title: "Home",
  description: "Sustainable electric vehicles for modern businesses.",
};

function WhyChooseIcon({ name }: { name?: string }) {
  switch (name) {
    case "battery":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
          <path d="M22 11v2" strokeLinecap="round" />
          <path d="M9 10l-2 2h3l-2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "savings":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "customizable":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "heavy-duty":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 7v11a2 2 0 002 2h12a2 2 0 002-2V7M4 7a2 2 0 012-2h12a2 2 0 012 2M9 5V3a1 1 0 011-1h4a1 1 0 011 1v2M12 11v6M9 14h6" />
        </svg>
      );
    case "uptime":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "support":
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
  }
}

export default async function Home() {
  const [site, productsCatalog] = await Promise.all([getSiteRuntime(), getProductsRuntime()]);
  const home = site.home;
  const productItems = home.products.items ?? [];
  const stack = siteCardStackClass("start");

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-brand py-16 text-white sm:py-20">
        {home.hero.backgroundImage ? (
          <div className="pointer-events-none absolute inset-0 -z-10">
            <Image
              src={home.hero.backgroundImage}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_38%]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/55 via-brand/45 to-brand/85"
              aria-hidden
            />
          </div>
        ) : null}
        <Container className="relative space-y-6">
          <div className="max-w-2xl space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight drop-shadow-md sm:text-5xl">
              {home.hero.headline}
            </h1>
            <p className="text-white/95 drop-shadow-sm">{home.hero.subheadline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              href={home.hero.primaryCta.href}
              className="bg-white/18 text-white ring-1 ring-white/35 hover:bg-white/24"
            >
              {home.hero.primaryCta.label}
            </Button>
            <Button
              href={home.hero.secondaryCta.href}
              variant="ghost"
              className="ring-1 ring-white/45 hover:bg-white/15 text-white"
            >
              {home.hero.secondaryCta.label}
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{home.products.title}</h2>
            <p className="mt-2 text-sm text-muted">{home.products.subtitle}</p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 px-2">
            {productItems.map((p) => {
              const prod = resolveHomeTileToProduct(p, productsCatalog);
              const img = prod?.media?.mainImage;
              return (
                <Link
                  key={p.href}
                  href={p.href}
                  className={`w-full max-w-[280px] rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-[280px] sm:shrink-0 ${stack}`}
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-xl bg-brand/10 ring-1 ring-border/50">
                    {img ? (
                      <Image
                        src={img}
                        alt={p.label}
                        fill
                        sizes="280px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="h-full w-full bg-brand/15" />
                    )}
                  </div>
                  <div className="mt-4 text-sm font-bold">{p.label}</div>
                  <div className="mt-1 text-xs text-muted">View product details</div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{home.whyChoose.title}</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {home.whyChoose.items.map((it) => (
              <div key={it.title} className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${stack}`}>
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <WhyChooseIcon name={it.icon} />
                </div>
                <div className="mt-4 font-bold">{it.title}</div>
                <div className="mt-1 text-sm text-muted">{it.subtitle}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-10">
        {home.trustedBy?.items?.length ? (
          <Container>
            <div className="text-center">
              <h2 className="text-xl font-extrabold tracking-tight">{home.trustedBy.title}</h2>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {home.trustedBy.items.map((t: string) => (
                <div
                  key={t}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-foreground ring-1 ring-border"
                >
                  {t}
                </div>
              ))}
            </div>
          </Container>
        ) : null}
      </section>

      <section className="py-10">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{home.industries.title}</h2>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {home.industries.items.map((i: string) => (
              <div
                key={i}
                className={`rounded-[var(--radius-lg)] border border-border bg-surface p-4 text-sm font-semibold ${stack}`}
              >
                {i}
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface py-10">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{home.savings.title}</h2>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {home.savings.items.map((s) => (
              <div
                key={s.title}
                className={`rounded-[var(--radius-lg)] border border-border bg-gradient-to-br from-brand/10 via-white to-accent/5 p-5 ${stack}`}
              >
                <div className="text-xs font-semibold text-foreground/80">{s.title}</div>
                <div className="mt-2 text-2xl font-extrabold text-brand">{s.value}</div>
                <div className="mt-1 text-[11px] font-semibold text-foreground/70">{s.note}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{home.faq.title}</h2>
          </div>
          <div className="mx-auto mt-6 max-w-3xl">
            <Accordion items={home.faq.items} />
          </div>
        </Container>
      </section>

      <section className="bg-gradient-to-r from-brand to-accent py-12 text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{home.getInTouch.title}</h2>
            <p className="mt-2 text-sm text-white/85">{home.getInTouch.subtitle}</p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-[var(--radius-lg)] bg-white p-6 text-foreground shadow-lg" id="message">
            <MailtoForm
              toEmail="antonyfrancis2604@gmail.com"
              subjectPrefix="Website inquiry"
              submitLabel="Submit Inquiry"
              footerHint="We respond to inquiries within 24 hours during business days."
              fields={[
                {
                  kind: "text",
                  name: "name",
                  label: "Full Name*",
                  required: true,
                  placeholder: "Enter your full name",
                },
                {
                  kind: "text",
                  name: "company",
                  label: "Company Name*",
                  required: true,
                  placeholder: "Enter your company name",
                },
                {
                  kind: "email",
                  name: "email",
                  label: "Email Address*",
                  required: true,
                  placeholder: "you@company.com",
                },
                {
                  kind: "text",
                  name: "phone",
                  label: "Phone Number*",
                  required: true,
                  placeholder: "+91 98765 43210",
                },
                {
                  kind: "select",
                  name: "product",
                  label: "Product of Interest",
                  colSpan: 2,
                  options: productItems.map((p) => ({ label: p.label, value: p.label })),
                },
                {
                  kind: "textarea",
                  name: "message",
                  label: "Your Message*",
                  required: true,
                  colSpan: 2,
                  placeholder: "Tell us what you need...",
                },
              ]}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
