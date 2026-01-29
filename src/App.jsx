import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import RecoveryFlowPage from "./pages/RecoveryFlowPage.jsx";
import ConciergeChat from "./pages/ConciergeChat.jsx";
import TrustCenter from "./pages/TrustCenter.jsx";
import Pricing from "./pages/Pricing.jsx";
import CaseSummary from "./pages/CaseSummary.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/recovery" element={<RecoveryFlowPage />} />
        <Route path="/concierge" element={<ConciergeChat />} />
        <Route path="/trust" element={<TrustCenter />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/case-summary" element={<CaseSummary />} />
      </Routes>
    </Layout>
  );
}
