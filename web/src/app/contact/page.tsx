import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { siteCardStackClass, siteCardTitleRowClass } from "@/lib/layoutTheme";
import { Button } from "@/components/Button";
import { MailtoForm } from "@/components/MailtoForm";
import { getSiteRuntime } from "@/lib/runtimeContent";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Maxgreen Mobility for demos, quotes, and partnerships.",
};

export default async function ContactPage() {
  const site = await getSiteRuntime();
  const contact = site.contact;
  const cardContact = siteCardStackClass("start");
  const cardLocs = siteCardStackClass("start");
  const cardOther = siteCardStackClass("start");
  const titleLocs = siteCardTitleRowClass("start");

  return (
    <div>
      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">{contact.hero.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">{contact.hero.subtitle}</p>
        </Container>
      </section>

      <section className="py-12">
        <Container className="grid gap-4 md:grid-cols-3">
          {contact.cards.map((c) => (
            <div key={c.title} className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${cardContact}`}>
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                {c.title === "Call Us" ? "☎" : c.title === "Email Us" ? "✉" : "◷"}
              </div>
              <div className="mt-4 text-sm font-extrabold">{c.title}</div>
              <div className="mt-3 space-y-1 text-sm text-muted">
                {c.lines.map((l: string) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      <section className="pb-10">
        <Container>
          <h2 className="text-center text-2xl font-extrabold tracking-tight">{contact.locations.title}</h2>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {contact.locations.items.map((loc) => (
              <div key={loc.title} className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${cardLocs}`}>
                <div className={titleLocs}>
                  <span className="text-brand">⌂</span> {loc.title}
                </div>
                <div className="mt-4 space-y-1 text-sm text-muted">
                  {loc.lines.map((l: string) => (
                    <div key={l}>{l}</div>
                  ))}
                </div>
                <div className="mt-4 space-y-1 text-sm">
                  <div>
                    <span className="text-muted">Email:</span>{" "}
                    <a className="font-semibold text-foreground hover:text-brand" href={`mailto:${loc.email}`}>
                      {loc.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted">Phone:</span>{" "}
                    <a className="font-semibold text-foreground hover:text-brand" href={`tel:${loc.phone}`}>
                      {loc.phone}
                    </a>
                  </div>
                </div>
                <div className="mt-6 rounded-[var(--radius-lg)] bg-[#f1f5f9] p-6 text-center text-xs font-semibold text-muted">
                  Interactive Map
                  <div className="mt-1 text-[11px] font-normal text-muted">
                    Replace this block with an embedded map when ready.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-gradient-to-r from-brand to-accent py-12 text-white" id="message">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight">{contact.form.title}</h2>
            <p className="mt-2 text-sm text-white/85">{contact.form.subtitle}</p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-[var(--radius-lg)] bg-white p-6 text-foreground shadow-lg">
            <MailtoForm
              toEmail="info@maxgreenmobility.com"
              subjectPrefix="Website inquiry"
              submitLabel="Send Message"
              footerHint="By submitting this form, you agree to our privacy policy and terms of service."
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
                  placeholder: "your@email.com",
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
                  label: "Product of Interest*",
                  required: true,
                  options: (site.home.products.items ?? []).map((p) => ({
                    label: p.label,
                    value: p.label,
                  })),
                },
                {
                  kind: "text",
                  name: "quantity",
                  label: "Estimated Quantity",
                  placeholder: "e.g., 10",
                },
                {
                  kind: "text",
                  name: "industry",
                  label: "Industry",
                  placeholder: "Select your industry",
                },
                {
                  kind: "text",
                  name: "inquiryType",
                  label: "Inquiry Type",
                  placeholder: "Select inquiry type",
                },
                {
                  kind: "textarea",
                  name: "message",
                  label: "Your Message*",
                  required: true,
                  colSpan: 2,
                  placeholder: "Please provide details about your requirements...",
                },
                {
                  kind: "radio",
                  name: "preferred",
                  label: "Preferred Contact Method",
                  colSpan: 2,
                  defaultValue: "Email",
                  options: [
                    { label: "Email", value: "Email" },
                    { label: "Phone Call", value: "Phone call" },
                    { label: "WhatsApp", value: "WhatsApp" }
                  ]
                }
              ]}
            />
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <h2 className="text-center text-2xl font-extrabold tracking-tight">{contact.otherWays.title}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {contact.otherWays.items.map((it) => (
              <div key={it.title} className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${cardOther}`}>
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                  {it.title.includes("WhatsApp") ? "💬" : it.title.includes("Schedule") ? "📅" : "🤝"}
                </div>
                <div className="mt-4 font-extrabold">{it.title}</div>
                <div className="mt-1 text-sm text-muted">{it.subtitle}</div>
                <div className="mt-4">
                  <Button href={it.href} variant="ghost" className="text-brand hover:bg-brand/10">
                    {it.actionLabel}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}

