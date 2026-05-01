"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { AdminField } from "@/components/AdminField";
import { AdminObjectList, AdminStringList } from "@/components/AdminList";
import type { Product, SiteConfig, ThemePresetId } from "@/lib/site";

type TabId = "brandNavFooter" | "home" | "about" | "solutionsProducts" | "contact" | "theme";

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

export default function AdminEditPage() {
  const [site, setSite] = useState<SiteConfig | null>(null);
  const [tab, setTab] = useState<TabId>("brandNavFooter");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [products, setProducts] = useState<{ filename: string; json: Product | null }[]>([]);
  const [activeProductFile, setActiveProductFile] = useState<string>("");
  const [productSaving, setProductSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/site");
      if (!res.ok) {
        setStatus("Not authorized. Please login again.");
        return;
      }
      const data = (await res.json()) as SiteConfig;
      setSite(deepClone(data));

      const pres = await fetch("/api/admin/products");
      if (pres.ok) {
        const p = (await pres.json()) as { files: { filename: string; json: Product | null }[] };
        setProducts(p.files);
        setActiveProductFile(p.files.find((f) => f.filename.endsWith(".json"))?.filename ?? "");
      }
    })();
  }, []);

  const preview = useMemo(() => site, [site]);

  if (!site) {
    return (
      <div className="py-10">
        <Container className="text-center text-sm text-muted">Loading editor…</Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-extrabold">Edit Website Content</div>
            <div className="text-sm text-muted">
              Edit all blocks across all pages, then click Save.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
            >
              Logout
            </Button>
            <Button
              onClick={async () => {
                setSaving(true);
                setStatus(null);
                try {
                  const res = await fetch("/api/admin/site", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(site),
                  });
                  if (!res.ok) {
                    setStatus(await res.text());
                    return;
                  }
                  const data = (await res.json()) as {
                    site?: SiteConfig;
                    createdProductIds?: string[];
                  };
                  if (data.site) {
                    setSite(deepClone(data.site));
                  }
                  const created = data.createdProductIds?.length
                    ? ` New JSON: ${data.createdProductIds.join(", ")} — edit details under Solutions → Products.`
                    : "";
                  setStatus(`Saved site.${created} Refresh if needed.`.trim());

                  const pres = await fetch("/api/admin/products");
                  if (pres.ok) {
                    const p = (await pres.json()) as {
                      files: { filename: string; json: Product | null }[];
                    };
                    setProducts(p.files);
                    setActiveProductFile((cur) =>
                      p.files.some((f) => f.filename === cur) ? cur : (p.files[0]?.filename ?? "")
                    );
                  }
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving…" : "Save Site"}
            </Button>
          </div>
        </div>

        {status ? (
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-sm">
            {status}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
              {(
                [
                  ["brandNavFooter", "Brand/Nav/Footer"],
                  ["home", "Home"],
                  ["about", "About"],
                  ["solutionsProducts", "Solutions (Products)"],
                  ["contact", "Contact"],
                  ["theme", "Theme"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    tab === id ? "bg-brand text-white" : "bg-white/80 ring-1 ring-border hover:bg-white/90"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              {tab === "brandNavFooter" ? (
                <>
                  <div className="text-sm font-extrabold">Brand</div>
                  <AdminField
                    label="Brand name"
                    value={site.brand.name}
                    onChange={(v) => setSite((s) => (s ? { ...s, brand: { ...s.brand, name: v } } : s))}
                  />
                  <AdminField
                    label="Logo text"
                    value={site.brand.logoText}
                    onChange={(v) =>
                      setSite((s) => (s ? { ...s, brand: { ...s.brand, logoText: v } } : s))
                    }
                  />

                  <div className="text-sm font-extrabold">Top right</div>
                  <AdminField
                    label="Phone label"
                    value={site.topRight.phoneLabel}
                    onChange={(v) =>
                      setSite((s) => (s ? { ...s, topRight: { ...s.topRight, phoneLabel: v } } : s))
                    }
                  />
                  <AdminField
                    label="Phone value (tel:)"
                    value={site.topRight.phoneValue}
                    onChange={(v) =>
                      setSite((s) => (s ? { ...s, topRight: { ...s.topRight, phoneValue: v } } : s))
                    }
                  />

                  <AdminObjectList
                    label="Navigation links"
                    items={site.nav}
                    onChange={(next) => setSite((s) => (s ? { ...s, nav: next } : s))}
                    newItem={() => ({ label: "New Link", href: "/" })}
                    schema={[
                      { key: "label", label: "Label" },
                      { key: "href", label: "Href" },
                    ]}
                  />

                  <div className="text-sm font-extrabold">Footer</div>
                  <AdminField
                    label="Footer about"
                    textarea
                    value={site.footer.about}
                    onChange={(v) =>
                      setSite((s) => (s ? { ...s, footer: { ...s.footer, about: v } } : s))
                    }
                  />
                  <AdminObjectList
                    label="Quick links"
                    items={site.footer.quickLinks}
                    onChange={(next) =>
                      setSite((s) => (s ? { ...s, footer: { ...s.footer, quickLinks: next } } : s))
                    }
                    newItem={() => ({ label: "Link", href: "/" })}
                    schema={[
                      { key: "label", label: "Label" },
                      { key: "href", label: "Href" },
                    ]}
                  />
                  <AdminObjectList
                    label="Footer contact"
                    items={site.footer.contact}
                    onChange={(next) =>
                      setSite((s) => (s ? { ...s, footer: { ...s.footer, contact: next } } : s))
                    }
                    newItem={() => ({ label: "Phone", value: "", href: "" })}
                    schema={[
                      { key: "label", label: "Label" },
                      { key: "value", label: "Value" },
                      { key: "href", label: "Href" },
                    ]}
                  />
                  <AdminStringList
                    label="Office address lines"
                    items={site.footer.officeAddress}
                    onChange={(next) =>
                      setSite((s) => (s ? { ...s, footer: { ...s.footer, officeAddress: next } } : s))
                    }
                  />
                  <AdminField
                    label="Copyright"
                    value={site.footer.copyright}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, footer: { ...s.footer, copyright: v } } : s
                      )
                    }
                  />
                </>
              ) : null}

              {tab === "home" ? (
                <>
                  <div className="text-sm font-extrabold">Home Hero</div>
                  <AdminField
                    label="Headline"
                    value={site.home.hero.headline}
                    onChange={(v) =>
                      setSite((s) => (s ? { ...s, home: { ...s.home, hero: { ...s.home.hero, headline: v } } } : s))
                    }
                  />
                  <AdminField
                    label="Subheadline"
                    textarea
                    value={site.home.hero.subheadline}
                    onChange={(v) =>
                      setSite((s) => (s ? { ...s, home: { ...s.home, hero: { ...s.home.hero, subheadline: v } } } : s))
                    }
                  />
                  <AdminField
                    label="Primary CTA label"
                    value={site.home.hero.primaryCta.label}
                    onChange={(v) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              home: {
                                ...s.home,
                                hero: { ...s.home.hero, primaryCta: { ...s.home.hero.primaryCta, label: v } },
                              },
                            }
                          : s
                      )
                    }
                  />
                  <AdminField
                    label="Secondary CTA label"
                    value={site.home.hero.secondaryCta.label}
                    onChange={(v) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              home: {
                                ...s.home,
                                hero: { ...s.home.hero, secondaryCta: { ...s.home.hero.secondaryCta, label: v } },
                              },
                            }
                          : s
                      )
                    }
                  />

                  <div className="text-sm font-extrabold">Products section</div>
                  <AdminField
                    label="Title"
                    value={site.home.products.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, products: { ...s.home.products, title: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Subtitle"
                    value={site.home.products.subtitle}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, products: { ...s.home.products, subtitle: v } } } : s
                      )
                    }
                  />
                  <AdminObjectList
                    label="Product cards"
                    items={site.home.products.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s
                          ? { ...s, home: { ...s.home, products: { ...s.home.products, items: next } } }
                          : s
                      )
                    }
                    newItem={() => ({ label: "New product", href: "" })}
                    schema={[
                      { key: "label", label: "Label" },
                      { key: "href", label: "Href (optional; filled on Save if new)" },
                    ]}
                  />
                  <p className="text-xs text-muted leading-relaxed">
                    <strong>Save Site</strong> creates <span className="font-mono">content/products/product-1.json</span>,
                    etc. for any tile that doesn&apos;t match an existing catalog file (iterative ids). Tiles that
                    already match a file keep their record; links are normalized to{" "}
                    <span className="font-mono">/solutions?product=&lt;id&gt;</span>. Edit specs, media, and CTA under{" "}
                    <strong>Solutions → Products</strong>.
                  </p>

                  <div className="text-sm font-extrabold">Why choose</div>
                  <AdminField
                    label="Title"
                    value={site.home.whyChoose.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, whyChoose: { ...s.home.whyChoose, title: v } } } : s
                      )
                    }
                  />
                  <AdminObjectList
                    label="Why choose items"
                    items={site.home.whyChoose.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, whyChoose: { ...s.home.whyChoose, items: next } } } : s
                      )
                    }
                    newItem={() => ({ title: "Title", subtitle: "Subtitle" })}
                    schema={[
                      { key: "title", label: "Title" },
                      { key: "subtitle", label: "Subtitle" },
                    ]}
                  />

                  <div className="text-sm font-extrabold">Trusted by</div>
                  <AdminField
                    label="Title"
                    value={site.home.trustedBy.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, trustedBy: { ...s.home.trustedBy, title: v } } } : s
                      )
                    }
                  />
                  <AdminStringList
                    label="Trusted by items"
                    items={site.home.trustedBy.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, trustedBy: { ...s.home.trustedBy, items: next } } } : s
                      )
                    }
                  />

                  <div className="text-sm font-extrabold">Industries</div>
                  <AdminField
                    label="Title"
                    value={site.home.industries.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, industries: { ...s.home.industries, title: v } } } : s
                      )
                    }
                  />
                  <AdminStringList
                    label="Industries items"
                    items={site.home.industries.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, industries: { ...s.home.industries, items: next } } } : s
                      )
                    }
                  />

                  <div className="text-sm font-extrabold">Cost savings</div>
                  <AdminField
                    label="Title"
                    value={site.home.savings.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, savings: { ...s.home.savings, title: v } } } : s
                      )
                    }
                  />
                  <AdminObjectList
                    label="Savings cards"
                    items={site.home.savings.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, savings: { ...s.home.savings, items: next } } } : s
                      )
                    }
                    newItem={() => ({ title: "Industry", subtitle: "Monthly savings", value: "₹0", note: "" })}
                    schema={[
                      { key: "title", label: "Title" },
                      { key: "subtitle", label: "Subtitle" },
                      { key: "value", label: "Value" },
                      { key: "note", label: "Note" },
                    ]}
                  />

                  <div className="text-sm font-extrabold">FAQ</div>
                  <AdminField
                    label="Title"
                    value={site.home.faq.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, faq: { ...s.home.faq, title: v } } } : s
                      )
                    }
                  />
                  <AdminObjectList
                    label="FAQ items"
                    items={site.home.faq.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, faq: { ...s.home.faq, items: next } } } : s
                      )
                    }
                    newItem={() => ({ q: "Question", a: "Answer" })}
                    schema={[
                      { key: "q", label: "Question" },
                      { key: "a", label: "Answer", textarea: true },
                    ]}
                  />

                  <div className="text-sm font-extrabold">Get in touch</div>
                  <AdminField
                    label="Title"
                    value={site.home.getInTouch.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, getInTouch: { ...s.home.getInTouch, title: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Subtitle"
                    value={site.home.getInTouch.subtitle}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, home: { ...s.home, getInTouch: { ...s.home.getInTouch, subtitle: v } } } : s
                      )
                    }
                  />
                </>
              ) : null}

              {tab === "about" ? (
                <>
                  <div className="text-sm font-extrabold">About</div>
                  <AdminField
                    label="Hero Title"
                    value={site.about.hero.title}
                    onChange={(v) =>
                      setSite((s) => (s ? { ...s, about: { ...s.about, hero: { ...s.about.hero, title: v } } } : s))
                    }
                  />
                  <AdminField
                    label="Hero Subtitle"
                    value={site.about.hero.subtitle}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, hero: { ...s.about.hero, subtitle: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Leadership Name"
                    value={site.about.leadership.name}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, leadership: { ...s.about.leadership, name: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Leadership Title"
                    value={site.about.leadership.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, leadership: { ...s.about.leadership, title: v } } } : s
                      )
                    }
                  />

                  <AdminField
                    label="Mission title"
                    value={site.about.mission.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, mission: { ...s.about.mission, title: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Mission body"
                    textarea
                    value={site.about.mission.body}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, mission: { ...s.about.mission, body: v } } } : s
                      )
                    }
                  />
                  <AdminStringList
                    label="Mission bullets"
                    items={site.about.mission.bullets}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, mission: { ...s.about.mission, bullets: next } } } : s
                      )
                    }
                  />

                  <AdminField
                    label="Vision title"
                    value={site.about.vision.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, vision: { ...s.about.vision, title: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Vision body"
                    textarea
                    value={site.about.vision.body}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, vision: { ...s.about.vision, body: v } } } : s
                      )
                    }
                  />
                  <AdminStringList
                    label="Vision bullets"
                    items={site.about.vision.bullets}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, vision: { ...s.about.vision, bullets: next } } } : s
                      )
                    }
                  />

                  <AdminObjectList
                    label="Stats"
                    items={site.about.stats}
                    onChange={(next) => setSite((s) => (s ? { ...s, about: { ...s.about, stats: next } } : s))}
                    newItem={() => ({ value: "0", label: "Label" })}
                    schema={[
                      { key: "value", label: "Value" },
                      { key: "label", label: "Label" },
                    ]}
                  />

                  <AdminField
                    label="Leadership quote title"
                    value={site.about.leadership.quoteTitle}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, leadership: { ...s.about.leadership, quoteTitle: v } } } : s
                      )
                    }
                  />
                  <AdminStringList
                    label="Leadership message paragraphs"
                    items={site.about.leadership.message}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, leadership: { ...s.about.leadership, message: next } } } : s
                      )
                    }
                  />

                  <AdminField
                    label="Values title"
                    value={site.about.values.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, values: { ...s.about.values, title: v } } } : s
                      )
                    }
                  />
                  <AdminObjectList
                    label="Core values items"
                    items={site.about.values.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, values: { ...s.about.values, items: next } } } : s
                      )
                    }
                    newItem={() => ({ title: "Value", subtitle: "Description" })}
                    schema={[
                      { key: "title", label: "Title" },
                      { key: "subtitle", label: "Subtitle", textarea: true },
                    ]}
                  />
                </>
              ) : null}

              {tab === "solutionsProducts" ? (
                <>
                  <div className="text-sm font-extrabold">Solutions Products</div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted">Select product file</label>
                    <select
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                      value={activeProductFile}
                      onChange={(e) => setActiveProductFile(e.target.value)}
                    >
                      {products.map((p) => (
                        <option key={p.filename} value={p.filename}>
                          {p.filename}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const entry = products.find((p) => p.filename === activeProductFile);
                    const prod = entry?.json;
                    if (!entry) return <div className="text-sm text-muted">No product selected.</div>;
                    if (!prod) return <div className="text-sm text-muted">Could not parse JSON for this file.</div>;

                    const update = (next: Product) =>
                      setProducts((arr) =>
                        arr.map((x) => (x.filename === entry.filename ? { ...x, json: next } : x))
                      );

                    return (
                      <>
                        <AdminField label="ID" value={prod.id} onChange={(v) => update({ ...prod, id: v })} />
                        <AdminField label="Name" value={prod.name} onChange={(v) => update({ ...prod, name: v })} />
                        <AdminField
                          label="Tagline"
                          value={prod.tagline}
                          onChange={(v) => update({ ...prod, tagline: v })}
                        />

                        <AdminObjectList
                          label="Technical specifications"
                          items={prod.specs}
                          onChange={(next) => update({ ...prod, specs: next })}
                          newItem={() => ({ label: "Spec", value: "" })}
                          schema={[
                            { key: "label", label: "Label" },
                            { key: "value", label: "Value" },
                          ]}
                        />

                        <AdminStringList
                          label="Key features"
                          items={prod.features}
                          onChange={(next) => update({ ...prod, features: next })}
                        />

                        <AdminObjectList
                          label="KPI cards"
                          items={prod.kpis}
                          onChange={(next) => update({ ...prod, kpis: next })}
                          newItem={() => ({ label: "Metric", value: "0", subLabel: "", tone: "brand" as const })}
                          schema={[
                            { key: "label", label: "Label" },
                            { key: "value", label: "Value" },
                            { key: "subLabel", label: "Sub label" },
                            { key: "tone", label: "Tone (brand|blue|purple|orange)" },
                          ]}
                        />

                        <div className="text-sm font-extrabold">CTA</div>
                        <AdminField
                          label="CTA title"
                          value={prod.cta.title}
                          onChange={(v) => update({ ...prod, cta: { ...prod.cta, title: v } })}
                        />
                        <AdminField
                          label="CTA subtitle"
                          textarea
                          value={prod.cta.subtitle}
                          onChange={(v) => update({ ...prod, cta: { ...prod.cta, subtitle: v } })}
                        />
                        <AdminField
                          label="Primary button label"
                          value={prod.cta.primary}
                          onChange={(v) => update({ ...prod, cta: { ...prod.cta, primary: v } })}
                        />
                        <AdminField
                          label="Secondary button label"
                          value={prod.cta.secondary}
                          onChange={(v) => update({ ...prod, cta: { ...prod.cta, secondary: v } })}
                        />

                        <Button
                          className="w-full"
                          onClick={async () => {
                            setProductSaving(true);
                            setStatus(null);
                            try {
                              const res = await fetch("/api/admin/products", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ filename: entry.filename, json: prod }),
                              });
                              if (!res.ok) {
                                setStatus(await res.text());
                                return;
                              }
                              setStatus(`Saved ${entry.filename}.`);
                            } finally {
                              setProductSaving(false);
                            }
                          }}
                        >
                          {productSaving ? "Saving…" : "Save Product"}
                        </Button>
                      </>
                    );
                  })()}
                </>
              ) : null}

              {tab === "contact" ? (
                <>
                  <div className="text-sm font-extrabold">Contact</div>
                  <AdminField
                    label="Title"
                    value={site.contact.hero.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, contact: { ...s.contact, hero: { ...s.contact.hero, title: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Subtitle"
                    value={site.contact.hero.subtitle}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, contact: { ...s.contact, hero: { ...s.contact.hero, subtitle: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Footer About"
                    textarea
                    value={site.footer.about}
                    onChange={(v) => setSite((s) => (s ? { ...s, footer: { ...s.footer, about: v } } : s))}
                  />

                  <AdminObjectList
                    label="Contact cards"
                    items={site.contact.cards.map((c) => ({ title: c.title, lines: c.lines.join("\n") }))}
                    onChange={(next: { title: string; lines: string }[]) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              contact: {
                                ...s.contact,
                                cards: next.map((c) => ({
                                  title: String(c.title ?? ""),
                                  lines: String(c.lines ?? "")
                                    .split("\n")
                                    .map((x) => x.trim())
                                    .filter(Boolean),
                                })),
                              },
                            }
                          : s
                      )
                    }
                    newItem={() => ({ title: "Card title", lines: "" })}
                    schema={[
                      { key: "title", label: "Title" },
                      { key: "lines", label: "Lines (one per line)", textarea: true },
                    ]}
                  />

                  <AdminField
                    label="Locations title"
                    value={site.contact.locations.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, contact: { ...s.contact, locations: { ...s.contact.locations, title: v } } } : s
                      )
                    }
                  />

                  <AdminObjectList
                    label="Locations"
                    items={site.contact.locations.items.map((l) => ({ ...l, lines: l.lines.join("\n") }))}
                    onChange={(next: { title: string; lines: string; email: string; phone: string }[]) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              contact: {
                                ...s.contact,
                                locations: {
                                  ...s.contact.locations,
                                  items: next.map((l) => ({
                                    title: String(l.title ?? ""),
                                    lines: String(l.lines ?? "")
                                      .split("\n")
                                      .map((x) => x.trim())
                                      .filter(Boolean),
                                    email: String(l.email ?? ""),
                                    phone: String(l.phone ?? ""),
                                  })),
                                },
                              },
                            }
                          : s
                      )
                    }
                    newItem={() => ({ title: "Location", lines: "", email: "", phone: "" })}
                    schema={[
                      { key: "title", label: "Title" },
                      { key: "lines", label: "Address lines (one per line)", textarea: true },
                      { key: "email", label: "Email" },
                      { key: "phone", label: "Phone" },
                    ]}
                  />

                  <AdminField
                    label="Form title"
                    value={site.contact.form.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, contact: { ...s.contact, form: { ...s.contact.form, title: v } } } : s
                      )
                    }
                  />
                  <AdminField
                    label="Form subtitle"
                    value={site.contact.form.subtitle}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, contact: { ...s.contact, form: { ...s.contact.form, subtitle: v } } } : s
                      )
                    }
                  />

                  <AdminField
                    label="Other ways title"
                    value={site.contact.otherWays.title}
                    onChange={(v) =>
                      setSite((s) =>
                        s
                          ? { ...s, contact: { ...s.contact, otherWays: { ...s.contact.otherWays, title: v } } }
                          : s
                      )
                    }
                  />
                  <AdminObjectList
                    label="Other ways items"
                    items={site.contact.otherWays.items}
                    onChange={(next) =>
                      setSite((s) =>
                        s
                          ? { ...s, contact: { ...s.contact, otherWays: { ...s.contact.otherWays, items: next } } }
                          : s
                      )
                    }
                    newItem={() => ({ title: "Option", subtitle: "", actionLabel: "Action", href: "/" })}
                    schema={[
                      { key: "title", label: "Title" },
                      { key: "subtitle", label: "Subtitle" },
                      { key: "actionLabel", label: "Action label" },
                      { key: "href", label: "Href" },
                    ]}
                  />
                </>
              ) : null}

              {tab === "theme" ? (
                <>
                  <div className="text-sm font-extrabold">Theme</div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted">Active preset</label>
                    <select
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                      value={site.theme.activePreset}
                      onChange={(e) =>
                        setSite((s) =>
                          s
                            ? { ...s, theme: { ...s.theme, activePreset: e.target.value as ThemePresetId } }
                            : s
                        )
                      }
                    >
                      {Object.keys(site.theme.presets).map((k) => (
                        <option key={k} value={k}>
                          {site.theme.presets[k as ThemePresetId].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <AdminField
                    label="Brand color"
                    value={site.theme.presets[site.theme.activePreset].tokens.brand}
                    onChange={(v) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              theme: {
                                ...s.theme,
                                presets: {
                                  ...s.theme.presets,
                                  [s.theme.activePreset]: {
                                    ...s.theme.presets[s.theme.activePreset],
                                    tokens: {
                                      ...s.theme.presets[s.theme.activePreset].tokens,
                                      brand: v,
                                    },
                                  },
                                },
                              },
                            }
                          : s
                      )
                    }
                  />
                  <AdminField
                    label="Accent color"
                    value={site.theme.presets[site.theme.activePreset].tokens.accent}
                    onChange={(v) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              theme: {
                                ...s.theme,
                                presets: {
                                  ...s.theme.presets,
                                  [s.theme.activePreset]: {
                                    ...s.theme.presets[s.theme.activePreset],
                                    tokens: {
                                      ...s.theme.presets[s.theme.activePreset].tokens,
                                      accent: v,
                                    },
                                  },
                                },
                              },
                            }
                          : s
                      )
                    }
                  />
                </>
              ) : null}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-border bg-white p-4">
            <div className="text-sm font-extrabold">Live Preview (this editor view)</div>
            <div className="mt-3 rounded-[var(--radius-lg)] border border-border p-4">
              <div className="text-xs font-semibold text-muted">Home Hero Preview</div>
              <div className="mt-2 rounded-[var(--radius-lg)] bg-brand p-5 text-white">
                <div className="text-2xl font-extrabold">{preview?.home.hero.headline}</div>
                <div className="mt-2 text-sm text-white/85">{preview?.home.hero.subheadline}</div>
              </div>

              <div className="mt-6 text-xs font-semibold text-muted">Theme Preview</div>
              <div className="mt-2 flex flex-wrap gap-3">
                <div className="rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white">Brand</div>
                <div className="rounded-xl bg-accent px-3 py-2 text-xs font-bold text-white">Accent</div>
                <div className="rounded-xl bg-surface px-3 py-2 text-xs font-bold text-foreground ring-1 ring-border">
                  Surface
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-muted">
              Tip: after clicking Save, refresh the normal website pages (`/`, `/about`, etc.) to see the new content.
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

