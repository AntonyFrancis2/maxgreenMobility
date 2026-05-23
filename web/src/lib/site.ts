import siteJson from "../../content/site.json";
import electricCart from "../../content/products/electric-cart.json";
import electricRickshaw from "../../content/products/electric-rickshaw.json";
import electricScooter from "../../content/products/electric-scooter.json";
import eLoader from "../../content/products/e-loader.json";

export type ThemePresetId = "green" | "blue" | "teal" | "purple" | "greenSubtle" | "orangeSubtle";

export type CardAlign = "start" | "center" | "end";

export type SiteConfig = {
  brand: {
    name: string;
    logoText: string;
  };
  nav: { label: string; href: string }[];
  topRight: { phoneLabel: string; phoneValue: string };
  footer: {
    about: string;
    quickLinks: { label: string; href: string }[];
    contact: { label: string; value: string; href?: string }[];
    officeAddress: string[];
    copyright: string;
  };
  home: HomeContent;
  about: AboutContent;
  contact: ContactContent;
  theme: {
    activePreset: ThemePresetId;
    presets: Record<
      ThemePresetId,
      {
        label: string;
        tokens: {
          brand: string;
          brand2: string;
          accent: string;
          background: string;
          surface: string;
          foreground: string;
          muted: string;
          border: string;
        };
      }
    >;
  };
};

export type HomeContent = {
  hero: {
    /** Full-width hero photo behind headline (optional; omit for solid brand color only). */
    backgroundImage?: string;
    headline: string;
    subheadline: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  products: {
    title: string;
    subtitle: string;
    items: { label: string; href: string }[];
  };
  whyChoose: {
    title: string;
    items: { title: string; subtitle: string; icon?: string }[];
  };
  trustedBy: { title: string; items: string[] };
  industries: { title: string; items: string[] };
  savings: {
    title: string;
    items: { title: string; subtitle: string; value: string; note: string }[];
  };
  faq: { title: string; items: { q: string; a: string }[] };
  getInTouch: { title: string; subtitle: string };
};

export type AboutContent = {
  hero: { title: string; subtitle: string };
  mission: { title: string; body: string; bullets: string[] };
  vision: { title: string; body: string; bullets: string[] };
  stats: { value: string; label: string }[];
  leadership: {
    name: string;
    title: string;
    quoteTitle: string;
    message: string[];
    image: string;
    linkedIn?: string;
  };
  values: {
    title: string;
    items: { title: string; subtitle: string }[];
  };
};

export type ContactContent = {
  hero: { title: string; subtitle: string };
  cards: { title: string; lines: string[] }[];
  locations: {
    title: string;
    items: { title: string; lines: string[]; email: string; phone: string }[];
  };
  form: { title: string; subtitle: string };
  otherWays: {
    title: string;
    items: { title: string; subtitle: string; actionLabel: string; href: string }[];
  };
};

export type Product = {
  id: string;
  name: string;
  tagline: string;
  media: {
    mainImage: string;
    demoVideo: { kind: "youtube" | "file"; url: string };
    views: { id: string; label: string; image: string }[];
  };
  specs: { label: string; value: string }[];
  features: string[];
  kpis: { label: string; value: string; subLabel?: string; tone: "brand" | "blue" | "purple" | "orange" }[];
  cta: { title: string; subtitle: string; primary: string; secondary: string };
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  body: string; // HTML content from rich text editor
  author: string;
  coverImage: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
};

const products: Product[] = [electricRickshaw, electricCart, electricScooter, eLoader] as Product[];

export function getSite(): SiteConfig {
  return siteJson as SiteConfig;
}

export function getProducts(): Product[] {
  return products;
}

export function getProductById(productId: string): Product | undefined {
  return products.find((p) => p.id === productId);
}

