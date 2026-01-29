import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RecoveryFlowPage from "./pages/RecoveryFlowPage.jsx";
import ConciergeChat from "./pages/ConciergeChat.jsx";
import TrustCenter from "./pages/TrustCenter.jsx";
import Pricing from "./pages/Pricing.jsx";
import CaseSummary from "./pages/CaseSummary.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import { logEvent } from "./lib/analytics.js";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    logEvent("page_view", { path: location.pathname });
  }, [location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recovery" element={<RecoveryFlowPage />} />
        <Route path="/concierge" element={<ConciergeChat />} />
        <Route path="/trust" element={<TrustCenter />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/case-summary" element={<CaseSummary />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        {import.meta.env.DEV ? (
          <Route path="/events" element={<EventsPage />} />
        ) : null}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
