"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { AdminField } from "@/components/AdminField";
import { AdminMediaField } from "@/components/AdminMediaField";
import { AdminUploader } from "@/components/AdminUploader";
import { AdminObjectList, AdminStringList } from "@/components/AdminList";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { BlogPost, Product, SiteConfig, ThemePresetId } from "@/lib/site";

type TabId = "brandNavFooter" | "home" | "about" | "solutionsProducts" | "contact" | "theme" | "blog";

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

  // Blog state
  const [blogPosts, setBlogPosts] = useState<{ filename: string; json: BlogPost | null }[]>([]);
  const [activeBlogSlug, setActiveBlogSlug] = useState<string>("");
  const [blogSaving, setBlogSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/site");
      if (!res.ok) {
        setStatus("Not authorized. Redirecting to login page...");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 1500);
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

      // Fetch blog posts
      const bres = await fetch("/api/admin/blog");
      if (bres.ok) {
        const b = (await bres.json()) as { files: { filename: string; json: BlogPost | null }[] };
        setBlogPosts(b.files);
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
                  ["blog", "📝 Blog"],
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
                    value={site.home.trustedBy?.title ?? ""}
                    onChange={(v) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              home: {
                                ...s.home,
                                trustedBy: {
                                  title: v,
                                  items: s.home.trustedBy?.items ?? [],
                                },
                              },
                            }
                          : s
                      )
                    }
                  />
                  <AdminStringList
                    label="Trusted by items"
                    items={site.home.trustedBy?.items ?? []}
                    onChange={(next) =>
                      setSite((s) =>
                        s
                          ? {
                              ...s,
                              home: {
                                ...s.home,
                                trustedBy: {
                                  title: s.home.trustedBy?.title ?? "",
                                  items: next,
                                },
                              },
                            }
                          : s
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
                    label="Leadership LinkedIn URL"
                    value={site.about.leadership.linkedIn ?? ""}
                    onChange={(v) =>
                      setSite((s) =>
                        s ? { ...s, about: { ...s.about, leadership: { ...s.about.leadership, linkedIn: v } } } : s
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

                        <div className="text-sm font-extrabold border-t border-border pt-4 mt-4">Media Assets</div>
                        
                        <AdminMediaField
                          label="Main Image"
                          value={prod.media?.mainImage ?? ""}
                          folder="products"
                          onChange={(v) => update({
                            ...prod,
                            media: {
                              mainImage: v,
                              demoVideo: prod.media?.demoVideo ?? { kind: "youtube", url: "" },
                              views: prod.media?.views ?? []
                            }
                          })}
                        />

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted">Video Type</label>
                            <select
                              className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                              value={prod.media?.demoVideo?.kind ?? "youtube"}
                              onChange={(e) => update({
                                ...prod,
                                media: {
                                  mainImage: prod.media?.mainImage ?? "",
                                  demoVideo: {
                                    kind: e.target.value as "youtube" | "file",
                                    url: prod.media?.demoVideo?.url ?? ""
                                  },
                                  views: prod.media?.views ?? []
                                }
                              })}
                            >
                              <option value="youtube">YouTube (embed url)</option>
                              <option value="file">Local/Server Video File</option>
                            </select>
                          </div>
                          
                          <AdminField
                            label="Video URL / Embed URL"
                            value={prod.media?.demoVideo?.url ?? ""}
                            onChange={(v) => update({
                              ...prod,
                              media: {
                                mainImage: prod.media?.mainImage ?? "",
                                demoVideo: {
                                  kind: prod.media?.demoVideo?.kind ?? "youtube",
                                  url: v
                                },
                                views: prod.media?.views ?? []
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2 border border-border rounded-[var(--radius-lg)] p-4 bg-white/40">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs font-bold text-muted uppercase tracking-wider">Gallery View Images</div>
                            <button
                              type="button"
                              className="rounded-xl bg-white/80 px-3 py-1.5 text-xs font-bold ring-1 ring-border hover:bg-white/90"
                              onClick={() => {
                                const currentViews = prod.media?.views ?? [];
                                const nextId = `v${currentViews.length + 1}`;
                                const newView = { id: nextId, label: `View ${currentViews.length + 1}`, image: "" };
                                update({
                                  ...prod,
                                  media: {
                                    mainImage: prod.media?.mainImage ?? "",
                                    demoVideo: prod.media?.demoVideo ?? { kind: "youtube", url: "" },
                                    views: [...currentViews, newView]
                                  }
                                });
                              }}
                            >
                              + Add View
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {(prod.media?.views ?? []).map((view, idx) => (
                              <div key={idx} className="rounded-xl border border-border bg-white p-3 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-muted">View #{idx + 1}</span>
                                  <button
                                    type="button"
                                    className="rounded-lg px-2 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                                    onClick={() => {
                                      const nextViews = (prod.media?.views ?? []).filter((_, i) => i !== idx);
                                      update({
                                        ...prod,
                                        media: {
                                          mainImage: prod.media?.mainImage ?? "",
                                          demoVideo: prod.media?.demoVideo ?? { kind: "youtube", url: "" },
                                          views: nextViews
                                        }
                                      });
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <AdminField
                                    label="View ID"
                                    value={view.id}
                                    onChange={(v) => {
                                      const nextViews = [...(prod.media?.views ?? [])];
                                      nextViews[idx] = { ...nextViews[idx], id: v };
                                      update({
                                        ...prod,
                                        media: {
                                          mainImage: prod.media?.mainImage ?? "",
                                          demoVideo: prod.media?.demoVideo ?? { kind: "youtube", url: "" },
                                          views: nextViews
                                        }
                                      });
                                    }}
                                  />
                                  <AdminField
                                    label="Label"
                                    value={view.label}
                                    onChange={(v) => {
                                      const nextViews = [...(prod.media?.views ?? [])];
                                      nextViews[idx] = { ...nextViews[idx], label: v };
                                      update({
                                        ...prod,
                                        media: {
                                          mainImage: prod.media?.mainImage ?? "",
                                          demoVideo: prod.media?.demoVideo ?? { kind: "youtube", url: "" },
                                          views: nextViews
                                        }
                                      });
                                    }}
                                  />
                                </div>
                                <AdminMediaField
                                  label="Image Path / File"
                                  value={view.image}
                                  folder="products"
                                  onChange={(v) => {
                                    const nextViews = [...(prod.media?.views ?? [])];
                                    nextViews[idx] = { ...nextViews[idx], image: v };
                                    update({
                                      ...prod,
                                      media: {
                                        mainImage: prod.media?.mainImage ?? "",
                                        demoVideo: prod.media?.demoVideo ?? { kind: "youtube", url: "" },
                                        views: nextViews
                                      }
                                    });
                                  }}
                                />
                              </div>
                            ))}
                            {(prod.media?.views ?? []).length === 0 && (
                              <div className="text-xs text-muted italic text-center py-3 bg-white/50 rounded-xl border border-dashed border-border">
                                No views defined for this product gallery.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-border my-4"></div>

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

              {tab === "blog" ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold">Blog Posts</div>
                    <button
                      type="button"
                      className="rounded-xl bg-brand px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const now = new Date().toISOString();
                        const slug = `new-post-${Date.now()}`;
                        const newPost: BlogPost = {
                          slug,
                          title: "New Blog Post",
                          excerpt: "",
                          body: "<p>Start writing your blog post here...</p>",
                          author: "Maxgreen Team",
                          coverImage: "",
                          tags: [],
                          status: "draft",
                          publishedAt: now,
                          updatedAt: now,
                          seo: { title: "", description: "", keywords: [] },
                        };
                        const filename = `${slug}.json`;
                        setBlogPosts((prev) => [...prev, { filename, json: newPost }]);
                        setActiveBlogSlug(slug);
                      }}
                    >
                      + New Post
                    </button>
                  </div>

                  {/* Post list */}
                  <div className="space-y-1">
                    {blogPosts.map((bp) => {
                      const p = bp.json;
                      if (!p) return null;
                      const isActive = p.slug === activeBlogSlug;
                      return (
                        <button
                          key={bp.filename}
                          type="button"
                          onClick={() => setActiveBlogSlug(p.slug)}
                          className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                            isActive
                              ? "bg-brand/10 text-brand font-semibold"
                              : "hover:bg-white/80 text-foreground/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{p.title}</span>
                            <span
                              className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                p.status === "published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {p.status === "published" ? "Published" : "Draft"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Edit selected post */}
                  {(() => {
                    const entry = blogPosts.find((bp) => bp.json?.slug === activeBlogSlug);
                    const post = entry?.json;
                    if (!entry || !post) {
                      return (
                        <div className="py-8 text-center text-sm text-muted">
                          {blogPosts.length === 0
                            ? 'Click "+ New Post" to create your first blog post.'
                            : "Select a post to edit."}
                        </div>
                      );
                    }

                    const updatePost = (next: BlogPost) =>
                      setBlogPosts((arr) =>
                        arr.map((x) =>
                          x.filename === entry.filename ? { ...x, json: next } : x
                        )
                      );

                    return (
                      <>
                        <div className="border-t border-border pt-4 mt-2">
                          <div className="text-sm font-extrabold">Post Details</div>
                        </div>

                        <AdminField
                          label="Title"
                          value={post.title}
                          onChange={(v) => {
                            const newSlug = v
                              .toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, "")
                              .replace(/\s+/g, "-")
                              .replace(/-+/g, "-")
                              .replace(/^-|-$/g, "")
                              || post.slug;
                            const newFilename = `${newSlug}.json`;
                            setBlogPosts((arr) =>
                              arr.map((x) =>
                                x.filename === entry.filename
                                  ? { filename: newFilename, json: { ...post, title: v, slug: newSlug } }
                                  : x
                              )
                            );
                            setActiveBlogSlug(newSlug);
                          }}
                        />

                        <AdminField
                          label="Slug (URL path)"
                          value={post.slug}
                          onChange={(v) => {
                            const newFilename = `${v}.json`;
                            setBlogPosts((arr) =>
                              arr.map((x) =>
                                x.filename === entry.filename
                                  ? { filename: newFilename, json: { ...post, slug: v } }
                                  : x
                              )
                            );
                            setActiveBlogSlug(v);
                          }}
                        />

                        <AdminField
                          label="Excerpt"
                          textarea
                          value={post.excerpt}
                          onChange={(v) => updatePost({ ...post, excerpt: v })}
                        />

                        <AdminField
                          label="Author"
                          value={post.author}
                          onChange={(v) => updatePost({ ...post, author: v })}
                        />

                        <AdminMediaField
                          label="Cover image"
                          value={post.coverImage}
                          folder="blog"
                          accept="image/*"
                          onChange={(v) => updatePost({ ...post, coverImage: v })}
                        />

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted">Status</label>
                          <select
                            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
                            value={post.status}
                            onChange={(e) =>
                              updatePost({
                                ...post,
                                status: e.target.value as "draft" | "published",
                              })
                            }
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>

                        <AdminField
                          label="Published date"
                          value={post.publishedAt.slice(0, 10)}
                          onChange={(v) =>
                            updatePost({
                              ...post,
                              publishedAt: new Date(v).toISOString(),
                            })
                          }
                        />

                        <AdminStringList
                          label="Tags"
                          items={post.tags}
                          onChange={(next) => updatePost({ ...post, tags: next })}
                        />

                        <div className="border-t border-border pt-4 mt-2">
                          <div className="text-sm font-extrabold">Content Body</div>
                          <p className="text-xs text-muted mt-1 mb-3">
                            Use the toolbar to format your content. Supports bold, italic, headings, lists, links, images, and blockquotes.
                          </p>
                        </div>

                        <RichTextEditor
                          value={post.body}
                          onChange={(html) => updatePost({ ...post, body: html })}
                        />

                        <div className="border-t border-border pt-4 mt-2">
                          <div className="text-sm font-extrabold">SEO Settings</div>
                        </div>

                        <AdminField
                          label="SEO Title"
                          value={post.seo.title}
                          onChange={(v) =>
                            updatePost({ ...post, seo: { ...post.seo, title: v } })
                          }
                        />

                        <AdminField
                          label="SEO Description"
                          textarea
                          value={post.seo.description}
                          onChange={(v) =>
                            updatePost({ ...post, seo: { ...post.seo, description: v } })
                          }
                        />

                        <AdminStringList
                          label="SEO Keywords"
                          items={post.seo.keywords}
                          onChange={(next) =>
                            updatePost({ ...post, seo: { ...post.seo, keywords: next } })
                          }
                        />

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity"
                            onClick={async () => {
                              setBlogSaving(true);
                              setStatus(null);
                              try {
                                const res = await fetch("/api/admin/blog", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    filename: entry.filename,
                                    json: {
                                      ...post,
                                      updatedAt: new Date().toISOString(),
                                    },
                                  }),
                                });
                                if (!res.ok) {
                                  setStatus(await res.text());
                                  return;
                                }
                                setStatus(`Saved blog post: ${post.title}`);

                                // Refresh blog list
                                const bres = await fetch("/api/admin/blog");
                                if (bres.ok) {
                                  const b = (await bres.json()) as {
                                    files: { filename: string; json: BlogPost | null }[];
                                  };
                                  setBlogPosts(b.files);
                                }
                              } finally {
                                setBlogSaving(false);
                              }
                            }}
                          >
                            {blogSaving ? "Saving…" : "Save Post"}
                          </button>

                          <button
                            type="button"
                            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 ring-1 ring-red-200 hover:bg-red-100 transition-colors"
                            onClick={async () => {
                              if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
                              setStatus(null);
                              try {
                                const res = await fetch("/api/admin/blog", {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ filename: entry.filename }),
                                });
                                if (!res.ok) {
                                  setStatus(await res.text());
                                  return;
                                }
                                setStatus(`Deleted blog post: ${post.title}`);
                                setBlogPosts((arr) =>
                                  arr.filter((x) => x.filename !== entry.filename)
                                );
                                setActiveBlogSlug("");
                              } catch {
                                setStatus("Failed to delete post.");
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>

                        {post.status === "published" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center text-xs font-semibold text-brand hover:underline"
                          >
                            Preview → /blog/{post.slug}
                          </a>
                        )}
                      </>
                    );
                  })()}
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

            <div className="mt-6 border-t border-border pt-6">
              <AdminUploader label="General Media Uploader" folderDefault="blog" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

