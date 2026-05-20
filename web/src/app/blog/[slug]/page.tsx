import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { BlogContent } from "@/components/BlogContent";
import { getBlogPostRuntime, getBlogPostsRuntime } from "@/lib/runtimeContent";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function readingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

interface HeadingItem {
  id: string;
  text: string;
}

function extractHeadings(html: string): HeadingItem[] {
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/g;
  const headings: HeadingItem[] = [];
  let match;
  while ((match = h2Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, "");
    const id = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text });
  }
  return headings;
}

function injectHeadingIds(html: string): string {
  return html.replace(/<h2([^>]*)>(.*?)<\/h2>/g, (match, attrs, text) => {
    if (attrs.includes("id=")) return match;
    const cleanText = text.replace(/<[^>]*>/g, "");
    const id = cleanText
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h2${attrs} id="${id}">${text}</h2>`;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostRuntime(slug);
  if (!post) {
    return { title: "Post Not Found" };
  }
  return {
    title: post.seo.title || `${post.title} | Maxgreen Mobility Blog`,
    description: post.seo.description || post.excerpt,
    keywords: post.seo.keywords,
    openGraph: {
      title: post.seo.title || post.title,
      description: post.seo.description || post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostRuntime(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const allPosts = await getBlogPostsRuntime();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug && p.status === "published")
    .slice(0, 3);

  const headings = extractHeadings(post.body);
  const htmlWithIds = injectHeadingIds(post.body);

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.coverImage || undefined,
    keywords: post.seo.keywords.join(", "),
    publisher: {
      "@type": "Organization",
      name: "Maxgreen Mobility",
    },
  };

  return (
    <div>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero with cover image */}
      <section className="relative isolate overflow-hidden bg-brand py-20 text-white sm:py-28">
        {post.coverImage && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-brand/60 to-brand/80" />
          </div>
        )}
        <Container className="relative space-y-6 text-center">
          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm ring-1 ring-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight drop-shadow-md sm:text-5xl md:leading-[1.15]">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/80">
            <span className="font-semibold text-white">{post.author}</span>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{readingTime(post.body)}</span>
          </div>
        </Container>
      </section>

      {/* Article body */}
      <section className="py-16 bg-surface">
        <Container>
          {/* Breadcrumbs */}
          <nav className="mb-10 flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
            <span className="text-border">/</span>
            {post.tags[0] && (
              <>
                <span className="text-muted/80">{post.tags[0]}</span>
                <span className="text-border">/</span>
              </>
            )}
            <span className="text-foreground/50 truncate max-w-[240px] font-medium">{post.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Table of Contents - Left Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-28 max-h-[calc(100vh-10rem)] overflow-y-auto pr-4 border-r border-border/80">
              <nav className="space-y-4">
                <div className="text-xs font-extrabold uppercase tracking-wider text-muted/70 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" /> On this page
                </div>
                {headings.length > 0 ? (
                  <ul className="space-y-3.5 text-[13px] border-l border-border/40 pl-3">
                    {headings.map((h) => (
                      <li key={h.id}>
                        <a
                          href={`#${h.id}`}
                          className="block text-foreground/75 hover:text-brand transition-colors font-semibold leading-normal hover:underline"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[13px] text-muted italic">Overview</p>
                )}
              </nav>
            </aside>

            {/* Main Content Column */}
            <article className="col-span-1 lg:col-span-9 max-w-3xl w-full">
              {/* Back link */}
              <Link
                href="/blog"
                className="mb-8 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:opacity-80 transition-opacity"
              >
                ← Back to Blog
              </Link>

              {/* Content */}
              <BlogContent html={htmlWithIds} />

              {/* Author Bio Section */}
              <div className="mt-14 rounded-2xl border border-border/80 bg-gradient-to-br from-brand/5 via-surface to-accent/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
                <div className="h-16 w-16 shrink-0 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-2xl border border-brand/20 select-none shadow-inner">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <div className="text-[10px] font-extrabold text-brand uppercase tracking-wider">About the Author</div>
                  <div className="font-extrabold text-foreground text-lg">{post.author}</div>
                  <p className="text-sm text-muted leading-relaxed">
                    Industrial mobility expert and clean energy advocate at Maxgreen Mobility. Committed to helping warehouses, factories, and commercial campuses transition to highly efficient, zero-emission transport solutions.
                  </p>
                </div>
              </div>

              {/* Contact / Lead CTA Block */}
              <div className="mt-8 rounded-2xl bg-[#0b2a2e] p-8 text-center text-white relative overflow-hidden shadow-lg border border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--brand),transparent)] opacity-20" />
                <div className="relative space-y-4">
                  <div className="inline-flex rounded-full bg-brand/20 px-3.5 py-1 text-xs font-bold text-brand ring-1 ring-brand/35">
                    Switch to Zero-Emission Transport
                  </div>
                  <h3 className="text-xl font-extrabold sm:text-2xl tracking-tight">Want to optimize your internal logistics?</h3>
                  <p className="mx-auto max-w-xl text-sm text-white/80 leading-relaxed">
                    Discover how our electric trolleys can save you ₹28,000+ per month in fuel costs while boosting your team's material handling efficiency.
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg transition duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
                    >
                      Schedule a Free Demo
                    </Link>
                  </div>
                </div>
              </div>

              {/* Dynamic Tag list */}
              {post.seo.keywords.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs font-bold text-muted mr-1">Tags:</span>
                  {post.seo.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-surface border border-border px-3 py-1 text-[11px] font-semibold text-muted"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </article>
          </div>
        </Container>
      </section>

      {/* Related Articles Footer */}
      {relatedPosts.length > 0 && (
        <section className="bg-surface/50 border-t border-border/80 py-16">
          <Container>
            <div className="space-y-2 text-center mb-10">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Related Articles</h2>
              <p className="text-sm text-muted max-w-xl mx-auto">
                Explore more insights on electric vehicles, sustainable logistics, and material handling solutions.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white transition hover:border-brand/20 hover:shadow-md"
                >
                  {r.coverImage && (
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <Image
                        src={r.coverImage}
                        alt={r.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 90vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-grow flex-col p-5">
                    {r.tags[0] && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand mb-2 block">
                        {r.tags[0]}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-foreground line-clamp-2 group-hover:text-brand transition-colors mb-2">
                      {r.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-3 mb-4 flex-grow leading-relaxed">
                      {r.excerpt}
                    </p>
                    <div className="text-[10px] font-semibold text-muted flex items-center justify-between border-t border-border/50 pt-3 mt-auto">
                      <span>{r.author}</span>
                      <span>{formatDate(r.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
