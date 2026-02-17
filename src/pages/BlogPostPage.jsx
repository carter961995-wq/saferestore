import { Link, useParams } from "react-router-dom";
import { blogPostMap } from "../content/blogPosts.js";

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? blogPostMap[slug] : null;

  if (!post) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate">Article not found</h1>
        <p className="text-sm text-slate-600">This blog article is unavailable.</p>
        <Link to="/blog" className="text-sm font-semibold text-ocean underline">
          Back to Blog
        </Link>
      </section>
    );
  }

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
            {post.category}
          </span>
          <span>{post.date}</span>
        </div>
        <h1 className="text-3xl font-semibold text-slate">{post.title}</h1>
        <p className="text-base leading-relaxed text-slate-600">{post.description}</p>
      </header>

      {post.sections.map((section) => (
        <section
          key={section.heading}
          className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h2 className="text-base font-semibold text-slate">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <Link to="/blog" className="inline-flex text-sm font-semibold text-ocean underline">
        Back to Blog
      </Link>
    </article>
  );
}
