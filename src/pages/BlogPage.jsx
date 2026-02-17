import { Link } from "react-router-dom";
import { blogPosts } from "../content/blogPosts.js";

export default function BlogPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">SafeRestore Blog</h1>
        <p className="text-base leading-relaxed text-slate-600">
          Practical guidance for forensic recovery, evidence handling, and legal-ready operations.
        </p>
      </div>

      <div className="grid gap-6">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                {post.category}
              </span>
              <span>{post.date}</span>
            </div>
            <h2 className="text-xl font-semibold text-slate">{post.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
            <Link
              to={`/blog/${post.slug}`}
              className="mt-4 inline-flex text-sm font-semibold text-ocean underline"
            >
              Read article
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
