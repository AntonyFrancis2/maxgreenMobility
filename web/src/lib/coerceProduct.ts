/** Ensure product JSON has array fields so admin lists never see `undefined`. */
export function ensureProductJsonShape(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const o = raw as Record<string, unknown>;
  const media = (o.media && typeof o.media === "object" ? o.media : {}) as Record<string, unknown>;
  const demo = (media.demoVideo && typeof media.demoVideo === "object" ? media.demoVideo : {}) as Record<
    string,
    unknown
  >;

  return {
    ...o,
    specs: Array.isArray(o.specs) ? o.specs : [],
    features: Array.isArray(o.features) ? o.features : [],
    kpis: Array.isArray(o.kpis) ? o.kpis : [],
    media: {
      ...media,
      mainImage: typeof media.mainImage === "string" ? media.mainImage : "",
      demoVideo: {
        kind: demo.kind === "youtube" ? "youtube" : "file",
        url: typeof demo.url === "string" ? demo.url : "",
      },
      views: Array.isArray(media.views) ? media.views : [],
    },
    cta:
      o.cta && typeof o.cta === "object"
        ? o.cta
        : { title: "", subtitle: "", primary: "", secondary: "" },
  };
}
