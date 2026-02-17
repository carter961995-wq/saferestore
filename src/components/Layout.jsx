import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${
    isActive
      ? "text-ocean underline underline-offset-8 decoration-ocean/40"
      : "text-slate-600 hover:text-ocean"
  }`;

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-mist text-slate">
      <header className="border-b border-sky bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-slate">
            SafeRestore Concierge
          </Link>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <NavLink to="/trust" className={navLinkClass}>
              Trust Center
            </NavLink>
            <NavLink to="/terms" className={navLinkClass}>
              Terms of Service
            </NavLink>
            <NavLink to="/privacy" className={navLinkClass}>
              Privacy Policy
            </NavLink>
            <NavLink to="/forensic" className={navLinkClass}>
              Forensic Suite
            </NavLink>
            <NavLink to="/blog" className={navLinkClass}>
              Blog
            </NavLink>
            <NavLink to="/pricing" className={navLinkClass}>
              Pricing
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
      <footer className="border-t border-sky bg-white/80">
        <div className="mx-auto max-w-5xl space-y-2 px-6 py-6 text-xs text-slate-500">
          Your data. Your control. Official paths only.
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link to="/trust" className="font-semibold text-slate-500 underline">
              Trust Center
            </Link>
            <span className="text-slate-400">•</span>
            <Link to="/terms" className="font-semibold text-slate-500 underline">
              Terms of Service
            </Link>
            <span className="text-slate-400">•</span>
            <Link to="/privacy" className="font-semibold text-slate-500 underline">
              Privacy Policy
            </Link>
            <span className="text-slate-400">•</span>
            <Link to="/forensic" className="font-semibold text-slate-500 underline">
              Forensic Suite
            </Link>
            <span className="text-slate-400">•</span>
            <Link to="/blog" className="font-semibold text-slate-500 underline">
              Blog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
