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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-slate">
            SafeRestore Concierge
          </Link>
          <nav className="flex items-center gap-6">
            <NavLink to="/" className={navLinkClass}>
              Overview
            </NavLink>
            <NavLink to="/recovery" className={navLinkClass}>
              Recovery Flow
            </NavLink>
            <NavLink to="/forensic" className={navLinkClass}>
              Forensic
            </NavLink>
            <NavLink to="/trust" className={navLinkClass}>
              Trust
            </NavLink>
            <NavLink to="/pricing" className={navLinkClass}>
              Pricing
            </NavLink>
            <NavLink to="/privacy" className={navLinkClass}>
              Privacy
            </NavLink>
            <NavLink to="/terms" className={navLinkClass}>
              Terms
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
      <footer className="border-t border-sky bg-white/80">
        <div className="mx-auto max-w-5xl space-y-2 px-6 py-6 text-xs text-slate-500">
          Your data. Your control. Official paths only.
          <div>
            <Link to="/forensic" className="font-semibold text-slate-500 underline">
              Forensic
            </Link>
            <span className="px-2 text-slate-400">•</span>
            <Link to="/trust" className="font-semibold text-slate-500 underline">
              Trust Center
            </Link>
            <span className="px-2 text-slate-400">•</span>
            <Link to="/privacy" className="font-semibold text-slate-500 underline">
              Privacy Policy
            </Link>
            <span className="px-2 text-slate-400">•</span>
            <Link to="/terms" className="font-semibold text-slate-500 underline">
              Terms
            </Link>
            <span className="px-2 text-slate-400">•</span>
            <Link to="/support" className="font-semibold text-slate-500 underline">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
