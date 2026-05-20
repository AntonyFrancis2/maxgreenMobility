"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/site";

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

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const tags = useMemo(() => {
    const allTags = posts.flatMap((p) => p.tags || []);
    return Array.from(new Set(allTags)).filter(Boolean);
  }, [posts]);

  // Tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      post.tags?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Filter by tag
      if (selectedTag && !post.tags?.includes(selectedTag)) {
        return false;
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title?.toLowerCase().includes(query);
        const matchesExcerpt = post.excerpt?.toLowerCase().includes(query);
        const matchesBody = post.body?.toLowerCase().includes(query);
        const matchesAuthor = post.author?.toLowerCase().includes(query);
        const matchesTags = post.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesExcerpt || matchesBody || matchesAuthor || matchesTags;
      }
      return true;
    });
  }, [posts, searchQuery, selectedTag]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedTag(null);
  };

  return (
    <div>
      {/* Search & Tag Filter Bar */}
      <div className="mb-10 space-y-6">
        {/* Search Input Row */}
        <div className="relative mx-auto max-w-xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-muted">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search articles by title, tags, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface pl-11 pr-10 py-3.5 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Tag Filters Row */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-b border-border/50 py-4">
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedTag === null
                  ? "bg-brand text-white shadow-sm ring-1 ring-brand"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface/50"
              }`}
            >
              All Posts ({posts.length})
            </button>
            {tags.map((tag) => {
              const count = tagCounts[tag] || 0;
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isActive ? null : tag)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-brand text-white shadow-sm ring-1 ring-brand"
                      : "bg-surface border border-border text-muted hover:text-foreground hover:bg-surface/50"
                  }`}
                >
                  {tag} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Count Banner */}
      {(searchQuery || selectedTag) && (
        <div className="mb-6 flex items-center justify-between text-sm text-muted">
          <div>
            Found <span className="font-semibold text-foreground">{filteredPosts.length}</span>{" "}
            {filteredPosts.length === 1 ? "article" : "articles"}{" "}
            {selectedTag && (
              <>
                in <span className="font-semibold text-brand">#{selectedTag}</span>
              </>
            )}
            {searchQuery && (
              <>
                {" "}
                matching &ldquo;<span className="font-semibold text-foreground">{searchQuery}</span>&rdquo;
              </>
            )}
          </div>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-brand hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center rounded-[var(--radius-lg)] border border-dashed border-border bg-surface/30">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl text-brand">
            🔍
          </div>
          <div className="mt-4 text-lg font-extrabold">No articles found</div>
          <div className="mt-1 text-sm text-muted">
            Try adjusting your search terms or selecting another category.
          </div>
          <button
            onClick={handleReset}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Cover Image */}
              {post.coverImage ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand/5">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-brand/10 to-accent/10">
                  <span className="text-4xl">📄</span>
                </div>
              )}

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                {/* Tags */}
                {post.tags?.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-base font-extrabold leading-snug tracking-tight text-foreground group-hover:text-brand transition-colors duration-200">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="mt-2 flex-1 text-sm text-muted line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <div className="text-xs text-muted">
                    <span className="font-semibold text-foreground/70">
                      {post.author}
                    </span>{" "}
                    · {formatDate(post.publishedAt)}
                  </div>
                  <div className="text-xs text-muted">{readingTime(post.body)}</div>
                </div>

                {/* Read more */}
                <div className="mt-3 text-xs font-bold text-brand opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  Read article →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
