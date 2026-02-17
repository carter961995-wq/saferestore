import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RecoveryFlowPage from "./pages/RecoveryFlowPage.jsx";
import ConciergeChat from "./pages/ConciergeChat.jsx";
import TrustCenter from "./pages/TrustCenter.jsx";
import Pricing from "./pages/Pricing.jsx";
import Soc2Page from "./pages/Soc2Page.jsx";
import ForensicPage from "./pages/ForensicPage.jsx";
import CaseSummary from "./pages/CaseSummary.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import { logEvent } from "./lib/analytics.js";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import Support from "./pages/Support.jsx";
import NotFound from "./pages/NotFound.jsx";

const SITE_ORIGIN = "https://saferestorehelp.com";

const pageSeo = {
  "/": {
    title: "SafeRestore Concierge",
    description:
      "Official-path data recovery guidance with privacy-first concierge support.",
  },
  "/recovery": {
    title: "Recovery Flow",
    description:
      "Follow a clear, official-path recovery plan tailored to your device and scenario.",
  },
  "/concierge": {
    title: "Concierge Chat",
    description:
      "Get live guidance for data recovery decisions and next-best actions.",
  },
  "/trust": {
    title: "Trust Center",
    description:
      "Trust and forensic handling details for legal, compliance, and investigative buyers.",
  },
  "/soc-2": {
    title: "SOC 2 Security Program",
    description:
      "Review SafeRestore's SOC 2 control program, evidence workflows, and security governance model.",
  },
  "/forensic": {
    title: "Forensic Suite",
    description:
      "Digital forensics workflow guidance for investigative and legal teams, including E01 imaging, hash verification, and chain-of-custody documentation.",
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Compare SafeRestore plans for guided recovery, advanced workflows, and enterprise readiness.",
  },
  "/case-summary": {
    title: "Case Summary",
    description:
      "Share concise, structured case details for support and operational handoff.",
  },
  "/privacy": {
    title: "Privacy Policy",
    description:
      "Read SafeRestore privacy commitments, data handling boundaries, and consent model.",
  },
  "/terms": {
    title: "Terms of Service",
    description:
      "Review the product terms, service boundaries, and usage requirements.",
  },
  "/support": {
    title: "Support",
    description:
      "Contact SafeRestore support and find official help channels.",
  },
};

function normalizePath(pathname) {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed.length === 0 ? "/" : trimmed;
}

function upsertMeta(attribute, key, content) {
  const selector = `meta[${attribute}="${key}"]`;
  const all = document.head.querySelectorAll(selector);
  all.forEach((node, index) => {
    if (index > 0) node.remove();
  });

  const existing = document.head.querySelector(selector);
  const node = existing || document.createElement("meta");
  node.setAttribute(attribute, key);
  node.setAttribute("content", content);
  if (!existing) {
    document.head.appendChild(node);
  }
}

function setCanonical(url) {
  const nodes = document.head.querySelectorAll('link[rel="canonical"]');
  nodes.forEach((node) => node.remove());
  const link = document.createElement("link");
  link.setAttribute("rel", "canonical");
  link.setAttribute("href", url);
  document.head.appendChild(link);
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    logEvent("page_view", { path: location.pathname });
  }, [location.pathname]);

  useEffect(() => {
    const pathname = normalizePath(location.pathname);
    const canonicalUrl = `${SITE_ORIGIN}${pathname === "/" ? "" : pathname}`;
    const seo = pageSeo[pathname];
    const foundPage = Boolean(seo);
    const title = seo?.title || "Page Not Found";
    const description =
      seo?.description ||
      "This page could not be found. Continue browsing SafeRestore official resources.";

    document.title = `${title} | SafeRestore`;
    setCanonical(canonicalUrl);
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", foundPage ? "index,follow" : "noindex,nofollow");
    upsertMeta("property", "og:title", `${title} | SafeRestore`);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", `${title} | SafeRestore`);
    upsertMeta("name", "twitter:description", description);
  }, [location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recovery" element={<RecoveryFlowPage />} />
        <Route path="/concierge" element={<ConciergeChat />} />
        <Route path="/trust" element={<TrustCenter />} />
        <Route path="/soc-2" element={<Soc2Page />} />
        <Route path="/forensic" element={<ForensicPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/case-summary" element={<CaseSummary />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
        <Route path="/soc2" element={<Navigate to="/soc-2" replace />} />
        <Route path="/trust-center" element={<Navigate to="/trust" replace />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
        <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
        {import.meta.env.DEV ? (
          <Route path="/events" element={<EventsPage />} />
        ) : null}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
