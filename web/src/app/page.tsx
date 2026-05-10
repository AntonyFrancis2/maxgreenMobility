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
                  ✓
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
