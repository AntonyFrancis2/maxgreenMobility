"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { siteBulletListLiClass, siteCardStackClass, siteCardTitleRowClass } from "@/lib/layoutTheme";
import type { Product } from "@/lib/site";

function toneClasses(tone: Product["kpis"][number]["tone"]) {
  switch (tone) {
    case "blue":
      return "bg-[#2563eb] text-white";
    case "purple":
      return "bg-[#7c3aed] text-white";
    case "orange":
      return "bg-[#f97316] text-white";
    default:
      return "bg-brand text-white";
  }
}

export function SolutionsClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const stackSpecs = siteCardStackClass("start");
  const stackFeatures = siteCardStackClass("start");
  const stackKpis = siteCardStackClass("start");
  const featureListAlign = siteBulletListLiClass("start");
  const titleSpecs = siteCardTitleRowClass("start");
  const titleFeatures = siteCardTitleRowClass("start");

  const queryId = searchParams.get("product");
  const initialSelected =
    queryId && products.some((p) => p.id === queryId)
      ? queryId
      : (products[0]?.id ?? "");

  const [selectedId, setSelectedId] = useState(initialSelected);

  useEffect(() => {
    const q = searchParams.get("product");
    if (!products.length) {
      setSelectedId("");
      return;
    }
    if (!products.some((p) => p.id === selectedId)) {
      setSelectedId(
        q && products.some((p) => p.id === q)
          ? q
          : products[0].id
      );
    }
  }, [products, selectedId, searchParams]);

  const product =
    useMemo(
      () => (products.length ? products.find((p) => p.id === selectedId) ?? products[0] ?? null : null),
      [selectedId, products]
    );

  const [activeViewId, setActiveViewId] = useState("");

  useEffect(() => {
    const p = products.find((x) => x.id === selectedId);
    const views = p?.media.views;
    if (!views?.length) return;
    setActiveViewId((cur) => (cur && views.some((v) => v.id === cur) ? cur : views[0].id));
  }, [selectedId, products]);

  const activeView =
    product?.media.views.find((v) => v.id === activeViewId) ?? product?.media.views[0];

  if (!products.length || !product || !activeView) {
    return (
      <div>
        <section className="bg-brand py-14 text-white">
          <Container className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Our Solutions</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">
              Add products on the Home page under Our Products—they will appear here automatically.
            </p>
          </Container>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Our Solutions</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">
            Explore our comprehensive range of electric vehicles designed for your business needs
          </p>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="mx-auto max-w-md">
            <div className="text-center text-xs font-semibold text-muted">Select Product</div>
            <select
              className="mt-2 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold"
              value={selectedId}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedId(next);
                const p = products.find((x) => x.id === next) ?? products[0];
                setActiveViewId(p.media.views[0]?.id ?? "");
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-10 text-center">
            <div className="text-2xl font-extrabold tracking-tight">{product.name}</div>
            <div className="mt-1 text-sm font-semibold text-brand">{product.tagline}</div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-border bg-[#eafff3] p-8">
              <div className="relative mx-auto h-40 w-40">
                <Image
                  src={activeView.image}
                  alt={`${product.name} image`}
                  fill
                  priority
                  sizes="160px"
                />
              </div>
              <div className="mt-4 text-center text-xs font-semibold text-muted">Product Image</div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-border bg-[#0b2a2e] p-8 text-white">
              <div className="flex items-center justify-center">
                {product.media.demoVideo.kind === "youtube" ? (
                  <div className="w-full overflow-hidden rounded-xl bg-black/40">
                    <div className="aspect-video w-full">
                      <iframe
                        className="h-full w-full"
                        src={product.media.demoVideo.url}
                        title="Product Demo Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <video className="w-full rounded-xl" controls src={product.media.demoVideo.url} />
                )}
              </div>
              <div className="mt-4 text-center text-xs font-semibold text-white/70">Product Demo Video</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3">
            {product.media.views.map((v) => {
              const active = v.id === activeViewId;
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`rounded-[var(--radius-lg)] border bg-white/80 p-3 text-center transition ${
                    active ? "border-brand ring-2 ring-brand/20" : "border-border hover:border-foreground/20"
                  }`}
                  onClick={() => setActiveViewId(v.id)}
                  aria-label={v.label}
                >
                  <div className="relative mx-auto h-10 w-10">
                    <Image src={v.image} alt={v.label} fill />
                  </div>
                  <div className="mt-2 text-xs font-semibold text-muted">{v.label}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${stackSpecs}`}>
              <div className={titleSpecs}>
                <span className="text-brand">⚙</span> Technical Specifications
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                {product.specs.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-muted">{s.label}</dt>
                    <dd className="font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={`rounded-[var(--radius-lg)] border border-border bg-surface p-6 ${stackFeatures}`}>
              <div className={titleFeatures}>
                <span className="text-brand">🔑</span> Key Features
              </div>
              <ul className={`mt-4 w-full space-y-3 text-sm text-foreground/85 ${featureListAlign}`}>
                {product.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-0.5 text-brand">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {product.kpis.map((k) => (
              <div key={k.label} className={`rounded-[var(--radius-lg)] p-6 ${toneClasses(k.tone)} ${stackKpis}`}>
                <div className="text-xs font-semibold text-white/80">{k.label}</div>
                <div className="mt-2 text-2xl font-extrabold">{k.value}</div>
                {k.subLabel ? <div className="mt-1 text-xs text-white/80">{k.subLabel}</div> : null}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[var(--radius-lg)] bg-brand p-8 text-center text-white">
            <div className="text-2xl font-extrabold">{product.cta.title}</div>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-white/85">{product.cta.subtitle}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="/contact#message" className="bg-white/80 text-foreground hover:bg-white/90">
                {product.cta.primary}
              </Button>
              <Button
                href="/contact#message"
                variant="ghost"
                className="ring-1 ring-white/25 hover:bg-white/10 text-white"
              >
                {product.cta.secondary}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

