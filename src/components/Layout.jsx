import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition ${
    isActive ? "text-ocean" : "text-calm hover:text-ocean"
  }`;

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-mist text-slate">
      <header className="border-b border-sky bg-white/80 backdrop-blur">
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
            <NavLink to="/concierge" className={navLinkClass}>
              Concierge Chat
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
      <footer className="border-t border-sky bg-white/80">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-calm">
          Your data. Your control. Official paths only.
        </div>
      </footer>
    </div>
  );
}
