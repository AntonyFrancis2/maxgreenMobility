"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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

function getEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  
  let videoId = "";
  try {
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get("v") || "";
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    } else {
      const reg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
      const match = url.match(reg);
      if (match) {
        videoId = match[1];
      }
    }
  } catch {
    // ignore
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
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
  const [productOpen, setProductOpen] = useState(false);
  const productWrapRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!productOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = productWrapRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setProductOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProductOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [productOpen]);

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

  const hasVideo = !!product.media.demoVideo?.url;

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
            <div className="relative mt-2" ref={productWrapRef}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-to-b from-white to-surface/70 px-4 py-3 text-left text-sm font-bold shadow-sm outline-none transition hover:border-foreground/20 focus:border-brand focus:ring-4 focus:ring-brand/15"
                onClick={() => setProductOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={productOpen}
              >
                <span className="truncate">{product?.name ?? "Select…"}</span>
                <span className="shrink-0 text-muted">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M7 10l5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {productOpen ? (
                <div
                  role="listbox"
                  aria-label="Select product"
                  className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-border bg-white p-1 shadow-lg ring-1 ring-black/5"
                >
                  {products.map((p) => {
                    const active = p.id === selectedId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                          active
                            ? "bg-brand/10 text-brand"
                            : "text-foreground/85 hover:bg-surface"
                        }`}
                        onClick={() => {
                          setSelectedId(p.id);
                          setProductOpen(false);
                          setActiveViewId(p.media.views[0]?.id ?? "");
                        }}
                      >
                        <span className="truncate">{p.name}</span>
                        {active ? (
                          <span className="shrink-0 text-brand" aria-hidden="true">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-10 text-center">
            <div className="text-2xl font-extrabold tracking-tight">{product.name}</div>
            <div className="mt-1 text-sm font-semibold text-brand">{product.tagline}</div>
          </div>

          <div className={`mt-8 ${hasVideo ? "grid gap-5 lg:grid-cols-2" : "flex justify-center"}`}>
            <div className={`rounded-[var(--radius-lg)] border border-border bg-[#eafff3] p-3 sm:p-4 w-full h-full flex flex-col justify-center ${hasVideo ? "" : "max-w-md"}`}>
              <div className={`relative mx-auto w-full overflow-hidden rounded-xl aspect-video ${hasVideo ? "" : "max-w-md"}`}>
                <Image
                  src={activeView.image}
                  alt={`${product.name} image`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 400px, 90vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {hasVideo ? (
              <div className="rounded-[var(--radius-lg)] border border-border bg-[#0b2a2e] p-3 sm:p-4 text-white w-full h-full flex flex-col justify-center">
                <div className="w-full overflow-hidden rounded-xl bg-black/40 aspect-video">
                  {product.media.demoVideo.kind === "youtube" ? (
                    <iframe
                      className="h-full w-full"
                      src={getEmbedUrl(product.media.demoVideo.url)}
                      title="Product Demo Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video className="h-full w-full object-cover" controls src={product.media.demoVideo.url} />
                  )}
                </div>
              </div>
            ) : null}
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
              <Button href="/contact#message" className="bg-white/18 text-white ring-1 ring-white/35 hover:bg-white/24">
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

