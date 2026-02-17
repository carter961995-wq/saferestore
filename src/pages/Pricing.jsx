import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PLAN_LABELS, getCurrentPlan, setCurrentPlan } from "../lib/planAccess.js";

const plans = [
  {
    id: "starter",
    title: "Starter Recovery",
    price: "$39 one-time",
    description: "Guided recovery for single incidents.",
    bullets: [
      "Structured intake and risk triage",
      "Official-path recovery guidance",
      "Basic concierge support",
      "Single case summary export",
    ],
    button: "Choose Starter",
  },
  {
    id: "advanced",
    title: "Advanced Recovery",
    price: "$79 one-time",
    description: "For complex or high-priority incidents.",
    bullets: [
      "Everything in Starter Recovery",
      "Priority concierge response lane",
      "Advanced scan and workflow guidance",
      "Forensic-friendly evidence packaging",
    ],
    button: "Choose Advanced",
    featured: true,
  },
  {
    id: "pro",
    title: "Pro Subscription",
    price: "$12 / month",
    description: "Ongoing readiness for teams and power users.",
    bullets: [
      "Unlimited guided recovery plans",
      "Continuous backup readiness checks",
      "Policy-aware autonomous guidance",
      "Ongoing case tracking and history",
    ],
    button: "Choose Pro",
  },
];

const compareRows = [
  {
    label: "Official-path recovery guidance",
    starter: "Yes",
    advanced: "Yes",
    pro: "Yes",
  },
  {
    label: "Advanced scan workflows",
    starter: "No",
    advanced: "Yes",
    pro: "Yes",
  },
  {
    label: "Forensic evidence package support",
    starter: "No",
    advanced: "Yes",
    pro: "Yes",
  },
  {
    label: "Ongoing readiness checks",
    starter: "No",
    advanced: "No",
    pro: "Yes",
  },
  {
    label: "Priority support lane",
    starter: "No",
    advanced: "Yes",
    pro: "Yes",
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(getCurrentPlan());
  const activePlanLabel = useMemo(() => PLAN_LABELS[selectedPlan], [selectedPlan]);

  const primaryButton =
    "rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean/40";

  const handleChoosePlan = (planId) => {
    setCurrentPlan(planId);
    setSelectedPlan(planId);
    navigate("/forensic");
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Pricing</h1>
        <p className="text-base leading-relaxed text-slate-600">
          Choose the plan that matches your recovery complexity. All plans stay
          on official, authorized recovery paths.
        </p>
        <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Active plan: {activePlanLabel}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`flex h-full flex-col rounded-2xl border p-6 shadow-sm ${
              plan.featured
                ? "border-ocean bg-ocean/5"
                : "border-slate-200 bg-white"
            }`}
          >
            {plan.featured ? (
              <span className="mb-3 inline-flex w-fit rounded-full bg-ocean/10 px-3 py-1 text-xs font-semibold text-ocean">
                Most Popular
              </span>
            ) : null}
            <h2 className="text-base font-semibold text-slate">{plan.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
            <p className="mt-3 text-2xl font-semibold text-slate">{plan.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="list-disc pl-4">
                  {bullet}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleChoosePlan(plan.id)}
              className={`mt-6 inline-flex items-center justify-center ${primaryButton}`}
            >
              {plan.button}
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Plan Comparison</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-slate">
                <th className="py-2 pr-4">Feature</th>
                <th className="py-2 pr-4">Starter</th>
                <th className="py-2 pr-4">Advanced</th>
                <th className="py-2">Pro</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate">{row.label}</td>
                  <td className="py-2 pr-4">{row.starter}</td>
                  <td className="py-2 pr-4">{row.advanced}</td>
                  <td className="py-2">{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate">Need enterprise pricing?</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          If you need multi-seat governance, compliance reporting workflows, or
          procurement support, contact us for an enterprise quote.
        </p>
        <Link to="/support" className="inline-flex text-sm font-semibold text-ocean underline">
          Contact sales and support
        </Link>
      </div>
    </section>
  );
}
