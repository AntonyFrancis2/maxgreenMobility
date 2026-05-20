import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getBlogPostsRuntime } from "@/lib/runtimeContent";
import { BlogClient } from "@/app/blog/BlogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Maxgreen Mobility",
  description:
    "Explore insights on electric vehicles, sustainable mobility, industry trends, and cost-saving tips from Maxgreen Mobility.",
  keywords: [
    "Maxgreen blog",
    "electric vehicle blog",
    "EV India",
    "sustainable mobility",
    "industrial EV",
    "electric trolley blog",
  ],
  openGraph: {
    title: "Blog | Maxgreen Mobility",
    description:
      "Explore insights on electric vehicles, sustainable mobility, and industry trends from Maxgreen Mobility.",
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getBlogPostsRuntime("published");

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand py-14 text-white">
        <Container className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Blog
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/85">
            Insights, updates, and stories from the world of sustainable
            electric mobility.
          </p>
        </Container>
      </section>

      {/* Posts Grid */}
      <section className="py-12">
        <Container>
          <BlogClient posts={posts} />
        </Container>
      </section>
    </div>
  );
}
