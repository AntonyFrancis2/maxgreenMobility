interface BlogContentProps {
  html: string;
}

export function BlogContent({ html }: BlogContentProps) {
  return (
    <>
      <article
        className="blog-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        .blog-prose {
          line-height: 1.8;
          color: var(--foreground);
          font-size: 1.05rem;
        }
        .blog-prose h2 {
          font-size: 1.85rem;
          font-weight: 800;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          letter-spacing: -0.025em;
          color: var(--foreground);
          position: relative;
          padding-left: 0.875rem;
        }
        .blog-prose h2::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.25rem;
          bottom: 0.25rem;
          width: 4px;
          background: var(--brand);
          border-radius: 4px;
        }
        .blog-prose h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 2.25rem;
          margin-bottom: 0.75rem;
          color: var(--foreground);
          letter-spacing: -0.01em;
        }
        .blog-prose h4 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        .blog-prose p {
          margin-bottom: 1.5rem;
          color: var(--foreground);
          opacity: 0.9;
        }
        .blog-prose ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.5rem;
        }
        .blog-prose ul li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.65rem;
          opacity: 0.9;
        }
        .blog-prose ul li::before {
          content: "•";
          position: absolute;
          left: 0.25rem;
          color: var(--brand);
          font-weight: bold;
          font-size: 1.25rem;
          line-height: 1;
          top: -0.05rem;
        }
        .blog-prose ol {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          list-style-type: decimal;
        }
        .blog-prose ol li {
          margin-bottom: 0.65rem;
          opacity: 0.9;
        }
        .blog-prose blockquote {
          border-left: 4px solid var(--brand);
          padding: 1.25rem 1.75rem;
          margin: 2rem 0;
          background: rgba(20, 184, 166, 0.04);
          border-radius: 8px;
          font-size: 1.125rem;
          line-height: 1.7;
          color: var(--foreground);
          opacity: 0.95;
          font-style: italic;
        }
        .blog-prose blockquote p {
          margin-bottom: 0.5rem;
          opacity: 1;
        }
        .blog-prose blockquote p:last-child {
          margin-bottom: 0;
        }
        .blog-prose a {
          color: var(--brand);
          text-decoration: underline;
          text-underline-offset: 3px;
          font-weight: 500;
          transition: opacity 0.15s;
        }
        .blog-prose a:hover {
          opacity: 0.8;
        }
        .blog-prose img {
          max-width: 100%;
          border-radius: var(--radius, 16px);
          margin: 2rem 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
        }
        .blog-prose hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2.5rem 0;
        }
        .blog-prose strong {
          font-weight: 700;
          color: var(--foreground);
        }
        .blog-prose em {
          font-style: italic;
        }
        .blog-prose code {
          background: rgba(0,0,0,0.05);
          padding: 0.2rem 0.4rem;
          border-radius: 6px;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .blog-prose pre {
          background: var(--foreground);
          color: var(--background);
          padding: 1.5rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 2rem 0;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .blog-prose pre code {
          background: none;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
          color: inherit;
        }
      `}</style>
    </>
  );
}
